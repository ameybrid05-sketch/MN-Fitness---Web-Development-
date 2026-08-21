/* ═══════════════════════════════════════════════════════════════
   MN FITNESS - Utility Functions
   ═══════════════════════════════════════════════════════════════ */

// ── Toast Notifications ──────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}" style="color:${
      type === 'success' ? 'var(--success)' :
      type === 'error' ? 'var(--danger)' :
      type === 'warning' ? 'var(--warning)' : 'var(--info)'
    }"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Modal Helpers ─────────────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// ── Date Formatting ───────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── Goal Display ──────────────────────────────────────────────────
function goalLabel(goal) {
  const map = {
    weight_loss: '🔥 Weight Loss',
    weight_gain: '💪 Weight Gain',
    bodybuilding: '🏆 Bodybuilding'
  };
  return map[goal] || goal || 'Not Set';
}

function goalColor(goal) {
  const map = {
    weight_loss: 'var(--danger)',
    weight_gain: 'var(--success)',
    bodybuilding: 'var(--gold)'
  };
  return map[goal] || 'var(--primary)';
}

// ── BMI Calculator ────────────────────────────────────────────────
function calcBMI(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
}

function bmiCategory(bmi) {
  if (!bmi) return { label: 'Unknown', color: 'var(--text-muted)' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'var(--info)' };
  if (bmi < 25) return { label: 'Normal', color: 'var(--success)' };
  if (bmi < 30) return { label: 'Overweight', color: 'var(--warning)' };
  return { label: 'Obese', color: 'var(--danger)' };
}

// ── Auth Helpers ──────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ── Number Formatting ─────────────────────────────────────────────
function fmtNum(n, decimals = 0) {
  if (n === null || n === undefined) return '--';
  return parseFloat(n).toFixed(decimals);
}

// ── Debounce ──────────────────────────────────────────────────────
function debounce(fn, delay = 300) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ── Level Badge ───────────────────────────────────────────────────
function levelBadge(level) {
  const map = {
    beginner: '<span class="badge badge-success">Beginner</span>',
    intermediate: '<span class="badge badge-warning">Intermediate</span>',
    advanced: '<span class="badge badge-danger">Advanced</span>'
  };
  return map[level] || `<span class="badge badge-info">${level}</span>`;
}
