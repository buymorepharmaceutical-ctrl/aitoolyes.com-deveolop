import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free AI SEO Analyzer | Website SEO Checker | AIToolYes",
  description: "Analyze your website SEO for free. Our AI SEO checker audits meta tags, keywords, and performance instantly in your browser.",
  keywords: "free SEO analyzer, website SEO checker, AI SEO audit, analyze website SEO, technical SEO checker free",
  alternates: { canonical: "https://aitoolyes.com/tools/seo-analyzer" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20AI%20SEO%20Analyzer']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AI SEO Analyzer",
            "operatingSystem": "Web",
            "applicationCategory": "DeveloperApplication",
            "description": "Free web-based AI SEO Analyzer for on-page audits.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      {children}
      <ToolSEOContent 
        title="Seo Analyzer" 
        description="Use the free online Seo Analyzer to boost your developer productivity. Instantly process data securely in your browser." 
        features={JSON.parse('["100% Free to use with no hidden limits","Runs directly in your browser for maximum privacy","No data leaves your computer unless explicitly saved","Optimized for speed and developer workflows"]')} 
        faqs={JSON.parse('[{"q":"What is the Seo Analyzer tool used for?","a":"It is a free online utility designed specifically to help developers streamline their workflow by automating repetitive tasks."},{"q":"Is the data processed securely?","a":"Yes. In most cases, processing happens directly on your device inside the browser, ensuring your data remains completely private."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
