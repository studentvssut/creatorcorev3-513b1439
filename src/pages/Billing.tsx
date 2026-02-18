import { CreditCard, Check, Zap, Loader2, Crown, Shield, AlertTriangle, XCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Get started with basic metrics.",
    trial: null,
    features: [
      "Basic performance metrics",
      "Single platform support",
      "Connect your accounts",
    ],
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "₹1,500",
    period: "/month",
    description: "Essential tools to understand your content performance.",
    trial: "7-day free trial",
    features: [
      "Algorithm Lab — 7-day insights",
      "Daily Growth Commands",
      "Limited Script Engine usage",
      "Single platform support",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹3,000",
    period: "/month",
    description: "Full creator operating system with advanced intelligence.",
    trial: "7-day free trial",
    features: [
      "Algorithm Lab — 30-day trends",
      "Unlimited insights & analysis",
      "Full Script Engine access",
      "Nexus Bridge — publishing",
      "Growth Score insights",
      "Multi-platform repurposing",
      "Platform-optimized captions",
      "Best-time posting suggestions",
      "Priority support",
    ],
    highlighted: true,
  },
];

const statusLabels: Record<string, string> = {
  active: "Active",
  created: "Pending",
  authenticated: "Pending",
  past_due: "Payment Failed — Grace Period",
  halted: "Payment Failed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const Billing = () => {
  const { subscription, loading: subLoading, subscribe, cancelSubscription, cancelling, isInGracePeriod, isPaymentFailed } = useSubscription();
  const { plan: currentPlan } = useFeatureGate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const activePlan = subscription?.status === "active" || subscription?.status === "past_due"
    ? subscription.plan
    : null;

  const getCtaText = (planId: string) => {
    if (planId === "free") return currentPlan === "free" ? "Current Plan" : "—";
    if (activePlan === planId) return "Current Plan";
    if (activePlan) return "Switch Plan";
    return "Start Free Trial";
  };

  const isCurrentPlan = (planId: string) => {
    if (planId === "free") return currentPlan === "free" && !activePlan;
    return activePlan === planId;
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2.5">
          <CreditCard className="w-6 h-6 text-primary" />
          Billing & Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose the plan that fits your creator journey. Start free, upgrade anytime.
        </p>
      </div>

      {/* Payment failure warning */}
      {isPaymentFailed && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">Payment Failed</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isInGracePeriod
                  ? `Your payment failed. You have access until ${new Date(subscription!.grace_period_end!).toLocaleDateString()}. Please update your payment method.`
                  : "Your subscription has been paused due to failed payment. Please update your payment method to restore access."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active subscription info */}
      {subscription && !["expired", "cancelled"].includes(subscription.status) && (
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {statusLabels[subscription.status] || subscription.status}
                  {subscription.next_billing_date &&
                    ` · Next billing on: ${new Date(subscription.next_billing_date).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {subscription.status === "active" && (
              <div>
                {showCancelConfirm ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Are you sure?</span>
                    <button
                      onClick={() => {
                        cancelSubscription();
                        setShowCancelConfirm(false);
                      }}
                      disabled={cancelling}
                      className="px-3 py-1.5 text-xs rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                    >
                      {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes, Cancel"}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
                    >
                      Keep Plan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Plan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-card p-6 space-y-5 animate-slide-up relative ${
              plan.highlighted ? "gradient-border glow-purple" : "border border-border/50"
            } rounded-xl`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {plan.id === "pro" ? <Crown className="w-4 h-4 text-neon-cyan" /> : plan.id === "free" ? <Shield className="w-4 h-4 text-muted-foreground" /> : <Zap className="w-4 h-4 text-primary" />}
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold gradient-text">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>

            {plan.trial && (
              <div className="flex items-center gap-1.5 text-xs text-neon-cyan font-medium">
                <Zap className="w-3.5 h-3.5" />
                {plan.trial}
              </div>
            )}

            <div className="space-y-2.5">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-neon-cyan mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <button
              disabled={subLoading || isCurrentPlan(plan.id) || plan.id === "free"}
              onClick={() => !isCurrentPlan(plan.id) && plan.id !== "free" && subscribe(plan.id)}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-purple"
                  : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50"
              }`}
            >
              {subLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                getCtaText(plan.id)
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
