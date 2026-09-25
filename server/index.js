const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { randomUUID: uuid } = require('crypto');
require('dotenv').config();

const store = require('./store');
const mailer = require('./mailer');

const PORT = Number(process.env.PORT) || 3000;
const SECRET = process.env.SESSION_SECRET || 'rayuela-dev-secret';
const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 8);
      cb(null, `${uuid()}${ext}`);
    },
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..', 'public')));

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, full_name: user.full_name, email: user.email }, SECRET, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Inicia sesión' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada' });
  }
}

function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}

function fileMeta(file) {
  if (!file) return null;
  return { url: `/uploads/${file.filename}`, originalname: file.originalname, mimetype: file.mimetype, size: file.size };
}

app.post('/api/auth/login', wrap((req, res) => {
  const { email, password } = req.body || {};
  const user = store.login(email, password);
  if (!user) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ token, user, must_change_password: !!user.must_change_password });
}));

app.post('/api/auth/reset-password', wrap((req, res) => {
  const user = store.resetPassword(req.body.token, req.body.password);
  const token = sign(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
  res.json({ token, user });
}));

app.post('/api/auth/change-password', auth, wrap((req, res) => {
  const user = store.changePassword(req.user, req.body.current, req.body.password);
  res.json({ user });
}));

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', auth, wrap((req, res) => {
  res.json(store.getMe(req.user));
}));

app.get('/api/dashboard', auth, wrap((req, res) => {
  res.json(store.getDashboard(req.user, req.query.studentId));
}));

app.get('/api/students', auth, wrap((req, res) => {
  const me = store.getMe(req.user);
  res.json(me.students);
}));

app.get('/api/students/:id', auth, wrap((req, res) => {
  const info = store.getStudentInfo(req.user, req.params.id);
  if (!info) return res.status(404).json({ error: 'Alumno no encontrado' });
  res.json(info);
}));

app.patch('/api/students/:id', auth, wrap((req, res) => {
  res.json(store.updateStudent(req.user, req.params.id, req.body || {}));
}));

app.get('/api/roster', auth, wrap((req, res) => {
  res.json(store.listTutorRoster(req.user));
}));

app.get('/api/classes', auth, wrap((req, res) => {
  const studentId = store.resolveStudentId(req.user, req.query.studentId);
  let classes;
  if (store.isAdmin(req.user)) classes = store.data.classes.map((c) => store.hydrateClass(c));
  else if (req.user.role === 'tutor') classes = store.classesForTutor(req.user.id);
  else classes = store.classesForStudent(studentId);
  res.json(classes);
}));

app.get('/api/calendar', auth, wrap((req, res) => {
  const now = new Date();
  const year = req.query.year || now.getFullYear();
  const month = req.query.month || now.getMonth() + 1;
  res.json(store.getCalendar(req.user, year, month, req.query.studentId));
}));

app.get('/api/assignments', auth, wrap((req, res) => {
  res.json(store.getAssignments(req.user, req.query.studentId));
}));

app.get('/api/assignments/:id', auth, wrap((req, res) => {
  const row = store.getAssignment(req.user, req.params.id, req.query.studentId);
  if (!row) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(row);
}));

app.post('/api/assignments', auth, upload.array('files', 10), wrap((req, res) => {
  const attachments = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, name: f.originalname }));
  const row = store.createAssignment(req.user, {
    class_id: req.body.class_id,
    title: req.body.title,
    description: req.body.description,
    due_date: req.body.due_date,
    attachments,
    attachment_url: attachments[0]?.url || null,
    attachment_name: attachments[0]?.name || null,
    max_files: req.body.max_files,
    max_score: req.body.max_score,
    weight: req.body.weight,
  });
  res.status(201).json(row);
}));

app.patch('/api/assignments/:id', auth, upload.array('files', 10), wrap((req, res) => {
  const attachments = (req.files || []).map((f) => ({ url: `/uploads/${f.filename}`, name: f.originalname }));
  res.json(store.updateAssignment(req.user, req.params.id, { ...(req.body || {}), attachments }, null));
}));

app.delete('/api/assignments/:id', auth, wrap((req, res) => {
  res.json(store.deleteAssignment(req.user, req.params.id));
}));

app.post('/api/assignments/:id/submit', auth, upload.fields([
  { name: 'files', maxCount: 10 },
  { name: 'file', maxCount: 10 },
  { name: 'camera', maxCount: 1 },
]), wrap((req, res) => {
  const bag = req.files || {};
  const files = [...(bag.files || []), ...(bag.file || []), ...(bag.camera || [])].map(fileMeta);
  const row = store.submitAssignment(
    req.user,
    req.params.id,
    req.body.studentId || req.query.studentId,
    files,
    req.body.notes
  );
  res.json(row);
}));

app.patch('/api/assignments/:id/submissions/:sid', auth, wrap((req, res) => {
  const row = store.reviewSubmission(req.user, req.params.id, req.params.sid, req.body.feedback, req.body.status, req.body.grade);
  res.json(row);
}));

app.get('/api/messages', auth, wrap((req, res) => {
  res.json(store.getMessages(req.user, req.query.folder || 'inbox'));
}));

app.get('/api/messages/contacts', auth, wrap((req, res) => {
  res.json(store.getContacts(req.user));
}));

app.get('/api/messages/:id', auth, wrap((req, res) => {
  const row = store.markMessageRead(req.user, req.params.id);
  if (!row) return res.status(404).json({ error: 'Correo no encontrado' });
  res.json(row);
}));

app.post('/api/messages', auth, wrap((req, res) => {
  const row = store.sendMessage(req.user, req.body || {});
  res.status(201).json(row);
}));

app.get('/api/notifications', auth, wrap((req, res) => {
  res.json(store.getNotifications(req.user));
}));

app.post('/api/notifications/read-all', auth, wrap((req, res) => {
  res.json(store.markAllNotificationsRead(req.user));
}));

app.post('/api/notifications/:id/read', auth, wrap((req, res) => {
  res.json(store.markNotificationRead(req.user, req.params.id));
}));

app.get('/api/payments', auth, wrap((req, res) => {
  if ((req.user.role === 'tutor' || store.isAdmin(req.user)) && req.query.all === '1') {
    return res.json(store.getAllPaymentsForTutor(req.user));
  }
  res.json(store.getPayments(req.user, req.query.studentId));
}));

app.post('/api/payments/:id/receipt', auth, upload.single('file'), wrap((req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Adjunta el comprobante' });
  const row = store.uploadReceipt(req.user, req.params.id, fileMeta(req.file), req.body.notes);
  res.json(row);
}));

app.patch('/api/receipts/:id', auth, wrap((req, res) => {
  const row = store.reviewReceipt(req.user, req.params.id, req.body.status, req.body.review_notes);
  res.json(row);
}));

app.get('/api/schedule', auth, wrap((req, res) => {
  res.json(store.getSchedule(req.user, req.query.studentId));
}));

app.post('/api/schedule', auth, wrap((req, res) => {
  res.status(201).json(store.addScheduleSlot(req.user, req.body || {}));
}));

app.patch('/api/schedule/:id', auth, wrap((req, res) => {
  res.json(store.updateScheduleSlot(req.user, req.params.id, req.body || {}));
}));

app.delete('/api/schedule/:id', auth, wrap((req, res) => {
  res.json(store.deleteScheduleSlot(req.user, req.params.id));
}));

app.get('/api/events', auth, wrap((req, res) => {
  res.json(store.getEvents(req.user));
}));

app.post('/api/events', auth, wrap((req, res) => {
  res.status(201).json(store.createEvent(req.user, req.body || {}));
}));

app.delete('/api/events/:id', auth, wrap((req, res) => {
  res.json(store.deleteEvent(req.user, req.params.id));
}));

app.get('/api/gallery', auth, wrap((req, res) => {
  res.json(store.getGallery());
}));

app.post('/api/gallery', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'camera', maxCount: 1 },
]), wrap((req, res) => {
  const file = req.files?.file?.[0] || req.files?.camera?.[0];
  res.status(201).json(store.addGallery(req.user, fileMeta(file), req.body.caption));
}));

app.delete('/api/gallery/:id', auth, wrap((req, res) => {
  res.json(store.deleteGallery(req.user, req.params.id));
}));

app.get('/api/admin/users', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.json(store.adminListUsers());
}));

app.post('/api/admin/users', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  const created = store.adminCreateUser(req.body || {});
  const resetUrl = `${mailer.appBase(req)}/#/cambiar-contrasena?token=${created.resetToken}`;
  const mail = mailer.passwordWelcomeEmail({
    fullName: created.user.full_name,
    email: created.user.email,
    tempPassword: created.tempPassword,
    resetUrl,
  });
  mailer.queueMail(store, { to: created.user.email, subject: mail.subject, body: mail.body, meta: { resetUrl } });
  store.save();
  res.status(201).json({ user: created.user, resetUrl, tempPassword: created.tempPassword });
}));

app.post('/api/admin/students', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.status(201).json(store.adminCreateStudent(req.body || {}));
}));

app.patch('/api/admin/users/:id', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.json(store.adminUpdateUser(req.params.id, req.body || {}));
}));

app.delete('/api/admin/users/:id', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.json(store.adminDeleteUser(req.user, req.params.id));
}));

app.delete('/api/admin/students/:id', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.json(store.adminDeleteStudent(req.params.id));
}));

app.get('/api/admin/mail', auth, wrap((req, res) => {
  store.assertAdmin(req.user);
  res.json(store.listMailOutbox());
}));

app.get('/api/grades', auth, wrap((req, res) => {
  if (req.user.role === 'tutor' || store.isAdmin(req.user)) {
    if (req.query.studentId) return res.json(store.getStudentGrades(req.user, req.query.studentId));
    return res.json(store.getTutorGradebook(req.user));
  }
  res.json(store.getStudentGrades(req.user, req.query.studentId));
}));

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message || 'Error interno' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`La Rayuela CRM listo en http://localhost:${PORT}`);
  console.log('Demo: padre@rayuela.edu / padre123');
  console.log('Demo: tutor@rayuela.edu / tutor123');
  console.log('Demo: admin@rayuela.edu / admin123');
});
