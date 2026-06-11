'use client';
import { useState } from 'react';
import { Globe, Search, Sparkles, CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { marked } from 'marked';

export default function AdvancedSeoAnalyzer() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [reportHtml, setReportHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setReportHtml(null);

    try {
      // Step 1: Scrape the website
      setLoadingStep('Scraping website data...');
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const scrapeData = await scrapeRes.json();
      
      if (!scrapeRes.ok || !scrapeData.success) {
        throw new Error(scrapeData.error || 'Failed to scrape website. Ensure the URL is accessible.');
      }

      // Step 2: Analyze with AI
      setLoadingStep('Running Advanced AI Analysis...');
      
      const systemPrompt = `You are a World-Class SEO Expert and Technical Auditor. You have been tasked with auditing a website to improve its Google Search Rankings.`;
      
      const userPrompt = `
Please perform a comprehensive SEO Audit on the following extracted website data:

**Target URL:** ${url}
**Page Title:** ${scrapeData.title || '[MISSING]'}
**Meta Description:** ${scrapeData.description || '[MISSING]'}
**H1 Tags:** ${scrapeData.h1s.length > 0 ? scrapeData.h1s.join(' | ') : '[MISSING]'}
**H2 Tags:** ${scrapeData.h2s.length > 0 ? scrapeData.h2s.join(' | ') : '[MISSING]'}
**Content Snippet (first 3000 chars):** ${scrapeData.bodyText}

**Your Task:**
1. **Overall SEO Score**: Give an overall score out of 100.
2. **Critical Issues**: Identify any missing tags, poor length, or structural issues.
3. **Keyword Analysis**: Based on the content, what are the primary keywords this page is currently targeting? What *should* it target?
4. **Actionable Recommendations**: Provide a newly optimized Title (max 60 chars) and Meta Description (max 160 chars).
5. **Content Suggestions**: Advise on content gaps or readability improvements.

Format your response completely in **Markdown**. Use tables, bold text, and bullet points to make the report look extremely premium and easy to read.
`;

      const aiRes = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000
        })
      });

      if (!aiRes.ok) {
        throw new Error('AI Backend failed to process the request. Make sure the local LLM is running.');
      }

      const aiData = await aiRes.json();
      
      // Parse markdown to HTML
      const htmlContent = marked.parse(aiData.response);
      setReportHtml(htmlContent as string);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-8">
      {/* Header Section */}
      <div className="text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          AI-Powered SEO Auditor
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Advanced SEO Analyzer</h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Enter any website URL to instantly scrape its metadata and content. Our local AI will analyze it and generate a comprehensive SEO audit report.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-panel p-6 md:p-8 flex flex-col items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
        
        <form onSubmit={handleAnalyze} className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input 
              type="url" 
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-card-border bg-white/60 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm text-lg"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
            Analyze URL
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel p-12 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-600 animate-bounce" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Analyzing Website</h3>
            <p className="text-foreground/60">{loadingStep}</p>
          </div>
          <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-emerald-500 rounded-full animate-[ping_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {reportHtml && !isLoading && (
        <div className="glass-panel p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
              AI Generated Report
            </div>
          </div>
          
          <div 
            className="prose prose-lg max-w-none prose-headings:text-emerald-900 prose-a:text-teal-600 prose-table:border-collapse prose-th:bg-emerald-50 prose-th:border-emerald-100 prose-td:border-gray-100 prose-th:p-4 prose-td:p-4 prose-th:text-left prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl"
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        </div>
      )}

    </div>
  );
}
