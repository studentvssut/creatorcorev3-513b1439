import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSignature === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifySignature(body, signature, RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("SECURITY: Invalid webhook signature - possible tampering attempt", {
        timestamp: new Date().toISOString(),
        signatureProvided: signature ? "yes" : "no",
      });
      // Return 200 to prevent retry storms, but log the mismatch
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    console.log("Razorpay webhook event:", eventType);

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (eventType === "subscription.activated") {
      const subscription = event.payload?.subscription?.entity;
      if (!subscription) {
        console.error("No subscription entity in payload");
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const razorpaySubId = subscription.id;
      const plan = subscription.notes?.plan;
      const userId = subscription.notes?.user_id;

      const periodStart = subscription.current_start
        ? new Date(subscription.current_start * 1000).toISOString()
        : null;
      const periodEnd = subscription.current_end
        ? new Date(subscription.current_end * 1000).toISOString()
        : null;

      // Update subscription status to active
      const { error: subError } = await adminClient
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          grace_period_end: null,
        })
        .eq("razorpay_subscription_id", razorpaySubId);

      if (subError) {
        console.error("Failed to update subscription:", subError);
      }

      // Upgrade user plan in profiles
      if (userId && plan) {
        const { error: profileError } = await adminClient
          .from("profiles")
          .update({ plan, updated_at: new Date().toISOString() })
          .eq("user_id", userId);

        if (profileError) {
          console.error("Failed to update profile plan:", profileError);
        }
        console.log(`Plan upgraded to '${plan}' for user ${userId}`);
      }
    } else if (eventType === "subscription.halted" || eventType === "subscription.cancelled") {
      const subscription = event.payload?.subscription?.entity;
      if (subscription) {
        const razorpaySubId = subscription.id;
        const userId = subscription.notes?.user_id;
        const newStatus = eventType === "subscription.halted" ? "halted" : "cancelled";

        await adminClient
          .from("subscriptions")
          .update({ status: newStatus })
          .eq("razorpay_subscription_id", razorpaySubId);

        // Downgrade plan to free
        if (userId) {
          await adminClient
            .from("profiles")
            .update({ plan: "free", updated_at: new Date().toISOString() })
            .eq("user_id", userId);
          console.log(`Plan downgraded to free for user ${userId} (${newStatus})`);
        }
      }
    } else if (eventType === "subscription.charged") {
      const subscription = event.payload?.subscription?.entity;
      const payment = event.payload?.payment?.entity;
      if (subscription) {
        const razorpaySubId = subscription.id;
        const periodStart = subscription.current_start
          ? new Date(subscription.current_start * 1000).toISOString()
          : null;
        const periodEnd = subscription.current_end
          ? new Date(subscription.current_end * 1000).toISOString()
          : null;

        await adminClient
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: periodStart,
            current_period_end: periodEnd,
            next_billing_date: periodEnd,
            grace_period_end: null,
          })
          .eq("razorpay_subscription_id", razorpaySubId);

        console.log(`Subscription charged: ${razorpaySubId}, payment: ${payment?.id}`);
      }
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity;
      console.log("Payment failed for:", payment?.id, "Reason:", payment?.error_description);
    } else {
      console.log("Unhandled event type:", eventType);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", {
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    });
    // Always return 200 after signature verification to prevent retry storms
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
