---
date: 2026-05-16
version: 1.0
language: en
slug: app-review-notes
audience: Apple App Review Team
---

# Notes for the App Review Team

Hello, and thank you for reviewing Sakin Tasarım. This note is intentionally short.

## What the app is

Sakin Tasarım is an on-device reference and journaling tool for the **Human Design** system — a specific body of work created by Ra Uru Hu in the late 1980s. The user types in a date, time and city of birth; the app draws their bodygraph and explains the components (type, inner authority, profile, centers, channels, gates).

## Why this is not a Guideline 4.3 (Spam) duplicate

Most apps Apple sees in this neighborhood are daily-horoscope, zodiac or "predict-your-future" apps. Sakin Tasarım is materially different on every axis:

1. **Different system.** It implements Human Design, not Western or Chinese astrology, numerology, tarot, or daily horoscopes. The output is a structural chart (5 types, 9 centers, 36 channels, 64 gates), not a forecast.
2. **On-device computation.** Planetary positions are calculated locally via Meeus-based VSOP ephemerides. There is no API call, no cloud function, no third-party SDK. This is engineering work, not a wrapper around a public horoscope feed.
3. **Turkish-first content.** All interpretive text was written in Turkish from the source literature, not auto-translated from an English template.
4. **No monetization mechanics.** No ads, no IAP, no subscription, no upsell. The app is free and self-contained.
5. **Educational framing.** The app is positioned as a personal-exploration and journaling reference, with a visible disclaimer (see below).

## Why this is not a Guideline 5.2.5 (Fortune-Telling) violation

The app does not claim to predict the future, reveal destiny, or read fortunes. It does not generate daily/weekly predictions, lucky numbers, lottery picks, gambling outcomes, or romantic-compatibility forecasts. The "weekly reflection" feature is a journaling prompt based on the user's own static chart — it does not forecast events.

The words "fortune", "predict", "future", "destiny", "fate", "horoscope" appear nowhere in the app's UI, listing copy, keywords or screenshots.

## Guideline 1.4.1 (Physical Harm) — disclaimer

A persistent disclaimer is visible in the app's settings and in the report screens:

> "Sakin Tasarım eğitim ve kişisel keşif amaçlıdır. Tıbbi, psikolojik veya finansal tavsiye değildir. Sağlık kararlarınız için doktorunuza danışın."
> ("Sakin Tasarım is for education and personal exploration. It is not medical, psychological or financial advice. Please consult your physician for health decisions.")

The Terms of Use (https://sakin.life/tasarim/kosullar) repeat the disclaimer.

## Guideline 5.1.1 (Privacy) — zero data collection

This is the most important point. **No data leaves the device.**

- All birth data lives in AsyncStorage on the device.
- No backend server. No analytics SDK. No tracking SDK. No ad SDK.
- We do not show the ATT prompt because we have nothing to ask about.
- Privacy Nutrition Label is set to "Data Not Collected".
- Privacy policy: https://sakin.life/tasarim/gizlilik

Required device permissions: none beyond what Expo declares by default. No location, no camera, no microphone, no contacts, no notifications.

## Test data for the reviewer

To verify a generated chart, please use:

- **Name:** Reviewer
- **Date of birth:** 1990-06-15
- **Time of birth:** 14:30
- **City of birth:** Istanbul, Turkey

This produces a complete, valid bodygraph in under one second.

A second sample, if helpful:

- **Date:** 1985-11-02
- **Time:** 03:45
- **City:** Ankara, Turkey

## About the developer

Sakin Tasarım is part of the **sakin.life** ecosystem — a small set of calm, ad-free mobile apps published by cetinarda. Sibling apps share the same engineering posture: on-device first, no tracking, no subscriptions, no upsell.

## Contact

- App Review questions: info@sakin.life
- Privacy: privacy@sakin.life

Thank you for your time.
