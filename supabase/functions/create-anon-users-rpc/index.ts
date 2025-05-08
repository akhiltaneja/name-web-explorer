
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Create the update_anon_user function if it doesn't exist
    const { error } = await supabaseAdmin.rpc('create_anon_users_table_if_not_exists');
    
    if (error) {
      console.error("Error creating anon_users table:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    // Create the RPC function
    const createRpcFunctionSql = `
    CREATE OR REPLACE FUNCTION public.update_anon_user(p_identifier TEXT)
    RETURNS VOID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM public.anon_users WHERE identifier = p_identifier
      ) THEN
        -- User exists, update last_seen and search_count
        UPDATE public.anon_users
        SET 
          last_seen = NOW(),
          search_count = search_count + 1
        WHERE identifier = p_identifier;
      ELSE
        -- Insert new user
        INSERT INTO public.anon_users (identifier, search_count)
        VALUES (p_identifier, 1);
      END IF;
    END;
    $$;
    `;
    
    const { error: rpcError } = await supabaseAdmin.rpc('exec_sql', { sql: createRpcFunctionSql });
    
    if (rpcError) {
      console.error("Error creating update_anon_user function:", rpcError);
      
      // Try with direct SQL execution
      const { error: directError } = await supabaseAdmin.sql(createRpcFunctionSql);
      
      if (directError) {
        console.error("Error with direct SQL execution:", directError);
        return new Response(JSON.stringify({ error: directError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
    }
    
    // Create the exec_sql function if it doesn't exist
    const createExecSqlFunctionSql = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
    `;
    
    await supabaseAdmin.sql(createExecSqlFunctionSql);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Anonymous user tracking functions created successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
