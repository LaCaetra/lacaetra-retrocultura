/*
 * Calendario Pagano para Android: widget de la pantalla de inicio.
 * Sin bibliotecas externas (ni AndroidX ni Google Play Services): solo Kotlin y el SDK.
 */
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Firma de las versiones publicadas: datos en keystore.properties (no se sube al repositorio)
// o en variables de entorno (compilación automática en GitHub).
val firma = Properties().apply {
    val f = rootProject.file("keystore.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun dato(clave: String, entorno: String): String? = firma.getProperty(clave) ?: System.getenv(entorno)

android {
    namespace = "com.lacaetra.calendariopagano"
    compileSdk = 35
    buildToolsVersion = "35.0.0"

    defaultConfig {
        applicationId = "com.lacaetra.calendariopagano"
        minSdk = 24
        targetSdk = 35
        versionCode = 903        // lo actualiza build.mjs a partir de VERSION
        versionName = "0.9.3"
    }

    signingConfigs {
        val almacen = dato("storeFile", "ANDROID_KEYSTORE")
        if (almacen != null) create("publicacion") {
            storeFile = file(almacen)
            storePassword = dato("storePassword", "ANDROID_KEYSTORE_PASSWORD")
            keyAlias = dato("keyAlias", "ANDROID_KEY_ALIAS")
            keyPassword = dato("keyPassword", "ANDROID_KEY_PASSWORD")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
            signingConfig = signingConfigs.findByName("publicacion")
        }
    }

    // Compilación reproducible para F-Droid: sin metadatos de dependencias de Google.
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    testImplementation("junit:junit:4.13.2")
}
