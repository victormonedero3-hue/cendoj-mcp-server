const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Dummy data para demostración
const sentencias = [
  { id: 1, sala: 'Sala de lo Social', juez: 'Juan García', cendoj_id: '28079150012015000001' },
  { id: 2, sala: 'Sala de Contencioso', juez: 'María López', cendoj_id: '28079150022015000002' },
  { id: 3, sala: 'Sala de lo Penal', juez: 'Carlos Martín', cendoj_id: '28079150032015000003' }
];

// MCP Protocol Endpoints
// Endpoint para listar todas las herramientas disponibles
app.post('/mcp/tools/list', (req, res) => {
  res.json({
    tools: [
      {
        name: 'list_all_sentences',
        description: 'Obtiene una lista de todas las sentencias disponibles en la base de datos de CENDOJ',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'search_by_sala',
        description: 'Busca sentencias por la sala judicial especificada',
        inputSchema: {
          type: 'object',
          properties: {
            sala: {
              type: 'string',
              description: 'Nombre de la sala judicial (ej: Sala de lo Social, Sala de lo Penal)'
            }
          },
          required: ['sala']
        }
      },
      {
        name: 'search_by_judge',
        description: 'Busca sentencias por el juez especificado',
        inputSchema: {
          type: 'object',
          properties: {
            judge: {
              type: 'string',
              description: 'Nombre del juez'
            }
          },
          required: ['judge']
        }
      },
      {
        name: 'get_sentence_details',
        description: 'Obtiene los detalles completos de una sentencia específica',
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
  });
});

// Endpoint para ejecutar las herramientas
app.post('/mcp/tools/call', (req, res) => {
  const { name, arguments: args } = req.body;

  try {
    let result;

    switch (name) {
      case 'list_all_sentences':
        result = {
          success: true,
          data: sentencias,
          count: sentencias.length
        };
        break;

      case 'search_by_sala':
        const sala = args.sala;
        const filtered_sala = sentencias.filter(s => s.sala.toLowerCase().includes(sala.toLowerCase()));
        result = {
          success: true,
          data: filtered_sala,
          count: filtered_sala.length,
          query: sala
        };
        break;

      case 'search_by_judge':
        const judge = args.judge;
        const filtered_judge = sentencias.filter(s => s.juez.toLowerCase().includes(judge.toLowerCase()));
        result = {
          success: true,
          data: filtered_judge,
          count: filtered_judge.length,
          query: judge
        };
        break;

      case 'get_sentence_details':
        const id = args.id;
        const sentence = sentencias.find(s => s.id === id);
        if (sentence) {
          result = {
            success: true,
            data: sentence
          };
        } else {
          result = {
            success: false,
            error: `Sentencia con ID ${id} no encontrada`
          };
        }
        break;

      default:
        result = {
          success: false,
          error: `Herramienta desconocida: ${name}`
        };
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint de salud para verificar que el servidor está funcionando
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Cendoj MCP Server' });
});

// Raíz del servidor
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cendoj MCP Server',
    version: '1.0.0',
    description: 'MCP Server for Spanish Judicial Database (CENDOJ)',
    endpoints: {
      'POST /mcp/tools/list': 'List available tools',
      'POST /mcp/tools/call': 'Call a tool with arguments',
      'GET /health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Cendoj MCP Server ejecutándose en puerto ${PORT}`);
});
