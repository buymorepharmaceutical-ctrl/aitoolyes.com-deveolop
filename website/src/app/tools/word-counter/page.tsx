'use client';
import { useState, useMemo } from 'react';

export default function WordCounter() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(Boolean).length : 0;
    const readingTime = Math.ceil(words / 200); // Avg 200 words per min

    // Keyword Density (1-word)
    const wordsArray = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordCounts: Record<string, number> = {};
    wordsArray.forEach(w => {
      // Basic stop word filter could go here
      if (w.length > 2) {
        wordCounts[w] = (wordCounts[w] || 0) + 1;
      }
    });
    
    const density = Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        percentage: ((count / words) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { characters, charactersNoSpaces, words, sentences, paragraphs, readingTime, density };
  }, [text]);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">SEO Word Counter</h1>
      <p className="text-foreground/70">Analyze word count, reading time, and keyword density.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <textarea 
            className="w-full h-96 p-4 rounded-xl bg-white/70 border border-card-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Type or paste your content here...'
          />
          <button 
            onClick={() => setText('')}
            className="self-end bg-white/50 border border-card-border text-foreground px-6 py-2 rounded-full font-medium hover:bg-white/80 transition-all"
          >
            Clear Text
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-xl font-semibold border-b border-card-border pb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-3xl font-bold text-primary">{stats.words}</div>
                <div className="text-xs text-foreground/70 font-medium uppercase tracking-wider">Words</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{stats.characters}</div>
                <div className="text-xs text-foreground/70 font-medium uppercase tracking-wider">Characters</div>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.sentences}</div>
                <div className="text-xs text-foreground/70 font-medium uppercase tracking-wider">Sentences</div>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.paragraphs}</div>
                <div className="text-xs text-foreground/70 font-medium uppercase tracking-wider">Paragraphs</div>
              </div>
            </div>
            <div className="mt-2 pt-4 border-t border-card-border flex justify-between items-center">
              <span className="text-sm font-medium">Est. Reading Time</span>
              <span className="font-bold">{stats.readingTime} min</span>
            </div>
          </div>

          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-xl font-semibold border-b border-card-border pb-2">Keyword Density</h3>
            {stats.density.length > 0 ? (
              <div className="flex flex-col gap-2">
                {stats.density.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate max-w-[120px]">{item.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground/60">{item.count}x</span>
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/50">Enter text to see keywords.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
