import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre = body?.nombre?.toString().trim();
    const email = body?.email?.toString().trim();
    const empresa = body?.empresa?.toString().trim() || 'No indicada';
    const mensaje = body?.mensaje?.toString().trim();

    if (!nombre || !email || !mensaje) {
      return Response.json(
        { ok: false, error: 'Faltan campos obligatorios: nombre, email y mensaje.' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return Response.json(
        { ok: false, error: 'RESEND_API_KEY no está configurada en el entorno.' },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'victormonedero3@gmail.com',
      subject: `Nuevo contacto desde web: ${nombre}`,
      replyTo: email,
      html: `
        <h2>Nuevo formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 502 });
    }

    return Response.json({ ok: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
