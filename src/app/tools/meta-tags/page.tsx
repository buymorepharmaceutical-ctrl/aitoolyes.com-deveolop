'use client';
import { useState } from 'react';

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');

  const generateMetaTags = () => {
    return `<!-- Primary Meta Tags -->
<title>${title || 'Page Title'}</title>
<meta name="title" content="${title || 'Page Title'}">
<meta name="description" content="${description || 'Page description'}">
<meta name="keywords" content="${keywords || 'keyword1, keyword2'}">
<meta name="author" content="${author || 'Author Name'}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:title" content="${title || 'Page Title'}">
<meta property="og:description" content="${description || 'Page description'}">
<meta property="og:image" content="${image || 'https://example.com/image.jpg'}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${title || 'Page Title'}">
<meta property="twitter:description" content="${description || 'Page description'}">
<meta property="twitter:image" content="${image || 'https://example.com/image.jpg'}">`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMetaTags());
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">Meta Tag Generator</h1>
      <p className="text-foreground/70">Create SEO-friendly meta tags and Open Graph tags for your website.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Site Title (Max 60 chars)</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Eloxon - AI Tools"
            />
            <span className="text-xs text-foreground/50 text-right">{title.length} / 60</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Site Description (Max 160 chars)</label>
            <textarea 
              className="w-full p-3 h-24 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Free problem solving tools and articles for developers."
            />
            <span className="text-xs text-foreground/50 text-right">{description.length} / 160</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Keywords (Comma separated)</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. SEO, tools, AI, json, base64"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Author Name</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Image URL (For social sharing)</label>
            <input 
              type="text" 
              className="w-full p-3 rounded-lg border border-card-border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="e.g. https://yoursite.com/og-image.jpg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-semibold">Generated HTML Code</label>
          <textarea 
            className="w-full flex-1 p-4 rounded-xl bg-gray-900 text-green-400 font-mono text-sm resize-none focus:outline-none"
            value={generateMetaTags()}
            readOnly
          />
          <button 
            onClick={copyToClipboard}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all text-center"
          >
            Copy Meta Tags
          </button>
        </div>
      </div>
    </div>
  );
}
