import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const POSTS = [
  {
    title: 'How to build a modern AI Agent SaaS',
    slug: 'how-to-build-a-modern-ai-agent-saas',
    category: 'Development',
    date: 'Oct 24, 2026',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    desc: 'Learn the architecture and design patterns required to build a scalable AI Agent dashboard using Next.js and Glassmorphism.'
  },
  {
    title: 'Mastering Glassmorphism in Tailwind CSS',
    slug: 'mastering-glassmorphism-in-tailwind-css',
    category: 'Design',
    date: 'Oct 20, 2026',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    desc: 'A comprehensive guide to creating beautiful frosted glass effects, working with background blurs, and managing z-indexes.'
  },
  {
    title: 'Best practices for JWT Authentication',
    slug: 'best-practices-for-jwt-authentication',
    category: 'Security',
    date: 'Oct 15, 2026',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    desc: 'Discover how to securely store tokens, prevent XSS attacks, and implement refresh tokens in your web applications.'
  },
  {
    title: 'The Future of AI in Content Creation',
    slug: 'the-future-of-ai-in-content-creation',
    category: 'AI Trends',
    date: 'Oct 28, 2026',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    desc: 'How AI is completely transforming the landscape of content creation, from initial drafts to final SEO optimization.'
  },
  {
    title: 'Top 10 AI Tools for Developers in 2026',
    slug: 'top-10-ai-tools-for-developers',
    category: 'Development',
    date: 'Nov 02, 2026',
    image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80',
    desc: 'Discover the top AI assistants, code translators, and UI generators that are supercharging developer productivity.'
  }
];

export default function BlogIndex() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">Our Blog</h1>
        <p className="text-xl text-foreground/70 max-w-2xl mx-auto">Insights, tutorials, and updates about AI, web development, and design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="flex flex-col gap-4 group cursor-pointer h-full bg-white/40 p-4 rounded-3xl border border-white/50 hover:bg-white/60 transition-all shadow-sm hover:shadow-md">
              <div className="w-full h-56 bg-zinc-200 rounded-2xl overflow-hidden relative">
                <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="px-2 pb-2 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3 mt-2">
                  <span className="bg-primary/10 px-2 py-1 rounded">{post.category}</span>
                  <span className="text-foreground/50">{post.date}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                <p className="text-foreground/70 text-sm line-clamp-3 mb-4">{post.desc}</p>
                
                <span className="mt-auto text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Article <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
