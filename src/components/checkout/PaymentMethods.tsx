
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Lock } from "lucide-react";
import PaypalLogo from "./PayPalLogo";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface PaymentMethodsProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PaymentMethods = ({ loading, setLoading }: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");
  const [paypalScriptLoaded, setPaypalScriptLoaded] = useState(false);
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
  }, [selectedPlan]);

  useEffect(() => {
    if (paypalScriptLoaded && selectedPlan) {
      renderPayPalButtons();
    }
  }, [paypalScriptLoaded, paymentMethod, selectedPlan]);

  const renderPayPalButtons = () => {
    if (!selectedPlan || !window.paypal) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const cardButtonContainer = document.getElementById('paypal-card-container');
    
    if (paypalButtonContainer) paypalButtonContainer.innerHTML = '';
    if (cardButtonContainer) cardButtonContainer.innerHTML = '';

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
            navigate('/auth');
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
            shape: "pill",
            layout: "vertical",
            color: "blue",
            label: "paypal"
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
      
      if (cardButtonContainer && paymentMethod === "card") {
        window.paypal.Buttons({
          style: {
            shape: "pill",
            layout: "vertical",
            color: "black",
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
            console.error('PayPal Card error:', err);
            toast({
              title: "Payment error",
              description: "An error occurred during the payment process. Please try again.",
              variant: "destructive",
            });
          }
        }).render('#paypal-card-container');
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

  return (
    <Tabs defaultValue="paypal" onValueChange={(value) => setPaymentMethod(value as "paypal" | "card")}>
      <TabsList className="grid w-full grid-cols-2 mb-4">
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
        <div id="paypal-button-container" className="w-full mt-2"></div>
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing payment...</p>
          </div>
        )}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-2">
          <Lock className="h-4 w-4 mr-1 text-gray-400" />
          Secure payment powered by PayPal
        </div>
      </TabsContent>
      
      <TabsContent value="card" className="space-y-4">
        <div id="paypal-card-container" className="w-full mt-2"></div>
        {!paypalScriptLoaded && !loading && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payment options...</p>
          </div>  
        )}
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Processing payment...</p>
          </div>
        )}
        <div className="text-center text-sm text-gray-500 flex items-center justify-center mt-2">
          <Lock className="h-4 w-4 mr-1 text-gray-400" />
          Card details are securely processed by PayPal
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PaymentMethods;
