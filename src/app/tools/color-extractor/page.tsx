/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useRef } from 'react';

export default function ColorExtractor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      extractColors(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractColors = (src: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw image to canvas scaled down to speed up processing
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const colorCounts: Record<string, number> = {};

      // Sample pixels (every 10th pixel)
      for (let i = 0; i < data.length; i += 40) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a < 128) continue; // Skip transparent pixels
        
        // Quantize colors slightly to group similar ones
        const rgb = `rgb(${Math.round(r / 10) * 10}, ${Math.round(g / 10) * 10}, ${Math.round(b / 10) * 10})`;
        colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
      }

      // Sort by frequency and get top 8
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([color]) => color);

      // Convert rgb string back to hex for better display
      const hexColors = sortedColors.map(c => {
        const [r, g, b] = c.match(/\d+/g)!.map(Number);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
      });

      setColors(hexColors);
    };
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color}`);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-foreground">Color Palette Extractor</h1>
      <p className="text-foreground/70">Upload an image to extract its dominant colors instantly.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-6 flex flex-col gap-4 items-center justify-center min-h-[300px] border-dashed border-2 border-primary/30">
          {!imageSrc ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="w-12 h-12 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90">
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <p className="text-xs text-foreground/50">PNG, JPG, WEBP</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center">
              <img src={imageSrc} alt="Uploaded" className="max-h-[300px] object-contain rounded-lg shadow-md" />
              <button 
                onClick={() => { setImageSrc(null); setColors([]); }}
                className="mt-4 text-sm text-red-500 hover:underline font-medium"
              >
                Remove Image
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Extracted Palette</h2>
          {colors.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                  onClick={() => copyColor(color)}
                >
                  <div 
                    className="w-16 h-16 rounded-full shadow-md border-2 border-white/50 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">{color}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-foreground/50 text-sm">
              Upload an image to see the palette here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
