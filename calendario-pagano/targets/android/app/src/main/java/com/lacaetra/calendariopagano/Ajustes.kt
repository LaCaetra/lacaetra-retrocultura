package com.lacaetra.calendariopagano

import android.content.Context

/** Ajustes guardados en el teléfono. */
object Ajustes {
    private const val ARCHIVO = "ajustes"
    private const val FASE = "mostrar_fase"

    fun mostrarFase(context: Context) =
        context.getSharedPreferences(ARCHIVO, Context.MODE_PRIVATE).getBoolean(FASE, true)

    fun mostrarFase(context: Context, valor: Boolean) =
        context.getSharedPreferences(ARCHIVO, Context.MODE_PRIVATE).edit().putBoolean(FASE, valor).apply()
}
