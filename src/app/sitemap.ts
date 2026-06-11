import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aitooyes.com';

  const tools = [
    'ai-chat',
    'ai-copywriter',
    'ai-insights',
    'ai-summarizer',
    'api-client',
    'background-remover',
    'base64',
    'box-shadow',
    'camscanner',
    'code-snippet-manager',
    'code-translator',
    'code-visualizer',
    'color-extractor',
    'cron-parser',
    'diff-checker',
    'docker-compose',
    'glassmorphism-generator',
    'image-compressor',
    'json-formatter',
    'jwt-decoder',
    'lorem',
    'markdown',
    'meta-tags',
    'password-generator',
    'qrcode',
    'regex-tester',
    'seo-analyzer',
    'sql-formatter',
    'ui-generator',
    'uuid',
    'video-to-frames',
    'word-counter',
  ];

  const blogPosts = [
    'how-to-build-a-modern-ai-agent-saas',
    'mastering-glassmorphism-in-tailwind-css',
    'best-practices-for-jwt-authentication',
    'the-future-of-ai-in-content-creation',
    'top-10-ai-tools-for-developers',
  ];

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolUrls,
    ...blogUrls,
  ];
}
