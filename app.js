// ─── Constants & Defaults ───────────────────────────────────────────────────

const STORAGE_KEY = 'habitTracker_v1';
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const CATEGORIES = ['Health','Study','Fitness','Mindset','Productivity','Other'];
const EMOJIS = [
  '⏰','🏃','💧','📖','🧘','📵','📚','🌙',
  '💪','🍎','✍️','🎯','🧠','🎨','🎵','💤',
  '🚴','🥗','🏋️','🤸','🧹','💊','🌿','☀️',
  '🦷','🚿','🛏️','📝','💻','🏆'
];
const CAT_COLORS = {
  Health: 'cat-health', Study: 'cat-study', Fitness: 'cat-fitness',
  Mindset: 'cat-mindset', Productivity: 'cat-productivity', Other: 'cat-other'
};

const SAMPLE_HABITS = [
  { name: 'Wake up at 6AM', emoji: '⏰', goal: 25, category: 'Mindset' },
  { name: 'Exercise',        emoji: '🏃', goal: 20, category: 'Fitness' },
  { name: 'Drink Water',     emoji: '💧', goal: 30, category: 'Health' },
  { name: 'Read 10 Pages',   emoji: '📖', goal: 20, category: 'Study' },
  { name: 'Meditation',      emoji: '🧘', goal: 20, category: 'Mindset' },
  { name: 'No Social Media', emoji: '📵', goal: 15, category: 'Productivity' },
  { name: 'Study',           emoji: '📚', goal: 25, category: 'Study' },
  { name: 'Sleep Early',     emoji: '🌙', goal: 20, category: 'Health' },
];

// ─── State ──────────────────────────────────────────────────────────────────

let state = {
  habits: [],           // { id, name, emoji, goal, category }
  completions: {},      // { "habitId_YYYY-MM-DD": true }
  currentYear: 0,
  currentMonth: 0,      // 0-indexed
  filter: 'all',        // all | today | missed | category
  categoryFilter: '',
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      state.habits     = saved.habits     || [];
      state.completions = saved.completions || {};
    }
  } catch {}
  const now = new Date();
  state.currentYear  = now.getFullYear();
  state.currentMonth = now.getMonth();

  if (state.habits.length === 0) {
    state.habits = SAMPLE_HABITS.map((h, i) => ({
      id: 'h' + (Date.now() + i),
      name: h.name, emoji: h.emoji, goal: h.goal, category: h.category
    }));
    saveState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    habits: state.habits,
    completions: state.completions,
  }));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function completionKey(habitId, year, month, day) {
  return `${habitId}_${dateKey(year, month, day)}`;
}

function isCompleted(habitId, year, month, day) {
  return !!state.completions[completionKey(habitId, year, month, day)];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function uid() {
  return 'h' + Date.now() + Math.random().toString(36).slice(2, 7);
}

function todayKey() {
  const n = new Date();
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate());
}

function isToday(year, month, day) {
  return dateKey(year, month, day) === todayKey();
}

function isFuture(year, month, day) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d = new Date(year, month, day);
  return d > now;
}

// ─── Stats calculations ──────────────────────────────────────────────────────

function getHabitMonthCount(habitId) {
  const { currentYear: y, currentMonth: m } = state;
  const days = getDaysInMonth(y, m);
  let count = 0;
  for (let d = 1; d <= days; d++) {
    if (isCompleted(habitId, y, m, d)) count++;
  }
  return count;
}

function getCompletedToday(habitId) {
  const n = new Date();
  return isCompleted(habitId, n.getFullYear(), n.getMonth(), n.getDate());
}

function calcStreaks(habitId) {
  // streak across ALL time for this habit
  const allKeys = Object.keys(state.completions)
    .filter(k => k.startsWith(habitId + '_'))
    .map(k => k.replace(habitId + '_', ''))
    .sort();

  if (allKeys.length === 0) return { current: 0, best: 0 };

  let best = 1, cur = 1;
  for (let i = 1; i < allKeys.length; i++) {
    const prev = new Date(allKeys[i-1]);
    const curr = new Date(allKeys[i]);
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { cur++; best = Math.max(best, cur); }
    else { cur = 1; }
  }
  // check if streak is still alive (last entry is today or yesterday)
  const last = new Date(allKeys[allKeys.length - 1]);
  const today = new Date(); today.setHours(0,0,0,0); last.setHours(0,0,0,0);
  const diff = (today - last) / 86400000;
  if (diff > 1) cur = 0;
  return { current: cur, best };
}

function getDashboardStats() {
  const n = new Date();
  const todayY = n.getFullYear(), todayM = n.getMonth(), todayD = n.getDate();
  const totalHabits = state.habits.length;
  let completedToday = 0, totalStreak = 0, totalBest = 0;

  for (const h of state.habits) {
    if (isCompleted(h.id, todayY, todayM, todayD)) completedToday++;
    const { current, best } = calcStreaks(h.id);
    totalStreak += current;
    totalBest += best;
  }

  // Monthly completion %
  const { currentYear: y, currentMonth: m } = state;
  const days = getDaysInMonth(y, m);
  const now = new Date(); now.setHours(0,0,0,0);
  let possible = 0, done = 0;
  for (const h of state.habits) {
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d);
      if (dt <= now) { possible++; if (isCompleted(h.id, y, m, d)) done++; }
    }
  }
  const monthPct = possible > 0 ? Math.round((done / possible) * 100) : 0;

  return {
    totalHabits,
    completedToday,
    avgStreak: totalHabits > 0 ? Math.round(totalStreak / totalHabits) : 0,
    avgBest: totalHabits > 0 ? Math.round(totalBest / totalHabits) : 0,
    monthPct,
  };
}

// ─── Filtering ───────────────────────────────────────────────────────────────

function getFilteredHabits() {
  let habits = [...state.habits];

  // Category filter
  if (state.categoryFilter) {
    habits = habits.filter(h => h.category === state.categoryFilter);
  }

  // Status filter
  if (state.filter === 'today') {
    habits = habits.filter(h => getCompletedToday(h.id));
  } else if (state.filter === 'missed') {
    const n = new Date();
    const y = n.getFullYear(), m = n.getMonth(), d = n.getDate();
    // Only makes sense if today has passed start of day
    habits = habits.filter(h => !isCompleted(h.id, y, m, d));
  }

  return habits;
}

// ─── Week grouping ──────────────────────────────────────────────────────────

function getWeeks(year, month) {
  const days = getDaysInMonth(year, month);
  const weeks = [];
  let week = 1, start = 1;

  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month, d).getDay();
    if (d > 1 && dow === 0) {
      weeks.push({ week, start, end: d - 1 });
      week++;
      start = d;
    }
  }
  weeks.push({ week, start, end: days });
  return weeks;
}

// ─── Render: Top Bar ─────────────────────────────────────────────────────────

function renderTopBar() {
  const { currentYear: y, currentMonth: m } = state;
  return `
  <div id="topbar">
    <div class="brand">
      <span class="logo">✅</span>
      <span>HabitGrid</span>
    </div>
    <div class="month-nav">
      <button onclick="changeMonth(-1)" title="Previous month">&#8249;</button>
      <span class="month-label">${MONTHS[m]} ${y}</span>
      <button onclick="changeMonth(1)" title="Next month">&#8250;</button>
    </div>
    <div class="topbar-spacer"></div>
    <div class="topbar-actions">
      <button class="btn btn-ghost" onclick="openModal(null)" title="Add habit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Add Habit</span>
      </button>
    </div>
  </div>`;
}

// ─── Render: Dashboard ───────────────────────────────────────────────────────

function renderDashboard() {
  const s = getDashboardStats();
  return `
  <div id="dashboard">
    <div class="stat-card blue">
      <div class="stat-icon">📋</div>
      <div class="stat-label">Total Habits</div>
      <div class="stat-value">${s.totalHabits}</div>
      <div class="stat-sub">being tracked</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">✅</div>
      <div class="stat-label">Done Today</div>
      <div class="stat-value">${s.completedToday}</div>
      <div class="stat-sub">of ${s.totalHabits} habits</div>
    </div>
    <div class="stat-card amber">
      <div class="stat-icon">🔥</div>
      <div class="stat-label">Avg Streak</div>
      <div class="stat-value">${s.avgStreak}</div>
      <div class="stat-sub">days current</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-icon">🏆</div>
      <div class="stat-label">Best Streak</div>
      <div class="stat-value">${s.avgBest}</div>
      <div class="stat-sub">days average</div>
    </div>
    <div class="stat-card pink">
      <div class="stat-icon">📈</div>
      <div class="stat-label">Monthly</div>
      <div class="stat-value">${s.monthPct}%</div>
      <div class="stat-sub">completion rate</div>
    </div>
  </div>`;
}

// ─── Render: Filters ────────────────────────────────────────────────────────

function renderFilters() {
  const filters = [
    { key: 'all',    label: 'All Habits' },
    { key: 'today',  label: '✅ Done Today' },
    { key: 'missed', label: '❌ Missed Today' },
  ];
  const chips = filters.map(f =>
    `<button class="filter-chip${state.filter === f.key ? ' active' : ''}"
       onclick="setFilter('${f.key}')">${f.label}</button>`
  ).join('');

  const catOptions = CATEGORIES.map(c =>
    `<option value="${c}"${state.categoryFilter === c ? ' selected' : ''}>${c}</option>`
  ).join('');

  return `
  <div id="filters-bar">
    ${chips}
    <div class="filter-sep"></div>
    <div class="category-filter">
      <select onchange="setCategoryFilter(this.value)">
        <option value="">All Categories</option>
        ${catOptions}
      </select>
    </div>
  </div>`;
}

// ─── Render: Progress bar helper ────────────────────────────────────────────

function renderProgress(count, goal) {
  const pct = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;
  const cls = pct >= 100 ? 'done' : pct >= 60 ? 'close' : 'low';
  return `
  <div class="cell-prog">
    <div class="prog-top">
      <span class="prog-count">${count}</span>
      <span class="prog-sep">/</span>
      <span class="prog-goal">${goal}</span>
      <span class="prog-pct ${cls}">${pct}%</span>
    </div>
    <div class="prog-bar-track">
      <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>
  </div>`;
}

// ─── Render: Grid ───────────────────────────────────────────────────────────

function renderGrid() {
  const { currentYear: y, currentMonth: m } = state;
  const habits = getFilteredHabits();
  const days = getDaysInMonth(y, m);
  const weeks = getWeeks(y, m);

  if (state.habits.length === 0) {
    return `
    <div id="empty-state">
      <div class="empty-icon">📋</div>
      <h2>No habits yet</h2>
      <p>Start building better routines. Add your first habit and track it across the whole month.</p>
      <button class="btn btn-primary" onclick="openModal(null)">
        + Add Your First Habit
      </button>
    </div>`;
  }

  if (habits.length === 0) {
    return `
    <div id="empty-state">
      <div class="empty-icon">🔍</div>
      <h2>No habits match this filter</h2>
      <p>Try a different filter or category.</p>
      <button class="btn btn-ghost" onclick="setFilter('all')">Clear Filters</button>
    </div>`;
  }

  // Build day header cells
  let dayHeaders = '';
  for (let d = 1; d <= days; d++) {
    const dow = DAYS_OF_WEEK[new Date(y, m, d).getDay()];
    const todayCls = isToday(y, m, d) ? ' today-col' : '';
    dayHeaders += `
    <th class="th-day col-day${todayCls}">
      <span class="day-num">${d}</span>
      <span class="day-dow">${dow[0]}</span>
    </th>`;
  }

  let tbodyRows = '';

  for (const { week, start, end } of weeks) {
    // Week separator row
    let weekCells = `<th class="wh-label">Week ${week}</th><th></th>`;
    for (let d = 1; d <= days; d++) {
      if (d >= start && d <= end) weekCells += `<th style="background:#f0eef8;border-bottom:1px solid var(--border)"></th>`;
      else weekCells += `<th style="background:#f5f4f0;border-bottom:1px solid var(--border)"></th>`;
    }
    weekCells += `<th style="background:#f0eef8;border-bottom:1px solid var(--border)"></th>`;
    tbodyRows += `<tr class="week-header">${weekCells}</tr>`;

    // Habit rows for this week group — show each habit once (we mark week visually via shading)
    for (const habit of habits) {
      const count = getHabitMonthCount(habit.id);
      const catCls = CAT_COLORS[habit.category] || 'cat-other';

      let dayCells = '';
      for (let d = 1; d <= days; d++) {
        const inWeek = d >= start && d <= end;
        const future = isFuture(y, m, d);
        const today  = isToday(y, m, d);
        const done   = isCompleted(habit.id, y, m, d);
        let tickCls  = done ? ' checked' : '';
        if (today) tickCls += ' today-cell';
        if (future) tickCls += ' no-future';
        const weekBg = inWeek ? '' : 'background:var(--bg);';
        dayCells += `
        <td class="cell-day${future ? ' future-day' : ''}" style="${weekBg}">
          <button class="tick-btn${tickCls}"
            onclick="toggleDay('${habit.id}',${y},${m},${d})"
            title="${done ? 'Mark incomplete' : 'Mark complete'}">
            ${done ? '✓' : ''}
          </button>
        </td>`;
      }

      tbodyRows += `
      <tr class="habit-row" data-id="${habit.id}">
        <td class="cell-habit">
          <div class="habit-name-wrap">
            <span class="habit-emoji">${habit.emoji}</span>
            <div>
              <div class="habit-name-text" title="${escHtml(habit.name)}">${escHtml(habit.name)}</div>
              <span class="habit-cat-badge ${catCls}">${habit.category}</span>
              <div class="habit-row-actions">
                <button class="row-action-btn edit" onclick="openModal('${habit.id}')">Edit</button>
                <button class="row-action-btn del" onclick="deleteHabit('${habit.id}')">Delete</button>
              </div>
            </div>
          </div>
        </td>
        <td class="cell-goal col-goal">
          <div class="goal-val">${habit.goal}</div>
          <div class="goal-sub">days</div>
        </td>
        ${dayCells}
        ${renderProgress(count, habit.goal)}
      </tr>`;
    }
  }

  return `
  <div id="grid-section">
    <div class="grid-scroll-wrap">
      <table class="habit-table" role="grid">
        <colgroup>
          <col class="col-habit">
          <col class="col-goal">
          ${Array.from({length: days}, () => '<col class="col-day">').join('')}
          <col class="col-prog">
        </colgroup>
        <thead>
          <tr>
            <th class="th-habit">Habit</th>
            <th class="th-goal col-goal">Goal</th>
            ${dayHeaders}
            <th class="th-prog">Progress</th>
          </tr>
        </thead>
        <tbody>${tbodyRows}</tbody>
      </table>
    </div>
  </div>`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Render: Modal ──────────────────────────────────────────────────────────

function renderModal(habitId) {
  const isEdit = habitId !== null;
  const habit = isEdit ? state.habits.find(h => h.id === habitId) : null;
  const name     = habit ? habit.name     : '';
  const goal     = habit ? habit.goal     : 20;
  const category = habit ? habit.category : 'Health';
  const emoji    = habit ? habit.emoji    : '⭐';

  const emojiGrid = EMOJIS.map(e =>
    `<button type="button" class="emoji-opt${emoji === e ? ' selected' : ''}"
       onclick="selectEmoji(this,'${e}')" data-emoji="${e}">${e}</button>`
  ).join('');

  const catOptions = CATEGORIES.map(c =>
    `<option value="${c}"${category === c ? ' selected' : ''}>${c}</option>`
  ).join('');

  return `
  <div class="modal-overlay" onclick="handleOverlayClick(event)">
    <div class="modal" role="dialog" aria-modal="true"
         aria-label="${isEdit ? 'Edit' : 'Add'} Habit">
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Habit' : 'Add New Habit'}</h2>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Habit Name</label>
          <input id="modal-name" class="form-input" type="text"
            placeholder="e.g. Morning Run" maxlength="60"
            value="${escHtml(name)}" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Monthly Goal (days)</label>
            <input id="modal-goal" class="form-input" type="number"
              min="1" max="31" value="${goal}" />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="modal-cat" class="form-select">${catOptions}</select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Icon / Emoji</label>
          <div class="emoji-grid" id="emoji-grid">${emojiGrid}</div>
          <input id="modal-emoji" type="hidden" value="${emoji}" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveHabit('${habitId || ''}')">
          ${isEdit ? 'Save Changes' : 'Add Habit'}
        </button>
      </div>
    </div>
  </div>`;
}

// ─── Modal helpers ──────────────────────────────────────────────────────────

function selectEmoji(btn, emoji) {
  document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('modal-emoji').value = emoji;
}

function handleOverlayClick(e) {
  if (e.target.classList.contains('modal-overlay')) closeModal();
}

function openModal(habitId) {
  const existing = document.getElementById('modal-root');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.id = 'modal-root';
  div.innerHTML = renderModal(habitId);
  document.body.appendChild(div);
  setTimeout(() => {
    const inp = document.getElementById('modal-name');
    if (inp) inp.focus();
  }, 50);
}

function closeModal() {
  const el = document.getElementById('modal-root');
  if (el) el.remove();
}

// ─── Actions ────────────────────────────────────────────────────────────────

function saveHabit(habitId) {
  const name  = (document.getElementById('modal-name').value || '').trim();
  const goal  = parseInt(document.getElementById('modal-goal').value, 10) || 20;
  const cat   = document.getElementById('modal-cat').value;
  const emoji = document.getElementById('modal-emoji').value || '⭐';

  if (!name) {
    document.getElementById('modal-name').focus();
    showToast('Please enter a habit name.', 'default');
    return;
  }

  if (habitId) {
    const idx = state.habits.findIndex(h => h.id === habitId);
    if (idx > -1) {
      state.habits[idx] = { ...state.habits[idx], name, goal, category: cat, emoji };
    }
  } else {
    state.habits.push({ id: uid(), name, goal, category: cat, emoji });
  }
  saveState();
  closeModal();
  render();
  showToast(habitId ? '✏️ Habit updated!' : '🎉 Habit added!', 'success');
}

function deleteHabit(habitId) {
  if (!confirm('Delete this habit and all its completions?')) return;
  state.habits = state.habits.filter(h => h.id !== habitId);
  // Remove completions for this habit
  for (const key of Object.keys(state.completions)) {
    if (key.startsWith(habitId + '_')) delete state.completions[key];
  }
  saveState();
  render();
  showToast('🗑️ Habit deleted.', 'default');
}

function toggleDay(habitId, year, month, day) {
  const key = completionKey(habitId, year, month, day);
  if (state.completions[key]) {
    delete state.completions[key];
  } else {
    state.completions[key] = true;
  }
  saveState();

  // Update just the cell and progress without full re-render (perf)
  updateCellUI(habitId, year, month, day);
  updateProgressUI(habitId);
  updateDashboardUI();

  // Check all-done-today celebration
  checkCelebration();
}

function changeMonth(delta) {
  state.currentMonth += delta;
  if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
  if (state.currentMonth < 0)  { state.currentMonth = 11; state.currentYear--; }
  render();
}

function setFilter(f) {
  state.filter = f;
  render();
}

function setCategoryFilter(val) {
  state.categoryFilter = val;
  render();
}

// ─── Surgical DOM Updates (avoid full re-render on toggle) ──────────────────

function updateCellUI(habitId, year, month, day) {
  const { currentYear: y, currentMonth: m } = state;
  if (year !== y || month !== m) return;

  // Find the row
  const row = document.querySelector(`.habit-row[data-id="${habitId}"]`);
  if (!row) return;

  // day cells are td.cell-day, first two tds are habit + goal
  const cells = row.querySelectorAll('td.cell-day');
  const cellIdx = day - 1;
  const cell = cells[cellIdx];
  if (!cell) return;

  const btn = cell.querySelector('.tick-btn');
  if (!btn) return;

  const done = isCompleted(habitId, year, month, day);
  const today = isToday(year, month, day);

  btn.className = 'tick-btn' +
    (done  ? ' checked'    : '') +
    (today ? ' today-cell' : '') +
    (isFuture(year, month, day) ? ' no-future' : '');
  btn.innerHTML = done ? '✓' : '';
  btn.title = done ? 'Mark incomplete' : 'Mark complete';
}

function updateProgressUI(habitId) {
  const row = document.querySelector(`.habit-row[data-id="${habitId}"]`);
  if (!row) return;
  const progCell = row.querySelector('.cell-prog');
  if (!progCell) return;

  const habit = state.habits.find(h => h.id === habitId);
  if (!habit) return;
  const count = getHabitMonthCount(habitId);
  const pct = habit.goal > 0 ? Math.min(100, Math.round((count / habit.goal) * 100)) : 0;
  const cls = pct >= 100 ? 'done' : pct >= 60 ? 'close' : 'low';

  progCell.innerHTML = `
    <div class="prog-top">
      <span class="prog-count">${count}</span>
      <span class="prog-sep">/</span>
      <span class="prog-goal">${habit.goal}</span>
      <span class="prog-pct ${cls}">${pct}%</span>
    </div>
    <div class="prog-bar-track">
      <div class="prog-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>`;
}

function updateDashboardUI() {
  const s = getDashboardStats();
  const el = document.getElementById('dashboard');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card blue">
      <div class="stat-icon">📋</div>
      <div class="stat-label">Total Habits</div>
      <div class="stat-value">${s.totalHabits}</div>
      <div class="stat-sub">being tracked</div>
    </div>
    <div class="stat-card green">
      <div class="stat-icon">✅</div>
      <div class="stat-label">Done Today</div>
      <div class="stat-value">${s.completedToday}</div>
      <div class="stat-sub">of ${s.totalHabits} habits</div>
    </div>
    <div class="stat-card amber">
      <div class="stat-icon">🔥</div>
      <div class="stat-label">Avg Streak</div>
      <div class="stat-value">${s.avgStreak}</div>
      <div class="stat-sub">days current</div>
    </div>
    <div class="stat-card purple">
      <div class="stat-icon">🏆</div>
      <div class="stat-label">Best Streak</div>
      <div class="stat-value">${s.avgBest}</div>
      <div class="stat-sub">days average</div>
    </div>
    <div class="stat-card pink">
      <div class="stat-icon">📈</div>
      <div class="stat-label">Monthly</div>
      <div class="stat-value">${s.monthPct}%</div>
      <div class="stat-sub">completion rate</div>
    </div>`;
}

// ─── Celebration ────────────────────────────────────────────────────────────

let _celebratedToday = false;

function checkCelebration() {
  if (_celebratedToday) return;
  if (state.habits.length === 0) return;
  const n = new Date();
  const allDone = state.habits.every(h =>
    isCompleted(h.id, n.getFullYear(), n.getMonth(), n.getDate())
  );
  if (allDone) {
    _celebratedToday = true;
    const messages = [
      '🎉 You crushed it! All habits done today!',
      '🏆 Perfect day! Every habit checked off!',
      '✨ Incredible! 100% today — you\'re on fire!',
      '🌟 All habits complete! Keep the streak alive!',
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    showToast(msg, 'celebrate');
    launchConfetti();
    // Reset flag after midnight
    const msToMidnight = new Date().setHours(24,0,0,0) - Date.now();
    setTimeout(() => { _celebratedToday = false; }, msToMidnight);
  }
}

function launchConfetti() {
  const colors = ['#6366f1','#8b5cf6','#22c55e','#f59e0b','#ec4899','#3b82f6','#14b8a6'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 6}px;
      height: ${6 + Math.random() * 6}px;
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}

// ─── Toast ──────────────────────────────────────────────────────────────────

function showToast(msg, type = 'default') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast${type !== 'default' ? ' ' + type : ''}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Keyboard shortcuts ─────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if ((e.key === 'Enter') && e.ctrlKey) {
    const modal = document.getElementById('modal-root');
    if (modal) {
      const habitId = modal.querySelector('.btn-primary')?.getAttribute('onclick')?.match(/'([^']*)'/)?.[1] || '';
      saveHabit(habitId);
    }
  }
});

// ─── Main Render ─────────────────────────────────────────────────────────────

function render() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderTopBar()}
    <div id="main">
      ${renderDashboard()}
      ${renderFilters()}
      ${renderGrid()}
    </div>
    <div id="toast-container"></div>
  `;
}

// ─── Bootstrap ──────────────────────────────────────────────────────────────

loadState();
render();

// Expose to global for inline onclick handlers
window.changeMonth     = changeMonth;
window.openModal       = openModal;
window.closeModal      = closeModal;
window.saveHabit       = saveHabit;
window.deleteHabit     = deleteHabit;
window.toggleDay       = toggleDay;
window.setFilter       = setFilter;
window.setCategoryFilter = setCategoryFilter;
window.selectEmoji     = selectEmoji;
window.handleOverlayClick = handleOverlayClick;
