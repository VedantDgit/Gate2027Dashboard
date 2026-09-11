# 🚀 GATE 2027 COMMAND CENTER (CS + DA)

### Personal Preparation & Progress Intelligence Dashboard for GATE 2027

An engineering-grade, futuristic mission-control preparation operating system built for dual-branch aspirants appearing for **GATE Computer Science (CS)** and **GATE Data Science & Artificial Intelligence (DA)** in **February 2027**.

Designed with the precision aesthetics of Linear, Raycast, and GitHub—delivering deep telemetry, algorithmic weakness analysis, spaced revision scheduling, and real-time syllabus tracking.

---

## 🌟 Key Features

1. **Complete Hard-coded Official Syllabus**
   - 100% complete official GATE CS & GATE DA syllabi.
   - Granular status management per topic: `○ Not Started`, `◐ Learning`, `✓ Completed`, `↻ Needs Revision`.
   - Confidence scoring (1–5 scale), study hour tracking, PYQ metrics, last studied dates, and personal topic formula memos.

2. **Exam Countdown & Progress Telemetry**
   - Dynamic countdown to February 2027 with days and weeks left.
   - Multi-ring SVG telemetry displaying Overall, CS Core, and DA Core completion percentages.
   - Dynamic preparation intelligence insights tailored to current streak and overdue queues.

3. **Study Timer & Focus Engine**
   - Pomodoro and deep work circular focus station (25m, 50m, 90m GATE exam blocks, and custom intervals).
   - Live progress animations and audio chime alert upon completion.
   - Seamless one-click session logger to persist focus time.

4. **PYQ Tracker & Searchable Mistake Bank**
   - Question-by-question solve speed and accuracy analytics.
   - Dedicated **Mistake Bank** to capture root causes of errors (calculation, concept, tricky phrasing).
   - Subject-wise attempted vs correct charts using Recharts.

5. **Full-Length Mock Test Analytics**
   - Score trajectory and accuracy trend line charts.
   - Comprehensive diagnostic breakdown: total marks, questions attempted, correct/incorrect ratios, time taken, and subject distributions.

6. **Algorithmic Spaced Revision System**
   - Ebbinghaus retention scheduler across 5 spaced intervals: $R_1 (+1\text{d}), R_2 (+3\text{d}), R_3 (+7\text{d}), R_4 (+14\text{d}), R_5 (+30\text{d})$.
   - Urgency status alerts: 🔴 Overdue, 🟡 Due Today, 🟢 Upcoming.
   - One-click completion with automatic next-stage advancement.

7. **Deterministic Weakness Analyzer**
   - Mathematical scoring algorithm combining confidence deficit (35%), PYQ error rate (30%), explicit revision flags (25%), and study staleness (10%).
   - Generates actionable ranked priority lists with direct "Study Now" triggers.

8. **Daily Mission Planner & Heatmap**
   - 365-day GitHub-style interactive study activity heatmap with hover tooltips.
   - Daily task checklist with duration, subject tags, priority indicators, and progress completion bar.

9. **Notes & Formula Sheets**
   - Topic-linked markdown note storage for theorems, algorithm steps, and standard exam traps.

10. **Achievements & Milestone Goals**
    - Unlocked badges with confetti animations for study streaks, total study hours, PYQs solved, and mock test scores.

11. **100% Local Privacy & Full JSON Portability**
    - Instant one-click JSON backup export and restore capability across devices.
    - Zero server lock-in; works completely offline via LocalStorage.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15+ (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (v4) with custom glassmorphism and modern dark design tokens
* **Icons**: Lucide React
* **Charts & Analytics**: Recharts
* **State Management**: Zustand with LocalStorage synchronization
* **Celebrations**: Canvas Confetti
* **Deployment Target**: Vercel

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js 18+ / 20+ / 24+
* npm, yarn, or pnpm

### 1. Clone or Open the Repository
\`\`\`bash
git clone <repository-url>
cd "GATE Website"
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Vercel Deployment Instructions

This application is 100% serverless, zero-dependency, and built specifically for Vercel deployment:

1. Push your repository to **GitHub / GitLab / Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"New Project"**.
3. Import your repository.
4. Framework Preset: **Next.js**.
5. Build Command: `npm run build`
6. Output Directory: `.next`
7. Click **Deploy**.

---

## 💾 Data Persistence Architecture

* **Client Storage**: All data is automatically synchronized into `localStorage` under `gate_2027_command_center_v1`.
* **Backup & Restore**: Navigate to `/settings` to download a complete `.json` export or restore previous backups.
* **Backend Ready**: State logic is structured through Zustand store actions (`src/store/useGateStore.ts`), making future integration with Supabase, PostgreSQL, or Firebase effortless.

---

## 🧭 Future Backend Roadmap (v2)

- [ ] Supabase Auth & Cloud Database Synchronization
- [ ] Collaborative Peer Leaderboard & Study Rooms
- [ ] AI-assisted PYQ Question Generator & OCR Formula Scanner
- [ ] Live Sync with Google Calendar & Notion
- [ ] Web Push Notifications for Overdue Spaced Revisions
