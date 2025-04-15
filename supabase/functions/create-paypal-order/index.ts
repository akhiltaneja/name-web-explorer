
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Required PayPal API credentials from environment variables
// PAYPAL_CLIENT_ID - Your PayPal client ID
// PAYPAL_SECRET - Your PayPal secret
// PAYPAL_API_URL - Base URL for PayPal API (sandbox or live)

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
    const paypalApiUrl = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com";

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

    // Parse request body to get order information
    const requestData = await req.json();
    const { planId, planName, amount } = requestData;

    if (!planId || !planName || !amount) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          details: "planId, planName, and amount are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Creating PayPal order for:", { planId, planName, amount });

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

    // Create order with PayPal - simplified version for better compatibility
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planId,
          description: `CandidateChecker ${planName} Plan`,
          amount: {
            currency_code: "USD",
            value: amount
          }
        },
      ],
      application_context: {
        brand_name: "CandidateChecker",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: "https://your-app.com/success",
        cancel_url: "https://your-app.com/cancel"
      },
    };

    console.log("Sending order request to PayPal:", JSON.stringify(orderPayload));

    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(orderPayload),
    });

    // Handle the order response
    const orderData = await orderResponse.json();
    
    if (!orderResponse.ok) {
      console.error("PayPal order creation error status:", orderResponse.status);
      console.error("PayPal order creation error response:", orderData);
      
      // Check for specific error details
      const errorDetail = orderData?.details?.[0];
      const errorMessage = errorDetail
        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
        : JSON.stringify(orderData);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to create PayPal order",
          status: orderResponse.status,
          details: errorMessage
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("PayPal order created successfully:", orderData);

    // Return successful response with PayPal order ID
    return new Response(
      JSON.stringify({
        id: orderData.id,
        status: orderData.status,
        links: orderData.links
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating PayPal order:", error);
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
