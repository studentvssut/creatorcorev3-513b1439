import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { platform } = body;

    // Authenticate: accept either service_role key or valid user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    let userId: string;

    if (token === SUPABASE_SERVICE_ROLE_KEY) {
      // Server-to-server call (from oauth-callback or sync-social-data)
      userId = body.user_id;
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Missing user_id for service call" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Client call - validate JWT and use authenticated user ID
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = user.id;
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the connection with tokens
    const { data: connection, error: connError } = await supabaseAdmin
      .from("connected_platforms")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform)
      .eq("is_connected", true)
      .maybeSingle();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Platform not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let accessToken = connection.access_token;

    // Check if token needs refresh
    if (connection.token_expires_at) {
      const expiresAt = new Date(connection.token_expires_at);
      if (expiresAt < new Date()) {
        accessToken = await refreshToken(platform, connection, supabaseAdmin);
      }
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "No valid access token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let posts: any[] = [];

    if (platform === "instagram") {
      // Use page_access_token and IG Business Account ID for Graph API
      const pageToken = connection.page_access_token || accessToken;
      const igBusinessId = connection.platform_user_id;
      if (!igBusinessId) {
        return new Response(
          JSON.stringify({ error: "Instagram Business Account ID not found. Please reconnect." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      posts = await fetchInstagramPosts(pageToken, igBusinessId);
    } else if (platform === "youtube") {
      posts = await fetchYouTubePosts(accessToken);
    }

    // Upsert posts to content_posts
    for (const post of posts) {
      const { data: existing } = await supabaseAdmin
        .from("content_posts")
        .select("id")
        .eq("user_id", userId)
        .eq("platform_post_id", post.platform_post_id)
        .maybeSingle();

      const postData = { ...post, user_id: userId, platform };

      if (existing) {
        await supabaseAdmin.from("content_posts").update(postData).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("content_posts").insert(postData);
      }
    }

    // Aggregate into performance_metrics
    if (posts.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const totalViews = posts.reduce((s: number, p: any) => s + (p.views || 0), 0);
      const totalLikes = posts.reduce((s: number, p: any) => s + (p.likes || 0), 0);
      const totalComments = posts.reduce((s: number, p: any) => s + (p.comments || 0), 0);
      const totalSaves = posts.reduce((s: number, p: any) => s + (p.saves || 0), 0);
      const totalShares = posts.reduce((s: number, p: any) => s + (p.shares || 0), 0);
      const avgEngagement = totalViews > 0
        ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
        : 0;

      const { data: existingMetric } = await supabaseAdmin
        .from("performance_metrics")
        .select("id")
        .eq("user_id", userId)
        .eq("platform", platform)
        .eq("metric_date", today)
        .maybeSingle();

      const metricData = {
        user_id: userId,
        platform,
        metric_date: today,
        posts_count: posts.length,
        total_views: totalViews,
        total_likes: totalLikes,
        total_comments: totalComments,
        total_saves: totalSaves,
        total_shares: totalShares,
        avg_engagement_rate: parseFloat(avgEngagement.toFixed(4)),
      };

      if (existingMetric) {
        await supabaseAdmin.from("performance_metrics").update(metricData).eq("id", existingMetric.id);
      } else {
        await supabaseAdmin.from("performance_metrics").insert(metricData);
      }
    }

    // Update last_synced_at
    await supabaseAdmin
      .from("connected_platforms")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", connection.id);

    return new Response(
      JSON.stringify({ success: true, posts_synced: posts.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Fetch social data error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch social data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function refreshToken(platform: string, connection: any, supabaseAdmin: any): Promise<string | null> {
  if (platform === "youtube" && connection.refresh_token) {
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        refresh_token: connection.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const data = await res.json();

    if (data.access_token) {
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from("connected_platforms")
        .update({
          access_token: data.access_token,
          token_expires_at: expiresAt,
        })
        .eq("id", connection.id);

      return data.access_token;
    }
  }

  if (platform === "instagram" && connection.access_token) {
    // Refresh long-lived token via Facebook Graph API
    const res = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${Deno.env.get("META_APP_ID") || "1561445408473371"}&client_secret=${Deno.env.get("META_APP_SECRET")}&fb_exchange_token=${connection.access_token}`
    );
    const data = await res.json();

    if (data.access_token) {
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from("connected_platforms")
        .update({
          access_token: data.access_token,
          token_expires_at: expiresAt,
        })
        .eq("id", connection.id);

      return data.access_token;
    }
  }

  return null;
}

async function fetchInstagramPosts(pageAccessToken: string, igBusinessAccountId: string): Promise<any[]> {
  // Fetch last 30 media posts using Instagram Graph API (via Facebook Graph API)
  const mediaRes = await fetch(
    `https://graph.facebook.com/v18.0/${igBusinessAccountId}/media?fields=id,caption,timestamp,media_type,like_count,comments_count,permalink&limit=30&access_token=${pageAccessToken}`
  );
  const mediaData = await mediaRes.json();
  console.log("Instagram media fetch:", JSON.stringify({ count: mediaData.data?.length || 0, error: mediaData.error }));

  if (mediaData.error) {
    throw new Error(mediaData.error.message || "Failed to fetch Instagram media");
  }

  if (!mediaData.data) return [];

  const posts = [];
  for (const media of mediaData.data) {
    try {
      // Fetch insights for each post
      let impressions = 0, reach = 0, saved = 0, shares = 0;
      try {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v18.0/${media.id}/insights?metric=impressions,reach,saved,shares&access_token=${pageAccessToken}`
        );
        const insights = await insightsRes.json();

        if (insights.data) {
          const getMetric = (name: string) => {
            const m = insights.data.find((d: any) => d.name === name);
            return m?.values?.[0]?.value || 0;
          };
          impressions = getMetric("impressions");
          reach = getMetric("reach");
          saved = getMetric("saved");
          shares = getMetric("shares");
        }
      } catch (insightErr) {
        console.warn(`Insights unavailable for ${media.id}:`, insightErr);
      }

      posts.push({
        platform_post_id: media.id,
        caption: media.caption || null,
        caption_length: media.caption?.length || null,
        posted_at: media.timestamp,
        views: impressions,
        likes: media.like_count || 0,
        comments: media.comments_count || 0,
        saves: saved,
        shares: shares,
        hook_text: media.caption?.split("\n")[0]?.substring(0, 100) || null,
      });
    } catch (e) {
      console.error(`Failed to process media ${media.id}:`, e);
    }
  }

  return posts;
}

async function fetchYouTubePosts(accessToken: string): Promise<any[]> {
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&mine=true",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = await channelRes.json();

  if (!channelData.items?.length) return [];

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const playlistData = await playlistRes.json();

  if (!playlistData.items?.length) return [];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentVideos = playlistData.items.filter(
    (item: any) => new Date(item.contentDetails.videoPublishedAt) >= thirtyDaysAgo
  );

  const videoIds = recentVideos.map((v: any) => v.contentDetails.videoId).join(",");
  
  if (!videoIds) return [];

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const videosData = await videosRes.json();

  return (videosData.items || []).map((video: any) => {
    const duration = parseDuration(video.contentDetails.duration);
    return {
      platform_post_id: video.id,
      title: video.snippet.title,
      caption: video.snippet.description?.substring(0, 2000) || null,
      caption_length: video.snippet.description?.length || null,
      posted_at: video.snippet.publishedAt,
      views: parseInt(video.statistics.viewCount || "0"),
      likes: parseInt(video.statistics.likeCount || "0"),
      comments: parseInt(video.statistics.commentCount || "0"),
      saves: 0,
      shares: 0,
      video_duration_seconds: duration,
      hook_text: video.snippet.title?.substring(0, 100) || null,
    };
  });
}

function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 3600) +
    (parseInt(match[2] || "0") * 60) +
    parseInt(match[3] || "0");
}
