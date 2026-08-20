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

export async function shareDataUrl(dataUrl: string, filename = 'soulprofile-karne.png') {
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
        title: 'Galaktik Karnem',
        text: 'SoulProfile ile galaktik karnemi keşfettim ✦',
      });
      return true;
    }
  } catch (err) {
    console.warn('[share] Web Share API failed, falling back to download', err);
  }
  downloadDataUrl(dataUrl, filename);
  return false;
}
