import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Subscription {
  razorpay_subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  grace_period_end: string | null;
  next_billing_date: string | null;
  billing_type: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("subscriptions")
      .select("razorpay_subscription_id, plan, status, current_period_end, grace_period_end, next_billing_date, billing_type")
      .eq("user_id", user.id)
      .maybeSingle();

    setSubscription(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const openMandateCheckout = useCallback(
    (subscriptionId: string, keyId: string, plan: string) => {
      return new Promise<void>((resolve, reject) => {
        const options = {
          key: keyId,
          subscription_id: subscriptionId,
          name: "CreatorCore",
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — AutoPay Setup`,
          handler: () => {
            toast.success("AutoPay mandate set up successfully!");
            resolve();
          },
          modal: {
            ondismiss: () => {
              toast.info("AutoPay setup skipped. You can set it up later from billing.");
              resolve(); // Don't reject — plan is already active
            },
          },
          theme: {
            color: "#7c3aed",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    },
    []
  );

  const subscribe = useCallback(
    async (plan: string) => {
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        // Step 1: Create a Razorpay Order for first month payment
        const res = await supabase.functions.invoke("create-subscription", {
          body: { plan },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.error) throw new Error(res.error.message);

        const { order_id, key_id, amount, currency } = res.data;

        // Step 2: Open Razorpay Checkout with order_id for first payment
        const options = {
          key: key_id,
          amount: amount,
          currency: currency || "INR",
          order_id: order_id,
          name: "CreatorCore",
          description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan — First Month`,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            // Step 3: Verify payment + create subscription + activate plan
            try {
              toast.loading("Activating your plan...", { id: "activate" });

              const activateRes = await supabase.functions.invoke("activate-subscription", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan: plan,
                },
                headers: { Authorization: `Bearer ${token}` },
              });

              if (activateRes.error) throw new Error(activateRes.error.message);

              if (activateRes.data?.verified) {
                toast.success(
                  `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan activated!`,
                  { id: "activate" }
                );
                fetchSubscription();

                // Step 4: Open second Razorpay Checkout for AutoPay mandate
                const { subscription_id, key_id: mandateKeyId } = activateRes.data;
                if (subscription_id && mandateKeyId) {
                  toast.loading("Setting up AutoPay...", { id: "mandate" });
                  try {
                    await openMandateCheckout(subscription_id, mandateKeyId, plan);
                    toast.dismiss("mandate");
                  } catch {
                    toast.dismiss("mandate");
                  }
                }
              } else {
                toast.error("Activation failed. Please check billing page.", { id: "activate" });
              }
            } catch (err: any) {
              console.error("Activation error:", err);
              toast.error(err.message || "Failed to activate plan", { id: "activate" });
            }
          },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled");
            },
          },
          theme: {
            color: "#7c3aed",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error("Subscribe error:", err);
        toast.error(err.message || "Failed to start subscription");
      }
    },
    [user, fetchSubscription, openMandateCheckout]
  );

  const cancelSubscription = useCallback(async () => {
    if (!user) return;
    setCancelling(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await supabase.functions.invoke("cancel-subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.error) throw new Error(res.error.message);

      toast.success("Subscription will be cancelled at end of billing period");
      setTimeout(() => fetchSubscription(), 2000);
    } catch (err: any) {
      console.error("Cancel error:", err);
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }, [user, fetchSubscription]);

  const isInGracePeriod = subscription?.status === "past_due" && subscription?.grace_period_end
    ? new Date(subscription.grace_period_end) > new Date()
    : false;

  const isPaymentFailed = subscription?.status === "past_due" || subscription?.status === "halted";

  return {
    subscription,
    loading,
    subscribe,
    cancelSubscription,
    cancelling,
    refetch: fetchSubscription,
    isInGracePeriod,
    isPaymentFailed,
  };
}