/* ═══════════════════════════════════════════════════════════════
   MN FITNESS - API Client
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = 'http://localhost:8000';

const API = {
  // ── Core Request ──────────────────────────────────────────────
  async request(method, path, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${path}`, opts);

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
      throw new Error('Session expired. Please login again.');
    }

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const err = await res.json();
        errMsg = err.detail || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    if (res.status === 204) return null;
    return res.json();
  },

  get: (path, auth = true) => API.request('GET', path, null, auth),
  post: (path, body, auth = true) => API.request('POST', path, body, auth),
  put: (path, body, auth = true) => API.request('PUT', path, body, auth),
  delete: (path, auth = true) => API.request('DELETE', path, null, auth),

  // ── Auth ──────────────────────────────────────────────────────
  login: (username, password) =>
    API.post('/api/auth/login', { username, password }, false),

  register: (data) =>
    API.post('/api/auth/register', data, false),

  getMe: () => API.get('/api/auth/me'),
  updateMe: (data) => API.put('/api/auth/me', data),

  // ── Progress ──────────────────────────────────────────────────
  getProgress: () => API.get('/api/progress/'),
  logProgress: (data) => API.post('/api/progress/', data),
  deleteProgress: (id) => API.delete(`/api/progress/${id}`),

  // ── Workouts ──────────────────────────────────────────────────
  getWorkoutPlans: (goal = null) => {
    const q = goal ? `?goal=${goal}` : '';
    return API.get(`/api/workouts/plans${q}`);
  },
  getWorkoutPlan: (id) => API.get(`/api/workouts/plans/${id}`),
  getWorkoutLogs: () => API.get('/api/workouts/logs'),
  logWorkout: (data) => API.post('/api/workouts/logs', data),
  deleteWorkoutLog: (id) => API.delete(`/api/workouts/logs/${id}`),

  // ── Diet ──────────────────────────────────────────────────────
  getDietPlans: (goal = null) => {
    const q = goal ? `?goal=${goal}` : '';
    return API.get(`/api/diet/plans${q}`);
  },
  getDietPlan: (id) => API.get(`/api/diet/plans/${id}`),
  getDietLogs: () => API.get('/api/diet/logs'),
  logDiet: (data) => API.post('/api/diet/logs', data),
  deleteDietLog: (id) => API.delete(`/api/diet/logs/${id}`),

  // ── Trainer ───────────────────────────────────────────────────
  getTrainerPlansForMe: () => API.get('/api/trainer/plans/for-me'),
  getMyClientPlans: () => API.get('/api/trainer/plans/my-clients'),
  createTrainerPlan: (data) => API.post('/api/trainer/plans', data),
  getTrainerUsers: () => API.get('/api/trainer/users'),

  // ── Articles ──────────────────────────────────────────────────
  getArticles: (search = null) => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return API.get(`/api/articles/${q}`, false);
  },
  getArticle: (id) => API.get(`/api/articles/${id}`, false),
  createArticle: (data) => API.post('/api/articles/', data),
  deleteArticle: (id) => API.delete(`/api/articles/${id}`),

  // ── Feedback ──────────────────────────────────────────────────
  submitFeedback: (data) => API.post('/api/feedback/', data),
  getMyFeedback: () => API.get('/api/feedback/my'),
  getAllFeedback: () => API.get('/api/feedback/all'),
  resolveFeedback: (id) => API.put(`/api/feedback/${id}/resolve`, {}),

  // ── Admin ─────────────────────────────────────────────────────
  adminGetUsers: (role = null, search = null) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params}` : '';
    return API.get(`/api/admin/users${q}`);
  },
  adminUpdateUser: (id, data) => API.put(`/api/admin/users/${id}`, data),
  adminDeleteUser: (id) => API.delete(`/api/admin/users/${id}`),
  adminGetStats: () => API.get('/api/admin/stats'),
};
