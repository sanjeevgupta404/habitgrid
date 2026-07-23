/**
 * Lyrikal Nerd — Rap Lyrics Guessing Game
 * State-managed modular Vanilla JS core (Fully Offline Mode)
 */

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
  selectedArtist: null   // Track selected button artist
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

  updateStatusUI();
  showScreen('quiz');
  renderQuestion();
}

/**
 * Render current question based on state
 * Synchronously retrieves lyrics from currentQuote.lyric
 */
function renderQuestion() {
  state.hasAnswered = false;
  state.selectedArtist = null;

  const currentQuote = state.gameQuotes[state.currentIndex];
  if (!currentQuote) {
    showResults();
    return;
  }

  // Clear choices highlights
  DOM.revealPanel.classList.add('hidden');

  // Update progress stats immediately
  DOM.progressVal.textContent = `${state.currentIndex + 1}/${state.gameQuotes.length}`;
  const pct = ((state.currentIndex) / state.gameQuotes.length) * 100;
  DOM.progressFill.style.width = `${pct}%`;

  if (DOM.progressTextIndicator) {
    DOM.progressTextIndicator.textContent = `Question ${state.currentIndex + 1} of ${state.gameQuotes.length}`;
  }

  // Get lyric, checking if it is empty
  const snippet = currentQuote.lyric && currentQuote.lyric.trim() !== "" ? currentQuote.lyric : "Lyrics unavailable.";
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

  // Show "🔥" if streak is 3 or more
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
