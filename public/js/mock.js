(function (w) {
  const KEY = 'rayuela_mock_v2';
  const MONTHS = ['', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const IDS = {
    year: 'a1e10000-0000-4000-8000-000000000001',
    admin: 'a1e10000-0000-4000-8000-000000000009',
    parentEduardo: 'a1e10000-0000-4000-8000-000000000010',
    parentLaura: 'a1e10000-0000-4000-8000-000000000011',
    tutorAna: 'a1e10000-0000-4000-8000-000000000020',
    tutorLuis: 'a1e10000-0000-4000-8000-000000000021',
    tutorMarta: 'a1e10000-0000-4000-8000-000000000022',
    tutorPedro: 'a1e10000-0000-4000-8000-000000000023',
    kyara: 'a1e10000-0000-4000-8000-000000000030',
    diego: 'a1e10000-0000-4000-8000-000000000031',
    mateo: 'a1e10000-0000-4000-8000-000000000032',
    classMath: 'a1e10000-0000-4000-8000-000000000040',
    classSpanish: 'a1e10000-0000-4000-8000-000000000041',
    classScience: 'a1e10000-0000-4000-8000-000000000042',
    classPE: 'a1e10000-0000-4000-8000-000000000043',
    asg1: 'a1e10000-0000-4000-8000-000000000050',
    asg2: 'a1e10000-0000-4000-8000-000000000051',
    asg3: 'a1e10000-0000-4000-8000-000000000052',
    asg4: 'a1e10000-0000-4000-8000-000000000053',
    asg5: 'a1e10000-0000-4000-8000-000000000054',
    msg1: 'a1e10000-0000-4000-8000-000000000060',
    msg2: 'a1e10000-0000-4000-8000-000000000061',
  };

  const uid = () => (w.crypto && w.crypto.randomUUID ? w.crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2, 10));
  const fail = (msg, status = 400) => { const e = new Error(msg); e.status = status; throw e; };
  const now = () => new Date().toISOString();
  const ph = (label) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect fill="#d9efe4" width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" fill="#1f6f62" font-family="Nunito,sans-serif" font-size="26">${label}</text></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  function payId(student, month) {
    const m = String(month).padStart(2, '0');
    const who = student === IDS.kyara ? '0' : student === IDS.diego ? '1' : '2';
    return `a1e10000-0000-4000-8000-00000001${who}${m}`;
  }

  function buildSeed() {
    const profiles = [
      { id: IDS.admin, email: 'admin@rayuela.edu', password: 'admin123', full_name: 'Administración Rayuela', role: 'admin', phone: '555-100-0000', subject: null, must_change_password: false },
      { id: IDS.parentEduardo, email: 'padre@rayuela.edu', password: 'padre123', full_name: 'Eduardo Altamirano', role: 'parent', phone: '555-120-3344', subject: null, must_change_password: false },
      { id: IDS.parentLaura, email: 'laura@rayuela.edu', password: 'padre123', full_name: 'Laura Méndez', role: 'parent', phone: '555-221-7788', subject: null, must_change_password: false },
      { id: IDS.tutorAna, email: 'tutor@rayuela.edu', password: 'tutor123', full_name: 'Ana García', role: 'tutor', phone: '555-440-1122', subject: 'Matemáticas', must_change_password: false },
      { id: IDS.tutorLuis, email: 'luis@rayuela.edu', password: 'tutor123', full_name: 'Luis Ortega', role: 'tutor', phone: '555-440-2233', subject: 'Español', must_change_password: false },
      { id: IDS.tutorMarta, email: 'marta@rayuela.edu', password: 'tutor123', full_name: 'Marta Ruiz', role: 'tutor', phone: '555-440-3344', subject: 'Ciencias', must_change_password: false },
      { id: IDS.tutorPedro, email: 'pedro@rayuela.edu', password: 'tutor123', full_name: 'Pedro Nava', role: 'tutor', phone: '555-440-4455', subject: 'Educación Física', must_change_password: false },
    ];
    const academic_years = [{ id: IDS.year, name: '2026-2027', start_date: '2026-09-01', end_date: '2027-06-30', is_active: true }];
    const students = [
      { id: IDS.kyara, first_name: 'Kyara', last_name: 'Altamirano', grade: '3° Primaria', section: 'A', photo_url: null, academic_year_id: IDS.year, birth_date: '2017-04-12', allergies: 'Ninguna conocida', disability: '', special_notes: 'Le gusta leer en voz alta; se distrae si hay mucho ruido.', blood_type: 'O+', emergency_contact: 'Eduardo Altamirano · 555-120-3344' },
      { id: IDS.diego, first_name: 'Diego', last_name: 'Méndez', grade: '3° Primaria', section: 'A', photo_url: null, academic_year_id: IDS.year, birth_date: '2017-08-03', allergies: 'Alergia al cacahuate', disability: '', special_notes: 'Usa inhalador ocasional (asma leve).', blood_type: 'A+', emergency_contact: 'Laura Méndez · 555-221-7788' },
      { id: IDS.mateo, first_name: 'Mateo', last_name: 'Altamirano', grade: '1° Primaria', section: 'A', photo_url: null, academic_year_id: IDS.year, birth_date: '2019-11-02', allergies: 'Ninguna conocida', disability: '', special_notes: 'Hermano de Kyara.', blood_type: 'O+', emergency_contact: 'Eduardo Altamirano · 555-120-3344' },
    ];
    const parent_students = [
      { id: 'ps1', parent_id: IDS.parentEduardo, student_id: IDS.kyara, relationship: 'padre' },
      { id: 'ps2', parent_id: IDS.parentLaura, student_id: IDS.diego, relationship: 'madre' },
      { id: 'ps3', parent_id: IDS.parentEduardo, student_id: IDS.mateo, relationship: 'padre' },
    ];
    const classes = [
      { id: IDS.classMath, name: 'Matemáticas 3A', subject: 'Matemáticas', grade: '3° Primaria', section: 'A', room: 'Aula 12', color: '#2196F3', tutor_id: IDS.tutorAna, academic_year_id: IDS.year },
      { id: IDS.classSpanish, name: 'Español 3A', subject: 'Español', grade: '3° Primaria', section: 'A', room: 'Aula 12', color: '#7B3A8E', tutor_id: IDS.tutorLuis, academic_year_id: IDS.year },
      { id: IDS.classScience, name: 'Ciencias 3A', subject: 'Ciencias', grade: '3° Primaria', section: 'A', room: 'Lab 2', color: '#43A047', tutor_id: IDS.tutorMarta, academic_year_id: IDS.year },
      { id: IDS.classPE, name: 'Educación Física 3A', subject: 'Educación Física', grade: '3° Primaria', section: 'A', room: 'Patio', color: '#FB8C00', tutor_id: IDS.tutorPedro, academic_year_id: IDS.year },
    ];
    const class_enrollments = [];
    for (const st of [IDS.kyara, IDS.diego, IDS.mateo]) {
      for (const cls of classes) class_enrollments.push({ id: uid(), class_id: cls.id, student_id: st });
    }
    const schedule_slots = [
      { id: 's1', class_id: IDS.classMath, weekday: 1, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
      { id: 's2', class_id: IDS.classSpanish, weekday: 1, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
      { id: 's3', class_id: IDS.classScience, weekday: 1, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },
      { id: 's4', class_id: IDS.classPE, weekday: 1, start_time: '10:50', end_time: '11:40', room: 'Patio' },
      { id: 's5', class_id: IDS.classSpanish, weekday: 2, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
      { id: 's6', class_id: IDS.classMath, weekday: 2, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
      { id: 's7', class_id: IDS.classScience, weekday: 2, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },
      { id: 's8', class_id: IDS.classMath, weekday: 3, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
      { id: 's9', class_id: IDS.classSpanish, weekday: 3, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
      { id: 's10', class_id: IDS.classPE, weekday: 3, start_time: '10:00', end_time: '10:50', room: 'Patio' },
      { id: 's11', class_id: IDS.classScience, weekday: 4, start_time: '08:00', end_time: '08:50', room: 'Lab 2' },
      { id: 's12', class_id: IDS.classMath, weekday: 4, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
      { id: 's13', class_id: IDS.classSpanish, weekday: 4, start_time: '10:00', end_time: '10:50', room: 'Aula 12' },
      { id: 's14', class_id: IDS.classMath, weekday: 5, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
      { id: 's15', class_id: IDS.classSpanish, weekday: 5, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
      { id: 's16', class_id: IDS.classScience, weekday: 5, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },
      { id: 's17', class_id: IDS.classPE, weekday: 5, start_time: '10:50', end_time: '11:40', room: 'Patio' },
    ];
    const assignments = [
      { id: IDS.asg5, class_id: IDS.classSpanish, tutor_id: IDS.tutorLuis, title: 'Cuento de otoño', description: 'Escribe un cuento corto inspirado en el otoño.', due_date: '2026-09-18T23:59:00.000Z', attachment_url: null, attachment_name: null, attachments: [], max_files: 2, max_score: 10, weight: 1, status: 'publicada', created_at: '2026-09-10T15:00:00.000Z' },
      { id: IDS.asg2, class_id: IDS.classSpanish, tutor_id: IDS.tutorLuis, title: 'Lectura: El principito, capítulos 1 a 3', description: 'Lee los capítulos 1 a 3 y responde las 5 preguntas.', due_date: '2026-09-25T23:59:00.000Z', attachment_url: null, attachment_name: null, attachments: [], max_files: 2, max_score: 10, weight: 1, status: 'publicada', created_at: '2026-09-18T14:00:00.000Z' },
      { id: IDS.asg1, class_id: IDS.classMath, tutor_id: IDS.tutorAna, title: 'Fracciones equivalentes', description: 'Resuelve la hoja de ejercicios de fracciones equivalentes.', due_date: '2026-09-26T23:59:00.000Z', attachment_url: null, attachment_name: null, attachments: [], max_files: 3, max_score: 10, weight: 1, status: 'publicada', created_at: '2026-09-20T16:30:00.000Z' },
      { id: IDS.asg3, class_id: IDS.classScience, tutor_id: IDS.tutorMarta, title: 'Experimento: el ciclo del agua', description: 'Realiza el experimento del ciclo del agua. Sube 2 fotos y una explicación.', due_date: '2026-09-30T23:59:00.000Z', attachment_url: null, attachment_name: null, attachments: [], max_files: 3, max_score: 10, weight: 1, status: 'publicada', created_at: '2026-09-22T13:00:00.000Z' },
      { id: IDS.asg4, class_id: IDS.classMath, tutor_id: IDS.tutorAna, title: 'Tablas de multiplicar del 6 al 9', description: 'Practica las tablas 6, 7, 8 y 9. Sube un audio, video u hoja.', due_date: '2026-10-03T23:59:00.000Z', attachment_url: null, attachment_name: null, attachments: [], max_files: 2, max_score: 10, weight: 1, status: 'publicada', created_at: '2026-09-23T17:00:00.000Z' },
    ];
    const assignment_submissions = [
      { id: 'sub1', assignment_id: IDS.asg5, student_id: IDS.kyara, uploaded_by: IDS.parentEduardo, file_url: null, file_name: 'cuento-otono-kyara.pdf', files: [{ url: ph('Cuento de otoño'), name: 'cuento-otono-kyara.pdf' }], notes: 'Lo escribió el fin de semana.', status: 'revisada', tutor_feedback: 'Muy creativo el final. Cuidar las tildes.', grade: 9, submitted_at: '2026-09-17T20:12:00.000Z' },
    ];
    const calendar_events = [
      { id: 'ev1', title: 'Inicio de clases', description: 'Bienvenida al ciclo 2026-2027', event_date: '2026-09-01', event_type: 'evento', class_id: null, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
      { id: 'ev2', title: 'Junta con padres', description: 'Presentación de profesores', event_date: '2026-09-04', event_type: 'reunion', class_id: null, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
      { id: 'ev3', title: 'Día de la Independencia', description: 'No hay clases', event_date: '2026-09-16', event_type: 'feriado', class_id: null, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
      { id: 'ev4', title: 'Festival de otoño', description: 'Actividades en el patio', event_date: '2026-09-25', event_type: 'evento', class_id: null, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorLuis, created_at: '2026-09-10T10:00:00.000Z' },
      { id: 'ev5', title: 'Evaluación diagnóstica', description: 'Matemáticas — aula 12', event_date: '2026-09-28', event_type: 'clase', class_id: IDS.classMath, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorAna, created_at: '2026-09-15T10:00:00.000Z' },
      { id: 'ev6', title: 'Taller de lectura', description: 'Biblioteca, 12:00', event_date: '2026-10-08', event_type: 'evento', class_id: IDS.classSpanish, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorLuis, created_at: '2026-09-20T10:00:00.000Z' },
      { id: 'ev7', title: 'Ensayo Día de Muertos', description: 'Ofrenda del grupo 3A', event_date: '2026-10-28', event_type: 'evento', class_id: null, student_id: null, academic_year_id: IDS.year, created_by: IDS.admin, created_at: '2026-09-22T10:00:00.000Z' },
      { id: 'ev8', title: 'Excursión al planetario', description: 'Salida 8:30', event_date: '2026-11-12', event_type: 'evento', class_id: IDS.classScience, student_id: null, academic_year_id: IDS.year, created_by: IDS.tutorMarta, created_at: '2026-09-22T11:00:00.000Z' },
    ];
    const payments = [];
    for (const student of [IDS.kyara, IDS.diego, IDS.mateo]) {
      for (const month of [9, 10, 11, 12, 1, 2, 3, 4, 5, 6]) {
        const year = month >= 9 ? 2026 : 2027;
        let status = 'pendiente';
        if (student === IDS.kyara && month === 9) status = 'pagado';
        if (student === IDS.diego && month === 9) status = 'pagado';
        if (student === IDS.kyara && month === 10) status = 'en_revision';
        payments.push({ id: payId(student, month), student_id: student, academic_year_id: IDS.year, month, year, concept: 'Colegiatura', amount: 2500, due_date: `${year}-${String(month).padStart(2, '0')}-05`, status });
      }
    }
    const payment_receipts = [
      { id: 'rc1', payment_id: payId(IDS.kyara, 9), uploaded_by: IDS.parentEduardo, file_url: null, file_name: 'comprobante-septiembre.pdf', notes: 'Transferencia SPEI', status: 'aprobado', reviewed_by: IDS.tutorAna, review_notes: 'Pago verificado', uploaded_at: '2026-09-03T11:20:00.000Z', reviewed_at: '2026-09-03T16:00:00.000Z' },
      { id: 'rc2', payment_id: payId(IDS.kyara, 10), uploaded_by: IDS.parentEduardo, file_url: null, file_name: 'comprobante-octubre.pdf', notes: 'Pago en ventanilla', status: 'pendiente', reviewed_by: null, review_notes: null, uploaded_at: '2026-09-22T09:40:00.000Z', reviewed_at: null },
    ];
    const messages = [
      { id: IDS.msg1, sender_id: IDS.tutorAna, subject: 'Bienvenida al ciclo 2026-2027', body: 'Estimado Eduardo:\n\nLe doy la bienvenida a Kyara al grupo 3°A.\n\nSaludos,\nAna García', parent_id: null, created_at: '2026-09-02T09:00:00.000Z' },
      { id: IDS.msg2, sender_id: IDS.parentEduardo, subject: 'Consulta sobre la tarea de fracciones', body: 'Hola maestra Ana:\n\nKyara tiene duda en el ejercicio 4.\n\nGracias,\nEduardo', parent_id: null, created_at: '2026-09-23T19:30:00.000Z' },
    ];
    const message_recipients = [
      { id: 'mr1', message_id: IDS.msg1, recipient_id: IDS.parentEduardo, read_at: '2026-09-02T12:10:00.000Z' },
      { id: 'mr2', message_id: IDS.msg2, recipient_id: IDS.tutorAna, read_at: null },
    ];
    const notifications = [
      { id: 'n1', user_id: IDS.parentEduardo, title: 'Nueva tarea: Fracciones equivalentes', body: 'Ana García publicó una tarea. Entrega: 26 sep.', type: 'tarea', link: `/tareas/${IDS.asg1}`, read_at: null, created_at: '2026-09-20T16:31:00.000Z' },
      { id: 'n2', user_id: IDS.parentEduardo, title: 'Nueva tarea: Lectura El principito', body: 'Luis Ortega publicó una tarea. Entrega: 25 sep.', type: 'tarea', link: `/tareas/${IDS.asg2}`, read_at: '2026-09-19T10:00:00.000Z', created_at: '2026-09-18T14:01:00.000Z' },
      { id: 'n3', user_id: IDS.parentEduardo, title: 'Correo de Ana García', body: 'Bienvenida al ciclo 2026-2027', type: 'mensaje', link: `/correo/${IDS.msg1}`, read_at: '2026-09-02T12:10:00.000Z', created_at: '2026-09-02T09:00:00.000Z' },
      { id: 'n4', user_id: IDS.parentEduardo, title: 'Comprobante de octubre en revisión', body: 'Tu comprobante está pendiente de validación.', type: 'pago', link: '/pagos', read_at: null, created_at: '2026-09-22T09:41:00.000Z' },
      { id: 'n5', user_id: IDS.tutorAna, title: 'Correo de Eduardo Altamirano', body: 'Consulta sobre la tarea de fracciones', type: 'mensaje', link: `/correo/${IDS.msg2}`, read_at: null, created_at: '2026-09-23T19:30:00.000Z' },
      { id: 'n6', user_id: IDS.tutorAna, title: 'Comprobante por revisar', body: 'Eduardo Altamirano subió el comprobante de octubre.', type: 'pago', link: '/pagos', read_at: null, created_at: '2026-09-22T09:41:00.000Z' },
    ];
    const gallery = [
      { id: 'g1', tutor_id: IDS.tutorAna, caption: 'Primer día de clases en Matemáticas 3A', image_url: ph('Matemáticas 3A'), file_name: 'primer-dia.png', created_at: '2026-09-01T14:20:00.000Z' },
      { id: 'g2', tutor_id: IDS.tutorLuis, caption: 'Rincón de lectura del aula 12', image_url: ph('Rincón de lectura'), file_name: 'lectura.png', created_at: '2026-09-10T11:05:00.000Z' },
    ];
    return { profiles, academic_years, students, parent_students, classes, class_enrollments, schedule_slots, assignments, assignment_submissions, calendar_events, messages, message_recipients, notifications, payments, payment_receipts, gallery, mail_outbox: [], password_resets: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seed = buildSeed();
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }

  let data = load();
  const save = () => localStorage.setItem(KEY, JSON.stringify(data));

  const pub = (p) => {
    if (!p) return null;
    const { password, ...rest } = p;
    return rest;
  };
  const roleLabel = (role) => ({ parent: 'Padre de familia', tutor: 'Tutor', admin: 'Administración' }[role] || role);
  const named = (id) => {
    const p = data.profiles.find((x) => x.id === id);
    const out = pub(p);
    if (!out) return { id, full_name: 'Usuario', email: '', role: '', role_label: 'Usuario' };
    return { ...out, full_name: out.full_name || out.email, role_label: roleLabel(out.role) };
  };
  const isAdmin = (u) => u?.role === 'admin' || u?.email === 'admin@rayuela.edu';
  const profile = (id) => data.profiles.find((p) => p.id === id);
  const year = () => data.academic_years.find((y) => y.is_active) || data.academic_years[0];
  const childrenOf = (pid) => data.parent_students.filter((x) => x.parent_id === pid).map((l) => ({ ...data.students.find((s) => s.id === l.student_id), relationship: l.relationship })).filter(Boolean);
  const studentsOfTutor = (tid) => {
    const classIds = data.classes.filter((c) => c.tutor_id === tid).map((c) => c.id);
    const ids = [...new Set(data.class_enrollments.filter((e) => classIds.includes(e.class_id)).map((e) => e.student_id))];
    return ids.map((id) => data.students.find((s) => s.id === id)).filter(Boolean);
  };
  const hydrateClass = (c) => c ? { ...c, tutor: pub(profile(c.tutor_id)), student_count: data.class_enrollments.filter((e) => e.class_id === c.id).length } : null;
  const classesForStudent = (sid) => data.classes.filter((c) => data.class_enrollments.some((e) => e.class_id === c.id && e.student_id === sid)).map(hydrateClass);
  const classesForTutor = (tid) => data.classes.filter((c) => c.tutor_id === tid).map(hydrateClass);
  const canAccess = (u, sid) => {
    if (!sid) return false;
    if (isAdmin(u)) return data.students.some((s) => s.id === sid);
    if (u.role === 'parent') return data.parent_students.some((x) => x.parent_id === u.id && x.student_id === sid);
    if (u.role === 'tutor') return studentsOfTutor(u.id).some((s) => s.id === sid);
    return false;
  };
  const resolveSid = (u, requested) => {
    if (requested && canAccess(u, requested)) return requested;
    if (u.role === 'parent') return childrenOf(u.id)[0]?.id || null;
    if (isAdmin(u)) return data.students[0]?.id || null;
    return studentsOfTutor(u.id)[0]?.id || null;
  };
  const notify = (userId, { title, body, type, link }) => {
    data.notifications.unshift({ id: uid(), user_id: userId, title, body: body || '', type: type || 'sistema', link: link || null, read_at: null, created_at: now() });
  };
  const subFiles = (s) => {
    const files = Array.isArray(s.files) ? s.files.slice() : [];
    if (s.file_url && !files.some((f) => f.url === s.file_url)) files.unshift({ url: s.file_url, name: s.file_name });
    return files;
  };
  const hydrateAsg = (a, studentId, user) => {
    const cls = data.classes.find((c) => c.id === a.class_id);
    const subs = data.assignment_submissions.filter((s) => s.assignment_id === a.id);
    const mine = studentId ? subs.find((s) => s.student_id === studentId) : null;
    return {
      ...a,
      max_files: a.max_files || 1,
      max_score: a.max_score == null ? 10 : Number(a.max_score),
      weight: a.weight == null ? 1 : Number(a.weight),
      attachments: a.attachments || (a.attachment_url ? [{ url: a.attachment_url, name: a.attachment_name }] : []),
      class: cls ? { id: cls.id, name: cls.name, subject: cls.subject, color: cls.color, tutor_id: cls.tutor_id } : null,
      tutor: pub(profile(a.tutor_id)),
      submission: mine ? { ...mine, files: subFiles(mine) } : null,
      submissions: (user?.role === 'tutor' || isAdmin(user)) ? subs.map((s) => ({ ...s, files: subFiles(s), student: data.students.find((st) => st.id === s.student_id) })) : undefined,
      submission_count: subs.length,
    };
  };
  const hydrateMsg = (m, userId) => {
    const recipients = data.message_recipients.filter((r) => r.message_id === m.id).map((r) => ({ ...r, profile: named(r.recipient_id) }));
    const mine = recipients.find((r) => r.recipient_id === userId);
    return { ...m, sender: named(m.sender_id), recipients, read_at: mine?.read_at || (m.sender_id === userId ? m.created_at : null) };
  };
  const gradeSubject = (cls, studentId) => {
    const asgs = data.assignments.filter((a) => a.class_id === cls.id);
    const items = asgs.map((a) => {
      const sub = data.assignment_submissions.find((s) => s.assignment_id === a.id && s.student_id === studentId);
      const max = a.max_score == null ? 10 : Number(a.max_score);
      const weight = a.weight == null ? 1 : Number(a.weight);
      const grade = sub && sub.grade != null ? Number(sub.grade) : null;
      return { assignment_id: a.id, title: a.title, due_date: a.due_date, max_score: max, weight, grade, percent: grade != null ? Math.round((grade / max) * 10000) / 100 : null, feedback: sub?.tutor_feedback || '', status: sub?.status || 'pendiente' };
    });
    const graded = items.filter((i) => i.grade != null);
    const weightSum = graded.reduce((a, i) => a + i.weight, 0) || 1;
    const average = graded.length ? Math.round((graded.reduce((a, i) => a + (i.grade / i.max_score) * i.weight, 0) / weightSum) * 10 * 100) / 100 : null;
    return {
      class: { id: cls.id, name: cls.name, subject: cls.subject, color: cls.color, tutor: cls.tutor },
      items: items.map((i) => ({ ...i, contribution: i.grade != null ? Math.round(((i.grade / i.max_score) * i.weight / weightSum) * 10000) / 100 : 0 })),
      average,
      graded_count: graded.length,
      total_count: items.length,
    };
  };
  const contactsOf = (user) => {
    const uniq = (arr) => { const s = new Set(); return arr.filter((c) => c && c.id && c.id !== user.id && !s.has(c.id) && s.add(c.id)); };
    const asC = (p, extra = '') => p ? { ...pub(p), role_label: roleLabel(p.role), extra } : null;
    const admins = data.profiles.filter((p) => p.role === 'admin').map((p) => asC(p));
    const tutors = data.profiles.filter((p) => p.role === 'tutor').map((p) => asC(p, p.subject || ''));
    if (isAdmin(user)) return uniq(data.profiles.map((p) => asC(p, p.subject || '')));
    if (user.role === 'parent') {
      const kids = childrenOf(user.id);
      const classIds = data.class_enrollments.filter((e) => kids.some((k) => k.id === e.student_id)).map((e) => e.class_id);
      const ofKids = data.classes.filter((c) => classIds.includes(c.id)).map((c) => asC(profile(c.tutor_id), c.subject));
      return uniq([...ofKids, ...admins]);
    }
    const students = studentsOfTutor(user.id);
    const parentIds = [...new Set(data.parent_students.filter((ps) => students.some((s) => s.id === ps.student_id)).map((ps) => ps.parent_id))];
    const parents = parentIds.map((id) => asC(profile(id), childrenOf(id).filter((k) => students.some((s) => s.id === k.id)).map((k) => k.first_name).join(', ')));
    return uniq([...parents, ...tutors, ...admins]);
  };

  function userFromToken(token) {
    const raw = token || '';
    const id = raw.startsWith('mock.') ? raw.slice(5) : raw;
    const p = data.profiles.find((x) => x.id === id);
    if (!p) fail('Inicia sesión', 401);
    return pub(p);
  }

  function getAssignments(user, studentId) {
    studentId = resolveSid(user, studentId);
    let list;
    if (user.role === 'tutor') list = data.assignments.filter((a) => a.tutor_id === user.id);
    else if (isAdmin(user)) list = data.assignments;
    else {
      const classIds = studentId ? data.class_enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id) : [];
      list = data.assignments.filter((a) => classIds.includes(a.class_id));
    }
    return list.map((a) => hydrateAsg(a, studentId, user)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function studentInfo(user, studentId) {
    studentId = resolveSid(user, studentId);
    if (!studentId || !canAccess(user, studentId)) return null;
    const student = data.students.find((s) => s.id === studentId);
    const parents = data.parent_students.filter((ps) => ps.student_id === studentId).map((ps) => ({ ...pub(profile(ps.parent_id)), relationship: ps.relationship }));
    return { student, parents, classes: classesForStudent(studentId), year: year(), can_edit: user.role === 'parent' || isAdmin(user) };
  }

  function paymentsOf(user, studentId) {
    studentId = resolveSid(user, studentId);
    if (!studentId) return { student: null, year: year(), payments: [] };
    if (!canAccess(user, studentId)) fail('No autorizado', 403);
    const student = data.students.find((s) => s.id === studentId);
    const payments = data.payments
      .filter((p) => p.student_id === studentId && p.academic_year_id === year().id)
      .map((p) => ({ ...p, month_name: MONTHS[p.month], receipts: data.payment_receipts.filter((r) => r.payment_id === p.id) }))
      .sort((a, b) => (a.month >= 9 ? a.month : a.month + 12) - (b.month >= 9 ? b.month : b.month + 12));
    return { student, year: year(), payments };
  }

  const Store = {
    login(email, password) {
      const user = data.profiles.find((p) => p.email.toLowerCase() === String(email || '').toLowerCase());
      if (!user || user.password !== String(password || '')) return null;
      return { token: `mock.${user.id}`, user: pub(user), must_change_password: !!user.must_change_password };
    },
    me(user) {
      let students = [];
      if (user.role === 'parent') students = childrenOf(user.id);
      else if (user.role === 'tutor') students = studentsOfTutor(user.id);
      else if (isAdmin(user)) students = data.students;
      return { user: pub(profile(user.id)), year: year(), years: data.academic_years, students };
    },
    dashboard(user, studentId) {
      studentId = resolveSid(user, studentId);
      const unreadMessages = data.message_recipients.filter((r) => r.recipient_id === user.id && !r.read_at).length;
      const unreadNotifs = data.notifications.filter((n) => n.user_id === user.id && !n.read_at).length;
      const assignments = getAssignments(user, studentId).slice(0, 4);
      const upcoming = assignments.filter((a) => new Date(a.due_date) >= new Date()).slice(0, 3);
      let paymentsSummary = null;
      if (studentId) {
        const pays = paymentsOf(user, studentId).payments;
        paymentsSummary = { total: pays.length, pagado: pays.filter((p) => p.status === 'pagado').length, pendiente: pays.filter((p) => p.status === 'pendiente' || p.status === 'vencido').length, en_revision: pays.filter((p) => p.status === 'en_revision').length };
      }
      return { unreadMessages, unreadNotifs, upcoming, paymentsSummary, student: data.students.find((s) => s.id === studentId) || null, classes: studentId ? classesForStudent(studentId) : classesForTutor(user.id) };
    },
    classes(user, studentId) {
      const sid = resolveSid(user, studentId);
      if (isAdmin(user)) return data.classes.map(hydrateClass);
      if (user.role === 'tutor') return classesForTutor(user.id);
      return classesForStudent(sid);
    },
    calendar(user, y, m, studentId) {
      studentId = resolveSid(user, studentId);
      const startStr = new Date(Date.UTC(Number(y), Number(m) - 1, 1)).toISOString().slice(0, 10);
      const endStr = new Date(Date.UTC(Number(y), Number(m), 0)).toISOString().slice(0, 10);
      const classIds = studentId
        ? data.class_enrollments.filter((e) => e.student_id === studentId).map((e) => e.class_id)
        : data.classes.filter((c) => c.tutor_id === user.id).map((c) => c.id);
      const events = data.calendar_events.filter((ev) => {
        if (ev.event_date < startStr || ev.event_date > endStr) return false;
        if (!ev.class_id && !ev.student_id) return true;
        if (ev.student_id === studentId) return true;
        if (ev.class_id && classIds.includes(ev.class_id)) return true;
        return false;
      }).map((ev) => ({ ...ev, source: 'event' }));
      const asg = data.assignments.filter((a) => classIds.includes(a.class_id) && a.due_date.slice(0, 10) >= startStr && a.due_date.slice(0, 10) <= endStr).map((a) => ({ id: `asg-${a.id}`, title: a.title, description: a.description, event_date: a.due_date.slice(0, 10), event_type: 'tarea', class_id: a.class_id, source: 'assignment', assignment_id: a.id }));
      const pays = studentId ? data.payments.filter((p) => p.student_id === studentId && p.due_date >= startStr && p.due_date <= endStr).map((p) => ({ id: `pay-${p.id}`, title: `${p.concept} (${MONTHS[p.month]})`, description: `$${Number(p.amount).toFixed(2)} — ${p.status}`, event_date: p.due_date, event_type: 'pago', source: 'payment', payment_id: p.id })) : [];
      return { year: Number(y), month: Number(m), events: [...events, ...asg, ...pays] };
    },
    assignments: getAssignments,
    assignment(user, id, studentId) {
      const a = data.assignments.find((x) => x.id === id);
      if (!a) return null;
      return hydrateAsg(a, resolveSid(user, studentId), user);
    },
    createAssignment(user, body) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('Solo tutores pueden publicar tareas', 403);
      const cls = data.classes.find((c) => c.id === body.class_id && (c.tutor_id === user.id || isAdmin(user)));
      if (!cls) fail('Clase no encontrada', 404);
      const files = body.__files || [];
      const attachments = files.map((f) => ({ url: f.url, name: f.name }));
      const row = { id: uid(), class_id: cls.id, tutor_id: user.id, title: body.title, description: body.description || '', due_date: body.due_date, attachment_url: attachments[0]?.url || null, attachment_name: attachments[0]?.name || null, attachments, max_files: Math.min(10, Math.max(1, Number(body.max_files) || 1)), max_score: Number(body.max_score) > 0 ? Number(body.max_score) : 10, weight: Number(body.weight) > 0 ? Number(body.weight) : 1, status: 'publicada', created_at: now() };
      data.assignments.unshift(row);
      const studentIds = data.class_enrollments.filter((e) => e.class_id === cls.id).map((e) => e.student_id);
      const parentIds = [...new Set(data.parent_students.filter((ps) => studentIds.includes(ps.student_id)).map((ps) => ps.parent_id))];
      parentIds.forEach((pid) => notify(pid, { title: `Nueva tarea: ${row.title}`, body: `${user.full_name} publicó una tarea para ${cls.name}.`, type: 'tarea', link: `/tareas/${row.id}` }));
      save();
      return hydrateAsg(row, null, user);
    },
    updateAssignment(user, id, body) {
      const a = data.assignments.find((x) => x.id === id);
      if (!a) fail('Tarea no encontrada', 404);
      if (a.tutor_id !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      if (body.title !== undefined) a.title = body.title;
      if (body.description !== undefined) a.description = body.description;
      if (body.due_date !== undefined) a.due_date = body.due_date;
      if (body.class_id) a.class_id = body.class_id;
      if (body.max_files !== undefined) a.max_files = Math.min(10, Math.max(1, Number(body.max_files) || 1));
      if (body.max_score !== undefined) a.max_score = Number(body.max_score) > 0 ? Number(body.max_score) : 10;
      if (body.weight !== undefined) a.weight = Number(body.weight) > 0 ? Number(body.weight) : 1;
      const files = body.__files || [];
      if (files.length) {
        a.attachments = [...(a.attachments || []), ...files.map((f) => ({ url: f.url, name: f.name }))];
        a.attachment_url = files[0].url;
        a.attachment_name = files[0].name;
      }
      save();
      return hydrateAsg(a, null, user);
    },
    deleteAssignment(user, id) {
      const a = data.assignments.find((x) => x.id === id);
      if (!a) fail('Tarea no encontrada', 404);
      if (a.tutor_id !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      data.assignments = data.assignments.filter((x) => x.id !== id);
      data.assignment_submissions = data.assignment_submissions.filter((s) => s.assignment_id !== id);
      save();
      return { ok: true };
    },
    submitAssignment(user, assignmentId, studentId, body) {
      if (user.role !== 'parent') fail('Solo padres pueden entregar', 403);
      const a = data.assignments.find((x) => x.id === assignmentId);
      if (!a) fail('Tarea no encontrada', 404);
      studentId = resolveSid(user, studentId || body.studentId);
      if (!canAccess(user, studentId)) fail('Alumno no autorizado', 403);
      const files = body.__files || [];
      const max = a.max_files || 1;
      if (files.length > max) fail(`Esta tarea admite como máximo ${max} archivo(s)`, 400);
      const existing = data.assignment_submissions.find((s) => s.assignment_id === assignmentId && s.student_id === studentId);
      const row = existing || { id: uid(), assignment_id: assignmentId, student_id: studentId, uploaded_by: user.id, file_url: null, file_name: null, files: [], notes: '', status: 'entregada', tutor_feedback: null, grade: null, submitted_at: now() };
      if (files.length) {
        row.files = files.map((f) => ({ url: f.url, name: f.name }));
        row.file_url = row.files[0].url;
        row.file_name = row.files[0].name;
      }
      row.notes = body.notes || row.notes;
      row.status = new Date() > new Date(a.due_date) ? 'tardia' : 'entregada';
      row.submitted_at = now();
      if (!existing) data.assignment_submissions.push(row);
      notify(a.tutor_id, { title: 'Nueva entrega de tarea', body: `${user.full_name} entregó "${a.title}".`, type: 'tarea', link: `/tareas/${a.id}` });
      save();
      return hydrateAsg(a, studentId, user);
    },
    reviewSubmission(user, assignmentId, sid, body) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('No autorizado', 403);
      const a = data.assignments.find((x) => x.id === assignmentId);
      if (!a) fail('Tarea no encontrada', 404);
      const sub = data.assignment_submissions.find((s) => s.id === sid && s.assignment_id === assignmentId);
      if (!sub) fail('Entrega no encontrada', 404);
      sub.tutor_feedback = body.feedback || sub.tutor_feedback;
      sub.status = body.status || 'revisada';
      if (body.grade !== undefined && body.grade !== null && body.grade !== '') {
        const n = Number(body.grade);
        const max = a.max_score == null ? 10 : Number(a.max_score);
        if (Number.isNaN(n) || n < 0 || n > max) fail(`La nota debe estar entre 0 y ${max}`, 400);
        sub.grade = n;
      }
      const parentId = data.parent_students.find((ps) => ps.student_id === sub.student_id)?.parent_id;
      if (parentId) notify(parentId, { title: sub.grade != null ? `Calificación: ${sub.grade}/${a.max_score || 10}` : 'Tarea revisada', body: `${user.full_name} revisó "${a.title}".`, type: 'tarea', link: `/tareas/${a.id}` });
      save();
      return hydrateAsg(a, sub.student_id, user);
    },
    messages(user, folder) {
      if (folder === 'sent') return data.messages.filter((m) => m.sender_id === user.id).map((m) => hydrateMsg(m, user.id)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const recIds = data.message_recipients.filter((r) => r.recipient_id === user.id).map((r) => r.message_id);
      return data.messages.filter((m) => recIds.includes(m.id)).map((m) => hydrateMsg(m, user.id)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    message(user, id) {
      const m = data.messages.find((x) => x.id === id);
      if (!m) return null;
      const rec = data.message_recipients.find((r) => r.message_id === id && r.recipient_id === user.id);
      if (rec && !rec.read_at) { rec.read_at = now(); save(); }
      return hydrateMsg(m, user.id);
    },
    contacts: contactsOf,
    sendMessage(user, body) {
      const allowed = contactsOf(user).map((c) => c.id);
      let recs = (body.recipientIds || []).filter((id) => id && id !== user.id);
      if (body.toAll || recs.includes('__all__')) recs = allowed.slice();
      recs = [...new Set(recs.filter((id) => allowed.includes(id)))];
      if (!recs.length) fail('Selecciona al menos un destinatario válido');
      if (!body.subject || !body.body) fail('Asunto y mensaje son obligatorios');
      const msg = { id: uid(), sender_id: user.id, subject: String(body.subject).trim(), body: String(body.body).trim(), parent_id: body.parentId || null, created_at: now() };
      data.messages.unshift(msg);
      recs.forEach((rid) => {
        data.message_recipients.push({ id: uid(), message_id: msg.id, recipient_id: rid, read_at: null });
        notify(rid, { title: `Correo de ${user.full_name}`, body: msg.subject, type: 'mensaje', link: `/correo/${msg.id}` });
      });
      save();
      return hydrateMsg(msg, user.id);
    },
    notifications: (user) => data.notifications.filter((n) => n.user_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    readNotif(user, id) {
      const n = data.notifications.find((x) => x.id === id && x.user_id === user.id);
      if (n && !n.read_at) { n.read_at = now(); save(); }
      return n;
    },
    readAll(user) {
      data.notifications.forEach((n) => { if (n.user_id === user.id && !n.read_at) n.read_at = now(); });
      save();
      return Store.notifications(user);
    },
    payments: paymentsOf,
    tutorPayments(user) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('No autorizado', 403);
      const students = isAdmin(user) ? data.students : studentsOfTutor(user.id);
      return students.map((s) => ({ student: s, payments: data.payments.filter((p) => p.student_id === s.id).map((p) => ({ ...p, month_name: MONTHS[p.month], receipts: data.payment_receipts.filter((r) => r.payment_id === p.id) })) }));
    },
    uploadReceipt(user, paymentId, body) {
      const pay = data.payments.find((p) => p.id === paymentId);
      if (!pay) fail('Pago no encontrado', 404);
      if (!canAccess(user, pay.student_id)) fail('No autorizado', 403);
      const file = (body.__files || [])[0];
      const rec = { id: uid(), payment_id: pay.id, uploaded_by: user.id, file_url: file?.url || null, file_name: file?.name || 'comprobante', notes: body.notes || '', status: 'pendiente', reviewed_by: null, review_notes: null, uploaded_at: now(), reviewed_at: null };
      data.payment_receipts.push(rec);
      pay.status = 'en_revision';
      save();
      return rec;
    },
    reviewReceipt(user, id, body) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('No autorizado', 403);
      const rec = data.payment_receipts.find((r) => r.id === id);
      if (!rec) fail('Comprobante no encontrado', 404);
      rec.status = body.status;
      rec.reviewed_by = user.id;
      rec.review_notes = body.review_notes || '';
      rec.reviewed_at = now();
      const pay = data.payments.find((p) => p.id === rec.payment_id);
      pay.status = body.status === 'aprobado' ? 'pagado' : 'rechazado';
      save();
      return rec;
    },
    schedule(user, studentId) {
      studentId = resolveSid(user, studentId);
      const slots = (user.role === 'tutor' || isAdmin(user))
        ? data.schedule_slots.filter((s) => isAdmin(user) || data.classes.some((c) => c.id === s.class_id && c.tutor_id === user.id))
        : data.schedule_slots.filter((s) => data.class_enrollments.some((e) => e.class_id === s.class_id && e.student_id === studentId));
      const days = [1, 2, 3, 4, 5].map((weekday) => ({
        weekday,
        name: ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][weekday],
        slots: slots.filter((s) => s.weekday === weekday).sort((a, b) => a.start_time.localeCompare(b.start_time)).map((s) => ({ ...s, class: hydrateClass(data.classes.find((c) => c.id === s.class_id)) })),
      }));
      return { student: data.students.find((s) => s.id === studentId) || null, days };
    },
    addSlot(user, body) {
      const cls = data.classes.find((c) => c.id === body.class_id);
      if (!cls) fail('Clase no encontrada', 404);
      if (cls.tutor_id !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      const row = { id: uid(), class_id: cls.id, weekday: Number(body.weekday), start_time: body.start_time, end_time: body.end_time, room: body.room || cls.room };
      data.schedule_slots.push(row);
      save();
      return { ...row, class: hydrateClass(cls) };
    },
    updateSlot(user, id, body) {
      const slot = data.schedule_slots.find((s) => s.id === id);
      if (!slot) fail('Horario no encontrado', 404);
      const cls = data.classes.find((c) => c.id === slot.class_id);
      if (cls.tutor_id !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      if (body.weekday !== undefined) slot.weekday = Number(body.weekday);
      if (body.start_time) slot.start_time = body.start_time;
      if (body.end_time) slot.end_time = body.end_time;
      if (body.room !== undefined) slot.room = body.room;
      save();
      return { ...slot, class: hydrateClass(cls) };
    },
    deleteSlot(user, id) {
      data.schedule_slots = data.schedule_slots.filter((s) => s.id !== id);
      save();
      return { ok: true };
    },
    student: studentInfo,
    updateStudent(user, id, body) {
      if (!canAccess(user, id)) fail('No autorizado', 403);
      if (user.role !== 'parent' && !isAdmin(user)) fail('Solo el padre o administración editan la ficha', 403);
      const student = data.students.find((s) => s.id === id);
      if (!student) fail('Alumno no encontrado', 404);
      ['allergies', 'disability', 'special_notes', 'blood_type', 'emergency_contact'].forEach((k) => { if (body[k] !== undefined) student[k] = String(body[k] ?? ''); });
      if (isAdmin(user)) ['first_name', 'last_name', 'grade', 'section', 'birth_date'].forEach((k) => { if (body[k] !== undefined) student[k] = body[k]; });
      save();
      return studentInfo(user, id);
    },
    roster(user) {
      const students = isAdmin(user) ? data.students : studentsOfTutor(user.id);
      return students.map((s) => {
        const parents = data.parent_students.filter((ps) => ps.student_id === s.id).map((ps) => ({ ...pub(profile(ps.parent_id)), relationship: ps.relationship }));
        const myClasses = classesForStudent(s.id).filter((c) => isAdmin(user) || c.tutor_id === user.id);
        const pending = data.assignments.filter((a) => data.class_enrollments.some((e) => e.class_id === a.class_id && e.student_id === s.id) && (isAdmin(user) || a.tutor_id === user.id) && !data.assignment_submissions.find((x) => x.assignment_id === a.id && x.student_id === s.id)).length;
        return { ...s, parents, classes: myClasses, pending_tasks: pending };
      });
    },
    events(user) {
      const today = now().slice(0, 10);
      let events = data.calendar_events.slice();
      if (user.role === 'parent') {
        const kids = childrenOf(user.id).map((k) => k.id);
        const classIds = data.class_enrollments.filter((e) => kids.includes(e.student_id)).map((e) => e.class_id);
        events = events.filter((ev) => !ev.class_id && !ev.student_id || kids.includes(ev.student_id) || classIds.includes(ev.class_id));
      } else if (user.role === 'tutor') {
        const classIds = data.classes.filter((c) => c.tutor_id === user.id).map((c) => c.id);
        events = events.filter((ev) => !ev.class_id && !ev.student_id || classIds.includes(ev.class_id) || ev.created_by === user.id);
      }
      const hydrate = (ev) => ({ ...ev, creator: pub(profile(ev.created_by)), class: ev.class_id ? data.classes.find((c) => c.id === ev.class_id) : null });
      return { recent: events.filter((e) => e.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date)).map(hydrate), past: events.filter((e) => e.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date)).map(hydrate) };
    },
    createEvent(user, body) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('No autorizado', 403);
      if (!body.title || !body.event_date) fail('Título y fecha son obligatorios');
      const row = { id: uid(), title: body.title, description: body.description || '', event_date: body.event_date, event_type: body.event_type || 'evento', class_id: body.class_id || null, student_id: body.student_id || null, academic_year_id: year()?.id, created_by: user.id, created_at: now() };
      data.calendar_events.push(row);
      save();
      return row;
    },
    deleteEvent(user, id) {
      const ev = data.calendar_events.find((e) => e.id === id);
      if (!ev) fail('Evento no encontrado', 404);
      if (ev.created_by !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      data.calendar_events = data.calendar_events.filter((e) => e.id !== id);
      save();
      return { ok: true };
    },
    gallery: () => data.gallery.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((g) => ({ ...g, tutor: pub(profile(g.tutor_id)) })),
    addGallery(user, body) {
      if (user.role !== 'tutor' && !isAdmin(user)) fail('Solo profesores suben a la galería', 403);
      const file = (body.__files || [])[0];
      if (!file) fail('Adjunta una imagen');
      const row = { id: uid(), tutor_id: user.id, caption: body.caption || '', image_url: file.url, file_name: file.name, created_at: now() };
      data.gallery.unshift(row);
      save();
      return { ...row, tutor: pub(profile(user.id)) };
    },
    deleteGallery(user, id) {
      const g = data.gallery.find((x) => x.id === id);
      if (!g) fail('Foto no encontrada', 404);
      if (g.tutor_id !== user.id && !isAdmin(user)) fail('No autorizado', 403);
      data.gallery = data.gallery.filter((x) => x.id !== id);
      save();
      return { ok: true };
    },
    changePassword(user, body) {
      const p = profile(user.id);
      if (body.current && p.password !== body.current) fail('La contraseña actual no coincide');
      if (!body.password || String(body.password).length < 6) fail('La nueva contraseña debe tener al menos 6 caracteres');
      p.password = body.password;
      p.must_change_password = false;
      save();
      return pub(p);
    },
    adminUsers(user) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      return data.profiles.map((p) => ({ ...pub(p), role_label: roleLabel(p.role), students: p.role === 'parent' ? childrenOf(p.id) : [] }));
    },
    adminCreateUser(user, body) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      if (!body.email || !body.full_name || !body.role) fail('Nombre, correo y rol son obligatorios');
      if (data.profiles.some((p) => p.email.toLowerCase() === body.email.toLowerCase())) fail('Ese correo ya está registrado', 409);
      const temp = `Rayuela-${Math.random().toString(36).slice(2, 6)}`;
      const row = { id: uid(), email: body.email.trim().toLowerCase(), password: temp, full_name: body.full_name.trim(), role: body.role, phone: body.phone || '', subject: body.role === 'tutor' ? (body.subject || '') : null, must_change_password: true };
      data.profiles.push(row);
      if (body.role === 'parent' && body.student_id) data.parent_students.push({ id: uid(), parent_id: row.id, student_id: body.student_id, relationship: body.relationship || 'padre' });
      data.mail_outbox.unshift({ id: uid(), to: row.email, subject: 'Tu acceso a La Rayuela School', body: `Hola ${row.full_name}. Contraseña temporal: ${temp}`, sent_at: now() });
      save();
      return { user: pub(row), tempPassword: temp, resetUrl: '#/cambiar-contrasena' };
    },
    adminUpdateUser(user, id, body) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      const p = profile(id);
      if (!p) fail('Usuario no encontrado', 404);
      if (body.full_name) p.full_name = body.full_name.trim();
      if (body.phone !== undefined) p.phone = body.phone;
      if (body.subject !== undefined) p.subject = body.subject;
      if (body.email) p.email = body.email.trim().toLowerCase();
      if (body.role && ['parent', 'tutor', 'admin'].includes(body.role)) p.role = body.role;
      save();
      return pub(p);
    },
    adminDeleteUser(user, id) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      if (user.id === id) fail('No puedes borrar tu propia cuenta');
      data.profiles = data.profiles.filter((x) => x.id !== id);
      data.parent_students = data.parent_students.filter((x) => x.parent_id !== id);
      save();
      return { ok: true };
    },
    adminCreateStudent(user, body) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      if (!body.first_name || !body.last_name || !body.grade) fail('Nombre, apellido y grado son obligatorios');
      const student = { id: uid(), first_name: body.first_name.trim(), last_name: body.last_name.trim(), grade: body.grade, section: body.section || 'A', photo_url: null, academic_year_id: year().id, birth_date: body.birth_date || null, allergies: '', disability: '', special_notes: '', blood_type: '', emergency_contact: '' };
      data.students.push(student);
      if (body.parent_id) data.parent_students.push({ id: uid(), parent_id: body.parent_id, student_id: student.id, relationship: 'padre' });
      const classIds = Array.isArray(body.class_ids) ? body.class_ids : body.class_ids ? [body.class_ids] : [];
      classIds.forEach((cid) => { if (data.classes.some((c) => c.id === cid)) data.class_enrollments.push({ id: uid(), class_id: cid, student_id: student.id }); });
      save();
      return student;
    },
    adminDeleteStudent(user, id) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      data.students = data.students.filter((s) => s.id !== id);
      data.parent_students = data.parent_students.filter((x) => x.student_id !== id);
      data.class_enrollments = data.class_enrollments.filter((x) => x.student_id !== id);
      const payIds = data.payments.filter((p) => p.student_id === id).map((p) => p.id);
      data.payments = data.payments.filter((p) => p.student_id !== id);
      data.payment_receipts = data.payment_receipts.filter((r) => !payIds.includes(r.payment_id));
      data.assignment_submissions = data.assignment_submissions.filter((s) => s.student_id !== id);
      save();
      return { ok: true };
    },
    adminMail(user) {
      if (!isAdmin(user)) fail('Solo administración puede hacer esto', 403);
      return (data.mail_outbox || []).map((m) => ({ ...m, to_name: data.profiles.find((p) => p.email === m.to)?.full_name || m.to, role_label: roleLabel(data.profiles.find((p) => p.email === m.to)?.role) }));
    },
    grades(user, studentId) {
      if ((user.role === 'tutor' || isAdmin(user)) && !studentId) {
        const classes = isAdmin(user) ? data.classes.map(hydrateClass) : classesForTutor(user.id);
        return classes.map((cls) => {
          const studentIds = data.class_enrollments.filter((e) => e.class_id === cls.id).map((e) => e.student_id);
          const students = studentIds.map((id) => data.students.find((s) => s.id === id)).filter(Boolean);
          const assignments = data.assignments.filter((a) => a.class_id === cls.id);
          return { class: cls, assignments, students: students.map((st) => { const subject = gradeSubject(cls, st.id); return { student: st, average: subject.average, items: subject.items }; }) };
        });
      }
      studentId = resolveSid(user, studentId);
      if (!studentId || !canAccess(user, studentId)) fail('No autorizado', 403);
      const student = data.students.find((s) => s.id === studentId);
      const classes = classesForStudent(studentId);
      const subjects = classes.map((cls) => gradeSubject(cls, studentId));
      const withNotes = subjects.filter((s) => s.graded_count > 0);
      const year_average = withNotes.length ? Math.round((withNotes.reduce((acc, s) => acc + s.average, 0) / withNotes.length) * 100) / 100 : null;
      return { student, year: year(), subjects, year_average };
    },
    reset() {
      data = buildSeed();
      save();
    },
  };

  async function filesFrom(body) {
    if (!body || typeof body !== 'object' || typeof FormData === 'undefined') return body || {};
    if (!(body instanceof FormData)) return { ...body, __files: body.__files || [] };
    const obj = {};
    const files = [];
    for (const [k, v] of body.entries()) {
      if (v instanceof File) {
        if (v.size) {
          const url = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result);
            r.onerror = reject;
            r.readAsDataURL(v);
          });
          files.push({ field: k, name: v.name, url });
        }
      } else if (obj[k] !== undefined) obj[k] = [].concat(obj[k], v);
      else obj[k] = v;
    }
    obj.__files = files;
    return obj;
  }

  function parsePath(path) {
    const u = new URL(path, 'http://mock.local');
    return { pathname: u.pathname.replace(/\/+$/, '') || '/', query: Object.fromEntries(u.searchParams) };
  }

  async function dispatch(path, options = {}, token) {
    const method = (options.method || 'GET').toUpperCase();
    const { pathname, query } = parsePath(path);
    const body = await filesFrom(options.body);
    const authFree = pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname === '/api/auth/reset-password';
    const user = authFree ? null : userFromToken(token);

    if (pathname === '/api/auth/login' && method === 'POST') {
      const row = Store.login(body.email, body.password);
      if (!row) fail('Correo o contraseña incorrectos', 401);
      return row;
    }
    if (pathname === '/api/auth/logout') return { ok: true };
    if (pathname === '/api/auth/change-password' && method === 'POST') return { user: Store.changePassword(user, body) };
    if (pathname === '/api/me') return Store.me(user);
    if (pathname === '/api/dashboard') return Store.dashboard(user, query.studentId);
    if (pathname === '/api/classes') return Store.classes(user, query.studentId);
    if (pathname === '/api/calendar') return Store.calendar(user, query.year || new Date().getFullYear(), query.month || new Date().getMonth() + 1, query.studentId);
    if (pathname === '/api/assignments' && method === 'GET') return Store.assignments(user, query.studentId);
    if (pathname === '/api/assignments' && method === 'POST') return Store.createAssignment(user, body);
    if (pathname === '/api/messages/contacts') return Store.contacts(user);
    if (pathname === '/api/messages' && method === 'GET') return Store.messages(user, query.folder || 'inbox');
    if (pathname === '/api/messages' && method === 'POST') return Store.sendMessage(user, body);
    if (pathname === '/api/notifications' && method === 'GET') return Store.notifications(user);
    if (pathname === '/api/notifications/read-all') return Store.readAll(user);
    if (pathname === '/api/payments' && method === 'GET') return query.all === '1' ? Store.tutorPayments(user) : Store.payments(user, query.studentId);
    if (pathname === '/api/schedule' && method === 'GET') return Store.schedule(user, query.studentId);
    if (pathname === '/api/schedule' && method === 'POST') return Store.addSlot(user, body);
    if (pathname === '/api/events' && method === 'GET') return Store.events(user);
    if (pathname === '/api/events' && method === 'POST') return Store.createEvent(user, body);
    if (pathname === '/api/gallery' && method === 'GET') return Store.gallery();
    if (pathname === '/api/gallery' && method === 'POST') return Store.addGallery(user, body);
    if (pathname === '/api/roster') return Store.roster(user);
    if (pathname === '/api/admin/users' && method === 'GET') return Store.adminUsers(user);
    if (pathname === '/api/admin/users' && method === 'POST') return Store.adminCreateUser(user, body);
    if (pathname === '/api/admin/students' && method === 'POST') return Store.adminCreateStudent(user, body);
    if (pathname === '/api/admin/mail') return Store.adminMail(user);
    if (pathname === '/api/grades') return Store.grades(user, query.studentId);

    let m;
    if ((m = pathname.match(/^\/api\/students\/([^/]+)$/))) {
      if (method === 'PATCH') return Store.updateStudent(user, m[1], body);
      const row = Store.student(user, m[1]);
      if (!row) fail('Alumno no encontrado', 404);
      return row;
    }
    if ((m = pathname.match(/^\/api\/assignments\/([^/]+)\/submit$/))) return Store.submitAssignment(user, m[1], query.studentId, body);
    if ((m = pathname.match(/^\/api\/assignments\/([^/]+)\/submissions\/([^/]+)$/))) return Store.reviewSubmission(user, m[1], m[2], body);
    if ((m = pathname.match(/^\/api\/assignments\/([^/]+)$/))) {
      if (method === 'PATCH') return Store.updateAssignment(user, m[1], body);
      if (method === 'DELETE') return Store.deleteAssignment(user, m[1]);
      const row = Store.assignment(user, m[1], query.studentId);
      if (!row) fail('Tarea no encontrada', 404);
      return row;
    }
    if ((m = pathname.match(/^\/api\/messages\/([^/]+)$/))) {
      const row = Store.message(user, m[1]);
      if (!row) fail('Correo no encontrado', 404);
      return row;
    }
    if ((m = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/))) return Store.readNotif(user, m[1]);
    if ((m = pathname.match(/^\/api\/payments\/([^/]+)\/receipt$/))) return Store.uploadReceipt(user, m[1], body);
    if ((m = pathname.match(/^\/api\/receipts\/([^/]+)$/))) return Store.reviewReceipt(user, m[1], body);
    if ((m = pathname.match(/^\/api\/schedule\/([^/]+)$/))) {
      if (method === 'DELETE') return Store.deleteSlot(user, m[1]);
      return Store.updateSlot(user, m[1], body);
    }
    if ((m = pathname.match(/^\/api\/events\/([^/]+)$/))) return Store.deleteEvent(user, m[1]);
    if ((m = pathname.match(/^\/api\/gallery\/([^/]+)$/))) return Store.deleteGallery(user, m[1]);
    if ((m = pathname.match(/^\/api\/admin\/users\/([^/]+)$/))) {
      if (method === 'DELETE') return Store.adminDeleteUser(user, m[1]);
      return Store.adminUpdateUser(user, m[1], body);
    }
    if ((m = pathname.match(/^\/api\/admin\/students\/([^/]+)$/))) return Store.adminDeleteStudent(user, m[1]);
    fail('Ruta no encontrada', 404);
  }

  w.RayuelaMock = {
    dispatch,
    reset: Store.reset,
    isForced() {
      return /\.github\.io$/i.test(location.hostname) || location.protocol === 'file:';
    },
  };
})(window);
