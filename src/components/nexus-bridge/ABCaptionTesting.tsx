import { useState } from "react";
import {
  FlaskConical, Lock, Sparkles, Copy, Save, Trophy, Layers,
  BarChart3, Heart, BookOpen, MousePointerClick, Loader2,
  Brain, History, Ruler, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { UpgradeModal } from "@/components/UpgradeModal";
import { toast } from "sonner";

interface LayerScores {
  hook_score: number;
  emotional_score: number;
  readability_score: number;
  cta_score: number;
  engagement_score: number;
}

interface CaptionVariant {
  variant: string;
  label: string;
  text: string;
  hook_score: number;
  emotional_score: number;
  readability_score: number;
  cta_score: number;
  engagement_score: number;
  strength: string;
  weakness: string;
  ai_analysis: string;
  layer1_scores: LayerScores;
  layer2_scores: LayerScores;
}

interface CaptionResult {
  captions: CaptionVariant[];
  recommended: string;
  recommendation_reason: string;
  has_historical_data: boolean;
  posts_analyzed: number;
}

const TONE_OPTIONS = ["Viral", "Professional", "Emotional", "Storytelling"] as const;

function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  const color =
    value >= 80 ? "bg-accent" : value >= 60 ? "bg-primary" : "bg-destructive/70";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function LayerBreakdown({ layer1, layer2, label1, label2, icon1: Icon1, icon2: Icon2 }: {
  layer1: LayerScores;
  layer2: LayerScores;
  label1: string;
  label2: string;
  icon1: any;
  icon2: any;
}) {
  return (
    <div className="space-y-2 text-[10px]">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon1 className="w-3 h-3" />
        <span className="font-medium">{label1}</span>
        <div className="flex gap-2 ml-auto">
          <MiniScore label="Hook" value={layer1.hook_score} />
          <MiniScore label="Emo" value={layer1.emotional_score} />
          <MiniScore label="Read" value={layer1.readability_score} />
          <MiniScore label="CTA" value={layer1.cta_score} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon2 className="w-3 h-3" />
        <span className="font-medium">{label2}</span>
        <div className="flex gap-2 ml-auto">
          <MiniScore label="Hook" value={layer2.hook_score} />
          <MiniScore label="Emo" value={layer2.emotional_score} />
          <MiniScore label="Read" value={layer2.readability_score} />
          <MiniScore label="CTA" value={layer2.cta_score} />
        </div>
      </div>
    </div>
  );
}

export function ABCaptionTesting() {
  const { isPro } = useFeatureGate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<string>("Viral");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

  const toggleLayer = (variant: string) =>
    setExpandedLayers((prev) => ({ ...prev, [variant]: !prev[variant] }));

  const generate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic or video context");
      return;
    }
    setLoading(true);
    setResult(null);
    setExpandedLayers({});
    try {
      const { data, error } = await supabase.functions.invoke("caption-test", {
        body: { topic: topic.slice(0, 500), keywords: keywords.slice(0, 200), audience: audience.slice(0, 200), tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as CaptionResult);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate captions");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Caption copied!");
  };

  // Locked state for non-Pro
  if (!isPro) {
    return (
      <>
        <div
          className="glass-card gradient-border p-5 space-y-3 animate-slide-up relative cursor-pointer"
          onClick={() => setUpgradeOpen(true)}
          title="Upgrade to Pro to unlock A/B Caption Testing"
        >
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
            <Lock className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm font-bold text-foreground">Upgrade to Pro</p>
            <p className="text-xs text-muted-foreground text-center max-w-[220px] mt-1">
              Multi-layer AI caption engine with predicted engagement scoring.
            </p>
          </div>
          <div className="blur-sm pointer-events-none select-none space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              A/B Caption Testing
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">PRO</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {["Caption A", "Caption B", "Caption C"].map((c) => (
                <div key={c} className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground">{c}</div>
              ))}
            </div>
          </div>
        </div>
        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          reason="Upgrade to Pro to unlock A/B Caption Testing and AI-powered engagement predictions."
        />
      </>
    );
  }

  return (
    <div className="glass-card gradient-border p-5 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-primary" />
          A/B Caption Testing
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary">PRO</span>
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Layers className="w-3 h-3" />
          3-Layer Engine
        </div>
      </div>

      {/* Layer badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-[10px] text-muted-foreground">
          <Ruler className="w-3 h-3" />
          Rule-Based
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-[10px] text-muted-foreground">
          <Brain className="w-3 h-3" />
          AI Semantic
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40 text-[10px] text-muted-foreground">
          <History className="w-3 h-3" />
          Historical
        </div>
      </div>

      {/* Input form */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Post topic or video context *</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={500}
            placeholder="E.g. 5 morning habits that changed my life..."
            className="w-full h-20 px-3 py-2 rounded-lg bg-secondary/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <p className="text-[10px] text-muted-foreground text-right">{topic.length}/500</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Keywords (optional)</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              maxLength={200}
              placeholder="productivity, morning routine"
              className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Target audience (optional)</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              maxLength={200}
              placeholder="Gen-Z entrepreneurs"
              className="w-full px-3 py-2 rounded-lg bg-secondary/60 border border-border/50 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tone preference</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tone === t
                    ? "bg-primary/20 text-primary glow-border"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all glow-purple"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing across 3 layers…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate & Analyze Captions
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 pt-2">
          {/* Historical data banner */}
          {result.has_historical_data && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent">
              <History className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Scores personalized using your top {result.posts_analyzed} performing posts</span>
            </div>
          )}
          {!result.has_historical_data && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/30 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Connect your platforms and post more to unlock personalized scoring (Layer 3)</span>
            </div>
          )}

          {/* Comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {result.captions.map((c) => {
              const isRecommended = c.variant === result.recommended;
              const isExpanded = expandedLayers[c.variant];
              return (
                <div
                  key={c.variant}
                  className={`relative rounded-xl border p-4 space-y-3 transition-all ${
                    isRecommended
                      ? "border-primary/60 bg-primary/5 glow-border"
                      : "border-border/50 bg-secondary/20"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-2.5 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                      <Trophy className="w-3 h-3" />
                      Recommended
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-foreground">Caption {c.variant}</span>
                    <span className="text-[10px] text-muted-foreground">{c.label}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.text}</p>

                  {/* Merged scores */}
                  <div className="space-y-2 pt-1">
                    <ScoreBar label="Hook" value={c.hook_score} icon={MousePointerClick} />
                    <ScoreBar label="Emotion" value={c.emotional_score} icon={Heart} />
                    <ScoreBar label="Readability" value={c.readability_score} icon={BookOpen} />
                    <ScoreBar label="CTA" value={c.cta_score} icon={BarChart3} />
                  </div>

                  {/* Engagement score */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold text-primary">{c.engagement_score}%</p>
                      <p className="text-[10px] text-muted-foreground">Predicted Engagement</p>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {c.ai_analysis && (
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-2">
                      {c.ai_analysis}
                    </p>
                  )}

                  {/* Strength/Weakness */}
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">✓ {c.strength}</span>
                    <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">✗ {c.weakness}</span>
                  </div>

                  {/* Layer breakdown toggle */}
                  <button
                    onClick={() => toggleLayer(c.variant)}
                    className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Layers className="w-3 h-3" />
                    {isExpanded ? "Hide" : "Show"} Layer Breakdown
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && c.layer1_scores && c.layer2_scores && (
                    <div className="rounded-lg bg-secondary/30 p-3 space-y-3 border border-border/20">
                      <LayerBreakdown
                        layer1={c.layer1_scores}
                        layer2={c.layer2_scores}
                        label1="L1 Rules"
                        label2="L2 AI"
                        icon1={Ruler}
                        icon2={Brain}
                      />
                      <p className="text-[9px] text-muted-foreground text-center">
                        Final = 40% Rule + 60% AI + Historical bonus
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => copyCaption(c.text)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={() => toast.info("Saved to drafts")}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="rounded-xl bg-primary/10 border border-primary/30 p-4 flex items-start gap-3">
            <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Recommended: Caption {result.recommended}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{result.recommendation_reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
