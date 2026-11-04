/*
 * Calendario Pagano · dibujo de la rueda del año en Android (traducción de drawWheel
 * de core/coligny.js al Canvas de Android).
 * Código: GPL-3.0-or-later · Contenidos: CC BY-SA 4.0
 */
package com.lacaetra.calendariopagano

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

object Rueda {
    const val SIZE = 360f

    private fun rgb(r: Int, g: Int, b: Int, a: Float = 1f) = Color.argb((a * 255).toInt(), r, g, b)
    private fun f(r: Double, g: Double, b: Double, a: Float) = Color.argb((a * 255).toInt(), (r * 255).toInt(), (g * 255).toInt(), (b * 255).toInt())
    private val BRG_DARK = rgb(0x00, 0x2e, 0x1c)
    private val CREAM = rgb(0xf5, 0xf0, 0xe8)
    private val GOLD = rgb(0xc9, 0xa8, 0x4c)
    private fun alpha(c: Int, a: Float) = Color.argb((a * 255).toInt(), Color.red(c), Color.green(c), Color.blue(c))
    private fun deg(rad: Double) = (rad * 180 / PI).toFloat()

    private fun wheelAngle(position: Double) = position / 8 * 2 * PI   // 0 arriba, sentido horario
    private fun polar(c: Float, r: Float, a: Double) = Pair(c + r * sin(a).toFloat(), c - r * cos(a).toFloat())

    /** Dibuja la rueda en un bitmap cuadrado de `px` píxeles con fondo transparente. */
    fun bitmap(px: Int, now: Long, showPhaseName: Boolean): Bitmap {
        val bmp = Bitmap.createBitmap(px, px, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        canvas.scale(px / SIZE, px / SIZE)
        draw(canvas, Coligny.viewData(now), showPhaseName)
        return bmp
    }

    fun draw(cv: Canvas, v: Coligny.Vista, showPhaseName: Boolean) {
        val s = SIZE
        val c = s / 2
        val big = s / 2 - 6
        val ring = big - 30
        val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
        val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
        val ovalBig = RectF(c - big, c - big, c + big, c + big)
        val ovalRing = RectF(c - ring, c - ring, c + ring, c + ring)

        // Anillo de las fiestas: mitad oscura (Samhain → Beltane) y mitad luminosa.
        fun half(a0: Double, a1: Double, color: Int) {
            val p = Path()
            p.arcTo(ovalBig, deg(a0 - PI / 2), deg(a1 - a0), true)
            p.arcTo(ovalRing, deg(a1 - PI / 2), -deg(a1 - a0))
            p.close()
            fill.color = color
            cv.drawPath(p, fill)
        }
        half(0.0, PI, f(0.0, 0.13, 0.08, 0.95f))
        half(PI, 2 * PI, f(0.18, 0.40, 0.22, 0.9f))
        stroke.color = alpha(GOLD, 0.7f); stroke.strokeWidth = 1f
        for (a in listOf(0.0, PI)) {
            val (x0, y0) = polar(c, ring, a); val (x1, y1) = polar(c, big, a)
            cv.drawLine(x0, y0, x1, y1, stroke)
        }
        stroke.color = alpha(GOLD, 0.95f); stroke.strokeWidth = 2f
        cv.drawCircle(c, c, big, stroke)
        stroke.color = alpha(GOLD, 0.5f); stroke.strokeWidth = 1f
        cv.drawCircle(c, c, ring, stroke)

        // Tramo recorrido desde la última fiesta.
        val aNow = wheelAngle(v.fest.wheelPosition)
        val aPrev = wheelAngle(v.fest.previous.index.toDouble())
        val end = aNow + if (aNow < aPrev) 2 * PI else 0.0
        stroke.color = alpha(GOLD, 0.85f); stroke.strokeWidth = 4f
        cv.drawArc(ovalRing, deg(aPrev - PI / 2), deg(end - aPrev), false, stroke)

        // Aguja de hoy, con cabeza hueca.
        val (p1x, p1y) = polar(c, ring - 26, aNow)
        val (p2x, p2y) = polar(c, ring, aNow)
        stroke.color = alpha(GOLD, 0.8f); stroke.strokeWidth = 2f
        cv.drawLine(p1x, p1y, p2x, p2y, stroke)
        stroke.color = BRG_DARK; stroke.strokeWidth = 4f
        cv.drawCircle(p2x, p2y, 8f, stroke)
        stroke.color = GOLD; stroke.strokeWidth = 2f
        cv.drawCircle(p2x, p2y, 8f, stroke)

        // Fiestas: marca y nombre.
        val nextKey = (v.fest.today ?: v.fest.next).fiesta.key
        Coligny.FESTIVALS.forEachIndexed { i, fiesta ->
            val a = wheelAngle(i.toDouble())
            val (tx, ty) = polar(c, ring, a)
            val isNext = fiesta.key == nextKey
            val r = if (isNext) 5f else 3.5f
            fill.color = if (fiesta.solar) GOLD else CREAM
            cv.drawCircle(tx, ty, r, fill)
            stroke.color = BRG_DARK; stroke.strokeWidth = 1f
            cv.drawCircle(tx, ty, r, stroke)
            val (lx, ly) = polar(c, ring + 15, a)
            var rot = a
            if (a > PI / 2 + 0.01 && a < 3 * PI / 2 - 0.01) rot += PI
            text(cv, fiesta.name.uppercase(), lx, ly, 11f, serif = true, bold = isNext, rot = rot,
                color = if (isNext) GOLD else CREAM, alpha = if (isNext) 1f else 0.85f, spacing = 1.5f)
        }

        // Centro.
        text(cv, Coligny.gregorianLong(v.now), c, c - 70, 13f, color = CREAM, alpha = 0.9f, shadow = true)
        moon(cv, c, c - 30, 50f, v.phase)
        text(cv, "${v.celtic.month} · ${v.celtic.day}", c, c + 16, 22f, serif = true, bold = true, color = CREAM, shadow = true)
        text(cv, Coligny.festivalLine(v.fest), c, c + 42, 12f, bold = true, color = GOLD, shadow = true)
        if (showPhaseName)
            text(cv, v.phaseName, c, c + 60, 10f, color = CREAM, alpha = 0.9f, shadow = true)
    }

    private fun text(
        cv: Canvas, str: String, x: Float, y: Float, size: Float,
        serif: Boolean = false, bold: Boolean = false, rot: Double = 0.0,
        color: Int, alpha: Float = 1f, spacing: Float = 0f, shadow: Boolean = false,
    ) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textSize = size
            typeface = Typeface.create(if (serif) Typeface.SERIF else Typeface.SANS_SERIF, if (bold) Typeface.BOLD else Typeface.NORMAL)
            textAlign = Paint.Align.CENTER
            letterSpacing = spacing / size
        }
        val fm = p.fontMetrics
        val baseline = -(fm.ascent + fm.descent) / 2   // texto centrado verticalmente en (x, y)
        cv.save()
        cv.translate(x, y)
        if (rot != 0.0) cv.rotate(deg(rot))
        if (shadow) {   // sombra suave desplazada, para leer el texto sobre cualquier fondo
            p.color = f(0.0, 0.12, 0.07, 0.55f)
            cv.drawText(str, 1f, baseline + 1, p)
        }
        p.color = alpha(color, alpha)
        cv.drawText(str, 0f, baseline, p)
        cv.restore()
    }

    /** Emoji de luna llena con la sombra de la fase exacta encima. */
    private fun moon(cv: Canvas, cx: Float, cy: Float, size: Float, phase: Double) {
        val p = Paint(Paint.ANTI_ALIAS_FLAG).apply { textSize = size }
        val b = Rect()
        p.getTextBounds("🌕", 0, "🌕".length, b)
        cv.drawText("🌕", cx - (b.left + b.right) / 2f, cy - (b.top + b.bottom) / 2f, p)
        val r = min(b.width(), b.height()) / 2f

        val k = Coligny.terminator(phase).toFloat()
        val side = if (phase < 0.5) 1f else -1f   // creciente a la derecha, menguante a la izquierda
        val n = 64
        cv.save()
        cv.clipPath(Path().apply { addCircle(cx, cy, max(r - 0.5f, 0.5f), Path.Direction.CW) })
        val sombra = Path().apply {
            fillType = Path.FillType.EVEN_ODD
            addCircle(cx, cy, r + 2, Path.Direction.CW)
            for (i in 0..n) {
                val t = -PI / 2 + PI * i / n
                val x = cx + side * r * cos(t).toFloat(); val y = cy + r * sin(t).toFloat()
                if (i == 0) moveTo(x, y) else lineTo(x, y)
            }
            for (i in 0..n) {
                val t = PI / 2 - PI * i / n
                lineTo(cx + side * r * k * cos(t).toFloat(), cy + r * sin(t).toFloat())
            }
            close()
        }
        cv.drawPath(sombra, Paint(Paint.ANTI_ALIAS_FLAG).apply { color = f(0.12, 0.12, 0.14, 0.88f) })
        cv.restore()
    }
}
