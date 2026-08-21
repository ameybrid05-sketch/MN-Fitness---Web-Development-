/* ═══════════════════════════════════════════════════════════════
   MN FITNESS - Admin Panel JavaScript
   ═══════════════════════════════════════════════════════════════ */

// Auth guard — admin/owner/trainer only
const _user = getUser();
if (!getToken() || !_user) { window.location.href = 'login.html'; }
if (!['admin', 'owner', 'trainer'].includes(_user?.role)) {
  window.location.href = 'dashboard.html';
}

let allUsers = [];
let allAdminArticles = [];
let adminCharts = {};

document.addEventListener('DOMContentLoaded', async () => {
  setupAdminSidebar();
  setupAdminLogout();
  setupAdminForms();
  loadAdminUser();
  await loadAdminStats();
  loadAdminUsers();
  loadAdminArticles();
  loadAdminFeedback();
  loadAssignUsers();
  loadRecentAssignedPlans();
});

// ── Sidebar ───────────────────────────────────────────────────────
function setupAdminSidebar() {
  const toggle  = document.getElementById('sidebarToggle');
  const close   = document.getElementById('sidebarClose');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');

  toggle  && toggle.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); });
  close   && close.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
  overlay && overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

  document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchAdminTab(link.dataset.tab);
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  });
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link[data-tab]').forEach(l => l.classList.remove('active'));
  const panel = document.getElementById('tab-' + tabName);
  if (panel) panel.classList.add('active');
  const link = document.querySelector(`.sidebar-link[data-tab="${tabName}"]`);
  if (link) link.classList.add('active');
  const titles = { overview: 'Admin Dashboard', users: 'All Users', trainers: 'Trainers & Owners', assign: 'Assign Plans', feedback: 'User Feedback', articles: 'Manage Articles' };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[tabName] || tabName;
  if (tabName === 'trainers') loadTrainers();
}

function setupAdminLogout() {
  const btn = document.getElementById('logoutBtn');
  if (btn) btn.addEventListener('click', () => { if (confirm('Logout?')) logout(); });
}

function loadAdminUser() {
  const u = getUser();
  if (!u) return;
  const name = u.full_name || u.username;
  const el = document.getElementById('adminName');
  if (el) el.textContent = name;
  const av = document.getElementById('adminAvatar');
  if (av) av.textContent = name.charAt(0).toUpperCase();
}

// ── Stats ─────────────────────────────────────────────────────────
async function loadAdminStats() {
  try {
    const stats = await API.adminGetStats();
    setText('statTotalUsers', stats.total_users);
    setText('statActiveUsers', stats.active_users);
    setText('statTrainers', stats.trainers);
    setText('statFeedback', stats.unresolved_feedback);
    setText('unresolvedCount', stats.unresolved_feedback + ' unresolved');
    renderAdminActivityChart(stats);
  } catch (e) { console.error('Stats error:', e); }
}

function renderAdminActivityChart(stats) {
  const ctx = document.getElementById('adminActivityChart');
  if (!ctx) return;
  if (adminCharts.activity) adminCharts.activity.destroy();
  adminCharts.activity = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Workout Logs', 'Diet Logs', 'Total Users', 'Active Users', 'Trainers'],
      datasets: [{
        label: 'Count',
        data: [stats.total_workout_logs, stats.total_diet_logs, stats.total_users, stats.active_users, stats.trainers],
        backgroundColor: ['#ff6b35','#28a745','#17a2b8','#ffc107','#9c27b0'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#adb5bd', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#adb5bd' } }
      }
    }
  });
}

// ── Users ─────────────────────────────────────────────────────────
async function loadAdminUsers() {
  try {
    allUsers = await API.adminGetUsers();
    renderUsersTable(allUsers);
    populatePromoteSelect(allUsers);
  } catch (e) { console.error('Users error:', e); }
}

function searchUsers(q) {
  const filtered = allUsers.filter(u =>
    u.username.toLowerCase().includes(q.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(q.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(q.toLowerCase())
  );
  renderUsersTable(filtered);
}

function filterByRole(role) {
  const filtered = role ? allUsers.filter(u => u.role === role) : allUsers;
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px">No users found</td></tr>';
    return;
  }
  const goalMap = { weight_loss: '🔥 Loss', weight_gain: '💪 Gain', bodybuilding: '🏆 Build' };
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td><strong>${u.username}</strong></td>
      <td>${u.full_name || '--'}</td>
      <td>${u.email || '--'}</td>
      <td>${goalMap[u.goal] || '--'}</td>
      <td><span class="admin-role-badge role-${u.role}">${u.role}</span></td>
      <td><span class="${u.is_active ? 'status-active' : 'status-inactive'}">${u.is_active ? '● Active' : '● Inactive'}</span></td>
      <td>${formatDate(u.created_at)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-outline" onclick="openEditUser(${u.id}, '${u.role}', ${u.is_active})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id}, '${u.username}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function openEditUser(id, role, isActive) {
  document.getElementById('editUserId').value = id;
  document.getElementById('editUserRole').value = role;
  document.getElementById('editUserStatus').value = String(isActive);
  openModal('editUserModal');
}

async function saveUserEdit() {
  const id = document.getElementById('editUserId').value;
  const role = document.getElementById('editUserRole').value;
  const isActive = document.getElementById('editUserStatus').value === 'true';
  try {
    await API.adminUpdateUser(id, { role, is_active: isActive });
    closeModal('editUserModal');
    showToast('User updated successfully', 'success');
    await loadAdminUsers();
    await loadAdminStats();
  } catch (e) { showToast(e.message, 'error'); }
}

async function deleteUser(id, username) {
  if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
  try {
    await API.adminDeleteUser(id);
    showToast(`User "${username}" deleted`, 'success');
    await loadAdminUsers();
    await loadAdminStats();
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Trainers ──────────────────────────────────────────────────────
async function loadTrainers() {
  const grid = document.getElementById('trainersGrid');
  if (!grid) return;
  try {
    const trainers = allUsers.filter(u => ['trainer', 'owner', 'admin'].includes(u.role));
    if (!trainers.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state-icon">👨‍💼</div>
        <div class="empty-state-title">No trainers yet</div>
        <div class="empty-state-desc">Promote users to trainer role</div>
      </div>`;
      return;
    }
    grid.innerHTML = trainers.map(t => `
      <div class="trainer-card">
        <div class="trainer-avatar">${(t.full_name || t.username).charAt(0).toUpperCase()}</div>
        <div class="trainer-name">${t.full_name || t.username}</div>
        <div class="trainer-role"><span class="admin-role-badge role-${t.role}">${t.role}</span></div>
        ${t.email ? `<div style="font-size:0.82rem;color:var(--text-muted)">${t.email}</div>` : ''}
        <div class="trainer-actions">
          <button class="btn btn-sm btn-outline" onclick="openEditUser(${t.id}, '${t.role}', ${t.is_active})">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser(${t.id}, '${t.username}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`).join('');
  } catch (e) { console.error('Trainers error:', e); }
}

function populatePromoteSelect(users) {
  const sel = document.getElementById('promoteUserId');
  if (!sel) return;
  const regularUsers = users.filter(u => u.role === 'user');
  sel.innerHTML = '<option value="">Select a user...</option>' +
    regularUsers.map(u => `<option value="${u.id}">${u.username} (${u.full_name || 'No name'})</option>`).join('');
}

async function promoteToTrainer() {
  const id = document.getElementById('promoteUserId').value;
  if (!id) { showToast('Please select a user', 'warning'); return; }
  try {
    await API.adminUpdateUser(id, { role: 'trainer' });
    closeModal('addTrainerModal');
    showToast('User promoted to Trainer!', 'success');
    await loadAdminUsers();
    loadTrainers();
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Assign Plans ──────────────────────────────────────────────────
async function loadAssignUsers() {
  try {
    const users = await API.adminGetUsers('user');
    const sel = document.getElementById('assignUserId');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select a user...</option>' +
      users.map(u => `<option value="${u.id}">${u.username} (${u.full_name || 'No name'})</option>`).join('');
  } catch (e) { console.error('Assign users error:', e); }
}

async function loadRecentAssignedPlans() {
  try {
    const plans = await API.getMyClientPlans();
    const el = document.getElementById('recentAssignedPlans');
    if (!el) return;
    if (!plans.length) return;
    const goalIcons = { weight_loss: '🔥', weight_gain: '💪', bodybuilding: '🏆' };
    el.innerHTML = plans.slice(0, 5).map(p => `
      <div style="padding:12px 0;border-bottom:1px solid var(--border-color)">
        <div style="font-weight:700;margin-bottom:4px">${p.title}</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">
          ${goalIcons[p.goal] || ''} ${p.goal.replace('_',' ')} · ${p.plan_type} · User #${p.user_id} · ${formatDate(p.created_at)}
        </div>
      </div>`).join('');
  } catch (e) { /* trainer may not have plans yet */ }
}

function setupAdminForms() {
  // Assign Plan Form
  const assignForm = document.getElementById('assignPlanForm');
  if (assignForm) assignForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('assignAlert');
    const btn = assignForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await API.createTrainerPlan({
        user_id: parseInt(document.getElementById('assignUserId').value),
        plan_type: document.getElementById('assignPlanType').value,
        goal: document.getElementById('assignGoal').value,
        title: document.getElementById('assignTitle').value.trim(),
        notes: document.getElementById('assignNotes').value.trim() || null
      });
      assignForm.reset();
      showToast('Plan assigned successfully!', 'success');
      loadRecentAssignedPlans();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });

  // Add Article Form
  const artForm = document.getElementById('addArticleForm');
  if (artForm) artForm.addEventListener('submit', async e => {
    e.preventDefault();
    const alertEl = document.getElementById('articleAlert');
    const btn = artForm.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await API.createArticle({
        title: document.getElementById('artTitle').value.trim(),
        content: document.getElementById('artContent').value.trim(),
        category: document.getElementById('artCategory').value
      });
      closeModal('addArticleModal');
      artForm.reset();
      showToast('Article published!', 'success');
      loadAdminArticles();
    } catch (err) {
      alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    } finally { btn.disabled = false; }
  });
}

// ── Feedback ──────────────────────────────────────────────────────
async function loadAdminFeedback() {
  try {
    const feedback = await API.getAllFeedback();
    const tbody = document.getElementById('feedbackTableBody');
    if (!tbody) return;
    if (!feedback.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px">No feedback yet</td></tr>';
      return;
    }
    const stars = n => '★'.repeat(n || 0) + '☆'.repeat(5 - (n || 0));
    tbody.innerHTML = feedback.map(f => `
      <tr>
        <td>User #${f.user_id}</td>
        <td><strong>${f.subject}</strong></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.message}</td>
        <td style="color:var(--gold)">${stars(f.rating)}</td>
        <td>${formatDate(f.created_at)}</td>
        <td>${f.is_resolved
          ? '<span class="badge badge-success">Resolved</span>'
          : '<span class="badge badge-warning">Pending</span>'}</td>
        <td>
          ${!f.is_resolved ? `<button class="btn btn-sm btn-success" onclick="resolveFeedback(${f.id})">
            <i class="fas fa-check"></i> Resolve
          </button>` : '--'}
        </td>
      </tr>`).join('');
  } catch (e) { console.error('Feedback error:', e); }
}

async function resolveFeedback(id) {
  try {
    await API.resolveFeedback(id);
    showToast('Feedback marked as resolved', 'success');
    loadAdminFeedback();
    loadAdminStats();
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Articles ──────────────────────────────────────────────────────
async function loadAdminArticles() {
  try {
    allAdminArticles = await API.getArticles();
    const tbody = document.getElementById('articlesTableBody');
    if (!tbody) return;
    if (!allAdminArticles.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No articles yet</td></tr>';
      return;
    }
    tbody.innerHTML = allAdminArticles.map(a => `
      <tr>
        <td><strong>${a.title}</strong></td>
        <td><span class="badge badge-primary">${a.category || 'General'}</span></td>
        <td>${a.is_published ? '<span class="status-active">● Published</span>' : '<span class="status-inactive">● Draft</span>'}</td>
        <td>${formatDate(a.created_at)}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteArticle(${a.id}, '${a.title.replace(/'/g, "\\'")}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>`).join('');
  } catch (e) { console.error('Articles error:', e); }
}

async function deleteArticle(id, title) {
  if (!confirm(`Delete article "${title}"?`)) return;
  try {
    await API.deleteArticle(id);
    showToast('Article deleted', 'success');
    loadAdminArticles();
  } catch (e) { showToast(e.message, 'error'); }
}

// ── Helper ────────────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
