# Sakin tarot kart görselleri (Bugün ekranındaki günün kartı destesi).
#
# KAYNAK: Rider-Waite-Smith destesinin 1909 orijinal baskısı (Pamela Colman
# Smith çizimleri), Wikimedia Commons taramaları. 1909 baskısı kamu malıdır.
# ("Rider-Waite" adı başka bir firmanın markası; arayüzde bu ad KULLANILMAZ.)
#
# STİL ("Sakin galaktik piksel", ince): kâğıt kenarı + İngilizce başlık şeridi
# kırpılır (kart adı arayüzde 7 dilde yazılıyor), orijinal renkler gece
# mor/altın bir tonlamayla yarı yarıya karıştırılır, 180x280 px'e indirilip
# 48 renge sabitlenir (ince retro doku), sonra 2x EN YAKIN KOMŞU ile 360x560'a
# GÖMÜLÜ büyütülür. Arayüz 180x280 CSS px gösterir.
#
# ⚠️ NEDEN BÜYÜTME GÖRSELİN İÇİNDE (kullanıcı: "kartlar flu"): ilk sürüm 90 px
# görseli CSS `image-rendering:pixelated` ile büyütüyordu. iOS WKWebView bu
# özelliğe güvenilir şekilde uymuyor, 90 px görseli 6x (DPR3) YUMUŞATARAK
# büyütüyor, kart bulanık çıkıyordu. Artık tarayıcıya büyütme işi bırakılmıyor.
# Format WebP kayıpsız: aynı görsel PNG'de ~88 KB, WebP'de ~35 KB (iOS 16+ /
# Android 7+ destekli, projenin alt sınırları bunlar).
#
# ÇIKTI: public/tarot/<kart-id>.webp (78 kart) + public/tarot/back.webp
# Kullanım:  pip install pillow && python3 scripts/build-tarot-art.py
#            (--sheet yolu verilirse tüm kartların kontrol sayfasını da üretir)
import os, sys, time, urllib.request, urllib.parse, random
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "tarot")
CACHE = os.environ.get("TAROT_SRC_CACHE") or os.path.join(os.path.expanduser("~"), ".cache", "sakin-tarot-src")
W = 180         # piksel sanat genişliği
CH = 280        # sabit yükseklik: tüm kartlar aynı oranda (arayüz sabit kutu)
SCALE = 2       # görsele GÖMÜLÜ en-yakın-komşu büyütme (360x560 çıktı)
COLORS = 48

MAJORS = ["Fool","Magician","High_Priestess","Empress","Emperor","Hierophant","Lovers",
          "Chariot","Strength","Hermit","Wheel_of_Fortune","Justice","Hanged_Man","Death",
          "Temperance","Devil","Tower","Star","Moon","Sun","Judgement","World"]
SUITS = {"cu":"Cups","pe":"Pents","sw":"Swords","wa":"Wands"}

def card_files():
    m = {}
    for n, name in enumerate(MAJORS):
        m[f"tr_ma_{n:02d}"] = f"RWS_Tarot_{n:02d}_{name}.jpg"
    for k, f in SUITS.items():
        m[f"tr_{k}_ace"] = f"{f}01.jpg"
        for n in range(2, 11):
            m[f"tr_{k}_{n:02d}"] = f"{f}{n:02d}.jpg"
        m[f"tr_co_pg_{k}"] = f"{f}11.jpg"   # Page
        m[f"tr_co_pa_{k}"] = f"{f}12.jpg"   # Knight
        m[f"tr_co_qu_{k}"] = f"{f}13.jpg"   # Queen
        m[f"tr_co_ki_{k}"] = f"{f}14.jpg"   # King
    return m

def fetch(fn, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(fn) + "?width=640"
    req = urllib.request.Request(url, headers={"User-Agent": "SakinTarotBuild/1.0 (sakin.life)"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
                f.write(r.read())
            return
        except Exception as e:
            if attempt == 3:
                raise
            time.sleep(2 * (attempt + 1))

def lum(p):
    return 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]

def is_dark_row(px, y, l, r):
    span = range(l + 4, r - 4)
    return sum(1 for x in span if lum(px[x, y]) < 80) > 0.78 * len(span)

def smart_crop(im):
    """Kâğıt kenarını ve varsa alttaki başlık kutusunu kırpar.
    Alttan yukarı: önce alt çerçeve çizgisi, sonra (başlık kutusu varsa)
    açık renkli başlık alanı, sonra başlığın ÜST çizgisi. Üst çizgi kartın
    alt %13'ü içinde bulunamazsa başlıksız (sayılı) karttır, alt çerçevede kes."""
    w, h = im.size
    px = im.load()
    l, r, t = int(w * 0.03), int(w * 0.97), int(h * 0.02)
    y = int(h * 0.985)
    while y > h * 0.85 and not is_dark_row(px, y, l, r):
        y -= 1
    frame = y
    while y > h * 0.85 and is_dark_row(px, y, l, r):
        y -= 1
    cut = frame
    limit = frame - int(h * 0.13)
    yy = y
    while yy > limit:
        if is_dark_row(px, yy, l, r):
            cut = yy
            break
        yy -= 1
    return im.crop((l, t, r, cut - 1))

def stylize(im):
    g = ImageOps.grayscale(im)
    tri = ImageOps.colorize(g, black=(10, 8, 34), mid=(122, 90, 190), white=(248, 226, 160))
    mixed = Image.blend(im, tri, 0.5)
    # Oturtma TAM çözünürlükte yapılır, sonra küçültülür: piksellenmiş görseli
    # sonradan ölçeklemek pikselleri eşitsiz yapardı.
    sm = ImageOps.fit(mixed, (W, CH), Image.LANCZOS, centering=(0.5, 0.45))
    q = sm.quantize(colors=COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    return q.resize((W * SCALE, CH * SCALE), Image.NEAREST)

def card_back():
    """Bize ait kart arkası: gece mavisi degrade, ince yıldızlar, altın hilal,
    ince çift çerçeve. 4x büyük çizilip küçültülür (kenar yumuşatma), yani
    her ekranda keskin ve zarif."""
    SS = 4
    w, h = W * SCALE * SS, CH * SCALE * SS
    rnd = random.Random(7)
    im = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):
        k = y / h
        d.line([(0, y), (w, y)], fill=(int(16 + 14 * k), int(12 + 6 * k), int(42 + 26 * k)))
    u = SS * SCALE                                   # 1 "tasarım pikseli"
    d.rounded_rectangle([3 * u, 3 * u, w - 3 * u, h - 3 * u], radius=6 * u, outline=(200, 172, 110), width=u)
    d.rounded_rectangle([6 * u, 6 * u, w - 6 * u, h - 6 * u], radius=4 * u, outline=(96, 80, 150), width=max(1, u // 2))
    for _ in range(110):                              # yıldızlar
        x, y = rnd.randrange(10 * u, w - 10 * u), rnd.randrange(10 * u, h - 10 * u)
        r = rnd.choice([0.35, 0.5, 0.5, 0.8]) * u
        c = rnd.choice([(214, 204, 244), (240, 222, 164), (150, 136, 206)])
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    def spark(x, y, L):                               # dört kollu parıltı
        d.polygon([(x, y - L), (x + L * 0.18, y), (x, y + L), (x - L * 0.18, y)], fill=(240, 222, 164))
        d.polygon([(x - L, y), (x, y + L * 0.18), (x + L, y), (x, y - L * 0.18)], fill=(240, 222, 164))
    spark(w // 2, 22 * u, 6 * u); spark(w // 2, h - 22 * u, 6 * u)
    cx, cy, R = w // 2, h // 2, 34 * u               # hilal: maske (gölge diski görünmez)
    mask = Image.new("L", (w, h), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - R, cy - R, cx + R, cy + R], fill=255)
    md.ellipse([cx - R + 15 * u, cy - R - 6 * u, cx + R + 15 * u, cy + R - 6 * u], fill=0)
    im.paste((236, 208, 138), (0, 0), mask)
    d.ellipse([cx - R - 6 * u, cy - R - 6 * u, cx + R + 6 * u, cy + R + 6 * u], outline=(120, 100, 180), width=max(1, u // 2))
    return im.resize((W * SCALE, CH * SCALE), Image.LANCZOS)

def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(CACHE, exist_ok=True)
    files = card_files()
    assert len(files) == 78, len(files)
    tiles = []
    for cid, fn in files.items():
        src = os.path.join(CACHE, cid + ".jpg")
        fetch(fn, src)
        art = stylize(smart_crop(Image.open(src).convert("RGB")))
        art.save(os.path.join(OUT, cid + ".webp"), lossless=True, method=6)
        tiles.append(art)
    card_back().save(os.path.join(OUT, "back.webp"), quality=90, method=6)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"{len(files)} kart + back.webp -> {OUT} ({total // 1024} KB)")
    if "--sheet" in sys.argv:
        dest = sys.argv[sys.argv.index("--sheet") + 1]
        cols = 13
        sheet = Image.new("RGB", (cols * (W + 4), 6 * (CH + 4)), (0, 0, 0))
        for i, tl in enumerate(tiles):
            sheet.paste(tl.resize((W, CH), Image.NEAREST), ((i % cols) * (W + 4), (i // cols) * (CH + 4)))
        sheet.save(dest)
        print("sheet ->", dest)

if __name__ == "__main__":
    main()
