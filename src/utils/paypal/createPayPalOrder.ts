
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
    
    const userId = session.user.id;

    // Add validation for inputs
    if (!productId || !amount || amount <= 0) {
      toast({
        title: "Invalid Parameters",
        description: "Product and amount are required for checkout.",
        variant: "destructive"
      });
      throw new Error("Invalid parameters for order creation");
    }

    // Create the order through Supabase function
    const { data, error } = await supabase.functions.invoke("create-paypal-order", {
      body: {
        planId: productId,
        planName: productId.charAt(0).toUpperCase() + productId.slice(1),
        amount: amount.toFixed(2),
        userId: userId,
        environment: 'live' // Add environment parameter
      }
    });

    if (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Could not create PayPal order",
        variant: "destructive"
      });
      throw error;
    }

    if (!data || !data.id) {
      console.error("Invalid order data received:", data);
      toast({
        title: "Order Creation Failed",
        description: "Invalid order data received from server",
        variant: "destructive"
      });
      throw new Error("Invalid order data");
    }

    console.log("Order created successfully with ID:", data.id);
    return data.id;
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
