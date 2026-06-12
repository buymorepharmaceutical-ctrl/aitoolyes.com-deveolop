import Link from 'next/link';
import { Camera, FileText, Palette, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'All AI Tools - AIToolYes',
  description: 'Explore our directory of free, on-device AI tools including Document Scanners, Resume ATS Checkers, and Color Extractors.',
};

export default function ToolsHub() {
  const tools = [
    {
      id: 'camscanner',
      name: 'Scanner AI Pro',
      description: 'A revolutionary on-device document scanner. Uses OpenCV, Morphological Edge Detection, and MediaPipe Hand Tracking to flawlessly crop and enhance your physical documents in 4K.',
      icon: Camera,
      href: '/tools/camscanner',
      tag: 'Computer Vision',
    },
    {
      id: 'resume-ats',
      name: 'ATS Resume Score Checker',
      description: 'Stop getting rejected by robots. Our on-device ATS simulator reads your Resume PDF, compares it against the job description, and provides a real-time keyword match score.',
      icon: FileText,
      href: '/tools/resume-ats',
      tag: 'Career & NLP',
    },
    {
      id: 'color-extractor',
      name: 'Smart Color Extractor',
      description: 'Upload any image and instantly generate a beautiful, cohesive color palette using local mathematical clustering. Perfect for designers and developers.',
      icon: Palette,
      href: '/tools/color-extractor',
      tag: 'Design Utilities',
    }
  ];

  return (
    <div className="min-h-screen pb-32 pt-16 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            AI Tools Directory
          </h1>
          <p className="text-xl text-gray-600">
            Powerful, free, and privacy-respecting AI tools that run entirely in your browser. No cloud uploads required.
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href}>
                <div className="glass-panel h-full p-8 flex flex-col group cursor-pointer hover:border-[#2e7d32] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#f0f9f0] group-hover:bg-[#2e7d32] text-[#2e7d32] group-hover:text-white flex items-center justify-center transition-colors mb-6 shadow-sm">
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full mb-4 w-max">
                    {tool.tag}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#2e7d32] transition-colors">
                    {tool.name}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed flex-1">
                    {tool.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-[#2e7d32] font-bold group-hover:gap-4 transition-all">
                    Launch Tool <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
