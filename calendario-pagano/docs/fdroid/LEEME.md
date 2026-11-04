# Enviar el Calendario Pagano a F-Droid

`com.lacaetra.calendariopagano.yml` es la ficha que F-Droid necesita en su
repositorio [fdroiddata](https://gitlab.com/fdroid/fdroiddata). Los textos, el
icono y las capturas que muestra F-Droid salen de
`targets/android/fastlane/metadata/android/` (español e inglés).

Cada vez que se publica una etiqueta `calendario-pagano-vX.Y.Z`, F-Droid detecta
la versión nueva y la compila desde el código (puede tardar unos días).
