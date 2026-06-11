'use client';
import { useState } from 'react';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const generatePassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    
    let result = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      result += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">Password Generator</h1>
      <p className="text-foreground/70">Create strong and secure passwords instantly.</p>
      
      <div className="glass-panel p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white/70 p-4 rounded-xl border border-card-border">
          <span className="font-mono text-xl tracking-wider">{password || 'Click Generate'}</span>
          {password && (
            <button onClick={copyToClipboard} className="text-sm font-medium text-primary hover:underline">
              Copy
            </button>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <label className="font-medium">Password Length: {length}</label>
            <input 
              type="range" 
              min="8" max="64" 
              value={length} 
              onChange={(e) => setLength(Number(e.target.value))}
              className="accent-primary"
            />
          </div>
          
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={includeNumbers} 
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span>Include Numbers (0-9)</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={includeSymbols} 
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span>Include Symbols (!@#$...)</span>
          </label>
        </div>
        
        <button 
          onClick={generatePassword}
          className="mt-4 bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all text-lg"
        >
          Generate Password
        </button>
      </div>
    </div>
  );
}
