/**
 * Lyrikal Nerd — Rap Lyrics Guessing Game
 * State-managed modular Vanilla JS core with Musixmatch API integration
 */

// Developer Configuration:
// To fetch real lyric snippets live, register for a free key at https://developer.musixmatch.com/
// and replace "YOUR_KEY_HERE" with your key below.
// Note: As a client-side static application, the key is visible in the browser,
// which is standard for portfolio demos but not for sensitive/production keys.
const MUSIXMATCH_API_KEY = "YOUR_KEY_HERE";

/**
 * Helper to retrieve API key (supports test-time overrides via window.MUSIXMATCH_API_KEY)
 */
function getApiKey() {
  if (typeof window !== 'undefined' && window.MUSIXMATCH_API_KEY && window.MUSIXMATCH_API_KEY !== "YOUR_KEY_HERE") {
    return window.MUSIXMATCH_API_KEY;
  }
  return MUSIXMATCH_API_KEY;
}

// Application Constants
const CONFIG = {
  DATA_URL: 'songs.json', // Loaded database of 200 songs metadata
  TOTAL_QUESTIONS: 50     // Standard length of a gameplay session
};

// Application State
let state = {
  allQuotes: [],         // Holds the 200 songs loaded from songs.json
  gameQuotes: [],        // Sub-selection of 50 shuffled songs for current session
  currentIndex: 0,       // Current index in active gameQuotes
  score: 0,              // Number of correct answers
  streak: 0,             // Number of consecutive correct answers
  bestStreak: 0,         // Session record of consecutive correct answers
  hasAnswered: false,    // Guard preventing multiple choice inputs on the same quote
  selectedArtist: null,  // Track selected button artist
  consecutiveFailures: 0 // Count consecutive API failures to decide offline fallback
};

// DOM Elements cache
const DOM = {
  landingScreen: document.getElementById('landing-screen'),
  quizScreen: document.getElementById('quiz-screen'),
  resultsScreen: document.getElementById('results-screen'),

  startBtn: document.getElementById('start-btn'),
  restartBtn: document.getElementById('restart-btn'),
  nextBtn: document.getElementById('next-btn'),

  errorContainer: document.getElementById('error-container'),
  errorMessage: document.getElementById('error-message'),

  progressVal: document.getElementById('progress-val'),
  scoreVal: document.getElementById('score-val'),
  streakVal: document.getElementById('streak-val'),
  streakFire: document.getElementById('streak-fire'),
  progressFill: document.getElementById('progress-fill'),
  progressTextIndicator: document.getElementById('progress-text-indicator'),

  quoteText: document.getElementById('quote-text'),
  optionsGrid: document.getElementById('options-grid'),
  optionBtns: Array.from(document.querySelectorAll('.option-btn')),

  revealPanel: document.getElementById('reveal-panel'),
  revealStatusIcon: document.getElementById('reveal-status-icon'),
  revealStatusTitle: document.getElementById('reveal-status-title'),
  revealSongTitle: document.getElementById('reveal-song-title'),
  revealArtistName: document.getElementById('reveal-artist-name'),

  finalScore: document.getElementById('final-score'),
  successRate: document.getElementById('success-rate'),
  bestStreak: document.getElementById('best-streak'),
  rankTitle: document.getElementById('rank-title'),
  rankDescription: document.getElementById('rank-description')
};

/**
 * Utility: Shuffle array in-place using Fisher-Yates algorithm
 * @param {Array} array
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Fallback Offline Lyrics Generator
 * Generates highly recognizable actual lyrics for iconic tracks, or fun dynamic lyrics for other titles.
 * Used when MUSIXMATCH_API_KEY is not configured, or if the API request quota is reached.
 */
function getMockLyrics(artist, song) {
  const customLyrics = {
    "California Love": "California knows how to party / In the city of L.A., in the city of Good Ol' Watts",
    "Dear Mama": "When I was young, me and my mama had beef / Seventeen years old, kicked out on the streets",
    "Changes": "I see no changes, wake up in the morning and I ask myself / Is life worth living, should I blast myself?",
    "Juicy": "It was all a dream, I used to read Word Up! magazine / Salt-n-Pepa and Heavy D up in the limousine",
    "Big Poppa": "I love it when you call me Big Poppa / Throw your hands in the air if you's a true player",
    "N.Y. State of Mind": "I never sleep, cause sleep is the cousin of death / Beyond the walls of intelligence, life is defined",
    "Still D.R.E.": "Still taking my time to perfect the beat / And I still got love for the streets, it's the D.R.E.",
    "Ms. Jackson": "I'm sorry Ms. Jackson, I am for real / Never meant to make your daughter cry",
    "Lose Yourself": "His palms are sweaty, knees weak, arms are heavy / There's vomit on his sweater already, mom's spaghetti",
    "In Da Club": "Go, Shorty, it's your birthday / We gon' party like it's your birthday",
    "Gold Digger": "She take my money when I'm in need / Yea, she's a trifling friend indeed",
    "Stronger": "N-now th-that that don't kill me / Can only make me stronger",
    "Empire State of Mind": "In New York, concrete jungle where dreams are made of / There's nothin' you can't do",
    "Hotline Bling": "You used to call me on my cell phone / Late night when you need my love",
    "God's Plan": "She say, 'Do you love me?' I tell her, 'Only partly' / I only love my bed and my mama, I'm sorry",
    "HUMBLE.": "Wicked or weakness, you gotta see this / Bitch, be humble, sit down",
    "No Role Modelz": "First things first, rest in peace Uncle Phil / For real, you the only father that I ever knew",
    "Not Like Us": "Psst, I see dead people / Mustard on the beat, hoe",
    "SICKO MODE": "Sun is down, freezin' cold / That's how we already know winter's here",
    "Thrift Shop": "I'm gonna pop some tags / Only got twenty dollars in my pocket",
    "Gangsta's Paradise": "As I walk through the valley of the shadow of death / I take a look at my life and realize there's nothin' left",
    "Ridin'": "They see me rollin', they hatin' / Patrolling and tryin' to catch me ridin' dirty",
    "Crank That": "Soulja Boy off in this hoe / Watch me crank it, watch me roll",
    "Super Bass": "This one is for the boys with the booming system / Top down, AC with the cooler system"
  };

  if (customLyrics[song]) {
    return customLyrics[song];
  }

  // Smart template fallback to maintain an engaging experience
  return `Yeah, we dropping heavy bars for ${song} / That's just how we do it, matching rhythms all night long!`;
}

/**
 * Fetch lyric snippet from Musixmatch API matcher.lyrics.get via JSONP
 * @param {string} artist
 * @param {string} song
 * @returns {Promise<string>} Clean lyric snippet
 */
function fetchLyricSnippet(artist, song) {
  const activeKey = getApiKey();
  // If API key is the default placeholder or empty, resolve immediately to mock lyrics
  if (!activeKey || activeKey === "YOUR_KEY_HERE" || activeKey.trim() === "") {
    return Promise.resolve(getMockLyrics(artist, song));
  }

  const encodedArtist = encodeURIComponent(artist);
  const encodedSong = encodeURIComponent(song);
  const url = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?format=jsonp&apikey=${activeKey}&q_track=${encodedSong}&q_artist=${encodedArtist}`;

  return new Promise((resolve, reject) => {
    // Generate a unique JSONP callback name
    const callbackName = 'musixmatch_cb_' + Math.floor(Math.random() * 1000000);
    let timeoutId = null;

    // Cleanup helper
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      delete window[callbackName];
      const script = document.getElementById(callbackName);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    // Callback invoked by the Musixmatch API script payload
    window[callbackName] = function(data) {
      cleanup();

      if (!data || !data.message) {
        reject(new Error("Empty or malformed JSONP response"));
        return;
      }

      const header = data.message.header;
      const body = data.message.body;

      if (!header || header.status_code !== 200) {
        reject(new Error(`API returned non-200 status code: ${header ? header.status_code : 'Unknown'}`));
        return;
      }

      if (!body || !body.lyrics || !body.lyrics.lyrics_body) {
        reject(new Error("No lyrics found in the response body"));
        return;
      }

      const rawLyrics = body.lyrics.lyrics_body;

      // Extract 1-2 lines of actual lyrics, filtering out disclaimers and copyrights
      const lines = rawLyrics
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.includes('***') && !line.includes('Commercial use') && !line.includes('translated') && !line.includes('Copyright'));

      if (lines.length === 0) {
        reject(new Error("No usable lyrics lines after filtration"));
        return;
      }

      // Return 1-2 lines formatted together
      const snippet = lines.slice(0, 2).join(' / ');
      resolve(snippet);
    };

    // Create the script element for JSONP request
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `${url}&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Network / CORS script error"));
    };

    document.body.appendChild(script);

    // Timeout script load after 5 seconds
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("API request timed out"));
    }, 5000);
  });
}

/**
 * Load songs metadata from local JSON file
 * Fatal error panel only triggers if songs.json itself fails to load or parse.
 */
async function loadQuotes() {
  try {
    const response = await fetch(CONFIG.DATA_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty songs database format.");
    }
    state.allQuotes = data;
    console.log(`Loaded ${state.allQuotes.length} songs successfully.`);
  } catch (error) {
    console.error("Failed to load songs database:", error);
    if (DOM.errorContainer && DOM.errorMessage) {
      DOM.errorMessage.textContent = `Failed to load the songs database: ${error.message || error}. Please make sure songs.json is valid and run with a local server.`;
      DOM.errorContainer.classList.remove('hidden');
    }
    if (DOM.startBtn) {
      DOM.startBtn.style.display = 'none';
    }
    DOM.quoteText.textContent = "Error loading database. Please verify songs.json exists and run with a local server.";
  }
}

/**
 * Initialize a new game session
 */
function startGame() {
  if (state.allQuotes.length === 0) {
    alert("Still loading song database. Please wait or check server.");
    return;
  }

  // Reshuffle all 200 songs, and slice out 50 for this game session
  const shuffled = shuffleArray(state.allQuotes);
  state.gameQuotes = shuffled.slice(0, CONFIG.TOTAL_QUESTIONS);
  state.currentIndex = 0;
  state.score = 0;
  state.streak = 0;
  state.bestStreak = 0;
  state.consecutiveFailures = 0; // Reset network failure count

  updateStatusUI();
  showScreen('quiz');
  renderQuestion();
}

/**
 * Render current question based on state
 * Asynchronously loads lyric snippet from Musixmatch (or mock fallback)
 */
async function renderQuestion() {
  state.hasAnswered = false;
  state.selectedArtist = null;

  const currentQuote = state.gameQuotes[state.currentIndex];
  if (!currentQuote) {
    showResults();
    return;
  }

  // Visual Loading State: Set text and disable buttons during fetch
  DOM.quoteText.textContent = "Loading lyric bars from Musixmatch...";
  DOM.optionBtns.forEach(btn => {
    btn.textContent = "Loading...";
    btn.className = "option-btn";
    btn.disabled = true;
  });
  DOM.revealPanel.classList.add('hidden');

  // Update progress stats immediately
  DOM.progressVal.textContent = `${state.currentIndex + 1}/${state.gameQuotes.length}`;
  const pct = ((state.currentIndex) / state.gameQuotes.length) * 100;
  DOM.progressFill.style.width = `${pct}%`;

  if (DOM.progressTextIndicator) {
    DOM.progressTextIndicator.textContent = `Question ${state.currentIndex + 1} of ${state.gameQuotes.length}`;
  }

  try {
    // Attempt to fetch the live lyrics snippet
    const snippet = await fetchLyricSnippet(currentQuote.artist, currentQuote.song);

    // Reset consecutive failure tracker on successful fetch
    state.consecutiveFailures = 0;

    // Set lyrics text
    DOM.quoteText.textContent = snippet;

    // Shuffled multiple choice option: correct artist + 3 decoys
    const choices = shuffleArray([currentQuote.artist, ...currentQuote.decoys]);

    // Populate and configure option buttons
    DOM.optionBtns.forEach((btn, idx) => {
      const choice = choices[idx];
      btn.textContent = choice;
      btn.className = "option-btn"; // Reset class names
      btn.disabled = false;
      btn.setAttribute('data-choice', choice);
    });
  } catch (error) {
    console.warn(`Failed to fetch lyrics for "${currentQuote.song}" by ${currentQuote.artist}:`, error);

    // Only count consecutive API/network failures if a real key was configured
    const activeKey = getApiKey();
    if (activeKey && activeKey !== "YOUR_KEY_HERE" && activeKey.trim() !== "") {
      state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
    }

    // If we have hit 3 consecutive failures, switch to generating fallback mock lyrics
    // to keep gameplay entirely fluid rather than skipping indefinitely or locking up.
    if ((state.consecutiveFailures || 0) >= 3) {
      console.warn("Switching to offline fallback generator due to multiple API failures.");
      const mockSnippet = getMockLyrics(currentQuote.artist, currentQuote.song);
      DOM.quoteText.textContent = mockSnippet;

      const choices = shuffleArray([currentQuote.artist, ...currentQuote.decoys]);
      DOM.optionBtns.forEach((btn, idx) => {
        const choice = choices[idx];
        btn.textContent = choice;
        btn.className = "option-btn";
        btn.disabled = false;
        btn.setAttribute('data-choice', choice);
      });
      return;
    }

    // Non-fatal error: silently skip the failed song, remove it, and try another
    console.log(`Silently retrying with another track...`);
    state.gameQuotes.splice(state.currentIndex, 1);

    if (state.currentIndex >= state.gameQuotes.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }
}

/**
 * Handle multiple choice button selection
 * @param {string} chosenArtist
 */
function handleAnswer(chosenArtist) {
  if (state.hasAnswered) return;
  state.hasAnswered = true;

  // Immediately and synchronously disable all buttons to prevent double-answering
  DOM.optionBtns.forEach(btn => {
    btn.disabled = true;
  });

  state.selectedArtist = chosenArtist;

  const currentQuote = state.gameQuotes[state.currentIndex];
  const isCorrect = (chosenArtist === currentQuote.artist);

  // Apply conditional highlights to choice buttons
  DOM.optionBtns.forEach(btn => {
    const btnChoice = btn.getAttribute('data-choice');

    if (btnChoice === currentQuote.artist) {
      btn.classList.add('correct');
    } else if (btnChoice === chosenArtist && !isCorrect) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('dimmed');
    }
  });

  // Process score/streak changes
  if (isCorrect) {
    state.score++;
    state.streak++;
    if (state.streak > state.bestStreak) {
      state.bestStreak = state.streak;
    }
    showFeedbackUI(true, currentQuote);
  } else {
    state.streak = 0;
    showFeedbackUI(false, currentQuote);
  }

  // Update status meters
  updateStatusUI();

  // Adjust progress filled bar to reflect the completed state of current question
  const pct = ((state.currentIndex + 1) / state.gameQuotes.length) * 100;
  DOM.progressFill.style.width = `${pct}%`;
}

/**
 * Update UI score and streak elements
 */
function updateStatusUI() {
  DOM.scoreVal.textContent = state.score;
  DOM.streakVal.textContent = state.streak;

  // Visual sugar: show "🔥" if streak is 3 or more
  if (state.streak >= 3) {
    DOM.streakFire.classList.remove('hidden');
  } else {
    DOM.streakFire.classList.add('hidden');
  }
}

/**
 * Display Reveal explaining results
 */
function showFeedbackUI(isCorrect, quoteObj) {
  // Update feedback header
  const header = DOM.revealPanel.querySelector('.reveal-status-header');
  if (isCorrect) {
    DOM.revealStatusIcon.textContent = "✅";
    DOM.revealStatusTitle.textContent = "Correct!";
    header.className = "reveal-status-header correct";
  } else {
    DOM.revealStatusIcon.textContent = "❌";
    DOM.revealStatusTitle.textContent = "Incorrect";
    header.className = "reveal-status-header wrong";
  }

  // Populate song/artist details
  DOM.revealSongTitle.textContent = quoteObj.song;
  DOM.revealArtistName.textContent = quoteObj.artist;

  // Reveal bottom panel
  DOM.revealPanel.classList.remove('hidden');

  // Scroll details into view on small devices if necessary
  DOM.revealPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Handle Proceeding to next question
 */
function handleNextQuestion() {
  state.currentIndex++;
  if (state.currentIndex < state.gameQuotes.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

/**
 * Display Final results dashboard
 */
function showResults() {
  const total = state.gameQuotes.length;
  const pct = Math.round((state.score / total) * 100);

  DOM.finalScore.textContent = `${state.score} / ${total}`;
  DOM.successRate.textContent = `${pct}%`;
  DOM.bestStreak.textContent = state.bestStreak;

  // Hip-Hop Nerd Tier Ranking system
  let title = "";
  let desc = "";

  if (pct === 100) {
    title = "G.O.A.T.";
    desc = "Perfect score! You are a walking Rap Almanac. Somewhere, Nardwuar is smiling.";
  } else if (pct >= 85) {
    title = "Platinum Record";
    desc = "Incredible flow! You know your classics and your deep cuts. True Hip-Hop Connoisseur.";
  } else if (pct >= 65) {
    title = "Gold Single";
    desc = "Solid radio play. You have a good memory, but a few modern bars or golden-era gems slipped by.";
  } else if (pct >= 40) {
    title = "Mixtape Hustler";
    desc = "You're building an audience! Keep listening to the lyrics, the pen game has layers you're starting to catch.";
  } else {
    title = "Ghostwriter Target";
    desc = "Need to spend some more time in the booth. Put on some classic playlists and study up!";
  }

  DOM.rankTitle.textContent = title;
  DOM.rankDescription.textContent = desc;

  showScreen('results');
}

/**
 * Screen Navigation Manager
 * @param {string} screenId - 'landing' | 'quiz' | 'results'
 */
function showScreen(screenId) {
  DOM.landingScreen.classList.remove('active');
  DOM.quizScreen.classList.remove('active');
  DOM.resultsScreen.classList.remove('active');

  if (screenId === 'landing') {
    DOM.landingScreen.classList.add('active');
  } else if (screenId === 'quiz') {
    DOM.quizScreen.classList.add('active');
  } else if (screenId === 'results') {
    DOM.resultsScreen.classList.add('active');
  }
}

/**
 * Reset game and start over
 */
function resetGame() {
  startGame();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  DOM.startBtn.addEventListener('click', startGame);
  DOM.restartBtn.addEventListener('click', resetGame);
  DOM.nextBtn.addEventListener('click', handleNextQuestion);

  DOM.optionsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-btn');
    if (!btn || btn.disabled) return;
    const choice = btn.getAttribute('data-choice');
    handleAnswer(choice);
  });

  // Global keydown handler for choosing options 1-4 via keyboard
  document.addEventListener('keydown', (e) => {
    // Only handle keys if quiz screen is currently active and the user has not answered yet
    if (!DOM.quizScreen.classList.contains('active') || state.hasAnswered) {
      return;
    }

    if (['1', '2', '3', '4'].includes(e.key)) {
      const index = parseInt(e.key, 10) - 1;
      const targetBtn = DOM.optionBtns[index];
      if (targetBtn && !targetBtn.disabled) {
        const choice = targetBtn.getAttribute('data-choice');
        handleAnswer(choice);
      }
    }
  });
}

// Bootstrap Initialization
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadQuotes();
});
