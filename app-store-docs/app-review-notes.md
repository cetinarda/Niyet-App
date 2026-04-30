# App Review Notes — Apple Review Team

## Application Summary

**Sakin** is a paid **Lifestyle** application that guides users through a daily mindfulness routine — from morning intention to evening closure. The app does not make any medical claims; it focuses on "reminders", "habit building" and "personal awareness".

**Price:** $9.99 one-time purchase. No in-app purchases, no subscriptions.

---

## Technical Notes for Review Team

### Account / Demo
- The app **does not require** account registration or login.
- No demo account needed.
- The app works immediately upon launch.

### Main Flow
1. Launch screen -> Tap "HAZIRIM" (I'm ready)
2. Write a morning intention (any text)
3. Select 3 motivation words
4. Breathing exercise screen (tap a mode, then Start)
5. Sound Waves — tap a solfeggio frequency to listen
6. Daily chakra screen — view energy center info
7. Daily reminders checklist
8. Evening closure — write reflection notes
9. Weekly statistics map with AI-generated report

---

## Category and Content Compliance

| Topic | Detail |
|---|---|
| **Category** | Lifestyle — no medical/health claims |
| **HealthKit** | Not used |
| **Medical claims** | None — uses "awareness" and "reminder" language |
| **Spiritual content** | Reiki and chakra terms are used in cultural/traditional context; does not represent any specific religion |
| **AI features** | Uses Groq API (Meta Llama) for personalized text analysis. Explicit user consent is required before first use (Apple Guideline 5.1.2(i)) |
| **User data** | Stored locally on device only. AI features send anonymous text to API — no personal identifiers |
| **Notifications** | Local notifications only, with user permission |
| **Third-party SDKs** | Capacitor plugins (splash screen, haptics, status bar, local notifications) |
| **Ads** | None |
| **In-App Purchases** | None — paid app model |
| **Privacy Manifest** | PrivacyInfo.xcprivacy included — declares UserDefaults API usage |

---

## Areas Requiring Special Attention

### AI-Powered Features (Guideline 5.1.2(i))
The app includes two AI features:
- **Inner Mirror (Icsel Ayna):** Analyzes user-written text and provides personalized spiritual reflection
- **Weekly Report:** Generates a weekly summary based on daily journal entries

**Data handling:**
- User must explicitly consent before any data is sent (consent modal with Accept/Decline)
- Only the user's written text is sent — no name, email, location, or device identifiers
- AI provider: Groq API (Meta Llama 3.3 70B)
- Groq does not use submitted data for model training
- All communication is over HTTPS

### Reiki and Chakra Content (Guideline 1.1)
- Does not represent any specific religion
- Not presented as therapeutic or medical treatment
- Framed as "energy awareness" and "body awareness" in cultural context
- Contains no health claims

### Solfeggio Frequencies (Sound Waves)
- 10 frequencies with spiritual/wellness descriptions
- Descriptions use experiential language ("listeners describe...", "is believed to...")
- No medical claims (pain relief, DNA repair, etc. have been removed)

### Orchestra Mode (Simulated Community Count)
The weekly map screen shows "312 people breathed with you today" — this is a **motivational placeholder**, not real-time data. Happy to update if this is considered misleading.

---

## Contact

For questions during the review process:

**Developer:** Arda Cetin
**Email:** destek@sakin.app
