
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";

export const createPayPalOrder = async (productId: string, amount: number) => {
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
      throw error;
    }

    if (data && data.id) {
      console.log("Order created successfully with ID:", data.id);
      return data.id;
    }

    const errorDetail = data?.details?.[0];
    const errorMessage = errorDetail
      ? `${errorDetail.issue} ${errorDetail.description} (${data.debug_id})`
      : JSON.stringify(data);

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
};
