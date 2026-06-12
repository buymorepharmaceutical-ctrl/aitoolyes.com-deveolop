import Link from 'next/link';
import { blogs } from '@/data/blogs';
import { ArrowRight, BookOpen, Calendar, User } from 'lucide-react';

export const metadata = {
  title: 'Blog - AIToolYes',
  description: 'Read the latest news, guides, and tutorials about Artificial Intelligence, Machine Learning, and AIToolYes platform updates.',
};

export default function BlogList({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams.page || '1');
  const POSTS_PER_PAGE = 6;
  
  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentBlogs = blogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <div className="min-h-screen p-6 sm:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
              Our Blog
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl">
            Dive into the world of On-Device Machine Learning, SEO optimization, career advice, and technical deep-dives from the engineering team at AIToolYes.
          </p>
        </header>

        <div className="grid gap-8">
          {currentBlogs.map((blog) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`}>
              <article className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#2e7d32]/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className="flex flex-col sm:flex-row gap-6 justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-[#f0f9f0] text-[#2e7d32] text-xs font-bold uppercase tracking-wider rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-[#2e7d32] transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {blog.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {blog.author}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center p-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#2e7d32] group-hover:text-white text-gray-400 transition-colors">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNumber = i + 1;
              const isActive = pageNumber === currentPage;
              return (
                <Link 
                  key={pageNumber} 
                  href={`/blog?page=${pageNumber}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${isActive ? 'bg-[#2e7d32] text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
