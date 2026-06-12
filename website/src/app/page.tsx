"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { Search, X } from "lucide-react";

const toolsList = [
  { name: 'Universal AI Assistant', url: '/tools/ai-chat', icon: '✨' },
  { name: 'Advanced SEO Analyzer', url: '/tools/seo-analyzer', icon: '🌍' },
  { name: 'Web Cam PDF Scanner', url: '/tools/camscanner', icon: '📸' },
  { name: 'Code Architecture', url: '/tools/code-visualizer', icon: '⑆' },
  { name: 'Code Snippet Manager', url: '/tools/code-snippet-manager', icon: '</>' },
  { name: 'Background Remover', url: '/tools/background-remover', icon: '✂️' },
  { name: 'Diff Checker', url: '/tools/diff-checker', icon: '⚖️' },
  { name: 'Color Extractor', url: '/tools/color-extractor', icon: '🎨' },
  { name: 'JWT Decoder', url: '/tools/jwt-decoder', icon: '🔐' },
  { name: 'JSON Formatter', url: '/tools/json-formatter', icon: '{ }' },
  { name: 'Glassmorphism UI', url: '/tools/glassmorphism-generator', icon: '🪟' },
  { name: 'Docker Compose Gen', url: '/tools/docker-compose', icon: '🐳' }
];

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredTools = toolsList.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[80vh] py-12 px-4 text-center">
      <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border border-white/50 text-sm font-medium">
        <span className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
          <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
          <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white"></div>
        </span>
        Trusted by 10,000+ developers
      </div>
      
      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-foreground max-w-4xl leading-tight mb-6">
        One <span className="font-bold">AI Agent.</span> The Output of a Full Team.
      </h1>
      
      <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mb-10">
        Intelligent problem solving tools and articles that automate work and power real-time decisions.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <input 
          type="email" 
          placeholder="Enter your email" 
          className="flex-1 w-full px-6 py-4 rounded-full border border-card-border bg-white/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/50 shadow-sm"
        />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-opacity-90 transition-all shadow-md"
        >
          Explore Tools
        </button>
      </div>
      
      <div className="w-full mt-24">
        <h2 className="text-3xl font-semibold mb-8">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {/* Universal Agentic Chat (Top Priority) */}
          <Link href="/tools/ai-chat" className="md:col-span-2 lg:col-span-3">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-2 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-white/60 transition-all cursor-pointer group h-full relative overflow-hidden shadow-sm hover:shadow-md">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-xl shadow-lg">AGENTIC AI</div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_8px_16px_rgba(99,102,241,0.4)]">
                <span className="text-white font-bold text-3xl">✨</span>
              </div>
              <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Universal AI Assistant</h3>
              <p className="text-foreground/80 text-lg max-w-3xl">
                <strong>(Unlimited Chat)</strong> You can access all tools and chat unlimited times. Select any tool from the platform (JSON, UI, Scanner) and let the AI do the work for you directly in the chat window.
              </p>
            </div>
          </Link>

          {/* New Premium SEO Analyzer */}
          <Link href="/tools/seo-analyzer" className="md:col-span-2 lg:col-span-1">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-white/60 transition-all cursor-pointer group h-full relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">AI PRO</div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_10px_rgba(16,185,129,0.3)] backdrop-blur-md">
                <span className="text-emerald-600 font-bold text-2xl">🌍</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Advanced SEO Analyzer</h3>
              <p className="text-foreground/70">Analyze any website URL instantly. Let our AI perform a deep SEO audit and suggest improvements.</p>
            </div>
          </Link>

          {/* Tool Card 0 */}
          <Link href="/tools/camscanner">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">NEW</div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-orange-700 font-bold text-xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Web Cam pdf Scanner</h3>
              <p className="text-foreground/70">Upload or scan documents using your camera, apply smart B&W filters, and export to PDF.</p>
            </div>
          </Link>

          {/* New Tool: Code Visualizer */}
          <Link href="/tools/code-visualizer">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">AI / PRO</div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_10px_rgba(59,130,246,0.3)] backdrop-blur-md">
                <span className="text-blue-700 font-bold text-xl">⑆</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Architecture</h3>
              <p className="text-foreground/70">Upload code files to extract and visually map out functions, classes, and their dependencies.</p>
            </div>
          </Link>

          {/* New Tool: Code Snippet Manager */}
          <Link href="/tools/code-snippet-manager">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PRO</div>
              <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-zinc-100 font-bold text-xl">{'</>'}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Snippet Manager</h3>
              <p className="text-foreground/70">Save, organize, and quickly retrieve your most used code blocks directly in browser storage.</p>
            </div>
          </Link>

          {/* New Tool: Glassmorphism Generator */}
          <Link href="/tools/glassmorphism-generator">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PRO</div>
              <div className="w-12 h-12 rounded-lg bg-fuchsia-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_10px_rgba(232,121,249,0.3)] backdrop-blur-md">
                <span className="text-fuchsia-700 font-bold text-xl">◇</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Glassmorphism UI</h3>
              <p className="text-foreground/70">Visually generate premium CSS glass effects and gradients with an interactive editor.</p>
            </div>
          </Link>

          {/* New Tool: AI Premium UI Generator */}
          <Link href="/tools/ui-generator">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">AI / PRO</div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_4px_10px_rgba(245,158,11,0.3)] backdrop-blur-md">
                <span className="text-amber-600 font-bold text-xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Premium UI Generator</h3>
              <p className="text-foreground/70">Describe what you need and let AI generate stunning, modern UI components in seconds.</p>
            </div>
          </Link>

          {/* Tool Card 1 */}
          <Link href="/tools/json-formatter">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-green-700 font-bold text-xl">{'{ }'}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">JSON Formatter & Generator</h3>
              <p className="text-foreground/70">Format, validate JSON and generate TypeScript/C#/Python models.</p>
            </div>
          </Link>
          
          {/* Tool Card 2 */}
          <Link href="/tools/password-generator">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-blue-700 font-bold text-xl">***</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Password Generator</h3>
              <p className="text-foreground/70">Generate secure, random passwords with customizable rules.</p>
            </div>
          </Link>
          
          {/* Tool Card 3 */}
          <Link href="/tools/word-counter">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-orange-700 font-bold text-xl">W</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Word Counter & SEO</h3>
              <p className="text-foreground/70">Analyze word count, reading time, and keyword density.</p>
            </div>
          </Link>
          
          {/* Tool Card 4 */}
          <Link href="/tools/base64">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-purple-700 font-bold text-xl">64</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Base64 Encoder</h3>
              <p className="text-foreground/70">Easily encode text to Base64 or decode Base64 to text.</p>
            </div>
          </Link>

          {/* Tool Card 5 */}
          <Link href="/tools/meta-tags">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-yellow-700 font-bold text-xl">&lt;&gt;</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Meta Tag Generator</h3>
              <p className="text-foreground/70">Create SEO-friendly meta tags and Open Graph tags.</p>
            </div>
          </Link>

          {/* Tool Card 6 */}
          <Link href="/tools/color-extractor">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-pink-700 font-bold text-xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Color Extractor</h3>
              <p className="text-foreground/70">Upload an image to extract its dominant color palette.</p>
            </div>
          </Link>

          {/* Tool Card 7 */}
          <Link href="/tools/image-compressor">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-teal-700 font-bold text-xl">🗜️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Image Compressor</h3>
              <p className="text-foreground/70">Compress image sizes instantly in your browser.</p>
            </div>
          </Link>
          {/* Tool Card 8 */}
          <Link href="/tools/markdown">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-gray-800 font-bold text-xl">M↓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Markdown to HTML</h3>
              <p className="text-foreground/70">Convert markdown text to raw HTML or preview it live.</p>
            </div>
          </Link>

          {/* Tool Card 9 */}
          <Link href="/tools/qrcode">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-indigo-700 font-bold text-xl">QR</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">QR Code Generator</h3>
              <p className="text-foreground/70">Generate, customize, and download QR codes instantly.</p>
            </div>
          </Link>

          {/* Tool Card 10 */}
          <Link href="/tools/jwt-decoder">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-red-700 font-bold text-xl">JWT</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">JWT Decoder</h3>
              <p className="text-foreground/70">Decode JSON Web Tokens instantly to view their payload.</p>
            </div>
          </Link>

          {/* Tool Card 11 */}
          <Link href="/tools/box-shadow">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-sky-700 font-bold text-xl">▦</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">CSS Box Shadow</h3>
              <p className="text-foreground/70">Visually design CSS box shadows and copy the code.</p>
            </div>
          </Link>

          {/* Tool Card 12 */}
          <Link href="/tools/uuid">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-lime-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-lime-700 font-bold text-xl">ID</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">UUID Generator</h3>
              <p className="text-foreground/70">Generate random v4 UUIDs / GUIDs instantly.</p>
            </div>
          </Link>

          {/* Tool Card 13 */}
          <Link href="/tools/lorem">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-amber-700 font-bold text-xl">LI</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lorem Ipsum Generator</h3>
              <p className="text-foreground/70">Generate dummy text for your designs and mockups.</p>
            </div>
          </Link>

          {/* Tool Card 14 */}
          <Link href="/tools/api-client">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-blue-700 font-bold text-xl">API</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">API Client (REST)</h3>
              <p className="text-foreground/70">Test REST APIs directly from your browser with headers and body payload.</p>
            </div>
          </Link>

          {/* Tool Card 15 */}
          <Link href="/tools/regex-tester">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-fuchsia-700 font-bold text-xl">/[a-z]/</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regex Tester</h3>
              <p className="text-foreground/70">Write, test, and visualize Regular Expressions with realtime highlighting.</p>
            </div>
          </Link>

          {/* Tool Card 16 */}
          <Link href="/tools/docker-compose">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-cyan-700 font-bold text-xl">🐳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Docker Compose Generator</h3>
              <p className="text-foreground/70">Visually select your stack and instantly generate docker-compose.yml files.</p>
            </div>
          </Link>

          {/* Tool Card 17 */}
          <Link href="/tools/cron-parser">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-emerald-700 font-bold text-xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cron Job Parser</h3>
              <p className="text-foreground/70">Translate cron expressions into human-readable text and calculate next run times.</p>
            </div>
          </Link>

          {/* Tool Card 18 */}
          <Link href="/tools/diff-checker">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-slate-700 font-bold text-xl">±</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Diff Checker</h3>
              <p className="text-foreground/70">Compare two text files or code blocks side-by-side to easily spot differences.</p>
            </div>
          </Link>

          {/* Tool Card 19 */}
          <Link href="/tools/sql-formatter">
            <div className="p-6 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-colors cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-rose-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-rose-700 font-bold text-xl">SQL</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">SQL Formatter</h3>
              <p className="text-foreground/70">Beautify and format messy SQL queries to make them readable.</p>
            </div>
          </Link>



        </div>
      </div>

      <div className="w-full mt-24">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-3xl font-semibold">AI Powered Tools</h2>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Gemma 4</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* AI Tool 1 */}
          <Link href="/tools/ai-summarizer">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-green-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">S</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-green-900">Content Summarizer</h3>
              <p className="text-green-800/80">Distill long texts into actionable bullet points using local AI.</p>
            </div>
          </Link>

          {/* AI Tool 2 */}
          <Link href="/tools/ai-copywriter">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-blue-900">Marketing Copywriter</h3>
              <p className="text-blue-800/80">Generate high-converting ad copy and social media posts.</p>
            </div>
          </Link>

          {/* AI Tool 3 */}
          <Link href="/tools/ai-insights">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-900">Dashboard Insights</h3>
              <p className="text-purple-800/80">Analyze raw JSON/CSV data and generate narrative reports.</p>
            </div>
          </Link>
          {/* AI Tool 4 */}
          <Link href="/tools/background-remover">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-100 border border-yellow-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-yellow-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">✂️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-900">Background Remover</h3>
              <p className="text-yellow-800/80">Instantly remove image backgrounds using local AI Vision.</p>
            </div>
          </Link>
          {/* AI Tool 5 */}
          <Link href="/tools/code-translator">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-indigo-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-indigo-900">AI Code Translator</h3>
              <p className="text-indigo-800/80">Translate code between programming languages instantly using Gemma 4.</p>
            </div>
          </Link>
          {/* AI Tool 6 */}
          <Link href="/tools/ai-chat">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-purple-900">Local AI Chat</h3>
              <p className="text-purple-800/80">Chat with Gemma 4 equipped with Conversation Memory and Custom Skills.</p>
            </div>
          </Link>
          {/* Tool 7 */}
          <Link href="/tools/video-to-frames">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 border border-red-200 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="w-12 h-12 rounded-lg bg-red-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                <span className="font-bold text-xl">🎞️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-900">Video to Pictures</h3>
              <p className="text-red-800/80">Extract high-quality frames/pictures from any MP4 video using FFmpeg.</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Blog Section */}
      <div className="w-full mt-24 mb-12">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-semibold">Latest Articles</h2>
          <Link href="/blog" className="text-primary font-medium hover:underline">View All →</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {blogs.slice(0, 6).map((blog) => (
            <Link key={blog.slug} href={`/blog/${blog.slug}`}>
              <div className="flex flex-col gap-4 group cursor-pointer h-full bg-white/40 p-4 rounded-2xl hover:bg-white/60 transition-all border border-white/50 shadow-sm hover:shadow-md">
                <div className="flex items-center gap-2 text-xs font-medium text-[#2e7d32] mb-1">
                  <span className="bg-[#2e7d32]/10 px-2 py-1 rounded uppercase tracking-wider">{blog.tags[0] || 'Article'}</span>
                  <span className="text-foreground/50">{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3 className="text-xl font-bold mb-1 group-hover:text-[#2e7d32] transition-colors line-clamp-2">{blog.title}</h3>
                <p className="text-foreground/70 text-sm line-clamp-3">{blog.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Search className="w-6 h-6 text-gray-400" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search for tools (e.g. Scanner, JSON, SEO)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400"
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50/30">
              {filteredTools.length > 0 ? (
                filteredTools.map(tool => (
                  <Link href={tool.url} key={tool.name} onClick={() => setIsSearchOpen(false)}>
                    <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {tool.icon}
                      </div>
                      <div className="font-semibold text-gray-800 text-lg">{tool.name}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-lg">No tools found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
