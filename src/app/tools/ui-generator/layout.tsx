import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free AI Tailwind UI Generator & Bento Grids | AI ToolYes",
  description: "Generate modern UI components, Glassmorphism, and Bento Grids instantly using AI.",
  alternates: { canonical: "https://aitoolyes.com/tools/ui-generator" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20AI%20Tailwind%20UI%20Generator%20%26%20Bento%20Grids']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolSEOContent 
        title="Ui Generator" 
        description="Generate modern UI components, Glassmorphism, and Bento Grids instantly using AI." 
        features={JSON.parse('["Generates Glassmorphism and Neumorphism styles","Live code editor and visual preview","One-click copy to clipboard functionality"]')} 
        faqs={JSON.parse('[{"q":"How does the UI generator work?","a":"Simply describe the component you want (e.g. \'pricing card with 3 tiers\') and our AI will instantly write the HTML and CSS/Tailwind for you."},{"q":"Are the generated components mobile responsive?","a":"Yes, all AI generated templates prioritize mobile-first responsive design principles."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
