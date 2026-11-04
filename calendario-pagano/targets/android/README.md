# Calendario Pagano para Android

Widget de la pantalla de inicio con la rueda del año, con fondo transparente.
App nativa en Kotlin, sin bibliotecas externas (ni AndroidX ni servicios de Google).

- `Coligny.kt`: motor del calendario, traducción de `core/coligny.js`. Las pruebas
  (`ColignyTest`) lo comparan día a día con `referencia.csv`, generado con el núcleo
  JavaScript, para que todas las versiones den las mismas fechas.
- `Rueda.kt`: dibujo de la rueda (equivalente a `drawWheel`).
- `RuedaWidget.kt`: el widget; se actualiza cada 30 minutos y al cambiar la fecha o la hora.
- `MainActivity.kt`: vista previa, ajustes y «Acerca de».

## Compilar

Requisitos: JDK 17 o posterior y el SDK de Android (`platforms;android-35`,
`build-tools;35.0.0`) con `ANDROID_HOME` apuntando a él.

```bash
./gradlew assembleDebug      # app/build/outputs/apk/debug/app-debug.apk
./gradlew test               # pruebas del motor
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Para regenerar `referencia.csv` tras cambiar el núcleo, ver el comentario de `ColignyTest`.
