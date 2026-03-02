'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: data.get('nombre'),
          email: data.get('email'),
          empresa: data.get('empresa'),
          mensaje: data.get('mensaje'),
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar el formulario.');
      }

      setStatus('success');
      setMessage('¡Gracias! Tu mensaje se ha enviado correctamente.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Error al enviar el formulario. Inténtalo de nuevo.');
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="nombre" placeholder="Nombre" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="empresa" placeholder="Empresa (opcional)" />
      <textarea name="mensaje" placeholder="Mensaje" required />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Enviando...' : 'Enviar'}
      </button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
