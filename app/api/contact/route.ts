import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.name || !body?.email || !body?.company) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Mock de persistencia: en un entorno real aquí integraríamos CRM o proveedor de emailing.
  return NextResponse.json({ ok: true, leadId: `lead_${Date.now()}` }, { status: 200 });
}
