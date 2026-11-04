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

import * as BoxPointer from 'resource:///org/gnome/shell/ui/boxpointer.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
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
        this._area.connect('button-press-event', (actor, event) => this._onPress(actor, event));
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
        this._buildMenu();
        this._place();

        this._timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this._area?.queue_repaint();
            return GLib.SOURCE_CONTINUE;
        });
    }

    // Menú del botón derecho sobre la rueda (el resto del escritorio conserva el suyo).
    _buildMenu() {
        this._menu = new PopupMenu.PopupMenu(Main.layoutManager.dummyCursor, 0, St.Side.TOP);
        this._menu.addAction('Configurar Calendario Pagano…', () => this._openPrefs('ajustes'));
        this._menu.addAction('Acerca de Calendario Pagano', () => this._openPrefs('acerca'));
        this._menu.actor.hide();
        Main.layoutManager.uiGroup.add_child(this._menu.actor);
        this._menuManager = new PopupMenu.PopupMenuManager(this._area);
        this._menuManager.addMenu(this._menu);
    }

    _openPrefs(page) {
        this._settings.set_string('prefs-page', page);
        this.openPreferences();
    }

    _onPress(actor, event) {
        const [ex, ey] = event.get_coords();
        if (event.get_button() === 3) {
            Main.layoutManager.setDummyCursorGeometry(ex, ey, 0, 0);
            this._menu.open(BoxPointer.PopupAnimation.FULL);
            return Clutter.EVENT_STOP;
        }
        if (event.get_button() !== 1)
            return Clutter.EVENT_PROPAGATE;
        // Arrastrar con el botón izquierdo para colocar la rueda.
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
        // Se calcula todo ANTES de guardar: cada cambio de ajuste recoloca la rueda.
        const size = this._area.width;
        const x = this._area.x, y = this._area.y;
        const cx = x + size / 2, cy = y + size / 2;
        const monitors = Main.layoutManager.monitors;
        let index = monitors.findIndex(m => cx >= m.x && cx < m.x + m.width && cy >= m.y && cy < m.y + m.height);
        if (index < 0)
            index = Main.layoutManager.primaryIndex;
        const m = monitors[index];
        const pct = (v, start, length) => Math.min(100, Math.max(0, length > 0 ? (v - start) / length * 100 : 0));
        const px = pct(x, m.x, m.width - size), py = pct(y, m.y, m.height - size);
        this._saving = true;
        try {
            this._settings.set_int('monitor', index);
            this._settings.set_double('pos-x', px);
            this._settings.set_double('pos-y', py);
        } catch (e) {
            console.error(`calendario-pagano: no se pudo guardar la posición: ${e}`);
        } finally {
            this._saving = false;
        }
        this._place();
        return Clutter.EVENT_STOP;
    }

    _place() {
        if (!this._area || this._drag || this._saving)
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
        this._menu?.destroy();
        this._menu = null;
        this._menuManager = null;
        this._area?.destroy();
        this._area = null;
        this._settings = null;
    }
}
