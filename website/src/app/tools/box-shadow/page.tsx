'use client';
import { useState } from 'react';

export default function BoxShadowGenerator() {
  const [hOffset, setHOffset] = useState(10);
  const [vOffset, setVOffset] = useState(10);
  const [blur, setBlur] = useState(15);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('rgba(0,0,0,0.25)');
  const [inset, setInset] = useState(false);

  const cssString = `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${color}`;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">CSS Box Shadow Generator</h1>
      <p className="text-foreground/70">Visually design box shadows and copy the CSS code.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm flex justify-between">Horizontal Offset <span>{hOffset}px</span></label>
            <input type="range" min="-50" max="50" value={hOffset} onChange={(e) => setHOffset(Number(e.target.value))} className="accent-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm flex justify-between">Vertical Offset <span>{vOffset}px</span></label>
            <input type="range" min="-50" max="50" value={vOffset} onChange={(e) => setVOffset(Number(e.target.value))} className="accent-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm flex justify-between">Blur Radius <span>{blur}px</span></label>
            <input type="range" min="0" max="100" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="accent-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm flex justify-between">Spread Radius <span>{spread}px</span></label>
            <input type="range" min="-50" max="50" value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="accent-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-sm">Shadow Color (RGBA/HEX)</label>
            <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="p-2 border rounded" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="w-5 h-5 accent-primary" />
            <span className="font-medium">Inset</span>
          </label>
        </div>

        <div className="flex flex-col gap-8 items-center justify-center">
          <div 
            className="w-48 h-48 bg-white rounded-xl transition-all"
            style={{ boxShadow: cssString }}
          ></div>
          
          <div className="w-full flex flex-col gap-2">
            <label className="font-semibold">CSS Code</label>
            <textarea 
              readOnly 
              value={`box-shadow: ${cssString};\n-webkit-box-shadow: ${cssString};\n-moz-box-shadow: ${cssString};`}
              className="w-full p-4 rounded-xl bg-gray-900 text-green-400 font-mono text-sm resize-none h-32"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
