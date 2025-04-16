import { useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface PayPalButtonsConfig {
  amount: number;
  productId: string;
}

export const usePayPalPayment = ({ amount, productId }: PayPalButtonsConfig) => {
  const navigate = useNavigate();
  const paypalLoaded = useRef(false);

  useEffect(() => {
    if (paypalLoaded.current) return;

    const loadPayPalScript = () => {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&buyer-country=US&currency=USD&components=buttons&enable-funding=card&disable-funding=venmo,paylater";
      script.async = true;

      script.onload = () => {
        if (!window.paypal) {
          console.error("PayPal SDK failed to load");
          return;
        }

        const paypalButtons = window.paypal.Buttons({
          style: {
            shape: "rect",
            layout: "vertical",
            color: "blue",
            label: "checkout",
          },
          createOrder: async () => {
            try {
              const { data, error } = await supabase.functions.invoke("create-paypal-order", {
                body: {
                  planId: productId,
                  planName: productId.charAt(0).toUpperCase() + productId.slice(1),
                  amount: amount.toString()
                }
              });

              if (error) {
                console.error("Error creating order:", error);
                toast({
                  title: "Error",
                  description: "Could not initiate PayPal Checkout. Please try again.",
                  variant: "destructive"
                });
                throw new Error(error.message);
              }

              if (data && data.id) {
                return data.id;
              }

              const errorDetail = data?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${data.debug_id})`
                : JSON.stringify(data);

              throw new Error(errorMessage);
            } catch (error) {
              console.error(error);
              toast({
                title: "Error",
                description: "Could not initiate PayPal Checkout. Please try again.",
                variant: "destructive"
              });
              throw error;
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const user = await supabase.auth.getUser();
              const userId = user.data.user?.id;
              
              if (!userId) {
                toast({
                  title: "Authentication Error",
                  description: "You need to be logged in to complete this purchase.",
                  variant: "destructive"
                });
                return;
              }

              const { data: captureData, error } = await supabase.functions.invoke("capture-paypal-order", {
                body: {
                  orderId: data.orderID,
                  userId: userId,
                  planId: productId
                }
              });

              if (error) {
                console.error("Error capturing payment:", error);
                toast({
                  title: "Payment Failed",
                  description: "Sorry, your transaction could not be processed. Please try again.",
                  variant: "destructive"
                });
                throw new Error(error.message);
              }

              const errorDetail = captureData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
              } 
              
              if (errorDetail) {
                throw new Error(`${errorDetail.description} (${captureData.debug_id})`);
              } 
              
              if (!captureData.success) {
                throw new Error(JSON.stringify(captureData));
              }

              toast({
                title: "Payment Successful",
                description: `Your ${productId} plan has been activated.`,
              });

              navigate('/profile?tab=plans');
            } catch (error) {
              console.error(error);
              toast({
                title: "Payment Failed",
                description: "Sorry, your transaction could not be processed. Please try again.",
                variant: "destructive"
              });
            }
          },
        });

        if (paypalButtons.render) {
          paypalButtons.render("#paypal-button-container");
          paypalLoaded.current = true;
        } else {
          console.error("PayPal Buttons render method not found");
        }
      };

      document.head.appendChild(script);

      return () => {
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    };

    loadPayPalScript();
  }, [amount, productId, navigate]);
};
