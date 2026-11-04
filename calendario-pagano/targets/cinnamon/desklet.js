/*
 * Calendario Pagano (calendario celta de Coligny) para Cinnamon · rueda del año.
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 *
 * Plantilla: build.mjs inserta el núcleo de core/ y genera la versión final en dist/.
 */

const Desklet = imports.ui.desklet;
const Settings = imports.ui.settings;
const St = imports.gi.St;
const Cairo = imports.cairo;
const Pango = imports.gi.Pango;
const PangoCairo = imports.gi.PangoCairo;
const Mainloop = imports.mainloop;

/*@@CORE@@*/

/*@@GJS_ADAPTER@@*/

class ColignyDesklet extends Desklet.Desklet {
    constructor(metadata, deskletId) {
        super(metadata, deskletId);
        this._timer = 0;
        this.settings = new Settings.DeskletSettings(this, metadata.uuid, deskletId);
        this.settings.bind("size", "size", () => this._build());
        this.settings.bind("show-moon-phase-name", "showMoonPhaseName", () => this._refresh());
        this._build();
        this._timer = Mainloop.timeout_add_seconds(60, () => { this._refresh(); return true; });
    }

    _build() {
        const px = Math.max(160, Math.min(1000, this.size || WHEEL_SIZE));
        this._content = new St.Widget({style: `width: ${px}px; height: ${px}px;`});
        this._canvas = new St.DrawingArea({width: px, height: px});
        this._canvas.connect("repaint", area => {
            const cr = area.get_context();
            const [sw, sh] = area.get_surface_size();
            const k = Math.min(sw, sh) / WHEEL_SIZE;
            cr.scale(k, k);
            drawWheel(cr, G, WHEEL_SIZE, viewData(new Date()), {showPhaseName: this.showMoonPhaseName});
            cr.$dispose();
        });
        this._content.add_child(this._canvas);
        this.setContent(this._content);
        this._refresh();
    }

    _refresh() {
        if (this._canvas) this._canvas.queue_repaint();
    }

    on_desklet_removed() {
        if (this._timer) Mainloop.source_remove(this._timer);
        this._timer = 0;
    }
}

function main(metadata, deskletId) {
    return new ColignyDesklet(metadata, deskletId);
}
