import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free Browser-Based PDF Scanner | Scan to Text | AIToolYes",
  description: "Scan documents directly in your browser. Our free online PDF scanner uses on-device AI for OCR. No installation needed, 100% private.",
  keywords: "web-based PDF scanner, no-install PDF scanner for Chrome, scan PDF to text in browser, free online OCR, camscanner alternative web",
  alternates: { canonical: "https://aitoolyes.com/tools/camscanner" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20Browser-Based%20PDF%20Scanner']
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
            "name": "Browser PDF Scanner",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "description": "Free web-based PDF and document scanner using on-device AI.",
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
        title="Camscanner" 
        description="Use the free online Camscanner to boost your developer productivity. Instantly process data securely in your browser." 
        features={JSON.parse('["100% Free to use with no hidden limits","Runs directly in your browser for maximum privacy","No data leaves your computer unless explicitly saved","Optimized for speed and developer workflows"]')} 
        faqs={JSON.parse('[{"q":"What is the Camscanner tool used for?","a":"It is a free online utility designed specifically to help developers streamline their workflow by automating repetitive tasks."},{"q":"Is the data processed securely?","a":"Yes. In most cases, processing happens directly on your device inside the browser, ensuring your data remains completely private."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
