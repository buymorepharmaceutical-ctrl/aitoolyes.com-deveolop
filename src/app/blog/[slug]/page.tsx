import Image from 'next/image';

export default async function BlogPost({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params;

  // Mock data for any slug
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'How to build a modern AI Agent SaaS';
  
  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm font-medium text-primary mb-4">
          <span className="bg-primary/10 px-3 py-1 rounded-full">Development</span>
          <span className="text-foreground/50">October 24, 2026</span>
          <span className="text-foreground/50">•</span>
          <span className="text-foreground/50">5 min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500"></div>
          <div>
            <p className="font-semibold text-sm">Admin User</p>
            <p className="text-xs text-foreground/50">Author &amp; Creator</p>
          </div>
        </div>
      </div>

      <div className="w-full h-64 md:h-96 bg-white/40 rounded-3xl border border-white/50 overflow-hidden relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay z-10"></div>
        <Image src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80" alt="Blog cover" fill className="object-cover" />
      </div>

      <div className="prose prose-lg max-w-none text-foreground/80 marker:text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:text-foreground">
        <p className="lead text-xl font-medium text-foreground">
          Welcome to the new era of web development where AI agents can build entire SaaS platforms from scratch. In this article, we&apos;ll explore how we built this exact dashboard using Next.js, TailwindCSS, and the Glassmorphism design trend.
        </p>
        
        <h2>The Architecture</h2>
        <p>
          Our application is built on top of <strong>Next.js 14</strong> using the App Router. This gives us the best of both worlds: Server Components for fast initial page loads and SEO, and Client Components for rich, interactive tools.
        </p>
        
        <h3>Why Glassmorphism?</h3>
        <p>
          Glassmorphism isn&apos;t just a trend; it&apos;s a way to create depth and hierarchy without relying on harsh shadows or flat colors. By using semi-transparent backgrounds with background blur, we create a UI that feels light, premium, and inherently modern.
        </p>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
          <code>{`.glass-panel {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}`}</code>
        </pre>
        
        <h2>Integrating Problem-Solving Tools</h2>
        <p>
          A blog alone isn&apos;t enough to drive consistent traffic. By integrating practical tools like JSON Formatters, Password Generators, and SEO analyzers directly into the platform, we provide immediate value to developers and marketers.
        </p>
        
        <blockquote>
          &quot;The best websites don&apos;t just tell you things; they help you do things.&quot;
        </blockquote>
        
        <h2>Monetization with Google Ads</h2>
        <p>
          To make this platform sustainable, we&apos;ll be integrating Google AdSense. The trick is to place ads organically within the content flow and tool sidebars so they don&apos;t disrupt the premium user experience.
        </p>
        
        <h2>What&apos;s Next?</h2>
        <p>
          In the upcoming parts of this series, we&apos;ll cover how to connect a PostgreSQL database using Supabase, implement secure admin authentication, and deploy the entire application to production.
        </p>
      </div>
    </article>
  );
}
