# Sakin tarot kart görselleri (Bugün ekranındaki günün kartı destesi).
#
# KAYNAK: Rider-Waite-Smith destesinin 1909 orijinal baskısı (Pamela Colman
# Smith çizimleri), Wikimedia Commons taramaları. 1909 baskısı kamu malıdır.
# ("Rider-Waite" adı başka bir firmanın markası; arayüzde bu ad KULLANILMAZ.)
#
# STİL ("Sakin galaktik piksel"): kâğıt kenarı + İngilizce başlık şeridi
# kırpılır (kart adı arayüzde 7 dilde yazılıyor), orijinal renkler gece
# mor/altın bir tonlamayla yarı yarıya karıştırılır, 90 px genişliğe indirilip
# 32 renge sabitlenir (8-bit his). Arayüz `image-rendering:pixelated` ile 2x
# büyütür, pikseller keskin kalır. Kart arkası (back.png) tamamen bize ait,
# burada çiziliyor.
#
# ÇIKTI: public/tarot/<kart-id>.png (78 kart) + public/tarot/back.png
# Kullanım:  pip install pillow && python3 scripts/build-tarot-art.py
#            (--sheet yolu verilirse tüm kartların kontrol sayfasını da üretir)
import os, sys, time, urllib.request, urllib.parse, random
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "tarot")
CACHE = os.environ.get("TAROT_SRC_CACHE") or os.path.join(os.path.expanduser("~"), ".cache", "sakin-tarot-src")
W = 90          # piksel sanat genişliği (arayüz 2x gösterir)
CH = 140        # sabit yükseklik: tüm kartlar aynı oranda (arayüz sabit kutu)
COLORS = 32

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
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(fn) + "?width=320"
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
    return sm.quantize(colors=COLORS, method=Image.MEDIANCUT, dither=Image.Dither.NONE)

def card_back(h):
    """Bize ait kart arkası: gece mavisi zemin, piksel yıldızlar, ortada hilal."""
    rnd = random.Random(7)
    im = Image.new("RGB", (W, h), (14, 11, 38))
    d = ImageDraw.Draw(im)
    for y in range(h):                       # dikey hafif degrade
        k = y / h
        d.line([(0, y), (W, y)], fill=(int(14 + 16 * k), int(11 + 6 * k), int(38 + 30 * k)))
    d.rectangle([2, 2, W - 3, h - 3], outline=(150, 128, 205))
    d.rectangle([5, 5, W - 6, h - 6], outline=(70, 56, 120))
    for _ in range(70):                      # yıldızlar
        x, y = rnd.randrange(8, W - 8), rnd.randrange(8, h - 8)
        c = rnd.choice([(200, 190, 240), (240, 220, 160), (140, 125, 200)])
        d.point((x, y), fill=c)
        if rnd.random() < 0.15:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                d.point((x + dx, y + dy), fill=(110, 95, 170))
    cx, cy, R = W // 2, h // 2, 17          # hilal: dolu daire EKSİ kaydırılmış daire
    mask = Image.new("1", (W, h), 0)        # (maskeyle; gölge diski zeminde görünmesin)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - R, cy - R, cx + R, cy + R], fill=1)
    md.ellipse([cx - R + 8, cy - R - 3, cx + R + 8, cy + R - 3], fill=0)
    im.paste((240, 214, 140), (0, 0), mask)
    for (x, y) in ((cx, 14), (cx, h - 15)):  # üst/alt küçük parıltı
        d.point((x, y), fill=(240, 222, 160))
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 0), (0, 2), (0, -2)):
            d.point((x + dx, y + dy), fill=(200, 180, 240))
    return im

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
        art.save(os.path.join(OUT, cid + ".png"), optimize=True)
        tiles.append(art.convert("RGB"))
    card_back(CH).save(os.path.join(OUT, "back.png"), optimize=True)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"{len(files)} kart + back.png -> {OUT} ({total // 1024} KB)")
    if "--sheet" in sys.argv:
        dest = sys.argv[sys.argv.index("--sheet") + 1]
        cols = 13
        sheet = Image.new("RGB", (cols * (W + 4), 6 * (CH + 4)), (0, 0, 0))
        for i, tl in enumerate(tiles):
            sheet.paste(tl, ((i % cols) * (W + 4), (i // cols) * (CH + 4)))
        sheet.save(dest)
        print("sheet ->", dest)

if __name__ == "__main__":
    main()
