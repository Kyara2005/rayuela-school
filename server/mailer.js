function appBase(req) {
  const host = req?.headers?.host || `localhost:${process.env.PORT || 3000}`;
  const proto = (req?.headers['x-forwarded-proto'] || 'http');
  return `${proto}://${host}`;
}

function queueMail(store, { to, subject, body, meta }) {
  const row = {
    id: require('crypto').randomUUID(),
    to,
    subject,
    body,
    meta: meta || {},
    sent_at: new Date().toISOString(),
  };
  store.data.mail_outbox = store.data.mail_outbox || [];
  store.data.mail_outbox.unshift(row);
  console.log('\n--- Correo de Rayuela ---');
  console.log(`Para: ${to}`);
  console.log(`Asunto: ${subject}`);
  console.log(body);
  console.log('-------------------------\n');
  return row;
}

function passwordWelcomeEmail({ fullName, email, tempPassword, resetUrl }) {
  return {
    subject: 'Tu acceso a La Rayuela School',
    body: `Hola ${fullName},\n\nSe creó tu cuenta en el portal de La Rayuela School.\n\nCorreo: ${email}\nContraseña temporal: ${tempPassword}\n\nPor seguridad, cámbiala con este enlace (o al entrar por primera vez):\n${resetUrl}\n\nEl enlace caduca en 7 días.\n\nSaludos,\nAdministración La Rayuela School`,
  };
}

module.exports = { appBase, queueMail, passwordWelcomeEmail };
