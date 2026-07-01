# ⚡ Flux Tasks — BuildableLabs Generalist Engineer Assignment

> A production-quality cross-platform task system built with React Native, Node.js/Express, Supabase, and n8n automation.

## 🎯 Phases Built

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | React Native mobile app + Express backend + Supabase |
| **Phase 3** | ✅ Complete | n8n automation: Email→Task, Daily Slack reminders, Weekly digest |
| Phase 2 | 🔜 Future | Offline support + conflict resolution |

---

## 🏗️ Architecture

```
React Native (Expo)  ──►  Express API (Railway)  ──►  Supabase (PostgreSQL)
                                   ▲
                          n8n Cloud Workflows
                    ┌──────────────┴──────────────┐
              Gmail IMAP                    Slack Webhook
              Groq LLM                     Gmail SMTP
```

---

## 🎨 Design — "Flux" Design System

A premium dark-mode UI inspired by Linear.app and Raycast:

- **Mesh gradient headers** — animated violet→cyan gradient
- **Priority stripe cards** — 4px colored left border (🔴 🟡 🟢)
- **Glow checkbox** — spring animation with violet shadow burst
- **Swipe-to-delete** — gesture-driven with red reveal panel
- **Sparkline chart** — bezier SVG curve with gradient area fill
- **Donut chart** — animated completion ring with gradient stroke
- **Streak badge** — pulsing orange glow for daily streaks
- **Glassmorphism bottom sheet** — blur backdrop task creation
- **Staggered list entry** — cascading FadeInDown animation
- **Haptic feedback** — tactile response on every interaction

---

## 📁 Project Structure

```
buildable-task-system/
├── mobile/          # React Native + Expo (TypeScript)
├── backend/         # Node.js + Express (TypeScript)
├── supabase/        # PostgreSQL migrations
├── n8n/             # Automation workflow JSONs + setup guide
├── docs/            # API reference + architecture docs
└── .github/         # CI pipeline (lint + test)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Expo CLI (`npm i -g expo-cli`)
- Supabase project (already set up)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd buildable-task-system
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your Supabase credentials + generate N8N_API_KEY
npm install
npm run dev
```

Backend runs at `http://localhost:3000`

### 3. Database Migration

Run in your Supabase SQL Editor:
```bash
# Copy and run supabase/migrations/001_create_tasks.sql
# Then run supabase/migrations/002_create_summary_view.sql
```

### 4. Mobile Setup

```bash
cd mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://localhost:3000 (or your Railway URL)
npm install
npx expo start
```

Scan QR code with Expo Go or press `i`/`a` for simulator.

### 5. n8n Automation

See [`n8n/README.md`](n8n/README.md) for step-by-step n8n Cloud setup.

---

## 🌐 Deployment

### Backend → Railway
1. Push code to GitHub
2. Connect Railway to your GitHub repo, point to `backend/` directory
3. Set environment variables (see `backend/.env.example`)
4. Railway auto-deploys on every push to main

### Mobile → Expo EAS Build
```bash
cd mobile
npx eas build --platform all --profile production
```

---

## 🧪 Running Tests

```bash
cd backend
npm test                  # Jest integration tests
npm run typecheck         # TypeScript validation
```

---

## 📡 n8n Automation Workflows

| Workflow | Trigger | Action |
|---|---|---|
| **Email → Task** | Gmail IMAP, every 2 min | Groq LLM parses email → creates task → Slack notify |
| **Daily Reminder** | Cron: 9AM Mon–Fri | Fetches due-today tasks → Slack Block Kit message |
| **Weekly Digest** | Cron: Monday 8AM | Builds stats summary → HTML email via Gmail SMTP |

---

## 🛡️ Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand | Minimal boilerplate, no Redux complexity |
| Animations | Reanimated 3 | 60fps on JS thread, spring physics |
| API validation | Zod | Runtime validation + TypeScript inference |
| Logging | Pino | Structured JSON logs, fast, Railway-compatible |
| Soft deletes | `deleted_at` column | Data recovery, audit trail |
| n8n auth | API Key | Separate from user JWTs, easier to rotate |
| LLM model | Groq Llama 3.1 8B | Fast inference (<1s), free tier, good at extraction |

---

## 🔜 Phase 2 — Offline Support (Future)

If Phase 2 were built, the strategy would be:

- **Local queue**: SQLite via `expo-sqlite` stores pending operations
- **Optimistic UI**: Already implemented for toggle/delete
- **Sync on reconnect**: `@react-native-community/netinfo` triggers queue flush
- **Conflict resolution**: Last-write-wins with `updated_at` timestamp comparison
- **Data integrity**: Operations are idempotent (UUID-keyed, soft deletes)

---

## 📄 License

MIT — Built for BuildableLabs Generalist Engineer Assignment
