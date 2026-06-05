# App Store Review — Sakin Hayvan Rehberi

Notes for the App Review team.

## What this app does

A free Turkish-language spiritual-reflection app focused on animal symbolism. The user shakes the phone (or taps a button) to receive a daily card with an animal totem and a quote, kept in a personal archive.

## Demo credentials

**No login required.** The app is fully usable on first launch with no sign-up or sign-in. There is nothing to log in to.

## In-app purchases

**None.** The app is free with no subscriptions, no IAP, and no premium tier. All features are available to every user.

## Permissions requested

- **Motion (NSMotionUsageDescription)** — used only to detect a shake gesture for drawing the day's card. The user can also tap a button instead; permission is not required to use the app.
- **Notifications (local only)** — optional opt-in for a daily reminder. Local notifications only; no remote push.

The app does NOT access camera, microphone, contacts, location, photos, calendar, or HealthKit.

## Data collection

**None.** All readings, profile data, and stats are stored locally on the device via AsyncStorage. The privacy manifest (`NSPrivacyCollectedDataTypes`) is empty.

The four APIs declared in the privacy manifest (FileTimestamp, UserDefaults, SystemBootTime, DiskSpace) are required-reason APIs accessed by React Native and Expo infrastructure, not by application code that collects user data.

## Content disclaimer

A disclaimer modal is shown on first launch (and accessible from Profile) stating that the content is **for personal reflection and educational purposes only — not medical, psychological, or spiritual advice.**

## Account deletion

Not applicable. No accounts exist. Local data can be cleared by deleting the app.

## Contact

- Support: https://sakinhayvan.netlify.app/support
- Privacy: https://sakinhayvan.netlify.app/privacy
- Terms: https://sakinhayvan.netlify.app/terms
