const api = {
  token: localStorage.getItem('rayuela_token') || '',
  backend: '',

  isMock() {
    return this.backend === 'mock';
  },

  markDemoUi() {
    const note = document.getElementById('demo-note');
    if (note && this.isMock()) note.classList.remove('hidden');
    document.body.classList.toggle('demo-mode', this.isMock());
  },

  async ensureBackend() {
    if (this.backend) return this.backend === 'live';
    if (typeof RayuelaMock !== 'undefined' && RayuelaMock.isForced()) {
      this.backend = 'mock';
      this.markDemoUi();
      return false;
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 900);
      const url = typeof assetUrl === 'function' ? assetUrl('/api/me') : '/api/me';
      const headers = {};
      if (this.token) headers.Authorization = `Bearer ${this.token}`;
      const res = await fetch(url, { headers, credentials: 'include', signal: ctrl.signal });
      clearTimeout(timer);
      const type = res.headers.get('content-type') || '';
      if (type.includes('application/json') || res.status === 401) {
        this.backend = 'live';
        this.markDemoUi();
        return true;
      }
    } catch {}
    this.backend = 'mock';
    this.markDemoUi();
    return false;
  },

  async request(path, options = {}) {
    const live = await this.ensureBackend();
    if (!live) {
      try {
        return await RayuelaMock.dispatch(path, options, this.token);
      } catch (err) {
        err.status = err.status || 400;
        throw err;
      }
    }
    const headers = { ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options = { ...options, body: JSON.stringify(options.body) };
    }
    const url = typeof assetUrl === 'function' ? assetUrl(path) : path;
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Error de red');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  login(email, password) {
    return this.request('/api/auth/login', { method: 'POST', body: { email, password } }).then((d) => {
      this.token = d.token;
      localStorage.setItem('rayuela_token', d.token);
      return d;
    });
  },

  async logout() {
    try { await this.request('/api/auth/logout', { method: 'POST' }); } catch {}
    this.token = '';
    localStorage.removeItem('rayuela_token');
    localStorage.removeItem('rayuela_student');
  },

  me: () => api.request('/api/me'),
  dashboard: (studentId) => api.request(`/api/dashboard?studentId=${encodeURIComponent(studentId || '')}`),
  student: (id) => api.request(`/api/students/${id}`),
  classes: (studentId) => api.request(`/api/classes?studentId=${encodeURIComponent(studentId || '')}`),
  calendar: (year, month, studentId) => api.request(`/api/calendar?year=${year}&month=${month}&studentId=${encodeURIComponent(studentId || '')}`),
  assignments: (studentId) => api.request(`/api/assignments?studentId=${encodeURIComponent(studentId || '')}`),
  assignment: (id, studentId) => api.request(`/api/assignments/${id}?studentId=${encodeURIComponent(studentId || '')}`),
  createAssignment: (form) => api.request('/api/assignments', { method: 'POST', body: form }),
  submitAssignment: (id, form) => api.request(`/api/assignments/${id}/submit`, { method: 'POST', body: form }),
  reviewSubmission: (id, sid, body) => api.request(`/api/assignments/${id}/submissions/${sid}`, { method: 'PATCH', body }),
  messages: (folder) => api.request(`/api/messages?folder=${folder}`),
  message: (id) => api.request(`/api/messages/${id}`),
  contacts: () => api.request('/api/messages/contacts'),
  sendMessage: (body) => api.request('/api/messages', { method: 'POST', body }),
  notifications: () => api.request('/api/notifications'),
  readNotif: (id) => api.request(`/api/notifications/${id}/read`, { method: 'POST' }),
  readAllNotifs: () => api.request('/api/notifications/read-all', { method: 'POST' }),
  payments: (studentId) => api.request(`/api/payments?studentId=${encodeURIComponent(studentId || '')}`),
  tutorPayments: () => api.request('/api/payments?all=1'),
  uploadReceipt: (id, form) => api.request(`/api/payments/${id}/receipt`, { method: 'POST', body: form }),
  reviewReceipt: (id, body) => api.request(`/api/receipts/${id}`, { method: 'PATCH', body }),
  schedule: (studentId) => api.request(`/api/schedule?studentId=${encodeURIComponent(studentId || '')}`),
  addSlot: (body) => api.request('/api/schedule', { method: 'POST', body }),
  updateSlot: (id, body) => api.request(`/api/schedule/${id}`, { method: 'PATCH', body }),
  deleteSlot: (id) => api.request(`/api/schedule/${id}`, { method: 'DELETE' }),
  updateAssignment: (id, form) => api.request(`/api/assignments/${id}`, { method: 'PATCH', body: form }),
  deleteAssignment: (id) => api.request(`/api/assignments/${id}`, { method: 'DELETE' }),
  events: () => api.request('/api/events'),
  createEvent: (body) => api.request('/api/events', { method: 'POST', body }),
  deleteEvent: (id) => api.request(`/api/events/${id}`, { method: 'DELETE' }),
  gallery: () => api.request('/api/gallery'),
  addGallery: (form) => api.request('/api/gallery', { method: 'POST', body: form }),
  deleteGallery: (id) => api.request(`/api/gallery/${id}`, { method: 'DELETE' }),
  roster: () => api.request('/api/roster'),
  updateStudent: (id, body) => api.request(`/api/students/${id}`, { method: 'PATCH', body }),
  changePassword: (body) => api.request('/api/auth/change-password', { method: 'POST', body }),
  resetPassword(body) {
    return this.request('/api/auth/reset-password', { method: 'POST', body }).then((d) => {
      this.token = d.token;
      localStorage.setItem('rayuela_token', d.token);
      return d;
    });
  },
  adminUsers: () => api.request('/api/admin/users'),
  adminCreateUser: (body) => api.request('/api/admin/users', { method: 'POST', body }),
  adminCreateStudent: (body) => api.request('/api/admin/students', { method: 'POST', body }),
  grades: (studentId) => api.request(`/api/grades${studentId ? `?studentId=${encodeURIComponent(studentId)}` : ''}`),
  adminUpdateUser: (id, body) => api.request(`/api/admin/users/${id}`, { method: 'PATCH', body }),
  adminDeleteUser: (id) => api.request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  adminDeleteStudent: (id) => api.request(`/api/admin/students/${id}`, { method: 'DELETE' }),
  adminMail: () => api.request('/api/admin/mail'),
};
