import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free Online Box Shadow Tool | AI ToolYes",
  description: "Use the free online Box Shadow to boost your developer productivity. Instantly process data securely in your browser.",
  alternates: { canonical: "https://aitoolyes.com/tools/box-shadow" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20Online%20Box%20Shadow%20Tool']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolSEOContent 
        title="Box Shadow" 
        description="Use the free online Box Shadow to boost your developer productivity. Instantly process data securely in your browser." 
        features={JSON.parse('["100% Free to use with no hidden limits","Runs directly in your browser for maximum privacy","No data leaves your computer unless explicitly saved","Optimized for speed and developer workflows"]')} 
        faqs={JSON.parse('[{"q":"What is the Box Shadow tool used for?","a":"It is a free online utility designed specifically to help developers streamline their workflow by automating repetitive tasks."},{"q":"Is the data processed securely?","a":"Yes. In most cases, processing happens directly on your device inside the browser, ensuring your data remains completely private."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
