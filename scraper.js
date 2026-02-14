#!/usr/bin/env node
/**
 * Scraper de Jurisprudencia CENDOJ
 * Conecta al servidor MCP vía WebSocket y extrae sentencias judiciales.
 *
 * Uso:
 *   node scraper.js                              # Lista todas las sentencias
 *   node scraper.js sala "Sala de lo Penal"      # Busca por sala judicial
 *   node scraper.js juez "García"                # Busca por nombre de juez
 *   node scraper.js id 2                         # Obtiene una sentencia por ID
 */

'use strict';

const WebSocket = require('ws');

const SERVER_URL = 'wss://cendoj-mcp-server.onrender.com/mcp';

// ─────────────────────────────────────────────
// Cliente MCP (JSON-RPC 2.0 sobre WebSocket)
// ─────────────────────────────────────────────
class MCPClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.pending = new Map(); // id → { resolve, reject }
    this.nextId = 1;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      // Registrar handler de mensajes antes del 'open' para no perder nada
      this.ws.on('message', (raw) => {
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        // El servidor envía un mensaje de bienvenida automático (id: 0) al conectar
        if (msg.id === 0) return;

        const handler = this.pending.get(msg.id);
        if (!handler) return;
        this.pending.delete(msg.id);

        if (msg.error) {
          handler.reject(new Error(`[${msg.error.code}] ${msg.error.message}`));
        } else {
          handler.resolve(msg.result);
        }
      });

      this.ws.on('open', () => resolve());
      this.ws.on('error', reject);
      this.ws.on('close', () => {
        for (const h of this.pending.values()) {
          h.reject(new Error('Conexión cerrada inesperadamente'));
        }
        this.pending.clear();
      });
    });
  }

  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ jsonrpc: '2.0', method, params, id }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

// ─────────────────────────────────────────────
// Formateo de resultados
// ─────────────────────────────────────────────
function printSentencias(data, titulo) {
  const sep = '─'.repeat(62);
  console.log(`\n${sep}`);
  console.log(`  ${titulo}`);
  console.log(sep);
  console.log(`  Total: ${data.count} sentencia(s)`);
  if (data.query) console.log(`  Búsqueda: "${data.query}"`);
  console.log(sep);

  if (!data.data || data.data.length === 0) {
    console.log('  No se encontraron sentencias.');
  } else {
    data.data.forEach((s, i) => {
      console.log(`\n  [${i + 1}]`);
      console.log(`    ID:         ${s.id}`);
      console.log(`    Sala:       ${s.sala}`);
      console.log(`    Juez:       ${s.juez}`);
      console.log(`    CENDOJ ID:  ${s.cendoj_id}`);
      console.log(`    Resolución: ${s.resolucion}`);
    });
  }

  console.log(`\n${sep}\n`);
}

function printSentencia(data, titulo) {
  const sep = '─'.repeat(62);
  console.log(`\n${sep}`);
  console.log(`  ${titulo}`);
  console.log(sep);

  if (data.error) {
    console.log(`  Error: ${data.error}`);
  } else {
    const s = data.data;
    console.log(`\n  ID:         ${s.id}`);
    console.log(`  Sala:       ${s.sala}`);
    console.log(`  Juez:       ${s.juez}`);
    console.log(`  CENDOJ ID:  ${s.cendoj_id}`);
    console.log(`  Resolución: ${s.resolucion}`);
  }

  console.log(`\n${sep}\n`);
}

function printHelp() {
  console.log(`
Uso: node scraper.js [modo] [valor]

Modos disponibles:
  (sin argumentos)           Lista todas las sentencias
  sala  <nombre>             Busca sentencias por sala judicial
  juez  <nombre>             Busca sentencias por nombre de juez
  id    <numero>             Obtiene una sentencia específica por ID

Ejemplos:
  node scraper.js
  node scraper.js sala "Sala de lo Social"
  node scraper.js juez "García"
  node scraper.js id 1
`);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  const query = args[1];

  if (mode === '--help' || mode === '-h') {
    printHelp();
    return;
  }

  const client = new MCPClient(SERVER_URL);

  console.log('━━━ Scraper de Jurisprudencia CENDOJ ━━━');
  console.log(`Servidor: ${SERVER_URL}\n`);

  try {
    // 1. Conectar
    process.stdout.write('Conectando... ');
    await client.connect();
    console.log('OK\n');

    // 2. Inicializar sesión MCP
    process.stdout.write('Inicializando protocolo MCP... ');
    const init = await client.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'cendoj-scraper', version: '1.0.0' }
    });
    console.log(`OK\n  → ${init.serverInfo.name} v${init.serverInfo.version}  (MCP ${init.protocolVersion})\n`);

    // 3. Listar herramientas disponibles
    process.stdout.write('Listando herramientas... ');
    const { tools } = await client.request('tools/list');
    console.log(`OK\n  → ${tools.map(t => t.name).join(', ')}\n`);

    // 4. Seleccionar la herramienta según los argumentos
    let toolParams;
    let titulo;

    if (mode === 'sala' && query) {
      toolParams = { name: 'search_by_sala', arguments: { sala: query } };
      titulo = `Jurisprudencia — Sala: "${query}"`;
    } else if (mode === 'juez' && query) {
      toolParams = { name: 'search_by_judge', arguments: { juez: query } };
      titulo = `Jurisprudencia — Juez: "${query}"`;
    } else if (mode === 'id' && query) {
      const idNum = parseInt(query, 10);
      if (isNaN(idNum)) {
        console.error(`Error: "${query}" no es un ID numérico válido.`);
        process.exitCode = 1;
        return;
      }
      toolParams = { name: 'get_sentence', arguments: { id: idNum } };
      titulo = `Jurisprudencia — Sentencia ID: ${idNum}`;
    } else {
      toolParams = { name: 'list_sentences', arguments: {} };
      titulo = 'Jurisprudencia CENDOJ — Todas las sentencias';
    }

    // 5. Llamar la herramienta
    process.stdout.write(`Ejecutando "${toolParams.name}"... `);
    const callResult = await client.request('tools/call', toolParams);
    console.log('OK\n');

    // 6. Mostrar resultados
    const resultData = JSON.parse(callResult.content[0].text);

    if (mode === 'id' && query) {
      printSentencia(resultData, titulo);
    } else {
      printSentencias(resultData, titulo);
    }

  } catch (err) {
    console.error(`\nError: ${err.message}`);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
