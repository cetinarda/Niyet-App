# -*- coding: utf-8 -*-
"""Uzun cizgi temizligi (altin kural #8) - baglama duyarli.

Yasak: — (U+2014) – (U+2013) ― (U+2015)
Dokunulmaz: ─ (U+2500 kutu cizgisi; kod icinde bolum ayiraci)

KARSILIK KURALLARI (onceki elle temizligin uslubunu izler: bkz. 653f718)
  Latin metin, " — " kalibi:
    sol taraf KISA ETIKET (<=4 kelime, virgulsuz)   ->  ": "   (Kyron: DNA 12 Tabaka)
    sol taraf UZUN IFADE                            ->  ", "   (aciklayici ek)
  Ispanyolca acilis/kapanis ( —X ... X— )           ->  ", "
  Japonca —— / —                                    ->  "、"
  Satir basinda / madde isaretinde                  ->  kaldirilir

CLAUDE.md dosyalari HARIC: kuralin kendisi yasak karakterleri ornek olarak
listeliyor, onlari degistirmek kurali bozar.
"""
import io, os, re, sys, json

DRY = '--apply' not in sys.argv
ONLY = None
for a in sys.argv[1:]:
    if a.startswith('--only='):
        ONLY = a.split('=', 1)[1]

BAD = '—–―'
SKIP_DIRS = {'node_modules', '.git', 'dist', '_expo', 'ios', 'android',
             '.expo', 'out', '.next', 'build', '.netlify', 'coverage'}
# ALTIN KURAL #6: src/purchases.js'e dokunulmaz (IAP / para mantigi, Apple
# makbuz dogrulama). Icindeki 7 uzun cizgi yalnizca yorum satirlarinda ama
# karar kullanicinin; script kendi basina degistirmesin.
SKIP_PATHS = {'./src/purchases.js'}
SKIP_NAMES = set()
EXT = ('.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.md',
       '.html', '.css', '.txt', '.yml', '.yaml')

# Sol baglamin nerede basladigi: son cumle sonu / tirnak / satir basi
SEG_START = re.compile(r'[.!?;:"\'`\n>\[\{（。！？]')
CJK = re.compile(r'[぀-ヿ㐀-鿿]')
# Kuralin KENDISINDEN bahseden metin (AI prompt talimatlari, CLAUDE.md kurali).
# Oradaki ornek karakteri degistirmek talimati anlamsiz kilar.
RULE_TEXT = re.compile(r'em dash|en dash|horizontal bar|uzun \u00e7izgi|uzun cizgi|yatay \u00e7izgi|u\+201|\[\u2014\u2013\u2015\]')


def sp_before_en(pb, na):
    """En dash iki yaninda da bosluklu yazilmissa boslugu koru (MO 4 - MS 65)."""
    return pb == ' ' and na == ' '


def left_seg(s, i):
    j = i
    while j > 0 and not SEG_START.match(s[j - 1]):
        j -= 1
    return s[j:i]


def fix(s):
    out = []
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c not in BAD:
            out.append(c)
            i += 1
            continue

        # ardisik cizgileri tek birim say (Japonca ——)
        k = i
        while k < n and s[k] in BAD:
            k += 1
        # `out` bir karakter listesi; buyuk dosyalarda her cizgide bastan
        # join etmek O(n^2) oluyordu (animalLore.ts'te 7000 cizgi). Sadece
        # gereken kadar SON parcayi birlestir.
        before = ''.join(out[-90:])
        after = s[k:k + 90]
        pb = out[-1] if out else ''
        na = s[k] if k < n else ''

        # KURALIN KENDISINDEN BAHSEDEN metne DOKUNMA. AI prompt'larinda
        # "em dash (—) kullanma" gibi talimatlar var; oradaki ornek karakteri
        # degistirmek talimati anlamsiz hale getirir.
        # NOT: yalnizca "çizgi" aramak COK GENIS. Turkce'de cizgi = line;
        # "zebranin cizgi deseni", "CRT tarama cizgileri" gibi sirasan
        # cumleler yanlislikla korunuyordu. Kalibi kuralin kendisine daralt.
        win = (before[-70:] + after[:70]).lower()
        if RULE_TEXT.search(win):
            out.append(s[i:k])
            i = k
            continue

        # EN DASH (–) bu kod tabaninda her zaman ARALIK/baglac: 1996–2016,
        # 5–10 is gunu, 00:00–03:00. Baglamdan bagimsiz duz kisa cizgi.
        if s[i] == '–':
            while out and out[-1] == ' ':
                out.pop()
            out.append(' - ' if sp_before_en(pb, na) else '-')
            j = k
            while j < n and s[j] == ' ':
                j += 1
            i = j
            continue

        # Japonca/CJK baglam
        if CJK.search(before[-2:] or '') or CJK.search(after[:2] or ''):
            # Japonca'da ILGEC ONCESI virgul HATALIDIR. Cizgi bir parantez
            # kapatiyorsa ("...羅針盤——あの感じ——を信じる") virgul koymak
            # "感じ、を信じる" gibi bozuk bir cumle uretir; orada cizgiyi at.
            if pb in '、。：' or na in 'をはがにでともへ。」、':
                pass
            else:
                out.append('、')
            i = k
            continue

        # satir basi / madde isareti / YORUM BASI: cizgiyi at.
        # ("// — TODO: ..." aksi halde "//: TODO: ..." oluyordu.)
        stripped = before.rstrip(' \t')
        if (pb in ('', '\n') or stripped.endswith('\n')
                or stripped.endswith('//') or stripped.endswith('/*')
                or stripped.endswith('*') or stripped.endswith('#')):
            i = k
            if na == ' ':
                i += 1
            continue

        sp_before = pb == ' '
        sp_after = na == ' '

        # ARALIK / bitisik kullanim: iki yaninda da bosluk yoksa duz kisa cizgi.
        # (1207–1273, 8–20. yuzyil, A—B). Noktalama koymak burada anlami bozar:
        # "1907–1912" -> "1907: 1912" gibi.
        if not sp_before and not sp_after:
            # Yaninda ZATEN duz kisa cizgi varsa ikizleme. Kritik ornek:
            # regex karakter sinifi `[\s.,;:—-]` -> `[\s.,;:--]` olurdu ve
            # `:` ile `-` arasinda ters aralik olusup CALISMA ANINDA patlardi
            # ("Range out of order in character class"). Derleme bunu yakalamaz.
            if pb == '-' or na == '-':
                i = k
                continue
            out.append('-')
            i = k
            continue

        # onceki bosluklari kirp, sonrakini tek boslukla birak
        while out and out[-1] == ' ':
            out.pop()
        j = k
        while j < n and s[j] == ' ':
            j += 1

        prev = out[-1] if out else ''
        if prev in ',;:':
            out.append(' ')      # zaten noktalama var
        elif prev in '.!?':
            out.append(' ')      # cumle bitmis
        else:
            tail = ''.join(out[-120:])
            seg = left_seg(tail, len(tail)).strip()
            words = seg.split()
            short_label = len(words) <= 4 and ',' not in seg and len(seg) <= 34
            # Ispanyolca asimetrik ( —X veya X— ) her zaman virgul
            asymmetric = sp_before != sp_after
            out.append(': ' if (short_label and not asymmetric) else ', ')
        i = j
    return ''.join(out)


def clean_artifacts(s):
    """Yalnizca BU SCRIPTIN uretebilecegi artiklari toparlar.

    DIKKAT: burada genel "noktalama duzeltme" YAPILMAZ. Ilk denemede
    `re.sub(r' +([,:;])', r'\\1', s)` ve `re.sub(r'([,:]) +', r'\\1 ', s)`
    vardi; ikisi de kodu bozdu:
      - `cur ? cur + ' ' + w : w` ucluk operatoru `w: w` oldu,
      - hizalanmis nesne alanlari (`bio_label:      "..."`) tek boslupa dustu.
    Kod ve metin ayni dosyada yasadigi icin bicimsel duzeltmeler guvensiz.
    """
    return re.sub(r'、\s*、', '、', s)


def main():
    targets = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        if root.startswith('./public/embedded'):
            dirs[:] = []
            continue
        for fn in files:
            if fn in SKIP_NAMES or not fn.endswith(EXT):
                continue
            p = os.path.join(root, fn)
            if p in SKIP_PATHS:
                continue
            if ONLY and ONLY not in p:
                continue
            targets.append(p)

    changed = touched = 0
    samples = []
    for p in sorted(targets):
        try:
            s = io.open(p, encoding='utf-8').read()
        except Exception:
            continue
        if not any(c in s for c in BAD):
            continue
        new = clean_artifacts(fix(s))
        if new == s:
            continue
        if p.endswith('.json'):
            try:
                json.loads(new)
            except Exception as e:
                print(f'!! JSON BOZULDU, atlandi: {p}  ({e})')
                continue
        changed += sum(s.count(c) for c in BAD)
        touched += 1
        if len(samples) < 14:
            for m in re.finditer(f'[{BAD}]', s):
                a = max(0, m.start() - 42)
                samples.append((p, s[a:m.start() + 42].replace('\n', '\\n')))
                break
        if not DRY:
            io.open(p, 'w', encoding='utf-8').write(new)

    print(('KURU CALISMA (yazilmadi)' if DRY else 'UYGULANDI') +
          f': {changed} cizgi, {touched} dosya')
    if DRY:
        print('\nOrnekler (once):')
        for p, s in samples:
            print(f'  {p}\n     {s}')


if __name__ == '__main__':
    main()
