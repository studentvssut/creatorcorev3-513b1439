const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "creatorcore_webhook_verify";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // GET = Meta webhook verification challenge
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    console.error("Webhook verification failed - token mismatch");
    return new Response("Forbidden", {
      status: 403,
      headers: corsHeaders,
    });
  }

  // POST = incoming webhook events from Meta
  if (req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Webhook event received:", JSON.stringify(body));

      // Process Instagram webhook events
      if (body.object === "instagram") {
        for (const entry of body.entry || []) {
          console.log("Instagram entry:", JSON.stringify(entry));
          // Future: process mentions, comments, story_insights etc.
        }
      }

      // Meta expects a 200 response quickly
      return new Response("EVENT_RECEIVED", {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    } catch (err) {
      console.error("Webhook processing error:", err);
      return new Response("EVENT_RECEIVED", {
        status: 200,
        headers: corsHeaders,
      });
    }
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
