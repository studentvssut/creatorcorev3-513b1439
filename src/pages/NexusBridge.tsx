import { useState, useRef, useCallback, useEffect } from "react";
import { Share2, Upload, Instagram, Youtube, Music2, Send, Clock, Sparkles, X, Image, Film, Loader2, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectedPlatforms } from "@/hooks/useConnectedPlatforms";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ABCaptionTesting } from "@/components/nexus-bridge/ABCaptionTesting";
import { toast } from "sonner";

const NexusBridge = () => {
  const { user } = useAuth();
  const { platforms: connectedPlatforms } = useConnectedPlatforms();
  const { canAccess, isPro, isFree, plan } = useFeatureGate();
  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    instagram: false,
    youtube: false,
    tiktok: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPublish = canAccess("nexus_publishing");

  useEffect(() => {
    const connected: Record<string, boolean> = { instagram: false, youtube: false, tiktok: false };
    connectedPlatforms.forEach((p) => {
      if (p.is_connected && p.platform in connected) {
        connected[p.platform] = true;
      }
    });
    setSelectedPlatforms(connected);
  }, [connectedPlatforms]);

  const togglePlatform = (key: string) => {
    const isConnected = connectedPlatforms.some((p) => p.platform === key && p.is_connected);
    if (!isConnected) {
      toast.error(`Please connect ${key} first from Connect Platforms page`);
      return;
    }
    setSelectedPlatforms((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    const maxSize = 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("File too large. Max 100MB.");
      return;
    }
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Only image and video files are supported.");
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const removeFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handlePublish = async () => {
    if (!canPublish) {
      setUpgradeOpen(true);
      return;
    }
    if (!user || !file) {
      toast.error("Please select a file to upload");
      return;
    }

    const activePlatforms = Object.entries(selectedPlatforms)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (activePlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setPublishing(true);

    try {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      const fileUrl = urlData.publicUrl;
      setUploading(false);

      const fileType = file.type.startsWith("video/") ? "video" : "image";
      const { error: insertError } = await supabase
        .from("media_uploads" as any)
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: fileUrl,
          file_type: fileType,
          file_size_bytes: file.size,
          caption,
          status: "publishing",
          published_platforms: activePlatforms,
        });

      if (insertError) throw insertError;

      const { error: publishError, data: publishData } = await supabase.functions.invoke(
        "publish-media",
        {
          body: {
            file_url: fileUrl,
            file_type: fileType,
            caption,
            platforms: activePlatforms,
          },
        }
      );

      if (publishError) throw publishError;
      if (publishData?.error) throw new Error(publishData.error);

      toast.success("Media published successfully!");
      removeFile();
      setCaption("");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish media");
    } finally {
      setUploading(false);
      setPublishing(false);
    }
  };

  const platformList = [
    { id: "instagram", label: "Instagram", icon: Instagram },
    { id: "youtube", label: "YouTube Shorts", icon: Youtube },
    { id: "tiktok", label: "TikTok", icon: Music2 },
  ];

  const isConnected = (platformId: string) =>
    connectedPlatforms.some((p) => p.platform === platformId && p.is_connected);

  // Free & Starter: show locked state for publishing
  if (!canPublish) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-primary" />
            Nexus Bridge
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload and publish content across all your platforms
          </p>
        </div>
        <div className="glass-card gradient-border p-8 text-center space-y-4">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Pro Feature</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Nexus Bridge publishing is available exclusively on the Pro plan. Upgrade to publish content directly across all your connected platforms.
          </p>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-purple"
          >
            Upgrade to Pro
          </button>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="Upgrade to Pro to publish with Nexus Bridge." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Share2 className="w-6 h-6 text-primary" />
          Nexus Bridge
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and publish content across all your platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up">
            <h3 className="text-sm font-semibold text-foreground">Media Upload</h3>

            {file && preview ? (
              <div className="relative rounded-xl overflow-hidden bg-secondary/30">
                <button
                  onClick={removeFile}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-background/80 text-foreground hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {file.type.startsWith("video/") ? (
                  <video src={preview} controls className="w-full max-h-[400px] object-contain" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain" />
                )}
                <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 text-xs text-muted-foreground">
                  {file.type.startsWith("video/") ? <Film className="w-3.5 h-3.5" /> : <Image className="w-3.5 h-3.5" />}
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-border/60 rounded-xl p-10 text-center hover:border-primary/40 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">Drop your video or image here</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, JPG, PNG — Max 100MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>

          <div className="glass-card gradient-border p-5 space-y-3 animate-slide-up">
            <h3 className="text-sm font-semibold text-foreground">Caption</h3>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write your caption here..."
              className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-muted-foreground">{caption.length} characters</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up">
            <h3 className="text-sm font-semibold text-foreground">Platforms</h3>
            <div className="space-y-2">
              {platformList.map((p) => {
                const connected = isConnected(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedPlatforms[p.id]
                        ? "bg-primary/15 text-primary glow-border"
                        : "bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    } ${!connected ? "opacity-50" : ""}`}
                  >
                    <p.icon className="w-4 h-4" />
                    {p.label}
                    {connected ? (
                      <div className="flex items-center gap-1 ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        <div
                          className={`w-8 h-5 rounded-full transition-colors flex items-center ${
                            selectedPlatforms[p.id] ? "bg-primary justify-end" : "bg-secondary justify-start"
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-foreground mx-0.5" />
                        </div>
                      </div>
                    ) : (
                      <span className="ml-auto text-xs text-muted-foreground">Not connected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Scheduling — Pro only */}
          <div
            className="glass-card gradient-border p-5 space-y-3 animate-slide-up relative group cursor-pointer"
            onClick={() => { if (!isPro) setUpgradeOpen(true); }}
            title={!isPro ? "Upgrade to Pro to unlock scheduling and AI caption optimization" : undefined}
          >
            {!isPro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
                <Lock className="w-8 h-8 text-primary mb-2" />
                <p className="text-sm font-bold text-foreground">Upgrade to Pro</p>
                <p className="text-xs text-muted-foreground text-center max-w-[200px] mt-1">
                  Schedule posts and generate optimized captions based on your analytics.
                </p>
              </div>
            )}
            <div className={!isPro ? "blur-sm pointer-events-none select-none" : ""}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Post
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">PRO</span>
              </h3>
              <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground mt-2">Best time: Today at 7:30 PM</div>
            </div>
          </div>

          {/* AI Optimized Captions — Pro only */}
          <div
            className="glass-card gradient-border p-5 space-y-3 animate-slide-up relative group cursor-pointer"
            onClick={() => { if (!isPro) setUpgradeOpen(true); }}
            title={!isPro ? "Upgrade to Pro to unlock scheduling and AI caption optimization" : undefined}
          >
            {!isPro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
                <Lock className="w-6 h-6 text-primary mb-1" />
                <p className="text-xs font-semibold text-foreground">Pro Only</p>
              </div>
            )}
            <div className={!isPro ? "blur-sm pointer-events-none select-none" : ""}>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Optimized Captions
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">PRO</span>
              </h3>
              <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground mt-2">Platform-specific variations</div>
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || !file}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all glow-purple"
          >
            {publishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? "Uploading…" : "Publishing…"}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* A/B Caption Testing — full width below */}
      <ABCaptionTesting />

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default NexusBridge;
