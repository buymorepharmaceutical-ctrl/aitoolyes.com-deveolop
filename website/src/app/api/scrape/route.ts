import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch website. Status: ${response.status}` }, { status: 400 });
    }

    const html = await response.text();

    // Helper Functions
    const extractMatch = (regex: RegExp, fallback = '') => {
      const match = html.match(regex);
      return match && match[1] ? match[1].trim() : fallback;
    };

    const countMatches = (regex: RegExp) => {
      const matches = html.match(regex);
      return matches ? matches.length : 0;
    };

    // --- 1. Basic SEO Tags ---
    const title = extractMatch(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descriptionMatch1 = extractMatch(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    const descriptionMatch2 = extractMatch(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const description = descriptionMatch1 || descriptionMatch2;
    
    const canonicalMatch1 = extractMatch(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
    const canonicalMatch2 = extractMatch(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
    const canonical = canonicalMatch1 || canonicalMatch2;

    // --- 2. Headings ---
    const h1Count = countMatches(/<h1\b[^>]*>/gi);
    const h2Count = countMatches(/<h2\b[^>]*>/gi);

    // --- 3. Images ---
    const totalImages = countMatches(/<img\b[^>]*>/gi);
    // Images WITH an alt attribute (even if empty)
    const imagesWithAlt = countMatches(/<img\b[^>]*alt=["'][^"']*["'][^>]*>/gi) + countMatches(/<img\b[^>]*alt=[^\s>]+[^>]*>/gi);
    const imagesWithoutAlt = Math.max(0, totalImages - imagesWithAlt);

    // --- 4. Links ---
    const totalLinks = countMatches(/<a\b[^>]*href=["'][^"']*["'][^>]*>/gi);

    // --- 5. Social Tags ---
    const hasOpenGraph = /<meta[^>]*property=["']og:(title|description|image)["']/i.test(html);
    const hasTwitterCard = /<meta[^>]*name=["']twitter:card["']/i.test(html);

    // --- 6. Content Analysis ---
    // Remove scripts and styles
    let bodyText = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    bodyText = bodyText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    // Remove all HTML tags
    bodyText = bodyText.replace(/<[^>]+>/g, ' ');
    // Collapse whitespace
    bodyText = bodyText.replace(/\s+/g, ' ').trim();
    
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    
    // Text to HTML ratio
    const htmlSize = html.length;
    const textSize = bodyText.length;
    const textToHtmlRatio = htmlSize > 0 ? ((textSize / htmlSize) * 100).toFixed(2) : 0;

    // --- 7. Algorithmic SEO Scoring ---
    let score = 100;
    
    // Title Checks (Penalty max 15)
    if (!title) score -= 15;
    else if (title.length < 30 || title.length > 60) score -= 5;
    
    // Description Checks (Penalty max 15)
    if (!description) score -= 15;
    else if (description.length < 120 || description.length > 160) score -= 5;
    
    // Headings (Penalty max 15)
    if (h1Count === 0) score -= 15;
    else if (h1Count > 1) score -= 5; // More than 1 H1 is usually frowned upon

    // Images (Penalty max 15)
    if (totalImages > 0 && imagesWithoutAlt > 0) {
      const altRatio = imagesWithoutAlt / totalImages;
      score -= Math.round(15 * altRatio); // Penalize proportionally
    }

    // Canonical (Penalty max 10)
    if (!canonical) score -= 10;

    // Social (Penalty max 10)
    if (!hasOpenGraph) score -= 5;
    if (!hasTwitterCard) score -= 5;

    // Content (Penalty max 20)
    if (wordCount < 300) score -= 20;
    else if (wordCount < 600) score -= 10;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      success: true,
      data: {
        score,
        title: {
          value: title,
          length: title ? title.length : 0,
          status: !title ? 'error' : (title.length >= 30 && title.length <= 60) ? 'pass' : 'warning',
          message: !title ? 'Missing Title' : (title.length >= 30 && title.length <= 60) ? 'Optimal length' : 'Should be 30-60 chars'
        },
        description: {
          value: description,
          length: description ? description.length : 0,
          status: !description ? 'error' : (description.length >= 120 && description.length <= 160) ? 'pass' : 'warning',
          message: !description ? 'Missing Description' : (description.length >= 120 && description.length <= 160) ? 'Optimal length' : 'Should be 120-160 chars'
        },
        canonical: {
          value: canonical,
          status: canonical ? 'pass' : 'error',
          message: canonical ? 'Canonical URL present' : 'Missing Canonical URL'
        },
        headings: {
          h1Count,
          h2Count,
          status: h1Count === 1 ? 'pass' : h1Count === 0 ? 'error' : 'warning',
          message: h1Count === 1 ? 'Perfect! Only 1 H1 tag' : h1Count === 0 ? 'Missing H1 tag' : 'Multiple H1 tags found'
        },
        images: {
          total: totalImages,
          missingAlt: imagesWithoutAlt,
          status: totalImages === 0 ? 'pass' : imagesWithoutAlt === 0 ? 'pass' : imagesWithoutAlt > totalImages * 0.5 ? 'error' : 'warning',
          message: totalImages === 0 ? 'No images found' : imagesWithoutAlt === 0 ? 'All images have alt tags' : `${imagesWithoutAlt} out of ${totalImages} images missing alt tags`
        },
        social: {
          hasOpenGraph,
          hasTwitterCard,
          status: (hasOpenGraph && hasTwitterCard) ? 'pass' : (hasOpenGraph || hasTwitterCard) ? 'warning' : 'error',
          message: (hasOpenGraph && hasTwitterCard) ? 'All social tags present' : 'Missing some social tags'
        },
        content: {
          wordCount,
          textToHtmlRatio: parseFloat(textToHtmlRatio as string),
          totalLinks,
          status: wordCount >= 600 ? 'pass' : wordCount >= 300 ? 'warning' : 'error',
          message: wordCount >= 600 ? 'Excellent word count' : wordCount >= 300 ? 'Acceptable word count' : 'Thin content detected'
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to scrape website' }, { status: 500 });
  }
}
