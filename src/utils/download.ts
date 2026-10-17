/** Browser download + SVG rasterisation helpers used by the press kit. */

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function downloadSvg(svg: string, filename: string) {
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), filename);
}

export function downloadText(text: string, filename: string, mime = 'text/plain') {
  downloadBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

/**
 * Rasterise an SVG string to a PNG blob at the requested pixel size.
 * Returns null when the browser refuses (e.g. the SVG failed to parse).
 */
export function svgToPngBlob(
  svg: string,
  width: number,
  height: number,
  background?: string
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'sync';

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };

    image.onerror = () => resolve(null);
    image.src = svgToDataUrl(svg);
  });
}

export async function svgToPngBytes(
  svg: string,
  width: number,
  height: number,
  background?: string
): Promise<Uint8Array | null> {
  const blob = await svgToPngBlob(svg, width, height, background);
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
