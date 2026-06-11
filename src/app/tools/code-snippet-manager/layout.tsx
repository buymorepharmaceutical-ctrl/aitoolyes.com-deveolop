import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Online Code Snippet Manager for Developers | AI ToolYes",
  description: "Save, organize, and sync your most-used code blocks securely in the cloud using Supabase.",
  alternates: { canonical: "https://aitoolyes.com/tools/code-snippet-manager" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Online%20Code%20Snippet%20Manager%20for%20Developers']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolSEOContent 
        title="Code Snippet Manager" 
        description="Save, organize, and sync your most-used code blocks securely in the cloud using Supabase." 
        features={JSON.parse('["Syntax highlighting for 50+ languages","Instant full-text search","Supabase real-time cloud synchronization"]')} 
        faqs={JSON.parse('[{"q":"Where are my snippets saved?","a":"Your snippets are securely saved to our Supabase cloud database linked to your session ID."},{"q":"Can I access them on another device?","a":"Currently, snippets are tied to your local session ID. Account login functionality is coming soon."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
