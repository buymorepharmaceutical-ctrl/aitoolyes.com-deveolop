/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useRef, useEffect } from 'react';
import { Pipette, Upload, Copy, Check, Palette, Download, Trash2, Contrast } from 'lucide-react';

// Utility: Hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Utility: RGB to HSL
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return {
    h: Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h),
    s: Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)),
    l: Math.round((100 * (2 * l - s)) / 2),
  };
};

// Utility: HSL to Hex
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

// Utility: Calculate Luminance for Contrast
const getLuminance = (r: number, g: number, b: number) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// Get approximate color name based on hue and lightness
const getColorName = (h: number, s: number, l: number) => {
  if (l < 15) return "Deep Black";
  if (l > 90) return "Bright White";
  if (s < 10) return "Neutral Gray";
  
  if (h >= 0 && h < 15) return "Crimson Red";
  if (h >= 15 && h < 45) return "Sunset Orange";
  if (h >= 45 && h < 65) return "Golden Yellow";
  if (h >= 65 && h < 150) return "Emerald Green";
  if (h >= 150 && h < 210) return "Ocean Cyan";
  if (h >= 210 && h < 260) return "Royal Blue";
  if (h >= 260 && h < 310) return "Vibrant Purple";
  if (h >= 310 && h < 345) return "Hot Pink";
  return "Crimson Red"; // wrap around
};

export default function AdvancedColorExtractor() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [copied, setCopied] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if ('EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      extractColorsFromImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractColorsFromImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Fast K-Means Clustering for Dominant Colors
      const k = 6;
      let centroids: {r: number, g: number, b: number}[] = [];
      const pixelStep = 40; // Sample every 10th pixel for speed
      
      // 1. Initialize random centroids from actual image pixels
      for (let i = 0; i < k; i++) {
        let idx = Math.floor(Math.random() * (data.length / 4)) * 4;
        centroids.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }

      // 2. Run K-Means for a few iterations
      for (let iter = 0; iter < 5; iter++) {
        const clusters = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, count: 0 }));
        
        for (let i = 0; i < data.length; i += pixelStep) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) continue; // Skip transparent
          
          // Find closest centroid (using Manhattan distance for speed)
          let minDist = Infinity;
          let minIdx = 0;
          for (let j = 0; j < k; j++) {
            const dist = Math.abs(r - centroids[j].r) + Math.abs(g - centroids[j].g) + Math.abs(b - centroids[j].b);
            if (dist < minDist) {
              minDist = dist;
              minIdx = j;
            }
          }
          
          clusters[minIdx].r += r;
          clusters[minIdx].g += g;
          clusters[minIdx].b += b;
          clusters[minIdx].count++;
        }
        
        // Update centroids
        centroids = clusters.map(c => 
          c.count === 0 
            ? { r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255) } 
            : { r: Math.round(c.r / c.count), g: Math.round(c.g / c.count), b: Math.round(c.b / c.count) }
        );
      }

      // Sort by perceived luminance to create a nice gradient palette
      const hexColors = centroids.sort((a, b) => {
        const lumA = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
        const lumB = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
        return lumA - lumB;
      }).map(c => {
        return "#" + ((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1).toUpperCase();
      });

      setExtractedColors(hexColors);
      if (hexColors.length > 0) setSelectedColor(hexColors[0]);
    };
  };

  const pickColorFromScreen = async () => {
    if (!hasEyeDropper) {
      alert("Your browser does not support the EyeDropper API. Please try Chrome or Edge.");
      return;
    }
    try {
      // @ts-ignore - EyeDropper API is not fully typed yet
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      setSelectedColor(result.sRGBHex.toUpperCase());
    } catch (e) {
      console.log('EyeDropper cancelled');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportTailwindConfig = () => {
    const config = `theme: {
  extend: {
    colors: {
      primary: '${selectedColor}',
      secondary: '${harmonies.complementary}',
      accent1: '${harmonies.analogous1}',
      accent2: '${harmonies.analogous2}',
    }
  }
}`;
    copyToClipboard(config, 'tailwind');
  };

  const exportCssVariables = () => {
    const css = `:root {
  --color-primary: ${selectedColor};
  --color-secondary: ${harmonies.complementary};
  --color-accent-1: ${harmonies.analogous1};
  --color-accent-2: ${harmonies.analogous2};
}`;
    copyToClipboard(css, 'css');
  };

  // Color Math & Data
  const { r, g, b } = hexToRgb(selectedColor);
  const { h, s, l } = rgbToHsl(r, g, b);
  const colorName = getColorName(h, s, l);
  const luminance = getLuminance(r, g, b);
  
  // Harmonies
  const harmonies = {
    complementary: hslToHex((h + 180) % 360, s, l),
    analogous1: hslToHex((h + 30) % 360, s, l),
    analogous2: hslToHex((h + 330) % 360, s, l),
    triadic1: hslToHex((h + 120) % 360, s, l),
    triadic2: hslToHex((h + 240) % 360, s, l),
  };

  // Contrast checking (WCAG guidelines: >4.5 for text)
  const whiteContrast = (1.05) / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;
  const bestTextColor = whiteContrast > blackContrast ? '#FFFFFF' : '#000000';

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
            <Palette className="w-8 h-8 text-primary" />
            Advanced Color Studio
          </h1>
          <p className="text-foreground/70 mt-2 text-lg">Extract, analyze, and generate perfect color palettes.</p>
        </div>
        {hasEyeDropper && (
          <button 
            onClick={pickColorFromScreen}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Pipette className="w-5 h-5" />
            Pick from Screen
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Image & Extraction */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl min-h-[300px] flex flex-col items-center justify-center border-dashed border-2 border-primary/30 relative overflow-hidden group">
            {!imageSrc ? (
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <label className="cursor-pointer bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 shadow-md transition-all">
                  Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <p className="text-sm text-foreground/50 text-center px-4">Upload an image to auto-extract the dominant palette.</p>
              </div>
            ) : (
              <div className="relative w-full flex flex-col items-center">
                <img src={imageSrc} alt="Uploaded" className="max-h-[350px] w-full object-contain rounded-xl shadow-lg" />
                <button 
                  onClick={() => { setImageSrc(null); setExtractedColors([]); }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors backdrop-blur-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {extractedColors.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl">
              <h3 className="font-semibold mb-4 text-foreground">Extracted Palette</h3>
              <div className="flex flex-wrap gap-3">
                {extractedColors.map((color, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full shadow-md border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-primary scale-110 ring-4 ring-primary/20' : 'border-white/20'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Analysis & Harmonies */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Color Header */}
          <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/20 flex flex-col md:flex-row">
            <div 
              className="h-40 md:h-auto md:w-48 flex items-center justify-center transition-colors duration-500 relative group"
              style={{ backgroundColor: selectedColor }}
            >
              <button 
                onClick={() => copyToClipboard(selectedColor, 'hex')}
                className="opacity-0 group-hover:opacity-100 absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white backdrop-blur-sm transition-all"
              >
                {copied === 'hex' ? <Check className="w-8 h-8" /> : <Copy className="w-8 h-8" />}
                <span className="font-bold mt-2">{copied === 'hex' ? 'Copied!' : 'Copy HEX'}</span>
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 bg-white/40 dark:bg-zinc-900/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-foreground">{selectedColor}</h2>
                  <p className="text-foreground/70 font-medium">{colorName}</p>
                </div>
                <div 
                  className="px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                  style={{ backgroundColor: selectedColor, color: bestTextColor }}
                >
                  Aa
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/10">
                  <p className="text-xs text-foreground/50 font-semibold mb-1">RGB</p>
                  <p className="font-mono text-sm">{r}, {g}, {b}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/10">
                  <p className="text-xs text-foreground/50 font-semibold mb-1">HSL</p>
                  <p className="font-mono text-sm">{h}°, {s}%, {l}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Harmonies */}
          <div className="glass-panel p-6 rounded-3xl border border-white/20">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Color Harmonies
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-foreground/60 mb-2 font-medium">Complementary</p>
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex-1" style={{ backgroundColor: selectedColor }} />
                  <div className="flex-1 cursor-pointer hover:opacity-90" style={{ backgroundColor: harmonies.complementary }} onClick={() => setSelectedColor(harmonies.complementary)} />
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground/60 mb-2 font-medium">Analogous</p>
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex-1 cursor-pointer hover:opacity-90" style={{ backgroundColor: harmonies.analogous1 }} onClick={() => setSelectedColor(harmonies.analogous1)} />
                  <div className="flex-1" style={{ backgroundColor: selectedColor }} />
                  <div className="flex-1 cursor-pointer hover:opacity-90" style={{ backgroundColor: harmonies.analogous2 }} onClick={() => setSelectedColor(harmonies.analogous2)} />
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground/60 mb-2 font-medium">Triadic</p>
                <div className="flex h-12 rounded-xl overflow-hidden shadow-sm">
                  <div className="flex-1" style={{ backgroundColor: selectedColor }} />
                  <div className="flex-1 cursor-pointer hover:opacity-90" style={{ backgroundColor: harmonies.triadic1 }} onClick={() => setSelectedColor(harmonies.triadic1)} />
                  <div className="flex-1 cursor-pointer hover:opacity-90" style={{ backgroundColor: harmonies.triadic2 }} onClick={() => setSelectedColor(harmonies.triadic2)} />
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility & Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/20 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Contrast className="w-5 h-5 text-primary" />
                  Contrast (WCAG)
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <span className="text-sm font-semibold text-black" style={{ color: selectedColor }}>White Background</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${whiteContrast >= 4.5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {whiteContrast >= 4.5 ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-black rounded-xl shadow-sm border border-gray-800">
                    <span className="text-sm font-semibold" style={{ color: selectedColor }}>Black Background</span>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${blackContrast >= 4.5 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {blackContrast >= 4.5 ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Quick Export
              </h3>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={exportTailwindConfig}
                  className="flex items-center justify-between w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors text-left"
                >
                  Tailwind Config
                  {copied === 'tailwind' && <Check className="w-4 h-4" />}
                </button>
                <button 
                  onClick={exportCssVariables}
                  className="flex items-center justify-between w-full px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors text-left"
                >
                  CSS Variables
                  {copied === 'css' && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
