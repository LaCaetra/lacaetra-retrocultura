# Cómo instalar el Calendario Pagano

Guía paso a paso para cada escritorio. Todos los paquetes se descargan de la
página de **[Versiones](https://github.com/LaCaetra/lacaetra-retrocultura/releases/latest)**
(apartado *Assets*).

**¿Qué escritorio tengo?** En Linux, abre una terminal y escribe
`echo $XDG_CURRENT_DESKTOP`. Saldrá, por ejemplo, `GNOME`, `KDE`, `X-Cinnamon` o `XFCE`.

- [Cinnamon](#cinnamon) (Linux Mint, Fedora Cinnamon, Debian con Cinnamon)
- [GNOME](#gnome) (Debian, Ubuntu, Fedora Workstation)
- [KDE Plasma 6](#kde-plasma-6) (Kubuntu, Fedora KDE, Debian con KDE)
- [XFCE, MATE, Budgie y otros escritorios Linux](#xfce-mate-budgie-y-otros-escritorios-linux)
- [Windows 10 y 11](#windows-10-y-11)
- [macOS](#macos)
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

## XFCE, MATE, Budgie y otros escritorios Linux

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

> En GNOME y KDE con Wayland usa mejor su widget propio (arriba): Wayland no deja
> que una aplicación se quede siempre detrás de las demás ventanas.

## Windows 10 y 11

1. Descarga `Calendario.Pagano_X.Y.Z_x64-setup.exe` y ábrelo.
2. Windows puede avisar de que el programa no está firmado (SmartScreen): pulsa
   **Más información → Ejecutar de todas formas**. Es normal en programas libres
   que no pagan un certificado de firma.
3. Al terminar, la rueda aparece en el escritorio. **Arrástrala** para colocarla.
4. **Botón derecho sobre la rueda** (o el **icono junto al reloj**, que puede estar
   escondido en la flecha **^**): tamaño, nombre de la fase lunar, **Iniciar con el
   sistema**, **Acerca de** y Salir.

## macOS

En Mac se usa **Übersicht**, un programa libre y gratuito para poner widgets en el
escritorio.

1. Descarga e instala [Übersicht](https://tracesof.net/uebersicht/) y ábrelo
   (aparece un icono en la barra de menús).
2. Descarga `calendario-pagano-macos-ubersicht-X.Y.Z.zip` y descomprímelo
   (doble clic).
3. En el icono de Übersicht → **Open Widgets Folder**, y mueve allí la carpeta
   `calendario-pagano.widget`.
4. La rueda aparece arriba a la derecha. Übersicht no tiene menús ni arrastre: el
   **tamaño**, la **posición** y el nombre de la fase lunar se cambian en las primeras
   líneas de `calendario-pagano.widget/index.jsx` (con cualquier editor de texto).

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
| macOS | Borra la carpeta `calendario-pagano.widget` de la carpeta de widgets |

## Si algo no funciona

Abre una [incidencia](https://github.com/LaCaetra/lacaetra-retrocultura/issues) con
tu sistema, tu escritorio y, si puedes, una captura y lo que salga de:

- **GNOME**: `journalctl -b /usr/bin/gnome-shell | grep -i -A5 calendario | tail -40`
- **Cinnamon**: Alt+F2, escribe `lg` y mira la pestaña **Registro**
- **KDE**: `journalctl -b | grep -i -e plasma -e calendario | tail -40`
- **App de escritorio en Linux**: ejecútala desde la terminal (`calendario-pagano`) y copia lo que salga
