import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
const RAZORPAY_STARTER_PLAN_ID = Deno.env.get("RAZORPAY_STARTER_PLAN_ID");
const RAZORPAY_PRO_PLAN_ID = Deno.env.get("RAZORPAY_PRO_PLAN_ID");

const PLAN_MAP: Record<string, string | undefined> = {
  starter: RAZORPAY_STARTER_PLAN_ID,
  pro: RAZORPAY_PRO_PLAN_ID,
};

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Verify payment signature
    const encoder = new TextEncoder();
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(signaturePayload));
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      console.error("Invalid payment signature");
      return new Response(JSON.stringify({ error: "Invalid payment signature", verified: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Verify payment status with Razorpay API
    const rzpAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: { Authorization: `Basic ${rzpAuth}` },
    });

    if (!paymentRes.ok) {
      console.error("Failed to fetch payment:", await paymentRes.text());
      return new Response(JSON.stringify({ error: "Payment verification failed", verified: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = await paymentRes.json();
    if (payment.status !== "captured") {
      return new Response(JSON.stringify({ error: `Payment not captured. Status: ${payment.status}`, verified: false }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 3: Create Razorpay subscription immediately (for AutoPay mandate)
    const razorpayPlanId = PLAN_MAP[plan];
    if (!razorpayPlanId) {
      console.error("Missing plan ID for:", plan);
      return new Response(JSON.stringify({ error: `Plan '${plan}' not configured` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startAt = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now
    const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${rzpAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: razorpayPlanId,
        total_count: 11,
        quantity: 1,
        customer_notify: 1,
        start_at: startAt,
        notes: {
          user_id: user.id,
          plan: plan,
          first_payment_id: razorpay_payment_id,
        },
        notify_info: {
          notify_email: user.email || "",
        },
      }),
    });

    let subscriptionId: string | null = null;
    if (!subRes.ok) {
      const errBody = await subRes.text();
      console.error("Razorpay subscription creation error:", errBody);
      // Payment succeeded but sub creation failed — still activate plan
    } else {
      const subscription = await subRes.json();
      subscriptionId = subscription.id;
    }

    // Step 4: Activate plan immediately using admin client
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    const nextBilling = new Date(startAt * 1000);

    // Upsert subscription record
    await adminClient.from("subscriptions").upsert(
      {
        user_id: user.id,
        razorpay_subscription_id: subscriptionId || `order_${razorpay_order_id}`,
        razorpay_plan_id: razorpayPlanId,
        plan: plan,
        status: "active",
        billing_type: "anniversary",
        current_period_start: now.toISOString(),
        current_period_end: nextBilling.toISOString(),
        next_billing_date: nextBilling.toISOString(),
        grace_period_end: null,
      },
      { onConflict: "user_id" }
    );

    // Upgrade profile plan
    await adminClient
      .from("profiles")
      .update({ plan: plan, updated_at: now.toISOString() })
      .eq("user_id", user.id);

    console.log(`Plan activated to '${plan}' for user ${user.id}, subscription: ${subscriptionId || "pending"}`);

    return new Response(
      JSON.stringify({
        verified: true,
        plan: plan,
        subscription_id: subscriptionId,
        key_id: RAZORPAY_KEY_ID,
        next_billing: nextBilling.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Activate error:", err);
    return new Response(JSON.stringify({ error: "Internal server error", verified: false }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});