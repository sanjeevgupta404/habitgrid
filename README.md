# Lyrikal Nerd 🎤

Are you a true hip-hop head? **Lyrikal Nerd** is an interactive, Wordle-inspired rap lyrics trivia guessing game that tests your knowledge of the most iconic rap verses from the 90s, 2000s, 2010s, and 2020s.

Instead of relying on fully static quotes, **Lyrikal Nerd** now pulls lyric snippets **live from the Musixmatch API** dynamically at runtime!

---

## ⚡ Concept

Players are presented with a short 1-2 line lyric snippet fetched dynamically from Musixmatch (without artist names or context). You must guess which hip-hop artist said it from four multiple-choice options.
- **Dynamic Pool:** Loaded from a comprehensive catalog of 200 famous mainstream tracks in `songs.json`.
- **Score Tracker:** Keep track of correct answers.
- **Streak Tracker:** Build high streaks to unlock the "fire" status (🔥) and secure bragging rights.
- **Nerd Status Tiering:** At the end of the session, receive your ranking based on performance, ranging from **Ghostwriter Target** up to the ultimate **G.O.A.T.** tier!

---

## 🔑 Musixmatch API Integration & Setup

To fetch real lyric snippets live, you need to sign up for a free developer key and configure it inside the game's script.

### 1. Get a Free API Key
1. Go to the [Musixmatch Developer Portal](https://developer.musixmatch.com/).
2. Sign up for a free developer account.
3. Generate or retrieve your **API Key** from your developer dashboard.

### 2. Configure the App
Open `script.js` in your editor and locate the constant at the very top:
```javascript
const MUSIXMATCH_API_KEY = "YOUR_KEY_HERE";
```
Replace `"YOUR_KEY_HERE"` with your actual Musixmatch API key, like this:
```javascript
const MUSIXMATCH_API_KEY = "1a2b3c4d5e6f7g8h9i0j...";
```

> ⚠️ **Security Note:** Since this is a static frontend web application with no server backend, the API key is visible client-side in the browser. While this is perfectly acceptable and expected for a portfolio/demo project running on GitHub Pages, it is **not** recommended for production use with paid, high-quota, or rate-sensitive keys.

### 🌐 Playable Demo/Offline Mode
If the API key is left as `"YOUR_KEY_HERE"` or is empty, the game will **automatically run in a simulated offline mode** using high-quality mock lyric snippets for the most iconic tracks. If the live API fails due to rate limits or missing lyrics on a particular track, it will silently choose another song from the pool or use the fallback generator to keep your gameplay entirely fluid and uninterrupted!

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
- **Data Layer:** `songs.json` houses the metadata for 200 mainstream tracks spanning multiple eras. Live lyrics are fetched via **JSONP format** to bypass browser CORS restrictions directly on the client side.
- **Code Quality:** Modular, async-ready design that gracefully handles API latency, rate limits, and network dropouts with local failover.

---

## 📝 Fair Use & Educational Disclaimer

All lyrics featured in this application are short, 1-2 line excerpts retrieved dynamically from Musixmatch and used strictly for trivia, educational analysis, and general pop-culture commentary under standard Fair Use doctrines. No ownership or rights over the lyrical content is claimed; all credit goes to their respective artists and copyright owners.
