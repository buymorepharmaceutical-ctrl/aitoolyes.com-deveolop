import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AIToolYes',
  description: 'Our commitment to 100% on-device privacy, zero cloud uploads, and Google AdSense compliance.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 md:px-8 prose prose-lg prose-invert text-foreground/90">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-primary">Privacy Policy</h1>
      <p className="text-foreground/70 mb-8">Last updated: June 2026</p>

      <h2>1. The "On-Device" Privacy Guarantee</h2>
      <p>
        At <strong>AIToolYes.com</strong>, we believe that your data is yours. Unlike traditional cloud-based AI applications, 
        our flagship tools (including Scanner AI Pro, Color Extractor, ATS Resume Checker, and JSON Formatter) run entirely 
        <strong> inside your browser on your local device</strong>. 
      </p>
      <ul>
        <li><strong>No Cloud Uploads:</strong> Your sensitive PDFs, resumes, and photographs are NEVER uploaded to our servers.</li>
        <li><strong>Local Processing:</strong> All machine learning algorithms, computer vision (OpenCV), and parsing happen strictly in your device's memory.</li>
        <li><strong>Instant Deletion:</strong> Once you close the browser tab, the mathematical matrices are instantly erased. We have no backend databases storing your personal files.</li>
      </ul>

      <h2>2. Google AdSense & Cookies</h2>
      <p>
        To keep our massive suite of 20+ AI tools completely free, we use third-party advertising companies, primarily Google AdSense, to serve ads when you visit our website.
      </p>
      <ul>
        <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
        <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
        <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Ads Settings</a>.</li>
      </ul>

      <h2>3. Local Storage</h2>
      <p>
        We may use your browser's \`localStorage\` to save user preferences (like Dark Mode settings or AI Chat Conversation Memory). This data is stored strictly on your device and is never transmitted to us.
      </p>

      <h2>4. Third-Party Analytics</h2>
      <p>
        We use basic, anonymized web analytics to understand how many people visit our site and which tools are the most popular. This helps us decide what to build next. This data is aggregated and cannot be used to identify you personally.
      </p>

      <h2>5. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about our privacy practices, or if you want to verify how our on-device tools operate, feel free to reach out to our engineering team.
      </p>
    </div>
  );
}
