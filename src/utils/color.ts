// ===== IMAGE PROXY =====
// Rewrites cover art URLs through images.weserv.nl to bypass CORS when served
// from file:// or a domain without CORS headers.

export function proxyUrl(url: string): string {
  if (!url) return '';
  return (
    'https://images.weserv.nl/?url=' +
    url.replace(/^https?:\/\//, '') +
    '&w=600&h=600&fit=cover&we'
  );
}

// ===== COLOR ADJUSTMENT =====
// Lightens or darkens a #rrggbb hex color by `amt` (positive = lighter).

export function adjustColor(hex: string, amt: number): string {
  if (!hex || hex[0] !== '#') return hex || '#333';
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amt);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amt);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}

// ===== DOMINANT COLOR EXTRACTION =====
// Samples the proxied image via a canvas element and returns the dominant
// "saturated, mid-brightness" colour as a #rrggbb hex string.
// Returns null on CORS error, empty URL, or canvas failure — callers should
// fall back to song.color in that case.

export async function extractDominantColor(
  proxyImgUrl: string
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!proxyImgUrl) return resolve(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 80;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, 80, 80);
        const d = ctx.getImageData(0, 0, 80, 80).data;

        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
          const sat =
            Math.max(d[i], d[i + 1], d[i + 2]) -
            Math.min(d[i], d[i + 1], d[i + 2]);
          if (lum > 25 && lum < 230 && sat > 20) {
            r += d[i];
            g += d[i + 1];
            b += d[i + 2];
            n++;
          }
        }

        if (n === 0) return resolve(null);
        const toH = (v: number) =>
          Math.round(v / n)
            .toString(16)
            .padStart(2, '0');
        resolve('#' + toH(r) + toH(g) + toH(b));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = proxyImgUrl;
  });
}
