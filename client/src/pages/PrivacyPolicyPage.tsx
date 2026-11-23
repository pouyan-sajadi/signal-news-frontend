export function PrivacyPolicyPage() {
  return (
    <div className="info-page">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>Last updated: Aug 19, 2025</p>
        
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Welcome to Hey Signal. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
        </p>

        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <p>
          We may collect personal information that you provide to us when you register for an account, such as your name and email address, which are provided via Google OAuth. We also collect the content you generate, such as the topics of reports you request and the reports themselves.
        </p>

        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc list-inside">
          <li>Create and manage your account.</li>
          <li>Provide you with the services you request, including generating reports.</li>
          <li>Save and display your report history.</li>
          <li>Improve our services and application.</li>
        </ul>

        <h2 className="text-xl font-semibold">4. Sharing Your Information</h2>
        <p>
          We do not share your personal information with third parties except as required by law or to provide our services (e.g., with our database provider, Supabase).
        </p>

        <h2 className="text-xl font-semibold">5. Data Security</h2>
        <p>
          We use administrative, technical, and physical security measures to help protect your personal information.
        </p>

        <h2 className="text-xl font-semibold">6. Contact Us</h2>
        <p>
          If you have questions or comments about this Privacy Policy, please contact us at pouyan.sajadi@gmail.com.
        </p>
      </div>
    </div>
  );
}
