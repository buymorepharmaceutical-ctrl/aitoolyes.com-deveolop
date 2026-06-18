import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: 'Private Search Engine (DuckDuckGo API) - AI ToolYes',
  description: 'Search the web completely privately without being tracked, using our direct DuckDuckGo proxy.',
  keywords: "private search engine, tracker free search, duckduckgo proxy search, search web without tracking",
  alternates: { canonical: "https://aitoolyes.com/tools/private-search" },
};

export default function PrivateSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Private Search Engine",
            "operatingSystem": "Web",
            "applicationCategory": "UtilitiesApplication",
            "description": "Search the web completely privately using a DuckDuckGo proxy API.",
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
        title="Private Search Engine" 
        description="Search the web directly from our servers without sending any tracking scripts or telemetry data to third parties." 
        features={JSON.parse('["Powered by DuckDuckGo Lite HTML for blazing fast speeds","Zero tracking scripts, cookies, or telemetry loaded in your browser","Proxy architecture means search engines only see our servers, not your IP"]')} 
        faqs={JSON.parse('[{"q":"Is this really private?","a":"Yes! We use an edge proxy to fetch DuckDuckGo Lite HTML results. Your IP address and browser fingerprints are hidden from the search engine."},{"q":"Why does the UI look so simple?","a":"We stripped out all heavy JavaScript, ads, and tracking modules to give you pure, instant search results."}]')} 
        relatedTools={[
          { name: 'Universal AI Assistant', url: '/tools/ai-chat', icon: '✨' },
          { name: 'Advanced SEO Analyzer', url: '/tools/seo-analyzer', icon: '🌍' },
          { name: 'Password Generator', url: '/tools/password-generator', icon: '***' }
        ]}
      />
    </>
  );
}
