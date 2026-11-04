import QtQuick
import QtQuick.Controls as QQC2
import org.kde.kirigami as Kirigami
import org.kde.kcmutils as KCM

KCM.SimpleKCM {
    property alias cfg_showMoonPhaseName: showPhase.checked

    Kirigami.FormLayout {
        QQC2.CheckBox {
            id: showPhase
            Kirigami.FormData.label: "Luna:"
            text: "Mostrar el nombre de la fase lunar"
        }
        QQC2.Label {
            Kirigami.FormData.label: "Tamaño:"
            text: "Arrastra el borde del widget en el modo de edición del escritorio."
            wrapMode: Text.WordWrap
        }
        QQC2.Label {
            Kirigami.FormData.label: "Autoría:"
            text: "Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo\nLa Caetra, retrocultura · https://lacaetra.com/"
        }
    }
}
