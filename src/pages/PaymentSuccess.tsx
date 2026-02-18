import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const subscriptionId = searchParams.get("razorpay_subscription_id");
        const paymentId = searchParams.get("razorpay_payment_id");

        if (!subscriptionId) {
          setStatus("error");
          setErrorMsg("Missing payment information. Please contact support.");
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        if (!token) {
          setStatus("error");
          setErrorMsg("Session expired. Please log in and check your billing page.");
          return;
        }

        const res = await supabase.functions.invoke("verify-payment", {
          body: { razorpay_subscription_id: subscriptionId, razorpay_payment_id: paymentId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.error) throw new Error(res.error.message);

        if (res.data?.verified) {
          setStatus("success");
          setPlan(res.data.plan);
          setTimeout(() => navigate("/dashboard", { replace: true }), 3000);
        } else {
          setStatus("error");
          setErrorMsg(`Payment status: ${res.data?.status || "unknown"}. If you were charged, your plan will activate shortly via webhook.`);
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to verify payment. Please check your billing page.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Verifying Payment…</h1>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Payment Successful</h1>
            <p className="text-sm text-muted-foreground">
              {plan
                ? `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active!`
                : "Subscription Activated"}
            </p>
            <p className="text-xs text-muted-foreground">Redirecting to dashboard in 3 seconds…</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-xl font-bold text-foreground">Verification Issue</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setStatus("verifying");
                  setErrorMsg("");
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/dashboard/billing", { replace: true })}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Go to Billing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
