'use client';
import { useState } from 'react';
import { Globe, Search, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Activity, Type, Image as ImageIcon, Link as LinkIcon, Share2, LayoutTemplate } from 'lucide-react';

interface SeoMetrics {
  score: number;
  title: { value: string; length: number; status: 'pass' | 'warning' | 'error'; message: string };
  description: { value: string; length: number; status: 'pass' | 'warning' | 'error'; message: string };
  canonical: { value: string; status: 'pass' | 'warning' | 'error'; message: string };
  headings: { h1Count: number; h2Count: number; status: 'pass' | 'warning' | 'error'; message: string };
  images: { total: number; missingAlt: number; status: 'pass' | 'warning' | 'error'; message: string };
  social: { hasOpenGraph: boolean; hasTwitterCard: boolean; status: 'pass' | 'warning' | 'error'; message: string };
  content: { wordCount: number; textToHtmlRatio: number; totalLinks: number; status: 'pass' | 'warning' | 'error'; message: string };
}

export default function AlgorithmicSeoAnalyzer() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<SeoMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setMetrics(null);

    try {
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      const scrapeData = await scrapeRes.json();
      
      if (!scrapeRes.ok || !scrapeData.success) {
        throw new Error(scrapeData.error || 'Failed to scrape website. Ensure the URL is accessible.');
      }

      setMetrics(scrapeData.data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'error') => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'error') => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-100 text-green-700';
      case 'warning': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'error': return 'bg-red-50 border-red-100 text-red-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  // SVG Circular Progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = metrics ? circumference - (metrics.score / 100) * circumference : circumference;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8">
      {/* Header Section */}
      <div className="text-center flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-700 font-bold text-sm">
          <Activity className="w-4 h-4" />
          Advanced Algorithmic SEO Engine
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Lightning SEO Auditor</h1>
        <p className="text-lg text-foreground/70 max-w-2xl">
          Instantly audit any webpage without AI. Our algorithmic parser checks meta tags, content structure, accessibility, and computes a strict technical SEO score in milliseconds.
        </p>
      </div>

      {/* Input Section */}
      <div className="glass-panel p-6 md:p-8 flex flex-col items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        
        <form onSubmit={handleAnalyze} className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input 
              type="url" 
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-card-border bg-white/60 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm text-lg"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5" />
            )}
            Audit Now
          </button>
        </form>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700 flex items-start gap-4 animate-in fade-in zoom-in duration-300">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg mb-1">Audit Failed</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {metrics && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Main Score Card */}
          <div className="md:col-span-1 glass-panel p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                100% Algorithmic
              </div>
            </div>
            
            <h2 className="text-xl font-semibold mb-6">Overall SEO Score</h2>
            
            <div className="relative w-48 h-48 flex items-center justify-center mb-4">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-gray-100"
                />
                {/* Progress Circle */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-1000 ease-out ${getScoreColor(metrics.score)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-5xl font-black ${getScoreColor(metrics.score)}`}>
                  {metrics.score}
                </span>
                <span className="text-sm font-medium text-foreground/50">/ 100</span>
              </div>
            </div>
            
            <p className="text-sm text-foreground/60 max-w-[200px]">
              Based on strict adherence to modern Google technical guidelines.
            </p>
          </div>

          {/* Detailed Metrics Bento Grid */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.title.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Type className="w-4 h-4" /> Page Title
                </div>
                {getStatusIcon(metrics.title.status)}
              </div>
              <p className="text-sm font-medium mb-1 truncate" title={metrics.title.value}>
                {metrics.title.value || 'Not Found'}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs opacity-80">
                <span>{metrics.title.message}</span>
                <span className="font-bold">{metrics.title.length} chars</span>
              </div>
            </div>

            {/* Description */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.description.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <LayoutTemplate className="w-4 h-4" /> Meta Description
                </div>
                {getStatusIcon(metrics.description.status)}
              </div>
              <p className="text-sm font-medium mb-1 line-clamp-2" title={metrics.description.value}>
                {metrics.description.value || 'Not Found'}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs opacity-80">
                <span>{metrics.description.message}</span>
                <span className="font-bold">{metrics.description.length} chars</span>
              </div>
            </div>

            {/* Headings */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.headings.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Type className="w-4 h-4" /> Heading Structure
                </div>
                {getStatusIcon(metrics.headings.status)}
              </div>
              <div className="flex items-center gap-4 my-2">
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">H1 Tags</span>
                  <span className="text-xl font-bold">{metrics.headings.h1Count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">H2 Tags</span>
                  <span className="text-xl font-bold">{metrics.headings.h2Count}</span>
                </div>
              </div>
              <div className="text-xs opacity-80 mt-1">{metrics.headings.message}</div>
            </div>

            {/* Images */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.images.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <ImageIcon className="w-4 h-4" /> Image Optimization
                </div>
                {getStatusIcon(metrics.images.status)}
              </div>
              <div className="flex items-center gap-4 my-2">
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">Total</span>
                  <span className="text-xl font-bold">{metrics.images.total}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">Missing Alt</span>
                  <span className="text-xl font-bold">{metrics.images.missingAlt}</span>
                </div>
              </div>
              <div className="text-xs opacity-80 mt-1">{metrics.images.message}</div>
            </div>

            {/* Content Analysis */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.content.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <LinkIcon className="w-4 h-4" /> Content & Links
                </div>
                {getStatusIcon(metrics.content.status)}
              </div>
              <div className="flex items-center gap-4 my-2">
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">Words</span>
                  <span className="text-xl font-bold">{metrics.content.wordCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">Links</span>
                  <span className="text-xl font-bold">{metrics.content.totalLinks}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs opacity-80">Text/HTML Ratio</span>
                  <span className="text-xl font-bold">{metrics.content.textToHtmlRatio}%</span>
                </div>
              </div>
              <div className="text-xs opacity-80 mt-1">{metrics.content.message}</div>
            </div>

            {/* Social Tags */}
            <div className={`p-5 rounded-2xl border ${getStatusColor(metrics.social.status)} transition-transform hover:scale-[1.02]`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Share2 className="w-4 h-4" /> Social Cards
                </div>
                {getStatusIcon(metrics.social.status)}
              </div>
              <div className="flex flex-col gap-2 mt-2 text-sm font-medium">
                <div className="flex items-center gap-2">
                  {metrics.social.hasOpenGraph ? <CheckCircle2 className="w-4 h-4 opacity-70" /> : <XCircle className="w-4 h-4 opacity-70" />} 
                  OpenGraph (Facebook)
                </div>
                <div className="flex items-center gap-2">
                  {metrics.social.hasTwitterCard ? <CheckCircle2 className="w-4 h-4 opacity-70" /> : <XCircle className="w-4 h-4 opacity-70" />} 
                  Twitter Cards
                </div>
              </div>
              <div className="text-xs opacity-80 mt-3">{metrics.social.message}</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
