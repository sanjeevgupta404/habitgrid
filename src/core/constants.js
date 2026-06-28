// ─── App Constants ──────────────────────────────────────────────────────────
// Single source of truth for all fixed values. Easy to extend without touching
// business logic.

export const APP_VERSION = '2.0.0';
export const STORAGE_KEYS = {
  AUTH:        'hg_auth_v2',
  HABITS:      'hg_habits_v2',
  COMPLETIONS: 'hg_completions_v2',
  SETTINGS:    'hg_settings_v2',
};

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
export const MONTHS_SHORT = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];
export const DAYS_OF_WEEK       = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const DAYS_OF_WEEK_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export const CATEGORIES = [
  'Health','Study','Fitness','Mindset','Productivity','Other'
];

export const CATEGORY_META = {
  Health:       { color: 'cat-health',       icon: '💚' },
  Study:        { color: 'cat-study',        icon: '📘' },
  Fitness:      { color: 'cat-fitness',      icon: '🏅' },
  Mindset:      { color: 'cat-mindset',      icon: '🧠' },
  Productivity: { color: 'cat-productivity', icon: '⚡' },
  Other:        { color: 'cat-other',        icon: '📌' },
};

export const EMOJIS = [
  '⏰','🏃','💧','📖','🧘','📵','📚','🌙',
  '💪','🍎','✍️','🎯','🧠','🎨','🎵','💤',
  '🚴','🥗','🏋️','🤸','🧹','💊','🌿','☀️',
  '🦷','🚿','🛏️','📝','💻','🏆','🎉','🌊',
];

export const SAMPLE_HABITS = [
  { name: 'Wake up at 6AM',  emoji: '⏰', goal: 25, category: 'Mindset'      },
  { name: 'Exercise',         emoji: '🏃', goal: 20, category: 'Fitness'      },
  { name: 'Drink Water',      emoji: '💧', goal: 30, category: 'Health'       },
  { name: 'Read 10 Pages',    emoji: '📖', goal: 20, category: 'Study'        },
  { name: 'Meditation',       emoji: '🧘', goal: 20, category: 'Mindset'      },
  { name: 'No Social Media',  emoji: '📵', goal: 15, category: 'Productivity' },
  { name: 'Study',            emoji: '📚', goal: 25, category: 'Study'        },
  { name: 'Sleep Early',      emoji: '🌙', goal: 20, category: 'Health'       },
];

export const ROUTES = {
  AUTH:     '#/auth',
  TRACKER:  '#/tracker',
  HISTORY:  '#/history',
  SETTINGS: '#/settings',
};
