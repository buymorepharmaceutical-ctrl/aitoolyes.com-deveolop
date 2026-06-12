'use client';
import { useState } from 'react';
import { Code, Eye, Zap, Sparkles, LayoutTemplate, Layers, Maximize2, Minimize2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const PREMIUM_THEMES = [
  { id: 'glassmorphism', name: 'Glassmorphism', desc: 'Frosted glass effects with depth' },
  { id: 'bento', name: 'Bento Grid', desc: 'Apple-style rounded grid layouts' },
  { id: 'neobrutalism', name: 'Neo-Brutalism', desc: 'Bold colors, hard shadows, thick borders' },
  { id: 'neumorphism', name: 'Neumorphism', desc: 'Soft extruded plastic aesthetics' },
  { id: 'minimal', name: 'Minimalist', desc: 'Clean, spacious, typography-focused' },
  { id: 'elegant', name: 'Elegant', desc: 'High-end, sophisticated, luxury feel' },
  { id: 'futuristic', name: 'Futuristic', desc: 'Neon, cyber, dark mode aesthetics' },
  { id: 'retro', name: 'Retro / 90s', desc: 'Nostalgic, pixelated or vintage colors' },
  { id: 'corporate', name: 'Corporate SaaS', desc: 'Trustworthy, clean, professional' },
];

const PREBUILT_TEMPLATES: Record<string, {name: string, code: string}[]> = {
  glassmorphism: [
    { 
      name: 'Glass Login Card', 
      code: `<!-- Glassmorphism Login Card -->\n<style>\n  body { font-family: sans-serif; background: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564') center/cover; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }\n  .glass-card { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); padding: 2.5rem; border-radius: 1.5rem; color: white; width: 100%; max-width: 380px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); }\n  .input-field { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 0.75rem 1rem; width: 100%; border-radius: 0.75rem; color: white; margin-bottom: 1.5rem; box-sizing: border-box; outline: none; transition: border 0.3s; }\n  .input-field:focus { border: 1px solid rgba(255, 255, 255, 0.6); }\n  .input-field::placeholder { color: rgba(255,255,255,0.7); }\n  .btn { background: rgba(255, 255, 255, 0.9); color: #333; font-weight: bold; border: none; padding: 0.75rem; width: 100%; border-radius: 0.75rem; cursor: pointer; transition: background 0.3s; }\n  .btn:hover { background: white; }\n</style>\n\n<div class="glass-card">\n  <h2 style="margin-top: 0; text-align: center; margin-bottom: 2rem;">Welcome Back</h2>\n  <input type="text" placeholder="Email Address" class="input-field" />\n  <input type="password" placeholder="Password" class="input-field" />\n  <button class="btn">Sign In</button>\n</div>`
    },
    {
      name: 'Glass Navbar',
      code: `<!-- Glass Navbar -->\n<style>\n body { margin:0; padding:0; background: url('https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=1600&q=80') center/cover; height: 100vh; font-family: sans-serif; }\n .navbar { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.1); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 10px 30px; display: flex; gap: 30px; box-shadow: 0 4px 30px rgba(0,0,0,0.1); }\n .nav-link { color: white; text-decoration: none; font-weight: 500; font-size: 14px; transition: 0.3s; }\n .nav-link:hover { color: rgba(255,255,255,0.6); }\n</style>\n<nav class="navbar">\n <a href="#" class="nav-link">Home</a>\n <a href="#" class="nav-link">Features</a>\n <a href="#" class="nav-link">Pricing</a>\n <a href="#" class="nav-link">Contact</a>\n</nav>`
    }
  ],
  bento: [
    { 
      name: 'Bento Dashboard', 
      code: `<!-- Bento Grid Dashboard -->\n<style>\n  body { font-family: 'Inter', sans-serif; background: #f4f4f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 2rem; box-sizing: border-box; }\n  .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; max-width: 900px; }\n  .bento-item { background: white; border-radius: 1.5rem; padding: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: transform 0.2s; }\n  .bento-item:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.06); }\n  .large { grid-column: span 2; grid-row: span 2; }\n  .tall { grid-row: span 2; }\n  h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #18181b; }\n  p { margin: 0; color: #71717a; font-size: 0.9rem; }\n  .stat { font-size: 2.5rem; font-weight: 800; color: #3b82f6; margin-top: 1rem; }\n</style>\n\n<div class="bento-grid">\n  <div class="bento-item large">\n    <h3>Revenue Overview</h3>\n    <p>Monthly recurring revenue</p>\n    <div class="stat">$45,231</div>\n    <div style="margin-top: 2rem; height: 100px; background: linear-gradient(to right, #eff6ff, #dbeafe); border-radius: 0.5rem; border: 1px dashed #bfdbfe;"></div>\n  </div>\n  <div class="bento-item">\n    <h3>Active Users</h3>\n    <div class="stat" style="color: #10b981;">1,204</div>\n  </div>\n  <div class="bento-item">\n    <h3>Bounce Rate</h3>\n    <div class="stat" style="color: #f43f5e;">24%</div>\n  </div>\n</div>`
    },
    {
      name: 'Bento Profile Card',
      code: `<!-- Bento Profile -->\n<style>\n body { font-family: sans-serif; background: #fafafa; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }\n .bento-profile { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 400px; }\n .card { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }\n .main-card { grid-column: span 2; display: flex; align-items: center; gap: 20px; }\n .avatar { width: 80px; height: 80px; border-radius: 50%; background: #ddd; object-fit: cover; }\n h2 { margin: 0; font-size: 20px; }\n p { margin: 4px 0 0 0; color: #888; font-size: 14px; }\n</style>\n<div class="bento-profile">\n  <div class="card main-card">\n    <img src="https://i.pravatar.cc/150?img=68" class="avatar" />\n    <div>\n      <h2>Sarah Connor</h2>\n      <p>Lead Designer @ TechCorp</p>\n    </div>\n  </div>\n  <div class="card" style="background:#000; color:white;">\n    <p style="color:#aaa;">Projects</p>\n    <h2 style="font-size:32px; margin-top:8px;">42</h2>\n  </div>\n  <div class="card" style="background:#e0e7ff;">\n    <p style="color:#6366f1;">Followers</p>\n    <h2 style="font-size:32px; margin-top:8px; color:#4f46e5;">12.4k</h2>\n  </div>\n</div>`
    }
  ],
  neobrutalism: [
    { 
      name: 'Neo-Brutalist Card', 
      code: `<!-- Neo-Brutalism Card -->\n<style>\n  body { font-family: 'Courier New', Courier, monospace; background: #fdf2f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }\n  .brutal-card { background: #fef08a; border: 4px solid #000; box-shadow: 8px 8px 0px #000; padding: 2rem; width: 100%; max-width: 320px; transition: transform 0.1s, box-shadow 0.1s; }\n  .brutal-card:hover { transform: translate(4px, 4px); box-shadow: 4px 4px 0px #000; }\n  h2 { font-weight: 900; text-transform: uppercase; border-bottom: 4px solid #000; padding-bottom: 0.5rem; margin-top: 0; }\n  .brutal-btn { background: #ec4899; color: white; font-weight: 900; text-transform: uppercase; border: 4px solid #000; padding: 1rem; width: 100%; cursor: pointer; box-shadow: 4px 4px 0px #000; transition: all 0.1s; margin-top: 1.5rem; }\n  .brutal-btn:active { transform: translate(4px, 4px); box-shadow: 0px 0px 0px #000; }\n</style>\n\n<div class="brutal-card">\n  <h2>Join the club</h2>\n  <p><strong>Warning:</strong> Not for the faint of heart. Bold styles only.</p>\n  <button class="brutal-btn">Sign Up Now</button>\n</div>`
    },
    {
      name: 'Brutalist Newsletter',
      code: `<!-- Brutalist Newsletter -->\n<style>\n body { font-family: monospace; background: #22d3ee; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }\n .box { background: #fff; border: 5px solid #000; padding: 40px; box-shadow: 12px 12px 0 #000; width: 400px; }\n h1 { font-size: 3rem; text-transform: uppercase; margin: 0 0 20px 0; line-height: 1; }\n input { width: 100%; padding: 15px; border: 4px solid #000; font-size: 1.2rem; margin-bottom: 20px; box-sizing: border-box; }\n button { width: 100%; padding: 15px; background: #fbbf24; border: 4px solid #000; font-size: 1.5rem; font-weight: bold; cursor: pointer; box-shadow: 6px 6px 0 #000; transition: 0.1s; }\n button:active { box-shadow: 0 0 0 #000; transform: translate(6px, 6px); }\n</style>\n<div class="box">\n <h1>Stay Loud.</h1>\n <input type="email" placeholder="YOUR@EMAIL.COM" />\n <button>SUBSCRIBE</button>\n</div>`
    }
  ],
  neumorphism: [
    {
      name: 'Neumorphic Player',
      code: `<!-- Neumorphism Audio Player -->\n<style>\n  body { background: #e0e5ec; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }\n  .neu-card { width: 300px; padding: 2rem; border-radius: 2rem; background: #e0e5ec; box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5); display: flex; flex-direction: column; align-items: center; }\n  .neu-circle { width: 120px; height: 120px; border-radius: 50%; background: #e0e5ec; box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5); border: 5px solid #e0e5ec; display: flex; justify-content: center; align-items: center; margin-bottom: 2rem; }\n  .neu-btn { width: 60px; height: 60px; border-radius: 50%; background: #e0e5ec; box-shadow: 5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255, 0.5); border: none; cursor: pointer; color: #a3b1c6; font-size: 1.5rem; transition: all 0.2s; }\n  .neu-btn:active { box-shadow: inset 5px 5px 10px rgb(163,177,198,0.6), inset -5px -5px 10px rgba(255,255,255, 0.5); color: #6b7280; }\n</style>\n\n<div class="neu-card">\n  <div class="neu-circle">\n    <span style="font-size: 2rem; color: #ff6b6b;">▶</span>\n  </div>\n  <h3 style="color: #6b7280; margin: 0;">Lo-Fi Beats</h3>\n  <p style="color: #a3b1c6; margin: 0.5rem 0 2rem 0; font-size: 0.9rem;">Chill Study</p>\n  <div style="display: flex; gap: 1rem;">\n    <button class="neu-btn">⏮</button>\n    <button class="neu-btn" style="color: #ff6b6b;">▶</button>\n    <button class="neu-btn">⏭</button>\n  </div>\n</div>`
    }
  ],
  minimal: [
    {
      name: 'Minimal Blog Post',
      code: `<!-- Minimalist Layout -->\n<style>\n  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #111; max-width: 680px; margin: 0 auto; padding: 4rem 2rem; line-height: 1.6; }\n  h1 { font-size: 2.5rem; letter-spacing: -0.05em; margin-bottom: 0.5rem; }\n  .meta { color: #666; font-size: 0.9rem; margin-bottom: 3rem; }\n  p { font-size: 1.1rem; color: #333; margin-bottom: 1.5rem; }\n  a { color: #000; text-decoration-color: #ccc; text-underline-offset: 4px; }\n  a:hover { text-decoration-color: #000; }\n</style>\n\n<h1>The Art of Minimalism</h1>\n<div class="meta">Oct 24 • 3 min read</div>\n<p>Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. This principle guides our design philosophy.</p>\n<p>Read more about this in our <a href="#">latest journal entry</a>.</p>`
    }
  ],
  elegant: [
    {
      name: 'Elegant Product Card',
      code: `<!-- Elegant Luxury Card -->\n<style>\n  body { background: #0a0a0a; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: 'Playfair Display', serif; }\n  .luxury-card { background: #111; border: 1px solid #333; padding: 3rem; text-align: center; color: #fff; width: 100%; max-width: 300px; }\n  .brand { font-size: 0.7rem; letter-spacing: 0.3em; text-transform: uppercase; color: #d4af37; margin-bottom: 1rem; }\n  h2 { font-weight: 400; font-size: 2rem; margin: 0 0 2rem 0; }\n  .divider { width: 1px; height: 40px; background: #333; margin: 0 auto 2rem auto; }\n  button { background: transparent; color: #fff; border: 1px solid #fff; padding: 1rem 2rem; font-family: sans-serif; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.3s; }\n  button:hover { background: #fff; color: #000; }\n</style>\n\n<div class="luxury-card">\n  <div class="brand">Maison</div>\n  <h2>Noir Collection</h2>\n  <div class="divider"></div>\n  <p style="font-family: sans-serif; font-size: 0.9rem; color: #888; margin-bottom: 3rem;">Discover the new essence of midnight.</p>\n  <button>Explore</button>\n</div>`
    }
  ],
  futuristic: [
    {
      name: 'Cyberpunk HUD',
      code: `<!-- Futuristic Cyber HUD -->\n<style>\n  body { background: #050510; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: 'Courier New', Courier, monospace; }\n  .cyber-panel { border: 1px solid #00f3ff; box-shadow: 0 0 10px rgba(0,243,255,0.2), inset 0 0 20px rgba(0,243,255,0.1); padding: 2rem; position: relative; background: rgba(0,20,40,0.8); color: #00f3ff; width: 100%; max-width: 400px; }\n  .cyber-panel::before, .cyber-panel::after { content: ''; position: absolute; width: 20px; height: 20px; border: 2px solid #00f3ff; }\n  .cyber-panel::before { top: -2px; left: -2px; border-right: none; border-bottom: none; }\n  .cyber-panel::after { bottom: -2px; right: -2px; border-left: none; border-top: none; }\n  .glitch { font-size: 1.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 0 #ff00ea, -2px 0 #00f3ff; }\n  .data-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,243,255,0.3); padding: 0.5rem 0; margin-top: 1rem; }\n  .btn { background: rgba(0,243,255,0.1); border: 1px solid #00f3ff; color: #00f3ff; padding: 0.5rem 1rem; cursor: pointer; text-transform: uppercase; margin-top: 2rem; width: 100%; }\n  .btn:hover { background: #00f3ff; color: #000; box-shadow: 0 0 15px #00f3ff; }\n</style>\n\n<div class="cyber-panel">\n  <div class="glitch">SYSTEM ONLINE</div>\n  <div class="data-row"><span>CORE TEMP:</span><span>42°C</span></div>\n  <div class="data-row"><span>SHIELDS:</span><span>89%</span></div>\n  <div class="data-row"><span>UPLINK:</span><span>SECURE</span></div>\n  <button class="btn">INITIATE SEQUENCE</button>\n</div>`
    }
  ],
  retro: [
    {
      name: 'Windows 95 Window',
      code: `<!-- Retro Win95 -->\n<style>\n  body { background: #008080; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: 'Tahoma', sans-serif; }\n  .win-window { background: #c0c0c0; border-top: 2px solid #fff; border-left: 2px solid #fff; border-bottom: 2px solid #000; border-right: 2px solid #000; width: 300px; padding: 2px; }\n  .win-title { background: #000080; color: white; padding: 4px 6px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }\n  .win-close { background: #c0c0c0; border-top: 1px solid #fff; border-left: 1px solid #fff; border-bottom: 1px solid #000; border-right: 1px solid #000; width: 16px; height: 14px; display: flex; justify-content: center; align-items: center; font-size: 10px; color: black; font-weight: bold; cursor: default; }\n  .win-content { padding: 16px; font-size: 13px; }\n  .win-btn { background: #c0c0c0; border-top: 2px solid #fff; border-left: 2px solid #fff; border-bottom: 2px solid #000; border-right: 2px solid #000; padding: 4px 16px; font-family: 'Tahoma', sans-serif; cursor: pointer; }\n  .win-btn:active { border-top: 2px solid #000; border-left: 2px solid #000; border-bottom: 2px solid #fff; border-right: 2px solid #fff; }\n</style>\n\n<div class="win-window">\n  <div class="win-title">\n    <span>Warning.exe</span>\n    <div class="win-close">x</div>\n  </div>\n  <div class="win-content">\n    <div style="display: flex; gap: 16px; margin-bottom: 20px;">\n      <span style="font-size: 32px;">⚠️</span>\n      <p style="margin:0;">Task failed successfully. Would you like to try again?</p>\n    </div>\n    <div style="display: flex; justify-content: center; gap: 8px;">\n      <button class="win-btn">OK</button>\n      <button class="win-btn">Cancel</button>\n    </div>\n  </div>\n</div>`
    }
  ],
  corporate: [
    {
      name: 'SaaS Pricing',
      code: `<!-- Corporate SaaS Card -->\n<style>\n  body { background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: 'Inter', sans-serif; }\n  .pricing-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; width: 100%; max-width: 300px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }\n  .badge { background: #e0e7ff; color: #4f46e5; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 1rem; }\n  h3 { margin: 0; color: #0f172a; font-size: 1.5rem; }\n  .price { font-size: 2.5rem; font-weight: 700; color: #0f172a; margin: 1rem 0; }\n  .price span { font-size: 1rem; color: #64748b; font-weight: 400; }\n  ul { list-style: none; padding: 0; margin: 0 0 2rem 0; }\n  li { color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }\n  .btn { background: #4f46e5; color: white; border: none; padding: 0.75rem; width: 100%; border-radius: 6px; font-weight: 500; cursor: pointer; transition: background 0.2s; }\n  .btn:hover { background: #4338ca; }\n</style>\n\n<div class="pricing-card">\n  <div class="badge">Most Popular</div>\n  <h3>Professional</h3>\n  <div class="price">$49<span>/mo</span></div>\n  <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem;">For scaling teams and growing businesses.</p>\n  <ul>\n    <li>✓ Up to 10 users</li>\n    <li>✓ Advanced Analytics</li>\n    <li>✓ 24/7 Priority Support</li>\n  </ul>\n  <button class="btn">Start 14-Day Trial</button>\n</div>`
    },
    {
      name: 'Corporate Hero',
      code: `<!-- Corporate SaaS Hero -->\n<style>\n body { font-family: 'Inter', sans-serif; background: white; margin: 0; }\n .hero { max-width: 1200px; margin: 0 auto; padding: 80px 20px; text-align: center; }\n h1 { font-size: 4rem; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 20px; }\n p { font-size: 1.25rem; color: #475569; max-width: 600px; margin: 0 auto 40px auto; line-height: 1.6; }\n .buttons { display: flex; gap: 16px; justify-content: center; }\n .btn-primary { background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; }\n .btn-secondary { background: white; color: #0f172a; border: 1px solid #cbd5e1; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; }\n</style>\n<div class="hero">\n <h1>Ship software faster.</h1>\n <p>The complete platform to build, deploy, and scale your web applications with zero configuration.</p>\n <div class="buttons">\n  <a href="#" class="btn-primary">Start Deploying</a>\n  <a href="#" class="btn-secondary">Request Demo</a>\n </div>\n</div>`
    }
  ]
};

import { useAIContext } from '@/components/GlobalAIContext';

export default function AIUIGenerator() {
  const [mode, setMode] = useState<'ai' | 'template'>('ai');
  const [prompt, setPrompt] = useState('Create a modern pricing table with 3 tiers. Highlight the middle tier as "Pro". Use bold typography and smooth hover effects.');
  const [theme, setTheme] = useState('bento');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('<!-- Your generated design will appear here. -->\n\n<div style="padding: 2rem; text-align: center; color: #6b7280; font-family: sans-serif;">\n  Select a theme, and either Generate via AI or pick a Pre-built Template!\n</div>');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { incrementToolUsage } = useAIContext();

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          skill: theme,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          alert("Security Alert: Too many requests. Please wait a moment.");
          return;
        }
        throw new Error('API Error');
      }

      const data = await response.json();
      let resultHTML = data.response;
      
      if (resultHTML.includes("Gemma 4 Output")) {
        resultHTML = `<!-- Simulated AI Generation for Theme: ${theme} -->\n<style>\n  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');\n  body { font-family: 'Inter', sans-serif; background: #f4f4f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }\n  .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 400px; text-align: center; transition: transform 0.2s; }\n  .card:hover { transform: translateY(-5px); }\n  h2 { color: #18181b; margin-top: 0; }\n  p { color: #71717a; line-height: 1.5; }\n  button { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; width: 100%; margin-top: 1rem; transition: background 0.2s; }\n  button:hover { background: #2563eb; }\n</style>\n\n<div class="card">\n  <h2>✨ Premium ${theme} Design</h2>\n  <p>This is a simulated output. The AI backend successfully loaded the <strong>${theme}</strong> skill and your prompt: <em>"${prompt}"</em></p>\n  <button>Deploy Now</button>\n</div>`;
      }

      setGeneratedCode(resultHTML);
      setActiveTab('preview');
      incrementToolUsage(); // Track ad usage
    } catch (error) {
      alert("Failed to connect to the local AI backend. Is it running?");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadTemplate = (code: string) => {
    setGeneratedCode(code);
    setActiveTab('preview');
    incrementToolUsage(); // Track ad usage
  };

  const availableTemplates = PREBUILT_TEMPLATES[theme] || [
    { name: 'Basic Template', code: `<div style="padding: 2rem; text-align: center; font-family: sans-serif; background: #f3f4f6; border-radius: 1rem;"><h2>${theme} Template</h2><p>Pre-built template library for ${theme} is coming soon! Try AI Generator mode to build it from scratch.</p></div>` }
  ];

  const getThemeHints = (themeId: string) => {
    switch(themeId) {
      case 'glassmorphism': return "Use words like: frosted glass, blur filter, rgba background, semi-transparent, overlapping shapes.";
      case 'bento': return "Use words like: grid layout, different sized cards, rounded corners, subtle shadows, Apple style.";
      case 'neobrutalism': return "Use words like: thick black borders, hard shadows, vibrant contrasting colors (yellow, pink), uppercase fonts.";
      case 'neumorphism': return "Use words like: inset shadows, extruded plastic, soft light and dark box-shadows, same background color.";
      case 'futuristic': return "Use words like: neon glow, dark mode, cyan and magenta accents, monospaced fonts, cyberpunk.";
      default: return "Describe the specific elements, colors, and layout you want.";
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] h-full p-4 lg:p-8 max-w-[1600px] mx-auto gap-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          Premium UI Generator
        </h1>
        <p className="text-foreground/70 mt-1">Generate dynamic components with AI or browse 100% ready-made premium templates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6 bg-white/60 border border-card-border p-6 rounded-3xl shadow-sm backdrop-blur-md overflow-y-auto">
          
          {/* Mode Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setMode('ai')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${mode === 'ai' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Zap className="w-4 h-4" /> AI Generator
            </button>
            <button 
              onClick={() => setMode('template')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${mode === 'template' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Templates
            </button>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-sm font-bold text-foreground/80 mb-2 block">1. Select Premium Theme</label>
            <div className="space-y-2">
              {PREMIUM_THEMES.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${theme === t.id ? 'border-primary bg-primary/5' : 'border-card-border bg-white hover:border-primary/50'}`}
                >
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <p className="text-xs text-foreground/60">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Content based on Mode */}
          {mode === 'ai' ? (
            <>
              <div>
                <label className="text-sm font-bold text-foreground/80 mb-2 block">2. Describe Your Component</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g. A sleek authentication form with Google login..."
                  className="w-full h-32 p-3 rounded-xl border border-card-border bg-white resize-none focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
                <h4 className="font-bold text-sm text-primary mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Prompt Hint
                </h4>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  {getThemeHints(theme)}
                </p>
              </div>

              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md mt-auto"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
                {isGenerating ? 'Generating UI...' : 'Generate with Local AI'}
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <label className="text-sm font-bold text-foreground/80 mb-2 block">2. Select a Pre-built Template</label>
                <div className="space-y-3">
                  {availableTemplates.map((tpl, i) => (
                    <button 
                      key={i}
                      onClick={() => loadTemplate(tpl.code)}
                      className="w-full text-left p-4 rounded-xl border border-card-border bg-white hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <Layers className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{tpl.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Click to preview & copy code</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Right Panel: Preview & Code */}
        <div className={`border border-card-border bg-white shadow-sm flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'lg:col-span-8 rounded-3xl overflow-hidden relative'}`}>
          
          <div className="flex items-center justify-between border-b border-card-border bg-gray-50/50 p-2">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'preview' ? 'bg-white shadow-sm text-primary border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Eye className="w-4 h-4" /> Live Preview
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'code' ? 'bg-white shadow-sm text-primary border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                <Code className="w-4 h-4" /> View Source
              </button>
            </div>
            <div className="flex items-center gap-2 px-3">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-colors mr-2"
                title="Toggle Full Screen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>

          <div className="flex-1 relative bg-zinc-50 min-h-0">
            {activeTab === 'preview' ? (
              <iframe 
                srcDoc={generatedCode} 
                className="w-full h-full border-none absolute inset-0 bg-white"
                sandbox="allow-scripts allow-modals"
                title="Generated Preview"
              />
            ) : (
              <Editor
                height="100%"
                language="html"
                value={generatedCode}
                onChange={(val) => setGeneratedCode(val || '')}
                theme="vs-light"
                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
              />
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
