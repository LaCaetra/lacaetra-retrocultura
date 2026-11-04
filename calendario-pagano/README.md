# Calendario Pagano · rueda del año

Widget de escritorio (y de móvil Android) con la **rueda del año**: las ocho fiestas, el día del
**calendario celta de Coligny** y la **fase lunar** de hoy, con la cuenta atrás
hasta la próxima fiesta. Funciona sin conexión.

![Rueda del año el 4 de noviembre de 2026: Samonios 10, faltan 47 días para Yule](docs/rueda.png)

## Instalación

Descarga el paquete de tu sistema en **[Versiones](https://github.com/LaCaetra/lacaetra-retrocultura/releases)**.

| Sistema | Paquete | Tipo |
|---|---|---|
| Linux · Cinnamon (Mint, Fedora Cinnamon…) | `calendario-pagano-cinnamon-*.zip` | desklet |
| Linux · GNOME 45 a 51 (Debian, Ubuntu, Fedora…) | `calendario-pagano-gnome-*.zip` | extensión |
| Linux · KDE Plasma 6 (Kubuntu, Fedora KDE, Debian…) | `calendario-pagano-plasma-*.plasmoid` | plasmoide |
| Linux · XFCE, MATE, Budgie y otros | `Calendario.Pagano_*_amd64.deb`, `.rpm` o `.AppImage` | app de escritorio |
| Windows 10 y 11 | `Calendario.Pagano_*_x64-setup.exe` | app de escritorio |
| Android 7 o posterior | `calendario-pagano-*-android.apk` | widget de pantalla de inicio |
| macOS 12 o posterior | instalador de una orden o `calendario-pagano-macos-ubersicht-*.zip` | widget de Übersicht |

**📖 [Guía de instalación paso a paso para cada escritorio](INSTALAR.md)**, con
instrucciones para desinstalar y qué hacer si algo no funciona.
**⚠️ Antes de instalar, mira los [problemas conocidos y sus soluciones](#problemas-conocidos-y-soluciones).**

Lo más importante:

- **GNOME**: después de instalar la extensión hay que **cerrar la sesión y volver
  a entrar** antes de activarla.
- **Windows**: si SmartScreen avisa, pulsa **Más información → Ejecutar de todas formas**.
- En todos los escritorios (salvo Übersicht en Mac) la rueda **se arrastra** con el
  ratón y el **botón derecho** sobre ella da acceso a la configuración y a «Acerca de».

## Problemas conocidos y soluciones

Probado en Debian 13 con GNOME 48 (Wayland), KDE Plasma 6 (Wayland), Cinnamon,
MATE, XFCE y LXDE, en Windows 10 y en Android 15 (LineageOS).

| Problema | Solución |
|---|---|
| **GNOME**: al activar la extensión dice que «no existe». | Después de instalarla hay que **cerrar la sesión y volver a entrar**; luego se activa. |
| **LXDE, Openbox** y otros escritorios sin compositor: la rueda sale dentro de un **cuadrado negro**. | Instala `picom` y arráncalo en modo `xrender` al iniciar sesión; el calendario debe abrirse después de picom. Instrucciones en la [guía](INSTALAR.md#xfce-mate-lxde-budgie-y-otros-escritorios-linux). Si usas varios escritorios en el mismo equipo, añade `OnlyShowIn=LXDE;` al arranque de picom para que no choque con el compositor de MATE o XFCE. |
| **Instalar el `.deb` como root** (`su`) da «fichero no admitido». | Como root, `~` es `/root`: usa la ruta completa (`/home/tu-usuario/Descargas/…`) o `./archivo.deb` desde su carpeta. Sin `./` delante, apt busca el nombre en los repositorios. |
| **GNOME, KDE o XFCE con Wayland**: la app de escritorio no se queda detrás de las ventanas. | Wayland no lo permite. En GNOME y KDE usa su widget propio; en XFCE, la sesión normal (X11). |
| **Windows · Edge** bloquea la descarga («no se descarga habitualmente»). | En la lista de descargas, **⋯ → Conservar → Mostrar más → Conservar de todos modos**. Es un aviso por ser un archivo nuevo y sin firma digital. |
| **Windows** no deja ejecutar el instalador (SmartScreen: «Windows protegió su PC»). | Pulsa **Más información → Ejecutar de todas formas**. Si no aparece ese botón: clic derecho sobre el `.exe` → **Propiedades** → marca **Desbloquear** → Aceptar, y vuelve a abrirlo. |
| **Windows 11** con «Control inteligente de aplicaciones» (*Smart App Control*) activado bloquea el instalador sin opción de ejecutarlo. | Esa función bloquea los programas sin firma digital. Solo se puede desactivar en **Seguridad de Windows → Control de aplicaciones y navegador**, y Windows no permite volver a activarla después: decide tú si te compensa. |
| **macOS** no abre una app descargada. | En Mac se usa el widget de **Übersicht**, que no necesita firma. |

## Cómo se calculan las fechas

Según la *Guía de festividades* de La Caetra:

- **Yule, Ostara, Litha y Mabon**: solsticios y equinoccios (algoritmo de Meeus,
  con unos minutos de error).
- **Samhain, Imbolc, Beltane y Lughnasad**: segunda luna llena tras el solsticio
  o equinoccio anterior.
- El **año celta** empieza en Samhain y **cada mes empieza con su luna llena**: dura
  29 días (*anmatos*) o 30 (*matos*) según la luna real. Los años de 13 lunas
  tienen un mes extra, **Mid Samonios**.
- La **fase lunar** usa la tabla del Observatorio Astronómico Nacional (IGN) para
  2026; fuera de ese año, un cálculo aproximado (unas horas de error). Una luna
  llena muy cerca de medianoche podría mover una fiesta un día.

## Desarrollo

Todas las versiones salen del mismo núcleo, así que una corrección en `core/`
llega a todas:

```
core/coligny.js              motor del calendario y dibujo de la rueda (sin dependencias)
core/adapters/cairo-gjs.js   dibujo con Cairo + Pango (Cinnamon y GNOME)
core/adapters/canvas2d.js    dibujo con Canvas 2D (web, Tauri, Übersicht y QML de KDE)
targets/                     plantillas de cada escritorio
build.mjs                    genera dist/ y los paquetes
tests/                       pruebas del motor
```

```bash
node build.mjs                       # genera dist/ y dist/paquetes/
node --test "tests/*.test.mjs"       # pruebas del motor
xdg-open "dist/web/index.html?fecha=2026-10-28"   # vista previa de cualquier día
```

Los paquetes de cada versión se compilan solos en GitHub Actions al crear una
etiqueta `calendario-pagano-vX.Y.Z` (ver `.github/workflows/`). Para compilar la
app de escritorio a mano (Tauri 2; requiere Rust y las dependencias de Tauri):

```bash
node build.mjs
cd targets/tauri
npx @tauri-apps/cli@2 build --bundles deb,rpm,appimage       # Linux
scripts/build-windows.sh                                     # Windows, desde Linux
cd ../.. && node build.mjs     # copia los paquetes compilados a dist/paquetes/
```

La app Tauri también compila en un Mac (`--bundles dmg`), pero sin la firma de
Apple (99 $/año) el sistema la bloquea al abrirla; por eso en Mac se distribuye
el widget de Übersicht.

## Cómo se ha hecho

Este software ha sido desarrollado con la ayuda de Claude, el asistente de IA de
Anthropic. El diseño, los contenidos y las decisiones son de La Caetra.

## Autoría y licencia

Autoría de contenidos: **Andrea M. Miranda Duque** y **Fernando A. Muñoz
Villarejo** - [La Caetra, retrocultura](https://lacaetra.com/).

- Código: [GPL-3.0-or-later](../LICENSE).
- Contenidos (textos, nombres y descripciones de las fiestas, diseño de la rueda,
  paleta e icono): [CC BY-SA 4.0](../LICENSE-CC-BY-SA-4.0.txt).
- El nombre y el logotipo de La Caetra son marca nuestra y no entran en esas
  licencias: las versiones modificadas deben llevar otro nombre e icono y no
  presentarse como oficiales ([detalles](../README.md#marca)).

Si te gusta y quieres apoyarnos: **[Liberapay](https://liberapay.com/lacaetra/donate)**.
