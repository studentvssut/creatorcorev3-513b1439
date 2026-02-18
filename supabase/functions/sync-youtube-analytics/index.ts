import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all connected YouTube accounts
    const { data: platforms, error: platformError } = await supabase
      .from("connected_platforms")
      .select("user_id, access_token, refresh_token")
      .eq("platform", "youtube")
      .eq("is_connected", true);

    if (platformError) throw platformError;
    if (!platforms || platforms.length === 0) {
      return new Response(JSON.stringify({ message: "No YouTube accounts connected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const platform of platforms) {
      try {
        const accessToken = platform.access_token;
        if (!accessToken) {
          results.push({ user_id: platform.user_id, status: "skipped", reason: "no access token" });
          continue;
        }

        // Fetch YouTube channel statistics
        const response = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true",
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const result = await response.json();

        if (!result.items || result.items.length === 0) {
          results.push({ user_id: platform.user_id, status: "skipped", reason: "no channel data" });
          continue;
        }

        const stats = result.items[0].statistics;
        const today = new Date().toISOString().split("T")[0];

        // Upsert into performance_metrics
        await supabase.from("performance_metrics").upsert({
          user_id: platform.user_id,
          platform: "youtube",
          metric_date: today,
          followers_count: parseInt(stats.subscriberCount || "0"),
          total_views: parseInt(stats.viewCount || "0"),
          posts_count: parseInt(stats.videoCount || "0"),
        }, { onConflict: "user_id,platform,metric_date" });

        results.push({ user_id: platform.user_id, status: "synced" });
      } catch (err) {
        results.push({ user_id: platform.user_id, status: "error", reason: err.message });
      }
    }

    return new Response(JSON.stringify({ message: "Sync complete", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
