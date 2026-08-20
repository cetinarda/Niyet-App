// "Otantik portre" — kullanıcının fotoğrafını el-boyaması RPG kahraman
// portresine çeviren cihaz-üstü dönüşüm. Üçüncü-taraf AI servisi YOK:
// fotoğraf cihazdan çıkmaz (gizlilik), anlık çalışır, çevrimdışı da işler.
//
// Pipeline (klasik illüstrasyon zinciri):
//   1) kare kırp
//   2) KUWAHARA yağlıboya filtresi — bölgeleri düzler, kenarları korur;
//      fotoğrafı gerçekten "fırçayla boyanmış" gösteren asıl adım
//   3) posterize — renk kuantalama, illüstrasyon ton geçişleri
//   4) Sobel mürekkep konturu — çizim hissi veren koyu hatlar
//   5) sıcak fener grade'i (ışıkta altın, gölgede kozmik mor)
//   6) vinyet + üst-soldan altın ışık → portre çerçevesi
//   7) tuval greni

export type StylizeOptions = {
  size?: number; // çıktı kenar uzunluğu (kare)
  radius?: number; // Kuwahara yarıçapı — büyük = daha kalın fırça
  levels?: number; // posterize seviyesi — az = daha "boyama"
};

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('portrait decode failed'));
    img.src = src;
  });
}

/**
 * 3×3 kutu bulanıklık. Kuwahara ÖNCESİ zorunlu: gürültülü girdide çeyrek
 * varyansı gürültüyle sürüklenir ve renk blobu artefaktı çıkar (gökkuşağı
 * lekeleri). Ön-bulanıklık varyansı gerçek yapıya bağlar.
 */
function boxBlur3(src: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          const i = (yy * w + xx) * 4;
          r += src[i]!;
          g += src[i + 1]!;
          b += src[i + 2]!;
          n++;
        }
      }
      const i = (y * w + x) * 4;
      out[i] = r / n;
      out[i + 1] = g / n;
      out[i + 2] = b / n;
      out[i + 3] = 255;
    }
  }
  return out;
}

/**
 * Kuwahara yağlıboya filtresi. Her piksel için 4 çeyrek pencerenin
 * ortalama/varyansını ölçer, EN DÜZ olanın rengini alır → düz boya alanları,
 * keskin kenarlar. Painterly efektin kalbi.
 */
function kuwahara(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(src.length);
  // luminans önbelleği (varyans hesabı için)
  const lum = new Float32Array(w * h);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    lum[p] = src[i]! * 0.299 + src[i + 1]! * 0.587 + src[i + 2]! * 0.114;
  }

  // çeyrek pencere ofsetleri: [x0,y0] köşeleri
  const quads = [
    [-r, -r],
    [0, -r],
    [-r, 0],
    [0, 0],
  ] as const;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let bestVar = Infinity;
      let bR = 0, bG = 0, bB = 0;

      for (const [ox, oy] of quads) {
        let n = 0, sum = 0, sumSq = 0, sr = 0, sg = 0, sb = 0;
        for (let dy = 0; dy <= r; dy++) {
          const yy = y + oy + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = 0; dx <= r; dx++) {
            const xx = x + ox + dx;
            if (xx < 0 || xx >= w) continue;
            const p = yy * w + xx;
            const l = lum[p]!;
            sum += l;
            sumSq += l * l;
            const i = p * 4;
            sr += src[i]!;
            sg += src[i + 1]!;
            sb += src[i + 2]!;
            n++;
          }
        }
        if (n === 0) continue;
        const mean = sum / n;
        const variance = sumSq / n - mean * mean;
        if (variance < bestVar) {
          bestVar = variance;
          bR = sr / n;
          bG = sg / n;
          bB = sb / n;
        }
      }

      const i = (y * w + x) * 4;
      out[i] = bR;
      out[i + 1] = bG;
      out[i + 2] = bB;
      out[i + 3] = 255;
    }
  }
  return out;
}

/**
 * Fotoğrafı otantik, boyanmış bir kahraman portresine dönüştürür.
 * Girdi/çıktı data-URL (capture sırasında CORS sorunu olmaz).
 * SSR-güvenli DEĞİLDİR — yalnız client'ta çağır.
 */
export async function stylizePortrait(
  dataUrl: string,
  { size = 448, radius = 3, levels = 0 }: StylizeOptions = {},
): Promise<string> {
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return dataUrl;

  // ── 1) kare kırp (cover, merkez)
  const side = Math.min(img.width, img.height);
  const sx = (img.width - side) / 2;
  const sy = (img.height - side) / 2;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const src = imageData.data;

  // kontur için ORİJİNAL luminans (Kuwahara öncesi — hatlar net kalsın)
  const edgeLum = new Float32Array(size * size);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) {
    edgeLum[p] = src[i]! * 0.299 + src[i + 1]! * 0.587 + src[i + 2]! * 0.114;
  }

  // ── 2) ön-bulanıklık → Kuwahara yağlıboya
  const painted = kuwahara(boxBlur3(src, size, size), size, size, radius);

  // ── 3-5) opsiyonel posterize + mürekkep kontur + sıcak grade
  // levels <= 0 → posterize kapalı (renk blobu artefaktını önler).
  const step = levels > 1 ? 255 / (levels - 1) : 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const p = y * size + x;
      const i = p * 4;

      let r = painted[i]!;
      let g = painted[i + 1]!;
      let b = painted[i + 2]!;

      // kontrast
      r = (r - 128) * 1.1 + 128;
      g = (g - 128) * 1.1 + 128;
      b = (b - 128) * 1.1 + 128;

      // posterize (yalnız açıksa)
      if (step > 0) {
        r = Math.round(r / step) * step;
        g = Math.round(g / step) * step;
        b = Math.round(b / step) * step;
      }

      // Sobel kontur (kenarda karart → çizim hissi)
      if (x > 0 && x < size - 1 && y > 0 && y < size - 1) {
        const gx =
          -edgeLum[p - size - 1]! + edgeLum[p - size + 1]! +
          -2 * edgeLum[p - 1]! + 2 * edgeLum[p + 1]! +
          -edgeLum[p + size - 1]! + edgeLum[p + size + 1]!;
        const gy =
          -edgeLum[p - size - 1]! - 2 * edgeLum[p - size]! - edgeLum[p - size + 1]! +
          edgeLum[p + size - 1]! + 2 * edgeLum[p + size]! + edgeLum[p + size + 1]!;
        const mag = Math.sqrt(gx * gx + gy * gy);
        if (mag > 70) {
          const ink = Math.min(0.34, (mag - 70) / 320);
          const k = 1 - ink;
          r *= k;
          g *= k;
          b *= k;
        }
      }

      // sıcak fener grade'i: ışıkta altın, gölgede hafif kozmik mor.
      // Ölçülü — agresif kayma renkleri bozuyor (bordo saç/yeşil hale sorunu).
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      r = r * (0.99 + 0.07 * lum) + 5 * (1 - lum);
      g = g * (0.98 + 0.03 * lum);
      b = b * (0.95 + 0.02 * lum) + 12 * (1 - lum);

      // ── 6) vinyet
      const dx = (x - size / 2) / (size / 2);
      const dy = (y - size / 2) / (size / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.62) {
        const v = Math.min(1, (dist - 0.62) / 0.72);
        const f = 1 - v * v * 0.78;
        r = r * f;
        g = g * f;
        b = b * f + v * v * 10;
      }

      // ── 7) gren
      const n = (Math.random() - 0.5) * 9;

      src[i] = clamp(r + n);
      src[i + 1] = clamp(g + n);
      src[i + 2] = clamp(b + n);
      src[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // üst-soldan altın fener ışığı (referans RPG portre dili)
  const glow = ctx.createRadialGradient(size * 0.3, size * 0.15, 0, size * 0.3, size * 0.15, size * 0.9);
  glow.addColorStop(0, 'rgba(245,208,97,0.13)');
  glow.addColorStop(0.4, 'rgba(245,208,97,0.04)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // alt derin gölge — figürü zeminden ayırır
  const base = ctx.createLinearGradient(0, size * 0.5, 0, size);
  base.addColorStop(0, 'rgba(10,4,32,0)');
  base.addColorStop(1, 'rgba(10,4,32,0.6)');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  return canvas.toDataURL('image/jpeg', 0.9);
}
