import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronDown, Sparkles } from 'lucide-react';

export interface FAQ {
  q: string;
  a: string;
}

export interface ToolSEOProps {
  title: string;
  description: string;
  features: string[];
  faqs: FAQ[];
  relatedTools: { name: string; url: string; icon: string }[];
}

export default function ToolSEOContent({ title, description, features, faqs, relatedTools }: ToolSEOProps) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-24 mb-16 px-4 md:px-0 text-left">
      {/* Decorative Divider */}
      <div className="flex items-center justify-center mb-16 opacity-30">
        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent w-full max-w-md"></div>
        <Sparkles className="w-6 h-6 text-primary mx-4 flex-shrink-0" />
        <div className="h-px bg-gradient-to-r from-primary via-primary to-transparent w-full max-w-md"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Intro Section */}
          <section>
            <h2 className="text-3xl font-bold mb-4 text-foreground tracking-tight">About {title}</h2>
            <p className="text-lg text-foreground/70 leading-relaxed mb-6">
              {description}
            </p>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 text-primary">Key Features & Capabilities</h3>
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* FAQs Section */}
          <section>
            <h2 className="text-3xl font-bold mb-6 text-foreground tracking-tight">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="group border border-card-border rounded-2xl bg-white/40 hover:bg-white/60 transition-colors overflow-hidden">
                  <details className="p-5 [&_svg]:open:-rotate-180 cursor-pointer">
                    <summary className="flex items-center justify-between font-semibold text-lg outline-none select-none">
                      {faq.q}
                      <ChevronDown className="w-5 h-5 text-foreground/50 transition-transform duration-200" />
                    </summary>
                    <p className="mt-4 text-foreground/70 leading-relaxed pl-2 border-l-2 border-primary/20">
                      {faq.a}
                    </p>
                  </details>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/60 backdrop-blur-md border border-card-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-xl mb-6 text-foreground">Related Developer Tools</h3>
            <div className="space-y-4">
              {relatedTools.map((tool, i) => (
                <Link key={i} href={tool.url}>
                  <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                      {tool.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tool.name}</h4>
                      <span className="text-xs text-foreground/50">Free Online Tool</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-card-border text-center">
              <Link href="/">
                <button className="w-full py-3 rounded-xl bg-foreground text-background font-semibold hover:bg-opacity-90 transition-all">
                  Browse All Tools
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
