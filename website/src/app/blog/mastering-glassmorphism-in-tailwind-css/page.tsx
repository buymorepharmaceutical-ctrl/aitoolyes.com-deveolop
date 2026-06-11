import React from 'react';
import Link from 'next/link';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function BlogPost() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/#blog" className="text-primary hover:underline font-medium mb-8 inline-block">
        ← Back to Blog
      </Link>
      
      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
        <span className="bg-primary/10 px-3 py-1 rounded-full">Design</span>
        <span className="text-foreground/50">Oct 20, 2026</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Mastering Glassmorphism in Tailwind CSS</h1>
      
      <GoogleAdPlaceholder slot="blog2-top-1122" />
      
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed mt-8">
        <p>Glassmorphism is a UI design trend that emphasizes light or dark objects placed on top of colorful backgrounds, with a background-blur which allows the background to shine through the elements. It gives a premium, "iOS-like" feel to your web applications.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">The Magic of Backdrop Filter</h2>
        <p>The core CSS property behind Glassmorphism is <code>backdrop-filter</code>. Unlike a regular blur, which blurs the element itself, a backdrop filter blurs everything <em>behind</em> the element.</p>
        
        <GoogleAdPlaceholder slot="blog2-mid-3344" />
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Implementing with Tailwind CSS</h2>
        <p>Tailwind makes it incredibly easy to create glass panels. You just need three key utilities:</p>
        <ul>
          <li><strong>Translucent Background:</strong> <code>bg-white/10</code> or <code>bg-black/30</code></li>
          <li><strong>Backdrop Blur:</strong> <code>backdrop-blur-md</code> or <code>backdrop-blur-xl</code></li>
          <li><strong>Subtle Border:</strong> <code>border border-white/20</code></li>
        </ul>
        
        <pre className="bg-black/80 text-green-400 p-4 rounded-xl overflow-x-auto mt-4 mb-4">
{`<div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-xl">
  <h3 className="text-xl font-bold">Glass Card</h3>
  <p>This card looks like frosted glass!</p>
</div>`}
        </pre>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Tips for Perfect Glass</h2>
        <p>Glassmorphism only looks good if there is something colorful behind it. If your page has a solid white or solid black background, glassmorphism will just look like a solid gray box. Always pair glass UI with a vibrant, colorful, or animated background!</p>
      </div>
      
      <GoogleAdPlaceholder slot="blog2-bottom-5566" />
    </div>
  );
}
