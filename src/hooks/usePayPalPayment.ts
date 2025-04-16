
import { useEffect, useRef, useState } from 'react';
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
  const paypalButtonsRendered = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Clear any existing PayPal scripts on mount to avoid conflicts
  useEffect(() => {
    const cleanupPayPalScript = () => {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
        paypalLoaded.current = false;
        paypalButtonsRendered.current = false;
        setSdkReady(false);
      }

      // Also clean up any PayPal button containers
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
      }
    };

    // Clean up on mount
    cleanupPayPalScript();

    // Load PayPal script with proper configuration
    const loadPayPalScript = () => {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl&currency=USD&intent=capture&components=buttons&disable-funding=venmo,paylater`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("PayPal SDK loaded successfully");
        paypalLoaded.current = true;
        setSdkReady(true);
      };

      script.onerror = (error) => {
        console.error("PayPal SDK failed to load:", error);
        toast({
          title: "Error",
          description: "Failed to load payment system. Please try again later.",
          variant: "destructive"
        });
      };

      document.head.appendChild(script);
    };

    loadPayPalScript();
    
    // Clean up on component unmount
    return () => {
      cleanupPayPalScript();
    };
  }, []); // Only load on initial mount

  // Render PayPal buttons once SDK is loaded
  useEffect(() => {
    if (!sdkReady || paypalButtonsRendered.current || !window.paypal?.Buttons) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error("PayPal button container not found");
      return;
    }

    try {
      // Clear any existing content
      container.innerHTML = '';
      
      console.log("Creating PayPal buttons with config:", { amount, productId });
      
      const paypalButtons = window.paypal.Buttons({
        style: {
          shape: "rect",
          layout: "vertical",
          color: "blue",
          label: "checkout",
        },
        createOrder: async () => {
          try {
            console.log("Creating PayPal order for:", { productId, amount });
            
            // Get the current user session to verify authentication
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              toast({
                title: "Authentication Error",
                description: "You need to be logged in to make a purchase.",
                variant: "destructive"
              });
              throw new Error("User not authenticated");
            }
            
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
              console.log("Order created successfully with ID:", data.id);
              return data.id;
            }

            const errorDetail = data?.details?.[0];
            const errorMessage = errorDetail
              ? `${errorDetail.issue} ${errorDetail.description} (${data.debug_id})`
              : JSON.stringify(data);

            console.error("Unexpected response from create order:", errorMessage);
            throw new Error(errorMessage);
          } catch (error) {
            console.error("Create order error:", error);
            toast({
              title: "Error",
              description: "Could not initiate PayPal Checkout. Please try again.",
              variant: "destructive"
            });
            throw error;
          }
        },
        onApprove: async (data) => {
          try {
            console.log("Payment approved, capturing order:", data.orderID);
            
            // Get the current user
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;
            
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

            if (!captureData?.success) {
              const errorDetail = captureData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description}`
                : JSON.stringify(captureData);
                
              console.error("Error in capture response:", errorMessage);
              toast({
                title: "Payment Failed",
                description: "Sorry, your transaction could not be processed. Please try again.",
                variant: "destructive"
              });
              return;
            }

            console.log("Payment captured successfully:", captureData);
            
            toast({
              title: "Payment Successful",
              description: `Your ${productId} plan has been activated.`,
            });

            navigate('/profile?tab=plans');
          } catch (error) {
            console.error("Payment capture error:", error);
            toast({
              title: "Payment Failed",
              description: "Sorry, your transaction could not be processed. Please try again.",
              variant: "destructive"
            });
          }
        },
        onCancel: () => {
          console.log("Payment cancelled by user");
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment process.",
          });
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          toast({
            title: "Payment Error",
            description: "An error occurred during the payment process. Please try again.",
            variant: "destructive"
          });
        }
      });

      // Check if buttons can be rendered
      if (!paypalButtons.isEligible()) {
        console.error("PayPal Buttons are not eligible for this configuration");
        toast({
          title: "Payment Method Unavailable",
          description: "PayPal checkout is not available for this purchase. Please try another payment method.",
          variant: "destructive"
        });
        return;
      }

      // Render the buttons
      paypalButtons.render("#paypal-button-container")
        .then(() => {
          console.log("PayPal buttons rendered successfully");
          paypalButtonsRendered.current = true;
        })
        .catch((renderError) => {
          console.error("Error rendering PayPal buttons:", renderError);
          toast({
            title: "Error",
            description: "Failed to initialize payment system. Please try again later.",
            variant: "destructive"
          });
        });
    } catch (error) {
      console.error("Error setting up PayPal buttons:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment system. Please try again later.",
        variant: "destructive"
      });
    }
  }, [sdkReady, amount, productId, navigate]);
};
