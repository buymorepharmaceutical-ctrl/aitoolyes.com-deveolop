'use client';
import { useState } from 'react';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateMultiple = () => {
    const newUuids = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUUID());
    }
    setUuids(newUuids);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">UUID / GUID Generator</h1>
      <p className="text-foreground/70">Generate random v4 UUIDs instantly.</p>
      
      <div className="glass-panel p-6 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <label className="font-medium">How many?</label>
          <input 
            type="number" min="1" max="100" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))}
            className="p-2 border rounded-lg w-24"
          />
          <button 
            onClick={generateMultiple}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-opacity-90"
          >
            Generate
          </button>
        </div>
        
        {uuids.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Results</h3>
              <button onClick={copyAll} className="text-sm text-primary font-medium hover:underline">Copy All</button>
            </div>
            <textarea 
              readOnly 
              value={uuids.join('\n')}
              className="w-full h-64 p-4 rounded-xl bg-white/50 border border-card-border font-mono text-sm resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
