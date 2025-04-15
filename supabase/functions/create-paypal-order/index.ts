
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

    // Create order with PayPal
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planId,
          description: `CandidateChecker ${planName} Plan`,
          amount: {
            currency_code: "USD",
            value: String(amount),
          },
        },
      ],
      application_context: {
        brand_name: "CandidateChecker",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: "https://candidatechecker.io/payment-success",
        cancel_url: "https://candidatechecker.io/payment-cancelled",
      },
    };

    console.log("Sending order request to PayPal:", JSON.stringify(orderPayload));

    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      const orderError = await orderResponse.text();
      console.error("PayPal order creation error status:", orderResponse.status);
      console.error("PayPal order creation error response:", orderError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create PayPal order",
          status: orderResponse.status,
          details: orderError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created successfully:", orderData);

    // Return successful response with PayPal order details
    return new Response(
      JSON.stringify({
        id: orderData.id,
        status: orderData.status,
        links: orderData.links,
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
