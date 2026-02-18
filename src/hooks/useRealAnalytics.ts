import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DemoPost, AnalyticsResult, analyzePosts } from "@/lib/demo-data";

export function useRealAnalytics(period: "7d" | "30d") {
  const { user } = useAuth();
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRealData, setHasRealData] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("posted_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setHasRealData(false);
        setPosts([]);
        setLoading(false);
        return;
      }

      // Map Supabase rows to DemoPost shape for the existing analytics engine
      const mapped: DemoPost[] = data.map((row) => ({
        id: row.id,
        title: row.title || "Untitled",
        platform: mapPlatform(row.platform),
        views: row.views || 0,
        likes: row.likes || 0,
        comments: row.comments || 0,
        saves: row.saves || 0,
        shares: row.shares || 0,
        posted_at: row.posted_at || row.created_at,
        video_duration_seconds: row.video_duration_seconds || 0,
        hook_text: row.hook_text || "",
        caption_length: row.caption_length || 0,
        hashtags: row.hashtags || [],
      }));

      setHasRealData(true);
      setPosts(mapped);
      setLoading(false);
    };

    fetchPosts();
  }, [user]);

  const analytics: AnalyticsResult | null = useMemo(() => {
    if (posts.length === 0) return null;
    return analyzePosts(posts, period === "7d" ? 7 : 30);
  }, [posts, period]);

  return { posts, analytics, loading, hasRealData };
}

function mapPlatform(platform: string): DemoPost["platform"] {
  const lower = platform.toLowerCase();
  if (lower === "youtube" || lower === "youtube shorts") return "YouTube Shorts";
  if (lower === "instagram") return "Instagram";
  if (lower === "tiktok") return "TikTok";
  return "YouTube Shorts";
}
