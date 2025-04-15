
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
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  
  const { toast } = useToast();
  const { selectedPlan, calculateTotal } = useCart();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedPlan) return;

    const loadPayPalScript = () => {
      if (document.getElementById('paypal-script')) {
        setPaypalScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'paypal-script';
      script.src = `https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&buyer-country=US&currency=USD&components=buttons&enable-funding=card&disable-funding=venmo,paylater`;
      script.setAttribute('data-sdk-integration-source', 'developer-studio');
      
      script.onload = () => {
        console.log("PayPal script loaded successfully");
        setPaypalScriptLoaded(true);
      };

      script.onerror = (error) => {
        console.error("Failed to load PayPal script:", error);
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
    if (paypalScriptLoaded && selectedPlan) {
      renderPayPalButtons();
    }
  }, [paypalScriptLoaded, paymentMethod, selectedPlan]);

  const renderPayPalButtons = () => {
    if (!selectedPlan || !window.paypal) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    if (paypalButtonContainer) paypalButtonContainer.innerHTML = '';

    try {
      const createOrderHandler = async () => {
        try {
          setLoading(true);
          
          if (!user) {
            toast({
              title: "Authentication required",
              description: "You need to be logged in to make a purchase.",
              variant: "destructive",
            });
            
            // Save current location to redirect back after login
            const returnPath = sessionStorage.getItem('cartReturnPath');
            navigate('/auth', { state: { returnTo: returnPath } });
            return "";
          }
          
          const amount = calculateTotal(selectedPlan.price);
          
          const response = await supabase.functions.invoke('create-paypal-order', {
            body: {
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              amount: amount.toFixed(2)
            }
          });
          
          console.log("Create order response:", response);
          
          if (!response.data || !response.data.id) {
            throw new Error('Failed to create PayPal order');
          }
          
          return response.data.id;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          toast({
            title: "Payment initialization failed",
            description: "Could not start the payment process. Please try again.",
            variant: "destructive",
          });
          return "";
        } finally {
          setLoading(false);
        }
      };

      const onApproveHandler = async (data: any) => {
        try {
          setLoading(true);
          
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
          
          if (!response.data || !response.data.success) {
            throw new Error('Failed to capture PayPal payment');
          }
          
          toast({
            title: "Payment successful!",
            description: `Your ${selectedPlan.name} plan is now active.`,
          });
          
          await refreshProfile();
          navigate('/profile');
        } catch (error) {
          console.error('Error capturing PayPal payment:', error);
          toast({
            title: "Payment failed",
            description: "There was an issue processing your payment. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      if (paypalButtonContainer && paymentMethod === "paypal") {
        window.paypal.Buttons({
          style: {
            shape: "rect",
            layout: "vertical",
            color: "blue",
            label: "pay"
          },
          createOrder: createOrderHandler,
          onApprove: onApproveHandler,
          onCancel: () => {
            toast({
              title: "Payment cancelled",
              description: "You've cancelled the payment process. No payment was made.",
            });
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            toast({
              title: "Payment error",
              description: "An error occurred during the payment process. Please try again.",
              variant: "destructive",
            });
          }
        }).render('#paypal-button-container');
      }
    } catch (error) {
      console.error("Error rendering PayPal buttons:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment options. Please try again later.",
        variant: "destructive",
      });
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
    
    // In a real implementation, this would validate and process the card payment
    // For now, we'll just simulate a payment process
    
    try {
      setLoading(true);
      
      // Validate card info
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast({
          title: "Missing information",
          description: "Please fill in all card details.",
          variant: "destructive",
        });
        return;
      }
      
      // Simple validation
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid 16-digit card number.",
          variant: "destructive",
        });
        return;
      }
      
      // This would integrate with a real payment processor in production
      // For demo purposes, we'll proceed with a mock payment process
      
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment successful!",
        description: `Your ${selectedPlan?.name} plan is now active.`,
      });
      
      // Update user profile with the new plan information
      await refreshProfile();
      navigate('/profile');
      
    } catch (error) {
      console.error('Error processing card payment:', error);
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
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
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethods;
