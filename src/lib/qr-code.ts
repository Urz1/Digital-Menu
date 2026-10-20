import QRCode from 'qrcode';

export interface QrSvgOptions {
  color?: string;
  bgColor?: string;
  margin?: number;
}

export interface QrPngOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Synchronously generates a crisp, resolution-independent SVG string for a given text/URL.
 * Runs 100% offline without any external network requests or third-party APIs.
 */
export function generateQrSvgString(text: string, options: QrSvgOptions = {}): string {
  const { color = '#111827', bgColor = '#ffffff', margin = 1 } = options;

  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const moduleCount = qr.modules.size;
    const totalSize = moduleCount + margin * 2;

    let path = '';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          path += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">` +
      (bgColor ? `<rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>` : '') +
      `<path d="${path.trim()}" fill="${color}"/>` +
      `</svg>`
    );
  } catch (err) {
    console.error('Error generating QR SVG:', err);
    // Fallback minimal SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="10" text-anchor="middle">QR Error</text></svg>`;
  }
}

/**
 * Returns a data:image/svg+xml URI suitable for <img src="..." />
 */
export function generateQrSvgDataUri(text: string, options: QrSvgOptions = {}): string {
  const svg = generateQrSvgString(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Asynchronously generates a PNG data URL (base64) using canvas/node-qrcode.
 */
export async function generateQrPngDataUrl(text: string, options: QrPngOptions = {}): Promise<string> {
  const { width = 400, margin = 1, color = { dark: '#111827', light: '#ffffff' } } = options;
  return QRCode.toDataURL(text, {
    width,
    margin,
    color,
    errorCorrectionLevel: 'M',
  });
}
