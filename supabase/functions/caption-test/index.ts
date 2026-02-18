import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "support@creatorcorev3.com";

// ── Layer 1: Rule-Based Scoring ──────────────────────────────────────

const EMOTIONAL_KEYWORDS = [
  "love", "hate", "amazing", "incredible", "shocking", "secret", "truth",
  "powerful", "life-changing", "transform", "inspire", "fear", "dream",
  "believe", "never", "always", "unbelievable", "mind-blowing", "obsessed",
  "crying", "broke", "struggle", "beautiful", "grateful", "angry", "wow",
  "emotional", "heartbreak", "motivation", "grind", "hustle",
];

const CTA_PHRASES = [
  "follow", "subscribe", "like", "comment", "share", "save this",
  "link in bio", "tap", "click", "dm me", "check out", "try this",
  "don't miss", "watch till", "swipe", "turn on", "join", "sign up",
  "grab", "get yours", "start now", "learn more", "drop a",
];

const HOOK_PATTERNS = [
  /^(stop|wait|don't|never|nobody|this is|here's|you need|i (was|did|found|tried))/i,
  /^[A-Z][^.!?]{0,50}\?/,  // starts with a question
  /^\d+\s/,                  // starts with a number
  /^"[^"]+"/,                // starts with a quote
  /^(pov|breaking|exposed|leaked|warning)/i,
];

function ruleBasedScore(caption: string) {
  const first125 = caption.slice(0, 125).toLowerCase();
  const lowerCaption = caption.toLowerCase();
  const words = lowerCaption.split(/\s+/);
  const wordCount = words.length;

  // Hook score
  let hookScore = 30;
  for (const pattern of HOOK_PATTERNS) {
    if (pattern.test(caption)) { hookScore += 20; break; }
  }
  if (first125.includes("?")) hookScore += 10;
  if (first125.includes("!")) hookScore += 5;
  if (/\d/.test(first125)) hookScore += 10;
  if (first125.length > 0 && first125.length <= 80) hookScore += 10;
  hookScore = Math.min(hookScore, 100);

  // Emotional score
  let emotionalHits = 0;
  for (const kw of EMOTIONAL_KEYWORDS) {
    if (lowerCaption.includes(kw)) emotionalHits++;
  }
  const emotionalScore = Math.min(30 + emotionalHits * 12, 100);

  // Readability score — penalize very short or very long
  let readabilityScore = 70;
  if (wordCount < 10) readabilityScore -= 15;
  if (wordCount > 60) readabilityScore -= 20;
  if (wordCount >= 15 && wordCount <= 40) readabilityScore += 15;
  const avgWordLen = words.reduce((s, w) => s + w.length, 0) / (wordCount || 1);
  if (avgWordLen > 7) readabilityScore -= 10;
  readabilityScore = Math.max(20, Math.min(readabilityScore, 100));

  // CTA score
  let ctaHits = 0;
  for (const phrase of CTA_PHRASES) {
    if (lowerCaption.includes(phrase)) ctaHits++;
  }
  const ctaScore = Math.min(20 + ctaHits * 18, 100);

  // Composite
  const engagementScore = Math.round(
    hookScore * 0.30 + emotionalScore * 0.25 + readabilityScore * 0.20 + ctaScore * 0.25
  );

  return { hook_score: hookScore, emotional_score: emotionalScore, readability_score: readabilityScore, cta_score: ctaScore, engagement_score: engagementScore };
}

// ── Layer 3: Historical Learning helpers ─────────────────────────────

interface TopPost {
  caption: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  shares: number | null;
  saves: number | null;
  hook_text: string | null;
  caption_length: number | null;
}

function buildHistoricalContext(posts: TopPost[]) {
  if (!posts || posts.length === 0) return { summary: null, weightAdjust: {} };

  const avgLen = posts.reduce((s, p) => s + (p.caption_length || (p.caption?.length ?? 0)), 0) / posts.length;
  const avgEngagement = posts.reduce((s, p) => {
    const views = p.views || 1;
    return s + ((p.likes || 0) + (p.comments || 0)) / views;
  }, 0) / posts.length;

  // Detect patterns
  const hookStarts = posts.filter(p => {
    const h = (p.hook_text || p.caption || "").slice(0, 125);
    return HOOK_PATTERNS.some(pat => pat.test(h));
  }).length;
  const hookRate = hookStarts / posts.length;

  const emotionalPosts = posts.filter(p => {
    const c = (p.caption || "").toLowerCase();
    return EMOTIONAL_KEYWORDS.some(kw => c.includes(kw));
  }).length;
  const emotionalRate = emotionalPosts / posts.length;

  const ctaPosts = posts.filter(p => {
    const c = (p.caption || "").toLowerCase();
    return CTA_PHRASES.some(ph => c.includes(ph));
  }).length;
  const ctaRate = ctaPosts / posts.length;

  // Dynamic weight adjustments based on what correlates with the user's top posts
  const weightAdjust: Record<string, number> = {};
  if (hookRate > 0.6) weightAdjust.hook_bonus = 8;
  if (emotionalRate > 0.5) weightAdjust.emotional_bonus = 8;
  if (ctaRate > 0.5) weightAdjust.cta_bonus = 8;

  const summary = `User's top ${posts.length} posts: avg caption length ${Math.round(avgLen)} chars, avg engagement rate ${(avgEngagement * 100).toFixed(1)}%. Hook pattern rate: ${(hookRate * 100).toFixed(0)}%, emotional keyword rate: ${(emotionalRate * 100).toFixed(0)}%, CTA phrase rate: ${(ctaRate * 100).toFixed(0)}%. Preferred caption length ~${Math.round(avgLen)} chars.`;

  return { summary, weightAdjust };
}

// ── Merge scores across layers ───────────────────────────────────────

function mergeScores(
  ruleScores: ReturnType<typeof ruleBasedScore>,
  aiScores: { hook_score: number; emotional_score: number; readability_score: number; cta_score: number; engagement_score: number },
  weightAdjust: Record<string, number>
) {
  // 40% rule-based, 60% AI, plus historical bonuses
  const merge = (ruleVal: number, aiVal: number, bonus = 0) =>
    Math.min(100, Math.round(ruleVal * 0.4 + aiVal * 0.6 + bonus));

  const hook_score = merge(ruleScores.hook_score, aiScores.hook_score, weightAdjust.hook_bonus || 0);
  const emotional_score = merge(ruleScores.emotional_score, aiScores.emotional_score, weightAdjust.emotional_bonus || 0);
  const readability_score = merge(ruleScores.readability_score, aiScores.readability_score);
  const cta_score = merge(ruleScores.cta_score, aiScores.cta_score, weightAdjust.cta_bonus || 0);
  const engagement_score = Math.round(
    hook_score * 0.30 + emotional_score * 0.25 + readability_score * 0.20 + cta_score * 0.25
  );

  return { hook_score, emotional_score, readability_score, cta_score, engagement_score };
}

// ── Main handler ─────────────────────────────────────────────────────

serve(async (req) => {
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Plan validation — server-side
    const isAdmin = user.email === ADMIN_EMAIL;
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.plan !== "pro") {
        console.warn(`[caption-test] Unauthorized attempt by ${user.id}, plan: ${profile?.plan}`);
        return new Response(
          JSON.stringify({ error: "Pro plan required for A/B Caption Testing." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { topic, keywords, audience, tone } = await req.json();
    if (!topic || typeof topic !== "string" || topic.trim().length === 0 || topic.length > 500) {
      return new Response(JSON.stringify({ error: "Topic is required (max 500 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ── Layer 3: Fetch user's top 10 performing posts ──
    const { data: topPosts } = await supabase
      .from("content_posts")
      .select("caption, likes, comments, views, shares, saves, hook_text, caption_length")
      .eq("user_id", user.id)
      .order("likes", { ascending: false })
      .limit(10);

    const { summary: historicalSummary, weightAdjust } = buildHistoricalContext(topPosts || []);

    // ── Layer 2: AI Semantic Analysis ──
    const historicalBlock = historicalSummary
      ? `\n\nHISTORICAL USER DATA (Layer 3 — use to personalize scoring):\n${historicalSummary}\nAdjust your scores to match patterns the user's audience actually engages with.`
      : "";

    const systemPrompt = `You are a multi-layer social media caption scoring engine. Generate exactly 3 caption variations and provide semantic analysis scores for each.

LAYER 2 — AI SEMANTIC ANALYSIS:
For each caption, analyze:
- Persuasiveness & curiosity gap quality
- Clarity & message focus
- Pattern interrupt strength
- Emotional arc quality

Score these metrics from 0-100 (your AI perspective):
* hook_score: Attention-grabbing power of the opening
* emotional_score: Emotional resonance and trigger depth
* readability_score: Clarity and ease of quick comprehension
* cta_score: Call-to-action effectiveness
* engagement_score: Overall predicted engagement (weighted: hook 30%, emotional 25%, readability 20%, cta 25%)

RULES:
- Caption A: Hook-focused — bold opening statement or provocative question
- Caption B: Story-driven — micro-storytelling with emotional connection
- Caption C: CTA-optimized — lead with value, close with strong CTA
- Each caption: 100-250 characters with 3-5 hashtags
- Identify one "strength" and one "weakness" per caption (3-6 word phrases)
- Pick recommended variant with one-sentence reasoning
- Include an "ai_analysis" string (1-2 sentences) per caption explaining the semantic quality${historicalBlock}`;

    const safeTopic = topic.slice(0, 500);
    const safeKeywords = (keywords || "").slice(0, 200);
    const safeAudience = (audience || "").slice(0, 200);

    const userPrompt = `Topic: ${safeTopic}
${safeKeywords ? `Keywords: ${safeKeywords}` : ""}
${safeAudience ? `Target audience: ${safeAudience}` : ""}
Tone preference: ${tone || "Viral"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_captions",
              description: "Return 3 caption variants with AI semantic scores and recommendation.",
              parameters: {
                type: "object",
                properties: {
                  captions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variant: { type: "string", enum: ["A", "B", "C"] },
                        label: { type: "string" },
                        text: { type: "string" },
                        hook_score: { type: "number" },
                        emotional_score: { type: "number" },
                        readability_score: { type: "number" },
                        cta_score: { type: "number" },
                        engagement_score: { type: "number" },
                        strength: { type: "string" },
                        weakness: { type: "string" },
                        ai_analysis: { type: "string" },
                      },
                      required: [
                        "variant", "label", "text", "hook_score", "emotional_score",
                        "readability_score", "cta_score", "engagement_score",
                        "strength", "weakness", "ai_analysis",
                      ],
                      additionalProperties: false,
                    },
                  },
                  recommended: { type: "string", enum: ["A", "B", "C"] },
                  recommendation_reason: { type: "string" },
                },
                required: ["captions", "recommended", "recommendation_reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_captions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned from AI");

    const aiResult = JSON.parse(toolCall.function.arguments);

    // ── Merge Layer 1 + Layer 2 + Layer 3 ──
    const mergedCaptions = aiResult.captions.map((cap: any) => {
      const layer1 = ruleBasedScore(cap.text);
      const aiScores = {
        hook_score: cap.hook_score,
        emotional_score: cap.emotional_score,
        readability_score: cap.readability_score,
        cta_score: cap.cta_score,
        engagement_score: cap.engagement_score,
      };
      const merged = mergeScores(layer1, aiScores, weightAdjust);

      return {
        ...cap,
        ...merged,
        layer1_scores: layer1,
        layer2_scores: aiScores,
      };
    });

    // Re-determine recommendation based on merged scores
    const sorted = [...mergedCaptions].sort((a, b) => b.engagement_score - a.engagement_score);
    const recommended = sorted[0].variant;

    const finalResult = {
      captions: mergedCaptions,
      recommended,
      recommendation_reason: aiResult.recommendation_reason,
      has_historical_data: !!historicalSummary,
      posts_analyzed: topPosts?.length || 0,
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("caption-test error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
