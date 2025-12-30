# Mastery Learning Desktop App

> A free, open-source, offline desktop application for systematic learning through deliberate practice, error logging, and spaced repetition—designed for mastering complex technical subjects in a foreign language.

![License](https://img.shields.io/badge/license-Non--Commercial-orange.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-28.x-47848F.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)

---

## 🎯 The Problem This Solves

**Learning complex technical material (math, DSA, algorithms) in a foreign language is cognitively overwhelming.**

When studying math theorems or proofs in Russian while thinking in English, students face:

- **Dual cognitive load**: wrestling with both logic AND language simultaneously
- **Lost progress**: no systematic way to track what worked, what failed, and why
- **Attempt chaos**: solving the same problem 10+ times without knowing which strategies helped
- **Vocabulary gaps**: forgetting key Russian terms needed for exams

Existing solutions (Anki, Notion, spreadsheets) don't address the **decoupled workflow** needed: master logic in English first, encode language second.

---

## ✨ Features

### 📝 **Error Entry Logging**

- Log every problem attempt with batch tracking (automatic grouping every 5 attempts)
- Capture: time spent, success/failure, errors, resolution strategies, resources used
- Auto-calculates attempt numbers and batch indices
- Perfect for drilling 50+ problem variations per topic

### 📊 **Material Status Tracking**

- Track progress across all learning materials
- See solved/total problems, average attempts, last review dates
- Status tags: Learning, Reviewing, Mastered

### 🇷🇺 **Russian Drilling Log**

- Separate log for language encoding after English mastery
- Track phrasing errors, keyword usage, explanation attempts
- Built-in vocabulary manager with English↔Russian translation pairs

### ⏱️ **Phase Timer**

- Count-up timer with millisecond precision
- Built-in countdown for Discovery (15min), Drilling (25min), Integration (10min) phases
- Auto-captures time directly into error log forms

### 📈 **Streak Tracker & Activity Heatmap**

- GitHub-style contribution heatmap showing daily activity
- Current streak counter and successful attempts tracker
- Motivates consistent daily practice

### ✅ **Task Manager**

- Integrated todo list with priorities (high/medium/low)
- Deadline tracking and completion toggles
- Keeps learning sessions organized

### 📚 **Dictionary & Subject Statistics**

- **Vocabulary tab**: Search Russian/English words, add translations, review history
- **Subject stats**: See aggregated progress per subject (Math, DSA, etc.)
- Click subjects to drill down into individual materials

### 📖 **Built-in Study Guidelines**

- Complete "Decoupled Mastery Learning" methodology embedded in app
- Step-by-step protocol: English logic first, Russian encoding second
- Timing recommendations for each phase

### 💾 **Export & Backup**

- Export all data to machine-readable JSON
- Includes analytics layer for pattern analysis (success rates, time-to-mastery, etc.)
- Perfect for feeding into ML/data analysis pipelines

### 🌙 **Dark Mode**

- Beautiful dark theme with persistent preference
- All components fully styled for both light and dark modes

---

## 🛠️ Tech Stack

- **Electron 28** — Cross-platform desktop framework
- **React 18** — UI component library
- **Vite** — Lightning-fast build tool
- **better-sqlite3** — High-performance local database (no network required)
- **Tailwind CSS** — Utility-first styling
- **Radix UI** — Accessible component primitives
- **Lucide React** — Beautiful icon library

**100% offline. No telemetry. Your data never leaves your machine.**

---

## 📦 Installation

### Option 1: Download Pre-built Release (Recommended)

1. Go to [Releases](https://github.com/yourusername/mastery-learning-app/releases)
2. Download the `.exe` (Windows), `.dmg` (macOS), or `.AppImage` (Linux)
3. Install and run

### Option 2: Build from Source

#### Prerequisites

- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))

#### Windows 11 Build Instructions

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/mastery-learning-app.git
cd mastery-learning-app

# 2. Install dependencies
npm install

# 3. Rebuild native modules for Electron
npm install --save-dev electron-rebuild
npx electron-rebuild -f -w better-sqlite3

# 4. Run in development mode (to test)
npm run electron:dev

# 5. Build for production (creates installer in /dist)
npm run build
npm run electron:build
```

The Windows installer will be created in `dist/Mastery Learning App Setup 1.0.0.exe`.

#### macOS / Linux Build Instructions

```bash
# Same steps 1-4 as Windows

# 5. Build for your platform
npm run build
npm run electron:build -- --mac    # macOS
npm run electron:build -- --linux  # Linux
```

---

## 🚀 Usage

### Quick Start

1. **Launch the app**
2. **Start the timer** → Select phase (Discovery/Drilling/Integration) → Press Start
3. **Work on a problem** → When done, press "Stop & Capture"
4. **Log the attempt** → Fill out the Error Entry form (time auto-fills!)
5. **Submit** → Streak updates automatically

### Recommended Workflow

#### Phase 1: English Mastery (Read Guidelines tab)

1. **Analyze** → Use Step 1.1 questions to understand material
2. **Synthesize** → Write one-page explanation in English
3. **Drill** → Solve 50+ problem variations
   - Track attempts in Error Log
   - Aim for ≤2 average attempts per batch
4. **Stress test** → Mixed problem sets in Integration phase

#### Phase 2: Russian Encoding

1. **Prepare** → Build Russian keyword list per topic
2. **Practice** → Explain concepts using only keywords + English logic
3. **Log** → Use Russian Drilling Log to track phrasing errors
4. **Maintain** → Add vocabulary to Dictionary tab

### Data Export

**Settings → Export JSON** creates a timestamped file with:

- All error logs, material logs, Russian drilling logs, tasks
- Pre-computed analytics (success rates, time-to-mastery, batch stats)
- Ready for pandas/SQL analysis or ML pattern detection

---

## 📂 Project Structure

```
mastery-learning-app/
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.cjs          # IPC bridge (security)
│   ├── database.js          # SQLite schema & initialization
│   └── ipc-handlers.js      # All database operations
├── src/
│   └── renderer/
│       ├── components/      # React components
│       │   ├── ErrorEntryForm.jsx
│       │   ├── PhaseTimer.jsx
│       │   ├── StreakDisplay.jsx
│       │   ├── DictionaryView.jsx
│       │   ├── GuidelineView.jsx
│       │   └── ui/          # Reusable UI components
│       ├── context/         # React context (Timer, Theme)
│       ├── hooks/           # Custom hooks
│       ├── styles/          # Global CSS
│       └── App.jsx          # Main app component
├── index.html               # Vite entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🗄️ Database Schema

**Local SQLite database** stored at:

- Windows: `%APPDATA%\mastery-learning-app\mastery-learning.db`
- macOS: `~/Library/Application Support/mastery-learning-app/mastery-learning.db`
- Linux: `~/.config/mastery-learning-app/mastery-learning.db`

### Tables

- **ErrorLog** — Every problem attempt (18 fields)
- **MaterialLog** — Material progress tracking
- **RussianDrillingLog** — Language practice sessions
- **RussianVocabulary** — Russian↔English word pairs
- **Tasklist** — Todo items with priorities

---

## 🤝 Contributing

Contributions welcome! This app is built for learners, by learners.

### How to Contribute

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note:** By contributing, you agree to license your contributions under the same non-commercial terms and grant the project maintainer the right to relicense contributions for commercial purposes.

### Development Setup

```bash
npm install
npm run electron:dev  # Hot reload enabled
```

### Ideas for Contributions

- [ ] Spaced repetition algorithm (SM-2, Leitner)
- [ ] PDF/Markdown export of error logs
- [ ] Statistics dashboard (charts, trends)
- [ ] Mobile app sync (via local network)
- [ ] Custom timer presets
- [ ] Batch editing in History view
- [ ] Import from CSV/JSON

---

## 📜 License

**Custom Non-Commercial License with Attribution**

✓ Free for personal, educational, and research use  
✓ Modifications and redistribution allowed (non-commercial)  
✓ Attribution required in all copies  
✗ Commercial use prohibited without permission  
✗ Cannot be sold or offered as a paid service  

**Commercial licensing available** — Contact [your-email@example.com]

The original author retains all commercial rights and may monetize this software at their discretion.

See [LICENSE](LICENSE) for full legal terms.

---

## 💼 Commercial Use

This software is **source-available** but **not commercially licensed** by default.

If you want to:

- Use this app in a commercial product
- Offer it as a paid service (SaaS)
- Deploy it in a for-profit organization
- Integrate it into commercial software

Please contact the author to negotiate a commercial license: [your-email@example.com]

---

## 🙏 Acknowledgments

This app implements the **Decoupled Mastery Learning** methodology inspired by:

- Chinese study methods (题海战术 Tí Hǎi Zhàn Shù — "Sea of Problems Tactics")
- Cognitive Load Theory (Sweller)
- Deliberate Practice (Ericsson)
- Spaced Repetition research (Ebbinghaus, Pimsleur)

Built to solve a real problem faced by students studying technical subjects in foreign universities.

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mastery-learning-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mastery-learning-app/discussions)
- **Commercial Inquiries**: [your-email@example.com]

---

## 🎓 Research & Background

For the full methodology, see:

- [Decoupled Learning Strategy (original document)](docs/decoupled-learning.html)
- [Cognitive Load Theory in Language Learning](docs/theory.md)

---

**Made with ❤️ for students tackling the hardest learning challenges**

*Your data. Your machine. Your mastery.*

---

### Attribution Example

If you use or modify this software, please include:

```
Based on Mastery Learning App by [Your Name]
https://github.com/[your-username]/mastery-learning-app
Licensed under Custom Non-Commercial License
```
