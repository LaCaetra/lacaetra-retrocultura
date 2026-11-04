/*
 * Calendario Pagano · motor del calendario (versión Kotlin del núcleo core/coligny.js).
 * Debe dar exactamente los mismos resultados que el núcleo JavaScript: lo comprueban
 * las pruebas con src/test/resources/referencia.csv, generado a partir de él.
 *
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 */
package com.lacaetra.calendariopagano

import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import kotlin.math.cos
import kotlin.math.floor

object Coligny {
    const val DAY = 24L * 60 * 60 * 1000
    private const val SYNODIC_MONTH = 29.530588853
    private val NEW_MOON_REFERENCE = utc(2000, 1, 6, 18, 14)

    val MONTHS = listOf(
        "Samonios", "Dumannios", "Riuros", "Anagantios", "Ogronios", "Cutios",
        "Giamonios", "Simiuisonna", "Equos", "Elembiuos", "Edrinios", "Cantlos",
    )
    const val INTERCALARY = "Mid Samonios"

    data class Fiesta(val key: String, val name: String, val detail: String, val solar: Boolean = false)

    /** Orden de la rueda, empezando arriba por Samhain y en sentido horario. */
    val FESTIVALS = listOf(
        Fiesta("samhain", "Samhain", "Año nuevo · III Fiesta de la Cosecha"),
        Fiesta("yule", "Yule", "Solsticio de invierno", solar = true),
        Fiesta("imbolc", "Imbolc", "Fiesta de Brigit"),
        Fiesta("ostara", "Ostara", "Equinoccio de primavera", solar = true),
        Fiesta("beltane", "Beltane", "Inicio del verano"),
        Fiesta("litha", "Litha", "Solsticio de verano", solar = true),
        Fiesta("lughnasad", "Lughnasad", "I Fiesta de la Cosecha"),
        Fiesta("mabon", "Mabon", "Equinoccio de otoño · II Fiesta de la Cosecha", solar = true),
    )

    private val WEEKDAYS = listOf("lun", "mar", "mié", "jue", "vie", "sáb", "dom")   // ISO: lunes = 1
    private val GREG_MONTHS = listOf("ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic")

    fun utc(y: Int, m: Int, d: Int, h: Int, min: Int): Long =
        ZonedDateTime.of(y, m, d, h, min, 0, 0, ZoneOffset.UTC).toInstant().toEpochMilli()

    var zone: ZoneId = ZoneId.systemDefault()
    fun day(t: Long): LocalDate = Instant.ofEpochMilli(t).atZone(zone).toLocalDate()
    fun startOf(d: LocalDate): Long = d.atStartOfDay(zone).toInstant().toEpochMilli()
    fun daysBetween(a: LocalDate, b: LocalDate): Int = ChronoUnit.DAYS.between(a, b).toInt()

    /** Fases de la Luna 2026, Observatorio Astronómico Nacional (IGN), en UTC. */
    private val IGN_PHASES: List<Pair<Long, Double>> = listOf(
        utc(2026, 1, 3, 10, 3) to 0.5,
        utc(2026, 1, 10, 15, 48) to 0.75,
        utc(2026, 1, 18, 19, 52) to 0.0,
        utc(2026, 1, 26, 4, 47) to 0.25,
        utc(2026, 2, 1, 22, 9) to 0.5,
        utc(2026, 2, 9, 12, 43) to 0.75,
        utc(2026, 2, 17, 12, 1) to 0.0,
        utc(2026, 2, 24, 12, 28) to 0.25,
        utc(2026, 3, 3, 11, 38) to 0.5,
        utc(2026, 3, 11, 9, 39) to 0.75,
        utc(2026, 3, 19, 1, 24) to 0.0,
        utc(2026, 3, 25, 19, 18) to 0.25,
        utc(2026, 4, 2, 2, 12) to 0.5,
        utc(2026, 4, 10, 4, 52) to 0.75,
        utc(2026, 4, 17, 11, 52) to 0.0,
        utc(2026, 4, 24, 2, 32) to 0.25,
        utc(2026, 5, 1, 17, 23) to 0.5,
        utc(2026, 5, 9, 21, 10) to 0.75,
        utc(2026, 5, 16, 20, 1) to 0.0,
        utc(2026, 5, 23, 11, 11) to 0.25,
        utc(2026, 5, 31, 8, 45) to 0.5,
        utc(2026, 6, 8, 10, 1) to 0.75,
        utc(2026, 6, 15, 2, 54) to 0.0,
        utc(2026, 6, 21, 21, 56) to 0.25,
        utc(2026, 6, 29, 23, 57) to 0.5,
        utc(2026, 7, 7, 19, 29) to 0.75,
        utc(2026, 7, 14, 9, 44) to 0.0,
        utc(2026, 7, 21, 11, 6) to 0.25,
        utc(2026, 7, 29, 14, 36) to 0.5,
        utc(2026, 8, 6, 2, 21) to 0.75,
        utc(2026, 8, 12, 17, 37) to 0.0,
        utc(2026, 8, 20, 2, 46) to 0.25,
        utc(2026, 8, 28, 4, 19) to 0.5,
        utc(2026, 9, 4, 7, 51) to 0.75,
        utc(2026, 9, 11, 3, 27) to 0.0,
        utc(2026, 9, 18, 20, 44) to 0.25,
        utc(2026, 9, 26, 16, 49) to 0.5,
        utc(2026, 10, 3, 13, 25) to 0.75,
        utc(2026, 10, 10, 15, 50) to 0.0,
        utc(2026, 10, 18, 16, 13) to 0.25,
        utc(2026, 10, 26, 4, 12) to 0.5,
        utc(2026, 11, 1, 20, 28) to 0.75,
        utc(2026, 11, 9, 7, 2) to 0.0,
        utc(2026, 11, 17, 11, 48) to 0.25,
        utc(2026, 11, 24, 14, 54) to 0.5,
        utc(2026, 12, 1, 6, 9) to 0.75,
        utc(2026, 12, 9, 0, 52) to 0.0,
        utc(2026, 12, 17, 5, 43) to 0.25,
        utc(2026, 12, 24, 1, 28) to 0.5,
        utc(2026, 12, 30, 19, 0) to 0.75,
    )

    /** Fase como fracción del ciclo: 0 nueva, 0,5 llena. */
    fun moonPhase(t: Long): Double {
        val last = IGN_PHASES.size - 1
        if (t >= IGN_PHASES[0].first && t < IGN_PHASES[last].first) {
            var i = 0
            while (IGN_PHASES[i + 1].first <= t) i++
            val (t0, p0) = IGN_PHASES[i]
            val t1 = IGN_PHASES[i + 1].first
            return (p0 + 0.25 * (t - t0) / (t1 - t0)) % 1.0
        }
        val age = ((t - NEW_MOON_REFERENCE).toDouble() / DAY) % SYNODIC_MONTH
        return ((age + SYNODIC_MONTH) % SYNODIC_MONTH) / SYNODIC_MONTH
    }

    fun moonPhaseName(p: Double): String = when {
        p < 0.03 || p >= 0.97 -> "Luna nueva"
        p < 0.22 -> "Luna creciente"
        p < 0.28 -> "Cuarto creciente"
        p < 0.47 -> "Gibosa creciente"
        p < 0.53 -> "Luna llena"
        p < 0.72 -> "Gibosa menguante"
        p < 0.78 -> "Cuarto menguante"
        else -> "Luna menguante"
    }

    /** Primera luna llena estrictamente posterior a un instante. */
    fun nextFullMoon(after: Long): Long {
        val ign = IGN_PHASES.firstOrNull { it.second == 0.5 && it.first > after }
        if (ign != null && after >= IGN_PHASES[0].first - 30 * DAY) return ign.first
        val n = floor((after - NEW_MOON_REFERENCE).toDouble() / DAY / SYNODIC_MONTH - 0.5).toLong() + 1
        var t = NEW_MOON_REFERENCE + (n + 0.5) * SYNODIC_MONTH * DAY
        if (t <= after) t += SYNODIC_MONTH * DAY
        return t.toLong()
    }

    /** Equinoccios y solsticios (Meeus, valores medios). which: 0 marzo, 1 junio, 2 septiembre, 3 diciembre. */
    fun season(year: Int, which: Int): Long {
        val y = (year - 2000) / 1000.0
        val k = arrayOf(
            doubleArrayOf(2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057),
            doubleArrayOf(2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030),
            doubleArrayOf(2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078),
            doubleArrayOf(2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032),
        )[which]
        val jde = k[0] + k[1] * y + k[2] * y * y + k[3] * y * y * y + k[4] * y * y * y * y
        return ((jde - 2440587.5) * DAY).toLong()
    }

    data class FechaFiesta(val fiesta: Fiesta, val date: LocalDate, val index: Int)

    /** Fiestas desde el equinoccio de otoño de `year` hasta el de `year + 1`. */
    fun wheelYear(year: Int): List<FechaFiesta> {
        val mabon = season(year, 2)
        val yule = season(year, 3)
        val ostara = season(year + 1, 0)
        val litha = season(year + 1, 1)
        fun second(start: Long) = nextFullMoon(nextFullMoon(start) + DAY)
        val dates = listOf(second(mabon), yule, second(yule), ostara, second(ostara), litha, second(litha), season(year + 1, 2))
        return FESTIVALS.mapIndexed { i, f -> FechaFiesta(f, day(dates[i]), i) }
    }

    fun festivalsAround(today: LocalDate): List<FechaFiesta> =
        (today.year - 2..today.year).flatMap { wheelYear(it) }.sortedBy { it.date }

    data class EstadoFiestas(
        val previous: FechaFiesta, val next: FechaFiesta, val today: FechaFiesta?,
        val wheelPosition: Double, val daysToNext: Int,
    )

    fun festivalState(now: Long): EstadoFiestas {
        val today = day(now)
        val all = festivalsAround(today)
        val i = all.indexOfFirst { it.date > today }
        val next = all[i]
        val previous = all[i - 1]
        val todayFestival = if (previous.date == today) previous else null
        val span = daysBetween(previous.date, next.date)
        val fraction = if (span > 0) daysBetween(previous.date, today).toDouble() / span else 0.0
        return EstadoFiestas(previous, next, todayFestival, (previous.index + fraction) % 8, daysBetween(today, next.date))
    }

    data class FechaCelta(val month: String, val day: Int, val length: Int, val monthStart: LocalDate) {
        val intercalary get() = month == INTERCALARY
    }

    /** Día del calendario de Coligny: el año empieza en Samhain y cada mes con su luna llena. */
    fun celticDate(now: Long): FechaCelta {
        val today = day(now)
        val samhains = (festivalsAround(today) + wheelYear(today.year + 1))
            .filter { it.fiesta.key == "samhain" }.sortedBy { it.date }
        val startIndex = samhains.indexOfFirst { it.date > today } - 1
        val start = samhains[startIndex].date
        val end = samhains[startIndex + 1].date
        val starts = mutableListOf(start)
        var fm = nextFullMoon(startOf(start) + DAY)
        while (day(fm) < end) {
            starts.add(day(fm))
            fm = nextFullMoon(fm + DAY)
        }
        starts.add(end)
        var i = 0
        while (starts[i + 1] <= today) i++
        val name = if (i < MONTHS.size) MONTHS[i] else INTERCALARY
        return FechaCelta(name, daysBetween(starts[i], today) + 1, daysBetween(starts[i], starts[i + 1]), starts[i])
    }

    fun countdownText(days: Int) = when (days) {
        0 -> "es hoy"
        1 -> "falta 1 día"
        else -> "faltan $days días"
    }

    fun gregorianLong(now: Long): String {
        val d = day(now)
        return "${WEEKDAYS[d.dayOfWeek.value - 1]} ${d.dayOfMonth} ${GREG_MONTHS[d.monthValue - 1]} ${d.year}"
    }

    fun festivalLine(f: EstadoFiestas): String =
        if (f.today != null) "${f.today.fiesta.name} · es hoy"
        else "${f.next.fiesta.name} · ${countdownText(f.daysToNext)}"

    data class Vista(val now: Long, val celtic: FechaCelta, val fest: EstadoFiestas, val phase: Double, val phaseName: String)

    fun viewData(now: Long): Vista {
        val p = moonPhase(now)
        return Vista(now, celticDate(now), festivalState(now), p, moonPhaseName(p))
    }

    /** Desplazamiento del terminador de la luna: 1 nueva, -1 llena. */
    fun terminator(phase: Double) = cos(2 * Math.PI * phase)
}
