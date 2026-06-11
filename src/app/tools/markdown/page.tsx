'use client';
import { useState, useEffect } from 'react';
import { marked } from 'marked';

export default function MarkdownConverter() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nWrite your **markdown** here...');
  const [html, setHtml] = useState('');

  useEffect(() => {
    const parse = async () => {
      const parsed = await marked.parse(markdown);
      setHtml(parsed);
    };
    parse();
  }, [markdown]);

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto py-8 h-[80vh]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Markdown to HTML</h1>
          <p className="text-foreground/70">Convert markdown text to raw HTML or preview it live.</p>
        </div>
        <button 
          onClick={copyHtml}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
        >
          Copy HTML Code
        </button>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <div className="flex flex-col gap-2 h-full">
          <label className="font-semibold text-sm">Markdown Input</label>
          <textarea 
            className="w-full flex-1 p-4 rounded-xl bg-white/50 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 h-full">
          <label className="font-semibold text-sm">Live Preview / HTML Output</label>
          <div className="flex-1 bg-white/80 border border-card-border rounded-xl p-4 overflow-auto prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
