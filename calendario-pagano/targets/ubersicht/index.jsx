/*
 * Calendario Pagano para macOS (Übersicht, https://tracesof.net/uebersicht/) · rueda del año.
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 */
import { renderWheel } from "./coligny.js";

// ===== Ajustes: cambia estos valores y guarda el archivo =====
const SIZE = 360;                 // tamaño de la rueda en píxeles
const TOP = 40, RIGHT = 40;       // distancia a la esquina superior derecha
const SHOW_PHASE_NAME = true;     // mostrar el nombre de la fase lunar
// =============================================================

// El propio lienzo se repinta cada minuto; Übersicht no necesita ejecutar ningún comando.
export const refreshFrequency = false;

export const className = `
  top: ${TOP}px;
  right: ${RIGHT}px;
  width: ${SIZE}px;
  height: ${SIZE}px;
  pointer-events: none;
`;

const draw = canvas => {
  const px = Math.round(SIZE * (window.devicePixelRatio || 1));
  canvas.width = canvas.height = px;
  renderWheel(canvas.getContext("2d"), px, new Date(), { showPhaseName: SHOW_PHASE_NAME });
};

const mount = canvas => {
  if (!canvas || canvas.dataset.listo) return;
  canvas.dataset.listo = "1";
  draw(canvas);
  const timer = setInterval(() => {
    if (canvas.isConnected) draw(canvas);
    else clearInterval(timer);   // el widget se ha recargado
  }, 60 * 1000);
};

export const render = () => (
  <canvas ref={mount} style={{ width: SIZE, height: SIZE }} />
);
