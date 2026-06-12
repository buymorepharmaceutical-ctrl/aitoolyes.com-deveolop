import { Shield, Zap, Globe, Cpu, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About AIToolYes - On-Device AI Tools',
  description: 'Learn about AIToolYes.com, the leading platform providing free, privacy-first, on-device Machine Learning tools right in your browser.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-32">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 sm:px-12 text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight">
          Privacy First. <br className="hidden sm:block"/>
          <span className="text-[#2e7d32]">Cloud Second.</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed">
          Welcome to AIToolYes.com. We are revolutionizing the way you interact with Artificial Intelligence by bringing the power of the cloud directly to your device.
        </p>
      </section>

      {/* Grid of Values */}
      <section className="px-6 sm:px-12 max-w-6xl mx-auto py-12">
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="glass-panel p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Absolute Privacy</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              When you use our Document Scanner or ATS Resume checker, your files are never uploaded to a server. All computations happen mathematically inside your browser's memory.
            </p>
          </div>

          <div className="glass-panel p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Zero Latency</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Why wait for a file to upload and download? Our WebAssembly and WebGL engines run models at 60 FPS directly on your GPU. Experience instant results.
            </p>
          </div>

          <div className="glass-panel p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center">
              <Cpu className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">On-Device Machine Learning</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Using cutting-edge tech like MediaPipe and OpenCV.js, we provide tools that previously required supercomputers, right in your pocket.
            </p>
          </div>

          <div className="glass-panel p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">100% Free Access</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Because we don't have to pay for expensive cloud server rendering, we can offer premium AI capabilities entirely for free to the global community.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="px-6 sm:px-12 py-16 text-center">
        <div className="glass-panel max-w-3xl mx-auto p-12 space-y-8 bg-gradient-to-br from-[#f0f9f0] to-white">
          <h2 className="text-3xl font-bold text-gray-900">Ready to experience local AI?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tools" className="px-8 py-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-full font-bold text-lg transition-all flex items-center gap-2">
              Explore Our Tools <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/blog" className="px-8 py-4 bg-white text-[#2e7d32] border-2 border-[#2e7d32] hover:bg-[#f0f9f0] rounded-full font-bold text-lg transition-all">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
