import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free Universal AI Chat Agent for Developers | AI ToolYes",
  description: "Chat with our multimodal AI agent. Supports vision, code generation, web search, and API integrations.",
  alternates: { canonical: "https://aitoolyes.com/tools/ai-chat" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20Universal%20AI%20Chat%20Agent%20for%20Developers']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToolSEOContent 
        title="Ai Chat" 
        description="Chat with our multimodal AI agent. Supports vision, code generation, web search, and API integrations." 
        features={JSON.parse('["Built-in Vision capabilities for image analysis","Remembers conversation context (Memory)","Generates high-quality React, Python, and SQL code"]')} 
        faqs={JSON.parse('[{"q":"Is this AI chat free to use?","a":"Yes! Our Universal AI Agent is entirely free to use directly in your browser without requiring a subscription."},{"q":"Can the AI generate code?","a":"Absolutely. The agent specializes in developer workflows and can generate, debug, and refactor code across multiple languages."}]')} 
        relatedTools={[
          { name: 'AI UI Generator', url: '/tools/ui-generator', icon: '✨' },
          { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
          { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' }
        ]}
      />
    </>
  );
}
