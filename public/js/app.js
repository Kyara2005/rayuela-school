const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const WEEKDAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

const state = {
  user: null,
  year: null,
  students: [],
  studentId: localStorage.getItem('rayuela_student') || '',
  unreadMail: 0,
  unreadNotifs: 0,
  route: location.hash.slice(1) || '/panel',
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function money(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function media(path) {
  if (!path) return '';
  return typeof assetUrl === 'function' ? assetUrl(path) : path;
}

function icon(name) {
  const paths = {
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"/>',
    book: '<path d="M4 19a2 2 0 0 1 2-2h14"/><path d="M6 17V5a2 2 0 0 1 2-2h12v16H8a2 2 0 0 0-2 2z"/>',
    chart: '<path d="M4 19h16M7 16V9M12 16V5M17 16v-6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    folder: '<path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    home: '<path d="M4 11 12 4l8 7v9H4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    send: '<path d="M4 4l16 8-16 8 3-8z"/>',
    logout: '<path d="M10 7V5a2 2 0 0 1 2-2h8v18h-8a2 2 0 0 1-2-2v-2M4 12h12M8 8l-4 4 4 4"/>',
    chev: '<path d="M8 10l4 4 4-4"/>',
    left: '<path d="M14 6 8 12l6 6"/>',
    right: '<path d="M10 6l6 6-6 6"/>',
    clip: '<rect x="8" y="4" width="10" height="16" rx="2"/><path d="M8 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10"/>',
    list: '<path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pay: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2M9.9 5.1A11 11 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-4.2 5.1M6.1 6.1C3.8 7.8 2 12 2 12a18 18 0 0 0 6.2 5.9"/>',
    image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5-11 9"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3-5.5 6-5.5s5.2 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M21 20c-.6-2.8-2.2-4.4-4-4.8"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 14h10l1-14"/>',
    camera: '<path d="M4 8h3l2-2h6l2 2h3v12H4z"/><circle cx="12" cy="14" r="3.5"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}

function filePick(name = 'file', accept = '', opts = {}) {
  const multiple = opts.multiple ? 'multiple' : '';
  const capture = opts.capture ? 'capture="environment"' : '';
  const btn = opts.label || (opts.capture ? 'Tomar foto' : opts.multiple ? 'Elegir archivos' : 'Elegir archivo');
  return `<label class="file-pick">
    <input type="file" name="${name}" ${accept ? `accept="${accept}"` : ''} ${multiple} ${capture} />
    <span class="file-pick-btn">${opts.capture ? icon('camera') + ' ' : ''}${btn}</span>
    <span class="file-pick-name">${opts.capture ? 'Cámara del celular' : 'Ningún archivo'}</span>
  </label>`;
}

function bindFilePicks(root = document) {
  $$('.file-pick input', root).forEach((input) => {
    input.addEventListener('change', () => {
      const label = input.closest('.file-pick').querySelector('.file-pick-name');
      if (!input.files?.length) {
        label.textContent = input.hasAttribute('capture') ? 'Cámara del celular' : 'Ningún archivo';
        return;
      }
      label.textContent = input.files.length > 1 ? `${input.files.length} archivos` : input.files[0].name;
    });
  });
}

function closeModal() {
  const root = $('#modal-root');
  if (root) root.innerHTML = '';
}

function openModal(html) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-bg" id="app-modal"><div class="modal">${html}</div></div>`;
  const bg = $('#app-modal');
  bg.addEventListener('click', (e) => { if (e.target === bg) closeModal(); });
  return bg;
}

function confirmModal(message, okLabel = 'Confirmar') {
  return new Promise((resolve) => {
    openModal(`
      <h3>Confirmar</h3>
      <p>${esc(message)}</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-ghost" id="m-no">Cancelar</button>
        <button type="button" class="btn btn-danger" id="m-ok">${esc(okLabel)}</button>
      </div>
    `);
    $('#m-ok').onclick = () => { closeModal(); resolve(true); };
    $('#m-no').onclick = () => { closeModal(); resolve(false); };
  });
}

function personName(p) {
  if (!p) return 'Usuario';
  return p.full_name || p.email || 'Usuario';
}

function fmtGrade(n, max = 10) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  return `${Number.isInteger(num) ? num : num.toFixed(1)} / ${max}`;
}

function bindEyes(root = document) {
  $$('[data-eye]', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.eye);
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
    });
  });
}

function isAdmin() {
  return state.user?.role === 'admin' || state.user?.email === 'admin@rayuela.edu';
}

function parseRoute() {
  const raw = (location.hash.slice(1).split('?')[0] || '/panel').replace(/\/+$/, '') || '/panel';
  const parts = raw.split('/').filter(Boolean);
  return { path: '/' + parts.join('/'), parts };
}

function go(path) {
  location.hash = path;
}

async function boot() {
  bindEyes();
  bindLogin();
  await api.ensureBackend();
  window.addEventListener('hashchange', () => {
    const { path } = parseRoute();
    if (path === '/cambiar-contrasena') return showResetFromLink();
    if (state.user) renderRoute();
  });
  if (parseRoute().path === '/cambiar-contrasena') return showResetFromLink();
  if (!api.token) return showLogin();
  try {
    await loadSession();
    if (state.user?.must_change_password) return showMustChange();
    showApp();
    await renderRoute();
  } catch {
    await api.logout();
    showLogin();
  }
}

function bindLogin() {
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#login-error');
    err.classList.add('hidden');
    try {
      const d = await api.login($('#email').value, $('#password').value);
      if (d.must_change_password || d.user?.must_change_password) {
        await loadSession();
        return showMustChange();
      }
      await loadSession();
      showApp();
      go('/panel');
      await renderRoute();
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.remove('hidden');
    }
  });
  $$('[data-fill]').forEach((b) => {
    b.addEventListener('click', () => {
      $('#email').value = b.dataset.fill;
      const mail = b.dataset.fill;
      $('#password').value = mail.startsWith('admin') ? 'admin123' : mail.startsWith('tutor') ? 'tutor123' : 'padre123';
    });
  });
  $('#reset-demo')?.addEventListener('click', () => {
    if (window.RayuelaMock) RayuelaMock.reset();
    localStorage.removeItem('rayuela_token');
    localStorage.removeItem('rayuela_student');
    location.reload();
  });
  $('#change-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('#change-error');
    err.classList.add('hidden');
    const pass = $('#new-pass').value;
    if (pass !== $('#new-pass2').value) {
      err.textContent = 'Las contraseñas no coinciden';
      err.classList.remove('hidden');
      return;
    }
    try {
      const mode = $('#change-form').dataset.mode;
      if (mode === 'reset') {
        await api.resetPassword({ token: $('#change-form').dataset.token, password: pass });
      } else {
        await api.changePassword({ password: pass });
      }
      await loadSession();
      showApp();
      go('/panel');
      await renderRoute();
    } catch (ex) {
      err.textContent = ex.message;
      err.classList.remove('hidden');
    }
  });
}

function showResetFromLink() {
  showLogin();
  $('#login-form').classList.add('hidden');
  const form = $('#change-form');
  form.classList.remove('hidden');
  form.dataset.mode = 'reset';
  form.dataset.token = new URLSearchParams(location.hash.split('?')[1] || '').get('token') || '';
}

function showMustChange() {
  showLogin();
  $('#login-form').classList.add('hidden');
  const form = $('#change-form');
  form.classList.remove('hidden');
  form.dataset.mode = 'session';
}

async function loadSession() {
  const me = await api.me();
  state.user = me.user;
  state.year = me.year;
  state.students = me.students || [];
  if (!state.studentId || !state.students.some((s) => s.id === state.studentId)) {
    state.studentId = state.students[0]?.id || '';
    if (state.studentId) localStorage.setItem('rayuela_student', state.studentId);
  }
  const dash = await api.dashboard(state.studentId);
  state.unreadMail = dash.unreadMessages || 0;
  state.unreadNotifs = dash.unreadNotifs || 0;
}

function showLogin() {
  $('#login-root').classList.remove('hidden');
  $('#app-root').classList.add('hidden');
  $('#login-form').classList.remove('hidden');
  $('#change-form').classList.add('hidden');
}

function showApp() {
  $('#login-root').classList.add('hidden');
  $('#app-root').classList.remove('hidden');
  renderChrome();
}

function renderChrome() {
  const u = state.user;
  const kid = state.students.find((s) => s.id === state.studentId);
  const showKidSwitch = u.role === 'parent' && state.students.length > 1;
  const kidName = kid ? `${kid.first_name} ${kid.last_name}` : '';
  const kidChip = u.role === 'parent' && kid ? (showKidSwitch ? `
    <div class="kid-switch" id="kid-switch">
      <span class="avatar">${initials(kid.first_name + ' ' + kid.last_name)}</span>
      <button type="button" class="kid-toggle" id="kid-toggle">${esc(kidName)} ${icon('chev')}</button>
      <div class="kid-menu hidden" id="kid-menu">
        ${state.students.map((s) => `<button type="button" data-kid="${s.id}" class="${s.id === state.studentId ? 'active' : ''}">${esc(s.first_name)} ${esc(s.last_name)}<div class="meta">${esc(s.grade || '')} ${esc(s.section || '')}</div></button>`).join('')}
      </div>
    </div>` : `<span class="year-pill">${esc(kidName)}</span>`) : '';

  $('#topbar').innerHTML = `
    <button class="menu-toggle" type="button" id="menu-btn">${icon('menu')}</button>
    <a class="topbar-brand" href="#/panel"><img src="${media('assets/logo.png')}" alt="" /> La Rayuela</a>
    <span class="year-pill">${icon('calendar')} ${esc(state.year?.name || '')}</span>
    ${api.isMock() ? '<span class="year-pill demo-pill">Demo local</span>' : ''}
    ${kidChip}
    <div class="top-actions">
      <button class="icon-btn" data-go="/correo" title="Correo">${icon('mail')}${state.unreadMail ? `<span class="badge">${state.unreadMail}</span>` : ''}</button>
      <button class="icon-btn" data-go="/notificaciones" title="Notificaciones">${icon('bell')}${state.unreadNotifs ? `<span class="badge">${state.unreadNotifs}</span>` : ''}</button>
      <div class="hello-user">
        <div class="avatar">${initials(u.full_name)}</div>
        <span>${esc(u.full_name)}<small>${u.role === 'admin' ? 'Administración' : u.role === 'tutor' ? 'Tutor' : 'Padre de familia'}</small></span>
      </div>
    </div>
  `;

  const parentNav = [
    { head: 'Panel principal', ico: 'home', color: 'blue', links: [{ href: '/panel', label: 'Inicio', ico: 'home' }] },
    { head: 'Información del estudiante', ico: 'user', color: 'pink', links: [{ href: '/estudiante', label: 'Ficha del alumno', ico: 'user' }] },
    { head: 'Académico', ico: 'book', color: 'lilac', links: [
      { href: '/horario', label: 'Horario', ico: 'clock' },
      { href: '/clases', label: 'Mis clases', ico: 'folder' },
      { href: '/tareas', label: 'Tareas', ico: 'file' },
      { href: '/calificaciones', label: 'Calificaciones', ico: 'chart' },
      { href: '/calendario', label: 'Calendario', ico: 'calendar' },
      { href: '/eventos', label: 'Eventos', ico: 'list' },
    ]},
    { head: 'Comunidad', ico: 'image', color: 'green', links: [
      { href: '/galeria', label: 'Galería', ico: 'image' },
      { href: '/correo', label: 'Correo', ico: 'mail' },
      { href: '/notificaciones', label: 'Notificaciones', ico: 'bell' },
    ]},
    { head: 'Pagos', ico: 'pay', color: 'orange', links: [{ href: '/pagos', label: 'Colegiaturas', ico: 'pay' }] },
  ];

  const tutorNav = [
    { head: 'Panel principal', ico: 'home', color: 'blue', links: [{ href: '/panel', label: 'Inicio', ico: 'home' }] },
    { head: 'Mis alumnos', ico: 'users', color: 'pink', links: [{ href: '/alumnos', label: 'Lista por estudiante', ico: 'users' }] },
    { head: 'Académico', ico: 'book', color: 'lilac', links: [
      { href: '/clases', label: 'Mis clases', ico: 'folder' },
      { href: '/horario', label: 'Horario', ico: 'clock' },
      { href: '/tareas', label: 'Tareas', ico: 'file' },
      { href: '/calificaciones', label: 'Calificaciones', ico: 'chart' },
      { href: '/calendario', label: 'Calendario', ico: 'calendar' },
      { href: '/eventos', label: 'Eventos', ico: 'list' },
    ]},
    { head: 'Comunidad', ico: 'image', color: 'green', links: [
      { href: '/galeria', label: 'Galería', ico: 'image' },
      { href: '/correo', label: 'Correo', ico: 'mail' },
      { href: '/notificaciones', label: 'Notificaciones', ico: 'bell' },
    ]},
    { head: 'Pagos', ico: 'pay', color: 'orange', links: [{ href: '/pagos', label: 'Comprobantes', ico: 'pay' }] },
  ];

  const adminNav = [
    { head: 'Panel principal', ico: 'home', color: 'blue', links: [{ href: '/panel', label: 'Inicio', ico: 'home' }] },
    { head: 'Registro', ico: 'users', color: 'pink', links: [
      { href: '/admin/usuarios', label: 'Usuarios (padres y tutores)', ico: 'users' },
      { href: '/admin/estudiantes', label: 'Estudiantes', ico: 'user' },
    ]},
    { head: 'Escuela', ico: 'book', color: 'lilac', links: [
      { href: '/eventos', label: 'Eventos', ico: 'list' },
      { href: '/galeria', label: 'Galería', ico: 'image' },
      { href: '/alumnos', label: 'Alumnos', ico: 'users' },
      { href: '/calificaciones', label: 'Calificaciones', ico: 'chart' },
    ]},
    { head: 'Comunicación', ico: 'mail', color: 'green', links: [
      { href: '/correo', label: 'Correo', ico: 'mail' },
      { href: '/admin/correos', label: 'Enlaces enviados', ico: 'send' },
    ]},
  ];

  const nav = isAdmin() ? adminNav : u.role === 'tutor' ? tutorNav : parentNav;
  const route = parseRoute().path;
  $('#sidebar').innerHTML = `
    <div class="brand"><img src="${media('assets/logo.png')}" alt="La Rayuela School" /></div>
    ${nav.map((g) => `
      <div class="nav-group">
        <div class="nav-head"><span class="ico ico-${g.color}">${icon(g.ico)}</span>${g.head.toUpperCase()}<span class="chev">${icon('chev')}</span></div>
        <div class="nav-sub">
          ${g.links.map((l) => `<a class="nav-link ${route.startsWith(l.href) ? 'active' : ''}" href="#${l.href}">${icon(l.ico)} ${l.label}</a>`).join('')}
        </div>
      </div>
    `).join('')}
    <button class="btn btn-ghost btn-block" id="logout-btn" style="margin-top:8px">${icon('logout')} Cerrar sesión</button>
  `;

  const toggle = $('#kid-toggle');
  const menu = $('#kid-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    $$('[data-kid]', menu).forEach((b) => b.addEventListener('click', async () => {
      state.studentId = b.dataset.kid;
      localStorage.setItem('rayuela_student', state.studentId);
      menu.classList.add('hidden');
      await renderRoute();
    }));
    document.addEventListener('click', (e) => {
      if (!$('#kid-switch')?.contains(e.target)) menu.classList.add('hidden');
    }, { once: true });
  }
  $('#logout-btn')?.addEventListener('click', async () => {
    await api.logout();
    showLogin();
  });
  $('#menu-btn')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
}

async function renderRoute() {
  if (!state.user) return;
  const { path, parts } = parseRoute();
  renderChrome();
  const main = $('#main');
  main.innerHTML = `<p class="empty">Cargando…</p>`;
  try {
    if (path === '/panel' || path === '/') await viewDashboard(main);
    else if (path === '/estudiante') await viewStudent(main, state.studentId);
    else if (parts[0] === 'alumnos' && parts[1]) await viewStudent(main, parts[1]);
    else if (path === '/alumnos') await viewRoster(main);
    else if (path === '/horario') await viewSchedule(main);
    else if (path === '/clases') await viewClasses(main);
    else if (path === '/tareas/nueva') await viewNewTask(main);
    else if (parts[0] === 'tareas' && parts[1] && parts[2] === 'editar') await viewEditTask(main, parts[1]);
    else if (parts[0] === 'tareas' && parts[1]) await viewTask(main, parts[1]);
    else if (path === '/tareas') await viewTasks(main);
    else if (path === '/calendario') await viewCalendar(main);
    else if (path === '/eventos') await viewEvents(main);
    else if (path === '/galeria') await viewGallery(main);
    else if (path === '/pagos') await viewPayments(main);
    else if (path === '/correo/nuevo') await viewCompose(main);
    else if (parts[0] === 'correo' && parts[1]) await viewMailDetail(main, parts[1]);
    else if (path === '/correo') await viewMail(main);
    else if (path === '/notificaciones') await viewNotifs(main);
    else if (parts[0] === 'calificaciones' && parts[1]) await viewGrades(main, parts[1]);
    else if (path === '/calificaciones') await viewGrades(main);
    else if (path === '/admin/usuarios') await viewAdminUsers(main);
    else if (path === '/admin/estudiantes') await viewAdminStudents(main);
    else if (path === '/admin/correos') await viewAdminMail(main);
    else main.innerHTML = `<div class="empty">No encontramos esa sección.</div>`;
  } catch (err) {
    main.innerHTML = `<div class="empty">${esc(err.message)}</div>`;
  }
  $('#sidebar').classList.remove('open');
}

function title(htmlRight, heading, sub) {
  return `<div class="page-title"><div><h2>${heading}</h2>${sub ? `<p>${sub}</p>` : ''}</div><div>${htmlRight || ''}</div></div>`;
}

async function viewDashboard(main) {
  if (state.user.role === 'tutor' || isAdmin()) {
    const roster = await api.roster();
    const d = await api.dashboard();
    state.unreadMail = d.unreadMessages;
    state.unreadNotifs = d.unreadNotifs;
    renderChrome();
    main.innerHTML = `
      ${title('', 'Panel del tutor', 'Cada tarjeta es un estudiante. Entra para ver alergias, familia y avances.')}
      <div class="grid-3" style="margin-bottom:16px">
        <div class="card stat"><div class="bubble" style="background:var(--blue)">${icon('mail')}</div><div><h3>${d.unreadMessages}</h3><span>Correos sin leer</span></div></div>
        <div class="card stat"><div class="bubble" style="background:var(--chip-bell)">${icon('bell')}</div><div><h3>${d.unreadNotifs}</h3><span>Notificaciones</span></div></div>
        <div class="card stat"><div class="bubble" style="background:var(--lilac)">${icon('users')}</div><div><h3>${roster.length}</h3><span>Alumnos a cargo</span></div></div>
      </div>
      ${rosterCards(roster)}
    `;
    bindStudentDeletes(main, () => viewDashboard(main));
    return;
  }
  const d = await api.dashboard(state.studentId);
  let grades = null;
  try { grades = await api.grades(state.studentId); } catch {}
  state.unreadMail = d.unreadMessages;
  state.unreadNotifs = d.unreadNotifs;
  renderChrome();
  const name = d.student ? `${d.student.first_name} ${d.student.last_name}` : state.user.full_name;
  main.innerHTML = `
    ${title('', 'Panel principal', `Resumen de ${esc(name)} · ciclo ${esc(state.year?.name || '')}`)}
    <div class="grid-3">
      <div class="card stat"><div class="bubble" style="background:var(--blue)">${icon('mail')}</div><div><h3>${d.unreadMessages}</h3><span>Correos sin leer</span></div></div>
      <div class="card stat"><div class="bubble" style="background:var(--chip-bell)">${icon('bell')}</div><div><h3>${d.unreadNotifs}</h3><span>Notificaciones</span></div></div>
      <div class="card stat"><div class="bubble" style="background:var(--orange)">${icon('pay')}</div><div><h3>${d.paymentsSummary ? d.paymentsSummary.pagado + '/' + d.paymentsSummary.total : '—'}</h3><span>Colegiaturas al corriente</span></div></div>
    </div>
    ${grades ? `<a class="grade-avg" href="#/calificaciones" style="text-decoration:none;color:inherit;margin-top:16px">
      <div>
        <p class="meta" style="margin:0">Promedio actual del año lectivo</p>
        <h3 style="margin:4px 0 0">${esc(name)}</h3>
      </div>
      <strong>${grades.year_average != null ? grades.year_average.toFixed(1) : '—'}</strong>
    </a>` : ''}
    <div class="grid-2" style="margin-top:16px">
      <div class="card">
        <h3>Próximas entregas</h3>
        <div class="list">
          ${d.upcoming.length ? d.upcoming.map((a) => `
            <a class="list-item" href="#/tareas/${a.id}">
              <span class="dot" style="background:${a.class?.color || '#2aa3e0'}"></span>
              <div>
                <h4>${esc(a.title)}</h4>
                <p>${esc(a.class?.subject || '')} · entrega ${fmtDate(a.due_date)}</p>
              </div>
            </a>`).join('') : '<p class="empty">No hay tareas próximas.</p>'}
        </div>
      </div>
      <div class="card">
        <h3>Clases y profesores</h3>
        <div class="list">
          ${(d.classes || []).map((c) => `
            <div class="list-item">
              <span class="dot" style="background:${c.color}"></span>
              <div>
                <h4>${esc(c.subject)}</h4>
                <p>${esc(c.tutor?.full_name || '')} · ${esc(c.room || '')}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

async function viewStudent(main, studentId) {
  const info = await api.student(studentId || state.studentId);
  const s = info.student;
  const editable = info.can_edit;
  const admin = isAdmin();
  main.innerHTML = `
    ${title(state.user.role === 'tutor' || admin ? `<a class="btn btn-ghost" href="#/alumnos">Volver a alumnos</a>` : '', 'Ficha del estudiante', `${esc(s.grade)} ${esc(s.section || '')}`)}
    <div class="grid-2">
      <div class="card">
        <div class="teacher" style="margin-bottom:16px">
          <div class="av" style="width:64px;height:64px;font-size:1.3rem">${initials(s.first_name + ' ' + s.last_name)}</div>
          <div>
            <h2 style="margin:0">${esc(s.first_name)} ${esc(s.last_name)}</h2>
            <p class="meta">${esc(s.grade)} ${esc(s.section || '')} · ciclo ${esc(info.year.name)}</p>
          </div>
        </div>
        ${editable ? `
          <form id="ficha-form">
            ${admin ? `
              <div class="field"><label>Nombre</label><input name="first_name" value="${esc(s.first_name)}" required /></div>
              <div class="field"><label>Apellidos</label><input name="last_name" value="${esc(s.last_name)}" required /></div>
              <div class="field"><label>Grado</label><input name="grade" value="${esc(s.grade || '')}" /></div>
              <div class="field"><label>Sección</label><input name="section" value="${esc(s.section || '')}" /></div>
              <div class="field"><label>Nacimiento</label><input type="date" name="birth_date" value="${esc(s.birth_date || '')}" /></div>
            ` : `<div class="field"><label>Nacimiento</label><input value="${esc(s.birth_date || '')}" disabled /></div>`}
            <div class="field"><label>Tipo de sangre</label><input name="blood_type" value="${esc(s.blood_type || '')}" /></div>
            <div class="field"><label>Contacto de emergencia</label><input name="emergency_contact" value="${esc(s.emergency_contact || '')}" /></div>
            <div class="field"><label>Alergias</label><textarea name="allergies" placeholder="Alimentos, medicamentos, etc.">${esc(s.allergies || '')}</textarea></div>
            <div class="field"><label>Discapacidad</label><textarea name="disability" placeholder="Si aplica">${esc(s.disability || '')}</textarea></div>
            <div class="field"><label>Problema o nota particular</label><textarea name="special_notes" placeholder="Algo que profesores y escuela deban saber">${esc(s.special_notes || '')}</textarea></div>
            <button class="btn btn-primary" type="submit">Guardar ficha</button>
            ${admin ? `<button class="btn btn-danger" type="button" id="del-student" style="margin-left:8px">Dar de baja</button>` : ''}
          </form>
        ` : `
          <p><strong>Nacimiento:</strong> ${fmtDate(s.birth_date)}</p>
          <p><strong>Tipo de sangre:</strong> ${esc(s.blood_type || '—')}</p>
          <p><strong>Emergencia:</strong> ${esc(s.emergency_contact || '—')}</p>
          <div class="${s.allergies ? 'alert-line' : 'warn-line'}"><strong>Alergias:</strong> ${esc(s.allergies || 'Ninguna registrada')}</div>
          <div class="${s.disability ? 'alert-line' : 'warn-line'}"><strong>Discapacidad:</strong> ${esc(s.disability || 'Ninguna registrada')}</div>
          <p><strong>Notas:</strong> ${esc(s.special_notes || '—')}</p>
        `}
        <h4>Familia</h4>
        ${info.parents.map((p) => `<p>${esc(p.full_name)} · ${esc(p.relationship)} · ${esc(p.email)}</p>`).join('')}
      </div>
      <div class="card">
        <h3>Profesores</h3>
        ${info.classes.map((c) => `
          <div class="teacher">
            <div class="av">${initials(c.tutor?.full_name)}</div>
            <div>
              <strong>${esc(c.tutor?.full_name || '')}</strong>
              <div class="meta">${esc(c.subject)} · ${esc(c.room || '')}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
  $('#ficha-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.updateStudent(s.id, Object.fromEntries(fd.entries()));
      toast('Ficha actualizada');
      viewStudent(main, s.id);
    } catch (ex) { toast(ex.message); }
  });
  $('#del-student')?.addEventListener('click', async () => {
    const ok = await confirmModal(`¿Dar de baja a ${s.first_name} ${s.last_name}? Solo administración puede hacerlo.`, 'Dar de baja');
    if (!ok) return;
    try {
      await api.adminDeleteStudent(s.id);
      toast('Estudiante dado de baja');
      go('/admin/estudiantes');
    } catch (ex) { toast(ex.message); }
  });
}

async function viewSchedule(main) {
  const data = await api.schedule(state.user.role === 'parent' ? state.studentId : '');
  const canEdit = state.user.role === 'tutor' || isAdmin();
  const classes = canEdit ? await api.classes() : [];
  const label = data.student && state.user.role === 'parent' ? `${data.student.first_name} ${data.student.last_name}` : 'Horario semanal';
  main.innerHTML = `
    ${title('', 'Horario', label)}
    <div class="schedule">
      ${data.days.map((d) => `
        <div class="day-col">
          <h3>${d.name}</h3>
          ${d.slots.length ? d.slots.map((s) => `
            <div class="slot" style="border-left-color:${s.class.color}">
              <time>${s.start_time} – ${s.end_time}</time>
              <strong>${esc(s.class.subject)}</strong>
              <div class="meta">${esc(s.class.tutor?.full_name || '')}</div>
              <div class="meta">${esc(s.room || s.class.room || '')}</div>
              ${canEdit ? `<div class="slot-actions">
                <button class="btn btn-ghost" data-edit-slot="${s.id}" data-weekday="${s.weekday}" data-start="${s.start_time}" data-end="${s.end_time}" data-room="${esc(s.room || '')}">Editar</button>
                <button class="btn btn-danger" data-del-slot="${s.id}">Quitar</button>
              </div>` : ''}
            </div>`).join('') : '<p class="empty">Sin clases</p>'}
        </div>`).join('')}
    </div>
    ${canEdit ? `
      <div class="card" style="margin-top:18px;max-width:640px">
        <h3>Agregar o mover un bloque</h3>
        <form id="slot-form">
          <div class="field"><label>Clase</label><select name="class_id">${classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label>Día</label><select name="weekday">${['Lunes','Martes','Miércoles','Jueves','Viernes'].map((n,i) => `<option value="${i+1}">${n}</option>`).join('')}</select></div>
          <div class="field"><label>Inicio</label><input type="time" name="start_time" required /></div>
          <div class="field"><label>Fin</label><input type="time" name="end_time" required /></div>
          <div class="field"><label>Aula</label><input name="room" placeholder="Opcional" /></div>
          <button class="btn btn-primary" type="submit">Guardar en el horario</button>
        </form>
      </div>` : ''}
  `;
  $('#slot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.addSlot(Object.fromEntries(fd.entries()));
      toast('Horario actualizado');
      viewSchedule(main);
    } catch (ex) { toast(ex.message); }
  });
  $$('[data-del-slot]').forEach((b) => b.onclick = async () => {
    const ok = await confirmModal('¿Quitar este bloque del horario?', 'Quitar');
    if (!ok) return;
    await api.deleteSlot(b.dataset.delSlot);
    viewSchedule(main);
  });
  $$('[data-edit-slot]').forEach((b) => b.onclick = () => {
    openModal(`
      <h3>Editar bloque</h3>
      <form id="edit-slot-form">
        <div class="field"><label>Día</label>
          <select name="weekday">${['Lunes','Martes','Miércoles','Jueves','Viernes'].map((n,i) => `<option value="${i+1}" ${String(i+1) === String(b.dataset.weekday) ? 'selected' : ''}>${n}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Hora de inicio</label><input type="time" name="start_time" value="${esc(b.dataset.start)}" required /></div>
        <div class="field"><label>Hora de fin</label><input type="time" name="end_time" value="${esc(b.dataset.end)}" required /></div>
        <div class="field"><label>Aula</label><input name="room" value="${esc(b.dataset.room || '')}" /></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="m-no">Cancelar</button>
          <button class="btn btn-primary" type="submit">Guardar</button>
        </div>
      </form>
    `);
    $('#m-no').onclick = closeModal;
    $('#edit-slot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await api.updateSlot(b.dataset.editSlot, Object.fromEntries(fd.entries()));
        closeModal();
        toast('Bloque actualizado');
        viewSchedule(main);
      } catch (ex) { toast(ex.message); }
    });
  });
}

async function viewClasses(main) {
  const classes = await api.classes(state.studentId);
  main.innerHTML = `
    ${title('', state.user.role === 'tutor' ? 'Mis clases' : 'Mis clases', 'Materias, aula y profesor titular')}
    <div class="class-grid">
      ${classes.map((c) => `
        <div class="class-card">
          <span class="pill pill-blue">${esc(c.grade || '')} ${esc(c.section || '')}</span>
          <h3>${esc(c.subject)}</h3>
          <p class="meta">${esc(c.name)} · ${esc(c.room || 'Aula por confirmar')}</p>
          <div class="teacher">
            <div class="av">${initials(c.tutor?.full_name)}</div>
            <div>
              <strong>${esc(c.tutor?.full_name || '')}</strong>
              <div class="meta">${c.student_count || 0} alumnos</div>
            </div>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function statusPill(status) {
  const map = {
    publicada: 'pill-blue', pendiente: 'pill-gray', entregada: 'pill-green', revisada: 'pill-mint',
    tardia: 'pill-orange', pagado: 'pill-green', en_revision: 'pill-orange', vencido: 'pill-red',
    rechazado: 'pill-red', aprobado: 'pill-green',
  };
  const label = {
    publicada: 'Publicada', pendiente: 'Pendiente', entregada: 'Entregada', revisada: 'Revisada',
    tardia: 'Tardía', pagado: 'Pagado', en_revision: 'En revisión', vencido: 'Vencido',
    rechazado: 'Rechazado', aprobado: 'Aprobado',
  };
  return `<span class="pill ${map[status] || 'pill-gray'}">${label[status] || status}</span>`;
}

async function viewTasks(main) {
  const list = await api.assignments(state.studentId);
  const extra = state.user.role === 'tutor'
    ? `<a class="btn btn-primary" href="#/tareas/nueva">${icon('plus')} Nueva tarea</a>`
    : '';
  main.innerHTML = `
    ${title(extra, 'Tareas', 'Actividades enviadas por los profesores. Aquí puedes subir la evidencia.')}
    ${list.length ? list.map((a) => `
      <div class="task-card">
        <a href="#/tareas/${a.id}" style="text-decoration:none;color:inherit">
          <div class="meta"><span class="pill" style="background:${a.class?.color}22;color:${a.class?.color}">${esc(a.class?.subject || '')}</span> ${statusPill(a.submission?.status || 'pendiente')}</div>
          <h3 style="margin:8px 0 4px">${esc(a.title)}</h3>
          <p class="meta">Profesor: ${esc(a.tutor?.full_name || '')} · Entrega ${fmtDate(a.due_date)}${a.submission?.grade != null ? ` · Nota ${fmtGrade(a.submission.grade, a.max_score)}` : ''}</p>
        </a>
        <div>${state.user.role === 'tutor' || isAdmin() ? `<a class="btn btn-ghost" href="#/tareas/${a.id}/editar">${icon('pencil')} Editar</a>` : ''}</div>
      </div>`).join('') : '<div class="card empty">Aún no hay tareas.</div>'}
  `;
}

async function viewTask(main, id) {
  const a = await api.assignment(id, state.studentId);
  const isParent = state.user.role === 'parent';
  const isTutor = state.user.role === 'tutor';
  const maxFiles = a.max_files || 1;
  const filesHtml = (list) => (list || []).map((f) => `<p><a href="${media(f.url)}" target="_blank">${esc(f.name || 'archivo')}</a></p>`).join('');
  main.innerHTML = `
    ${title(`<a class="btn btn-ghost" href="#/tareas">Volver</a>${isTutor || isAdmin() ? ` <a class="btn btn-ghost" href="#/tareas/${a.id}/editar">${icon('pencil')} Editar</a>` : ''}`, esc(a.title), `${esc(a.class?.name || '')} · ${esc(a.tutor?.full_name || '')}`)}
    <div class="grid-2">
      <div class="card">
        <p>${esc(a.description || 'Sin descripción.')}</p>
        <p class="meta">Fecha límite: <strong>${fmtDateTime(a.due_date)}</strong> · Hasta ${maxFiles} archivo(s) · Sobre ${a.max_score || 10}</p>
        ${filesHtml(a.attachments) || (a.attachment_url ? `<p><a href="${media(a.attachment_url)}" target="_blank">${esc(a.attachment_name || 'Material del profesor')}</a></p>` : '')}
        ${isParent ? `
          <hr style="border:0;border-top:1px solid var(--line);margin:18px 0" />
          <h3>Tu entrega</h3>
          ${a.submission ? `<p>${statusPill(a.submission.status)} ${a.submission.grade != null ? `<strong>Nota ${fmtGrade(a.submission.grade, a.max_score)}</strong>` : ''}</p>
            ${filesHtml(a.submission.files)}
            ${a.submission.tutor_feedback ? `<p><strong>Comentario del tutor:</strong> ${esc(a.submission.tutor_feedback)}</p>` : ''}
          ` : '<p class="meta">Todavía no hay archivo.</p>'}
          <form id="submit-form">
            <p class="meta">Puedes subir hasta ${maxFiles} archivo(s). En el celular también puedes tomar la foto.</p>
            <div class="file-actions">
              ${filePick('files', '', { multiple: true, label: 'Elegir archivos' })}
              ${filePick('camera', 'image/*', { capture: true })}
            </div>
            <div class="field"><label>Notas para el profesor</label><textarea name="notes" placeholder="Opcional">${esc(a.submission?.notes || '')}</textarea></div>
            <button class="btn btn-primary" type="submit">Subir entrega</button>
          </form>
        ` : ''}
      </div>
      ${isTutor || isAdmin() ? `
        <div class="card">
          <h3>Entregas (${a.submission_count || 0})</h3>
          ${(a.submissions || []).map((s) => `
            <div class="list-item" style="flex-direction:column;align-items:stretch">
              <div><strong>${esc(s.student?.first_name)} ${esc(s.student?.last_name)}</strong> ${statusPill(s.status)} ${s.grade != null ? `<span class="pill pill-mint">Nota ${fmtGrade(s.grade, a.max_score)}</span>` : ''}</div>
              <p class="meta">${fmtDateTime(s.submitted_at)}</p>
              ${filesHtml(s.files)}
              <form data-review="${s.id}">
                <div class="field"><label>Nota (0 a ${a.max_score || 10})</label><input type="number" name="grade" min="0" max="${a.max_score || 10}" step="0.1" value="${s.grade != null ? s.grade : ''}" required /></div>
                <div class="field"><label>Retroalimentación</label><textarea name="feedback">${esc(s.tutor_feedback || '')}</textarea></div>
                <button class="btn btn-green" type="submit">Guardar nota y marcar revisada</button>
              </form>
            </div>`).join('') || '<p class="empty">Nadie ha entregado aún.</p>'}
        </div>` : `
        <div class="card">
          <h3>Profesor</h3>
          <div class="teacher"><div class="av">${initials(a.tutor?.full_name)}</div><div><strong>${esc(a.tutor?.full_name || '')}</strong><div class="meta">${esc(a.class?.subject || '')}</div></div></div>
        </div>`}
    </div>
  `;
  bindFilePicks(main);
  $('#submit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData();
    const filesInput = e.target.querySelector('input[name="files"]');
    const camInput = e.target.querySelector('input[name="camera"]');
    [...(filesInput?.files || [])].forEach((f) => fd.append('files', f));
    [...(camInput?.files || [])].forEach((f) => fd.append('camera', f));
    fd.append('notes', e.target.notes.value);
    fd.append('studentId', state.studentId);
    try {
      await api.submitAssignment(id, fd);
      toast('Entrega enviada');
      viewTask(main, id);
    } catch (ex) { toast(ex.message); }
  });
  $$('[data-review]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.reviewSubmission(id, form.dataset.review, {
          feedback: form.feedback.value,
          status: 'revisada',
          grade: form.grade.value,
        });
        toast('Calificación guardada');
        viewTask(main, id);
      } catch (ex) { toast(ex.message); }
    });
  });
}

async function viewNewTask(main) {
  const classes = await api.classes();
  main.innerHTML = `
    ${title(`<a class="btn btn-ghost" href="#/tareas">Cancelar</a>`, 'Nueva tarea', 'Se notificará a los padres del grupo')}
    <form class="card" id="new-task" style="max-width:640px">
      <div class="field"><label>Clase</label><select name="class_id">${classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Título</label><input name="title" required /></div>
      <div class="field"><label>Descripción</label><textarea name="description"></textarea></div>
      <div class="field"><label>Fecha de entrega</label><input type="datetime-local" name="due_date" required /></div>
      <div class="field"><label>Archivos máximos que puede subir el alumno (1 a 10)</label><input type="number" name="max_files" min="1" max="10" value="3" /></div>
      <div class="field"><label>Nota máxima</label><input type="number" name="max_score" min="1" max="100" value="10" step="0.5" /></div>
      <div class="field"><label>Peso en el promedio</label><input type="number" name="weight" min="0.1" max="10" value="1" step="0.1" /></div>
      <div class="field"><label>Material (varios archivos)</label>${filePick('files', '', { multiple: true })}</div>
      <button class="btn btn-primary" type="submit">Publicar</button>
    </form>
  `;
  bindFilePicks(main);
  $('#new-task').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const row = await api.createAssignment(fd);
      toast('Tarea publicada');
      go(`/tareas/${row.id}`);
    } catch (ex) { toast(ex.message); }
  });
}

async function viewCalendar(main) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  async function paint() {
    const data = await api.calendar(year, month, state.studentId);
    const first = new Date(year, month - 1, 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();
    const prevDays = new Date(year, month - 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: prevDays - startWeekday + i + 1, out: true, date: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, out: false, date, events: data.events.filter((e) => e.event_date === date) });
    }
    while (cells.length % 7) cells.push({ day: cells.filter((c) => c.out && !c.date).length + 1, out: true, date: null });
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    main.innerHTML = `
      ${title('', 'Calendario', 'Tareas, eventos y pagos del mes')}
      <div class="cal-wrap">
        <div class="cal-head">
          <button class="cal-nav" id="prev">${icon('left')}</button>
          <div class="cal-month">${MONTHS[month - 1]}, ${year}</div>
          <button class="cal-nav" id="next">${icon('right')}</button>
        </div>
        <div class="cal-week">${WEEKDAYS.map((w) => `<div>${w}</div>`).join('')}</div>
        <div class="cal-grid">
          ${cells.map((c) => {
            const types = new Set((c.events || []).map((e) => e.event_type));
            const selected = c.date === today;
            return `<div class="cal-cell ${c.out ? 'out' : ''} ${selected ? 'selected today' : ''}" data-date="${c.date || ''}">
              <div class="cal-num"><span>${c.day}</span></div>
              <div class="cal-icons">
                <span class="${types.has('tarea') ? 'on tarea' : ''}">${icon('file')}</span>
                <span class="${types.has('evento') || types.has('clase') ? 'on evento' : ''}">${icon('clip')}</span>
                <span class="${types.has('reunion') || types.has('feriado') ? 'on reunion' : ''}">${icon('list')}</span>
                <span class="${types.has('pago') ? 'on pago' : ''}">${icon('folder')}</span>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="day-panel card" id="day-panel"><p class="empty">Elige un día para ver el detalle.</p></div>
    `;
    $('#prev').onclick = () => { month--; if (month < 1) { month = 12; year--; } paint(); };
    $('#next').onclick = () => { month++; if (month > 12) { month = 1; year++; } paint(); };
    $$('.cal-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const date = cell.dataset.date;
        if (!date) return;
        $$('.cal-cell').forEach((x) => x.classList.remove('selected'));
        cell.classList.add('selected');
        const events = data.events.filter((e) => e.event_date === date);
        $('#day-panel').innerHTML = `<h3>${fmtDate(date)}</h3>${
          events.length ? events.map((e) => `
            <div class="list-item">
              <span class="dot" style="background:${e.event_type === 'tarea' ? '#42a5f5' : e.event_type === 'pago' ? '#ffa726' : '#66bb6a'}"></span>
              <div>
                <h4>${esc(e.title)}</h4>
                <p>${esc(e.description || e.event_type)}</p>
                ${e.assignment_id ? `<a href="#/tareas/${e.assignment_id}">Abrir tarea</a>` : ''}
              </div>
            </div>`).join('') : '<p class="empty">Sin actividades este día.</p>'
        }`;
      });
    });
    const todayCell = $(`.cal-cell[data-date="${today}"]`);
    if (todayCell) todayCell.click();
  }
  await paint();
}

async function viewPayments(main) {
  if (state.user.role === 'tutor') return viewTutorPayments(main);
  const data = await api.payments(state.studentId);
  const paid = data.payments.filter((p) => p.status === 'pagado').length;
  main.innerHTML = `
    ${title('', 'Seguimiento de pagos', `Periodo ${esc(data.year.name)} · septiembre a junio · ${esc(data.student?.first_name || '')}`)}
    <div class="card" style="margin-bottom:16px">
      <strong>${paid} de ${data.payments.length}</strong> colegiaturas cubiertas.
      Sube el comprobante de cada mes; un tutor lo validará.
    </div>
    <div class="pay-grid">
      ${data.payments.map((p) => `
        <div class="pay-card ${p.status}">
          <h3>${esc(p.month_name)} ${p.year}</h3>
          <div class="amount">${money(p.amount)}</div>
          <p class="meta">Vence ${fmtDate(p.due_date)}</p>
          <p>${statusPill(p.status)}</p>
          ${p.receipts?.length ? `<p class="meta">${esc(p.receipts.at(-1).file_name || 'Comprobante')} · ${esc(p.receipts.at(-1).status)}</p>` : ''}
          ${p.status !== 'pagado' ? `
            <form data-pay="${p.id}">
              ${filePick('file', '.pdf,image/*')}
              <input name="notes" placeholder="Nota (opcional)" style="margin:8px 0;width:100%;padding:8px;border:1px solid #d9e4ef;border-radius:8px" />
              <button class="btn btn-primary btn-block" type="submit">Subir comprobante</button>
            </form>` : '<p class="meta">Mes cubierto</p>'}
        </div>`).join('')}
    </div>
  `;
  bindFilePicks(main);
  $$('[data-pay]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      try {
        await api.uploadReceipt(form.dataset.pay, fd);
        toast('Comprobante enviado');
        viewPayments(main);
      } catch (ex) { toast(ex.message); }
    });
  });
}

async function viewTutorPayments(main) {
  const groups = await api.tutorPayments();
  main.innerHTML = `
    ${title('', 'Comprobantes de pago', 'Revisa las colegiaturas de tus alumnos')}
    ${groups.map((g) => `
      <div class="card" style="margin-bottom:14px">
        <h3>${esc(g.student.first_name)} ${esc(g.student.last_name)}</h3>
        <div class="pay-grid">
          ${g.payments.map((p) => `
            <div class="pay-card ${p.status}">
              <strong>${esc(p.month_name)}</strong>
              <div>${statusPill(p.status)}</div>
              ${(p.receipts || []).filter((r) => r.status === 'pendiente').map((r) => `
                <p class="meta">${esc(r.file_name || 'archivo')} ${r.file_url ? `<a href="${media(r.file_url)}" target="_blank">ver</a>` : ''}</p>
                <button class="btn btn-green" data-ok="${r.id}">Aprobar</button>
                <button class="btn btn-danger" data-no="${r.id}">Rechazar</button>
              `).join('')}
            </div>`).join('')}
        </div>
      </div>`).join('')}
  `;
  $$('[data-ok]').forEach((b) => b.onclick = async () => {
    await api.reviewReceipt(b.dataset.ok, { status: 'aprobado' });
    toast('Pago aprobado');
    viewTutorPayments(main);
  });
  $$('[data-no]').forEach((b) => b.onclick = () => {
    openModal(`
      <h3>Rechazar comprobante</h3>
      <form id="reject-form">
        <div class="field"><label>Motivo</label><textarea name="notes" placeholder="Opcional"></textarea></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="m-no">Cancelar</button>
          <button class="btn btn-danger" type="submit">Rechazar</button>
        </div>
      </form>
    `);
    $('#m-no').onclick = closeModal;
    $('#reject-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.reviewReceipt(b.dataset.no, { status: 'rechazado', review_notes: e.target.notes.value });
        closeModal();
        toast('Comprobante rechazado');
        viewTutorPayments(main);
      } catch (ex) { toast(ex.message); }
    });
  });
}

async function viewMail(main, folder = 'inbox') {
  const list = await api.messages(folder);
  main.innerHTML = `
    ${title(`<a class="btn btn-primary" href="#/correo/nuevo">${icon('plus')} Redactar</a>`, 'Correo', isAdmin() ? 'Puedes escribir a cualquier integrante o a Todos' : state.user.role === 'parent' ? 'Escríbeles a los profesores de tu hijo y a administración' : 'Escríbeles a padres, profesores y administración')}
    <div class="mail-layout">
      <div class="mail-folders">
        <button class="${folder === 'inbox' ? 'active' : ''}" data-folder="inbox">Recibidos</button>
        <button class="${folder === 'sent' ? 'active' : ''}" data-folder="sent">Enviados</button>
      </div>
      <div>
        ${list.length ? list.map((m) => `
          <a class="mail-row ${m.read_at ? '' : 'unread'}" href="#/correo/${m.id}">
            <div class="from">${esc(folder === 'sent' ? (m.recipients.map((r) => personName(r.profile)).filter(Boolean).join(', ') || 'Sin destinatarios') : personName(m.sender))}</div>
            <strong>${esc(m.subject)}</strong>
            <p class="meta">${fmtDateTime(m.created_at)}</p>
          </a>`).join('') : '<div class="card empty">Bandeja vacía.</div>'}
      </div>
    </div>
  `;
  $$('[data-folder]').forEach((b) => b.onclick = () => viewMail(main, b.dataset.folder));
}

async function viewMailDetail(main, id) {
  const m = await api.message(id);
  state.unreadMail = Math.max(0, state.unreadMail - (m.read_at ? 0 : 0));
  await loadSession();
  renderChrome();
  main.innerHTML = `
    ${title(`<a class="btn btn-ghost" href="#/correo">Volver</a>`, esc(m.subject), `${esc(personName(m.sender))} · ${fmtDateTime(m.created_at)}`)}
    <div class="card">
      <p class="meta">De: ${esc(personName(m.sender))}${m.sender?.role_label ? ` · ${esc(m.sender.role_label)}` : ''}</p>
      <p class="meta">Para: ${m.recipients.map((r) => `${esc(personName(r.profile))}${r.profile?.role_label ? ' (' + esc(r.profile.role_label) + ')' : ''}`).join(', ')}</p>
      <pre style="white-space:pre-wrap;font-family:inherit">${esc(m.body)}</pre>
      ${m.sender_id !== state.user.id ? `<a class="btn btn-blue" href="#/correo/nuevo?to=${m.sender_id}&re=${encodeURIComponent('RE: ' + m.subject)}">Responder</a>` : ''}
    </div>
  `;
}

async function viewCompose(main) {
  const contacts = await api.contacts();
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const preTo = params.get('to') || '';
  const preSub = params.get('re') || '';
  const hint = isAdmin()
    ? 'Puedes escribir a cualquier integrante del sistema. Elige Todos para avisar a todos.'
    : state.user.role === 'tutor'
      ? 'Puedes escribir a padres de tus alumnos, profesores y administración.'
      : 'Puedes escribir a los profesores de tu hijo y a administración.';
  const contactLabel = (c) => {
    const bits = [personName(c), c.role_label || '', c.extra || c.subject || ''].filter(Boolean);
    return bits.join(' · ');
  };
  main.innerHTML = `
    ${title(`<a class="btn btn-ghost" href="#/correo">Cancelar</a>`, 'Nuevo correo', hint)}
    <form class="card mail-compose" id="compose" style="max-width:720px">
      <div class="field">
        <label>Para</label>
        <select name="recipientIds" multiple size="${Math.min(8, Math.max(4, contacts.length + 1))}">
          <option value="__all__">Todos (${contacts.length} integrantes)</option>
          ${contacts.map((c) => `<option value="${c.id}" ${c.id === preTo ? 'selected' : ''}>${esc(contactLabel(c))}</option>`).join('')}
        </select>
        <p class="meta">Elige <strong>Todos</strong> o mantén Ctrl/Cmd para varios. Los nombres aparecen con su rol.</p>
      </div>
      <div class="field"><label>Asunto</label><input name="subject" required value="${esc(preSub)}" /></div>
      <div class="field"><label>Mensaje</label><textarea name="body" required></textarea></div>
      <button class="btn btn-primary" type="submit">${icon('send')} Enviar</button>
    </form>
  `;
  $('#compose').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const recipientIds = [...e.target.recipientIds.selectedOptions].map((o) => o.value);
    const toAll = recipientIds.includes('__all__');
    try {
      await api.sendMessage({ recipientIds, toAll, subject: fd.get('subject'), body: fd.get('body') });
      toast(toAll ? 'Correo enviado a todos' : 'Correo enviado');
      go('/correo');
    } catch (ex) { toast(ex.message); }
  });
}

async function viewNotifs(main) {
  const list = await api.notifications();
  main.innerHTML = `
    ${title(`<button class="btn btn-ghost" id="read-all">Marcar todas como leídas</button>`, 'Notificaciones', 'Avisos de tareas, correos y pagos')}
    <div class="list">
      ${list.length ? list.map((n) => `
        <a class="list-item" href="#${n.link || '/panel'}" data-nid="${n.id}">
          <span class="dot" style="background:${n.read_at ? '#cbd5e1' : 'var(--blue)'}"></span>
          <div>
            <h4>${esc(n.title)}</h4>
            <p>${esc(n.body || '')} · ${fmtDateTime(n.created_at)}</p>
          </div>
        </a>`).join('') : '<div class="card empty">No hay notificaciones.</div>'}
    </div>
  `;
  $('#read-all')?.addEventListener('click', async () => {
    await api.readAllNotifs();
    await loadSession();
    viewNotifs(main);
  });
  $$('[data-nid]').forEach((a) => a.addEventListener('click', () => api.readNotif(a.dataset.nid)));
}

function rosterCards(roster) {
  return `<div class="roster-grid">${roster.map((s) => `
    <div class="roster-card">
      <a href="#/alumnos/${s.id}" style="text-decoration:none;color:inherit">
        <div class="teacher">
          <div class="av">${initials(s.first_name + ' ' + s.last_name)}</div>
          <div>
            <strong>${esc(s.first_name)} ${esc(s.last_name)}</strong>
            <div class="meta">${esc(s.grade)} ${esc(s.section || '')}</div>
          </div>
        </div>
        ${s.allergies ? `<div class="alert-line">Alergias: ${esc(s.allergies)}</div>` : ''}
        ${s.disability ? `<div class="alert-line">Discapacidad: ${esc(s.disability)}</div>` : ''}
        ${s.special_notes ? `<p class="meta">${esc(s.special_notes)}</p>` : ''}
        <p class="meta">${(s.parents || []).map((p) => esc(p.full_name)).join(', ') || 'Sin padre vinculado'}</p>
        <p class="meta">${s.pending_tasks || 0} tareas sin entregar · ${(s.classes || []).map((c) => c.subject).join(', ')}</p>
      </a>
      ${isAdmin() ? `<div class="dir-actions" style="margin-top:8px">
        <a class="btn btn-ghost" href="#/alumnos/${s.id}">Editar</a>
        <a class="btn btn-ghost" href="#/calificaciones/${s.id}">Notas</a>
        <button class="btn btn-danger" type="button" data-del-st="${s.id}">Dar de baja</button>
      </div>` : `<a class="btn btn-ghost" href="#/calificaciones/${s.id}">Ver notas</a>`}
    </div>`).join('')}</div>`;
}

function bindStudentDeletes(main, reload) {
  $$('[data-del-st]').forEach((b) => b.onclick = async (e) => {
    e.preventDefault();
    const ok = await confirmModal('¿Dar de baja a este estudiante? Solo administración puede hacerlo.', 'Dar de baja');
    if (!ok) return;
    try {
      await api.adminDeleteStudent(b.dataset.delSt);
      toast('Estudiante dado de baja');
      reload();
    } catch (ex) { toast(ex.message); }
  });
}

async function viewRoster(main) {
  const roster = await api.roster();
  main.innerHTML = `
    ${title('', 'Alumnos', 'Ficha individual: salud, familia y clases de cada estudiante')}
    ${roster.length ? rosterCards(roster) : '<div class="card empty">No hay alumnos asignados.</div>'}
  `;
  bindStudentDeletes(main, () => viewRoster(main));
}

async function viewEvents(main, tab = 'recent') {
  const data = await api.events();
  const canEdit = state.user.role === 'tutor' || isAdmin();
  const list = tab === 'past' ? data.past : data.recent;
  main.innerHTML = `
    ${title('', 'Eventos y actividades', 'Lo que sigue y lo que ya ocurrió')}
    <div class="tabs">
      <button class="${tab === 'recent' ? 'active' : ''}" data-tab="recent">Reciente (${data.recent.length})</button>
      <button class="${tab === 'past' ? 'active' : ''}" data-tab="past">Anterior (${data.past.length})</button>
    </div>
    <div class="list">
      ${list.length ? list.map((e) => `
        <div class="list-item event-card">
          <div class="event-date"><small>${MONTHS[Number(e.event_date.slice(5, 7)) - 1]?.slice(0, 3)}</small>${e.event_date.slice(8, 10)}</div>
          <div style="flex:1">
            <h4>${esc(e.title)} ${statusPill(tab === 'past' ? 'revisada' : 'publicada').replace('Revisada', 'Anterior').replace('Publicada', 'Próximo')}</h4>
            <p>${esc(e.description || '')}</p>
            <p class="meta">${esc(e.event_type)} · ${esc(e.creator?.full_name || '')} ${e.class ? '· ' + esc(e.class.name) : ''}</p>
            ${((canEdit && e.created_by === state.user.id) || isAdmin()) ? `<button class="btn btn-ghost" data-del-ev="${e.id}">Eliminar</button>` : ''}
          </div>
        </div>`).join('') : `<div class="card empty">${tab === 'past' ? 'No hay actividades anteriores.' : 'No hay actividades próximas.'}</div>`}
    </div>
    ${canEdit ? `
      <form class="card" id="event-form" style="margin-top:16px;max-width:620px">
        <h3>Publicar evento</h3>
        <div class="field"><label>Título</label><input name="title" required /></div>
        <div class="field"><label>Descripción</label><textarea name="description"></textarea></div>
        <div class="field"><label>Fecha</label><input type="date" name="event_date" required /></div>
        <div class="field"><label>Tipo</label>
          <select name="event_type">
            <option value="evento">Evento</option>
            <option value="reunion">Reunión</option>
            <option value="feriado">Feriado</option>
            <option value="clase">Clase especial</option>
          </select>
        </div>
        <button class="btn btn-primary" type="submit">Publicar</button>
      </form>` : ''}
  `;
  $$('[data-tab]').forEach((b) => b.onclick = () => viewEvents(main, b.dataset.tab));
  $('#event-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.createEvent(Object.fromEntries(new FormData(e.target).entries()));
      toast('Evento publicado');
      viewEvents(main, 'recent');
    } catch (ex) { toast(ex.message); }
  });
  $$('[data-del-ev]').forEach((b) => b.onclick = async () => {
    await api.deleteEvent(b.dataset.delEv);
    viewEvents(main, tab);
  });
}

async function viewGallery(main) {
  const items = await api.gallery();
  const canUpload = state.user.role === 'tutor' || isAdmin();
  main.innerHTML = `
    ${title('', 'Galería', 'Fotos de la escuela, con el nombre del profesor y la fecha')}
    ${canUpload ? `
      <form class="card" id="gal-form" style="margin-bottom:16px;max-width:520px">
        <h3>Subir foto</h3>
        <p class="meta">Elige de la galería o toma la foto con la cámara del celular.</p>
        <div class="file-actions">
          ${filePick('file', 'image/*', { label: 'Elegir de galería' })}
          ${filePick('camera', 'image/*', { capture: true })}
        </div>
        <div class="field"><label>Pie de foto</label><input name="caption" placeholder="Qué se ve en la imagen" /></div>
        <button class="btn btn-primary" type="submit">Publicar en galería</button>
      </form>` : ''}
    <div class="gallery-grid">
      ${items.length ? items.map((g) => `
        <article class="gallery-card">
          ${g.image_url ? `<img src="${media(g.image_url)}" alt="${esc(g.caption || '')}" />` : `<div class="gallery-ph">${icon('image')}</div>`}
          <div class="body">
            <h4>${esc(g.caption || 'Sin descripción')}</h4>
            <p class="meta">${esc(g.tutor?.full_name || 'Profesor')} · ${fmtDateTime(g.created_at)}</p>
            ${g.tutor_id === state.user.id || isAdmin() ? `<button class="btn btn-ghost" data-del-g="${g.id}">Quitar</button>` : ''}
          </div>
        </article>`).join('') : '<div class="card empty">Todavía no hay fotos.</div>'}
    </div>
  `;
  bindFilePicks(main);
  $('#gal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.addGallery(fd);
      toast('Foto publicada');
      viewGallery(main);
    } catch (ex) { toast(ex.message); }
  });
  $$('[data-del-g]').forEach((b) => b.onclick = async () => {
    await api.deleteGallery(b.dataset.delG);
    viewGallery(main);
  });
}

async function viewEditTask(main, id) {
  const a = await api.assignment(id);
  const classes = await api.classes();
  const due = a.due_date ? a.due_date.slice(0, 16) : '';
  main.innerHTML = `
    ${title(`<a class="btn btn-ghost" href="#/tareas/${id}">Cancelar</a>`, 'Editar tarea', esc(a.title))}
    <form class="card" id="edit-task" style="max-width:640px">
      <div class="field"><label>Clase</label><select name="class_id">${classes.map((c) => `<option value="${c.id}" ${c.id === a.class_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Título</label><input name="title" required value="${esc(a.title)}" /></div>
      <div class="field"><label>Descripción</label><textarea name="description">${esc(a.description || '')}</textarea></div>
      <div class="field"><label>Fecha de entrega</label><input type="datetime-local" name="due_date" required value="${due}" /></div>
      <div class="field"><label>Archivos máximos del alumno (1 a 10)</label><input type="number" name="max_files" min="1" max="10" value="${a.max_files || 1}" /></div>
      <div class="field"><label>Nota máxima</label><input type="number" name="max_score" min="1" max="100" value="${a.max_score || 10}" step="0.5" /></div>
      <div class="field"><label>Peso en el promedio</label><input type="number" name="weight" min="0.1" max="10" value="${a.weight || 1}" step="0.1" /></div>
      <div class="field"><label>Agregar material</label>${filePick('files', '', { multiple: true })}</div>
      <button class="btn btn-primary" type="submit">Guardar cambios</button>
      <button class="btn btn-danger" type="button" id="del-task" style="margin-left:8px">Eliminar tarea</button>
    </form>
  `;
  bindFilePicks(main);
  $('#edit-task').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await api.updateAssignment(id, fd);
      toast('Tarea actualizada');
      go(`/tareas/${id}`);
    } catch (ex) { toast(ex.message); }
  });
  $('#del-task').onclick = async () => {
    const ok = await confirmModal('¿Eliminar esta tarea y sus entregas?', 'Eliminar');
    if (!ok) return;
    await api.deleteAssignment(id);
    toast('Tarea eliminada');
    go('/tareas');
  };
}

async function viewAdminUsers(main) {
  const users = await api.adminUsers();
  const students = await api.roster();
  main.innerHTML = `
    ${title('', 'Registrar usuarios', 'Solo administración. Al crear la cuenta se envía un enlace para cambiar la contraseña temporal.')}
    <form class="card" id="user-form" style="max-width:640px;margin-bottom:18px">
      <div class="field"><label>Nombre completo</label><input name="full_name" required /></div>
      <div class="field"><label>Correo</label><input name="email" type="email" required /></div>
      <div class="field"><label>Rol</label>
        <select name="role" id="role-sel">
          <option value="parent">Padre de familia</option>
          <option value="tutor">Tutor</option>
        </select>
      </div>
      <div class="field"><label>Teléfono</label><input name="phone" /></div>
      <div class="field" id="subj-field"><label>Materia (tutores)</label><input name="subject" /></div>
      <div class="field"><label>Vincular a estudiante (padres)</label>
        <select name="student_id">
          <option value="">— ninguno aún —</option>
          ${students.map((s) => `<option value="${s.id}">${esc(s.first_name)} ${esc(s.last_name)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Contraseña</label>
        <div class="password-wrap">
          <input id="admin-temp" type="text" value="Se genera sola y llega por correo" disabled />
        </div>
        <p class="meta">El usuario verá un ícono de ojo al entrar y al cambiarla.</p>
      </div>
      <button class="btn btn-primary" type="submit">Registrar y enviar enlace</button>
    </form>
    <div id="created-box"></div>
    <div class="card">
      <h3>Directorio</h3>
      ${users.map((u) => `<div class="list-item">
        <div class="av" style="width:36px;height:36px;border-radius:50%;background:var(--mint);display:grid;place-items:center;font-weight:800">${initials(u.full_name)}</div>
        <div>
          <strong>${esc(u.full_name)}</strong>
          <p class="meta">${esc(u.email)} · ${esc(u.role_label || u.role)}${u.phone ? ' · ' + esc(u.phone) : ''}${u.subject ? ' · ' + esc(u.subject) : ''}${u.students?.length ? ' · ' + u.students.map((s) => s.first_name).join(', ') : ''}${u.must_change_password ? ' · debe cambiar contraseña' : ''}</p>
        </div>
        <div class="dir-actions">
          <button class="btn btn-ghost" data-edit-user="${u.id}">${icon('pencil')} Editar</button>
          ${u.id !== state.user.id ? `<button class="btn btn-danger" data-del-user="${u.id}">${icon('trash')}</button>` : ''}
        </div>
      </div>`).join('')}
    </div>
  `;
  $('#user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      const row = await api.adminCreateUser(body);
      toast('Usuario creado. Revisa el enlace enviado.');
      $('#created-box').innerHTML = `<div class="card" style="margin-bottom:12px"><strong>Enlace enviado a ${esc(row.user.email)}</strong><p class="meta">Contraseña temporal: ${esc(row.tempPassword)}</p><p><a href="${row.resetUrl}">${esc(row.resetUrl)}</a></p></div>`;
      viewAdminUsers(main);
    } catch (ex) { toast(ex.message); }
  });
  $$('[data-edit-user]').forEach((b) => b.onclick = () => {
    const u = users.find((x) => x.id === b.dataset.editUser);
    if (!u) return;
    openModal(`
      <h3>Editar ${esc(u.full_name)}</h3>
      <form id="edit-user-form">
        <div class="field"><label>Nombre</label><input name="full_name" value="${esc(u.full_name)}" required /></div>
        <div class="field"><label>Correo</label><input name="email" type="email" value="${esc(u.email)}" required /></div>
        <div class="field"><label>Teléfono</label><input name="phone" value="${esc(u.phone || '')}" /></div>
        <div class="field"><label>Rol</label>
          <select name="role">
            <option value="parent" ${u.role === 'parent' ? 'selected' : ''}>Padre de familia</option>
            <option value="tutor" ${u.role === 'tutor' ? 'selected' : ''}>Tutor</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administración</option>
          </select>
        </div>
        <div class="field"><label>Materia (tutores)</label><input name="subject" value="${esc(u.subject || '')}" /></div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" id="m-no">Cancelar</button>
          <button class="btn btn-primary" type="submit">Guardar</button>
        </div>
      </form>
    `);
    $('#m-no').onclick = closeModal;
    $('#edit-user-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.adminUpdateUser(u.id, Object.fromEntries(new FormData(e.target).entries()));
        closeModal();
        toast('Usuario actualizado');
        viewAdminUsers(main);
      } catch (ex) { toast(ex.message); }
    });
  });
  $$('[data-del-user]').forEach((b) => b.onclick = async () => {
    const u = users.find((x) => x.id === b.dataset.delUser);
    const ok = await confirmModal(`¿Eliminar a ${u?.full_name || 'este usuario'}?`, 'Eliminar');
    if (!ok) return;
    try {
      await api.adminDeleteUser(b.dataset.delUser);
      toast('Usuario eliminado');
      viewAdminUsers(main);
    } catch (ex) { toast(ex.message); }
  });
}

async function viewAdminStudents(main) {
  const users = await api.adminUsers();
  const parents = users.filter((u) => u.role === 'parent');
  const classes = await api.classes();
  const roster = await api.roster();
  main.innerHTML = `
    ${title('', 'Registrar estudiantes', 'Alta de alumno, vínculo con padre y grupo')}
    <form class="card" id="st-form" style="max-width:640px;margin-bottom:18px">
      <div class="field"><label>Nombre</label><input name="first_name" required /></div>
      <div class="field"><label>Apellidos</label><input name="last_name" required /></div>
      <div class="field"><label>Grado</label><input name="grade" placeholder="3° Primaria" required /></div>
      <div class="field"><label>Sección</label><input name="section" value="A" /></div>
      <div class="field"><label>Nacimiento</label><input type="date" name="birth_date" /></div>
      <div class="field"><label>Padre / madre</label>
        <select name="parent_id">
          <option value="">— registrar padre después —</option>
          ${parents.map((p) => `<option value="${p.id}">${esc(p.full_name)}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Inscribir a clases (Ctrl para varias)</label>
        <select name="class_ids" multiple size="4">${classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      </div>
      <button class="btn btn-primary" type="submit">Dar de alta</button>
    </form>
    ${rosterCards(roster)}
  `;
  $('#st-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd.entries());
    body.class_ids = [...e.target.class_ids.selectedOptions].map((o) => o.value);
    try {
      await api.adminCreateStudent(body);
      toast('Estudiante registrado');
      viewAdminStudents(main);
    } catch (ex) { toast(ex.message); }
  });
  bindStudentDeletes(main, () => viewAdminStudents(main));
}

async function viewAdminMail(main) {
  const mails = await api.adminMail();
  main.innerHTML = `
    ${title('', 'Correos de bienvenida', 'Enlaces que se enviaron al registrar usuarios')}
    ${mails.length ? mails.map((m) => `
      <div class="card" style="margin-bottom:10px">
        <strong>${esc(m.subject)}</strong>
        <p class="meta">Para ${esc(m.to_name || m.to)}${m.role_label ? ' · ' + esc(m.role_label) : ''} · ${esc(m.to)} · ${fmtDateTime(m.sent_at)}</p>
        <pre style="white-space:pre-wrap;font-family:inherit;font-size:.85rem">${esc(m.body)}</pre>
      </div>`).join('') : '<div class="card empty">Aún no se ha enviado ningún enlace.</div>'}
  `;
}

function subjectTable(subject) {
  const items = subject.items || [];
  return `
    <div class="card" style="margin-bottom:16px">
      <div class="teacher" style="margin-bottom:12px">
        <span class="dot" style="background:${subject.class?.color || '#2aa3e0'}"></span>
        <div>
          <h3 style="margin:0">${esc(subject.class?.subject || subject.class?.name || 'Materia')}</h3>
          <p class="meta">${esc(subject.class?.tutor?.full_name || '')} · ${subject.graded_count} de ${subject.total_count} actividades calificadas</p>
        </div>
      </div>
      <div class="grade-table-wrap">
        <table class="grade-table">
          <thead>
            <tr>
              <th>Ítem de calificación</th>
              <th>Peso</th>
              <th>Calificación</th>
              <th>Rango</th>
              <th>Porcentaje</th>
              <th>Retroalimentación</th>
              <th>Aporta al total</th>
            </tr>
          </thead>
          <tbody>
            ${items.length ? items.map((i) => `
              <tr>
                <td><a href="#/tareas/${i.assignment_id}">${esc(i.title)}</a><div class="meta">${fmtDate(i.due_date)} · ${esc(i.status)}</div></td>
                <td>${i.weight}</td>
                <td>${i.grade != null ? i.grade : '—'}</td>
                <td>0–${i.max_score}</td>
                <td>${i.percent != null ? i.percent + ' %' : '—'}</td>
                <td>${esc(i.feedback || '—')}</td>
                <td>${i.grade != null ? i.contribution + ' %' : '—'}</td>
              </tr>`).join('') : '<tr><td colspan="7">Aún no hay actividades en esta materia.</td></tr>'}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="6">Promedio actual de la materia</td>
              <td>${subject.average != null ? subject.average.toFixed(2) : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;
}

async function viewGrades(main, studentId) {
  const tutorMode = (state.user.role === 'tutor' || isAdmin()) && !studentId && ! (state.user.role === 'parent');
  if (tutorMode) {
    const books = await api.grades();
    main.innerHTML = `
      ${title('', 'Calificaciones', 'Notas por alumno. Al revisar una tarea, la nota se refleja aquí.')}
      ${books.length ? books.map((book) => `
        <div class="card" style="margin-bottom:16px">
          <h3>${esc(book.class.subject)} <span class="meta">${esc(book.class.name)}</span></h3>
          <div class="grade-table-wrap">
            <table class="grade-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  ${(book.assignments || []).map((a) => `<th>${esc(a.title)}</th>`).join('')}
                  <th>Promedio</th>
                </tr>
              </thead>
              <tbody>
                ${(book.students || []).map((row) => `
                  <tr>
                    <td><a href="#/calificaciones/${row.student.id}">${esc(row.student.first_name)} ${esc(row.student.last_name)}</a></td>
                    ${(row.items || []).map((i) => `<td>${i.grade != null ? i.grade : '—'}</td>`).join('')}
                    <td><strong>${row.average != null ? row.average.toFixed(2) : '—'}</strong></td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`).join('') : '<div class="card empty">Todavía no hay clases con calificaciones.</div>'}
    `;
    return;
  }

  const sid = studentId || state.studentId;
  const data = await api.grades(sid);
  const name = data.student ? `${data.student.first_name} ${data.student.last_name}` : '';
  main.innerHTML = `
    ${title(state.user.role !== 'parent' ? `<a class="btn btn-ghost" href="#/calificaciones">Volver</a>` : '', 'Calificaciones', `${esc(name)} · ciclo ${esc(data.year?.name || '')}`)}
    <div class="grade-avg">
      <div>
        <p class="meta" style="margin:0">Promedio del año lectivo</p>
        <h3 style="margin:4px 0 0">Resumen de todas las materias con nota</h3>
      </div>
      <strong>${data.year_average != null ? data.year_average.toFixed(2) : '—'}</strong>
    </div>
    ${(data.subjects || []).map(subjectTable).join('') || '<div class="card empty">Aún no hay actividades calificadas.</div>'}
  `;
}

boot();
