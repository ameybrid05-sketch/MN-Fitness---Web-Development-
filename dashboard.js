
/* ═══════════════════════════════════════════════════════════════
   MN FITNESS - Dashboard JavaScript
   ═══════════════════════════════════════════════════════════════ */

// ── Auth Guard ────────────────────────────────────────────────────
if (!getToken()) { window.location.href = 'login.html'; }

// ── State ─────────────────────────────────────────────────────────
let currentUser = getUser();
let allWorkoutPlans = [];
let allDietPlans = [];
let allArticles = [];
let workoutLogs = [];
let dietLogs = [];
let progressLogs = [];
let charts = {};

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  setupSidebar();
  setupLogout();
  setupStarRating();
  setupForms();
  await loadUser();
  await loadOverview();
  loadWorkoutPlans();
  loadDietPlans();
  loadArticles();
});

// ── Sidebar ───────────────────────────────────────────────────────
function setupSidebar() {
  const toggle = document.getElementById('sidebarToggle');
  const close  = document.getElementById('sidebarClose');
  const overlay= document.getElementById('sidebarOverlay');
  const sidebar= document.getElementById('sidebar');

  toggle && toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  close && close.addEventListener('click', closeSidebar);
  overlay && overlay.addEventListener('click', closeSidebar);

  // Nav links
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.tab);
      closeSidebar();
    });
  });
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ── Tab Switching ─────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => l.classList.remove('active'));

  const panel = document.getElementById('tab-' + tabName);
  if (panel) panel.classList.add('active');

  const link = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (link) link.classList.add('active');

  const titles = {
    overview: 'Overview', workouts: 'Workout Plans', diet: 'Diet Plans',
    progress: 'Progress Tracking', nutrition: 'Nutrition', articles: 'Articles',
    trainer: 'Trainer Plans', feedback: 'Help & Feedback'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[tabName] || tabName;

  // Lazy-load tab data
  if (tabName === 'progress') loadProgress();
  if (tabName === 'nutrition') loadNutrition();
  if (tabName === 'trainer') loadTrainerPlans();
  if (tabName === 'feedback') loadFeedback();
}

// ── Load User ─────────────────────────────────────────────────────
async function loadUser() {
  try {
    currentUser = await API.getMe();
    localStorage.setItem('user', JSON.stringify(currentUser));
  } catch { /* use cached */ }

  const u = currentUser;
  if (!u) return;

  const name = u.full_name || u.username;
  const initial = name.charAt(0).toUpperCase();

  setText('sidebarUsername', name);
  setText('sidebarRole', u.role);
  setText('sidebarAvatar', initial);
  setText('headerAvatar', initial);
  setText('headerUsername', name);
  setText('welcomeName', u.full_name ? u.full_name.split(' ')[0] : u.username);

  const goalMap = { weight_loss:'🔥 Weight Loss', weight_gain:'💪 Weight Gain', bodybuilding:'🏆 Bodybuilding' };
  setText('goalText', goalMap[u.goal] || 'Set Goal');

  if (u.weight) setText('statWeight', u.weight);
  if (u.weight && u.height) {
    const bmi = calcBMI(u.weight, u.height);
    setText('statBMI', bmi);
  }

  // Welcome message
  const msgs = {
    weight_loss: 'Your fat-burning journey continues. Stay consistent! 🔥',
    weight_gain: 'Time to fuel those gains. Eat big, lift big! 💪',
    bodybuilding: 'Sculpt your masterpiece. Every rep counts! 🏆'
  };
  setText('welcomeMsg', msgs[u.goal] || 'Ready to crush your fitness goals today?');

  if (u.goal) {
    const welcomeGoal = document.getElementById('welcomeGoal');
    if (welcomeGoal) {
      welcomeGoal.innerHTML = `<span style="font-size:2rem">${goalMap[u.goal]?.split(' ')[0]}</span><span style="font-size:0.9rem;color:var(--text-muted)">${goalMap[u.goal]?.split(' ').slice(1).join(' ')}</span>`;
    }
  }
}

// ── Overview ──────────────────────────────────────────────────────
async function loadOverview() {
  try {
    [workoutLogs, dietLogs, progressLogs] = await Promise.all([
      API.getWorkoutLogs(),
      API.getDietLogs(),
      API.getProgress()
    ]);
  } catch (e) {
    workoutLogs = []; dietLogs = []; progressLogs = [];
  }

  // Stats
  setText('statWorkouts', workoutLogs.length);
  const totalCal = workoutLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  setText('statCalories', Math.round(totalCal));

  if (progressLogs.length > 0) {
    const latest = progressLogs[0];
    setText('statWeight', latest.weight || '--');
    setText('statBMI', latest.bmi || '--');
  }

  renderRecentWorkouts();
  renderRecentMeals();
  renderWeightChart();
  renderCaloriesChart();
}

function renderRecentWorkouts() {
  const el = document.getElementById('recentWorkouts');
  if (!el) return;
  const recent = workoutLogs.slice(0, 5);
  if (!recent.length) return;
  el.innerHTML = recent.map(l => `
    <div class="exercise-card" style="margin-bottom:8px">
      <div class="exercise-num">${l.exercise_name.charAt(0).toUpperCase()}</div>
      <div class="exercise-info">
        <div class="exercise-name">${l.exercise_name}</div>
        <div class="exercise-meta">
          ${l.sets ? l.sets + ' sets' : ''} ${l.reps ? '× ' + l.reps + ' reps' : ''}
          ${l.calories_burned ? ' · ' + l.calories_burned + ' kcal' : ''}
          · ${formatDate(l.logged_at)}
        </div>
      </div>
    </div>`).join('');
}

function renderRecentMeals() {
  const el = document.getElementById('recentMeals');
  if (!el) return;
  const recent = dietLogs.slice(0, 5);
  if (!recent.length) return;
  el.innerHTML = recent.map(l => `
    <div class="exercise-card" style="margin-bottom:8px">
      <div class="exercise-num">🍽</div>
      <div class="exercise-info">
        <div class="exercise-name">${l.meal_name}</div>
        <div class="exercise-meta">
          ${l.calories ? l.calories + ' kcal' : ''}
          ${l.protein_g ? ' · P: ' + l.protein_g + 'g' : ''}
          · ${formatDate(l.logged_at)}
        </div>
      </div>
    </div>`).join('');
}

function renderWeightChart() {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;
  if (charts.weight) charts.weight.destroy();
  const data = progressLogs.slice(0, 10).reverse();
  charts.weight = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(l => formatDate(l.logged_at)),
      datasets: [{
        label: 'Weight (kg)',
        data: data.map(l => l.weight),
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255,107,53,0.1)',
        tension: 0.4, fill: true, pointRadius: 4,
        pointBackgroundColor: '#ff6b35'
      }]
    },
    options: chartOptions('Weight (kg)')
  });
}

function renderCaloriesChart() {
  const ctx = document.getElementById('caloriesChart');
  if (!ctx) return;
  if (charts.calories) charts.calories.destroy();
  // Group by day (last 7 days)
  const days = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    days[d.toDateString()] = 0;
  }
  workoutLogs.forEach(l => {
    const d = new Date(l.logged_at).toDateString();
    if (d in days) days[d] += (l.calories_burned || 0);
  });
  charts.calories = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(days).map(d => new Date(d).toLocaleDateString('en-IN', { weekday: 'short' })),
      datasets: [{
        label: 'Calories Burned',
        data: Object.values(days),
        backgroundColor: 'rgba(255,107,53,0.7)',
        borderColor: '#ff6b35',
        borderWidth: 1, borderRadius: 6
      }]
    },
    options: chartOptions('Calories')
  });
}

function chartOptions(label) {
  return {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#adb5bd', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#adb5bd', font: { size: 11 } } }
    }
  };
}

// ── Workout Plans ─────────────────────────────────────────────────
async function loadWorkoutPlans() {
  try {
    allWorkoutPlans = await API.getWorkoutPlans();
    renderWorkoutPlans(allWorkoutPlans);
    renderWorkoutHistory();
  } catch (e) {
    console.error('Workout plans error:', e);
  }
}

function filterWorkouts(goal, btn) {
  document.querySelectorAll('#workoutTabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = goal === 'all' ? allWorkoutPlans : allWorkoutPlans.filter(p => p.goal === goal);
  renderWorkoutPlans(filtered);
}

function renderWorkoutPlans(plans) {
  const grid = document.getElementById('workoutPlansGrid');
  if (!grid) return;
  if (!plans.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🏋️</div>
      <div class="empty-state-title">No plans found</div>
    </div>`;
    return;
  }
  const goalIcons = { weight_loss: '🔥', weight_gain: '💪', bodybuilding: '🏆' };
  grid.innerHTML = plans.map(p => `
    <div class="plan-card">
      <div class="plan-card-header">
        <div>
          <div class="plan-card-title">${p.name}</div>
          <div style="display:flex;gap:8px;margin-top:6px">
            ${levelBadge(p.level)}
            <span class="badge badge-primary">${goalIcons[p.goal] || ''} ${p.goal.replace('_',' ')}</span>
          </div>
        </div>
        <span style="font-size:2rem">${goalIcons[p.goal] || '💪'}</span>
      </div>
      <div class="plan-card-body">
        <div class="plan-card-desc">${p.description || 'No description available.'}</div>
        <div class="plan-card-meta">
          <div class="plan-meta-item"><i class="fas fa-calendar"></i> ${p.duration_weeks} weeks</div>
          <div class="plan-meta-item"><i class="fas fa-list"></i> ${(p.exercises || []).length} exercises</div>
        </div>
        <div class="plan-card-actions">
          <button class="btn btn-primary btn-sm" onclick="viewWorkoutPlan(${p.id})">
            <i class="fas fa-eye"></i> View Plan
          </button>
          <button class="btn btn-outline btn-sm" onclick="quickLogFromPlan('${p.name}')">
            <i class="fas fa-plus"></i> Log
          </button>
        </div>
      </div>
    </div>`).join('');
}

async function viewWorkoutPlan(id) {
  const plan = allWorkoutPlans.find(p => p.id === id);
  if (!plan) return;
  const goalIcons = { weight_loss: '🔥', weight_gain: '💪', bodybuilding: '🏆' };
  const exercises = plan.exercises || [];
  document.getElementById('planDetailTitle').textContent = plan.name;
  document.getElementById('planDetailContent').innerHTML = `
    <div style="margin-bottom:16px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${levelBadge(plan.level)}
        <span class="badge badge-primary">${goalIcons[plan.goal] || ''} ${plan.goal.replace('_',' ')}</span>
        <span class="badge badge-info"><i class="fas fa-calendar"></i> ${plan.duration_weeks} weeks</span>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.7">${plan.description || ''}</p>
    </div>
    <div class="section-title" style="margin-bottom:16px">Exercises</div>
    ${exercises.map((ex, i) => `
      <div class="exercise-card" style="margin-bottom:10px">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-info">
          <div class="exercise-name">${ex.name || ex.exercise || 'Exercise'}</div>
          <div class="exercise-meta">
            ${ex.day ? '<strong>' + ex.day + '</strong> · ' : ''}
            ${ex.sets ? ex.sets + ' sets' : ''}
            ${ex.reps ? ' × ' + ex.reps + ' reps' : ''}
            ${ex.duration ? ' · ' + ex.duration : ''}
            ${ex.calories ? ' · ~' + ex.calories + ' kcal' : ''}
            ${ex.rest ? ' · Rest: ' + ex.rest : ''}
          </div>
        </div>
      </div>`).join('')}
    <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="quickLogFromPlan('${plan.name}');closeModal('planDetailModal')">
      <i class="fas fa-dumbbell"></i> Start This Workout
    </button>`;
  openModal('planDetailModal');
}

function quickLogFromPlan(planName) {
  document.getElementById('wExercise').value = planName;
  openModal('logWorkoutModal');
}

function renderWorkoutHistory() {
  const tbody = document.getElementById('workoutHistoryBody');
  if (!tbody) return;
  if (!workoutLogs.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">No workout logs yet. Start logging!</td></tr>';
    return;
  }
  tbody.innerHTML = workoutLogs.map(l => `
    <tr>
      <td><strong>${l.exercise_name}</strong></td>
      <td>${l.sets || '--'}</td>
      <td>${l.reps || '--'}</td>
      <td>${l.weight_used ? l.weight_used + ' kg' : '--'}</td>
      <td>${l.duration_minutes ? l.duration_minutes + ' min' : '--'}</td>
      <td>${l.calories_burned ? l.calories_burned + ' kcal' : '--'}</td>
      <td>${formatDate(l.logged_at)}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteWorkoutLog(${l.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

async function deleteWorkoutLog(id) {
  if (!confirm('Delete this workout log?')) return;
  try {
    await API.deleteWorkoutLog(id);
    workoutLogs = workoutLogs.filter(l => l.id !== id);
    renderWorkoutHistory();
    renderRecentWorkouts();
    showToast('Workout log deleted', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Diet Plans ────────────────────────────────────────────────────
async function loadDietPlans() {
  try {
    allDietPlans = await API.getDietPlans();
    renderDietPlans(allDietPlans);
    renderDietHistory();
  } catch (e) { console.error('Diet plans error:', e); }
}

function filterDiet(goal, btn) {
  document.querySelectorAll('#tab-diet .tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = goal === 'all' ? allDietPlans : allDietPlans.filter(p => p.goal === goal);
  renderDietPlans(filtered);
}

function renderDietPlans(plans) {
  const grid = document.getElementById('dietPlansGrid');
  if (!grid) return;
  if (!plans.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">🥗</div><div class="empty-state-title">No diet plans found</div>
    </div>`;
    return;
  }
  const goalIcons = { weight_loss: '🔥', weight_gain: '💪', bodybuilding: '🏆' };
  grid.innerHTML = plans.map(p => `
    <div class="plan-card">
      <div class="plan-card-header">
        <div>
          <div class="plan-card-title">${p.name}</div>
          <div style="display:flex;gap:8px;margin-top:6px">
            <span class="badge badge-primary">${goalIcons[p.goal] || ''} ${p.goal.replace('_',' ')}</span>
            ${p.calories_per_day ? `<span class="badge badge-info">${p.calories_per_day} kcal/day</span>` : ''}
          </div>
        </div>
        <span style="font-size:2rem">🥗</span>
      </div>
      <div class="plan-card-body">
        <div class="plan-card-desc">${p.description || 'No description available.'}</div>
        <div class="plan-card-meta">
          ${p.protein_g ? `<div class="plan-meta-item"><i class="fas fa-drumstick-bite"></i> P: ${p.protein_g}g</div>` : ''}
          ${p.carbs_g ? `<div class="plan-meta-item"><i class="fas fa-bread-slice"></i> C: ${p.carbs_g}g</div>` : ''}
          ${p.fat_g ? `<div class="plan-meta-item"><i class="fas fa-oil-can"></i> F: ${p.fat_g}g</div>` : ''}
        </div>
        <div class="plan-card-actions">
          <button class="btn btn-primary btn-sm" onclick="viewDietPlan(${p.id})">
            <i class="fas fa-eye"></i> View Plan
          </button>
          <button class="btn btn-outline btn-sm" onclick="openModal('logMealModal')">
            <i class="fas fa-plus"></i> Log Meal
          </button>
        </div>
      </div>
    </div>`).join('');
}

function viewDietPlan(id) {
  const plan = allDietPlans.find(p => p.id === id);
  if (!plan) return;
  const meals = plan.meals || [];
  document.getElementById('dietDetailTitle').textContent = plan.name;
  document.getElementById('dietDetailContent').innerHTML = `
    <div style="margin-bottom:16px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        ${plan.calories_per_day ? `<span class="badge badge-primary">🔥 ${plan.calories_per_day} kcal/day</span>` : ''}
        ${plan.protein_g ? `<span class="badge badge-info">Protein: ${plan.protein_g}g</span>` : ''}
        ${plan.carbs_g ? `<span class="badge badge-warning">Carbs: ${plan.carbs_g}g</span>` : ''}
        ${plan.fat_g ? `<span class="badge badge-danger">Fat: ${plan.fat_g}g</span>` : ''}
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;line-height:1.7">${plan.description || ''}</p>
    </div>
    <div class="section-title" style="margin-bottom:16px">Meal Schedule</div>
    ${meals.map(m => `
      <div class="meal-card">
        <div class="meal-header">
          <div class="meal-name">${m.meal}</div>
          <div class="meal-time">${m.time || ''} ${m.calories ? '· ' + m.calories + ' kcal' : ''}</div>
        </div>
        <ul class="meal-foods">
          ${(m.foods || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>`).join('')}`;
  openModal('dietDetailModal');
}

function renderDietHistory() {
  const tbody = document.getElementById('dietHistoryBody');
  if (!tbody) return;
  if (!dietLogs.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px">No meal logs yet. Start tracking!</td></tr>';
    return;
  }
  tbody.innerHTML = dietLogs.map(l => `
    <tr>
      <td><strong>${l.meal_name}</strong></td>
      <td>${l.calories ? l.calories + ' kcal' : '--'}</td>
      <td>${l.protein_g ? l.protein_g + 'g' : '--'}</td>
      <td>${l.carbs_g ? l.carbs_g + 'g' : '--'}</td>
      <td>${l.fat_g ? l.fat_g + 'g' : '--'}</td>
      <td>${formatDate(l.logged_at)}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteDietLog(${l.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`).join('');
}

async function deleteDietLog(id) {
  if (!confirm('Delete this meal log?')) return;
  try {
    await API.deleteDietLog(id);
    dietLogs = dietLogs.filter(l => l.id !== id);
    renderDietHistory();
    renderRecentMeals();
    showToast('Meal log deleted', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Progress ──────────────────────────────────────────────────────
async function loadProgress() {
  try {
    progressLogs = await API.getProgress();
    renderProgressStats();
    renderProgressChart();
    renderProgressHistory();
  } catch (e) { console.error('Progress error:', e); }
}

function renderProgressStats() {
  if (!progressLogs.length) return;
  const latest = progressLogs[0];
  const oldest = progressLogs[progressLogs.length - 1];
  setText('progCurrentWeight', latest.weight ? latest.weight + ' kg' : '--');
  setText('progBMI', latest.bmi || '--');
  if (latest.weight && oldest.weight && progressLogs.length > 1) {
    const change = (latest.weight - oldest.weight).toFixed(1);
    const el = document.getElementById('progChange');
    if (el) {
      el.textContent = (change > 0 ? '+' : '') + change + ' kg';
      el.style.color = change > 0 ? 'var(--success)' : 'var(--danger)';
    }
  }
}

function renderProgressChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;
  if (charts.progress) charts.progress.destroy();
  const data = progressLogs.slice(0, 20).reverse();
  charts.progress = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(l => formatDate(l.logged_at)),
      datasets: [{
        label: 'Weight (kg)',
        data: data.map(l => l.weight),
        borderColor: '#ff6b35',
        backgroundColor: 'rgba(255,107,53,0.1)',
        tension: 0.4, fill: true, pointRadius: 5,
        pointBackgroundColor: '#ff6b35', pointBorderColor: '#fff', pointBorderWidth: 2
      }]
    },
    options: { ...chartOptions('Weight'), plugins: { legend: { display: true, labels: { color: '#adb5bd' } } } }
  });
}

function renderProgressHistory() {
  const tbody = document.getElementById('progressHistoryBody');
  if (!tbody) return;
  if (!progressLogs.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:30px">No progress logs yet.</td></tr>';
    return;
  }
  tbody.innerHTML = progressLogs.map(l => {
    const bmiCat = l.bmi ? bmiCategory(l.bmi) : null;
    return `<tr>
      <td>${formatDate(l.logged_at)}</td>
      <td><strong>${l.weight || '--'}</strong></td>
      <td>${l.bmi ? `<span style="color:${bmiCat.color}">${l.bmi} (${bmiCat.label})</span>` : '--'}</td>
      <td>${l.body_fat ? l.body_fat + '%' : '--'}</td>
      <td>${l.notes || '--'}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteProgressLog(${l.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function deleteProgressLog(id) {
  if (!confirm('Delete this progress log?')) return;
  try {
    await API.deleteProgress(id);
    progressLogs = progressLogs.filter(l => l.id !== id);
    renderProgressStats();
    renderProgressChart();
    renderProgressHistory();
    showToast('Progress log deleted', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Nutrition ─────────────────────────────────────────────────────
async function loadNutrition() {
  try {
    if (!dietLogs.length) dietLogs = await API.getDietLogs();
    const totals = dietLogs.reduce((acc, l) => {
      acc.cal += l.calories || 0;
      acc.protein += l.protein_g || 0;
      acc.carbs += l.carbs_g || 0;
      acc.fat += l.fat_g || 0;
      return acc;
    }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

    setText('nutCalories', Math.round(totals.cal));
    setText('nutProtein', Math.round(totals.protein) + 'g');
    setText('nutCarbs', Math.round(totals.carbs) + 'g');
    setText('nutFat', Math.round(totals.fat) + 'g');

    renderMacroChart(totals);
    renderRecommendedNutrition();
  } catch (e) { console.error('Nutrition error:', e); }
}

function renderMacroChart(totals) {
  const ctx = document.getElementById('macroChart');
  if (!ctx) return;
  if (charts.macro) charts.macro.destroy();
  const total = totals.protein + totals.carbs + totals.fat;
  if (!total) return;
  charts.macro = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        data: [totals.protein, totals.carbs, totals.fat],
        backgroundColor: ['#17a2b8', '#ffc107', '#ff6b35'],
        borderColor: '#1e1e35', borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#adb5bd', padding: 16 } }
      },
      cutout: '65%'
    }
  });
}

function renderRecommendedNutrition() {
  const el = document.getElementById('recommendedNutrition');
  if (!el || !currentUser) return;
  const recs = {
    weight_loss: { cal: 1500, protein: 120, carbs: 150, fat: 45 },
    weight_gain: { cal: 3000, protein: 180, carbs: 350, fat: 80 },
    bodybuilding: { cal: 2800, protein: 200, carbs: 300, fat: 70 }
  };
  const r = recs[currentUser.goal];
  if (!r) { el.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-state-title">Set your goal to see recommendations</div></div>'; return; }
  el.innerHTML = `
    <div style="padding:8px 0">
      ${[
        { label: 'Daily Calories', val: r.cal + ' kcal', icon: 'fas fa-fire', color: 'var(--primary)' },
        { label: 'Protein', val: r.protein + 'g', icon: 'fas fa-drumstick-bite', color: 'var(--info)' },
        { label: 'Carbohydrates', val: r.carbs + 'g', icon: 'fas fa-bread-slice', color: 'var(--warning)' },
        { label: 'Fat', val: r.fat + 'g', icon: 'fas fa-oil-can', color: 'var(--gold)' }
      ].map(item => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border-color)">
          <div style="display:flex;align-items:center;gap:10px">
            <i class="${item.icon}" style="color:${item.color};width:18px"></i>
            <span style="color:var(--text-muted);font-size:0.9rem">${item.label}</span>
          </div>
          <strong style="color:${item.color}">${item.val}</strong>
        </div>`).join('')}
    </div>`;
}

// ── Articles ──────────────────────────────────────────────────────
async function loadArticles() {
  try {
    allArticles = await API.getArticles();
    renderArticles(allArticles);
  } catch (e) { console.error('Articles error:', e); }
}

function searchArticles(query) {
  const filtered = allArticles.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    (a.category || '').toLowerCase().includes(query.toLowerCase())
  );
  renderArticles(filtered);
}

function renderArticles(articles) {
  const grid = document.getElementById('articlesGrid');
  if (!grid) return;
  if (!articles.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">📚</div><div class="empty-state-title">No articles found</div>
    </div>`;
    return;
  }
  const catIcons = { 'Fitness Tips': '💡', 'Nutrition': '🥗', 'Weight Loss': '🔥', 'Bodybuilding': '🏆', 'Wellness': '🧘' };
  grid.innerHTML = articles.map(a => `
    <div class="article-card" onclick="viewArticle(${a.id})">
      <div class="article-img">${catIcons[a.category] || '📰'}</div>
      <div class="article-body">
        <div class="article-category">${a.category || 'General'}</div>
        <div class="article-title">${a.title}</div>
        <div class="article-excerpt">${a.content.replace(/\*\*/g, '').substring(0, 100)}...</div>
        <div class="article-date"><i class="fas fa-calendar"></i> ${formatDate(a.created_at)}</div>
      </div>
    </div>`).join('');
}

function viewArticle(id) {
  const article = allArticles.find(a => a.id === id);
  if (!article) return;
  document.getElementById('articleModalTitle').textContent = article.title;
  // Convert basic markdown bold to HTML
  const content = article.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  document.getElementById('articleModalContent').innerHTML = `
    <div style="margin-bottom:12px">
      <span class="badge badge-primary">${article.category || 'General'}</span>
      <span style="color:var(--text-muted);font-size:0.82rem;margin-left:10px">${formatDate(article.created_at)}</span>
    </div>
    <p>${content}</p>`;
  openModal('articleModal');
}

// ── Trainer Plans ─────────────────────────────────────────────────
async function loadTrainerPlans() {
  const el = document.getElementById('trainerPlansGrid');
  if (!el) return;
  try {
    const plans = await API.getTrainerPlansForMe();
    if (!plans.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">👨‍💼</div>
        <div class="empty-state-title">No trainer plans yet</div>
        <div class="empty-state-desc">Your trainer will assign personalized plans here</div>
      </div>`;
      return;
    }
    const goalIcons = { weight_loss: '🔥', weight_gain: '💪', bodybuilding: '🏆' };
    el.innerHTML = plans.map(p => `
      <div class="trainer-plan-card">
        <div class="trainer-plan-header">
          <div class="trainer-plan-title">${p.title}</div>
          <div style="display:flex;gap:8px">
            <span class="badge badge-primary">${goalIcons[p.goal] || ''} ${p.goal.replace('_',' ')}</span>
            <span class="badge badge-info">${p.plan_type}</span>
          </div>
        </div>
        <div class="trainer-plan-meta">
          <i class="fas fa-user-tie"></i> Assigned by Trainer · ${formatDate(p.created_at)}
        </div>
        ${p.notes ? `<div class="trainer-plan-content">${p.notes}</div>` : ''}
        ${p.content ? `<div style="margin-top:12px">${renderTrainerContent(p.content)}</div>` : ''}
      </div>`).join('');
  } catch (e) { console.error('Trainer plans error:', e); }
}

function renderTrainerContent(content) {
  if (typeof content === 'string') return `<p style="color:var(--text-muted);font-size:0.88rem">${content}</p>`;
  if (Array.isArray(content)) {
    return content.map(item => `
      <div class="exercise-card" style="margin-bottom:8px">
        <div class="exercise-num">•</div>
        <div class="exercise-info">
          <div class="exercise-name">${item.name || item.exercise || JSON.stringify(item)}</div>
          ${item.sets ? `<div class="exercise-meta">${item.sets} sets × ${item.reps || '?'} reps</div>` : ''}
        </div>
      </div>`).join('');
  }
  return `<pre style="color:var(--text-muted);font-size:0.82rem;white-space:pre-wrap">${JSON.stringify(content, null, 2)}</pre>`;
}

// ── Feedback ──────────────────────────────────────────────────────
async function loadFeedback() {
  try {
    const myFeedback = await API.getMyFeedback();
    renderMyFeedback(myFeedback);
  } catch (e) { console.error('Feedback error:', e); }
}

function renderMyFeedback(list) {
  const el = document.getElementById('myFeedbackList');
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="empty-state" style="padding:30px">
      <div class="empty-state-icon">💬</div>
      <div class="empty-state-title">No feedback submitted yet</div>
    </div>`;
    return;
  }
  const stars = n => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));
  el.innerHTML = list.map(f => `
    <div class="feedback-card">
      <div class="feedback-subject">${f.subject}</div>
      <div class="feedback-message">${f.message}</div>
      <div class="feedback-meta">
        <span style="color:var(--gold)">${stars(f.rating)}</span>
        <span>${formatDate(f.created_at)} · ${f.is_resolved ? '<span class="badge badge-success">Resolved</span>' : '<span class="badge badge-warning">Pending</span>'}</span>
      </div>
    </div>`).join('');
}

// ── Star Rating ───────────────────────────────────────────────────
function setupStarRating() {
  const stars = document.querySelectorAll('#starRating .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.val);
      document.getElementById('fbRating').value = val;
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.val) <= val));
    });
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.val);
      stars.forEach(s => s.style.color = parseInt(s.dataset.val) <= val ? 'var(--gold)' : 'var(--text-muted)');
    });
  });
  const rating = document.getElementById('starRating');
  if (rating) rating.addEventListener('mouseleave', () => {
    const val = parseInt(document.getElementById('fbRating').value || 5);
    stars.forEach(s => {
      s.style.color = parseInt(s.dataset.val) <= val ? 'var(--gold)' : 'var(--text-muted)';
    });
  });
  // Default 5 stars
  stars.forEach(s => { s.style.color = 'var(--gold)'; s.classList.add('active'); });
}

// ── Forms ─────────────────────────────────────────────────────────
function setupForms() {
  // Log Workout
  const wForm = document.getElementById('logWorkoutForm');
  if (wForm) wForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('logWorkoutAlert');
    const btn = wForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const log = await API.logWorkout({
        exercise_name: document.getElementById('wExercise').value.trim(),
        sets: parseInt(document.getElementById('wSets').value) || null,
        reps: parseInt(document.getElementById('wReps').value) || null,
        weight_used: parseFloat(document.getElementById('wWeight').value) || null,
        duration_minutes: parseInt(document.getElementById('wDuration').value) || null,
        calories_burned: parseFloat(document.getElementById('wCalories').value) || null,
        notes: document.getElementById('wNotes').value || null
      });
      workoutLogs.unshift(log);
      renderWorkoutHistory();
      renderRecentWorkouts();
      closeModal('logWorkoutModal');
      wForm.reset();
      showToast('Workout logged successfully!', 'success');
      // Update stats
      const totalCal = workoutLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
      setText('statWorkouts', workoutLogs.length);
      setText('statCalories', Math.round(totalCal));
      renderCaloriesChart();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });

  // Log Meal
  const mForm = document.getElementById('logMealForm');
  if (mForm) mForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('logMealAlert');
    const btn = mForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const log = await API.logDiet({
        meal_name: document.getElementById('mMeal').value.trim(),
        calories: parseFloat(document.getElementById('mCalories').value) || null,
        protein_g: parseFloat(document.getElementById('mProtein').value) || null,
        carbs_g: parseFloat(document.getElementById('mCarbs').value) || null,
        fat_g: parseFloat(document.getElementById('mFat').value) || null,
        notes: document.getElementById('mNotes').value || null
      });
      dietLogs.unshift(log);
      renderDietHistory();
      renderRecentMeals();
      closeModal('logMealModal');
      mForm.reset();
      showToast('Meal logged successfully!', 'success');
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });

  // Log Progress
  const pForm = document.getElementById('logProgressForm');
  if (pForm) pForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('logProgressAlert');
    const btn = pForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const log = await API.logProgress({
        weight: parseFloat(document.getElementById('pWeight').value),
        body_fat: parseFloat(document.getElementById('pBodyFat').value) || null,
        notes: document.getElementById('pNotes').value || null
      });
      progressLogs.unshift(log);
      renderProgressStats();
      renderProgressChart();
      renderProgressHistory();
      setText('statWeight', log.weight);
      if (log.bmi) setText('statBMI', log.bmi);
      closeModal('logProgressModal');
      pForm.reset();
      showToast('Progress logged!', 'success');
      renderWeightChart();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });

  // Feedback
  const fbForm = document.getElementById('feedbackForm');
  if (fbForm) fbForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('feedbackAlert');
    const btn = fbForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await API.submitFeedback({
        subject: document.getElementById('fbSubject').value.trim(),
        message: document.getElementById('fbMessage').value.trim(),
        rating: parseInt(document.getElementById('fbRating').value) || 5
      });
      fbForm.reset();
      showToast('Feedback submitted! Thank you.', 'success');
      loadFeedback();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });
}

// ── Logout ────────────────────────────────────────────────────────
function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) logout();
  });
}

// ── Helper ────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
