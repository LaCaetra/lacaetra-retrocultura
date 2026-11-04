/*
 * Calendario Pagano (calendario celta de Coligny) para GNOME Shell 45+ · rueda del año.
 * La rueda se dibuja sobre el fondo de escritorio, detrás de las ventanas, como un desklet,
 * y se puede arrastrar con el ratón.
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 *
 * Plantilla: build.mjs inserta el núcleo de core/ y genera la versión final en dist/.
 */

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';
import Cairo from 'cairo';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

/*@@CORE@@*/

/*@@GJS_ADAPTER@@*/

export default class CalendarioPaganoExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._signals = [];
        for (const key of ['size', 'pos-x', 'pos-y', 'monitor', 'show-moon-phase-name'])
            this._signals.push(this._settings.connect(`changed::${key}`, () => this._place()));
        this._monitorsId = Main.layoutManager.connect('monitors-changed', () => this._place());

        this._area = new St.DrawingArea({reactive: true});
        this._area.connect('button-press-event', (actor, event) => this._dragStart(actor, event));
        this._area.connect('motion-event', (actor, event) => this._dragMove(actor, event));
        this._area.connect('button-release-event', () => this._dragEnd());
        this._area.connect('repaint', area => {
            const cr = area.get_context();
            const [w, h] = area.get_surface_size();
            const k = Math.min(w, h) / WHEEL_SIZE;
            cr.scale(k, k);
            drawWheel(cr, G, WHEEL_SIZE, viewData(new Date()),
                {showPhaseName: this._settings.get_boolean('show-moon-phase-name')});
            cr.$dispose();
        });
        // Encima del fondo de pantalla y debajo de las ventanas.
        Main.layoutManager._backgroundGroup.add_child(this._area);
        this._place();

        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this._area?.queue_repaint();
            return GLib.SOURCE_CONTINUE;
        });
    }

    // Arrastrar la rueda con el botón izquierdo para colocarla en el escritorio.
    _dragStart(actor, event) {
        if (event.get_button() !== 1)
            return Clutter.EVENT_PROPAGATE;
        const [ex, ey] = event.get_coords();
        this._drag = {dx: ex - actor.x, dy: ey - actor.y};
        this._grab = global.stage.grab(actor);
        return Clutter.EVENT_STOP;
    }

    _dragMove(actor, event) {
        if (!this._drag)
            return Clutter.EVENT_PROPAGATE;
        const [ex, ey] = event.get_coords();
        actor.set_position(Math.round(ex - this._drag.dx), Math.round(ey - this._drag.dy));
        return Clutter.EVENT_STOP;
    }

    _dragEnd() {
        if (!this._drag)
            return Clutter.EVENT_PROPAGATE;
        this._drag = null;
        this._grab?.dismiss();
        this._grab = null;
        // Guarda el monitor y la posición (en % del monitor) donde ha quedado.
        const size = this._area.width;
        const cx = this._area.x + size / 2, cy = this._area.y + size / 2;
        const monitors = Main.layoutManager.monitors;
        let index = monitors.findIndex(m => cx >= m.x && cx < m.x + m.width && cy >= m.y && cy < m.y + m.height);
        if (index < 0)
            index = Main.layoutManager.primaryIndex;
        const m = monitors[index];
        const pct = (v, start, length) => Math.min(100, Math.max(0, length > 0 ? (v - start) / length * 100 : 0));
        this._settings.delay();   // los tres cambios de una vez
        this._settings.set_int('monitor', index);
        this._settings.set_double('pos-x', pct(this._area.x, m.x, m.width - size));
        this._settings.set_double('pos-y', pct(this._area.y, m.y, m.height - size));
        this._settings.apply();
        return Clutter.EVENT_STOP;
    }

    _place() {
        if (!this._area || this._drag)
            return;
        const monitors = Main.layoutManager.monitors;
        const index = Math.min(Math.max(this._settings.get_int('monitor'), 0), monitors.length - 1);
        const m = monitors[index] ?? Main.layoutManager.primaryMonitor;
        const size = this._settings.get_int('size');
        this._area.set_size(size, size);
        // Posición en % del monitor, para que no se pierda al cambiar de resolución.
        const x = m.x + Math.round((m.width - size) * this._settings.get_double('pos-x') / 100);
        const y = m.y + Math.round((m.height - size) * this._settings.get_double('pos-y') / 100);
        this._area.set_position(x, y);
        this._area.queue_repaint();
    }

    disable() {
        this._grab?.dismiss();
        this._grab = null;
        this._drag = null;
        if (this._timer)
            GLib.source_remove(this._timer);
        this._timer = 0;
        if (this._monitorsId)
            Main.layoutManager.disconnect(this._monitorsId);
        this._monitorsId = 0;
        for (const id of this._signals ?? [])
            this._settings.disconnect(id);
        this._signals = [];
        this._area?.destroy();
        this._area = null;
        this._settings = null;
    }
}
