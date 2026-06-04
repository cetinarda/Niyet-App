# App Review Notes — Sakin Mitler

App Store Connect → **App Information → Notes** alanına yapıştırılacak metin + reddedilirse Resolution Center yanıt şablonları.

## Review Notes (App Information → Notes)

```
Sakin is a Jungian self-reflection and journaling companion presented
as a symbol-card experience. It is not a fortune-telling product and
makes no predictive, medical or therapeutic claims.

The app is a collection of original educational symbol decks — Jungian
archetypes, world myths, universal images, plus classic symbol systems
(Tarot, Rune, I-Ching, Numerology) treated as historical / cultural
study materials. Each entry frames content through Jung (essence,
light aspect, shadow aspect, dream-vs-waking interpretation) plus a
journaling prompt. Inspired by Carl Jung, Joseph Campbell, Caroline
Myss, Carol Pearson and Moore & Gillette.

The experience is intentionally game-like: a user shakes or taps to
draw one card from each of three daily decks, builds a personal
"myth map" from accumulated draws, completes a 7-question quiz to
match an archetype/myth/image, and unlocks badges and streaks over
time. None of these states predict the user's future — they are
journaling outputs.

A clear entertainment / well-being disclaimer is shown on first
launch (one-tap acceptance) and as a footer on every detail card:
"Yansıtma amaçlıdır · tavsiye değildir / For self-reflection · not
advice".

Technical details:
- Local-only app. No account, no network calls, no analytics, no tracking.
- No in-app purchases. No subscriptions. Free.
- Data persisted only in AsyncStorage (UserDefaults via privacy manifest
  CA92.1, declared in PrivacyInfo.xcprivacy).
- Account/data deletion available under Profile → "Veri ve Gizlilik" /
  "Data & Privacy" → "Delete My Profile & Data".
- Bilingual: Turkish (primary) and English.
- A short Human Design educational paragraph in Profile links out to
  a dedicated sister web app (sakindesign.netlify.app); nothing is
  computed inside the iOS app.

No demo account is required (no login).
```

## Demo Account

Gerekmez — login akışı yok. Yukarıdaki review notes'a "No demo account required (no login)." cümlesi zaten dahil.

## Apple'ın muhtemel red sebepleri — hazır cevaplar

### 4.3 — "Spam: app falls within a saturated category (fortune-telling)"

**Resolution Center'a yapıştır:**

```
Thank you for the review. Sakin is not a fortune-telling product; it is a
Jungian symbol and self-reflection journal grounded in Carl Jung,
Joseph Campbell, Caroline Myss, Carol Pearson and Moore & Gillette.

Each card provides educational context (origin, mythology, Jungian reading,
shadow vs. light aspect) plus a journaling prompt. No predictive claims
are made anywhere in the app. An entertainment / well-being disclaimer is
presented on first launch (acknowledged by the user) and appears as a
footer on every detail card — please see attached screenshots showing:

- Screen 1: First-launch disclaimer modal ("Yansıtma Rehberi") with the
  explicit text: "İçerik psikolojik, medikal veya kehanet tavsiyesi
  değildir; yalnızca öz-keşif amaçlıdır."
- Screen 2: Detail card footer "Yansıtma amaçlıdır · tavsiye değildir"
  / "For self-reflection · not advice"
- Screen 3: Profile attribution footer crediting the Jungian authors
  the content is based on.

Additionally:
- 400+ original educational entries across 14+ cultures (archetypes,
  myths, symbols, classical symbol systems) with dual interpretation
  (dream / waking) and a Jungian frame. Classical symbol systems are
  presented strictly as cultural study material, not as predictive
  tools.
- Native journaling features (archive, streak, personal myth map,
  daily draw streak, badges).
- Shake gesture, native Share Sheet.

We respectfully request reconsideration as a unique high-quality
journaling experience.
```

### 4.2 — "Minimum Functionality"

```
Sakin uses platform-native iOS capabilities beyond a generic web view:
- Native shake gesture (expo-sensors) to draw a new card
- Native haptic feedback (expo-haptics) on card flips
- Native Share Sheet (UIActivityViewController) on every detail card
- Local persistence via UserDefaults (AsyncStorage), declared in
  PrivacyInfo.xcprivacy with reason CA92.1
- Dark-mode native styling

The included screen recording shows the shake → flip → share flow.
The content is original (~400 entries authored for this app). We are
not a website wrapper — the iOS build is a native React Native bundle
with native gestures, haptics, share sheet and local persistence.
```

### 5.1.1 — "Account / Data Deletion"

```
The app does not create remote accounts and stores no data off-device.
For data deletion, please tap Profile tab → "Veri ve Gizlilik" section
→ "Profilimi ve Verilerimi Sil" button. This invokes a confirmation
dialog and on accept calls AsyncStorage.multiRemove(), clearing all
stored data and returning the user to the first-launch flow.

A 5-second screen recording of the deletion flow is attached.
```

### 1.4.1 — "Safety: Medical / Wellness claims"

```
Sakin makes no medical, psychological or therapeutic claims. The content
is framed as Jungian symbol study and journaling. Direct referrals such
as "consult a therapist" have been rewritten to open-ended "consider
professional support if needed". A persistent entertainment / well-being
disclaimer is shown on first launch and on every detail card.

The "Human Design" feature is clearly labeled as approximate
(hash-based on-device calculation) and is presented as a self-reflection
prompt, not a personality diagnosis.
```

### 2.3.8 — "Metadata / Keyword spam"

```
Keywords have been revised: the field now lists archetype, shadow work,
dream, mythology, symbol, jungian, journal, reflection, mindfulness,
archetype, shadow work — all directly reflected in app content. We
removed ambiguous health-adjacent terms (no "wellness", "healing",
"reiki", "cure", "therapy") and chose Lifestyle + Entertainment
categories (not Health & Fitness).
```

## Expedited Review

İlk submission'da kullanma. Kritik bug-fix update'lerinde başvurabilirsin.

## Plan B

Reddedilirsen aynı bundle ile **3 büyük değişiklik** yapmadan re-submit etme — Apple "minor change" sayar ve otomatik tekrar reddeder. Resolution Center'da yazışmayı tercih et.
