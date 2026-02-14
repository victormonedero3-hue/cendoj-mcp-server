const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Dummy data para sentencias judiciales
const sentencias = [
  { id: 1, sala: 'Sala de lo Social', juez: 'Juan García', cendoj_id: '28079150012015000001', resolucion: 'Sentencia favorable' },
  { id: 2, sala: 'Sala de Contencioso', juez: 'María López', cendoj_id: '28079150022015000002', resolucion: 'Sentencia desestimada' },
  { id: 3, sala: 'Sala de lo Penal', juez: 'Carlos Martín', cendoj_id: '28079150032015000003', resolucion: 'Sentencia condenatoria' }
];

// Crear servidor HTTP
const server = http.createServer(app);

// Crear servidor WebSocket para MCP
const wss = new WebSocket.Server({ server, path: '/mcp' });

// Manejar conexiones WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente MCP conectado');

  // Enviar mensaje de inicialización
  const initMessage = {
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        logging: {},
        tools: {}
      },
      serverInfo: {
        name: 'Cendoj MCP Server',
        version: '1.0.0'
      }
    },
    id: 0
  };
  ws.send(JSON.stringify(initMessage));

  // Manejar mensajes del cliente
  ws.on('message', (message) => {
    try {
      const request = JSON.parse(message);
      const { method, params, id } = request;

      let response;

      switch (method) {
        case 'initialize':
          response = {
            jsonrpc: '2.0',
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                logging: {},
                tools: {}
              },
              serverInfo: {
                name: 'Cendoj MCP Server',
                version: '1.0.0'
              }
            },
            id
          };
          break;

        case 'tools/list':
          response = {
            jsonrpc: '2.0',
            result: {
              tools: [
                {
                  name: 'list_sentences',
                  description: 'Lista todas las sentencias disponibles en la base de datos CENDOJ',
                  inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                  }
                },
                {
                  name: 'search_by_sala',
                  description: 'Busca sentencias por sala judicial',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      sala: {
                        type: 'string',
                        description: 'Nombre de la sala judicial'
                      }
                    },
                    required: ['sala']
                  }
                },
                {
                  name: 'search_by_judge',
                  description: 'Busca sentencias por juez',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      juez: {
                        type: 'string',
                        description: 'Nombre del juez'
                      }
                    },
                    required: ['juez']
                  }
                },
                {
                  name: 'get_sentence',
                  description: 'Obtiene una sentencia específica por ID',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'number',
                        description: 'ID de la sentencia'
                      }
                    },
                    required: ['id']
                  }
                }
              ]
            },
            id
          };
          break;

        case 'tools/call':
          const toolName = params.name;
          const toolArgs = params.arguments || {};
          let toolResult;

          switch (toolName) {
            case 'list_sentences':
              toolResult = { data: sentencias, count: sentencias.length };
              break;

            case 'search_by_sala':
              const sala = toolArgs.sala;
              const filtered = sentencias.filter(s => s.sala.toLowerCase().includes(sala.toLowerCase()));
              toolResult = { data: filtered, count: filtered.length, query: sala };
              break;

            case 'search_by_judge':
              const juez = toolArgs.juez;
              const filtered_judge = sentencias.filter(s => s.juez.toLowerCase().includes(juez.toLowerCase()));
              toolResult = { data: filtered_judge, count: filtered_judge.length, query: juez };
              break;

            case 'get_sentence':
              const id = toolArgs.id;
              const sentence = sentencias.find(s => s.id === id);
              toolResult = sentence ? { data: sentence } : { error: `Sentencia ${id} no encontrada` };
              break;

            default:
              toolResult = { error: `Herramienta desconocida: ${toolName}` };
          }

          response = {
            jsonrpc: '2.0',
            result: { content: [{ type: 'text', text: JSON.stringify(toolResult) }] },
            id
          };
          break;

        default:
          response = {
            jsonrpc: '2.0',
            error: { code: -32601, message: `Método desconocido: ${method}` },
            id
          };
      }

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
        id: null
      }));
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Cliente MCP desconectado');
  });
});

// Endpoint HTTP para health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Cendoj MCP Server' });
});

// Raíz del servidor
app.get('/', (req, res) => {
  res.json({
    message: 'Cendoj MCP Server',
    version: '1.0.0',
    description: 'MCP Server for Spanish Judicial Database (CENDOJ)',
    mcp_endpoint: 'ws://localhost:8080/mcp',
    protocols: ['json-rpc', 'websocket']
  });
});

server.listen(PORT, () => {
  console.log(`Cendoj MCP Server ejecutándose en puerto ${PORT}`);
  console.log(`WebSocket MCP disponible en ws://localhost:${PORT}/mcp`);
});
