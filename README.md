# Lyrikal Nerd 🎤

Are you a true hip-hop head? **Lyrikal Nerd** is an interactive, Wordle-inspired rap lyrics trivia guessing game that tests your knowledge of the most iconic rap verses from the 90s, 2000s, 2010s, and 2020s.

Lyrikal Nerd is a fully offline, static HTML/CSS/JavaScript application that works directly on GitHub Pages or any local server (Live Server, Python http.server, etc.) with zero dependencies, zero network requests, and zero API keys required.

---

## ⚡ Concept

Players are presented with a short 1-2 line lyric snippet (without artist names or context). You must guess which hip-hop artist said it from four multiple-choice options.
- **Iconic Pool:** Loaded from a comprehensive database of 200 famous mainstream tracks in `songs.json`.
- **Score Tracker:** Keep track of correct answers.
- **Streak Tracker:** Build high streaks to unlock the "fire" status (🔥) and secure bragging rights.
- **Nerd Status Tiering:** At the end of the session, receive your ranking based on performance, ranging from **Ghostwriter Target** up to the ultimate **G.O.A.T.** tier!

---

## ⚡ Fully Offline & Lightweight

This game requires:
- **No API keys** (completely removed dependencies on Musixmatch or other paid APIs)
- **Zero network requests** for lyric fetching
- **Zero backend/database requirements**

All trivia content is read statically from local metadata. If a lyric field is blank, the game displays `Lyrics unavailable.`.

---

## 🚀 How to Run Locally

Since this app uses vanilla JavaScript with modern Web APIs (`fetch` for retrieving the local JSON database), most modern browsers block direct local file fetching (`file://` protocol) due to CORS security policies.

To run it locally, run a simple local web server in the project directory:

### Option 1: Python (Recommended)
If you have Python installed, open your terminal in the repository root and run:
```bash
python3 -m http.server 3000
```
Then, open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js (npx)
If you have Node.js installed:
```bash
npx serve .
```
Then, visit [http://localhost:3000](http://localhost:3000) (or the port specified).

### Option 3: VS Code Live Server
Right-click on `index.html` and click **Open with Live Server**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Vanilla HTML5, CSS3, & modern JavaScript (no frameworks or compilation steps required).
- **Styling:** Styled using a deep cyberpunk-style dark theme with high-contrast, gold accenting (`#ffc107`), custom glassmorphism panels, and fine-tuned CSS keyframe animations for reveals and corrections.
- **Data Layer:** `songs.json` houses the metadata for 200 mainstream tracks spanning multiple eras.
- **Keyboard Navigation:** Support for fast gameplay via hotkeys:
  - `1`, `2`, `3`, `4` keys to select multiple-choice options.

---

## 📝 Fair Use & Educational Disclaimer

All lyrics featured in this application are short, 1-2 line excerpts used strictly for trivia, educational analysis, and general pop-culture commentary under standard Fair Use doctrines. No ownership or rights over the lyrical content is claimed; all credit goes to their respective artists and copyright owners.
