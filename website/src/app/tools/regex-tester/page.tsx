'use client';
import { useState, useMemo } from 'react';
import { TextSearch, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('([A-Z])\\\\w+');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('Hello World, this is a Regex Test.');
  
  const regexData = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      
      let match;
      const matches = [];
      let executionCount = 0;
      
      // Avoid infinite loops with bad regex like /(?:)/g
      if (regex.test('')) {
        throw new Error('Pattern matches empty strings, which causes infinite loops.');
      }
      
      // Reset lastIndex just in case
      regex.lastIndex = 0;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          executionCount++;
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (executionCount > 1000) break; // sanity limit
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            value: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      return { regex, matches, valid: true, error: null };
    } catch (e) {
      return { regex: null, matches: [], valid: false, error: e instanceof Error ? e.message : 'Invalid Regex' };
    }
  }, [pattern, flags, testString]);

  // Helper to render the highlighted text
  const renderHighlightedText = () => {
    if (!regexData.valid || regexData.matches.length === 0) {
      return <div className="p-4 font-mono text-sm whitespace-pre-wrap">{testString}</div>;
    }

    const result = [];
    let lastIndex = 0;

    regexData.matches.forEach((match, i) => {
      // Push text before match
      if (match.index > lastIndex) {
        result.push(
          <span key={`text-\${i}`}>{testString.substring(lastIndex, match.index)}</span>
        );
      }
      // Push highlighted match
      result.push(
        <span 
          key={`match-\${i}`} 
          className="bg-primary/20 text-primary-foreground font-bold px-0.5 rounded border-b-2 border-primary"
          title={`Match \${i + 1}`}
        >
          {match.value}
        </span>
      );
      lastIndex = match.index + match.value.length;
    });

    // Push remaining text
    if (lastIndex < testString.length) {
      result.push(<span key="text-end">{testString.substring(lastIndex)}</span>);
    }

    return <div className="p-4 font-mono text-sm whitespace-pre-wrap leading-loose">{result}</div>;
  };

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  const availableFlags = [
    { id: 'g', label: 'Global', desc: 'Match all occurrences' },
    { id: 'i', label: 'Case Insensitive', desc: 'Ignore case differences' },
    { id: 'm', label: 'Multiline', desc: '^ and $ match start/end of line' },
    { id: 's', label: 'Dotall', desc: 'Dot (.) matches newline' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <TextSearch className="w-8 h-8 text-primary" />
          Regex Tester & Visualizer
        </h1>
        <p className="text-foreground/70 mt-1">Write, test, and visualize Regular Expressions against your string data.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        
        {/* Left Column: Input & Test String */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Regex Input Card */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-card-border p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-bold flex items-center gap-2">Regular Expression</h2>
            <div className="flex items-center gap-0">
              <div className="bg-gray-200 text-gray-600 font-bold px-4 py-3 rounded-l-xl border border-r-0 border-card-border">/</div>
              <input 
                type="text" 
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="flex-1 bg-white border border-card-border py-3 px-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter regex pattern..."
              />
              <div className="bg-gray-200 text-gray-600 font-bold px-4 py-3 border border-x-0 border-card-border">/</div>
              <input 
                type="text" 
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                className="w-20 bg-white border border-card-border py-3 px-4 rounded-r-xl font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-primary"
                placeholder="gims"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {availableFlags.map(f => (
                <button 
                  key={f.id}
                  onClick={() => toggleFlag(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors \${flags.includes(f.id) ? 'bg-primary text-primary-foreground' : 'bg-white border border-card-border text-foreground/70 hover:bg-gray-50'}`}
                  title={f.desc}
                >
                  {f.id} - {f.label}
                </button>
              ))}
            </div>

            {!regexData.valid && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                {regexData.error}
              </div>
            )}
          </div>

          {/* Test String Card */}
          <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-card-border overflow-hidden shadow-sm">
            <div className="bg-white/60 px-4 py-3 border-b border-card-border flex items-center justify-between">
              <h2 className="font-bold">Test String</h2>
            </div>
            <textarea 
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="flex-1 w-full bg-transparent p-6 focus:outline-none font-mono resize-none"
              placeholder="Paste the text you want to test your regex against..."
            />
          </div>
        </div>

        {/* Right Column: Output / Visualization */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-md rounded-2xl border border-card-border overflow-hidden shadow-sm">
            <div className="bg-white/60 px-4 py-3 border-b border-card-border flex items-center justify-between">
              <h2 className="font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 
                Match Results ({regexData.matches.length})
              </h2>
            </div>
            
            {/* Visualizer output */}
            <div className="relative border-b border-card-border bg-white min-h-[150px] max-h-[300px] overflow-auto">
              {renderHighlightedText()}
            </div>
            
            {/* Detailed Match list */}
            <div className="flex-1 overflow-auto bg-gray-50/50 p-4">
              {regexData.matches.length === 0 ? (
                <div className="text-center text-foreground/50 text-sm mt-8">No matches found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {regexData.matches.map((m, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-card-border shadow-sm text-sm">
                      <div className="font-semibold text-primary mb-1 flex items-center gap-2">
                        Match {idx + 1}
                        <span className="text-xs font-normal bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Index: {m.index}</span>
                      </div>
                      <div className="font-mono bg-gray-100 p-2 rounded break-all">{m.value}</div>
                      
                      {m.groups && m.groups.length > 0 && m.groups.some(g => g !== undefined) && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Capture Groups</span>
                          {m.groups.map((grp, gIdx) => grp !== undefined ? (
                            <div key={gIdx} className="flex gap-2 items-center text-xs mt-1">
                              <span className="text-gray-400">Group {gIdx + 1}:</span>
                              <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex-1 truncate">{grp}</span>
                            </div>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
