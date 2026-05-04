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
1. Launch screen → Tap "Hazırım" (I'm ready)
2. Write a morning intention (any text)
3. Select 3 motivation words
4. Breathing exercise screen (tap a mode, then Start)
5. Sound Waves — tap a solfeggio frequency to listen (accompanied by bird sounds)
6. 22 Chakra Ascension — view energy center info, start 60-second connection
7. Daily reminders checklist
8. Evening closure — write reflection notes
9. Connection screen — human body chakra system with progress tracking
10. Weekly AI-generated inner report

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
| **Audio** | App plays solfeggio frequency tones (Web Audio API oscillator) and bird sound recordings from local assets. No streaming. |
| **Microphone** | Not used |
| **Camera** | Not used |

---

## Areas Requiring Special Attention

### AI-Powered Features (Guideline 5.1.2(i))
The app includes AI features:
- **Inner Mirror (İçsel Ayna):** Analyzes user-written text and provides personalized spiritual reflection
- **Reiki Analysis:** Chakra-based analysis of user concerns
- **Mental-Physical Analysis:** Maps emotional patterns to body awareness
- **Health Awareness:** Non-medical awareness suggestions based on user input
- **Weekly Report:** Generates a weekly summary based on daily journal entries and frequency listening time

**Data handling:**
- User must explicitly consent before any data is sent (consent modal with Accept/Decline)
- Only the user's written text is sent — no name, email, location, or device identifiers
- AI provider: Groq API (Meta Llama 3.3 70B)
- Groq does not use submitted data for model training
- All communication is over HTTPS
- AI responses include disclaimer: "Bu yansıtma profesyonel tıbbi tavsiye yerine geçmez"

### Reiki and Chakra Content (Guideline 1.1)
- Does not represent any specific religion
- Not presented as therapeutic or medical treatment
- Framed as "energy awareness" and "body awareness" in cultural context
- Contains no health claims
- 22-chakra system presented as spiritual growth framework, not medical protocol

### Solfeggio Frequencies & Bird Sounds
- 10 frequencies with spiritual/wellness descriptions
- Each frequency accompanied by a matching bird sound (local audio files)
- Descriptions use experiential language ("listeners describe...", "is believed to...")
- No medical claims (pain relief, DNA repair, etc.)
- Neural animation is visual-only, does not claim actual neural effects

### Audio Content
- Solfeggio frequency tones generated via Web Audio API (oscillator)
- Bird sound recordings bundled as local assets (~12MB total)
- SpeechSynthesis API used for single word ("Connected") during chakra therapy
- No streaming, no external audio sources

### Client-Server Model Mismatch
The client-side code references `model:"claude-opus-4-6"` in API requests, but the server-side Netlify function overrides this and always uses `model:"llama-3.3-70b-versatile"` via Groq API. This is intentional — the client parameter is ignored. The actual AI provider is Groq (Meta Llama), as stated in the privacy policy.

---

## Contact

For questions during the review process:

**Developer:** Arda Cetin
**Email:** destek@sakin.app
