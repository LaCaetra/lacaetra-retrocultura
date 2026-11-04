/*
 * Preferencias de Calendario Pagano para GNOME Shell 45+.
 * Código: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const WEB = 'https://lacaetra.com/';
const REPO = 'https://github.com/LaCaetra/lacaetra-retrocultura';
const DONAR = 'https://liberapay.com/lacaetra/donate';

export default class CalendarioPaganoPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        const ajustes = this._ajustes(settings);
        const acerca = this._acercaDe();
        window.add(ajustes);
        window.add(acerca);
        // El menú del botón derecho elige con qué pestaña se abre.
        if (settings.get_string('prefs-page') === 'acerca')
            window.set_visible_page(acerca);
        settings.set_string('prefs-page', 'ajustes');
        window.set_default_size(560, 640);
    }

    _ajustes(settings) {
        const page = new Adw.PreferencesPage({title: 'Ajustes', icon_name: 'preferences-system-symbolic'});

        const look = new Adw.PreferencesGroup({title: 'Aspecto'});
        look.add(this._spin(settings, 'size', 'Tamaño de la rueda', 'Píxeles', 160, 1000, 20, 0));
        const phase = new Adw.SwitchRow({title: 'Mostrar el nombre de la fase lunar'});
        settings.bind('show-moon-phase-name', phase, 'active', Gio.SettingsBindFlags.DEFAULT);
        look.add(phase);
        page.add(look);

        const where = new Adw.PreferencesGroup({
            title: 'Posición',
            description: 'También puedes arrastrar la rueda con el ratón directamente sobre el escritorio.\n' +
                '0 % es el borde izquierdo o superior; 100 %, el derecho o inferior.',
        });
        where.add(this._spin(settings, 'pos-x', 'Horizontal', '% del ancho de la pantalla', 0, 100, 1, 1));
        where.add(this._spin(settings, 'pos-y', 'Vertical', '% del alto de la pantalla', 0, 100, 1, 1));
        where.add(this._spin(settings, 'monitor', 'Monitor', '0 es el primero', 0, 8, 1, 0));
        page.add(where);
        return page;
    }

    _acercaDe() {
        const page = new Adw.PreferencesPage({title: 'Acerca de', icon_name: 'help-about-symbolic'});

        const head = new Adw.PreferencesGroup();
        const box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 6, halign: Gtk.Align.CENTER});
        const icon = Gtk.Picture.new_for_filename(`${this.path}/icon.png`);
        icon.set_size_request(128, 128);
        icon.set_can_shrink(true);
        box.append(icon);
        box.append(new Gtk.Label({label: '<span size="x-large" weight="bold">Calendario Pagano</span>', use_markup: true}));
        box.append(new Gtk.Label({label: `Versión ${this.metadata['version-name'] ?? ''}`, css_classes: ['dim-label']}));
        box.append(new Gtk.Label({
            label: 'Rueda del año con las ocho fiestas, el día del calendario celta\nde Coligny y la fase lunar.',
            justify: Gtk.Justification.CENTER, wrap: true,
        }));
        head.add(box);
        page.add(head);

        const autoria = new Adw.PreferencesGroup({title: 'Autoría'});
        autoria.add(new Adw.ActionRow({title: 'Andrea M. Miranda Duque', subtitle: 'Contenidos'}));
        autoria.add(new Adw.ActionRow({title: 'Fernando A. Muñoz Villarejo', subtitle: 'Contenidos'}));
        autoria.add(new Adw.ActionRow({
            title: 'Este software ha sido desarrollado con la ayuda de Claude, el asistente de IA de Anthropic.',
            css_classes: ['dim-label'],
        }));
        page.add(autoria);

        const enlaces = new Adw.PreferencesGroup({title: 'La Caetra · retrocultura'});
        enlaces.add(this._enlace('Web', WEB, 'web-browser-symbolic'));
        enlaces.add(this._enlace('Código fuente e incidencias', REPO, 'text-x-generic-symbolic'));
        enlaces.add(this._enlace('Apoya el proyecto (Liberapay)', DONAR, 'emblem-favorite-symbolic'));
        page.add(enlaces);

        const lic = new Adw.PreferencesGroup({
            title: 'Licencias',
            description: 'Código: GPL-3.0 o posterior. Contenidos: CC BY-SA 4.0.\n' +
                'El nombre y el logotipo de La Caetra no están incluidos en estas licencias.',
        });
        page.add(lic);
        return page;
    }

    _enlace(title, uri, iconName) {
        const row = new Adw.ActionRow({title, subtitle: uri, activatable: true});
        row.add_prefix(new Gtk.Image({icon_name: iconName}));
        row.add_suffix(new Gtk.Image({icon_name: 'adw-external-link-symbolic'}));
        row.connect('activated', () => {
            if (Gtk.UriLauncher)
                new Gtk.UriLauncher({uri}).launch(row.get_root(), null, null);
            else
                Gtk.show_uri(row.get_root(), uri, 0);
        });
        return row;
    }

    _spin(settings, key, title, subtitle, min, max, step, digits) {
        const row = new Adw.SpinRow({
            title, subtitle, digits,
            adjustment: new Gtk.Adjustment({lower: min, upper: max, step_increment: step, page_increment: step * 10}),
        });
        settings.bind(key, row, 'value', Gio.SettingsBindFlags.DEFAULT);
        return row;
    }
}
