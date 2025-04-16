
import { useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

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
        if (!window.paypal) return;

        const paypalButtons = window.paypal.Buttons({
          style: {
            shape: "rect",
            layout: "vertical",
            color: "blue",
            label: "checkout",
          },
          createOrder: async () => {
            try {
              const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  cart: [{
                    id: productId,
                    quantity: 1,
                    amount: amount
                  }],
                }),
              });

              const orderData = await response.json();

              if (orderData.id) {
                return orderData.id;
              }

              const errorDetail = orderData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

              throw new Error(errorMessage);
            } catch (error) {
              console.error(error);
              toast({
                title: "Error",
                description: "Could not initiate PayPal Checkout. Please try again.",
                variant: "destructive"
              });
            }
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const response = await fetch(
                `/api/orders/${data.orderID}/capture`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              const orderData = await response.json();
              const errorDetail = orderData?.details?.[0];

              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                return actions.restart();
              } 
              
              if (errorDetail) {
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
              } 
              
              if (!orderData.purchase_units) {
                throw new Error(JSON.stringify(orderData));
              }

              const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                                orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];

              toast({
                title: "Payment Successful",
                description: `Transaction ${transaction.status}: ${transaction.id}`,
              });

              // Redirect to success page or update UI accordingly
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

        paypalButtons.render("#paypal-button-container");
        paypalLoaded.current = true;
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
