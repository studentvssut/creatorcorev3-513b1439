import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get user from token
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { file_url, file_type, caption, platforms } = await req.json();

    if (!file_url || !platforms || platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: "file_url and platforms are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const platform of platforms) {
      try {
        // Get the user's access token for this platform
        const { data: conn, error: connErr } = await adminClient
          .from("connected_platforms")
          .select("access_token, platform_user_id")
          .eq("user_id", user.id)
          .eq("platform", platform)
          .eq("is_connected", true)
          .single();

        if (connErr || !conn?.access_token) {
          results[platform] = { success: false, error: `Not connected to ${platform}` };
          continue;
        }

        if (platform === "instagram") {
          const result = await publishToInstagram(
            conn.access_token,
            conn.platform_user_id,
            file_url,
            file_type,
            caption
          );
          results[platform] = result;
        } else if (platform === "youtube") {
          if (file_type !== "video") {
            results[platform] = { success: false, error: "YouTube only supports video uploads" };
            continue;
          }
          const result = await publishToYouTube(
            conn.access_token,
            file_url,
            caption
          );
          results[platform] = result;
        } else {
          results[platform] = { success: false, error: `${platform} not supported yet` };
        }
      } catch (err: any) {
        results[platform] = { success: false, error: err.message };
      }
    }

    const allSuccess = Object.values(results).every((r) => r.success);
    const anySuccess = Object.values(results).some((r) => r.success);

    return new Response(
      JSON.stringify({ results, success: anySuccess }),
      {
        status: allSuccess ? 200 : anySuccess ? 207 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("publish-media error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function publishToInstagram(
  accessToken: string,
  igUserId: string | null,
  fileUrl: string,
  fileType: string,
  caption: string
): Promise<{ success: boolean; error?: string }> {
  if (!igUserId) {
    return { success: false, error: "Instagram user ID not found" };
  }

  try {
    // Step 1: Create media container
    const isVideo = fileType === "video";
    const containerParams: Record<string, string> = {
      access_token: accessToken,
      caption: caption || "",
    };

    if (isVideo) {
      containerParams.media_type = "REELS";
      containerParams.video_url = fileUrl;
    } else {
      containerParams.image_url = fileUrl;
    }

    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(containerParams),
      }
    );
    const container = await containerRes.json();
    console.log("Instagram container response:", JSON.stringify(container));

    if (container.error) {
      return { success: false, error: container.error.message };
    }

    const containerId = container.id;

    // Step 2: For video, wait for processing
    if (isVideo) {
      let status = "IN_PROGRESS";
      let attempts = 0;
      while (status === "IN_PROGRESS" && attempts < 30) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(
          `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
        );
        const statusData = await statusRes.json();
        status = statusData.status_code || "FINISHED";
        attempts++;
      }
      if (status === "ERROR") {
        return { success: false, error: "Video processing failed on Instagram" };
      }
    }

    // Step 3: Publish the container
    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();
    console.log("Instagram publish response:", JSON.stringify(publishData));

    if (publishData.error) {
      return { success: false, error: publishData.error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function publishToYouTube(
  accessToken: string,
  fileUrl: string,
  caption: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Download the video file
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return { success: false, error: "Failed to download video file" };
    }
    const fileBlob = await fileRes.blob();
    const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());

    const title = caption?.slice(0, 100) || "Uploaded via CreatorCore";
    const description = caption || "";

    // Step 1: Initiate resumable upload
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Length": String(fileBytes.length),
          "X-Upload-Content-Type": fileBlob.type || "video/mp4",
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            categoryId: "22", // People & Blogs
          },
          status: {
            privacyStatus: "public",
            selfDeclaredMadeForKids: false,
          },
        }),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.text();
      console.error("YouTube init error:", err);
      return { success: false, error: `YouTube upload init failed: ${initRes.status}` };
    }

    const uploadUrl = initRes.headers.get("Location");
    if (!uploadUrl) {
      return { success: false, error: "No upload URL returned from YouTube" };
    }

    // Step 2: Upload the video
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": String(fileBytes.length),
        "Content-Type": fileBlob.type || "video/mp4",
      },
      body: fileBytes,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("YouTube upload error:", err);
      return { success: false, error: `YouTube upload failed: ${uploadRes.status}` };
    }

    const videoData = await uploadRes.json();
    console.log("YouTube upload success:", JSON.stringify({ id: videoData.id }));

    return { success: true };
  } catch (err: any) {
    console.error("YouTube publish error:", err);
    return { success: false, error: err.message };
  }
}
