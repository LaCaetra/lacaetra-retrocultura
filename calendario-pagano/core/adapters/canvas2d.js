// ===== Adaptador de dibujo para Canvas 2D (navegador, Tauri, Übersicht y QML de KDE) =====
// Traduce la API tipo Cairo que usa drawWheel a un CanvasRenderingContext2D.
// En QML el contexto no admite fill("evenodd"), ni measureText con caja de tinta,
// ni emojis en color: por eso la regla de relleno se cambia con `setFillRule` y,
// con `vectorMoon`, la luna se dibuja en lugar de usar el emoji 🌕.

const MOON_R = 0.44;   // radio del disco del emoji, en fracción del tamaño de letra
const EMOJI_FONTS = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';
const SERIF_FONTS = 'Georgia, "DejaVu Serif", "Noto Serif", "Times New Roman", serif';
const SANS_FONTS = '"Segoe UI", "Helvetica Neue", "DejaVu Sans", "Noto Sans", Arial, sans-serif';

function rgba(r, g, b, a) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
}

// opts.setFillRule(ctx, evenOdd): solo para QML, donde la regla es una propiedad.
function makeCairo(ctx, opts) {
    opts = opts || {};
    let evenOdd = false;
    const rule = () => (opts.setFillRule ? undefined : (evenOdd ? "evenodd" : "nonzero"));
    const fill = () => { const r = rule(); if (r) ctx.fill(r); else ctx.fill(); };
    return {
        ctx,
        vectorMoon: !!opts.vectorMoon,
        newPath() { ctx.beginPath(); },
        closePath() { ctx.closePath(); },
        moveTo(x, y) { ctx.moveTo(x, y); },
        lineTo(x, y) { ctx.lineTo(x, y); },
        arc(x, y, r, a0, a1) { ctx.arc(x, y, r, a0, a1, false); },
        arcNegative(x, y, r, a0, a1) { ctx.arc(x, y, r, a0, a1, true); },
        rectangle(x, y, w, h) { ctx.rect(x, y, w, h); },
        setSourceRGBA(r, g, b, a) { ctx.fillStyle = ctx.strokeStyle = rgba(r, g, b, a); },
        setLineWidth(w) { ctx.lineWidth = w; },
        fill() { fill(); ctx.beginPath(); },
        fillPreserve() { fill(); },
        stroke() { ctx.stroke(); ctx.beginPath(); },
        clip() { const r = rule(); if (r) ctx.clip(r); else ctx.clip(); ctx.beginPath(); },
        setFillRule(r) {
            evenOdd = r === "evenodd";
            if (opts.setFillRule) opts.setFillRule(ctx, evenOdd);
        },
        save() { ctx.save(); },
        restore() { ctx.restore(); },
        translate(x, y) { ctx.translate(x, y); },
        rotate(a) { ctx.rotate(a); },
        scale(x, y) { ctx.scale(x, y); },
        $dispose() {},
    };
}

// En Cairo/GJS la regla se pasa como Cairo.FillRule.*; aquí basta con un texto.
const Cairo = {FillRule: {EVEN_ODD: "evenodd", WINDING: "nonzero"}};

const G = {
    text(cr, str, o) {
        const ctx = cr.ctx;
        ctx.save();
        ctx.font = `${o.bold ? "bold " : ""}${o.size}px ${o.serif ? SERIF_FONTS : SANS_FONTS}`;
        ctx.textAlign = o.align === "left" ? "left" : "center";
        ctx.textBaseline = "middle";
        if ("letterSpacing" in ctx) ctx.letterSpacing = o.spacing ? `${o.spacing}px` : "0px";
        ctx.translate(o.x, o.y);
        if (o.rot) ctx.rotate(o.rot);
        if (o.shadow) {   // sombra suave desplazada, para leer el texto sobre el escritorio
            ctx.fillStyle = rgba(0, 0.12, 0.07, 0.55);
            ctx.fillText(str, 1, 1);
        }
        ctx.fillStyle = rgba(o.color[0], o.color[1], o.color[2], o.alpha === undefined ? 1 : o.alpha);
        ctx.fillText(str, 0, 0);
        ctx.restore();
    },

    // Emoji de luna llena con la sombra de la fase exacta encima.
    moon(cr, cx, cy, size, phase) {
        const ctx = cr.ctx;
        ctx.save();
        ctx.font = `${size}px ${EMOJI_FONTS}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        const m = cr.vectorMoon ? {} : ctx.measureText("🌕");
        let r;
        if (cr.vectorMoon) {
            // QML convierte el texto en trazos y no pinta emojis en color: se dibuja la luna.
            r = size * MOON_R;
            const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
            g.addColorStop(0, "#fbf3d8");
            g.addColorStop(0.7, "#ead9a4");
            g.addColorStop(1, "#c8ae73");
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fillStyle = g; ctx.fill();
            ctx.fillStyle = "rgba(150, 125, 80, 0.35)";
            for (const [dx, dy, dr] of [[-0.35, -0.2, 0.22], [0.3, 0.25, 0.28], [0.1, -0.45, 0.12], [-0.25, 0.45, 0.14], [0.45, -0.15, 0.1]]) {
                ctx.beginPath(); ctx.arc(cx + dx * r, cy + dy * r, dr * r, 0, 2 * Math.PI); ctx.fill();
            }
        } else if (m.actualBoundingBoxAscent !== undefined && m.actualBoundingBoxRight !== undefined) {
            const left = m.actualBoundingBoxLeft, right = m.actualBoundingBoxRight;
            const up = m.actualBoundingBoxAscent, down = m.actualBoundingBoxDescent;
            ctx.fillText("🌕", cx - (right - left) / 2, cy + (up - down) / 2);
            r = Math.min(left + right, up + down) / 2;
        } else {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🌕", cx, cy);
            r = size * MOON_R;
        }
        ctx.restore();

        cr.save();
        const k = Math.cos(2 * Math.PI * phase);   // 1 nueva, -1 llena
        const side = phase < 0.5 ? 1 : -1;          // creciente a la derecha, menguante a la izquierda
        const n = 64;
        cr.newPath();
        cr.arc(cx, cy, Math.max(r - 0.5, 0.5), 0, 2 * Math.PI);
        cr.clip();
        cr.newPath();
        cr.arc(cx, cy, r + 2, 0, 2 * Math.PI);
        cr.closePath();
        for (let i = 0; i <= n; i++) {
            const t = -Math.PI / 2 + Math.PI * i / n;
            const x = cx + side * r * Math.cos(t), y = cy + r * Math.sin(t);
            if (i === 0) cr.moveTo(x, y); else cr.lineTo(x, y);
        }
        for (let i = 0; i <= n; i++) {
            const t = Math.PI / 2 - Math.PI * i / n;
            cr.lineTo(cx + side * r * k * Math.cos(t), cy + r * Math.sin(t));
        }
        cr.closePath();
        cr.setFillRule(Cairo.FillRule.EVEN_ODD);
        cr.setSourceRGBA(0.12, 0.12, 0.14, 0.88);
        cr.fill();
        cr.setFillRule(Cairo.FillRule.WINDING);
        cr.restore();
    },
};

// Dibuja la rueda en un contexto 2D de tamaño `px` (cuadrado), con la escala que haga falta.
function renderWheel(ctx, px, now, opts) {
    const cr = makeCairo(ctx, opts);
    ctx.clearRect(0, 0, px, px);
    cr.save();
    cr.scale(px / WHEEL_SIZE, px / WHEEL_SIZE);
    drawWheel(cr, G, WHEEL_SIZE, viewData(now || new Date()), opts || {});
    cr.restore();
}
