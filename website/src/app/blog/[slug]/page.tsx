import { blogs } from '@/data/blogs';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import Head from 'next/head';

// Dynamic SEO Generation
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = blogs.find(b => b.slug === params.slug);
  if (!blog) return { title: 'Not Found' };
  return {
    title: `${blog.title} - AIToolYes`,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: 'article',
      publishedTime: blog.date,
      authors: [blog.author],
      tags: blog.tags,
    }
  };
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const blog = blogs.find(b => b.slug === params.slug);
  
  if (!blog) {
    notFound();
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": blog.title,
              "description": blog.description,
              "author": {
                "@type": "Organization",
                "name": blog.author
              },
              "datePublished": blog.date,
            })
          }}
        />
      </Head>
      <article className="min-h-screen bg-gray-50 py-12 px-6 sm:px-12 pb-32">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-[#2e7d32] font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <header className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-[#2e7d32]/10 text-[#2e7d32] text-xs font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              {blog.title}
            </h1>
            <div className="flex items-center gap-6 text-gray-500 font-medium pb-8 border-b border-gray-200">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5"/> 
                {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-5 h-5"/> 
                {blog.author}
              </span>
            </div>
          </header>

          <div className="prose prose-lg prose-green max-w-none text-gray-700
            prose-h2:text-3xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:mb-6
            prose-li:my-2 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
            prose-strong:text-gray-900 prose-strong:font-bold">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </div>
          
        </div>
      </article>
    </>
  );
}
