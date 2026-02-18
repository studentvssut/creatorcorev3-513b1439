const Privacy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">CreatorCore Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">We respect your privacy.</p>

      <section className="mb-6">
        <p className="mb-2">CreatorCore collects limited user data including:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Account email</li>
          <li>Connected social media account data (YouTube, Instagram)</li>
          <li>Public performance metrics (views, likes, comments)</li>
        </ul>
      </section>

      <section className="mb-6">
        <p className="mb-2">This data is used solely to:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Provide analytics insights</li>
          <li>Generate content suggestions</li>
          <li>Improve creator performance tracking</li>
        </ul>
      </section>

      <p className="mb-4">We do not sell, share, or distribute user data to third parties.</p>
      <p className="mb-6">Users may disconnect their accounts at any time.</p>

      <div className="mt-8 space-y-2 text-muted-foreground border-t border-border/50 pt-6">
        <p className="text-sm font-medium text-foreground">Owner & Developer</p>
        <p>Om Prakash Kisan — <a href="mailto:omprakashkisan223@gmail.com" className="text-primary underline">omprakashkisan223@gmail.com</a></p>
        <p>Support: <a href="mailto:support@creatorcorev3.com" className="text-primary underline">support@creatorcorev3.com</a></p>
        <p className="text-xs mt-2">CreatorCore V3 — Social media analytics and content management platform.</p>
      </div>
    </div>
  );
};

export default Privacy;
