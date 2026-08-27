#!/usr/bin/env python3
"""Generate Tura app icon assets.
Design: sakin.life alt-markası — ortada tek nokta, ince iki halka.
Minimalist, ekosistemle uyumlu, fark edilebilir alt-marka."""

import math
import os
from PIL import Image, ImageDraw, ImageFilter

ASSETS = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets')
os.makedirs(ASSETS, exist_ok=True)

# sakin.life ekosistemi paleti
BG       = (10, 9, 17)       # #0A0911 — daha saf koyu
TEAL     = (87, 167, 167)    # Tura birincil rengi
TEAL_DIM = (55, 110, 110)
GOLD     = (218, 175, 92)    # sub-brand aksan
WHITE    = (230, 225, 240)   # nötr nokta (sakin.life ile aile bağı)


def make_icon(size):
    img = Image.new('RGB', (size, size), BG)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2

    # ── Dış ince teal halkası (alt-marka işareti) ──────────────────────────
    r_outer = size * 0.36
    lw = max(1, int(size * 0.006))
    draw.ellipse(
        [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
        outline=(*TEAL, 180), width=lw,
    )

    # ── İç ince halkası (nokta çerçevesi, daha silik) ─────────────────────
    r_inner = size * 0.20
    draw.ellipse(
        [cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
        outline=(*TEAL, 70), width=max(1, int(size * 0.003)),
    )

    # ── Merkez nokta — sakin.life'ın imzası ───────────────────────────────
    dot_r = size * 0.085
    # Soft glow behind dot
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(6, 0, -1):
        gr = dot_r + i * (size * 0.012)
        alpha = int(22 * (7 - i) / 6)
        gd.ellipse(
            [cx - gr, cy - gr, cx + gr, cy + gr],
            fill=(*WHITE, alpha),
        )
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    draw.ellipse(
        [cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
        fill=(*WHITE, 255),
    )
    img = img.convert('RGB')
    return img


def make_adaptive(size):
    """Android adaptive — şeffaf bg, safe-zone içinde tasarım."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2

    # safe-zone = merkez %66 — tasarımı küçültülmüş oranlarda
    r_outer = size * 0.25
    lw = max(1, int(size * 0.005))
    draw.ellipse(
        [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
        outline=(*TEAL, 180), width=lw,
    )
    r_inner = size * 0.14
    draw.ellipse(
        [cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
        outline=(*TEAL, 70), width=max(1, int(size * 0.003)),
    )
    dot_r = size * 0.06
    draw.ellipse(
        [cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r],
        fill=(*WHITE, 255),
    )
    return img


def make_splash(size=2048):
    img = Image.new('RGB', (size, size), BG)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Daha büyük halka oranı splash için
    r_outer = size * 0.30
    draw.ellipse(
        [cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer],
        outline=(*TEAL, 160), width=max(2, int(size * 0.004)),
    )
    r_inner = size * 0.165
    draw.ellipse(
        [cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner],
        outline=(*TEAL, 55), width=max(1, int(size * 0.002)),
    )
    dot_r = size * 0.07
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i in range(8, 0, -1):
        gr = dot_r + i * (size * 0.008)
        alpha = int(18 * (9 - i) / 8)
        gd.ellipse([cx - gr, cy - gr, cx + gr, cy + gr], fill=(*WHITE, alpha))
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=(*WHITE, 255))
    return img.convert('RGB')


# ── Üret ──────────────────────────────────────────────────────────────────
icon = make_icon(1024)
icon.save(os.path.join(ASSETS, 'icon.png'), 'PNG', optimize=True)
print('icon.png 1024×1024')

adaptive = make_adaptive(1024)
adaptive.save(os.path.join(ASSETS, 'adaptive-icon.png'), 'PNG', optimize=True)
print('adaptive-icon.png 1024×1024 (şeffaf)')

splash = make_splash(2048)
splash.save(os.path.join(ASSETS, 'splash-icon.png'), 'PNG', optimize=True)
print('splash-icon.png 2048×2048')

fav = make_icon(96)
fav.save(os.path.join(ASSETS, 'favicon.png'), 'PNG', optimize=True)
print('favicon.png 96×96')

print('\nTüm asset\'ler üretildi.')
