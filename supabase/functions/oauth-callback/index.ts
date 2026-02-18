import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let code: string | null;
    let state: string | null;
    let error: string | null;

    // Support both GET (legacy redirect) and POST (new frontend-forwarded flow)
    if (req.method === "POST") {
      const body = await req.json();
      code = body.code || null;
      state = body.state || null;
      error = body.error || null;
    } else {
      const url = new URL(req.url);
      code = url.searchParams.get("code");
      state = url.searchParams.get("state");
      error = url.searchParams.get("error");
    }

    if (error) {
      return redirectWithError(`OAuth error: ${error}`);
    }

    if (!code || !state) {
      return redirectWithError("Missing code or state parameter");
    }

    // State format: platform:user_id
    const [platform, userId] = state.split(":");
    if (!platform || !userId) {
      return redirectWithError("Invalid state parameter");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let tokenData: any;

    if (platform === "instagram") {
      tokenData = await handleInstagramCallback(code);
    } else if (platform === "youtube") {
      tokenData = await handleYouTubeCallback(code);
    } else {
      return redirectWithError(`Unsupported platform: ${platform}`);
    }

    // Store tokens in connected_platforms
    const { data: existing } = await supabaseAdmin
      .from("connected_platforms")
      .select("id")
      .eq("user_id", userId)
      .eq("platform", platform)
      .maybeSingle();

    const platformData = {
      user_id: userId,
      platform,
      is_connected: true,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: tokenData.expires_at || null,
      platform_user_id: tokenData.platform_user_id || null,
      platform_username: tokenData.platform_username || null,
      page_access_token: tokenData.page_access_token || null,
      metadata: tokenData.metadata || null,
      connected_at: new Date().toISOString(),
      last_synced_at: null,
    };

    if (existing) {
      await supabaseAdmin
        .from("connected_platforms")
        .update(platformData)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("connected_platforms").insert(platformData);
    }

    // Trigger initial data fetch
    const fetchUrl = `${SUPABASE_URL}/functions/v1/fetch-social-data`;
    await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ user_id: userId, platform }),
    });

    // For POST requests, return JSON; for GET, redirect
    const appUrl = Deno.env.get("APP_URL") || "https://app.creatorcorev3.com";
    if (req.method === "POST") {
      return new Response(
        JSON.stringify({ success: true, platform }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/dashboard/connect-platforms?connected=${platform}`,
      },
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    return redirectWithError("Authentication failed. Please try again.");
  }
});

function redirectWithError(message: string): Response {
  const appUrl = Deno.env.get("APP_URL") || "https://app.creatorcorev3.com";
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${appUrl}/dashboard/connect-platforms?error=${encodeURIComponent(message)}`,
    },
  });
}

async function handleInstagramCallback(code: string) {
  const META_APP_ID = Deno.env.get("META_APP_ID") || "1561445408473371";
  const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
  const redirectUri = `${SUPABASE_URL}/functions/v1/oauth-callback`;

  // Step 1: Exchange code for short-lived user access token via Facebook Graph API
  const tokenRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&client_secret=${META_APP_SECRET}` +
    `&code=${code}`
  );
  const shortToken = await tokenRes.json();
  console.log("Short-lived token response:", JSON.stringify({ has_token: !!shortToken.access_token, error: shortToken.error }));

  if (shortToken.error) {
    throw new Error(shortToken.error.message || JSON.stringify(shortToken.error));
  }

  const shortAccessToken = shortToken.access_token;

  // Step 2: Exchange for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${META_APP_ID}` +
    `&client_secret=${META_APP_SECRET}` +
    `&fb_exchange_token=${shortAccessToken}`
  );
  const longToken = await longRes.json();
  console.log("Long-lived token response:", JSON.stringify({ has_token: !!longToken.access_token, expires_in: longToken.expires_in }));

  const userAccessToken = longToken.access_token || shortAccessToken;
  const expiresAt = longToken.expires_in
    ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
    : null;

  // Step 3: Fetch user's Facebook Pages
  const pagesRes = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`
  );
  const pagesData = await pagesRes.json();
  console.log("Facebook Pages response:", JSON.stringify({ count: pagesData.data?.length || 0 }));

  if (!pagesData.data || pagesData.data.length === 0) {
    throw new Error("No Facebook Pages found. Please make sure your Instagram account is linked to a Facebook Page.");
  }

  // Step 4: Find the page with an Instagram Business Account
  let igBusinessAccountId: string | null = null;
  let pageAccessToken: string | null = null;
  let igUsername: string | null = null;
  let selectedPage: any = null;

  for (const page of pagesData.data) {
    if (page.instagram_business_account) {
      igBusinessAccountId = page.instagram_business_account.id;
      pageAccessToken = page.access_token;
      selectedPage = page;
      break;
    }
  }

  if (!igBusinessAccountId || !pageAccessToken) {
    throw new Error("No Instagram Business Account found linked to your Facebook Pages. Please connect your Instagram account as a Business or Creator account to a Facebook Page.");
  }

  // Step 5: Fetch Instagram Business Account profile
  try {
    const profileRes = await fetch(
      `https://graph.facebook.com/v18.0/${igBusinessAccountId}?fields=id,username,name,profile_picture_url,followers_count,media_count&access_token=${pageAccessToken}`
    );
    const profile = await profileRes.json();
    console.log("Instagram Business profile:", JSON.stringify({ id: profile.id, username: profile.username }));
    igUsername = profile.username ? `@${profile.username}` : null;
  } catch (profileErr) {
    console.error("Failed to fetch Instagram Business profile:", profileErr);
  }

  // Verify token validity
  try {
    const debugRes = await fetch(
      `https://graph.facebook.com/v18.0/debug_token?input_token=${pageAccessToken}&access_token=${META_APP_ID}|${META_APP_SECRET}`
    );
    const debugData = await debugRes.json();
    console.log("Token debug:", JSON.stringify({ is_valid: debugData.data?.is_valid, scopes: debugData.data?.scopes }));
    if (debugData.data && !debugData.data.is_valid) {
      throw new Error("Access token is not valid");
    }
  } catch (debugErr) {
    console.warn("Token debug check failed (non-fatal):", debugErr);
  }

  return {
    access_token: userAccessToken,
    refresh_token: null,
    expires_at: expiresAt,
    platform_user_id: igBusinessAccountId,
    platform_username: igUsername,
    page_access_token: pageAccessToken,
    metadata: {
      facebook_page_id: selectedPage.id,
      facebook_page_name: selectedPage.name,
      ig_business_account_id: igBusinessAccountId,
    },
  };
}

async function handleYouTubeCallback(code: string) {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const redirectUri = `${SUPABASE_URL}/functions/v1/oauth-callback`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    throw new Error(tokenData.error_description || tokenData.error);
  }

  // Get channel info
  const channelRes = await fetch(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  );
  const channelData = await channelRes.json();
  
  const channel = channelData.items?.[0];

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_at: expiresAt,
    platform_user_id: channel?.id || null,
    platform_username: channel?.snippet?.title || null,
    page_access_token: null,
    metadata: null,
  };
}
