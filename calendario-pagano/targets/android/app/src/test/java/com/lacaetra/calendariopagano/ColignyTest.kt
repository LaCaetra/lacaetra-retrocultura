package com.lacaetra.calendariopagano

import java.time.LocalDate
import java.time.ZoneId
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Compara el motor Kotlin con referencia.csv, generado con el núcleo JavaScript
 * (core/coligny.js) para cada día de 2025 a 2030 a mediodía, hora de Madrid.
 */
class ColignyTest {
    @Test
    fun coincideConElNucleoJavaScript() {
        val errores = comparar()
        assertEquals(errores.take(10).joinToString("\n"), 0, errores.size)
    }

    companion object {
        fun comparar(): List<String> {
            Coligny.zone = ZoneId.of("Europe/Madrid")
            val csv = ColignyTest::class.java.getResource("/referencia.csv")!!.readText().trim().lines().drop(1)
            val errores = mutableListOf<String>()
            for (linea in csv) {
                val c = linea.split(",")
                val fecha = LocalDate.parse(c[0])
                val t = fecha.atTime(12, 0).atZone(Coligny.zone).toInstant().toEpochMilli()
                val celta = Coligny.celticDate(t)
                val f = Coligny.festivalState(t)
                val p = Coligny.moonPhase(t)
                val obtenido = listOf(c[0], celta.month, celta.day.toString(), celta.length.toString(),
                    f.next.fiesta.key, f.daysToNext.toString(), f.today?.fiesta?.key ?: "",
                    "%.9f".format(java.util.Locale.ROOT, f.wheelPosition), "%.9f".format(java.util.Locale.ROOT, p),
                    Coligny.moonPhaseName(p))
                if (obtenido != c) errores += "esperado $c\nobtenido $obtenido"
            }
            return errores
        }
    }
}
