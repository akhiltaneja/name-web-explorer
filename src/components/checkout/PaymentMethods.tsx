
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PaymentMethodsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PaymentMethods = ({ loading, setLoading }: PaymentMethodsProps) => {
  const [error, setError] = useState<string | null>(null);
  const [paypalInitialized, setPaypalInitialized] = useState(false);
  const [paypalButtonsRendered, setPaypalButtonsRendered] = useState(false);
  
  const { toast } = useToast();
  const { selectedPlan, calculateTotal } = useCart();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Clean up any previous PayPal script on component mount or plan change
  useEffect(() => {
    const cleanupPayPal = () => {
      // Remove any existing PayPal script
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      // Clear the PayPal button container
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
      
      setPaypalInitialized(false);
      setPaypalButtonsRendered(false);
    };
    
    cleanupPayPal();
    
    // Only load PayPal if we have a selected plan
    if (selectedPlan) {
      loadPayPalScript();
    }
    
    return () => {
      cleanupPayPal();
    };
  }, [selectedPlan]);

  const loadPayPalScript = () => {
    // Make sure we're not duplicating the script
    if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
      console.log("PayPal script already exists, not loading again");
      setPaypalInitialized(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&currency=USD&components=buttons&debug=true&disable-funding=venmo,paylater";
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;
    
    script.onload = () => {
      console.log("PayPal script loaded successfully");
      setPaypalInitialized(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load PayPal script");
      setError("Failed to load payment provider");
      toast({
        title: "Payment Error",
        description: "Failed to load payment provider. Please try again later.",
        variant: "destructive",
      });
    };
    
    document.body.appendChild(script);
  };

  // Render PayPal buttons once script is loaded
  useEffect(() => {
    const renderPayPalButtons = () => {
      if (!paypalInitialized || !window.paypal || !selectedPlan || paypalButtonsRendered) {
        return;
      }
      
      try {
        const amount = calculateTotal(selectedPlan.price).toFixed(2);
        const container = document.getElementById('paypal-button-container');
        
        if (!container) {
          console.error("PayPal button container not found");
          return;
        }
        
        // Clear any existing content
        container.innerHTML = '';
        
        window.paypal.Buttons({
          style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
          },
          fundingSource: window.paypal.FUNDING.PAYPAL,
          createOrder: async function() {
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
                
                // Save current location to redirect back after login
                const returnPath = sessionStorage.getItem('cartReturnPath') || '/cart';
                navigate('/auth', { state: { returnTo: returnPath } });
                return null;
              }
              
              console.log("Creating PayPal order with params:", {
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                amount: amount
              });
              
              // Call our Supabase function to create a PayPal order
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
          onApprove: async function(data: any, actions: any) {
            try {
              setLoading(true);
              setError(null);
              
              // Get the order ID from PayPal
              const { orderID } = data;
              console.log("Order approved:", orderID);
              
              // Call our Supabase function to capture the payment
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
              
              // Payment successful!
              toast({
                title: "Payment successful!",
                description: `Your ${selectedPlan.name} plan is now active.`,
              });
              
              // Refresh the user profile to get updated plan information
              await refreshProfile();
              navigate('/profile');
              return true;
            } catch (error: any) {
              // Handle specific errors from PayPal
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
                // Allow the user to try again
                return actions.restart();
              }
              
              return false;
            } finally {
              setLoading(false);
            }
          },
          onCancel: function() {
            toast({
              title: "Payment cancelled",
              description: "You've cancelled the payment process. No payment was made.",
            });
            setLoading(false);
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            setError("Payment processing error");
            toast({
              title: "Payment error",
              description: "An error occurred during the payment process. Please try again.",
              variant: "destructive",
            });
            setLoading(false);
          }
        }).render('#paypal-button-container');
        
        setPaypalButtonsRendered(true);
        setLoading(false);
        console.log("PayPal buttons rendered successfully");
        
      } catch (error: any) {
        console.error("Error setting up PayPal buttons:", error);
        setError("Failed to initialize payment options");
        toast({
          title: "Payment Error",
          description: "Failed to initialize payment options. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    renderPayPalButtons();
  }, [paypalInitialized, selectedPlan, user, navigate, toast, calculateTotal, refreshProfile, paypalButtonsRendered, setLoading]);

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
              {/* PayPal SDK buttons container */}
              <div 
                id="paypal-button-container" 
                className="w-full mt-4 min-h-[150px]"
              ></div>
              
              {!paypalInitialized && (
                <div className="text-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading payment options...</p>
                </div>
              )}
              
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
