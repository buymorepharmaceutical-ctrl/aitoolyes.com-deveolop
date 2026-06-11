'use client';
import { useState } from 'react';

const LOREM_TEXT = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
  "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.",
  "Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam."
];

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [output, setOutput] = useState('');

  const generate = () => {
    let result = '';
    const textPool = LOREM_TEXT.join(' ');
    
    if (type === 'paragraphs') {
      const paras = [];
      for (let i = 0; i < count; i++) {
        let p = '';
        const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3 to 6 sentences
        for (let j = 0; j < sentenceCount; j++) {
          p += LOREM_TEXT[Math.floor(Math.random() * LOREM_TEXT.length)] + ' ';
        }
        paras.push(p.trim());
      }
      result = paras.join('\n\n');
    } else if (type === 'sentences') {
      const sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(LOREM_TEXT[Math.floor(Math.random() * LOREM_TEXT.length)]);
      }
      result = sentences.join(' ');
    } else {
      const wordsArray = textPool.replace(/[.,]/g, '').toLowerCase().split(' ');
      const words = [];
      for (let i = 0; i < count; i++) {
        words.push(wordsArray[Math.floor(Math.random() * wordsArray.length)]);
      }
      result = words.join(' ');
      result = result.charAt(0).toUpperCase() + result.slice(1) + '.';
    }
    setOutput(result);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">Lorem Ipsum Generator</h1>
      <p className="text-foreground/70">Generate dummy text for your designs and mockups.</p>
      
      <div className="glass-panel p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 border-b border-card-border pb-4">
          <input 
            type="number" min="1" max="100" 
            value={count} onChange={(e) => setCount(Number(e.target.value))}
            className="p-2 border rounded-lg w-24"
          />
          <select 
            value={type} onChange={(e) => setType(e.target.value as 'paragraphs' | 'sentences' | 'words')}
            className="p-2 border rounded-lg bg-white"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
          <button 
            onClick={generate}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:bg-opacity-90"
          >
            Generate
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Result</h3>
            <button onClick={copyResult} className="text-sm text-primary font-medium hover:underline">Copy All</button>
          </div>
          <textarea 
            readOnly 
            value={output}
            className="w-full h-80 p-6 rounded-xl bg-white/70 border border-card-border font-serif text-lg leading-relaxed resize-none"
            placeholder="Click generate to get placeholder text..."
          />
        </div>
      </div>
    </div>
  );
}
