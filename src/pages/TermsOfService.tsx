const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">CreatorCore Terms of Service</h1>
      <p className="text-muted-foreground mb-6">Last updated: February 11, 2026</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p className="text-muted-foreground">
          By accessing or using CreatorCore ("the Service"), you agree to be bound by these Terms of
          Service. If you do not agree to these terms, you may not use the Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
        <p className="text-muted-foreground">
          CreatorCore provides analytics and insights tools for content creators by connecting to
          third-party social media platforms (such as YouTube and Instagram) via their official APIs.
          The Service analyzes public performance metrics to help creators understand and improve
          their content strategy.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>You must provide accurate and complete information when creating an account.</li>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must be at least 13 years of age to use the Service.</li>
          <li>One person may not maintain more than one account.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">4. Connected Platforms</h2>
        <p className="text-muted-foreground">
          When you connect a social media account, you authorize CreatorCore to access your public
          data through official platform APIs. You may disconnect any platform at any time. We do
          not post, modify, or interact with your social media accounts on your behalf.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">5. Data Usage</h2>
        <p className="text-muted-foreground">
          Your data is used solely to provide analytics and insights within the Service. We do not
          sell, share, or distribute your data to third parties. For full details, see our{" "}
          <a href="/privacy" className="text-primary underline">
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">6. Data Deletion</h2>
        <p className="text-muted-foreground">
          You may request the deletion of all your data at any time by visiting the{" "}
          <a href="/data-deletion" className="text-primary underline">
            Data Deletion
          </a>{" "}
          page. Deleted data cannot be recovered.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">7. Prohibited Conduct</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Using the Service to violate any applicable laws or regulations.</li>
          <li>Attempting to reverse-engineer, decompile, or hack the Service.</li>
          <li>Scraping or automating access to the Service outside of approved APIs.</li>
          <li>Misrepresenting your identity or affiliation.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          CreatorCore provides insights based on publicly available data and does not guarantee
          specific outcomes. The Service is provided "as is" without warranties of any kind. We are
          not liable for any indirect, incidental, or consequential damages arising from use of the
          Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
        <p className="text-muted-foreground">
          We reserve the right to suspend or terminate your account if you violate these Terms. You
          may also terminate your account at any time by deleting your data and ceasing use of the
          Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
        <p className="text-muted-foreground">
          We may update these Terms from time to time. Continued use of the Service after changes
          constitutes acceptance of the revised Terms.
        </p>
      </section>

      <div className="mt-8 space-y-2 text-muted-foreground border-t border-border/50 pt-6">
        <p className="text-sm font-medium text-foreground">Owner & Developer</p>
        <p>Om Prakash Kisan — <a href="mailto:omprakashkisan223@gmail.com" className="text-primary underline">omprakashkisan223@gmail.com</a></p>
        <p>Support: <a href="mailto:support@creatorcorev3.com" className="text-primary underline">support@creatorcorev3.com</a></p>
        <p className="text-xs mt-2">CreatorCore V3 — Social media analytics and content management platform.</p>
      </div>
    </div>
  );
};

export default TermsOfService;
