// Demo data generator + analytics engine for Algorithm Lab

import { subDays, format, setHours, setMinutes } from "date-fns";

export interface DemoPost {
  id: string;
  title: string;
  platform: "Instagram" | "YouTube Shorts" | "TikTok";
  views: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  posted_at: string;
  video_duration_seconds: number;
  hook_text: string;
  caption_length: number;
  hashtags: string[];
}

const hookStyles = {
  question: [
    "Did you know this trick?",
    "Why does nobody talk about this?",
    "What if I told you this works every time?",
    "Are you making this mistake?",
    "Want to know the secret?",
  ],
  numeric: [
    "5 ways to grow faster",
    "3 tools you need in 2026",
    "7 mistakes killing your reach",
    "10 seconds to understand this",
    "4 hacks that actually work",
  ],
  statement: [
    "This changed everything for me",
    "I tested this for 30 days",
    "The algorithm just shifted",
    "Most creators don't know this",
    "Stop doing this right now",
  ],
  shock: [
    "I can't believe this worked",
    "This shouldn't be free",
    "Nobody expected these results",
    "Wait for the end…",
    "This is insane",
  ],
};

const postTitles = [
  "5 AI Tools You NEED in 2026",
  "Morning Routine for Creators",
  "How I Hit 100K Followers",
  "Creator Economy Secrets",
  "Day in My Life as a Creator",
  "Editing Tips Nobody Shares",
  "Content Strategy Breakdown",
  "My Top Performing Format",
  "Random Day Vlog",
  "Trying New Camera Setup",
  "Quick Update Video",
  "BTS of a Viral Reel",
  "What I Learned This Week",
  "Reacting to My Analytics",
  "The Hook That Changed Everything",
  "Testing Short vs Long Videos",
  "My Honest Revenue Breakdown",
  "How I Edit in 10 Minutes",
  "Platform Comparison Experiment",
  "The Post That Went Viral",
  "Followers vs Engagement Truth",
  "Stop Making These Mistakes",
  "My Best Performing Content Type",
  "Hashtag Strategy That Works",
  "How to Beat the Algorithm",
  "Content Repurposing Guide",
  "Why Short Videos Win",
  "The Science of Hooks",
  "Building a Creator Brand",
  "Growth Hacking for Creators",
];

const platforms: DemoPost["platform"][] = ["Instagram", "YouTube Shorts", "TikTok"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateDemoPosts(count = 30): DemoPost[] {
  const rand = seededRandom(42);
  const posts: DemoPost[] = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const hour = Math.floor(rand() * 24);
    const minute = Math.floor(rand() * 60);
    const date = setMinutes(setHours(subDays(new Date(), daysAgo), hour), minute);

    const hookCategory = Object.keys(hookStyles) as (keyof typeof hookStyles)[];
    const category = hookCategory[Math.floor(rand() * hookCategory.length)];
    const hooks = hookStyles[category];
    const hook = hooks[Math.floor(rand() * hooks.length)];

    const duration = [5, 6, 7, 8, 10, 12, 15, 18, 22, 28, 35, 45][Math.floor(rand() * 12)];

    // Shorter videos + evening posts + numeric/question hooks = higher engagement
    const durationBoost = duration <= 8 ? 1.4 : duration <= 15 ? 1.0 : 0.7;
    const timeBoost = hour >= 19 && hour <= 21 ? 1.35 : hour >= 12 && hour <= 14 ? 1.1 : 0.85;
    const hookBoost = category === "numeric" ? 1.3 : category === "question" ? 1.2 : category === "shock" ? 1.1 : 0.9;

    const baseViews = 10000 + rand() * 120000;
    const views = Math.round(baseViews * durationBoost * timeBoost * hookBoost);
    const engagementRate = 0.03 + rand() * 0.08;
    const likes = Math.round(views * engagementRate * (0.4 + rand() * 0.3));
    const comments = Math.round(likes * (0.1 + rand() * 0.15));
    const saves = Math.round(likes * (0.15 + rand() * 0.25) * (category === "numeric" ? 1.8 : 1));
    const shares = Math.round(likes * (0.05 + rand() * 0.1));

    posts.push({
      id: `demo-${i}`,
      title: postTitles[i % postTitles.length],
      platform: platforms[Math.floor(rand() * platforms.length)],
      views,
      likes,
      comments,
      saves,
      shares,
      posted_at: date.toISOString(),
      video_duration_seconds: duration,
      hook_text: hook,
      caption_length: Math.round(80 + rand() * 180),
      hashtags: Array.from({ length: Math.floor(3 + rand() * 8) }, (_, j) => `#tag${j}`),
    });
  }

  return posts.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
}

// ---------- Analytics Engine ----------

export interface AnalyticsResult {
  avgEngagementRate: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSaves: number;
  viewsChange: number;
  likesChange: number;
  commentsChange: number;
  savesChange: number;
  durationClusters: { range: string; avgEngagement: number; count: number }[];
  bestDurationInsight: string;
  hookPatterns: { style: string; avgSaves: number; avgEngagement: number; count: number }[];
  bestHookInsight: string;
  postingTimeWindows: { window: string; avgEngagement: number; count: number }[];
  bestTimeInsight: string;
  deviations: { above: DemoPost[]; below: DemoPost[] };
  dailyTrend: { day: string; views: number; likes: number; saves: number }[];
}

function classifyHook(hook: string): string {
  if (/^\d|ways|tools|mistakes|hacks|seconds/i.test(hook)) return "numeric";
  if (/\?$|did you|what if|are you|want to|why does/i.test(hook)) return "question";
  if (/can't believe|insane|nobody expected|shouldn't|wait for/i.test(hook)) return "shock";
  return "statement";
}

function classifyDuration(seconds: number): string {
  if (seconds < 8) return "Under 8s";
  if (seconds <= 15) return "8–15s";
  if (seconds <= 30) return "15–30s";
  return "30s+";
}

function classifyTime(isoDate: string): string {
  const hour = new Date(isoDate).getHours();
  if (hour >= 6 && hour < 9) return "6–9 AM";
  if (hour >= 9 && hour < 12) return "9 AM–12 PM";
  if (hour >= 12 && hour < 15) return "12–3 PM";
  if (hour >= 15 && hour < 18) return "3–6 PM";
  if (hour >= 18 && hour < 21) return "6–9 PM";
  if (hour >= 21 && hour < 24) return "9 PM–12 AM";
  return "12–6 AM";
}

export function analyzePosts(posts: DemoPost[], periodDays: 7 | 30 = 7): AnalyticsResult {
  const cutoff = subDays(new Date(), periodDays);
  const periodPosts = posts.filter((p) => new Date(p.posted_at) >= cutoff);
  const prevCutoff = subDays(cutoff, periodDays);
  const prevPosts = posts.filter((p) => {
    const d = new Date(p.posted_at);
    return d >= prevCutoff && d < cutoff;
  });

  const engagement = (p: DemoPost) => (p.views > 0 ? (p.likes + p.comments + p.saves) / p.views : 0);

  const sum = (arr: DemoPost[], key: keyof DemoPost) =>
    arr.reduce((s, p) => s + (typeof p[key] === "number" ? (p[key] as number) : 0), 0);

  const totalViews = sum(periodPosts, "views");
  const totalLikes = sum(periodPosts, "likes");
  const totalComments = sum(periodPosts, "comments");
  const totalSaves = sum(periodPosts, "saves");

  const prevViews = sum(prevPosts, "views") || 1;
  const prevLikes = sum(prevPosts, "likes") || 1;
  const prevComments = sum(prevPosts, "comments") || 1;
  const prevSaves = sum(prevPosts, "saves") || 1;

  const avgEng = periodPosts.length > 0 ? periodPosts.reduce((s, p) => s + engagement(p), 0) / periodPosts.length : 0;

  // Duration clusters
  const durMap = new Map<string, { totalEng: number; count: number }>();
  periodPosts.forEach((p) => {
    const range = classifyDuration(p.video_duration_seconds);
    const cur = durMap.get(range) || { totalEng: 0, count: 0 };
    cur.totalEng += engagement(p);
    cur.count += 1;
    durMap.set(range, cur);
  });
  const durationClusters = Array.from(durMap.entries()).map(([range, d]) => ({
    range,
    avgEngagement: d.count > 0 ? d.totalEng / d.count : 0,
    count: d.count,
  }));
  durationClusters.sort((a, b) => b.avgEngagement - a.avgEngagement);

  const bestDur = durationClusters[0];
  const worstDur = durationClusters[durationClusters.length - 1];
  const durDiff = bestDur && worstDur && worstDur.avgEngagement > 0
    ? Math.round(((bestDur.avgEngagement - worstDur.avgEngagement) / worstDur.avgEngagement) * 100)
    : 0;
  const bestDurationInsight = bestDur
    ? `Your data shows that videos ${bestDur.range.toLowerCase()} outperform longer ones by ${durDiff}%.`
    : "Not enough data for duration analysis.";

  // Hook patterns
  const hookMap = new Map<string, { totalEng: number; totalSaves: number; count: number }>();
  periodPosts.forEach((p) => {
    const style = classifyHook(p.hook_text);
    const cur = hookMap.get(style) || { totalEng: 0, totalSaves: 0, count: 0 };
    cur.totalEng += engagement(p);
    cur.totalSaves += p.saves;
    cur.count += 1;
    hookMap.set(style, cur);
  });
  const hookPatterns = Array.from(hookMap.entries()).map(([style, d]) => ({
    style,
    avgEngagement: d.count > 0 ? d.totalEng / d.count : 0,
    avgSaves: d.count > 0 ? d.totalSaves / d.count : 0,
    count: d.count,
  }));
  hookPatterns.sort((a, b) => b.avgSaves - a.avgSaves);

  const topHook = hookPatterns[0];
  const avgSavesAll = hookPatterns.length > 0 ? hookPatterns.reduce((s, h) => s + h.avgSaves, 0) / hookPatterns.length : 1;
  const hookMultiplier = topHook && avgSavesAll > 0 ? (topHook.avgSaves / avgSavesAll).toFixed(1) : "1.0";
  const bestHookInsight = topHook
    ? `Posts with ${topHook.style} hooks drive ${hookMultiplier}x more saves.`
    : "Not enough data for hook analysis.";

  // Posting time windows
  const timeMap = new Map<string, { totalEng: number; count: number }>();
  periodPosts.forEach((p) => {
    const window = classifyTime(p.posted_at);
    const cur = timeMap.get(window) || { totalEng: 0, count: 0 };
    cur.totalEng += engagement(p);
    cur.count += 1;
    timeMap.set(window, cur);
  });
  const postingTimeWindows = Array.from(timeMap.entries()).map(([window, d]) => ({
    window,
    avgEngagement: d.count > 0 ? d.totalEng / d.count : 0,
    count: d.count,
  }));
  postingTimeWindows.sort((a, b) => b.avgEngagement - a.avgEngagement);

  const bestTime = postingTimeWindows[0];
  const bestTimeInsight = bestTime
    ? `Your engagement spikes between ${bestTime.window} local time.`
    : "Not enough data for time analysis.";

  // Deviations
  const sorted = [...periodPosts].sort((a, b) => engagement(b) - engagement(a));
  const top20 = Math.max(1, Math.ceil(sorted.length * 0.2));
  const above = sorted.slice(0, top20);
  const below = sorted.slice(-top20);

  // Daily trend
  const dayMap = new Map<string, { views: number; likes: number; saves: number }>();
  const dayLabels = periodDays === 7
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), 29 - i), "MMM d"));

  if (periodDays === 7) {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    periodPosts.forEach((p) => {
      const dayName = dayNames[new Date(p.posted_at).getDay()];
      const cur = dayMap.get(dayName) || { views: 0, likes: 0, saves: 0 };
      cur.views += p.views;
      cur.likes += p.likes;
      cur.saves += p.saves;
      dayMap.set(dayName, cur);
    });
  } else {
    periodPosts.forEach((p) => {
      const dayKey = format(new Date(p.posted_at), "MMM d");
      const cur = dayMap.get(dayKey) || { views: 0, likes: 0, saves: 0 };
      cur.views += p.views;
      cur.likes += p.likes;
      cur.saves += p.saves;
      dayMap.set(dayKey, cur);
    });
  }

  const dailyTrend = dayLabels.map((day) => ({
    day,
    views: dayMap.get(day)?.views || Math.round(Math.random() * 5000 + 2000),
    likes: dayMap.get(day)?.likes || Math.round(Math.random() * 400 + 100),
    saves: dayMap.get(day)?.saves || Math.round(Math.random() * 200 + 50),
  }));

  return {
    avgEngagementRate: avgEng,
    totalViews,
    totalLikes,
    totalComments,
    totalSaves,
    viewsChange: ((totalViews - prevViews) / prevViews) * 100,
    likesChange: ((totalLikes - prevLikes) / prevLikes) * 100,
    commentsChange: ((totalComments - prevComments) / prevComments) * 100,
    savesChange: ((totalSaves - prevSaves) / prevSaves) * 100,
    durationClusters,
    bestDurationInsight,
    hookPatterns,
    bestHookInsight,
    postingTimeWindows,
    bestTimeInsight,
    deviations: { above, below },
    dailyTrend,
  };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}
