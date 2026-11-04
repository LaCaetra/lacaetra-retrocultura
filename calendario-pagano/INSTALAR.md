# Cómo instalar el Calendario Pagano

Guía paso a paso para cada escritorio. Todos los paquetes se descargan de la
página de **[Versiones](https://github.com/LaCaetra/lacaetra-retrocultura/releases/latest)**
(apartado *Assets*).

**¿Qué escritorio tengo?** En Linux, abre una terminal y escribe
`echo $XDG_CURRENT_DESKTOP`. Saldrá, por ejemplo, `GNOME`, `KDE`, `X-Cinnamon` o `XFCE`.

- [Cinnamon](#cinnamon) (Linux Mint, Fedora Cinnamon, Debian con Cinnamon)
- [GNOME](#gnome) (Debian, Ubuntu, Fedora Workstation)
- [KDE Plasma 6](#kde-plasma-6) (Kubuntu, Fedora KDE, Debian con KDE)
- [XFCE, MATE, LXDE, Budgie y otros escritorios Linux](#xfce-mate-lxde-budgie-y-otros-escritorios-linux)
- [Windows 10 y 11](#windows-10-y-11)
- [macOS](#macos)
- [Android](#android)
- [Desinstalar](#desinstalar) · [Si algo no funciona](#si-algo-no-funciona)

---

## Cinnamon

1. Descarga `calendario-pagano-cinnamon-X.Y.Z.zip`.
2. Abre una terminal en la carpeta de descargas y ejecuta:
   ```bash
   unzip -o calendario-pagano-cinnamon-*.zip -d ~/.local/share/cinnamon/desklets/
   ```
3. Haz clic derecho en el escritorio → **Añadir desklets**.
4. Busca **Calendario Pagano**, selecciónalo y pulsa **+** (o arrástralo al escritorio).
5. Para colocarlo, arrástralo con el ratón.
6. **Botón derecho sobre la rueda**: **Configurar…** (tamaño y nombre de la fase
   lunar) y **Acerca de…**.

## GNOME

GNOME no tiene widgets de escritorio, así que el calendario se instala como
**extensión**: la rueda se dibuja sobre el fondo de pantalla, detrás de las ventanas.
Funciona con GNOME 45 a 51.

1. Descarga `calendario-pagano-gnome-X.Y.Z.zip`. **No lo descomprimas.**
2. Abre una terminal en la carpeta de descargas y ejecuta:
   ```bash
   gnome-extensions install --force calendario-pagano-gnome-*.zip
   ```
3. **Cierra la sesión y vuelve a entrar.** Es imprescindible: GNOME solo descubre las
   extensiones nuevas al iniciar sesión. Hasta entonces, el paso siguiente dirá que
   la extensión «no existe».
4. Actívala:
   ```bash
   gnome-extensions enable calendario-pagano@lacaetra.com
   ```
   (o con el interruptor de la aplicación **Extensiones**).
5. La rueda aparece arriba a la derecha. Minimiza las ventanas para verla.
6. **Arrástrala** con el botón izquierdo para colocarla donde quieras; recuerda la posición.
7. **Botón derecho sobre la rueda**: **Configurar** (tamaño, posición, monitor y
   nombre de la fase lunar) y **Acerca de**.

## KDE Plasma 6

1. Descarga `calendario-pagano-plasma-X.Y.Z.plasmoid`.
2. Instálalo de una de estas dos formas:
   - **Con el ratón**: clic derecho en el escritorio → **Entrar en el modo de
     edición** → **Añadir widgets** → **Obtener widgets nuevos** → **Instalar desde
     archivo local** y elige el `.plasmoid`.
   - **Con la terminal**:
     ```bash
     kpackagetool6 --type Plasma/Applet --install calendario-pagano-plasma-*.plasmoid
     ```
     (para actualizar una versión anterior, cambia `--install` por `--upgrade`).
3. Clic derecho en el escritorio → **Añadir widgets**, busca **Calendario Pagano** y
   arrástralo al escritorio.
4. Para **moverlo** o cambiar el **tamaño**, entra en el modo de edición (clic derecho
   en el escritorio) y arrástralo o tira de su borde.
5. **Botón derecho sobre la rueda → Configurar Calendario Pagano…**: nombre de la
   fase lunar y, en la pestaña **Acerca de**, autoría y enlaces.

## XFCE, MATE, LXDE, Budgie y otros escritorios Linux

Estos escritorios no tienen widgets propios, así que el calendario es una pequeña
**aplicación** que muestra la rueda sobre el escritorio: sin marco, con fondo
transparente y siempre detrás de las demás ventanas.

1. Descarga el paquete de tu distribución:
   - **Debian, Ubuntu, Mint**: `Calendario.Pagano_X.Y.Z_amd64.deb`
     ```bash
     sudo apt install ./Calendario.Pagano_*_amd64.deb
     ```
   - **Fedora, openSUSE**: `Calendario.Pagano-X.Y.Z-1.x86_64.rpm`
     ```bash
     sudo dnf install ./Calendario.Pagano-*.x86_64.rpm
     ```
   - **Cualquier otra**: `Calendario.Pagano_X.Y.Z_amd64.AppImage`
     ```bash
     chmod +x Calendario.Pagano_*.AppImage && ./Calendario.Pagano_*.AppImage
     ```
2. Abre **Calendario Pagano** desde el menú de aplicaciones.
3. **Arrastra la rueda** con el ratón para colocarla; recuerda dónde la dejaste.
4. **Botón derecho sobre la rueda** (o el **icono junto al reloj**): tamaño, nombre
   de la fase lunar, **Iniciar con el sistema**, **Acerca de** y Salir.

> **¿Sale un cuadrado negro alrededor de la rueda?** La transparencia necesita un
> *compositor*. XFCE y MATE lo traen activado; **LXDE y Openbox no**. Instala
> `picom` y haz que arranque al iniciar sesión (el modo `xrender` funciona también
> en máquinas virtuales y equipos sin aceleración gráfica):
> ```bash
> sudo apt install picom
> mkdir -p ~/.config/autostart
> printf '[Desktop Entry]\nType=Application\nName=picom\nExec=picom --backend xrender\n' > ~/.config/autostart/picom.desktop
> ```
> Si tienes varios escritorios instalados, añade también `OnlyShowIn=LXDE;` a ese
> archivo para que picom no arranque en MATE o XFCE, que ya tienen su compositor.
>
> Cierra la sesión y vuelve a entrar. El calendario tiene que abrirse **después** que
> picom: si lo abriste antes, ciérralo (botón derecho → Salir) y vuelve a abrirlo.
>
> En GNOME y KDE con Wayland usa mejor su widget propio (arriba): Wayland no deja
> que una aplicación se quede siempre detrás de las demás ventanas.

## Windows 10 y 11

1. Descarga `Calendario.Pagano_X.Y.Z_x64-setup.exe`. Si **Edge** dice que «no se
   descarga habitualmente», abre la lista de descargas y pulsa **⋯ → Conservar →
   Mostrar más → Conservar de todos modos**.
2. Ábrelo. Si sale la pantalla azul «Windows protegió su PC» (SmartScreen), pulsa
   **Más información → Ejecutar de todas formas**. Si no aparece ese botón: clic
   derecho sobre el archivo → **Propiedades** → marca **Desbloquear** → Aceptar.
   Estos avisos son normales en programas libres que no pagan un certificado de firma.
3. Al terminar, la rueda aparece en el escritorio. **Arrástrala** para colocarla.
4. **Botón derecho sobre la rueda** (o el **icono junto al reloj**, que puede estar
   escondido en la flecha **^**): tamaño, nombre de la fase lunar, **Iniciar con el
   sistema**, **Acerca de** y Salir.

## macOS

En Mac se usa **Übersicht**, un programa libre y gratuito para poner widgets en el
escritorio. Necesita **macOS 12 Monterey** o posterior.

### Instalación rápida (una sola orden)

1. Abre la app **Terminal** (en Aplicaciones → Utilidades, o busca «Terminal» con
   Cmd + espacio).
2. Copia esta línea, pégala en la Terminal y pulsa Intro:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/LaCaetra/lacaetra-retrocultura/main/calendario-pagano/scripts/instalar-macos.sh | bash
   ```
3. Si macOS pregunta si Terminal puede controlar «Eventos del Sistema», pulsa
   **Permitir**: es para que Übersicht arranque solo al iniciar sesión.

El instalador descarga Übersicht de su web oficial (si no lo tienes), coloca el
calendario en su carpeta de widgets y lo abre. La rueda aparece arriba a la
derecha. Puedes [leer el script](scripts/instalar-macos.sh) antes de ejecutarlo.

Para quitarlo más adelante:
```bash
curl -fsSL https://raw.githubusercontent.com/LaCaetra/lacaetra-retrocultura/main/calendario-pagano/scripts/instalar-macos.sh | bash -s -- --desinstalar
```

### Instalación paso a paso (sin Terminal)

**1. Instala Übersicht**
- Descárgalo de [tracesof.net/uebersicht](https://tracesof.net/uebersicht/) y abre el `.zip`.
- Arrastra **Übersicht** a la carpeta **Aplicaciones** y ábrelo: aparece un icono en
  la barra de menús, arriba a la derecha.
- Para que arranque solo: icono de Übersicht → **Preferences…** → marca
  **Launch Übersicht when I log in**.

**2. Descarga el calendario**
- Descarga `calendario-pagano-macos-ubersicht-X.Y.Z.zip` y haz doble clic para
  descomprimirlo: sale la carpeta `calendario-pagano.widget`.

**3. Ponlo en Übersicht**
- Icono de Übersicht → **Open Widgets Folder** (es
  `~/Library/Application Support/Übersicht/widgets`).
- Mueve allí la carpeta `calendario-pagano.widget`.
- La rueda aparece en unos segundos arriba a la derecha. Si no, icono de
  Übersicht → **Refresh All Widgets**.

**4. Ajustes**
Übersicht no tiene menús ni arrastre: abre `calendario-pagano.widget/index.jsx`
con **TextEdit** (o cualquier editor de texto) y cambia las primeras líneas:

```js
const SIZE = 360;                 // tamaño de la rueda en píxeles
const TOP = 40, RIGHT = 40;       // distancia a la esquina superior derecha
const SHOW_PHASE_NAME = true;     // mostrar el nombre de la fase lunar (false para ocultarlo)
```

Al guardar, la rueda se actualiza sola.

## Android

Widget de la pantalla de inicio con fondo transparente. Android 7 o posterior; no
necesita servicios de Google.

1. Descarga `calendario-pagano-X.Y.Z-android.apk` en el móvil (o pásalo desde el ordenador).
2. Ábrelo desde **Descargas** o el gestor de archivos. Android pedirá permiso para
   **instalar apps de origen desconocido** desde esa app: concédelo y pulsa **Instalar**.
3. Abre **Calendario Pagano**: verás la rueda, los ajustes y «Acerca de».
4. Pulsa **Añadir el widget ahora**, o mantén pulsado un hueco de la pantalla de inicio →
   **Widgets** → **Calendario Pagano**, y arrástralo.
5. Para cambiar el **tamaño**, mantén pulsado el widget y tira de sus bordes. Tocándolo
   se abre la app (ajustes y «Acerca de»).

Para recibir avisos de actualizaciones, puedes instalarlo con
[Obtainium](https://obtainium.imranr.dev/) indicando la dirección de este repositorio.
Pronto también en **F-Droid**.

---

## Desinstalar

| Escritorio | Cómo |
|---|---|
| Cinnamon | Quita el desklet y borra `~/.local/share/cinnamon/desklets/calendario-pagano@lacaetra.com` |
| GNOME | `gnome-extensions uninstall calendario-pagano@lacaetra.com` |
| KDE Plasma | `kpackagetool6 --type Plasma/Applet --remove org.lacaetra.calendariopagano` |
| Debian/Ubuntu | `sudo apt remove calendario-pagano` |
| Fedora | `sudo dnf remove calendario-pagano` |
| Windows | Configuración → Aplicaciones → Calendario Pagano → Desinstalar |
| Android | Mantén pulsado el icono → Desinstalar |
| macOS | Borra la carpeta `calendario-pagano.widget` de la carpeta de widgets |

## Si algo no funciona

Abre una [incidencia](https://github.com/LaCaetra/lacaetra-retrocultura/issues) con
tu sistema, tu escritorio y, si puedes, una captura y lo que salga de:

- **GNOME**: `journalctl -b /usr/bin/gnome-shell | grep -i -A5 calendario | tail -40`
- **Cinnamon**: Alt+F2, escribe `lg` y mira la pestaña **Registro**
- **KDE**: `journalctl -b | grep -i -e plasma -e calendario | tail -40`
- **App de escritorio en Linux**: ejecútala desde la terminal (`calendario-pagano`) y copia lo que salga
