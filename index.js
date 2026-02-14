const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Dummy data para demostración
const sentencias = [
  { id: 1, sala: 'Sala de lo Social', juez: 'Juan García', cendoj_id: '28079150012015000001' },
  { id: 2, sala: 'Sala de lo Contencioso', juez: 'María López', cendoj_id: '28079150022015000002' },
  { id: 3, sala: 'Sala de lo Penal', juez: 'Carlos Martín', cendoj_id: '28079150032015000003' }
];

// Endpoint para obtener todas las sentencias
app.get('/tools/list_all_sentences', (req, res) => {
  res.json({ result: sentencias });
});

// Endpoint para contar por columna
app.get('/tools/count_by_column/:column', (req, res) => {
  const { column } = req.params;
  const counts = {};
  sentencias.forEach(s => {
    const value = s[column] || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
  });
  res.json({ result: counts });
});

// Endpoint para filtrar por campo
app.get('/tools/filter_by_field/:field/:value', (req, res) => {
  const { field, value } = req.params;
  const filtered = sentencias.filter(s => s[field] === value || s[field] === decodeURIComponent(value));
  res.json({ result: filtered });
});

// Endpoint para procesar herramientas MCP
app.post('/tools/:toolName', (req, res) => {
  const { toolName } = req.params;
  const { arguments: args } = req.body;

  if (toolName === 'list_all_sentences') {
    res.json({ result: sentencias });
  } else if (toolName === 'count_by_column') {
    const counts = {};
    sentencias.forEach(s => {
      const value = s[args?.column] || 'unknown';
      counts[value] = (counts[value] || 0) + 1;
    });
    res.json({ result: counts });
  } else if (toolName === 'filter_by_field') {
    const filtered = sentencias.filter(s => s[args?.field] === args?.value);
    res.json({ result: filtered });
  } else if (toolName === 'ingest_cendoj_link') {
    res.json({ result: { status: 'Link enqueued for processing', link: args?.link } });
  } else if (toolName === 'get_random_number') {
    res.json({ result: Math.floor(Math.random() * 1000) });
  } else {
    res.status(400).json({ error: `Unknown tool: ${toolName}` });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Cendoj MCP Server running on port ${PORT}`);
});
