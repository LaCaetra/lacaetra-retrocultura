// ===== Adaptador de dibujo para GJS (Cinnamon y GNOME Shell): Pango + Cairo =====
// Necesita que el archivo que lo incluye haya definido Pango, PangoCairo y Cairo.
const G = {
    text(cr, str, o) {
        const layout = PangoCairo.create_layout(cr);
        const font = Pango.FontDescription.from_string(o.serif ? "Serif" : "Sans");
        font.set_absolute_size(o.size * Pango.SCALE);
        if (o.bold) font.set_weight(Pango.Weight.BOLD);
        layout.set_font_description(font);
        layout.set_text(str, -1);
        if (o.spacing) {
            try {
                const attrs = new Pango.AttrList();
                attrs.insert(Pango.attr_letter_spacing_new(Math.round(o.spacing * Pango.SCALE)));
                layout.set_attributes(attrs);
            } catch (e) { /* sin espaciado si la versión de Pango no lo admite */ }
        }
        const [, logical] = layout.get_pixel_extents();
        cr.save();
        cr.translate(o.x, o.y);
        if (o.rot) cr.rotate(o.rot);
        PangoCairo.update_layout(cr, layout);
        const dx = o.align === "left" ? 0 : -logical.width / 2;
        if (o.shadow) {   // sombra suave desplazada, para leer el texto sobre el escritorio
            cr.setSourceRGBA(0, 0.12, 0.07, 0.55);
            cr.moveTo(dx + 1, -logical.height / 2 + 1);
            PangoCairo.show_layout(cr, layout);
        }
        cr.moveTo(dx, -logical.height / 2);
        cr.setSourceRGBA(o.color[0], o.color[1], o.color[2], o.alpha === undefined ? 1 : o.alpha);
        PangoCairo.show_layout(cr, layout);
        cr.restore();
    },

    // Emoji de luna llena con la sombra de la fase exacta encima.
    moon(cr, cx, cy, size, phase) {
        cr.save();
        const layout = PangoCairo.create_layout(cr);
        const font = Pango.FontDescription.from_string("Sans");
        font.set_absolute_size(size * Pango.SCALE);
        layout.set_font_description(font);
        layout.set_text("🌕", -1);
        const [ink] = layout.get_pixel_extents();
        cr.moveTo(cx - ink.x - ink.width / 2, cy - ink.y - ink.height / 2);
        PangoCairo.show_layout(cr, layout);

        const r = Math.min(ink.width, ink.height) / 2;
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
