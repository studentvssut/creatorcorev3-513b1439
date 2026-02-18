import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DataDeletion = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not logged in", description: "Please log in to delete your data.", variant: "destructive" });
        return;
      }

      // Delete user data from all tables
      await supabase.from("ai_insights").delete().eq("user_id", user.id);
      await supabase.from("content_posts").delete().eq("user_id", user.id);
      await supabase.from("performance_metrics").delete().eq("user_id", user.id);
      await supabase.from("connected_platforms").delete().eq("user_id", user.id);

      // Sign out after deletion
      await supabase.auth.signOut();

      toast({ title: "Data deleted", description: "All your data has been permanently removed." });
      navigate("/auth");
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Data Deletion Request</h1>

      <section className="mb-8 space-y-4 text-muted-foreground">
        <p>
          At CreatorCore, you have full control over your data. You can request the deletion of all
          your personal data and connected account information at any time.
        </p>
        <p>When you delete your data, the following will be permanently removed:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Your profile information</li>
          <li>Connected social media platform data</li>
          <li>Content posts and performance metrics</li>
          <li>AI-generated insights</li>
        </ul>
        <p className="font-medium text-foreground">
          This action is irreversible. Once deleted, your data cannot be recovered.
        </p>
      </section>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Delete My Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-primary accent-primary"
            />
            <span className="text-sm text-muted-foreground">
              I understand that this will permanently delete all my data and this action cannot be undone.
            </span>
          </label>
          <Button
            variant="destructive"
            disabled={!confirmed || loading}
            onClick={handleDeleteData}
          >
            {loading ? "Deleting..." : "Permanently Delete My Data"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-2 text-sm text-muted-foreground border-t border-border/50 pt-6">
        <p className="font-medium text-foreground">Owner & Developer</p>
        <p>Om Prakash Kisan — <a href="mailto:omprakashkisan223@gmail.com" className="text-primary underline">omprakashkisan223@gmail.com</a></p>
        <p>Support: <a href="mailto:support@creatorcorev3.com" className="text-primary underline">support@creatorcorev3.com</a></p>
        <p className="text-xs mt-2">CreatorCore V3 — Social media analytics and content management platform.</p>
      </div>
    </div>
  );
};

export default DataDeletion;
