
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

  const loadPayPalScript = () => {
    if (scriptLoaded.current) return;
    
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      document.body.removeChild(existingScript);
    }
    
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&currency=USD&components=buttons&enable-funding=card&disable-funding=venmo,paylater";
    script.async = true;
    script.dataset.sdkIntegrationSource = "developer-studio";
    
    script.onload = () => {
      scriptLoaded.current = true;
      renderPayPalButtons();
    };
    
    script.onerror = (e) => {
      console.error("Failed to load PayPal script:", e);
      setError("Failed to load payment provider");
      setLoading(false);
      toast({
        title: "Payment Error",
        description: "Failed to load payment provider. Please try again later.",
        variant: "destructive",
      });
    };
    
    document.body.appendChild(script);
  };
  
  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalContainerRef.current || !selectedPlan) {
      console.error("Cannot render PayPal buttons - missing requirements");
      return;
    }
    
    try {
      paypalContainerRef.current.innerHTML = '';
      const amount = calculateTotal(selectedPlan.price).toFixed(2);
      
      window.paypal.Buttons({
        style: {
          color: 'gold',
          shape: 'rect',
          layout: 'vertical',
        },
        createOrder: async () => {
          try {
            setLoading(true);
            setError(null);
            
            if (!user) {
              toast({
                title: "Authentication required",
                description: "Please log in to continue with the purchase.",
                variant: "destructive",
              });
              navigate('/auth', { state: { returnTo: '/cart' } });
              return null;
            }
            
            const response = await supabase.functions.invoke('create-paypal-order', {
              body: {
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                amount: amount
              }
            });
            
            if (response.error) {
              throw new Error(response.error.message || 'Failed to create order');
            }
            
            return response.data.id;
          } catch (error: any) {
            console.error('Error creating order:', error);
            setError(error.message || "Payment initialization failed");
            setLoading(false);
            toast({
              title: "Payment Error",
              description: error.message || "Could not start the payment process",
              variant: "destructive",
            });
            return null;
          }
        },
        onApprove: async (data: any) => {
          try {
            setLoading(true);
            setError(null);
            
            const response = await supabase.functions.invoke('capture-paypal-order', {
              body: {
                orderId: data.orderID,
                userId: user?.id,
                planId: selectedPlan.id
              }
            });
            
            if (response.error) {
              throw new Error(response.error.message || 'Payment failed');
            }
            
            toast({
              title: "Success!",
              description: `Your ${selectedPlan.name} plan is now active.`,
            });
            
            await refreshProfile();
            navigate('/profile');
            return true;
          } catch (error: any) {
            console.error('Payment capture error:', error);
            setError(error.message || "Payment failed");
            toast({
              title: "Payment Failed",
              description: error.message || "There was an issue processing your payment",
              variant: "destructive",
            });
            return false;
          } finally {
            setLoading(false);
          }
        },
        onCancel: () => {
          console.log("Payment cancelled");
          toast({
            title: "Payment Cancelled",
            description: "You've cancelled the payment process",
          });
          setLoading(false);
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          setError("Payment processing error");
          toast({
            title: "Payment Error",
            description: "An error occurred during payment processing",
            variant: "destructive",
          });
          setLoading(false);
        }
      }).render(paypalContainerRef.current);
      
    } catch (error: any) {
      console.error("Error rendering PayPal buttons:", error);
      setError("Failed to initialize payment options");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!selectedPlan) return;
    loadPayPalScript();
    
    return () => {
      scriptLoaded.current = false;
    };
  }, [selectedPlan]);

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 pb-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600 mb-4">
            <p>Error: {error}</p>
            <p className="mt-1 text-xs">Please try again or contact support.</p>
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
              />
              
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
