'use client';
import { useState } from 'react';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function AiSummarizer() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    if (!text) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `You are an expert editor. Please provide a concise, actionable summary of the following text using bullet points:\n\n${text}`,
          max_tokens: 500
        }),
      });
      
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate summary');
      }
      
      setSummary(data.output);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'An unexpected error occurred while connecting to Gemma 4.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">AI Content Summarizer</h1>
      <p className="text-foreground/70">Powered by Local Gemma 4. Paste long articles to get instant, secure summaries.</p>
      
      <GoogleAdPlaceholder slot="sum-top-9988" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <label className="font-semibold">Original Text</label>
          <textarea 
            className="w-full h-96 p-4 rounded-xl bg-white/50 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your long text here..."
          />
          <button 
            onClick={generateSummary}
            disabled={loading || !text}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
          >
            {loading ? (
              <><span className="animate-spin text-xl">⚙️</span> Thinking (Gemma 4)...</>
            ) : (
              'Summarize Content'
            )}
          </button>
          {error && <div className="text-red-500 text-sm font-medium mt-1">{error}</div>}
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-semibold">AI Summary</label>
          <textarea 
            className="w-full h-96 p-4 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-100/50 border border-green-200 focus:outline-none font-medium text-sm resize-none text-green-900"
            value={summary}
            readOnly
            placeholder="Your AI-generated summary will appear here..."
          />
          {summary && (
            <button 
              onClick={() => navigator.clipboard.writeText(summary)}
              className="bg-white/50 border border-card-border text-foreground px-6 py-3 rounded-full font-medium hover:bg-white/80 transition-all"
            >
              Copy Summary
            </button>
          )}
        </div>
      </div>
      
      <GoogleAdPlaceholder slot="sum-btm-1122" />
    </div>
  );
}
