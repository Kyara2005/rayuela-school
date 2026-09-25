const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID: uuid } = require('crypto');
const { buildSeed } = require('./demoSeed');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

class Store {
  constructor() {
    this.data = null;
    this.load();
  }

  load() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(STORE_FILE)) {
      try {
        this.data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
        this.migrate();
        this.save();
        return;
      } catch {
        /* reseed */
      }
    }
    this.data = buildSeed();
    this.save();
  }

  save() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2));
  }

  reset() {
    this.data = buildSeed();
    this.save();
  }

  migrate() {
    const seed = buildSeed();
    this.data.gallery = this.data.gallery || seed.gallery || [];
    this.data.password_resets = this.data.password_resets || [];
    this.data.mail_outbox = this.data.mail_outbox || [];
    for (const p of this.data.profiles) {
      if (p.must_change_password === undefined) p.must_change_password = false;
    }
    const admin = seed.profiles.find((p) => p.role === 'admin');
    if (admin && !this.data.profiles.some((p) => p.email === 'admin@rayuela.edu')) {
      this.data.profiles.unshift(admin);
    }
    for (const s of this.data.students) {
      const seeded = seed.students.find((x) => x.id === s.id) || {};
      if (s.allergies === undefined) s.allergies = '';
      if (s.disability === undefined) s.disability = '';
      if (s.special_notes === undefined) s.special_notes = '';
      if (s.blood_type === undefined) s.blood_type = '';
      if (s.emergency_contact === undefined) s.emergency_contact = '';
      if (!s.allergies && seeded.allergies) s.allergies = seeded.allergies;
      if (!s.disability && seeded.disability) s.disability = seeded.disability;
      if (!s.special_notes && seeded.special_notes) s.special_notes = seeded.special_notes;
      if (!s.blood_type && seeded.blood_type) s.blood_type = seeded.blood_type;
      if (!s.emergency_contact && seeded.emergency_contact) s.emergency_contact = seeded.emergency_contact;
    }
    const have = new Set(this.data.calendar_events.map((e) => e.id));
    for (const ev of seed.calendar_events) {
      if (!have.has(ev.id)) this.data.calendar_events.push(ev);
    }
    for (const a of this.data.assignments) {
      if (!a.max_files) a.max_files = 1;
      if (a.max_score == null) a.max_score = 10;
      if (a.weight == null) a.weight = 1;
      if (!Array.isArray(a.attachments)) {
        a.attachments = a.attachment_url ? [{ url: a.attachment_url, name: a.attachment_name }] : [];
      }
    }
    for (const s of this.data.assignment_submissions) {
      if (!Array.isArray(s.files)) {
        s.files = s.file_url ? [{ url: s.file_url, name: s.file_name }] : [];
      }
      if (s.grade === undefined) s.grade = s.status === 'revisada' ? 9 : null;
    }
    this.ensureSibling();
  }

  ensureSibling() {
    const mateoId = 'a1e10000-0000-4000-8000-000000000032';
    const parentId = 'a1e10000-0000-4000-8000-000000000010';
    if (this.data.students.some((s) => s.id === mateoId)) return;
    const year = this.activeYear();
    this.data.students.push({
      id: mateoId,
      first_name: 'Mateo',
      last_name: 'Altamirano',
      grade: '1° Primaria',
      section: 'A',
      photo_url: null,
      academic_year_id: year?.id,
      birth_date: '2019-11-02',
      allergies: 'Ninguna conocida',
      disability: '',
      special_notes: 'Hermano de Kyara. Recién llega a 1°.',
      blood_type: 'O+',
      emergency_contact: 'Eduardo Altamirano · 555-120-3344',
    });
    this.data.parent_students.push({
      id: uuid(),
      parent_id: parentId,
      student_id: mateoId,
      relationship: 'padre',
    });
    const classIds = this.data.classes.map((c) => c.id);
    for (const cid of classIds) {
      if (!this.data.class_enrollments.some((e) => e.class_id === cid && e.student_id === mateoId)) {
        this.data.class_enrollments.push({ id: uuid(), class_id: cid, student_id: mateoId });
      }
    }
  }

  isAdmin(user) {
    return user?.role === 'admin' || user?.email === 'admin@rayuela.edu';
  }

  assertAdmin(user) {
    if (!this.isAdmin(user)) throw Object.assign(new Error('Solo administración puede hacer esto'), { status: 403 });
  }

  tempPassword() {
    return `Rayuela-${Math.random().toString(36).slice(2, 6)}`;
  }

  profilePublic(p) {
    if (!p) return null;
    const { passwordHash, ...rest } = p;
    return rest;
  }

  getProfile(id) {
    return this.data.profiles.find((p) => p.id === id) || null;
  }

  activeYear() {
    return this.data.academic_years.find((y) => y.is_active) || this.data.academic_years[0];
  }

  login(email, password) {
    const user = this.data.profiles.find((p) => p.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user || !user.passwordHash) return null;
    if (!bcrypt.compareSync(password, user.passwordHash)) return null;
    return this.profilePublic(user);
  }

  childrenOf(parentId) {
    const links = this.data.parent_students.filter((x) => x.parent_id === parentId);
    return links.map((l) => ({
      ...this.data.students.find((s) => s.id === l.student_id),
      relationship: l.relationship,
    })).filter(Boolean);
  }

  studentsOfTutor(tutorId) {
    const classIds = this.data.classes.filter((c) => c.tutor_id === tutorId).map((c) => c.id);
    const studentIds = [...new Set(this.data.class_enrollments.filter((e) => classIds.includes(e.class_id)).map((e) => e.student_id))];
    return studentIds.map((id) => this.data.students.find((s) => s.id === id)).filter(Boolean);
  }

  classesForStudent(studentId) {
    const classIds = this.data.class_enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id);
    return this.data.classes.filter((c) => classIds.includes(c.id)).map((c) => this.hydrateClass(c));
  }

  classesForTutor(tutorId) {
    return this.data.classes.filter((c) => c.tutor_id === tutorId).map((c) => this.hydrateClass(c));
  }

  hydrateClass(c) {
    const tutor = this.getProfile(c.tutor_id);
    const enrolled = this.data.class_enrollments.filter((e) => e.class_id === c.id);
    return {
      ...c,
      tutor: this.profilePublic(tutor),
      student_count: enrolled.length,
    };
  }

  canAccessStudent(user, studentId) {
    if (!studentId) return false;
    if (this.isAdmin(user)) return this.data.students.some((s) => s.id === studentId);
    if (user.role === 'parent') return this.data.parent_students.some((x) => x.parent_id === user.id && x.student_id === studentId);
    if (user.role === 'tutor') return this.studentsOfTutor(user.id).some((s) => s.id === studentId);
    return false;
  }

  resolveStudentId(user, requested) {
    if (requested && this.canAccessStudent(user, requested)) return requested;
    if (user.role === 'parent') return this.childrenOf(user.id)[0]?.id || null;
    if (this.isAdmin(user)) return this.data.students[0]?.id || null;
    return this.studentsOfTutor(user.id)[0]?.id || null;
  }

  getMe(user) {
    const year = this.activeYear();
    let students = [];
    if (user.role === 'parent') students = this.childrenOf(user.id);
    else if (user.role === 'tutor') students = this.studentsOfTutor(user.id);
    else if (this.isAdmin(user)) students = this.data.students;
    return {
      user: this.profilePublic(this.getProfile(user.id)),
      year,
      years: this.data.academic_years,
      students,
    };
  }

  getDashboard(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    const unreadMessages = this.data.message_recipients.filter((r) => r.recipient_id === user.id && !r.read_at).length;
    const unreadNotifs = this.data.notifications.filter((n) => n.user_id === user.id && !n.read_at).length;
    const assignments = this.getAssignments(user, studentId).slice(0, 4);
    const upcoming = assignments.filter((a) => new Date(a.due_date) >= new Date()).slice(0, 3);
    let paymentsSummary = null;
    if (studentId) {
      const pays = this.getPayments(user, studentId).payments;
      paymentsSummary = {
        total: pays.length,
        pagado: pays.filter((p) => p.status === 'pagado').length,
        pendiente: pays.filter((p) => p.status === 'pendiente' || p.status === 'vencido').length,
        en_revision: pays.filter((p) => p.status === 'en_revision').length,
      };
    }
    const student = this.data.students.find((s) => s.id === studentId) || null;
    return {
      unreadMessages,
      unreadNotifs,
      upcoming,
      paymentsSummary,
      student,
      classes: studentId ? this.classesForStudent(studentId) : this.classesForTutor(user.id),
    };
  }

  getCalendar(user, year, month, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    const y = Number(year);
    const m = Number(month);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0));
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const classIds = studentId
      ? this.data.class_enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id)
      : this.data.classes.filter((c) => c.tutor_id === user.id).map((c) => c.id);

    const events = this.data.calendar_events.filter((ev) => {
      if (ev.event_date < startStr || ev.event_date > endStr) return false;
      if (!ev.class_id && !ev.student_id) return true;
      if (ev.student_id && ev.student_id === studentId) return true;
      if (ev.class_id && classIds.includes(ev.class_id)) return true;
      return false;
    }).map((ev) => ({ ...ev, source: 'event' }));

    const asg = this.data.assignments.filter((a) => {
      if (!classIds.includes(a.class_id)) return false;
      const d = a.due_date.slice(0, 10);
      return d >= startStr && d <= endStr;
    }).map((a) => ({
      id: `asg-${a.id}`,
      title: a.title,
      description: a.description,
      event_date: a.due_date.slice(0, 10),
      event_type: 'tarea',
      class_id: a.class_id,
      source: 'assignment',
      assignment_id: a.id,
    }));

    let pays = [];
    if (studentId) {
      pays = this.data.payments.filter((p) => {
        if (p.student_id !== studentId) return false;
        return p.due_date >= startStr && p.due_date <= endStr;
      }).map((p) => ({
        id: `pay-${p.id}`,
        title: `${p.concept} (${this.monthName(p.month)})`,
        description: `$${Number(p.amount).toFixed(2)} — ${p.status}`,
        event_date: p.due_date,
        event_type: 'pago',
        source: 'payment',
        payment_id: p.id,
      }));
    }

    return { year: y, month: m, events: [...events, ...asg, ...pays] };
  }

  monthName(month) {
    return ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][month];
  }

  getAssignments(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    let list;
    if (user.role === 'tutor') {
      list = this.data.assignments.filter((a) => a.tutor_id === user.id);
    } else if (this.isAdmin(user)) {
      list = this.data.assignments;
    } else {
      const classIds = studentId
        ? this.data.class_enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id)
        : [];
      list = this.data.assignments.filter((a) => classIds.includes(a.class_id));
    }
    return list
      .map((a) => this.hydrateAssignment(a, studentId, user))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  hydrateAssignment(a, studentId, user) {
    const cls = this.data.classes.find((c) => c.id === a.class_id);
    const tutor = this.getProfile(a.tutor_id);
    const submissions = this.data.assignment_submissions.filter((s) => s.assignment_id === a.id);
    const mine = studentId ? submissions.find((s) => s.student_id === studentId) : null;
    const mineNorm = mine ? { ...mine, files: this.submissionFiles(mine) } : null;
    return {
      ...a,
      max_files: a.max_files || 1,
      max_score: a.max_score == null ? 10 : Number(a.max_score),
      weight: a.weight == null ? 1 : Number(a.weight),
      attachments: a.attachments || (a.attachment_url ? [{ url: a.attachment_url, name: a.attachment_name }] : []),
      class: cls ? { id: cls.id, name: cls.name, subject: cls.subject, color: cls.color, tutor_id: cls.tutor_id } : null,
      tutor: this.profilePublic(tutor),
      submission: mineNorm,
      submissions: (user?.role === 'tutor' || this.isAdmin(user)) ? submissions.map((s) => ({
        ...s,
        files: this.submissionFiles(s),
        student: this.data.students.find((st) => st.id === s.student_id),
      })) : undefined,
      submission_count: submissions.length,
    };
  }

  submissionFiles(s) {
    const files = Array.isArray(s.files) ? s.files.slice() : [];
    if (s.file_url && !files.some((f) => f.url === s.file_url)) {
      files.unshift({ url: s.file_url, name: s.file_name });
    }
    return files;
  }

  getAssignment(user, id, studentId) {
    const a = this.data.assignments.find((x) => x.id === id);
    if (!a) return null;
    studentId = this.resolveStudentId(user, studentId);
    if (user.role === 'tutor' && a.tutor_id !== user.id && !this.isAdmin(user)) return null;
    if (user.role === 'parent') {
      const classIds = this.data.class_enrollments
        .filter((e) => this.data.parent_students.some((ps) => ps.parent_id === user.id && ps.student_id === e.student_id))
        .map((e) => e.class_id);
      if (!classIds.includes(a.class_id)) return null;
    }
    return this.hydrateAssignment(a, studentId, user);
  }

  createAssignment(user, payload) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('Solo tutores pueden publicar tareas'), { status: 403 });
    const cls = this.data.classes.find((c) => c.id === payload.class_id && (c.tutor_id === user.id || this.isAdmin(user)));
    if (!cls) throw Object.assign(new Error('Clase no encontrada'), { status: 404 });
    const row = {
      id: uuid(),
      class_id: cls.id,
      tutor_id: user.id,
      title: payload.title,
      description: payload.description || '',
      due_date: payload.due_date,
      attachment_url: payload.attachment_url || (payload.attachments && payload.attachments[0]?.url) || null,
      attachment_name: payload.attachment_name || (payload.attachments && payload.attachments[0]?.name) || null,
      attachments: payload.attachments || [],
      max_files: Math.min(10, Math.max(1, Number(payload.max_files) || 1)),
      max_score: Number(payload.max_score) > 0 ? Number(payload.max_score) : 10,
      weight: Number(payload.weight) > 0 ? Number(payload.weight) : 1,
      status: 'publicada',
      created_at: new Date().toISOString(),
    };
    this.data.assignments.unshift(row);
    const studentIds = this.data.class_enrollments.filter((e) => e.class_id === cls.id).map((e) => e.student_id);
    const parentIds = this.data.parent_students.filter((ps) => studentIds.includes(ps.student_id)).map((ps) => ps.parent_id);
    for (const pid of [...new Set(parentIds)]) {
      this.pushNotification(pid, {
        title: `Nueva tarea: ${row.title}`,
        body: `${user.full_name} publicó una tarea para ${cls.name}.`,
        type: 'tarea',
        link: `/tareas/${row.id}`,
      });
    }
    this.save();
    return this.hydrateAssignment(row, null, user);
  }

  submitAssignment(user, assignmentId, studentId, files, notes) {
    if (user.role !== 'parent') throw Object.assign(new Error('Solo padres pueden entregar'), { status: 403 });
    const a = this.data.assignments.find((x) => x.id === assignmentId);
    if (!a) throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    studentId = this.resolveStudentId(user, studentId);
    if (!this.canAccessStudent(user, studentId)) throw Object.assign(new Error('Alumno no autorizado'), { status: 403 });
    const enrolled = this.data.class_enrollments.some((e) => e.class_id === a.class_id && e.student_id === studentId);
    if (!enrolled) throw Object.assign(new Error('El alumno no está en esta clase'), { status: 403 });
    const late = new Date() > new Date(a.due_date);
    const existing = this.data.assignment_submissions.find((s) => s.assignment_id === assignmentId && s.student_id === studentId);
    const row = existing || {
      id: uuid(),
      assignment_id: assignmentId,
      student_id: studentId,
      uploaded_by: user.id,
      file_url: null,
      file_name: null,
      files: [],
      notes: '',
      status: 'entregada',
      tutor_feedback: null,
      grade: null,
      submitted_at: new Date().toISOString(),
    };
    const incoming = (files || []).filter(Boolean);
    const max = a.max_files || 1;
    if (incoming.length > max) {
      throw Object.assign(new Error(`Esta tarea admite como máximo ${max} archivo(s)`), { status: 400 });
    }
    if (incoming.length) {
      row.files = incoming.map((f) => ({ url: f.url, name: f.originalname || f.name }));
      row.file_url = row.files[0].url;
      row.file_name = row.files[0].name;
    }
    row.notes = notes || row.notes;
    row.uploaded_by = user.id;
    row.status = late ? 'tardia' : 'entregada';
    row.submitted_at = new Date().toISOString();
    if (!existing) this.data.assignment_submissions.push(row);
    this.pushNotification(a.tutor_id, {
      title: 'Nueva entrega de tarea',
      body: `${user.full_name} entregó "${a.title}".`,
      type: 'tarea',
      link: `/tareas/${a.id}`,
    });
    this.save();
    return this.hydrateAssignment(a, studentId, user);
  }

  reviewSubmission(user, assignmentId, submissionId, feedback, status, grade) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const a = this.data.assignments.find((x) => x.id === assignmentId && (x.tutor_id === user.id || this.isAdmin(user)));
    if (!a) throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    const sub = this.data.assignment_submissions.find((s) => s.id === submissionId && s.assignment_id === assignmentId);
    if (!sub) throw Object.assign(new Error('Entrega no encontrada'), { status: 404 });
    sub.tutor_feedback = feedback || sub.tutor_feedback;
    sub.status = status || 'revisada';
    if (grade !== undefined && grade !== null && grade !== '') {
      const n = Number(grade);
      const max = a.max_score == null ? 10 : Number(a.max_score);
      if (Number.isNaN(n) || n < 0 || n > max) {
        throw Object.assign(new Error(`La nota debe estar entre 0 y ${max}`), { status: 400 });
      }
      sub.grade = n;
    }
    const parentId = this.data.parent_students.find((ps) => ps.student_id === sub.student_id)?.parent_id;
    if (parentId) {
      this.pushNotification(parentId, {
        title: sub.grade != null ? `Calificación: ${sub.grade}/${a.max_score || 10}` : 'Tarea revisada',
        body: `${user.full_name} revisó "${a.title}".`,
        type: 'tarea',
        link: `/tareas/${a.id}`,
      });
    }
    this.save();
    return this.hydrateAssignment(a, sub.student_id, user);
  }

  getMessages(user, folder = 'inbox') {
    if (folder === 'sent') {
      return this.data.messages
        .filter((m) => m.sender_id === user.id)
        .map((m) => this.hydrateMessage(m, user.id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    const recIds = this.data.message_recipients.filter((r) => r.recipient_id === user.id).map((r) => r.message_id);
    return this.data.messages
      .filter((m) => recIds.includes(m.id))
      .map((m) => this.hydrateMessage(m, user.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  namedProfile(id) {
    const p = this.getProfile(id);
    const pub = this.profilePublic(p);
    if (!pub) return { id, full_name: 'Usuario', email: '', role: '', role_label: 'Usuario' };
    return {
      ...pub,
      full_name: pub.full_name || pub.email || 'Usuario',
      role_label: this.roleLabel(p.role),
    };
  }

  hydrateMessage(m, userId) {
    const recipients = this.data.message_recipients
      .filter((r) => r.message_id === m.id)
      .map((r) => ({ ...r, profile: this.namedProfile(r.recipient_id) }));
    const mine = recipients.find((r) => r.recipient_id === userId);
    return {
      ...m,
      sender: this.namedProfile(m.sender_id),
      recipients,
      read_at: mine?.read_at || (m.sender_id === userId ? m.created_at : null),
    };
  }

  getMessage(user, id) {
    const m = this.data.messages.find((x) => x.id === id);
    if (!m) return null;
    const isSender = m.sender_id === user.id;
    const isRec = this.data.message_recipients.some((r) => r.message_id === id && r.recipient_id === user.id);
    if (!isSender && !isRec) return null;
    return this.hydrateMessage(m, user.id);
  }

  sendMessage(user, { recipientIds, subject, body, parentId, toAll }) {
    const allowed = this.getContacts(user).map((c) => c.id);
    let recs = (recipientIds || []).filter((id) => id && id !== user.id);
    if (toAll || recs.includes('__all__')) recs = allowed.slice();
    recs = [...new Set(recs.filter((id) => allowed.includes(id)))];
    if (!recs.length) throw Object.assign(new Error('Selecciona al menos un destinatario válido'), { status: 400 });
    if (!subject || !body) throw Object.assign(new Error('Asunto y mensaje son obligatorios'), { status: 400 });
    const msg = {
      id: uuid(),
      sender_id: user.id,
      subject: subject.trim(),
      body: body.trim(),
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
    };
    this.data.messages.unshift(msg);
    for (const rid of recs) {
      this.data.message_recipients.push({
        id: uuid(),
        message_id: msg.id,
        recipient_id: rid,
        read_at: null,
      });
      this.pushNotification(rid, {
        title: `Correo de ${user.full_name}`,
        body: subject.trim(),
        type: 'mensaje',
        link: `/correo/${msg.id}`,
      });
    }
    this.save();
    return this.hydrateMessage(msg, user.id);
  }

  markMessageRead(user, id) {
    const rec = this.data.message_recipients.find((r) => r.message_id === id && r.recipient_id === user.id);
    if (rec && !rec.read_at) {
      rec.read_at = new Date().toISOString();
      this.save();
    }
    return this.getMessage(user, id);
  }

  roleLabel(role) {
    return { parent: 'Padre de familia', tutor: 'Tutor', admin: 'Administración' }[role] || role || 'Usuario';
  }

  asContact(p, extra = '') {
    if (!p) return null;
    const pub = this.profilePublic(p);
    return {
      ...pub,
      role_label: this.roleLabel(p.role),
      extra,
    };
  }

  getContacts(user) {
    const self = user.id;
    const uniq = (arr) => {
      const seen = new Set();
      return arr.filter((c) => c && c.id && c.id !== self && !seen.has(c.id) && seen.add(c.id));
    };
    const admins = this.data.profiles.filter((p) => p.role === 'admin').map((p) => this.asContact(p));
    const tutors = this.data.profiles.filter((p) => p.role === 'tutor').map((p) => this.asContact(p, p.subject || ''));

    if (this.isAdmin(user)) {
      return uniq(this.data.profiles.map((p) => this.asContact(p, p.subject || '')));
    }
    if (user.role === 'parent') {
      const kids = this.childrenOf(user.id);
      const classIds = this.data.class_enrollments
        .filter((e) => kids.some((k) => k.id === e.student_id))
        .map((e) => e.class_id);
      const ofKids = this.data.classes
        .filter((c) => classIds.includes(c.id))
        .map((c) => this.asContact(this.getProfile(c.tutor_id), c.subject));
      return uniq([...ofKids, ...admins]);
    }
    const students = this.studentsOfTutor(user.id);
    const parentIds = [...new Set(this.data.parent_students.filter((ps) => students.some((s) => s.id === ps.student_id)).map((ps) => ps.parent_id))];
    const parents = parentIds.map((id) => {
      const kids = this.childrenOf(id).filter((k) => students.some((s) => s.id === k.id));
      return this.asContact(this.getProfile(id), kids.map((k) => k.first_name).join(', '));
    });
    return uniq([...parents, ...tutors, ...admins]);
  }

  getNotifications(user) {
    return this.data.notifications
      .filter((n) => n.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  markNotificationRead(user, id) {
    const n = this.data.notifications.find((x) => x.id === id && x.user_id === user.id);
    if (n && !n.read_at) {
      n.read_at = new Date().toISOString();
      this.save();
    }
    return n;
  }

  markAllNotificationsRead(user) {
    const now = new Date().toISOString();
    for (const n of this.data.notifications) {
      if (n.user_id === user.id && !n.read_at) n.read_at = now;
    }
    this.save();
    return this.getNotifications(user);
  }

  pushNotification(userId, { title, body, type, link }) {
    this.data.notifications.unshift({
      id: uuid(),
      user_id: userId,
      title,
      body: body || '',
      type: type || 'sistema',
      link: link || null,
      read_at: null,
      created_at: new Date().toISOString(),
    });
  }

  getPayments(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    if (!studentId) return { student: null, year: this.activeYear(), payments: [] };
    if (!this.canAccessStudent(user, studentId)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const year = this.activeYear();
    const student = this.data.students.find((s) => s.id === studentId);
    const payments = this.data.payments
      .filter((p) => p.student_id === studentId && p.academic_year_id === year.id)
      .map((p) => ({
        ...p,
        month_name: this.monthName(p.month),
        receipts: this.data.payment_receipts.filter((r) => r.payment_id === p.id),
      }))
      .sort((a, b) => {
        const ao = a.month >= 9 ? a.month : a.month + 12;
        const bo = b.month >= 9 ? b.month : b.month + 12;
        return ao - bo;
      });
    return { student, year, payments };
  }

  getAllPaymentsForTutor(user) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const students = this.isAdmin(user) ? this.data.students : this.studentsOfTutor(user.id);
    const year = this.activeYear();
    return students.map((s) => ({
      student: s,
      payments: this.data.payments
        .filter((p) => p.student_id === s.id && p.academic_year_id === year.id)
        .map((p) => ({
          ...p,
          month_name: this.monthName(p.month),
          receipts: this.data.payment_receipts.filter((r) => r.payment_id === p.id),
        })),
    }));
  }

  uploadReceipt(user, paymentId, file, notes) {
    if (user.role !== 'parent') throw Object.assign(new Error('Solo padres suben comprobantes'), { status: 403 });
    const pay = this.data.payments.find((p) => p.id === paymentId);
    if (!pay) throw Object.assign(new Error('Pago no encontrado'), { status: 404 });
    if (!this.canAccessStudent(user, pay.student_id)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const rec = {
      id: uuid(),
      payment_id: pay.id,
      uploaded_by: user.id,
      file_url: file?.url || null,
      file_name: file?.originalname || null,
      notes: notes || '',
      status: 'pendiente',
      reviewed_by: null,
      review_notes: null,
      uploaded_at: new Date().toISOString(),
      reviewed_at: null,
    };
    this.data.payment_receipts.push(rec);
    pay.status = 'en_revision';
    const tutors = this.classesForStudent(pay.student_id).map((c) => c.tutor_id);
    for (const tid of [...new Set(tutors)]) {
      this.pushNotification(tid, {
        title: 'Comprobante por revisar',
        body: `${user.full_name} subió un comprobante de ${this.monthName(pay.month)}.`,
        type: 'pago',
        link: '/pagos',
      });
    }
    this.save();
    return this.getPayments(user, pay.student_id);
  }

  reviewReceipt(user, receiptId, status, reviewNotes) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const rec = this.data.payment_receipts.find((r) => r.id === receiptId);
    if (!rec) throw Object.assign(new Error('Comprobante no encontrado'), { status: 404 });
    if (!['aprobado', 'rechazado'].includes(status)) {
      throw Object.assign(new Error('Estado inválido'), { status: 400 });
    }
    rec.status = status;
    rec.reviewed_by = user.id;
    rec.review_notes = reviewNotes || '';
    rec.reviewed_at = new Date().toISOString();
    const pay = this.data.payments.find((p) => p.id === rec.payment_id);
    pay.status = status === 'aprobado' ? 'pagado' : 'rechazado';
    this.pushNotification(rec.uploaded_by, {
      title: status === 'aprobado' ? 'Pago aprobado' : 'Comprobante rechazado',
      body: `Colegiatura de ${this.monthName(pay.month)} ${pay.year}: ${status}.`,
      type: 'pago',
      link: '/pagos',
    });
    this.save();
    return rec;
  }

  getSchedule(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    const slots = (user.role === 'tutor' || this.isAdmin(user))
      ? this.data.schedule_slots.filter((s) => this.isAdmin(user) || this.data.classes.some((c) => c.id === s.class_id && c.tutor_id === user.id))
      : this.data.schedule_slots.filter((s) => this.data.class_enrollments.some((e) => e.class_id === s.class_id && e.student_id === studentId));
    const days = [1, 2, 3, 4, 5].map((weekday) => ({
      weekday,
      name: ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][weekday],
      slots: slots
        .filter((s) => s.weekday === weekday)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((s) => {
          const cls = this.hydrateClass(this.data.classes.find((c) => c.id === s.class_id));
          return { ...s, class: cls };
        }),
    }));
    return {
      student: this.data.students.find((s) => s.id === studentId) || null,
      days,
    };
  }

  getStudentInfo(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    if (!studentId || !this.canAccessStudent(user, studentId)) return null;
    const student = this.data.students.find((s) => s.id === studentId);
    const parents = this.data.parent_students
      .filter((ps) => ps.student_id === studentId)
      .map((ps) => ({ ...this.profilePublic(this.getProfile(ps.parent_id)), relationship: ps.relationship }));
    return {
      student,
      parents,
      classes: this.classesForStudent(studentId),
      year: this.activeYear(),
      can_edit: user.role === 'parent' || this.isAdmin(user),
    };
  }

  updateStudent(user, studentId, payload) {
    if (!this.canAccessStudent(user, studentId)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    if (user.role !== 'parent' && !this.isAdmin(user)) {
      throw Object.assign(new Error('Solo el padre o administración editan la ficha'), { status: 403 });
    }
    const student = this.data.students.find((s) => s.id === studentId);
    if (!student) throw Object.assign(new Error('Alumno no encontrado'), { status: 404 });
    const health = ['allergies', 'disability', 'special_notes', 'blood_type', 'emergency_contact'];
    for (const k of health) {
      if (payload[k] !== undefined) student[k] = String(payload[k] ?? '');
    }
    if (this.isAdmin(user)) {
      for (const k of ['first_name', 'last_name', 'grade', 'section', 'birth_date']) {
        if (payload[k] !== undefined) student[k] = payload[k];
      }
    }
    this.save();
    return this.getStudentInfo(user, studentId);
  }

  listTutorRoster(user) {
    const students = this.isAdmin(user) ? this.data.students : this.studentsOfTutor(user.id);
    return students.map((s) => {
      const parents = this.data.parent_students
        .filter((ps) => ps.student_id === s.id)
        .map((ps) => ({ ...this.profilePublic(this.getProfile(ps.parent_id)), relationship: ps.relationship }));
      const myClasses = this.classesForStudent(s.id).filter((c) => this.isAdmin(user) || c.tutor_id === user.id);
      const pending = this.data.assignments.filter((a) => {
        const enrolled = this.data.class_enrollments.some((e) => e.class_id === a.class_id && e.student_id === s.id);
        if (!enrolled) return false;
        if (!this.isAdmin(user) && a.tutor_id !== user.id) return false;
        const sub = this.data.assignment_submissions.find((x) => x.assignment_id === a.id && x.student_id === s.id);
        return !sub;
      }).length;
      return { ...s, parents, classes: myClasses, pending_tasks: pending };
    });
  }

  getEvents(user) {
    const today = new Date().toISOString().slice(0, 10);
    let events = this.data.calendar_events.slice();
    if (user.role === 'parent') {
      const kids = this.childrenOf(user.id).map((k) => k.id);
      const classIds = this.data.class_enrollments.filter((e) => kids.includes(e.student_id)).map((e) => e.class_id);
      events = events.filter((ev) => !ev.class_id && !ev.student_id || kids.includes(ev.student_id) || classIds.includes(ev.class_id));
    } else if (user.role === 'tutor') {
      const classIds = this.data.classes.filter((c) => c.tutor_id === user.id).map((c) => c.id);
      events = events.filter((ev) => !ev.class_id && !ev.student_id || classIds.includes(ev.class_id) || ev.created_by === user.id);
    }
    const hydrate = (ev) => ({
      ...ev,
      creator: this.profilePublic(this.getProfile(ev.created_by)),
      class: ev.class_id ? this.data.classes.find((c) => c.id === ev.class_id) : null,
    });
    const recent = events.filter((e) => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date)).map(hydrate);
    const past = events.filter((e) => e.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date)).map(hydrate);
    return { recent, past };
  }

  createEvent(user, payload) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const row = {
      id: uuid(),
      title: payload.title,
      description: payload.description || '',
      event_date: payload.event_date,
      event_type: payload.event_type || 'evento',
      class_id: payload.class_id || null,
      student_id: payload.student_id || null,
      academic_year_id: this.activeYear()?.id,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };
    if (!row.title || !row.event_date) throw Object.assign(new Error('Título y fecha son obligatorios'), { status: 400 });
    this.data.calendar_events.push(row);
    this.save();
    return row;
  }

  deleteEvent(user, id) {
    const ev = this.data.calendar_events.find((e) => e.id === id);
    if (!ev) throw Object.assign(new Error('Evento no encontrado'), { status: 404 });
    if (ev.created_by !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    this.data.calendar_events = this.data.calendar_events.filter((e) => e.id !== id);
    this.save();
    return { ok: true };
  }

  getGallery() {
    return (this.data.gallery || [])
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map((g) => ({ ...g, tutor: this.profilePublic(this.getProfile(g.tutor_id)) }));
  }

  addGallery(user, file, caption) {
    if (user.role !== 'tutor' && !this.isAdmin(user)) throw Object.assign(new Error('Solo profesores suben a la galería'), { status: 403 });
    if (!file) throw Object.assign(new Error('Adjunta una imagen'), { status: 400 });
    const row = {
      id: uuid(),
      tutor_id: user.id,
      caption: caption || '',
      image_url: file.url,
      file_name: file.originalname,
      created_at: new Date().toISOString(),
    };
    this.data.gallery.unshift(row);
    this.save();
    return { ...row, tutor: this.profilePublic(this.getProfile(user.id)) };
  }

  deleteGallery(user, id) {
    const g = this.data.gallery.find((x) => x.id === id);
    if (!g) throw Object.assign(new Error('Foto no encontrada'), { status: 404 });
    if (g.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    this.data.gallery = this.data.gallery.filter((x) => x.id !== id);
    this.save();
    return { ok: true };
  }

  updateAssignment(user, id, payload, file) {
    const a = this.data.assignments.find((x) => x.id === id);
    if (!a) throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    if (a.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    if (payload.title !== undefined) a.title = payload.title;
    if (payload.description !== undefined) a.description = payload.description;
    if (payload.due_date !== undefined) a.due_date = payload.due_date;
    if (payload.status !== undefined) a.status = payload.status;
    if (payload.class_id) a.class_id = payload.class_id;
    if (payload.max_files !== undefined) a.max_files = Math.min(10, Math.max(1, Number(payload.max_files) || 1));
    if (payload.max_score !== undefined) a.max_score = Number(payload.max_score) > 0 ? Number(payload.max_score) : 10;
    if (payload.weight !== undefined) a.weight = Number(payload.weight) > 0 ? Number(payload.weight) : 1;
    const extraFiles = payload.attachments;
    if (Array.isArray(extraFiles) && extraFiles.length) {
      a.attachments = [...(a.attachments || []), ...extraFiles];
      a.attachment_url = extraFiles[0].url;
      a.attachment_name = extraFiles[0].name;
    }
    if (file) {
      const item = { url: file.url, name: file.originalname };
      a.attachments = [...(a.attachments || []), item];
      a.attachment_url = item.url;
      a.attachment_name = item.name;
    }
    this.save();
    return this.hydrateAssignment(a, null, user);
  }

  deleteAssignment(user, id) {
    const a = this.data.assignments.find((x) => x.id === id);
    if (!a) throw Object.assign(new Error('Tarea no encontrada'), { status: 404 });
    if (a.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    this.data.assignments = this.data.assignments.filter((x) => x.id !== id);
    this.data.assignment_submissions = this.data.assignment_submissions.filter((s) => s.assignment_id !== id);
    this.save();
    return { ok: true };
  }

  addScheduleSlot(user, payload) {
    const cls = this.data.classes.find((c) => c.id === payload.class_id);
    if (!cls) throw Object.assign(new Error('Clase no encontrada'), { status: 404 });
    if (cls.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    const row = {
      id: uuid(),
      class_id: cls.id,
      weekday: Number(payload.weekday),
      start_time: payload.start_time,
      end_time: payload.end_time,
      room: payload.room || cls.room,
    };
    if (!row.weekday || !row.start_time || !row.end_time) {
      throw Object.assign(new Error('Día y horario son obligatorios'), { status: 400 });
    }
    this.data.schedule_slots.push(row);
    this.save();
    return { ...row, class: this.hydrateClass(cls) };
  }

  updateScheduleSlot(user, id, payload) {
    const slot = this.data.schedule_slots.find((s) => s.id === id);
    if (!slot) throw Object.assign(new Error('Horario no encontrado'), { status: 404 });
    const cls = this.data.classes.find((c) => c.id === slot.class_id);
    if (cls.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    if (payload.weekday !== undefined) slot.weekday = Number(payload.weekday);
    if (payload.start_time) slot.start_time = payload.start_time;
    if (payload.end_time) slot.end_time = payload.end_time;
    if (payload.room !== undefined) slot.room = payload.room;
    this.save();
    return { ...slot, class: this.hydrateClass(cls) };
  }

  deleteScheduleSlot(user, id) {
    const slot = this.data.schedule_slots.find((s) => s.id === id);
    if (!slot) throw Object.assign(new Error('Horario no encontrado'), { status: 404 });
    const cls = this.data.classes.find((c) => c.id === slot.class_id);
    if (cls.tutor_id !== user.id && !this.isAdmin(user)) throw Object.assign(new Error('No autorizado'), { status: 403 });
    this.data.schedule_slots = this.data.schedule_slots.filter((s) => s.id !== id);
    this.save();
    return { ok: true };
  }

  createReset(userId, days = 7) {
    const token = uuid();
    this.data.password_resets = this.data.password_resets || [];
    this.data.password_resets.push({
      token,
      user_id: userId,
      expires_at: new Date(Date.now() + days * 86400000).toISOString(),
      used_at: null,
    });
    return token;
  }

  changePassword(user, current, next) {
    const p = this.getProfile(user.id);
    if (!p) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (current && !bcrypt.compareSync(current, p.passwordHash)) {
      throw Object.assign(new Error('La contraseña actual no coincide'), { status: 400 });
    }
    if (!next || String(next).length < 6) throw Object.assign(new Error('La nueva contraseña debe tener al menos 6 caracteres'), { status: 400 });
    p.passwordHash = bcrypt.hashSync(next, 10);
    p.must_change_password = false;
    this.save();
    return this.profilePublic(p);
  }

  resetPassword(token, next) {
    const row = (this.data.password_resets || []).find((r) => r.token === token && !r.used_at);
    if (!row) throw Object.assign(new Error('El enlace no es válido'), { status: 400 });
    if (new Date(row.expires_at) < new Date()) throw Object.assign(new Error('El enlace caducó'), { status: 400 });
    const p = this.getProfile(row.user_id);
    if (!p) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (!next || String(next).length < 6) throw Object.assign(new Error('La nueva contraseña debe tener al menos 6 caracteres'), { status: 400 });
    p.passwordHash = bcrypt.hashSync(next, 10);
    p.must_change_password = false;
    row.used_at = new Date().toISOString();
    this.save();
    return this.profilePublic(p);
  }

  adminListUsers() {
    return this.data.profiles.map((p) => ({
      ...this.profilePublic(p),
      role_label: this.roleLabel(p.role),
      students: p.role === 'parent' ? this.childrenOf(p.id) : [],
    }));
  }

  adminUpdateUser(id, payload) {
    const p = this.getProfile(id);
    if (!p) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (payload.full_name) p.full_name = payload.full_name.trim();
    if (payload.phone !== undefined) p.phone = payload.phone;
    if (payload.subject !== undefined) p.subject = payload.subject;
    if (payload.email) {
      const email = payload.email.trim().toLowerCase();
      if (this.data.profiles.some((x) => x.email === email && x.id !== id)) {
        throw Object.assign(new Error('Ese correo ya está en uso'), { status: 409 });
      }
      p.email = email;
    }
    if (payload.role && ['parent', 'tutor', 'admin'].includes(payload.role)) p.role = payload.role;
    if (payload.student_id && p.role === 'parent') {
      this.adminLinkParent(p.id, payload.student_id, payload.relationship || 'padre');
    }
    this.save();
    return this.profilePublic(p);
  }

  adminDeleteUser(actor, id) {
    if (actor.id === id) throw Object.assign(new Error('No puedes borrar tu propia cuenta'), { status: 400 });
    const p = this.getProfile(id);
    if (!p) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (p.role === 'admin') {
      const admins = this.data.profiles.filter((x) => x.role === 'admin');
      if (admins.length <= 1) throw Object.assign(new Error('Debe quedar al menos un administrador'), { status: 400 });
    }
    this.data.parent_students = this.data.parent_students.filter((x) => x.parent_id !== id);
    this.data.profiles = this.data.profiles.filter((x) => x.id !== id);
    this.save();
    return { ok: true };
  }

  adminDeleteStudent(id) {
    const student = this.data.students.find((s) => s.id === id);
    if (!student) throw Object.assign(new Error('Alumno no encontrado'), { status: 404 });
    this.data.students = this.data.students.filter((s) => s.id !== id);
    this.data.parent_students = this.data.parent_students.filter((x) => x.student_id !== id);
    this.data.class_enrollments = this.data.class_enrollments.filter((x) => x.student_id !== id);
    const payIds = this.data.payments.filter((p) => p.student_id === id).map((p) => p.id);
    this.data.payments = this.data.payments.filter((p) => p.student_id !== id);
    this.data.payment_receipts = this.data.payment_receipts.filter((r) => !payIds.includes(r.payment_id));
    this.data.assignment_submissions = this.data.assignment_submissions.filter((s) => s.student_id !== id);
    this.data.calendar_events = this.data.calendar_events.filter((e) => e.student_id !== id);
    this.save();
    return { ok: true };
  }

  getStudentGrades(user, studentId) {
    studentId = this.resolveStudentId(user, studentId);
    if (!studentId || !this.canAccessStudent(user, studentId)) {
      throw Object.assign(new Error('No autorizado'), { status: 403 });
    }
    const student = this.data.students.find((s) => s.id === studentId);
    const classes = this.classesForStudent(studentId);
    const subjects = classes.map((cls) => this.gradeSubject(cls, studentId));
    const withNotes = subjects.filter((s) => s.graded_count > 0);
    const year_average = withNotes.length
      ? Math.round((withNotes.reduce((acc, s) => acc + s.average, 0) / withNotes.length) * 100) / 100
      : null;
    return { student, year: this.activeYear(), subjects, year_average };
  }

  gradeSubject(cls, studentId) {
    const asgs = this.data.assignments.filter((a) => a.class_id === cls.id);
    const items = asgs.map((a) => {
      const sub = this.data.assignment_submissions.find((s) => s.assignment_id === a.id && s.student_id === studentId);
      const max = a.max_score == null ? 10 : Number(a.max_score);
      const weight = a.weight == null ? 1 : Number(a.weight);
      const grade = sub && sub.grade != null ? Number(sub.grade) : null;
      const percent = grade != null ? Math.round((grade / max) * 10000) / 100 : null;
      return {
        assignment_id: a.id,
        title: a.title,
        due_date: a.due_date,
        max_score: max,
        weight,
        grade,
        percent,
        feedback: sub?.tutor_feedback || '',
        status: sub?.status || 'pendiente',
      };
    });
    const graded = items.filter((i) => i.grade != null);
    const weightSum = graded.reduce((a, i) => a + i.weight, 0) || 1;
    const average = graded.length
      ? Math.round((graded.reduce((a, i) => a + (i.grade / i.max_score) * i.weight, 0) / weightSum) * 10 * 100) / 100
      : null;
    const itemsWithContrib = items.map((i) => ({
      ...i,
      contribution: i.grade != null ? Math.round(((i.grade / i.max_score) * i.weight / weightSum) * 10000) / 100 : 0,
    }));
    return {
      class: { id: cls.id, name: cls.name, subject: cls.subject, color: cls.color, tutor: cls.tutor },
      items: itemsWithContrib,
      average,
      graded_count: graded.length,
      total_count: items.length,
    };
  }

  getTutorGradebook(user) {
    const classes = this.isAdmin(user) ? this.data.classes.map((c) => this.hydrateClass(c)) : this.classesForTutor(user.id);
    return classes.map((cls) => {
      const studentIds = this.data.class_enrollments.filter((e) => e.class_id === cls.id).map((e) => e.student_id);
      const students = studentIds.map((id) => this.data.students.find((s) => s.id === id)).filter(Boolean);
      const assignments = this.data.assignments.filter((a) => a.class_id === cls.id);
      const rows = students.map((st) => {
        const subject = this.gradeSubject(cls, st.id);
        return { student: st, average: subject.average, items: subject.items };
      });
      return { class: cls, assignments, students: rows };
    });
  }

  listMailOutbox() {
    return (this.data.mail_outbox || []).map((m) => {
      const profile = this.data.profiles.find((p) => p.email === m.to);
      return {
        ...m,
        to_name: profile?.full_name || m.to,
        role_label: this.roleLabel(profile?.role),
      };
    });
  }

  adminCreateUser({ email, full_name, role, phone, subject, student_id, relationship }) {
    if (!email || !full_name || !role) throw Object.assign(new Error('Nombre, correo y rol son obligatorios'), { status: 400 });
    if (!['parent', 'tutor', 'admin'].includes(role)) throw Object.assign(new Error('Rol inválido'), { status: 400 });
    if (this.data.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
      throw Object.assign(new Error('Ese correo ya está registrado'), { status: 409 });
    }
    const temp = this.tempPassword();
    const row = {
      id: uuid(),
      email: email.trim().toLowerCase(),
      passwordHash: bcrypt.hashSync(temp, 10),
      full_name: full_name.trim(),
      role,
      phone: phone || '',
      subject: role === 'tutor' ? (subject || '') : null,
      must_change_password: true,
    };
    this.data.profiles.push(row);
    if (role === 'parent' && student_id) {
      this.data.parent_students.push({
        id: uuid(),
        parent_id: row.id,
        student_id,
        relationship: relationship || 'padre',
      });
    }
    const token = this.createReset(row.id);
    this.save();
    return { user: this.profilePublic(row), tempPassword: temp, resetToken: token };
  }

  adminCreateStudent(payload) {
    const year = this.activeYear();
    if (!payload.first_name || !payload.last_name || !payload.grade) {
      throw Object.assign(new Error('Nombre, apellido y grado son obligatorios'), { status: 400 });
    }
    const student = {
      id: uuid(),
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      grade: payload.grade,
      section: payload.section || 'A',
      photo_url: null,
      academic_year_id: year.id,
      birth_date: payload.birth_date || null,
      allergies: payload.allergies || '',
      disability: payload.disability || '',
      special_notes: payload.special_notes || '',
      blood_type: payload.blood_type || '',
      emergency_contact: payload.emergency_contact || '',
    };
    this.data.students.push(student);
    if (payload.parent_id) {
      this.data.parent_students.push({
        id: uuid(),
        parent_id: payload.parent_id,
        student_id: student.id,
        relationship: payload.relationship || 'padre',
      });
    }
    const classIds = payload.class_ids || [];
    for (const cid of classIds) {
      if (this.data.classes.some((c) => c.id === cid)) {
        this.data.class_enrollments.push({ id: uuid(), class_id: cid, student_id: student.id });
      }
    }
    const months = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
    for (const month of months) {
      const y = month >= 9 ? Number(year.start_date.slice(0, 4)) : Number(year.end_date.slice(0, 4));
      this.data.payments.push({
        id: uuid(),
        student_id: student.id,
        academic_year_id: year.id,
        month,
        year: y,
        concept: 'Colegiatura',
        amount: Number(payload.amount || 2500),
        due_date: `${y}-${String(month).padStart(2, '0')}-05`,
        status: 'pendiente',
      });
    }
    this.save();
    return student;
  }

  adminLinkParent(parentId, studentId, relationship) {
    if (!this.getProfile(parentId) || !this.data.students.find((s) => s.id === studentId)) {
      throw Object.assign(new Error('Padre o alumno no encontrado'), { status: 404 });
    }
    if (!this.data.parent_students.some((x) => x.parent_id === parentId && x.student_id === studentId)) {
      this.data.parent_students.push({ id: uuid(), parent_id: parentId, student_id: studentId, relationship: relationship || 'padre' });
      this.save();
    }
    return { ok: true };
  }
}

module.exports = new Store();
