
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import PaypalLogo from "./PayPalLogo";

interface PaymentMethodsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PaymentMethods = ({ loading, setLoading }: PaymentMethodsProps) => {
  const [error, setError] = useState<string | null>(null);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  
  const { toast } = useToast();
  const { selectedPlan, calculateTotal } = useCart();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Function to load PayPal script
  const loadPayPalScript = () => {
    // If script is already loaded or loading, don't load it again
    if (scriptLoaded.current) return;
    
    // Remove any existing PayPal script
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }
    
    console.log("Loading PayPal script...");
    setError(null);
    
    // Create new script element
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&currency=USD";
    script.async = true;
    
    script.onload = () => {
      console.log("PayPal script loaded successfully");
      scriptLoaded.current = true;
      renderPayPalButtons();
    };
    
    script.onerror = (e) => {
      console.error("Error loading PayPal script:", e);
      setError("Failed to load payment provider");
      setLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to load payment provider. Please try again later.",
        variant: "destructive",
      });
    };
    
    // Append script to document body
    document.body.appendChild(script);
  };
  
  // Function to render PayPal buttons
  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalContainerRef.current || !selectedPlan) {
      console.error("Cannot render PayPal buttons:", {
        paypal: !!window.paypal,
        container: !!paypalContainerRef.current,
        plan: !!selectedPlan
      });
      return;
    }
    
    try {
      // Clear container before rendering
      paypalContainerRef.current.innerHTML = '';
      
      const amount = calculateTotal(selectedPlan.price).toFixed(2);
      console.log("Rendering PayPal buttons with amount:", amount);
      
      window.paypal.Buttons({
        style: {
          shape: "rect",
          layout: "vertical",
          color: "gold",
        },
        // Create order when button is clicked
        createOrder: async () => {
          try {
            setLoading(true);
            setError(null);
            
            // Check if user is logged in
            if (!user) {
              toast({
                title: "Authentication required",
                description: "You need to be logged in to make a purchase.",
                variant: "destructive",
              });
              
              const returnPath = sessionStorage.getItem('cartReturnPath') || '/cart';
              navigate('/auth', { state: { returnTo: returnPath } });
              return null;
            }
            
            console.log("Creating PayPal order with params:", {
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              amount: amount
            });
            
            // Call Supabase function to create order
            const response = await supabase.functions.invoke('create-paypal-order', {
              body: {
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                amount: amount
              }
            });
            
            console.log("Create order response:", response);
            
            if (response.error) {
              throw new Error(response.error.message || 'Failed to create PayPal order');
            }
            
            if (!response.data || !response.data.id) {
              throw new Error('Invalid response from payment service');
            }
            
            return response.data.id;
          } catch (error: any) {
            console.error('Error creating PayPal order:', error);
            setError(error.message || "Payment initialization failed");
            toast({
              title: "Payment Error",
              description: error.message || "Could not start the payment process. Please try again.",
              variant: "destructive",
            });
            setLoading(false);
            return null;
          }
        },
        // Handle approval
        onApprove: async (data: any, actions: any) => {
          try {
            setLoading(true);
            setError(null);
            
            // Get the order ID from PayPal
            const { orderID } = data;
            console.log("Order approved:", orderID);
            
            // Call Supabase function to capture payment
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
            
            // Payment successful
            toast({
              title: "Payment successful!",
              description: `Your ${selectedPlan.name} plan is now active.`,
            });
            
            // Refresh user profile and navigate
            await refreshProfile();
            navigate('/profile');
            return true;
          } catch (error: any) {
            console.error('Error capturing PayPal payment:', error);
            setError(error.message || "Payment failed");
            toast({
              title: "Payment failed",
              description: error.message || "There was an issue processing your payment. Please try again.",
              variant: "destructive",
            });
            
            if (error.message?.includes('INSTRUMENT_DECLINED') && actions?.restart) {
              toast({
                title: "Payment method declined",
                description: "Your payment method was declined. Please try a different payment method.",
                variant: "destructive",
              });
              return actions.restart();
            }
            
            return false;
          } finally {
            setLoading(false);
          }
        },
        // Handle cancel
        onCancel: () => {
          console.log("Payment cancelled by user");
          toast({
            title: "Payment cancelled",
            description: "You've cancelled the payment process. No payment was made.",
          });
          setLoading(false);
        },
        // Handle errors
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setError("Payment processing error");
          toast({
            title: "Payment error",
            description: "An error occurred during the payment process. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
        }
      }).render(paypalContainerRef.current);
      
    } catch (error: any) {
      console.error("Error rendering PayPal buttons:", error);
      setError("Failed to initialize payment options");
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment options. Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  
  // Effect to initialize PayPal when component mounts or plan changes
  useEffect(() => {
    if (!selectedPlan) return;
    
    console.log("PaymentMethods component mounted or plan changed:", selectedPlan);
    
    // Load PayPal script
    loadPayPalScript();
    
    // Cleanup
    return () => {
      console.log("PaymentMethods component unmounting");
      scriptLoaded.current = false;
    };
  }, [selectedPlan]);

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 pb-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 mb-4">
            <p>Error: {error}</p>
            <p className="mt-1 text-xs">Please try again or contact support for assistance.</p>
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Complete your purchase</h3>
          <p className="text-gray-500 text-sm">
            Secure payment for {selectedPlan?.name} plan: ${selectedPlan ? calculateTotal(selectedPlan.price).toFixed(2) : "0.00"}/month
          </p>
          
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <PaypalLogo />
              </div>
              
              <div 
                ref={paypalContainerRef}
                className="w-full min-h-[150px]"
              ></div>
              
              <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-4">
                <Lock className="h-4 w-4 mr-1 text-gray-400" />
                Secure payment processed by PayPal
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
