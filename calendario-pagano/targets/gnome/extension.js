/*
 * Calendario Pagano (calendario celta de Coligny) para GNOME Shell 45+ · rueda del año.
 * La rueda se dibuja sobre el fondo de escritorio, detrás de las ventanas, como un desklet.
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 *
 * Plantilla: build.mjs inserta el núcleo de core/ y genera la versión final en dist/.
 */

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

        this._area = new St.DrawingArea({reactive: false});
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

    _place() {
        if (!this._area)
            return;
        const monitors = Main.layoutManager.monitors;
        const index = Math.min(Math.max(this._settings.get_int('monitor'), 0), monitors.length - 1);
        const m = monitors[index] ?? Main.layoutManager.primaryMonitor;
        const size = this._settings.get_int('size');
        this._area.set_size(size, size);
        // Posición en % del monitor, para que no se pierda al cambiar de resolución.
        const x = m.x + Math.round((m.width - size) * this._settings.get_int('pos-x') / 100);
        const y = m.y + Math.round((m.height - size) * this._settings.get_int('pos-y') / 100);
        this._area.set_position(x, y);
        this._area.queue_repaint();
    }

    disable() {
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
