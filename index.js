'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Resend } = require('resend');

// Configuracion
const app = express();
const PORT = process.env.PORT || 8080;
const resend = new Resend(process.env.RESEND_API_KEY);

const LEAD_RECEIVER = process.env.LEAD_EMAIL || 'victormonedero3@gmail.com';
const FROM_ADDRESS = process.env.FROM_EMAIL || 'onboarding@resend.dev';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate-limit en memoria (5 req/min por IP)
const contactAttempts = new Map();

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const now = Date.now();
  const record = contactAttempts.get(ip);
  if (!record || now > record.resetAt) {
    contactAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }
  if (record.count >= 5) {
    return res.status(429).json({ ok: false, error: 'Demasiadas solicitudes. Espera un momento.' });
  }
  record.count++;
  return next();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str, maxLen) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLen || 500);
}

// Datos mock sentencias (MCP)
const sentencias = [
  { id: 1, sala: 'Sala de lo Social', juez: 'Juan Garcia', cendoj_id: '28079150012015000001', resolucion: 'Sentencia favorable' },
  { id: 2, sala: 'Sala de Contencioso', juez: 'Maria Lopez', cendoj_id: '28079150022015000002', resolucion: 'Sentencia desestimada' },
  { id: 3, sala: 'Sala de lo Penal', juez: 'Carlos Martin', cendoj_id: '28079150032015000003', resolucion: 'Sentencia condenatoria' },
];

// Health check
app.get('/health', function(_req, res) {
  res.json({ status: 'OK', service: 'Cendoj MCP Server', website: 'NEXORA Digital Contact', timestamp: new Date().toISOString() });
});

// POST /api/contact
app.post('/api/contact', rateLimit, async function(req, res) {
  try {
    const nombre = sanitize(req.body && req.body.nombre, 100);
    const email = sanitize(req.body && req.body.email, 100);
    const empresa = sanitize(req.body && req.body.empresa, 100) || 'No indicada';
    const mensaje = sanitize(req.body && req.body.mensaje, 2000);

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ ok: false, error: 'Faltan campos: nombre, email y mensaje son obligatorios.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: 'El formato del email no es valido.' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('[contact] Sin RESEND_API_KEY - lead guardado sin email.');
      return res.status(200).json({ ok: true, leadId: 'lead_' + Date.now(), note: 'Sin API key.' });
    }

    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: LEAD_RECEIVER,
      subject: '[NEXORA] Nuevo contacto de ' + nombre,
      replyTo: email,
      html: '<div style="font-family:sans-serif;max-width:560px">' +
        '<h2 style="color:#6B8AFF">Nuevo lead - NEXORA Digital Contact</h2>' +
        '<p><strong>Nombre:</strong> ' + nombre + '</p>' +
        '<p><strong>Email:</strong> ' + email + '</p>' +
        '<p><strong>Empresa:</strong> ' + empresa + '</p>' +
        '<p><strong>Mensaje:</strong></p>' +
        '<p style="background:#f4f4f8;padding:12px;border-radius:6px">' + mensaje.replace(/\n/g, '<br>') + '</p>' +
        '</div>',
    });

    if (result.error) {
      console.error('[contact] Resend error:', result.error);
      return res.status(502).json({ ok: false, error: 'Error enviando email.' });
    }

    return res.status(200).json({ ok: true, leadId: 'lead_' + Date.now(), emailId: result.data && result.data.id });

  } catch (err) {
    console.error('[contact] Error:', err);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});

// Paginas estaticas
app.get('/', function(_req, res) { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/about', function(_req, res) { res.sendFile(path.join(__dirname, 'public', 'about.html')); });
app.get('/services', function(_req, res) { res.sendFile(path.join(__dirname, 'public', 'services.html')); });
app.get('/contact', function(_req, res) { res.sendFile(path.join(__dirname, 'public', 'contact.html')); });
app.use(function(_req, res) { res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')); });

// Exportar app para Vercel (serverless) y arrancar localmente si se ejecuta directamente
module.exports = app;

if (require.main === module) {
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server, path: '/mcp' });

  function buildMcpResponse(id, result) {
    return JSON.stringify({ jsonrpc: '2.0', result: result, id: id });
  }
  function buildMcpError(id, code, message) {
    return JSON.stringify({ jsonrpc: '2.0', error: { code: code, message: message }, id: id });
  }

  wss.on('connection', function(ws) {
    ws.send(buildMcpResponse(0, {
      protocolVersion: '2024-11-05',
      capabilities: { logging: {}, tools: {} },
      serverInfo: { name: 'Cendoj MCP Server', version: '1.2.0' },
    }));

    ws.on('message', function(raw) {
      var req;
      try { req = JSON.parse(raw); } catch(e) { return ws.send(buildMcpError(null, -32700, 'Parse error')); }

      var method = req.method;
      var params = req.params;
      var id = req.id;

      if (method === 'initialize') {
        return ws.send(buildMcpResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: { logging: {}, tools: {} },
          serverInfo: { name: 'Cendoj MCP Server', version: '1.2.0' },
        }));
      }

      if (method === 'tools/list') {
        return ws.send(buildMcpResponse(id, { tools: [
          { name: 'list_sentences', description: 'Lista todas las sentencias.', inputSchema: { type: 'object', properties: {}, required: [] } },
          { name: 'search_by_sala', description: 'Busca sentencias por sala.', inputSchema: { type: 'object', properties: { sala: { type: 'string' } }, required: ['sala'] } },
          { name: 'search_by_judge', description: 'Busca sentencias por juez.', inputSchema: { type: 'object', properties: { juez: { type: 'string' } }, required: ['juez'] } },
          { name: 'get_sentence', description: 'Obtiene sentencia por ID.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
        ]}));
      }

      if (method === 'tools/call') {
        var toolName = params && params.name;
        var args = (params && params.arguments) || {};
        var toolResult;

        if (toolName === 'list_sentences') {
          toolResult = { data: sentencias, count: sentencias.length };
        } else if (toolName === 'search_by_sala') {
          toolResult = { data: sentencias.filter(function(s) { return s.sala.toLowerCase().includes(String(args.sala || '').toLowerCase()); }) };
        } else if (toolName === 'search_by_judge') {
          toolResult = { data: sentencias.filter(function(s) { return s.juez.toLowerCase().includes(String(args.juez || '').toLowerCase()); }) };
        } else if (toolName === 'get_sentence') {
          toolResult = { data: sentencias.find(function(s) { return s.id === Number(args.id); }) || null };
        } else {
          toolResult = { error: 'Herramienta desconocida: ' + toolName };
        }

        return ws.send(buildMcpResponse(id, { content: [{ type: 'text', text: JSON.stringify(toolResult) }] }));
      }

      return ws.send(buildMcpError(id, -32601, 'Metodo desconocido: ' + method));
    });

    ws.on('error', function(err) { console.error('[ws] Error:', err.message); });
  });

  server.listen(PORT, function() {
    console.log('NEXORA server running on http://localhost:' + PORT);
  });
}
