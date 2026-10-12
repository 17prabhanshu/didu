import { ImageResponse } from 'next/og';

export const runtime = 'edge';

async function loadFonts() {
  const [boldRes, regularRes] = await Promise.all([
    fetch('https://github.com/google/fonts/raw/main/ofl/syne/Syne-Bold.ttf'),
    fetch('https://github.com/google/fonts/raw/main/ofl/syne/Syne-Regular.ttf'),
  ]);

  const [boldBuffer, regularBuffer] = await Promise.all([
    boldRes.arrayBuffer(),
    regularRes.arrayBuffer(),
  ]);

  return [
    {
      name: 'Syne',
      data: boldBuffer,
      weight: 800 as const,
      style: 'normal' as const,
    },
    {
      name: 'Syne',
      data: regularBuffer,
      weight: 400 as const,
      style: 'normal' as const,
    },
  ];
}

const backgrounds: Record<string, string> = {
  default: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #0c4a6e 100%)',
  article: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
  agent: 'linear-gradient(135deg, #7c3aed 0%, #1e1b4b 50%, #0f172a 100%)',
  tool: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 50%, #0f172a 100%)',
  model: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #1f2937 100%)',
  security: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 50%, #1f2937 100%)',
  guide: 'linear-gradient(135deg, #10b981 0%, #065f46 50%, #1f2937 100%)',
  news: 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 50%, #1f2937 100%)',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Tecrese';
  const description = searchParams.get('description') || 'The Intelligence Layer for the Agentic Internet';
  const type = searchParams.get('type') || 'default';
  const image = searchParams.get('image');

  const bg = backgrounds[type] || backgrounds.default;
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: bg,
          padding: 80,
          fontFamily: 'Syne',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            maxWidth: 900,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7C3AED, #06B6D4, #22D3EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.5), 0 0 80px rgba(6, 182, 212, 0.3)',
              border: '3px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="8" fill="white"/>
              <g stroke="white" strokeWidth="2" fill="none">
                <circle cx="32" cy="12" r="4"/>
                <circle cx="52" cy="22" r="4"/>
                <circle cx="52" cy="42" r="4"/>
                <circle cx="32" cy="52" r="4"/>
                <circle cx="12" cy="42" r="4"/>
                <circle cx="12" cy="22" r="4"/>
              </g>
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              textShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {description}
          </p>

          {/* Bottom branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 32,
              paddingTop: 24,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="4" fill="white"/>
                <g stroke="white" strokeWidth="1.5" fill="none">
                  <circle cx="32" cy="12" r="3"/>
                  <circle cx="52" cy="22" r="3"/>
                  <circle cx="52" cy="42" r="3"/>
                  <circle cx="32" cy="52" r="3"/>
                  <circle cx="12" cy="42" r="3"/>
                  <circle cx="12" cy="22" r="3"/>
                </g>
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Tecrese
            </span>
          </div>

          {image && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                right: 40,
                width: 200,
                height: 200,
                opacity: 0.05,
              }}
            >
              <svg width="200" height="200" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="64" cy="64" r="50" stroke="white" strokeWidth="1" fill="none" opacity="0.3"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: await loadFonts(),
    }
  );
}