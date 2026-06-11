'use client';
import { useState, useEffect } from 'react';
import { Layers, Copy, Check, SlidersHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(10);
  const [transparency, setTransparency] = useState(0.2);
  const [color, setColor] = useState('#ffffff');
  const [outlineSize, setOutlineSize] = useState(1);
  const [outlineTransparency, setOutlineTransparency] = useState(0.3);
  const [shadowSize, setShadowSize] = useState(30);
  const [shadowTransparency, setShadowTransparency] = useState(0.1);
  const [bgIndex, setBgIndex] = useState(0);
  const [outputMode, setOutputMode] = useState<'css' | 'tailwind'>('css');

  const [copied, setCopied] = useState(false);

  const backgrounds = [
    'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")',
  ];

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getCss = () => {
    return `.glass-card {
  background: ${hexToRgba(color, transparency)};
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: ${outlineSize}px solid ${hexToRgba('#ffffff', outlineTransparency)};
  box-shadow: 0 8px ${shadowSize}px 0 ${hexToRgba('#1f2687', shadowTransparency)};
  border-radius: 20px;
}`;
  };

  const getTailwind = () => {
    const bg = hexToRgba(color, transparency).replace(/ /g, '');
    const borderColor = hexToRgba('#ffffff', outlineTransparency).replace(/ /g, '');
    const shadowColor = hexToRgba('#1f2687', shadowTransparency).replace(/ /g, '');
    
    return `bg-[${bg}] backdrop-blur-[${blur}px] border-[${outlineSize}px] border-[${borderColor}] shadow-[0_8px_${shadowSize}px_0_${shadowColor}] rounded-[20px]`;
  };

  const handleCopy = async () => {
    const textToCopy = outputMode === 'css' ? getCss() : getTailwind();
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] gap-6 p-4 lg:p-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-8 h-8 text-fuchsia-500" />
          Glassmorphism Generator
        </h1>
        <p className="text-foreground/70 mt-1">Visually design and export premium CSS glass effects and gradients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 bg-white/60 border border-card-border p-6 rounded-3xl shadow-sm backdrop-blur-md overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-card-border pb-4 mb-2">
            <SlidersHorizontal className="w-5 h-5 text-fuchsia-600" />
            <h2 className="font-bold text-lg">Properties</h2>
          </div>

          <div className="space-y-6">
            {/* Blur */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Blur Value</label>
                <span className="text-fuchsia-600">{blur}px</span>
              </div>
              <input type="range" min="0" max="40" step="1" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Transparency */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Background Opacity</label>
                <span className="text-fuchsia-600">{Math.round(transparency * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={transparency} onChange={(e) => setTransparency(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Base Color */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Base Color</label>
                <span className="text-fuchsia-600 uppercase font-mono">{color}</span>
              </div>
              <div className="flex gap-2">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-10 p-1 border border-card-border rounded cursor-pointer" />
                <button onClick={() => setColor('#ffffff')} className="px-3 py-1.5 bg-white border border-card-border rounded hover:bg-gray-50 text-sm font-medium">Light</button>
                <button onClick={() => setColor('#000000')} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-white rounded hover:bg-zinc-800 text-sm font-medium">Dark</button>
              </div>
            </div>

            {/* Outline Size */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Border Size</label>
                <span className="text-fuchsia-600">{outlineSize}px</span>
              </div>
              <input type="range" min="0" max="5" step="1" value={outlineSize} onChange={(e) => setOutlineSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Outline Transparency */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Border Opacity</label>
                <span className="text-fuchsia-600">{Math.round(outlineTransparency * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={outlineTransparency} onChange={(e) => setOutlineTransparency(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Shadow Size */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Shadow Blur</label>
                <span className="text-fuchsia-600">{shadowSize}px</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={shadowSize} onChange={(e) => setShadowSize(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Shadow Transparency */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <label>Shadow Opacity</label>
                <span className="text-fuchsia-600">{Math.round(shadowTransparency * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" value={shadowTransparency} onChange={(e) => setShadowTransparency(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500" />
            </div>

            {/* Change Test Background */}
            <div className="pt-4 border-t border-card-border">
              <label className="text-sm font-semibold mb-3 block">Test Background</label>
              <div className="flex flex-wrap gap-2">
                {backgrounds.map((bg, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setBgIndex(idx)}
                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${bgIndex === idx ? 'border-fuchsia-600 shadow-md scale-110' : 'border-transparent'}`}
                    style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Preview & Code */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Live Preview Area */}
          <div 
            className="flex-1 rounded-3xl min-h-[400px] flex items-center justify-center p-8 transition-all duration-500 relative overflow-hidden"
            style={{ backgroundImage: backgrounds[bgIndex], backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            {/* Animated shapes behind the glass card for effect */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            {/* The Glass Card */}
            <div 
              className="relative w-full max-w-md p-10 flex flex-col items-center justify-center text-center transition-all duration-200"
              style={{
                background: hexToRgba(color, transparency),
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: `${outlineSize}px solid ${hexToRgba('#ffffff', outlineTransparency)}`,
                boxShadow: `0 8px ${shadowSize}px 0 ${hexToRgba('#1f2687', shadowTransparency)}`,
                borderRadius: '24px'
              }}
            >
              <h2 className={`text-3xl font-bold mb-4 ${color === '#ffffff' ? 'text-black/80' : 'text-white'}`}>Glass Effect</h2>
              <p className={`font-medium ${color === '#ffffff' ? 'text-black/60' : 'text-white/80'}`}>
                This is a live preview of your generated glassmorphism design. The animated blobs behind help demonstrate the blur filter.
              </p>
              <button className={`mt-8 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 ${color === '#ffffff' ? 'bg-black/10 hover:bg-black/20 text-black/80' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                Test Button
              </button>
            </div>
          </div>

          {/* Generated CSS Code */}
          <div className="bg-[#1e1e1e] rounded-3xl overflow-hidden shadow-lg h-64 flex flex-col">
            <div className="bg-[#2d2d2d] px-6 py-3 border-b border-[#404040] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 font-mono text-sm font-semibold flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                </span>
                <div className="flex bg-[#1e1e1e] rounded-lg p-0.5">
                  <button onClick={() => setOutputMode('css')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${outputMode === 'css' ? 'bg-[#3b3b3b] text-white' : 'text-gray-400 hover:text-white'}`}>CSS</button>
                  <button onClick={() => setOutputMode('tailwind')} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${outputMode === 'tailwind' ? 'bg-[#3b3b3b] text-white' : 'text-gray-400 hover:text-white'}`}>Tailwind</button>
                </div>
              </div>
              <button 
                onClick={handleCopy}
                className="text-xs flex items-center gap-1.5 bg-fuchsia-600/20 text-fuchsia-300 px-3 py-1.5 rounded hover:bg-fuchsia-600/40 transition-colors font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 p-4">
              <Editor
                height="100%"
                language={outputMode === 'css' ? 'css' : 'html'}
                value={outputMode === 'css' ? getCss() : getTailwind()}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, readOnly: true, fontSize: 14, padding: { top: 8 }, wordWrap: 'on' }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
