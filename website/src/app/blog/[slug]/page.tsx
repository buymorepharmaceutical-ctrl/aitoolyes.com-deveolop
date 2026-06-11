import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const BLOG_CONTENT: Record<string, { title: string, category: string, date: string, image: string, content: React.ReactNode, readTime: string }> = {
  'how-to-build-a-modern-ai-agent-saas': {
    title: 'How to build a modern AI Agent SaaS',
    category: 'Development',
    date: 'Oct 24, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl font-medium text-foreground">
          Welcome to the new era of web development where AI agents can build entire SaaS platforms from scratch. In this article, we'll explore how we built this exact dashboard using Next.js, TailwindCSS, and the Glassmorphism design trend.
        </p>
        
        <h2>The Architecture</h2>
        <p>
          Our application is built on top of <strong>Next.js 16</strong> using the App Router. This gives us the best of both worlds: Server Components for fast initial page loads and SEO, and Client Components for rich, interactive tools. We heavily utilized <code>Turbopack</code> for insanely fast local development speeds.
        </p>
        
        <h3>Why Glassmorphism?</h3>
        <p>
          Glassmorphism isn't just a trend; it's a way to create depth and hierarchy without relying on harsh shadows or flat colors. By using semi-transparent backgrounds with background blur, we create a UI that feels light, premium, and inherently modern.
        </p>
        
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
          <code>{`.glass-panel {\n  background: rgba(255, 255, 255, 0.4);\n  backdrop-filter: blur(20px);\n  border: 1px solid rgba(255, 255, 255, 0.5);\n}`}</code>
        </pre>
        
        <h2>Integrating Problem-Solving Tools</h2>
        <p>
          A blog alone isn't enough to drive consistent traffic. By integrating practical tools like JSON Formatters, Password Generators, and SEO analyzers directly into the platform, we provide immediate value to developers and marketers.
        </p>
        
        <blockquote>
          "The best websites don't just tell you things; they help you do things."
        </blockquote>
        
        <h2>Monetization with Google Ads</h2>
        <p>
          To make this platform sustainable, we're integrating Google AdSense and an aggressive Custom Enforcement Timer. The trick is to place ads organically within the content flow and tool sidebars so they don't disrupt the premium user experience, but rather complement the AI-driven approach.
        </p>
        
        <h2>What's Next?</h2>
        <p>
          In the upcoming parts of this series, we'll cover how to connect a PostgreSQL database using Supabase, implement secure admin authentication, and deploy the entire application to production using Vercel.
        </p>
      </>
    )
  },
  'mastering-glassmorphism-in-tailwind-css': {
    title: 'Mastering Glassmorphism in Tailwind CSS',
    category: 'Design',
    date: 'Oct 20, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl font-medium text-foreground">
          Glassmorphism has taken the UI design world by storm. From macOS Big Sur to Windows 11, frosted glass effects are everywhere. Let's learn how to recreate these stunning visual aesthetics purely with Tailwind CSS.
        </p>
        <h2>The Core Principles</h2>
        <p>
          At its core, Glassmorphism relies on four main ingredients:
        </p>
        <ul>
          <li><strong>Translucency:</strong> A semi-transparent background color (usually white or dark gray).</li>
          <li><strong>Background Blur:</strong> The <code>backdrop-filter</code> property that blurs everything behind the element.</li>
          <li><strong>Light Borders:</strong> A subtle, semi-transparent border to simulate the edge of the glass.</li>
          <li><strong>Vibrant Backgrounds:</strong> Glass needs something colorful behind it to look like glass!</li>
        </ul>
        <h2>Tailwind Implementation</h2>
        <p>With Tailwind CSS, building a glass card is incredibly simple. We use the <code>bg-white/10</code> class for background opacity and <code>backdrop-blur-lg</code> for the frosting effect.</p>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
          <code>{`<div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-2xl p-8">\n  <h3 className="text-white">Glass Card</h3>\n</div>`}</code>
        </pre>
        <h2>Advanced Effects</h2>
        <p>To take your glassmorphism to the next level, consider adding subtle animated gradients behind your cards or using inner shadows to create a more realistic 3D appearance.</p>
      </>
    )
  },
  'best-practices-for-jwt-authentication': {
    title: 'Best practices for JWT Authentication',
    category: 'Security',
    date: 'Oct 15, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl font-medium text-foreground">
          JSON Web Tokens (JWT) are the standard for securing stateless web applications. But if implemented incorrectly, they can expose your app to severe vulnerabilities like XSS and CSRF attacks. Here is the definitive guide to doing JWTs right.
        </p>
        <h2>Where to Store Your Tokens</h2>
        <p>The most common mistake developers make is storing JWTs in <code>localStorage</code>. While convenient, this makes the tokens accessible to any JavaScript running on the page, leaving you highly vulnerable to Cross-Site Scripting (XSS).</p>
        <p><strong>The Solution:</strong> Always store your access tokens in HTTP-Only, Secure cookies. This prevents JavaScript from reading the token while ensuring it's automatically sent with every request to the backend.</p>
        <h2>Short-Lived Access Tokens</h2>
        <p>An access token should never be valid for days or months. If a token is stolen, the attacker will have access until it expires. Keep access token lifespans short—usually 15 to 30 minutes.</p>
        <h2>Implementing Refresh Tokens</h2>
        <p>To prevent users from having to log in every 15 minutes, use Refresh Tokens. These are long-lived tokens (e.g., 7 days) stored in a separate, highly secure HTTP-Only cookie. When the access token expires, the client silently hits a <code>/refresh</code> endpoint to get a new access token without the user noticing.</p>
        <h2>Symmetric vs Asymmetric Signing</h2>
        <p>For most simple applications, HS256 (symmetric) is fine. But for enterprise applications where multiple services need to verify tokens without knowing the secret, always use RS256 (asymmetric) with public/private key pairs.</p>
      </>
    )
  },
  'the-future-of-ai-in-content-creation': {
    title: 'The Future of AI in Content Creation',
    category: 'AI Trends',
    date: 'Oct 28, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl font-medium text-foreground">
          We are standing at the precipice of a content revolution. Large Language Models (LLMs) like GPT-4 and Claude 3 have fundamentally changed the economics of content creation. But what does the future hold?
        </p>
        <h2>From Generators to Collaborators</h2>
        <p>Early AI tools acted as simple text generators. You put in a prompt, and it spit out an article. Today, AI acts as a collaborative partner. Writers use AI to brainstorm, structure outlines, critique drafts, and optimize for SEO, rather than just generating raw copy.</p>
        <h2>The Death of Generic Content</h2>
        <p>Because AI can generate generic, top-of-funnel content instantly, the value of that content has dropped to zero. To stand out in the future, creators must lean into their humanity: personal anecdotes, deeply researched case studies, and contrarian opinions that AI is trained to avoid.</p>
        <h2>Multimodal Generation</h2>
        <p>The future isn't just text. AI systems are now capable of generating synchronized text, images, and video. Imagine writing a blog post and having the AI automatically generate contextual infographics and a short summary video for social media in one click.</p>
        <h2>Conclusion</h2>
        <p>AI will not replace great writers, but writers who use AI will absolutely replace those who don't. Embrace the tools, refine your unique voice, and focus on the human elements that algorithms cannot replicate.</p>
      </>
    )
  },
  'top-10-ai-tools-for-developers': {
    title: 'Top 10 AI Tools for Developers in 2026',
    category: 'Development',
    date: 'Nov 02, 2026',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200&q=80',
    content: (
      <>
        <p className="lead text-xl font-medium text-foreground">
          Developer productivity has skyrocketed thanks to the proliferation of AI coding assistants and agents. Here are the top 10 tools every developer should have in their stack this year.
        </p>
        <h2>1. GitHub Copilot Workspace</h2>
        <p>Moving beyond inline autocomplete, Copilot Workspace allows you to define a task in natural language, and the AI plans, writes, and tests the code across multiple files automatically.</p>
        <h2>2. Cursor IDE</h2>
        <p>The AI-first code editor that has taken the world by storm. Features like Cursor Compose and multi-file editing make it a massive step up from traditional IDEs.</p>
        <h2>3. Vercel v0</h2>
        <p>For frontend developers, v0 is magic. You prompt it with a description of a UI component, and it generates production-ready React and Tailwind CSS code instantly.</p>
        <h2>4. Supabase Studio AI</h2>
        <p>Database management is no longer a headache. With Supabase's AI integration, you can ask it to write complex Postgres RLS policies and SQL joins just by describing what you need.</p>
        <h2>5. AIToolYes (Our Platform!)</h2>
        <p>Of course, we have to mention our own suite of 20+ AI-powered web tools. From code visualizers to regex testers, AIToolYes is the ultimate companion for everyday developer tasks.</p>
        <p><em>...and many more. The landscape is shifting daily, so stay agile and keep experimenting!</em></p>
      </>
    )
  }
};

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_CONTENT[slug];

  if (!post) {
    return {
      title: 'Post Not Found | AI ToolYes'
    }
  }

  return {
    title: `${post.title} | AI ToolYes Blog`,
    description: `Read about ${post.title} in the AI ToolYes blog. Expert insights and tutorials for developers.`,
    openGraph: {
      title: post.title,
      description: `Read about ${post.title} in the AI ToolYes blog.`,
      images: [post.image],
    }
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_CONTENT[slug];

  if (!post) {
    notFound();
  }
  
  return (
    <article className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-sm font-medium text-primary mb-4">
          <span className="bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
          <span className="text-foreground/50">{post.date}</span>
          <span className="text-foreground/50">•</span>
          <span className="text-foreground/50">{post.readTime}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{post.title}</h1>
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
        <Image src={post.image} alt={post.title} fill className="object-cover" />
      </div>

      <div className="prose prose-lg max-w-none text-foreground/80 marker:text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:text-foreground">
        {post.content}
      </div>
    </article>
  );
}
