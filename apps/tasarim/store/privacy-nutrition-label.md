---
date: 2026-05-16
version: 1.0
language: en
slug: privacy-nutrition-label
---

# App Store Connect — Privacy Nutrition Label

A short guide for the **App Privacy** section in App Store Connect
(App Information → App Privacy → Edit).

## Result

Select **"Data Not Collected"** for the entire app.

This corresponds to the public label:

> The developer does not collect any data from this app.

---

## Section-by-section answers

### Data Used to Track You

**Answer: None / Not enabled**

The app has no tracking SDK and does not link data to third-party data for advertising or
measurement. No App Tracking Transparency prompt is shown because nothing is tracked.

### Data Linked to You

**Answer: None**

No data is uploaded to a server, therefore nothing is linked to any user identity that we
control.

### Data Not Linked to You

**Answer: None**

No anonymous analytics, no crash reporting, no diagnostics are collected.

---

## Why this is correct

1. **No backend.** The app makes zero outbound network calls for user data. Planetary
   computations run locally with Meeus-based ephemerides.
2. **No analytics SDK.** No Firebase Analytics, Google Analytics, Meta SDK, Amplitude,
   Mixpanel, App Center, or any equivalent.
3. **No crash SDK.** No Sentry, Crashlytics, Bugsnag, or equivalent.
4. **No ad SDK.** No AdMob, Meta Audience Network, AppLovin, Unity Ads, or equivalent.
5. **Local storage only.** Birth data lives in AsyncStorage on the user's device and is
   never transmitted off-device.
6. **No login.** There is no account system, no email signup, no social login, no Sign in
   with Apple.

Because none of the standard data categories (Contact Info, Health & Fitness, Financial Info,
Location, Sensitive Info, Contacts, User Content, Browsing History, Search History,
Identifiers, Purchases, Usage Data, Diagnostics, Other Data) is collected, the **single
correct answer** is "Data Not Collected".

## Note on the user's own birth data

The user types in their name, date, time and city of birth. Apple's framework defines
"data collection" as **transmitting data off the device** in a manner not strictly necessary
to fulfill the user's immediate request on the screen. Because this birth data:

- Stays on the device, and
- Is processed only to render the chart the user explicitly asked for,

it does **not** count as collected data per Apple's definition. See Apple's App Privacy
documentation:
https://developer.apple.com/app-store/app-privacy-details/

If a reviewer pushes back asking whether birth data is "Sensitive Info" or "Health &
Fitness", the answer is: it is not transmitted, not retained by the developer, and not
linked. Apple's policy explicitly excludes this case from the data-collection definition.

## Where to paste this

- App Store Connect → App Information → App Privacy → Get Started → choose
  **"We do not collect data from this app"** → Publish.
- Re-confirm on each new app version submission.

## If you add features later

If you ever introduce one of the following, the answer changes and you must update the label:

- Cloud sync of profiles (then: User Content → "Other User Content" linked to user)
- Crash reporting (then: Diagnostics → Crash Data, Not Linked)
- Newsletter signup (then: Contact Info → Email, Linked)
- Analytics (then: Usage Data, Not Linked, and disclose the SDK)

Until that day, keep the label at **Data Not Collected**.
