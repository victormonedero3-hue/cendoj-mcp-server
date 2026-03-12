#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  Marketing AI Skill — Instalador para Claude Code
#  Instala los comandos /market-seo, /market-audit y
#  /market-competitors en ~/.claude/commands/
# ============================================================

COMMANDS_DIR="$HOME/.claude/commands"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/commands"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      Marketing AI Skill — Claude Code            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que existe el directorio de comandos fuente
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌  Error: no se encontró el directorio 'commands/' junto a install.sh"
  echo "   Asegúrate de descomprimir el zip completo antes de ejecutar este script."
  exit 1
fi

# Crear directorio de comandos de Claude Code si no existe
if [ ! -d "$COMMANDS_DIR" ]; then
  echo "📁  Creando directorio $COMMANDS_DIR ..."
  mkdir -p "$COMMANDS_DIR"
fi

# Instalar cada archivo de comando
INSTALLED=0
for cmd_file in "$SOURCE_DIR"/*.md; do
  if [ -f "$cmd_file" ]; then
    cmd_name="$(basename "$cmd_file")"
    dest="$COMMANDS_DIR/$cmd_name"

    if [ -f "$dest" ]; then
      echo -e "${YELLOW}⚠️   Sobreescribiendo${NC} $cmd_name"
    else
      echo -e "${GREEN}✅  Instalando${NC} $cmd_name"
    fi

    cp "$cmd_file" "$dest"
    INSTALLED=$((INSTALLED + 1))
  fi
done

if [ "$INSTALLED" -eq 0 ]; then
  echo "❌  No se encontraron archivos .md en $SOURCE_DIR"
  exit 1
fi

echo ""
echo -e "${GREEN}🎉  $INSTALLED skill(s) instalados correctamente en:${NC}"
echo "    $COMMANDS_DIR"
echo ""
echo -e "${CYAN}Comandos disponibles en Claude Code:${NC}"
echo ""
echo "  /market-seo        <url>   — Análisis SEO completo"
echo "  /market-audit      <url>   — Auditoría de marketing digital"
echo "  /market-competitors <url>  — Análisis competitivo"
echo ""
echo -e "${CYAN}Ejemplos de uso:${NC}"
echo ""
echo "  /market-seo https://www.holaluz.com"
echo "  /market-audit https://www.holaluz.com"
echo "  /market-competitors https://www.holaluz.com"
echo ""
echo "Abre o reinicia Claude Code para que los comandos estén disponibles."
echo ""
