import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Required environment variables:
// PAYPAL_CLIENT_ID - Your PayPal client ID
// PAYPAL_SECRET - Your PayPal secret
// PAYPAL_API_URL - Base URL for PayPal API (sandbox or live)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically provided by Supabase

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalSecret = Deno.env.get("PAYPAL_SECRET");
    const paypalApiUrl = "https://api-m.paypal.com"; // Use live API URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!paypalClientId || !paypalSecret) {
      console.error("Missing PayPal credentials");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error",
          details: "Missing PayPal credentials" 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body to get orderId and userId
    const requestData = await req.json();
    const { orderId, userId, planId } = requestData;

    if (!orderId || !userId || !planId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          details: "orderId, userId, and planId are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Capturing PayPal order:", { orderId, userId, planId });

    // Get access token from PayPal
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("PayPal token error status:", tokenResponse.status);
      console.error("PayPal token error response:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to authenticate with PayPal",
          status: tokenResponse.status,
          details: tokenError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("No access token in PayPal response:", tokenData);
      return new Response(
        JSON.stringify({ 
          error: "Invalid authentication response from PayPal",
          details: "No access token received"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First, check the order status to make sure it's valid
    const orderStatusResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!orderStatusResponse.ok) {
      const orderError = await orderStatusResponse.text();
      console.error("PayPal order status error:", orderError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to verify PayPal order",
          status: orderStatusResponse.status,
          details: orderError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const orderStatus = await orderStatusResponse.json();
    console.log("Order status from PayPal:", orderStatus);

    // Validate that the order is in a capturable state
    if (orderStatus.status !== "CREATED" && orderStatus.status !== "APPROVED") {
      console.error("Order is not in a capturable state:", orderStatus.status);
      return new Response(
        JSON.stringify({ 
          error: "Order cannot be captured",
          details: `Order status is ${orderStatus.status}, expected CREATED or APPROVED`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Capture the order (complete the payment)
    const captureResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Prefer": "return=representation"
      },
    });

    // Handle capture response
    const captureData = await captureResponse.json();
    
    if (!captureResponse.ok) {
      console.error("PayPal capture error status:", captureResponse.status);
      console.error("PayPal capture error response:", captureData);
      
      // Check for specific error details
      const errorDetail = captureData?.details?.[0];
      const errorMessage = errorDetail
        ? `${errorDetail.issue} ${errorDetail.description} (${captureData.debug_id})`
        : JSON.stringify(captureData);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to capture PayPal payment",
          status: captureResponse.status,
          details: errorMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Payment captured from PayPal:", captureData);

    // Check if capture was successful
    if (captureData.status !== "COMPLETED") {
      console.error("PayPal capture status is not COMPLETED:", captureData.status);
      return new Response(
        JSON.stringify({ 
          error: "Payment capture not completed",
          details: `Capture status is ${captureData.status}, expected COMPLETED`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the transaction details
    const transaction = 
      captureData?.purchase_units?.[0]?.payments?.captures?.[0] ||
      captureData?.purchase_units?.[0]?.payments?.authorizations?.[0];
      
    if (!transaction) {
      console.error("No transaction details found in PayPal response");
      return new Response(
        JSON.stringify({ 
          error: "Invalid PayPal response",
          details: "No transaction details found"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update user's plan in Supabase
    // Calculate plan duration based on plan type
    let planDuration = 30; // default 30 days for most plans
    if (planId === 'premium') {
      planDuration = 30; // 30 days for premium
    } else if (planId === 'unlimited') {
      planDuration = 365; // 1 year for unlimited
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + planDuration);

    // Update user profile with new plan information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: planId,
        plan_start_date: now.toISOString(),
        plan_end_date: endDate.toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating user plan:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Payment successful but failed to update plan",
          details: updateError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Payment captured and user plan updated successfully");

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        captureId: transaction.id,
        transactionStatus: transaction.status,
        status: captureData.status,
        plan: planId,
        planEndDate: endDate.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
