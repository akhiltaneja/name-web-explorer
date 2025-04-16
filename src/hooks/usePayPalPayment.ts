
import { useEffect, useRef, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { cleanupPayPalScript, loadPayPalScript } from '@/utils/paypal/loadPayPalSDK';
import { createPayPalOrder } from '@/utils/paypal/createPayPalOrder';
import { capturePayPalPayment } from '@/utils/paypal/capturePayPalPayment';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        if (!session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to make a purchase.",
            variant: "destructive"
          });
          // Redirect to login page
          navigate('/auth');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Load PayPal SDK once authenticated
  useEffect(() => {
    if (isAuthenticated === false) return; // Don't load if not authenticated
    if (paypalLoaded.current) return; // Prevent multiple loads
    
    const initPayPal = async () => {
      try {
        setIsLoading(true);
        // Using live client ID - for sandbox testing
        await loadPayPalScript('AVuzQzspgCUwELAG9RAJVEifedKU0XEA_E6rggkxic__6TaLvTLvp4DwukcUNrYwguN3DAifSaG4yTjl');
        paypalLoaded.current = true;
        setSdkReady(true);
      } catch (error) {
        console.error("PayPal SDK load error:", error);
        toast({
          title: "Error",
          description: "Failed to load payment system. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      initPayPal();
    }
    
    // Clean up on component unmount
    return () => {
      cleanupPayPalScript();
    };
  }, [isAuthenticated]); // Only load after auth check

  // Render PayPal buttons once SDK is loaded
  useEffect(() => {
    if (!sdkReady || paypalButtonsRendered.current || !window.paypal?.Buttons || isLoading) return;
    
    const container = document.getElementById('paypal-button-container');
    if (!container) {
      console.error("PayPal button container not found");
      return;
    }

    try {
      // Clear any existing content
      container.innerHTML = '';
      
      const paypalButtons = window.paypal.Buttons({
        style: {
          shape: "rect",
          layout: "vertical",
          color: "blue",
          label: "checkout",
        },
        // Create order function
        createOrder: async () => {
          try {
            // Create an order ID on the server
            return await createPayPalOrder(productId, amount);
          } catch (err) {
            console.error("Create order error:", err);
            throw err;
          }
        },
        onApprove: async (data) => {
          try {
            setIsLoading(true);
            // Capture the payment
            const captureData = await capturePayPalPayment(data, productId);
            
            // Show success message
            toast({
              title: "Payment Successful",
              description: `Your ${productId} plan has been activated.`,
            });
            
            // Navigate to profile page
            navigate('/profile?tab=plans');
          } catch (error) {
            // Error handling is done in capturePayPalPayment
            console.error('Payment capture failed:', error);
          } finally {
            setIsLoading(false);
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
  }, [sdkReady, amount, productId, navigate, isLoading]);
  
  return { isLoading };
};
