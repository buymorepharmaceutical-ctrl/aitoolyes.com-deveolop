import React from 'react';
import Link from 'next/link';
import GoogleAdPlaceholder from '@/components/GoogleAdPlaceholder';

export default function BlogPost() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link href="/#blog" className="text-primary hover:underline font-medium mb-8 inline-block">
        ← Back to Blog
      </Link>
      
      <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
        <span className="bg-primary/10 px-3 py-1 rounded-full">Security</span>
        <span className="text-foreground/50">Oct 15, 2026</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">Best Practices for JWT Authentication</h1>
      
      <GoogleAdPlaceholder slot="blog3-top-1122" />
      
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed mt-8">
        <p>JSON Web Tokens (JWT) are the standard for securing modern web applications and APIs. However, if implemented incorrectly, they can open up severe security vulnerabilities like Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Where to Store Your Tokens</h2>
        <p>The most common debate in JWT authentication is where to store the token on the client side. There are two main options:</p>
        <ul>
          <li><strong>Local Storage:</strong> Very easy to implement, but vulnerable to XSS attacks. If a hacker runs JavaScript on your site, they can steal the token.</li>
          <li><strong>HttpOnly Cookies:</strong> More secure against XSS, but requires CSRF protection.</li>
        </ul>
        
        <GoogleAdPlaceholder slot="blog3-mid-3344" />
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">The Ideal Approach: HttpOnly Cookies</h2>
        <p>For maximum security, always store your JWTs in an <code>HttpOnly</code> cookie. This prevents any JavaScript on the page from reading the token. When you make an API request, the browser will automatically include the cookie.</p>
        
        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Keep Tokens Short-Lived</h2>
        <p>Because JWTs are stateless (meaning they cannot easily be revoked without complex database blacklists), you should set the expiration time (<code>exp</code>) to be very short, such as 15 minutes. Pair this with a longer-lived <strong>Refresh Token</strong> stored securely.</p>

        <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Conclusion</h2>
        <p>Authentication is hard. When building platforms like AI ToolYes, leveraging robust backend frameworks or services like Supabase can save you from reinventing the wheel and making critical security mistakes.</p>
      </div>
      
      <GoogleAdPlaceholder slot="blog3-bottom-5566" />
    </div>
  );
}
