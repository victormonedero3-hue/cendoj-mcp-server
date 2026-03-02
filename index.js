const path = require('path');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sentencias = [
  { id: 1, sala: 'Sala de lo Social', juez: 'Juan García', cendoj_id: '28079150012015000001', resolucion: 'Sentencia favorable' },
  { id: 2, sala: 'Sala de Contencioso', juez: 'María López', cendoj_id: '28079150022015000002', resolucion: 'Sentencia desestimada' },
  { id: 3, sala: 'Sala de lo Penal', juez: 'Carlos Martín', cendoj_id: '28079150032015000003', resolucion: 'Sentencia condenatoria' }
];

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/mcp' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: { logging: {}, tools: {} },
      serverInfo: { name: 'Cendoj MCP Server', version: '1.1.0' }
    },
    id: 0
  }));

  ws.on('message', (message) => {
    try {
      const request = JSON.parse(message);
      const { method, params, id } = request;
      let response;

      if (method === 'initialize') {
        response = {
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { logging: {}, tools: {} },
            serverInfo: { name: 'Cendoj MCP Server', version: '1.1.0' }
          },
          id
        };
      } else if (method === 'tools/list') {
        response = {
          jsonrpc: '2.0',
          result: {
            tools: [
              { name: 'list_sentences', description: 'Lista todas las sentencias', inputSchema: { type: 'object', properties: {}, required: [] } },
              { name: 'search_by_sala', description: 'Busca sentencias por sala', inputSchema: { type: 'object', properties: { sala: { type: 'string' } }, required: ['sala'] } },
              { name: 'search_by_judge', description: 'Busca sentencias por juez', inputSchema: { type: 'object', properties: { juez: { type: 'string' } }, required: ['juez'] } },
              { name: 'get_sentence', description: 'Obtiene sentencia por ID', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } }
            ]
          },
          id
        };
      } else if (method === 'tools/call') {
        const toolName = params?.name;
        const args = params?.arguments || {};
        let toolResult;

        switch (toolName) {
          case 'list_sentences':
            toolResult = { data: sentencias, count: sentencias.length };
            break;
          case 'search_by_sala':
            toolResult = { data: sentencias.filter((s) => s.sala.toLowerCase().includes(String(args.sala || '').toLowerCase())) };
            break;
          case 'search_by_judge':
            toolResult = { data: sentencias.filter((s) => s.juez.toLowerCase().includes(String(args.juez || '').toLowerCase())) };
            break;
          case 'get_sentence':
            toolResult = { data: sentencias.find((s) => s.id === Number(args.id)) || null };
            break;
          default:
            toolResult = { error: `Herramienta desconocida: ${toolName}` };
        }

        response = { jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(toolResult) }] }, id };
      } else {
        response = { jsonrpc: '2.0', error: { code: -32601, message: `Método desconocido: ${method}` }, id };
      }

      ws.send(JSON.stringify(response));
    } catch {
      ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'Cendoj MCP Server', website: 'NEXORA Digital Contact' });
});

app.post('/api/contact', (req, res) => {
  const { nombre, email, empresa, mensaje } = req.body || {};
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Missing required fields: nombre, email, mensaje' });
  }
  return res.status(200).json({ ok: true, leadId: `lead_${Date.now()}`, empresa: empresa || null });
});

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/services', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/contact', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
