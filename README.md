# Lyrikal Nerd 🎤

Are you a true hip-hop head? **Lyrikal Nerd** is an interactive, Wordle-inspired rap lyrics trivia guessing game that tests your knowledge of 50 of the most iconic rap verses from the 90s, 2000s, 2010s, and 2020s.

---

## ⚡ Concept

Players are presented with a short 1-2 line lyric snippet (without artist names or context). You must guess which hip-hop artist said it from four multiple-choice options.
- **Score Tracker:** Keep track of correct answers.
- **Streak Tracker:** Build high streaks to unlock the "fire" status (🔥) and secure bragging rights.
- **Nerd Status Tiering:** At the end of the session, receive your ranking based on performance, ranging from **Ghostwriter Target** up to the ultimate **G.O.A.T.** tier!

---

## 🚀 How to Run Locally

Since this app uses vanilla JavaScript with modern Web APIs (`fetch` for retrieving local JSON files), most modern browsers block direct local file fetching (`file://` protocol) due to CORS security policies.

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

---

## 📸 Demo Preview

*(A demo of the application flow can be placed here once deployed)*
![Lyrikal Nerd Demo Placeholder](demo-placeholder.png)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Vanilla HTML5, CSS3, & modern JavaScript (no frameworks or compilation steps required).
- **Styling:** Styled using a deep cyberpunk-style dark theme with high-contrast, gold accenting (`#ffc107`), custom glassmorphism panels, and fine-tuned CSS keyframe animations for reveals and corrections.
- **Data Layer:** Entirely self-contained within `quotes.json` with 50 carefully selected verses spanning multiple eras of mainstream and underground rap history.
- **Code Quality:** Fully decoupled and modular logic architecture allowing for future expansions (e.g. Daily Challenges or Time-attack modes) without rewriting core render methods.

---

## 📝 Fair Use & Educational Disclaimer

All lyrics featured in this application are short, 1-2 line excerpts used strictly for trivia, educational analysis, and general pop-culture commentary under standard Fair Use doctrines. No ownership or rights over the lyrical content is claimed; all credit goes to their respective artists and producers.
