# Tura — Hayvan Rehberliği

Tura is the **first sub-app** of the sakin.life ecosystem.

## Ecosystem Overview

| App | Focus | Data source | Status |
|-----|-------|-------------|--------|
| **sakin.life** | Master / landing | — | Active |
| **Tura** (this repo) | Hayvan Rehberliği | `src/data/animals.json` | Active |
| Taş Rehberliği | Crystal guidance | `src/data/stones.json` | Future |
| Bitki Rehberliği | Plant wisdom | new | Future |
| Mitler ve İmgeler | Archetypes/symbols | `src/data/naguals.json` | Future |
| Human Design | HD system | `src/utils/humanDesign.ts` | Future |
| Numeroloji | Numerology | `src/utils/numerology.ts` | Future |

## What Tura Contains (scope)

- **Hayvanlar tab**: Animal library, Nagual finder, spirit-animal quiz
- **Bugün tab**: Daily deck with 2 cards — Hayvan + Söz (quote)
- **Arşiv tab**: Past readings
- **Profil tab**: User profile, numerology, Human Design preview, Sakin Ailesi ecosystem links

## Data Files Preserved for Future Apps

- `src/data/stones.json` → Taş Rehberliği
- `src/data/naguals.json` → Mitler ve İmgeler  
- `src/utils/humanDesign.ts` → standalone HD app
- `src/utils/numerology.ts` → Numeroloji app

## Design System

All sakin.life ecosystem apps share the same design language:
- Colors: `#0A0911` background, teal `#57A7A7`, gold `#DAAF5C`, lavender `#B0A0C8`
- Typography: light weight for headings, minimal letterSpacing
- Icon: dark bg + white center dot + thin teal ring (sub-brand mark)

## Branch

Active development branch: `claude/tura-quotes-app-iiv48`
