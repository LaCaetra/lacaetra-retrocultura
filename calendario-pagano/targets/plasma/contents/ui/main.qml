/*
 * Calendario Pagano para KDE Plasma 6 · rueda del año.
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 */
import QtQuick
import QtQuick.Layouts
import org.kde.plasma.plasmoid
import org.kde.plasma.core as PlasmaCore

import "coligny.js" as Coligny

PlasmoidItem {
    id: root

    Plasmoid.backgroundHints: PlasmaCore.Types.NoBackground
    preferredRepresentation: fullRepresentation

    fullRepresentation: Item {
        Layout.minimumWidth: 160
        Layout.minimumHeight: 160
        Layout.preferredWidth: 360
        Layout.preferredHeight: 360

        Canvas {
            id: wheel
            anchors.fill: parent
            renderTarget: Canvas.Image
            onPaint: {
                const ctx = getContext("2d");
                ctx.reset();
                const px = Math.min(width, height);
                ctx.translate((width - px) / 2, (height - px) / 2);
                Coligny.renderWheel(ctx, px, new Date(), {
                    showPhaseName: Plasmoid.configuration.showMoonPhaseName,
                    vectorMoon: true,   // el Canvas de QML no pinta emojis en color
                    setFillRule: (c, evenOdd) => { c.fillRule = evenOdd ? Qt.OddEvenFill : Qt.WindingFill; },
                });
            }
            onWidthChanged: requestPaint()
            onHeightChanged: requestPaint()
            Connections {
                target: Plasmoid.configuration
                function onShowMoonPhaseNameChanged() { wheel.requestPaint(); }
            }
        }

        Timer {
            interval: 60000
            running: true
            repeat: true
            onTriggered: wheel.requestPaint()
        }
    }
}
