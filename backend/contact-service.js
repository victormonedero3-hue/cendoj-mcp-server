const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'victormonedero3@gmail.com';
const CONTACT_FROM = 'onboarding@resend.dev';
const isProd = process.env.NODE_ENV === 'production';

function normalizeContactPayload(payload = {}) {
  return {
    nombre: String(payload.nombre || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    empresa: String(payload.empresa || '').trim(),
    mensaje: String(payload.mensaje || '').trim(),
  };
}

function validateContactPayload(payload) {
  const errors = [];

  if (!payload.nombre) errors.push('nombre es obligatorio');
  if (!payload.email) errors.push('email es obligatorio');
  if (!payload.mensaje) errors.push('mensaje es obligatorio');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (payload.email && !emailRegex.test(payload.email)) {
    errors.push('email no es válido');
  }

  if (payload.mensaje.length > 2500) {
    errors.push('mensaje supera el máximo de 2500 caracteres');
  }

  return { valid: errors.length === 0, errors };
}

function buildHtmlBody(payload) {
  const empresa = payload.empresa || 'No indicada';
  const safeMessage = payload.mensaje.replace(/\n/g, '<br/>');

  return `
    <h2>Nuevo contacto desde NEXORA</h2>
    <p><strong>Nombre:</strong> ${payload.nombre}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Empresa:</strong> ${empresa}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${safeMessage}</p>
  `;
}

async function sendContactEmail(payload) {
  if (!process.env.RESEND_API_KEY) {
    if (isProd) {
      throw new Error('RESEND_API_KEY no está configurada en producción');
    }

    return { mocked: true, id: `mock_${Date.now()}` };
  }

  let Resend;
  try {
    ({ Resend } = require('resend'));
  } catch {
    throw new Error('Dependencia resend no instalada. Ejecuta npm install');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    replyTo: payload.email,
    subject: `Nuevo lead web: ${payload.nombre}`,
    html: buildHtmlBody(payload),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  return { mocked: false, id: data?.id || null };
}

module.exports = {
  normalizeContactPayload,
  validateContactPayload,
  sendContactEmail,
};
