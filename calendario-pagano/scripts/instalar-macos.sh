#!/bin/bash
# Calendario Pagano · instalador para macOS (widget de Übersicht).
#
# Uso, desde la app Terminal:
#   curl -fsSL https://raw.githubusercontent.com/LaCaetra/lacaetra-retrocultura/main/calendario-pagano/scripts/instalar-macos.sh | bash
# Para desinstalar el calendario (Übersicht se queda):
#   curl -fsSL …/instalar-macos.sh | bash -s -- --desinstalar
#
# Qué hace:
#   1. Si no tienes Übersicht, descarga la última versión de su web oficial y la
#      instala en Aplicaciones.
#   2. Descarga el widget de la última versión publicada del Calendario Pagano y lo
#      copia en la carpeta de widgets de Übersicht.
#   3. Añade Übersicht a los ítems de inicio de sesión y lo abre.
#
# Código: GPL-3.0-or-later · La Caetra, retrocultura (https://lacaetra.com/)
set -euo pipefail

REPO="LaCaetra/lacaetra-retrocultura"
WIDGET="calendario-pagano.widget"
WIDGETS_DIR="$HOME/Library/Application Support/Übersicht/widgets"
FEED="https://raw.githubusercontent.com/felixhageloh/uebersicht/gh-pages/updates.xml.rss"
UEBERSICHT_RESERVA="https://tracesof.net/uebersicht/releases/Uebersicht-1.6.82.app.zip"

paso() { printf '\n\033[1;33m▸ %s\033[0m\n' "$1"; }
fallo() { printf '\n\033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

[ "$(uname -s)" = "Darwin" ] || fallo "Este instalador es para macOS."

if [ "${1:-}" = "--desinstalar" ]; then
    paso "Quitando el Calendario Pagano de Übersicht"
    rm -rf "${WIDGETS_DIR:?}/${WIDGET:?}"
    echo "Hecho. Übersicht sigue instalado; puedes borrarlo de Aplicaciones si ya no lo usas."
    exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# --- 1. Übersicht ---------------------------------------------------------
APP=""
for candidato in "/Applications/Übersicht.app" "$HOME/Applications/Übersicht.app"; do
    [ -d "$candidato" ] && APP="$candidato" && break
done

if [ -z "$APP" ]; then
    paso "Descargando Übersicht"
    URL="$(curl -fsSL "$FEED" 2>/dev/null | grep -o 'url="[^"]*\.zip"' | head -1 | cut -d'"' -f2 || true)"
    [ -n "$URL" ] || URL="$UEBERSICHT_RESERVA"
    curl -fL --progress-bar -o "$TMP/uebersicht.zip" "$URL" || fallo "No se pudo descargar Übersicht."
    ditto -x -k "$TMP/uebersicht.zip" "$TMP/app"
    ORIGEN="$(find "$TMP/app" -maxdepth 1 -name '*.app' | head -1)"
    [ -n "$ORIGEN" ] || fallo "La descarga de Übersicht no contiene la aplicación."

    paso "Instalando Übersicht en Aplicaciones"
    if [ -w /Applications ]; then
        DESTINO="/Applications"
    else
        DESTINO="$HOME/Applications"
        mkdir -p "$DESTINO"
    fi
    rm -rf "$DESTINO/Übersicht.app"
    ditto "$ORIGEN" "$DESTINO/Übersicht.app"
    APP="$DESTINO/Übersicht.app"
else
    paso "Übersicht ya está instalado ($APP)"
fi

# --- 2. Widget del Calendario Pagano --------------------------------------
paso "Descargando el Calendario Pagano"
ZIP_URL="$(curl -fsSL "https://api.github.com/repos/$REPO/releases?per_page=20" \
    | grep -o '"browser_download_url": *"[^"]*calendario-pagano-macos-ubersicht-[^"]*\.zip"' \
    | head -1 | sed 's/.*"\(https[^"]*\)"/\1/')"
[ -n "$ZIP_URL" ] || fallo "No se encontró el widget en las versiones publicadas de $REPO."
curl -fL --progress-bar -o "$TMP/widget.zip" "$ZIP_URL" || fallo "No se pudo descargar el widget."
ditto -x -k "$TMP/widget.zip" "$TMP/widget"
[ -d "$TMP/widget/$WIDGET" ] || fallo "El paquete descargado no contiene $WIDGET."

paso "Instalando el widget"
mkdir -p "$WIDGETS_DIR"
rm -rf "${WIDGETS_DIR:?}/${WIDGET:?}"
ditto "$TMP/widget/$WIDGET" "$WIDGETS_DIR/$WIDGET"

# --- 3. Inicio de sesión y arranque ---------------------------------------
paso "Haciendo que Übersicht arranque al iniciar sesión"
echo "  (macOS puede pedirte permiso para que Terminal controle «Eventos del Sistema»)"
osascript >/dev/null 2>&1 <<APPLESCRIPT || echo "  No se pudo; actívalo en el icono de Übersicht → Preferences… → Launch Übersicht when I log in."
tell application "System Events"
    if not (exists login item "Übersicht") then
        make login item at end with properties {path:"$APP", hidden:true}
    end if
end tell
APPLESCRIPT

paso "Abriendo Übersicht"
open "$APP"

printf '\n\033[1;32m✓ Listo.\033[0m La rueda aparecerá en unos segundos arriba a la derecha del escritorio.\n'
printf '  Tamaño y posición: edita las primeras líneas de\n  %s/%s/index.jsx\n\n' "$WIDGETS_DIR" "$WIDGET"
