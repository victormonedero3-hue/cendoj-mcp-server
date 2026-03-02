'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  // Enviamos a una API mock para simular el flujo de captación de leads.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        email: data.get('email'),
        company: data.get('company'),
        details: data.get('details'),
      }),
    });

    if (response.ok) {
      setStatus('success');
      setMessage('¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto.');
      form.reset();
      return;
    }

    setStatus('error');
    setMessage('No se pudo enviar el formulario. Inténtalo nuevamente.');
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-7">
      <input name="name" placeholder="Nombre" required className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3" />
      <input name="email" type="email" placeholder="Email corporativo" required className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3" />
      <input name="company" placeholder="Empresa" required className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3" />
      <textarea name="details" placeholder="Cuéntanos tu reto" rows={5} className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-3" />
      <button disabled={status === 'loading'} className="glow-button w-full disabled:opacity-70">
        {status === 'loading' ? 'Enviando...' : 'Solicitar demo gratuita'}
      </button>
      {message ? <p className="text-sm text-neonGreen">{message}</p> : null}
    </form>
  );
}
