import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { razorpay_subscription_id, razorpay_payment_id } = await req.json();

    if (!razorpay_subscription_id) {
      return new Response(JSON.stringify({ error: "Missing subscription ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify subscription status with Razorpay API
    const rzpAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${razorpay_subscription_id}`,
      {
        headers: {
          Authorization: `Basic ${rzpAuth}`,
        },
      }
    );

    if (!rzpRes.ok) {
      const errBody = await rzpRes.text();
      console.error("Razorpay verify error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to verify with Razorpay", verified: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rzpSub = await rzpRes.json();
    const isActive = rzpSub.status === "active" || rzpSub.status === "authenticated";

    // If active, update local DB as well (in case webhook hasn't fired yet)
    if (isActive) {
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const periodStart = rzpSub.current_start
        ? new Date(rzpSub.current_start * 1000).toISOString()
        : null;
      const periodEnd = rzpSub.current_end
        ? new Date(rzpSub.current_end * 1000).toISOString()
        : null;

      // Update subscription status
      await adminClient
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          grace_period_end: null,
        })
        .eq("razorpay_subscription_id", razorpay_subscription_id)
        .eq("user_id", user.id);

      // Update profile plan
      const { data: subData } = await adminClient
        .from("subscriptions")
        .select("plan")
        .eq("razorpay_subscription_id", razorpay_subscription_id)
        .eq("user_id", user.id)
        .single();

      if (subData) {
        await adminClient
          .from("profiles")
          .update({ plan: subData.plan, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
      }
    }

    return new Response(
      JSON.stringify({
        verified: isActive,
        status: rzpSub.status,
        plan: rzpSub.notes?.plan || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Verify payment error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", verified: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
