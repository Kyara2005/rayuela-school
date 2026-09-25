const bcrypt = require('bcryptjs');

const ids = {
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

function paymentId(student, month, year) {
  const m = String(month).padStart(2, '0');
  return `a1e10000-0000-4000-8000-00000001${student === ids.kyara ? '0' : '1'}${m}`;
}

function buildSeed() {
  const passwordParent = bcrypt.hashSync('padre123', 10);
  const passwordTutor = bcrypt.hashSync('tutor123', 10);
  const passwordAdmin = bcrypt.hashSync('admin123', 10);

  const profiles = [
    {
      id: ids.admin,
      email: 'admin@rayuela.edu',
      passwordHash: passwordAdmin,
      full_name: 'Administración Rayuela',
      role: 'admin',
      phone: '555-100-0000',
      subject: null,
      must_change_password: false,
    },
    {
      id: ids.parentEduardo,
      email: 'padre@rayuela.edu',
      passwordHash: passwordParent,
      full_name: 'Eduardo Altamirano',
      role: 'parent',
      phone: '555-120-3344',
      subject: null,
      must_change_password: false,
    },
    {
      id: ids.parentLaura,
      email: 'laura@rayuela.edu',
      passwordHash: passwordParent,
      full_name: 'Laura Méndez',
      role: 'parent',
      phone: '555-221-7788',
      subject: null,
      must_change_password: false,
    },
    {
      id: ids.tutorAna,
      email: 'tutor@rayuela.edu',
      passwordHash: passwordTutor,
      full_name: 'Ana García',
      role: 'tutor',
      phone: '555-440-1122',
      subject: 'Matemáticas',
      must_change_password: false,
    },
    {
      id: ids.tutorLuis,
      email: 'luis@rayuela.edu',
      passwordHash: passwordTutor,
      full_name: 'Luis Ortega',
      role: 'tutor',
      phone: '555-440-2233',
      subject: 'Español',
      must_change_password: false,
    },
    {
      id: ids.tutorMarta,
      email: 'marta@rayuela.edu',
      passwordHash: passwordTutor,
      full_name: 'Marta Ruiz',
      role: 'tutor',
      phone: '555-440-3344',
      subject: 'Ciencias',
      must_change_password: false,
    },
    {
      id: ids.tutorPedro,
      email: 'pedro@rayuela.edu',
      passwordHash: passwordTutor,
      full_name: 'Pedro Nava',
      role: 'tutor',
      phone: '555-440-4455',
      subject: 'Educación Física',
      must_change_password: false,
    },
  ];

  const academic_years = [
    {
      id: ids.year,
      name: '2026-2027',
      start_date: '2026-09-01',
      end_date: '2027-06-30',
      is_active: true,
    },
  ];

  const students = [
    {
      id: ids.kyara,
      first_name: 'Kyara',
      last_name: 'Altamirano',
      grade: '3° Primaria',
      section: 'A',
      photo_url: null,
      academic_year_id: ids.year,
      birth_date: '2017-04-12',
      allergies: 'Ninguna conocida',
      disability: '',
      special_notes: 'Le gusta leer en voz alta; se distrae si hay mucho ruido.',
      blood_type: 'O+',
      emergency_contact: 'Eduardo Altamirano · 555-120-3344',
    },
    {
      id: ids.diego,
      first_name: 'Diego',
      last_name: 'Méndez',
      grade: '3° Primaria',
      section: 'A',
      photo_url: null,
      academic_year_id: ids.year,
      birth_date: '2017-08-03',
      allergies: 'Alergia al cacahuate',
      disability: '',
      special_notes: 'Usa inhalador ocasional (asma leve). Llevarlo a actividades físicas.',
      blood_type: 'A+',
      emergency_contact: 'Laura Méndez · 555-221-7788',
    },
  ];

  const parent_students = [
    { id: 'a1e10000-0000-4000-8000-000000000070', parent_id: ids.parentEduardo, student_id: ids.kyara, relationship: 'padre' },
    { id: 'a1e10000-0000-4000-8000-000000000071', parent_id: ids.parentLaura, student_id: ids.diego, relationship: 'madre' },
  ];

  const classes = [
    { id: ids.classMath, name: 'Matemáticas 3A', subject: 'Matemáticas', grade: '3° Primaria', section: 'A', room: 'Aula 12', color: '#2196F3', tutor_id: ids.tutorAna, academic_year_id: ids.year },
    { id: ids.classSpanish, name: 'Español 3A', subject: 'Español', grade: '3° Primaria', section: 'A', room: 'Aula 12', color: '#7B3A8E', tutor_id: ids.tutorLuis, academic_year_id: ids.year },
    { id: ids.classScience, name: 'Ciencias 3A', subject: 'Ciencias', grade: '3° Primaria', section: 'A', room: 'Lab 2', color: '#43A047', tutor_id: ids.tutorMarta, academic_year_id: ids.year },
    { id: ids.classPE, name: 'Educación Física 3A', subject: 'Educación Física', grade: '3° Primaria', section: 'A', room: 'Patio', color: '#FB8C00', tutor_id: ids.tutorPedro, academic_year_id: ids.year },
  ];

  const class_enrollments = [
    { id: 'e1', class_id: ids.classMath, student_id: ids.kyara },
    { id: 'e2', class_id: ids.classSpanish, student_id: ids.kyara },
    { id: 'e3', class_id: ids.classScience, student_id: ids.kyara },
    { id: 'e4', class_id: ids.classPE, student_id: ids.kyara },
    { id: 'e5', class_id: ids.classMath, student_id: ids.diego },
    { id: 'e6', class_id: ids.classSpanish, student_id: ids.diego },
    { id: 'e7', class_id: ids.classScience, student_id: ids.diego },
    { id: 'e8', class_id: ids.classPE, student_id: ids.diego },
  ];

  const schedule_slots = [
    { id: 's1', class_id: ids.classMath, weekday: 1, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
    { id: 's2', class_id: ids.classSpanish, weekday: 1, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
    { id: 's3', class_id: ids.classScience, weekday: 1, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },
    { id: 's4', class_id: ids.classPE, weekday: 1, start_time: '10:50', end_time: '11:40', room: 'Patio' },

    { id: 's5', class_id: ids.classSpanish, weekday: 2, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
    { id: 's6', class_id: ids.classMath, weekday: 2, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
    { id: 's7', class_id: ids.classScience, weekday: 2, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },

    { id: 's8', class_id: ids.classMath, weekday: 3, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
    { id: 's9', class_id: ids.classSpanish, weekday: 3, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
    { id: 's10', class_id: ids.classPE, weekday: 3, start_time: '10:00', end_time: '10:50', room: 'Patio' },

    { id: 's11', class_id: ids.classScience, weekday: 4, start_time: '08:00', end_time: '08:50', room: 'Lab 2' },
    { id: 's12', class_id: ids.classMath, weekday: 4, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
    { id: 's13', class_id: ids.classSpanish, weekday: 4, start_time: '10:00', end_time: '10:50', room: 'Aula 12' },

    { id: 's14', class_id: ids.classMath, weekday: 5, start_time: '08:00', end_time: '08:50', room: 'Aula 12' },
    { id: 's15', class_id: ids.classSpanish, weekday: 5, start_time: '08:50', end_time: '09:40', room: 'Aula 12' },
    { id: 's16', class_id: ids.classScience, weekday: 5, start_time: '10:00', end_time: '10:50', room: 'Lab 2' },
    { id: 's17', class_id: ids.classPE, weekday: 5, start_time: '10:50', end_time: '11:40', room: 'Patio' },
  ];

  const assignments = [
    {
      id: ids.asg5,
      class_id: ids.classSpanish,
      tutor_id: ids.tutorLuis,
      title: 'Cuento de otoño',
      description: 'Escribe un cuento corto (una cuartilla) inspirado en el otoño. Incluye título, personajes y un final inesperado.',
      due_date: '2026-09-18T23:59:00.000Z',
      attachment_url: null,
      attachment_name: null,
      status: 'publicada',
      created_at: '2026-09-10T15:00:00.000Z',
    },
    {
      id: ids.asg2,
      class_id: ids.classSpanish,
      tutor_id: ids.tutorLuis,
      title: 'Lectura: El principito, capítulos 1 a 3',
      description: 'Lee los capítulos 1 a 3 y responde las 5 preguntas del cuestionario adjunto. Sube el archivo en PDF o imagen.',
      due_date: '2026-09-25T23:59:00.000Z',
      attachment_url: null,
      attachment_name: null,
      status: 'publicada',
      created_at: '2026-09-18T14:00:00.000Z',
    },
    {
      id: ids.asg1,
      class_id: ids.classMath,
      tutor_id: ids.tutorAna,
      title: 'Fracciones equivalentes',
      description: 'Resuelve la hoja de ejercicios de fracciones equivalentes (páginas 12 y 13). Muestra el procedimiento.',
      due_date: '2026-09-26T23:59:00.000Z',
      attachment_url: null,
      attachment_name: null,
      status: 'publicada',
      created_at: '2026-09-20T16:30:00.000Z',
    },
    {
      id: ids.asg3,
      class_id: ids.classScience,
      tutor_id: ids.tutorMarta,
      title: 'Experimento: el ciclo del agua',
      description: 'Con ayuda en casa, realiza el experimento del ciclo del agua en un recipiente. Sube 2 fotos y una breve explicación.',
      due_date: '2026-09-30T23:59:00.000Z',
      attachment_url: null,
      attachment_name: null,
      status: 'publicada',
      created_at: '2026-09-22T13:00:00.000Z',
    },
    {
      id: ids.asg4,
      class_id: ids.classMath,
      tutor_id: ids.tutorAna,
      title: 'Tablas de multiplicar del 6 al 9',
      description: 'Practica las tablas 6, 7, 8 y 9. Sube un audio o video corto recitándolas, o una hoja escrita.',
      due_date: '2026-10-03T23:59:00.000Z',
      attachment_url: null,
      attachment_name: null,
      status: 'publicada',
      created_at: '2026-09-23T17:00:00.000Z',
    },
  ];

  const assignment_submissions = [
    {
      id: 'sub1',
      assignment_id: ids.asg5,
      student_id: ids.kyara,
      uploaded_by: ids.parentEduardo,
      file_url: null,
      file_name: 'cuento-otono-kyara.pdf',
      notes: 'Lo escribió el fin de semana.',
      status: 'revisada',
      tutor_feedback: 'Muy creativo el final. Cuidar las tildes en la próxima entrega.',
      submitted_at: '2026-09-17T20:12:00.000Z',
    },
  ];

  const calendar_events = [
    { id: 'ev1', title: 'Inicio de clases', description: 'Bienvenida al ciclo 2026-2027', event_date: '2026-09-01', event_type: 'evento', class_id: null, student_id: null, academic_year_id: ids.year, created_by: ids.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
    { id: 'ev2', title: 'Junta con padres', description: 'Presentación de profesores y acuerdos del ciclo', event_date: '2026-09-04', event_type: 'reunion', class_id: null, student_id: null, academic_year_id: ids.year, created_by: ids.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
    { id: 'ev3', title: 'Día de la Independencia', description: 'No hay clases', event_date: '2026-09-16', event_type: 'feriado', class_id: null, student_id: null, academic_year_id: ids.year, created_by: ids.tutorAna, created_at: '2026-08-20T10:00:00.000Z' },
    { id: 'ev4', title: 'Festival de otoño', description: 'Actividades en el patio de 10:00 a 13:00', event_date: '2026-09-25', event_type: 'evento', class_id: null, student_id: null, academic_year_id: ids.year, created_by: ids.tutorLuis, created_at: '2026-09-10T10:00:00.000Z' },
    { id: 'ev5', title: 'Evaluación diagnóstica', description: 'Matemáticas — aula 12', event_date: '2026-09-28', event_type: 'clase', class_id: ids.classMath, student_id: null, academic_year_id: ids.year, created_by: ids.tutorAna, created_at: '2026-09-15T10:00:00.000Z' },
    { id: 'ev6', title: 'Taller de lectura', description: 'Biblioteca, 12:00. Traer un cuento de casa.', event_date: '2026-10-08', event_type: 'evento', class_id: ids.classSpanish, student_id: null, academic_year_id: ids.year, created_by: ids.tutorLuis, created_at: '2026-09-20T10:00:00.000Z' },
    { id: 'ev7', title: 'Ensayo Día de Muertos', description: 'Patio central, ofrenda del grupo 3A', event_date: '2026-10-28', event_type: 'evento', class_id: null, student_id: null, academic_year_id: ids.year, created_by: ids.admin, created_at: '2026-09-22T10:00:00.000Z' },
    { id: 'ev8', title: 'Excursión al planetario', description: 'Salida 8:30. Autorización firmada.', event_date: '2026-11-12', event_type: 'evento', class_id: ids.classScience, student_id: null, academic_year_id: ids.year, created_by: ids.tutorMarta, created_at: '2026-09-22T11:00:00.000Z' },
  ];

  const months = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const payments = [];
  for (const student of [ids.kyara, ids.diego]) {
    for (const month of months) {
      const year = month >= 9 ? 2026 : 2027;
      const due = `${year}-${String(month).padStart(2, '0')}-05`;
      let status = 'pendiente';
      if (student === ids.kyara && month === 9) status = 'pagado';
      if (student === ids.diego && month === 9) status = 'pagado';
      if (student === ids.kyara && month === 10) status = 'en_revision';
      payments.push({
        id: paymentId(student, month, year),
        student_id: student,
        academic_year_id: ids.year,
        month,
        year,
        concept: 'Colegiatura',
        amount: 2500,
        due_date: due,
        status,
      });
    }
  }

  const payment_receipts = [
    {
      id: 'rc1',
      payment_id: paymentId(ids.kyara, 9, 2026),
      uploaded_by: ids.parentEduardo,
      file_url: null,
      file_name: 'comprobante-septiembre.pdf',
      notes: 'Transferencia SPEI',
      status: 'aprobado',
      reviewed_by: ids.tutorAna,
      review_notes: 'Pago verificado',
      uploaded_at: '2026-09-03T11:20:00.000Z',
      reviewed_at: '2026-09-03T16:00:00.000Z',
    },
    {
      id: 'rc2',
      payment_id: paymentId(ids.kyara, 10, 2026),
      uploaded_by: ids.parentEduardo,
      file_url: null,
      file_name: 'comprobante-octubre.pdf',
      notes: 'Pago en ventanilla',
      status: 'pendiente',
      reviewed_by: null,
      review_notes: null,
      uploaded_at: '2026-09-22T09:40:00.000Z',
      reviewed_at: null,
    },
  ];

  const messages = [
    {
      id: ids.msg1,
      sender_id: ids.tutorAna,
      subject: 'Bienvenida al ciclo 2026-2027',
      body: 'Estimado Eduardo:\n\nLe doy la bienvenida a Kyara al grupo 3°A. Este ciclo trabajaremos fracciones, geometría y resolución de problemas.\n\nCualquier duda, escríbame por este correo.\n\nSaludos,\nAna García\nTutora de Matemáticas',
      parent_id: null,
      created_at: '2026-09-02T09:00:00.000Z',
    },
    {
      id: ids.msg2,
      sender_id: ids.parentEduardo,
      subject: 'Consulta sobre la tarea de fracciones',
      body: 'Hola maestra Ana:\n\nKyara tiene duda en el ejercicio 4 de la hoja de fracciones equivalentes. ¿Podría indicarme si el procedimiento que marca el libro es el que deben seguir?\n\nGracias,\nEduardo Altamirano',
      parent_id: null,
      created_at: '2026-09-23T19:30:00.000Z',
    },
  ];

  const message_recipients = [
    { id: 'mr1', message_id: ids.msg1, recipient_id: ids.parentEduardo, read_at: '2026-09-02T12:10:00.000Z' },
    { id: 'mr2', message_id: ids.msg2, recipient_id: ids.tutorAna, read_at: null },
  ];

  const notifications = [
    { id: 'n1', user_id: ids.parentEduardo, title: 'Nueva tarea: Fracciones equivalentes', body: 'Ana García publicó una tarea para Matemáticas 3A. Entrega: 26 sep.', type: 'tarea', link: `/tareas/${ids.asg1}`, read_at: null, created_at: '2026-09-20T16:31:00.000Z' },
    { id: 'n2', user_id: ids.parentEduardo, title: 'Nueva tarea: Lectura El principito', body: 'Luis Ortega publicó una tarea para Español 3A. Entrega: 25 sep.', type: 'tarea', link: `/tareas/${ids.asg2}`, read_at: '2026-09-19T10:00:00.000Z', created_at: '2026-09-18T14:01:00.000Z' },
    { id: 'n3', user_id: ids.parentEduardo, title: 'Correo de Ana García', body: 'Bienvenida al ciclo 2026-2027', type: 'mensaje', link: `/correo/${ids.msg1}`, read_at: '2026-09-02T12:10:00.000Z', created_at: '2026-09-02T09:00:00.000Z' },
    { id: 'n4', user_id: ids.parentEduardo, title: 'Comprobante de octubre en revisión', body: 'Tu comprobante de colegiatura de octubre está pendiente de validación.', type: 'pago', link: '/pagos', read_at: null, created_at: '2026-09-22T09:41:00.000Z' },
    { id: 'n5', user_id: ids.tutorAna, title: 'Correo de Eduardo Altamirano', body: 'Consulta sobre la tarea de fracciones', type: 'mensaje', link: `/correo/${ids.msg2}`, read_at: null, created_at: '2026-09-23T19:30:00.000Z' },
    { id: 'n6', user_id: ids.tutorAna, title: 'Comprobante por revisar', body: 'Eduardo Altamirano subió el comprobante de octubre de Kyara.', type: 'pago', link: '/pagos', read_at: null, created_at: '2026-09-22T09:41:00.000Z' },
  ];

  const gallery = [
    {
      id: 'g1',
      tutor_id: ids.tutorAna,
      caption: 'Primer día de clases en Matemáticas 3A',
      image_url: null,
      created_at: '2026-09-01T14:20:00.000Z',
    },
    {
      id: 'g2',
      tutor_id: ids.tutorLuis,
      caption: 'Rincón de lectura del aula 12',
      image_url: null,
      created_at: '2026-09-10T11:05:00.000Z',
    },
  ];

  return {
    profiles,
    academic_years,
    students,
    parent_students,
    classes,
    class_enrollments,
    schedule_slots,
    assignments,
    assignment_submissions,
    calendar_events,
    messages,
    message_recipients,
    notifications,
    payments,
    payment_receipts,
    gallery,
    password_resets: [],
    mail_outbox: [],
  };
}

module.exports = { ids, buildSeed, paymentId };
