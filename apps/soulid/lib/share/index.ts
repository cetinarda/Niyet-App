import { toPng } from 'html-to-image';

export async function captureNode(node: HTMLElement): Promise<string> {
  return toPng(node, {
    quality: 1,
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#04020f',
  });
}

export function downloadDataUrl(dataUrl: string, filename = 'soulprofile-karne.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Share sheet title/text. Turkish is the default so callers that pass no
// locale behave exactly as before. SoulID supports only tr + en.
const SHARE_TEXT = {
  tr: { title: 'Galaktik Karnem', text: 'SoulID ile galaktik karnemi keşfettim ✦' },
  en: { title: 'My Galactic Profile', text: 'I discovered my galactic profile with SoulID ✦' },
} as const;

export async function shareDataUrl(
  dataUrl: string,
  filename = 'soulprofile-karne.png',
  locale: 'tr' | 'en' = 'tr',
) {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });
    if (
      typeof navigator !== 'undefined' &&
      navigator.share &&
      navigator.canShare?.({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: SHARE_TEXT[locale].title,
        text: SHARE_TEXT[locale].text,
      });
      return true;
    }
  } catch (err) {
    console.warn('[share] Web Share API failed, falling back to download', err);
  }
  downloadDataUrl(dataUrl, filename);
  return false;
}
