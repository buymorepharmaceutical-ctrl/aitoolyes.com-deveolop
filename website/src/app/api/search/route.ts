import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // We use DuckDuckGo HTML Lite version for fast, JS-free scraping
    const response = await fetch(`https://lite.duckduckgo.com/lite/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: `q=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from DuckDuckGo');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];

    // Parse DDG Lite HTML
    $('tr').each((i, row) => {
      const titleEl = $(row).find('.result-title');
      const snippetEl = $(row).find('.result-snippet');
      const linkEl = $(row).find('.result-url');

      if (titleEl.length > 0) {
        const title = titleEl.text().trim();
        const url = titleEl.attr('href') || '';
        
        // Snippet is usually in the next row
        const nextRow = $(row).next('tr');
        const snippet = nextRow.find('.result-snippet').text().trim();

        if (title && url) {
          results.push({
            title,
            url,
            snippet
          });
        }
      }
    });

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
