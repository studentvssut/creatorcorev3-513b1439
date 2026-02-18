import { useState } from "react";
import { PenTool, Sparkles, Copy, Instagram, Youtube, Music2, Lock } from "lucide-react";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeModal } from "@/components/UpgradeModal";

const ScriptEngine = () => {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "youtube" | "tiktok">("instagram");
  const [generated, setGenerated] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { plan, canAccess, isFree } = useFeatureGate();

  const hasScriptAccess = canAccess("limited_scripts");
  const hasUnlimited = canAccess("unlimited_scripts");

  const handleGenerate = () => {
    if (!hasScriptAccess) {
      setUpgradeOpen(true);
      return;
    }
    if (topic.trim()) setGenerated(true);
  };

  const platforms = [
    { id: "instagram" as const, label: "Instagram", icon: Instagram },
    { id: "youtube" as const, label: "YouTube Shorts", icon: Youtube },
    { id: "tiktok" as const, label: "TikTok", icon: Music2 },
  ];

  const mockScript = {
    hook: "\"Did you know 90% of creators are making THIS mistake?\"",
    scenes: [
      { time: "0–2s", action: "Text overlay with bold hook. Quick zoom-in on face or product." },
      { time: "2–5s", action: "Reveal the problem. Show a relatable scenario with text overlay." },
      { time: "5–8s", action: "Introduce the solution. Clean transition, use before/after if applicable." },
      { time: "8–11s", action: "Show proof/results. Use numbers, screenshots, or quick demo." },
      { time: "11–13s", action: "CTA — 'Follow for more tips like this'" },
    ],
    caption:
      "90% of creators don't know this hack 🤯 Here's how I grew 50K followers in 30 days using this one strategy. Save this for later! 🔖",
    cta: "Follow @yourbrand for daily creator tips 🚀",
    hashtags: "#ContentCreator #CreatorTips #GrowOnInstagram #ReelsTrending #ViralContent",
  };

  if (isFree) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <PenTool className="w-6 h-6 text-primary" />
            Script Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered scripts optimized from your performance data
          </p>
        </div>
        <div className="glass-card gradient-border p-8 text-center space-y-4">
          <Lock className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Upgrade to Access Script Engine</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Script Engine is available on Starter and Pro plans. Get AI-generated scripts tailored to your content style.
          </p>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-purple"
          >
            Upgrade Now
          </button>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} reason="Upgrade to access the Script Engine." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <PenTool className="w-6 h-6 text-primary" />
            Script Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered scripts optimized from your performance data
          </p>
        </div>
        {!hasUnlimited && (
          <span className="text-xs text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-lg">
            Limited usage · <button onClick={() => setUpgradeOpen(true)} className="text-primary hover:underline">Upgrade</button>
          </span>
        )}
      </div>

      {/* Input */}
      <div className="glass-card gradient-border p-5 space-y-4 animate-slide-up">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Topic or Idea</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g., 5 productivity apps every creator needs, morning routine vlog, how I gained 10K followers..."
            className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Platform</label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  platform === p.id
                    ? "bg-primary/15 text-primary glow-border"
                    : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <p.icon className="w-4 h-4" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-purple"
        >
          <Sparkles className="w-4 h-4" />
          Generate Script
        </button>
      </div>

      {/* Output */}
      {generated && (
        <div className="space-y-4 animate-slide-up">
          <div className="glass-card gradient-border p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">🪝 Optimized Hook</h3>
              <button className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-neon-cyan font-medium">{mockScript.hook}</p>
          </div>

          <div className="glass-card gradient-border p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">🎬 Scene-by-Scene Script</h3>
            <div className="space-y-2">
              {mockScript.scenes.map((scene, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md flex-shrink-0 h-fit">
                    {scene.time}
                  </span>
                  <p className="text-sm text-foreground">{scene.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="glass-card gradient-border p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">📝 Caption</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mockScript.caption}</p>
            </div>
            <div className="glass-card gradient-border p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">📣 CTA</h3>
              <p className="text-sm text-muted-foreground">{mockScript.cta}</p>
            </div>
            <div className="glass-card gradient-border p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground"># Hashtags</h3>
              <p className="text-sm text-primary">{mockScript.hashtags}</p>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
};

export default ScriptEngine;
