
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Lock } from "lucide-react";
import PaypalLogo from "./PayPalLogo";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PaymentMethodsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PaymentMethods = ({ loading, setLoading }: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalButtonsRendered, setPaypalButtonsRendered] = useState(false);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  
  const { toast } = useToast();
  const { selectedPlan, calculateTotal } = useCart();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Clear any errors when switching payment methods
  useEffect(() => {
    setPaypalError(null);
  }, [paymentMethod]);

  // Function to manually redirect to PayPal checkout
  const redirectToPayPal = async (orderId) => {
    // Find the approval URL from the links array
    const approvalLink = `https://www.paypal.com/checkoutnow?token=${orderId}`;
    window.open(approvalLink, '_blank');
  };

  useEffect(() => {
    if (!selectedPlan) return;

    const loadPayPalScript = () => {
      if (document.getElementById('paypal-script')) {
        setPaypalScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'paypal-script';
      // Make sure to use the sandbox URL for testing
      script.src = `https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&currency=USD&intent=capture`;
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      
      script.onload = () => {
        console.log("PayPal script loaded successfully");
        setPaypalScriptLoaded(true);
      };

      script.onerror = (error) => {
        console.error("Failed to load PayPal script:", error);
        setPaypalError("Failed to load payment provider");
        toast({
          title: "Payment Error",
          description: "Failed to load payment provider. Please try again later.",
          variant: "destructive",
        });
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, [selectedPlan, toast]);

  useEffect(() => {
    // Clear out the PayPal button container and re-render buttons when needed
    if (paymentMethod === "paypal") {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
          setPaypalButtonsRendered(false);
        }
      }, 100);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (paypalScriptLoaded && selectedPlan && paymentMethod === "paypal" && !paypalButtonsRendered) {
      renderPayPalButtons();
    }
  }, [paypalScriptLoaded, paymentMethod, selectedPlan, paypalButtonsRendered]);

  const renderPayPalButtons = () => {
    if (!selectedPlan || !window.paypal) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    if (!paypalButtonContainer) {
      console.error("PayPal button container not found");
      return;
    }
    
    // Clear the container before rendering
    paypalButtonContainer.innerHTML = '';

    try {
      const createOrderHandler = async () => {
        try {
          setLoading(true);
          setPaypalError(null);
          
          if (!user) {
            toast({
              title: "Authentication required",
              description: "You need to be logged in to make a purchase.",
              variant: "destructive",
            });
            
            // Save current location to redirect back after login
            const returnPath = sessionStorage.getItem('cartReturnPath');
            navigate('/auth', { state: { returnTo: returnPath } });
            return null;
          }
          
          const amount = calculateTotal(selectedPlan.price);
          
          console.log("Creating PayPal order with params:", {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            amount: amount.toFixed(2)
          });
          
          const response = await supabase.functions.invoke('create-paypal-order', {
            body: {
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              amount: amount.toFixed(2)
            }
          });
          
          console.log("Create order response:", response);
          
          if (response.error) {
            throw new Error(response.error.message || 'Failed to create PayPal order');
          }
          
          if (!response.data || !response.data.id) {
            throw new Error('Invalid response from payment service');
          }
          
          // Store the order ID in localStorage for potential manual redirect
          localStorage.setItem('pendingPayPalOrderId', response.data.id);
          
          // Return the order ID for PayPal to handle
          return response.data.id;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          setPaypalError(error.message || "Payment initialization failed");
          toast({
            title: "Payment initialization failed",
            description: error.message || "Could not start the payment process. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return null;
        }
      };

      const onApproveHandler = async (data, actions) => {
        try {
          setLoading(true);
          setPaypalError(null);
          
          const { orderID } = data;
          console.log("Order approved:", orderID);
          
          const response = await supabase.functions.invoke('capture-paypal-order', {
            body: {
              orderId: orderID,
              userId: user?.id,
              planId: selectedPlan.id
            }
          });
          
          console.log("Capture response:", response);
          
          if (response.error) {
            throw new Error(response.error.message || 'Failed to capture PayPal payment');
          }
          
          if (!response.data || !response.data.success) {
            throw new Error('Invalid response from payment service');
          }
          
          // Clear the pending order ID
          localStorage.removeItem('pendingPayPalOrderId');
          
          toast({
            title: "Payment successful!",
            description: `Your ${selectedPlan.name} plan is now active.`,
          });
          
          await refreshProfile();
          navigate('/profile');
          return true;
        } catch (error) {
          console.error('Error capturing PayPal payment:', error);
          setPaypalError(error.message || "Payment failed");
          toast({
            title: "Payment failed",
            description: error.message || "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
          return false;
        } finally {
          setLoading(false);
        }
      };

      if (paypalButtonContainer && paymentMethod === "paypal") {
        try {
          window.paypal.Buttons({
            style: {
              shape: "rect",
              layout: "vertical"
            },
            createOrder: createOrderHandler,
            onApprove: onApproveHandler,
            onCancel: () => {
              toast({
                title: "Payment cancelled",
                description: "You've cancelled the payment process. No payment was made.",
              });
              setLoading(false);
            },
            onError: (err) => {
              console.error('PayPal error:', err);
              setPaypalError("Payment processing error");
              toast({
                title: "Payment error",
                description: "An error occurred during the payment process. Please try again.",
                variant: "destructive",
              });
              setLoading(false);
            }
          }).render('#paypal-button-container');
          
          setPaypalButtonsRendered(true);
        } catch (renderError) {
          console.error("Error rendering PayPal buttons:", renderError);
          setPaypalError("Failed to initialize payment options");
          toast({
            title: "Payment Error",
            description: "Failed to initialize payment options. Please try again later.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error setting up PayPal buttons:", error);
      setPaypalError("Failed to initialize payment");
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment options. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  // Function to handle manual PayPal redirect when buttons fail
  const handleManualPayPalRedirect = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You need to be logged in to make a purchase.",
          variant: "destructive",
        });
        
        // Save current location to redirect back after login
        const returnPath = sessionStorage.getItem('cartReturnPath');
        navigate('/auth', { state: { returnTo: returnPath } });
        return;
      }
      
      const amount = calculateTotal(selectedPlan.price);
      
      // Create a new PayPal order
      const response = await supabase.functions.invoke('create-paypal-order', {
        body: {
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: amount.toFixed(2)
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create PayPal order');
      }
      
      if (!response.data || !response.data.id) {
        throw new Error('Invalid response from payment service');
      }
      
      const orderId = response.data.id;
      
      // Find the approval URL
      const approvalLink = `https://www.paypal.com/checkoutnow?token=${orderId}`;
      
      // Open in new tab
      window.open(approvalLink, '_blank');
      
      toast({
        title: "PayPal checkout opened",
        description: "Complete your payment in the PayPal window that opened. After payment, return here to confirm.",
      });
      
    } catch (error) {
      console.error('Error with manual PayPal redirect:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start PayPal checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to make a purchase.",
        variant: "destructive",
      });
      
      // Save current location to redirect back after login
      const returnPath = sessionStorage.getItem('cartReturnPath');
      navigate('/auth', { state: { returnTo: returnPath } });
      return;
    }
    
    try {
      setLoading(true);
      
      // Validate card info
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast({
          title: "Missing information",
          description: "Please fill in all card details.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Simple validation
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid 16-digit card number.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (cardCvc.length < 3) {
        toast({
          title: "Invalid CVC",
          description: "Please enter a valid CVC code.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      if (cardExpiry.length < 5 || !cardExpiry.includes('/')) {
        toast({
          title: "Invalid expiry date",
          description: "Please enter a valid expiry date (MM/YY).",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      toast({
        title: "Demo Mode",
        description: "This is a demo implementation. In a real application, you would be redirected to a secure payment gateway. We'll simulate a successful payment.",
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Calculate plan duration based on plan type
      let planDuration = 30; // default 30 days for most plans
      if (selectedPlan?.id === 'premium') {
        planDuration = 30; // 30 days for premium
      } else if (selectedPlan?.id === 'unlimited') {
        planDuration = 365; // 1 year for unlimited
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + planDuration);
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          plan: selectedPlan?.id,
          plan_start_date: now.toISOString(),
          plan_end_date: endDate.toISOString(),
        })
        .eq('id', user.id);
        
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      toast({
        title: "Demo Payment successful!",
        description: `This is a simulated successful payment. Your ${selectedPlan?.name} plan is now active.`,
      });
      
      // Update user profile with the new plan information
      await refreshProfile();
      navigate('/profile');
      
    } catch (error) {
      console.error('Error processing card payment:', error);
      toast({
        title: "Payment failed",
        description: error.message || "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return v;
  };

  return (
    <Tabs defaultValue="paypal" onValueChange={(value) => setPaymentMethod(value as "paypal" | "card")}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="paypal" className="h-12 flex items-center justify-center">
          <div className="flex items-center justify-center h-8">
            <PaypalLogo />
          </div>
        </TabsTrigger>
        <TabsTrigger value="card" className="h-12 flex items-center justify-center">
          <div className="flex items-center justify-center">
            <CreditCard className="h-5 w-5 mr-2" />
            <span>Credit/Debit Card</span>
          </div>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="paypal" className="space-y-4">
        {paypalError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 mb-4">
            <p>Error: {paypalError}</p>
            <p className="mt-1 text-xs">Please try again or use a different payment method.</p>
          </div>
        )}
        
        <div id="paypal-button-container" className="w-full mt-4"></div>
        
        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-600">Processing payment...</p>
          </div>
        )}
        
        {!paypalScriptLoaded && !loading && (
          <div className="text-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-600">Loading payment options...</p>
          </div>  
        )}
        
        {/* Alternative manual PayPal button for when Smart Buttons fail */}
        {paypalScriptLoaded && !loading && (
          <div className="mt-4">
            <Button 
              type="button" 
              onClick={handleManualPayPalRedirect}
              className="w-full bg-[#0070ba] hover:bg-[#003087] text-white py-3"
            >
              Checkout with PayPal
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              If the PayPal buttons above are not working, use this button instead
            </p>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-4">
          <Lock className="h-4 w-4 mr-1 text-gray-400" />
          Secure payment powered by PayPal
        </div>
      </TabsContent>
      
      <TabsContent value="card" className="space-y-4">
        <form onSubmit={handleCardSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input 
                id="cardName" 
                placeholder="John Smith" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1"
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input 
                id="cardNumber" 
                placeholder="1234 5678 9012 3456" 
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="mt-1"
                disabled={loading}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input 
                  id="cardExpiry" 
                  placeholder="MM/YY" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  className="mt-1"
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cardCvc">CVC</Label>
                <Input 
                  id="cardCvc" 
                  placeholder="123" 
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                  className="mt-1"
                  disabled={loading}
                  required
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4 h-12 text-base" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </div>
            ) : (
              <>Pay ${selectedPlan && calculateTotal(selectedPlan.price).toFixed(2)}</>
            )}
          </Button>
        </form>
        
        <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-2">
          <Lock className="h-4 w-4 mr-1 text-gray-400" />
          Your card information is secure and encrypted
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800 mt-4">
          <p className="font-medium">Demo Mode</p>
          <p className="mt-1">This is a demo implementation. In production, you would integrate with a real payment processor.</p>
          <p className="mt-1">The credit card payment is simulated and will always succeed without actual payment processing.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethods;
