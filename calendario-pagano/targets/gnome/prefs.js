/*
 * Preferencias de Calendario Pagano para GNOME Shell 45+.
 * Código: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CalendarioPaganoPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const page = new Adw.PreferencesPage({title: 'Calendario Pagano', icon_name: 'x-office-calendar-symbolic'});

        const look = new Adw.PreferencesGroup({title: 'Aspecto'});
        look.add(this._spin(settings, 'size', 'Tamaño de la rueda', 'Píxeles', 160, 1000, 20));
        const phase = new Adw.SwitchRow({title: 'Mostrar el nombre de la fase lunar'});
        settings.bind('show-moon-phase-name', phase, 'active', Gio.SettingsBindFlags.DEFAULT);
        look.add(phase);
        page.add(look);

        const where = new Adw.PreferencesGroup({
            title: 'Posición',
            description: '0 % es el borde izquierdo o superior; 100 %, el derecho o inferior.',
        });
        where.add(this._spin(settings, 'pos-x', 'Horizontal', '% del ancho de la pantalla', 0, 100, 1));
        where.add(this._spin(settings, 'pos-y', 'Vertical', '% del alto de la pantalla', 0, 100, 1));
        where.add(this._spin(settings, 'monitor', 'Monitor', '0 es el primero', 0, 8, 1));
        page.add(where);

        const about = new Adw.PreferencesGroup({
            title: 'La Caetra · retrocultura',
            description: 'Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo.\nhttps://lacaetra.com/',
        });
        page.add(about);
        window.add(page);
    }

    _spin(settings, key, title, subtitle, min, max, step) {
        const row = new Adw.SpinRow({
            title, subtitle,
            adjustment: new Gtk.Adjustment({lower: min, upper: max, step_increment: step, page_increment: step * 10}),
        });
        settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
        return row;
    }
}
