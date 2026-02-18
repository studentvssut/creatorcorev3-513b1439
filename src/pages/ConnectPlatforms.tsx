import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Link2,
  Instagram,
  Youtube,
  Music2,
  CheckCircle2,
  Loader2,
  Unplug,
  RefreshCw,
  Clock,
  AlertCircle,
  Twitter,
  Facebook,
  Linkedin,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface PlatformConnection {
  id: string;
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
  last_synced_at: string | null;
}

const platformMeta = [
  {
    id: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "from-[hsl(330,85%,60%)] to-[hsl(30,90%,55%)]",
    description:
      "Connect your Instagram creator account to track Reels & post performance.",
    oauthSupported: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: Youtube,
    color: "from-[hsl(0,70%,50%)] to-[hsl(0,70%,40%)]",
    description:
      "Link your YouTube channel to analyze Shorts, views & engagement.",
    oauthSupported: true,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: Music2,
    color: "from-[hsl(175,85%,55%)] to-[hsl(330,85%,60%)]",
    description:
      "Connect TikTok to track video performance and trending insights.",
    oauthSupported: false,
  },
  {
    id: "twitter",
    label: "Twitter / X",
    icon: Twitter,
    color: "from-[hsl(200,90%,50%)] to-[hsl(210,80%,40%)]",
    description:
      "Track tweets, impressions & follower growth on X.",
    oauthSupported: false,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "from-[hsl(220,70%,50%)] to-[hsl(220,70%,40%)]",
    description:
      "Track page posts, reach & engagement on Facebook.",
    oauthSupported: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "from-[hsl(210,80%,45%)] to-[hsl(210,70%,35%)]",
    description:
      "Track professional content performance on LinkedIn.",
    oauthSupported: false,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: Send,
    color: "from-[hsl(200,80%,55%)] to-[hsl(200,70%,40%)]",
    description:
      "Connect Telegram to manage channels and track engagement.",
    oauthSupported: false,
  },
];

const ConnectPlatforms = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  

  useEffect(() => {
    if (user) fetchConnections();
  }, [user]);

  // Handle OAuth redirect results
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      toast.success(
        `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully! Fetching your data…`
      );
      setSearchParams({});
      fetchConnections();
    }
    if (error) {
      toast.error(decodeURIComponent(error));
      setSearchParams({});
    }
  }, [searchParams]);

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from("connected_platforms_safe" as any)
      .select("id, platform, platform_username, is_connected, last_synced_at");

    if (!error && data) setConnections(data as unknown as PlatformConnection[]);
    setLoading(false);
  };

  const handleConnect = useCallback(
    async (platformId: string) => {
      if (!user || connecting) return;

      setConnecting(platformId);

      try {
        const res = await supabase.functions.invoke("oauth-init", {
          body: { platform: platformId },
        });

        if (res.error) throw new Error(res.error.message);

        const { auth_url, error } = res.data;
        if (error) throw new Error(error);

        // Redirect in the same window — works on all browsers including mobile
        window.location.href = auth_url;
      } catch (err: any) {
        toast.error(err.message || "Failed to start connection");
        setConnecting(null);
      }
    },
    [user, connecting]
  );

  const handleDisconnect = async (platformId: string) => {
    const existing = connections.find((c) => c.platform === platformId && c.is_connected);
    if (!existing) return;

    setConnecting(platformId);
    try {
      const { error } = await supabase.rpc("disconnect_platform" as any, {
        p_platform_id: existing.id,
      });
      if (error) throw error;

      toast.success("Platform disconnected");
      await fetchConnections();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleRefresh = async (platformId: string) => {
    if (!user) return;
    setSyncing(platformId);

    try {
      const res = await supabase.functions.invoke("fetch-social-data", {
        body: { platform: platformId },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast.success(
        `Synced ${res.data.posts_synced} posts from ${platformId}`
      );
      await fetchConnections();
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh data");
    } finally {
      setSyncing(null);
    }
  };

  const isConnected = (platformId: string) =>
    connections.some((c) => c.platform === platformId && c.is_connected);

  const getConnection = (platformId: string) =>
    connections.find((c) => c.platform === platformId && c.is_connected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Link2 className="w-6 h-6 text-primary" />
          Connect Platforms
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Link your social media accounts to unlock real insights and data
        </p>
      </div>


      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {platformMeta.map((platform) => {
            const connected = isConnected(platform.id);
            const conn = getConnection(platform.id);
            const isLoading = connecting === platform.id;
            const isSyncing = syncing === platform.id;

            return (
              <div
                key={platform.id}
                className={`glass-card gradient-border p-6 space-y-4 animate-slide-up transition-all ${
                  connected ? "ring-1 ring-accent/30" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}
                  >
                    <platform.icon className="w-6 h-6 text-foreground" />
                  </div>
                  {connected && (
                    <div className="flex items-center gap-1.5 text-accent text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      Connected
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {platform.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                {connected && conn && (
                  <div className="space-y-2">
                    {conn.platform_username && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm">
                        <span className="text-foreground font-medium">
                          {conn.platform_username}
                        </span>
                      </div>
                    )}
                    {conn.last_synced_at && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        Last synced{" "}
                        {formatDistanceToNow(new Date(conn.last_synced_at), {
                          addSuffix: true,
                        })}
                      </div>
                    )}
                  </div>
                )}

                {connected ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRefresh(platform.id)}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/60 text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {isSyncing ? "Syncing…" : "Refresh"}
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unplug className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ) : !platform.oauthSupported ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/40 text-muted-foreground text-sm font-medium cursor-not-allowed"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all glow-purple"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Connect {platform.label}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              OAuth Setup Required
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              To connect Instagram, add your <strong>META_APP_ID</strong> and{" "}
              <strong>META_APP_SECRET</strong> from the Meta Developer Console.
              For YouTube, add your <strong>GOOGLE_CLIENT_ID</strong> and{" "}
              <strong>GOOGLE_CLIENT_SECRET</strong> from Google Cloud Console.
              Set the OAuth callback URL in your developer console to your
              backend's <code className="text-primary text-[11px] bg-secondary/50 px-1.5 py-0.5 rounded">oauth-callback</code> function endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPlatforms;
