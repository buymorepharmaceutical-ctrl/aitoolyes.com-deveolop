'use client';
import { useState } from 'react';
import { Search, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function PrivateSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass-panel p-8 rounded-3xl mb-8 flex flex-col items-center border border-white/20">
        <ShieldCheck className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-3xl font-bold mb-2">Private Web Search</h2>
        <p className="text-foreground/70 mb-8 text-center max-w-lg">
          Powered by DuckDuckGo. No tracking, no ads, no filter bubbles. 
          Just pure, relevant search results fetched securely via our servers.
        </p>

        <form onSubmit={handleSearch} className="w-full relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web securely..."
            className="w-full px-6 py-4 pl-14 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm bg-white"
          />
          <Search className="w-6 h-6 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6 font-medium text-center">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-4">
          {results.map((result, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl hover:shadow-md transition-shadow border border-white/40">
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="block group">
                <h3 className="text-xl font-semibold text-primary group-hover:underline mb-1 flex items-center gap-2">
                  {result.title}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-green-700 truncate mb-2 opacity-80">{result.url}</p>
                <p className="text-foreground/80 leading-relaxed">{result.snippet}</p>
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && !error && (
        <p className="text-center text-foreground/50 mt-10">No results found.</p>
      )}
    </div>
  );
}
