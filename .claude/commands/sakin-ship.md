---
description: Sakin/Niyet-App'i App Store gönderimine hazırla — sürüm kontrolü, build kontrolü, iki branch eşitliği, son durum raporu
---

Sen Sakin/Niyet-App'i iOS App Store gönderimine hazırlıyorsun. CLAUDE.md zaten okundu — kuralları biliyorsun.

Aşağıdaki adımları SIRAYLA çalıştır. Bir adım başarısızsa DUR ve kullanıcıya hata + tahmini neden + öneri sun.

## 1. Repo durumu

```bash
git status --short
git branch --show-current
git log --oneline -5
```

Kirli working tree varsa: kullanıcıya sor (commit/stash/devam?). Asla otomatik commit etme.

## 2. Branch eşitliği kontrolü

`main` ve `claude/check-sakin-life-update-CIpM8` aynı SHA'da mı?

```bash
git fetch origin main claude/check-sakin-life-update-CIpM8 2>&1 | tail -2
echo "main:  $(git rev-parse origin/main)"
echo "CIpM8: $(git rev-parse origin/claude/check-sakin-life-update-CIpM8)"
```

Aynı değilse: linear (main ileride) ise sor → fast-forward yapayım mı?
Ayrışmışsa: DUR. Kullanıcıya bildir, manuel çözüm gerek.

## 3. Sürüm tutarlılığı (4 kaynak EŞLEŞMELİ)

```bash
echo "=== pbxproj ==="; grep -E 'MARKETING_VERSION|CURRENT_PROJECT_VERSION' ios/App/App.xcodeproj/project.pbxproj | sort -u
echo "=== App.jsx ==="; grep -n 'APP_VERSION =' src/App.jsx
echo "=== manifest ==="; cat public/latest-ios-version.json
```

Çakışma varsa: kullanıcıya **mevcut + olması gereken** sürümü tablo halinde sun, onay al, sonra düzelt.

## 4. Build kontrolü

```bash
npm run build 2>&1 | tail -8
```

Hata varsa DUR. Bundle boyutu son commit'te > +50KB gzipped arttıysa kullanıcıyı uyar (regresyon olabilir).

## 5. Push edilmemiş commit kontrolü

```bash
git log origin/main..HEAD --oneline 2>/dev/null
```

Varsa: kullanıcıya neyi push edeceğini söyle, onay al, push et. Hem `main`'e hem `claude/check-sakin-life-update-CIpM8`'e (fast-forward).

## 6. Son durum raporu (yazdır)

```
🚀 SHIP HAZIRLIK RAPORU

Sürüm:       1.2.5 / build 1 ✅
Branch:      main = CIpM8 (SHA xxxxxxx) ✅
Build:       temiz ✅
Push:        her şey güncel ✅

Apple'a göndermeden önce:
[ ] Doğum bilgisi → Sabah açılıyor mu
[ ] Şehir autocomplete iOS'ta dokunma seçimi çalışıyor mu
[ ] Embedded apps geri butonu (← circle) ve premium-CTA yumuşatma
[ ] IAP: temiz cihazda satın al + restore
[ ] UIBackgroundModes=audio gerekli mi (red riski)

Mac komutu:
cd ~/Desktop/Niyet-App && \
git pull origin claude/check-sakin-life-update-CIpM8 && \
npm run build && npx cap sync ios && \
open ios/App/App.xcodeproj
```

## Kurallar

- IAP / `src/purchases.js` değişikliği gördüysen UYAR, kullanıcı onayı olmadan push etme.
- Info.plist / AppDelegate.swift değişikliği gördüysen App Store red riski olabileceğini söyle.
- Asla `--force` veya `--no-verify` kullanma.
- Asla `git reset --hard` çalıştırma.
- Adım hataları sessiz geçme, kullanıcıya sebep + öneri ile sun.
