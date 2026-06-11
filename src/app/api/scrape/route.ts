import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    // Fetch the HTML
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      // Timeout is not supported directly in fetch without AbortController, so we'll just await
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch website. Status: ${response.status}` }, { status: 400 });
    }

    const html = await response.text();

    // Helper function to extract via regex safely
    const extractMatch = (regex: RegExp, fallback = '') => {
      const match = html.match(regex);
      return match && match[1] ? match[1].trim() : fallback;
    };

    const extractAllMatches = (regex: RegExp) => {
      const results = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        if (match[1]) results.push(match[1].trim().replace(/<[^>]+>/g, ''));
      }
      return results;
    };

    // Extract basic SEO elements
    const title = extractMatch(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch1 = extractMatch(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const descriptionMatch2 = extractMatch(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descriptionMatch1 || descriptionMatch2;

    const h1s = extractAllMatches(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    const h2s = extractAllMatches(/<h2[^>]*>([\s\S]*?)<\/h2>/gi);

    // Clean body text (remove scripts, styles, and tags)
    let bodyText = html;
    bodyText = bodyText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    bodyText = bodyText.replace(/<[^>]+>/g, ' '); // remove all tags
    bodyText = bodyText.replace(/\s+/g, ' ').trim(); // collapse whitespace
    
    // Limit body text to ~3000 chars to avoid overloading the local LLM context
    bodyText = bodyText.substring(0, 3000);

    return NextResponse.json({
      title,
      description,
      h1s,
      h2s,
      bodyText,
      success: true
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to scrape website' }, { status: 500 });
  }
}
