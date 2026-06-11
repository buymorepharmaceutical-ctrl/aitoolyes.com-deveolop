import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params
    const title = searchParams.has('title')
      ? searchParams.get('title')?.slice(0, 100)
      : 'Free AI Developer Tools';
      
    const isPro = searchParams.get('pro') === 'true';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'linear-gradient(to bottom right, #f4f4f5 25%, #e0e7ff 100%)',
            fontFamily: 'sans-serif',
            padding: '40px',
          }}
        >
          {/* Background decorative blob */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '600px',
              height: '600px',
              background: 'linear-gradient(to right, #a855f7, #3b82f6)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              opacity: 0.15,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '500px',
              height: '500px',
              background: 'linear-gradient(to right, #ec4899, #f43f5e)',
              borderRadius: '50%',
              filter: 'blur(100px)',
              opacity: 0.15,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(255, 255, 255, 1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
              borderRadius: '32px',
              padding: '60px 80px',
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            {/* Header / Logo */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  boxShadow: '0 8px 16px rgba(59,130,246,0.3)',
                }}
              >
                ✨
              </div>
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}
              >
                AI ToolYes
              </span>
            </div>

            {/* Dynamic Title */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 900,
                color: '#1e293b',
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                marginBottom: '10px',
              }}
            >
              {title}
            </h1>

            {/* Dynamic Tags */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <div
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '8px 24px',
                  borderRadius: '99px',
                  fontSize: '24px',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                }}
              >
                Online Tool
              </div>
              <div
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '8px 24px',
                  borderRadius: '99px',
                  fontSize: '24px',
                  fontWeight: 600,
                  border: '1px solid #e2e8f0',
                }}
              >
                Free Forever
              </div>
              {isPro && (
                <div
                  style={{
                    background: 'linear-gradient(to right, #f59e0b, #ea580c)',
                    color: 'white',
                    padding: '8px 24px',
                    borderRadius: '99px',
                    fontSize: '24px',
                    fontWeight: 800,
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  PRO / AI
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response("Failed to generate image", {
      status: 500,
    });
  }
}
