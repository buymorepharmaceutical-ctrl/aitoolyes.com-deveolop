import { MetadataRoute } from 'next';
import { blogs } from '@/data/blogs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aitoolyes.com';

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
    'resume-ats',
    'seo-analyzer',
    'sql-formatter',
    'ui-generator',
    'uuid',
    'video-to-frames',
    'word-counter',
  ];

  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const blogUrls = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
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
