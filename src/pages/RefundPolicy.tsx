import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <h1 className="mb-6 text-3xl font-bold">Refund Policy</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>Users may cancel their subscription at any time before the next billing cycle to avoid future charges.</p>
          <p>No partial refunds are issued once billing has occurred for the current period, unless required by applicable law.</p>
          <p>If you believe you were charged in error, please contact us at <strong className="text-foreground">support@creatorcorev3.com</strong> and we will review your case promptly.</p>
          <p>All subscription plans renew automatically on a monthly basis. Cancellation takes effect at the end of the current billing period.</p>
        </div>
        <div className="mt-8 space-y-2 text-sm text-muted-foreground border-t border-border/50 pt-6">
          <p className="font-medium text-foreground">Owner & Developer</p>
          <p>Om Prakash Kisan — <a href="mailto:omprakashkisan223@gmail.com" className="text-primary underline">omprakashkisan223@gmail.com</a></p>
          <p>Support: <a href="mailto:support@creatorcorev3.com" className="text-primary underline">support@creatorcorev3.com</a></p>
          <p className="text-xs mt-2">CreatorCore V3 — Social media analytics and content management platform.</p>
        </div>
      </div>
    </div>
  );
}
