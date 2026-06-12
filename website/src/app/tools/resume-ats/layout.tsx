import { Metadata } from 'next';
import ToolSEOContent from '@/components/ToolSEOContent';

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Keyword Scanner | AIToolYes",
  description: "Check your resume against job descriptions for free. Our ATS resume scanner uses local AI to score your keyword match without uploading your data.",
  keywords: "free ATS resume scanner, job description keyword matcher, AI resume checker for job seekers, check resume against job description",
  alternates: { canonical: "https://aitoolyes.com/tools/resume-ats" },
  openGraph: {
    images: ['https://aitoolyes.com/api/og?title=Free%20ATS%20Resume%20Checker']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "ATS Resume Checker",
            "operatingSystem": "Web",
            "applicationCategory": "BusinessApplication",
            "description": "Free web-based ATS resume scanner and job description keyword matcher.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      {children}
      <ToolSEOContent 
        title="ATS Resume Scanner" 
        description="Boost your interview chances by ensuring your resume passes the Applicant Tracking System (ATS). Completely free, runs 100% locally in your browser." 
        features={JSON.parse('["Matches resume keywords to the job description","Calculates ATS compatibility score","Identifies missing critical keywords","100% private – no resume data is uploaded"]')} 
        faqs={JSON.parse('[{"q":"Is this ATS checker really free?","a":"Yes! Unlike other tools that charge you, our ATS scanner is completely free."},{"q":"Does it save my resume?","a":"No. Your resume is processed entirely locally on your device for absolute privacy."}]')} 
        relatedTools={[
          { name: 'AI Chat', url: '/tools/ai-chat', icon: '🤖' },
          { name: 'Camscanner', url: '/tools/camscanner', icon: '📸' }
        ]}
      />
    </>
  );
}
