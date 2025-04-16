
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export const capturePayPalPayment = async (orderData: { orderID: string }, productId: string) => {
  try {
    if (!orderData || !orderData.orderID) {
      toast({
        title: "Payment Error",
        description: "Missing order information for payment capture.",
        variant: "destructive"
      });
      throw new Error("Invalid order data for capture");
    }
    
    console.log("Payment approved, capturing order:", orderData.orderID);
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "You need to be logged in to complete this purchase.",
        variant: "destructive"
      });
      throw new Error("User not authenticated");
    }

    // Send to capture endpoint
    const { data: captureData, error } = await supabase.functions.invoke("capture-paypal-order", {
      body: {
        orderId: orderData.orderID,
        userId: userId,
        planId: productId
      }
    });

    if (error) {
      console.error("Error capturing payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Could not capture payment",
        variant: "destructive"
      });
      throw error;
    }

    if (!captureData?.success) {
      const errorDetail = captureData?.details?.[0];
      const errorMessage = errorDetail
        ? `${errorDetail.issue} ${errorDetail.description}`
        : JSON.stringify(captureData);
        
      console.error("Error in capture response:", errorMessage);
      toast({
        title: "Payment Failed",
        description: "Error processing payment. Please try again.",
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }

    console.log("Payment captured successfully:", captureData);
    return captureData;
  } catch (error) {
    console.error("Payment capture error:", error);
    toast({
      title: "Payment Failed",
      description: "Sorry, your transaction could not be processed. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};
