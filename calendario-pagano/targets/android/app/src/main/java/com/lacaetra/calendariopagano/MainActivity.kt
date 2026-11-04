/*
 * Calendario Pagano · pantalla de la app: vista previa, ajustes y «Acerca de».
 * Se abre desde el icono de la app o tocando el widget.
 * Código: GPL-3.0-or-later
 */
package com.lacaetra.calendariopagano

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView

class MainActivity : Activity() {

    private lateinit var vista: ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dp = resources.displayMetrics.density
        val pad = (20 * dp).toInt()
        val col = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(pad, pad, pad, pad)
        }

        // Vista previa sobre un fondo oscuro, como sobre un fondo de pantalla.
        vista = ImageView(this).apply {
            setBackgroundResource(R.drawable.fondo_vista_previa)
            val p = (12 * dp).toInt(); setPadding(p, p, p, p)
            adjustViewBounds = true
        }
        col.addView(vista, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT))

        col.addView(titulo(getString(R.string.ajustes)))
        col.addView(Switch(this).apply {
            text = getString(R.string.mostrar_fase)
            isChecked = Ajustes.mostrarFase(this@MainActivity)
            setOnCheckedChangeListener { _, valor ->
                Ajustes.mostrarFase(this@MainActivity, valor)
                RuedaWidget.actualizarTodos(this@MainActivity)
                pintar()
            }
        })

        col.addView(titulo(getString(R.string.anadir_titulo)))
        col.addView(parrafo(getString(R.string.anadir_texto)))
        val manager = getSystemService(AppWidgetManager::class.java)
        if (Build.VERSION.SDK_INT >= 26 && manager?.isRequestPinAppWidgetSupported == true) {
            col.addView(Button(this).apply {
                text = getString(R.string.anadir_boton)
                setOnClickListener {
                    manager.requestPinAppWidget(ComponentName(this@MainActivity, RuedaWidget::class.java), null, null)
                }
            })
        }

        col.addView(titulo(getString(R.string.acerca_de)))
        col.addView(parrafo(getString(R.string.descripcion)))
        col.addView(parrafo(getString(R.string.version, versionName())))
        col.addView(parrafo(getString(R.string.autoria)))
        col.addView(parrafo(getString(R.string.nota_ia)).apply { alpha = 0.7f })
        col.addView(enlace(getString(R.string.web), "https://lacaetra.com/"))
        col.addView(enlace(getString(R.string.codigo), "https://github.com/LaCaetra/lacaetra-retrocultura"))
        col.addView(enlace(getString(R.string.donar), "https://liberapay.com/lacaetra/donate"))
        col.addView(parrafo(getString(R.string.licencias)).apply { alpha = 0.7f; textSize = 12f })

        setContentView(ScrollView(this).apply { addView(col) })
        pintar()
    }

    override fun onResume() {
        super.onResume()
        pintar()
        RuedaWidget.actualizarTodos(this)
    }

    private fun pintar() {
        val lado = (resources.displayMetrics.widthPixels * 0.8).toInt().coerceAtMost(900)
        vista.setImageBitmap(Rueda.bitmap(lado, System.currentTimeMillis(), Ajustes.mostrarFase(this)))
    }

    private fun versionName(): String =
        packageManager.getPackageInfo(packageName, 0).versionName ?: ""

    private fun titulo(t: String) = TextView(this).apply {
        text = t
        textSize = 18f
        setTypeface(Typeface.SERIF, Typeface.BOLD)
        setTextColor(getColor(R.color.acento))
        setPadding(0, (24 * resources.displayMetrics.density).toInt(), 0, (8 * resources.displayMetrics.density).toInt())
    }

    private fun parrafo(t: String) = TextView(this).apply {
        text = t
        textSize = 15f
        setPadding(0, 0, 0, (8 * resources.displayMetrics.density).toInt())
    }

    private fun enlace(t: String, url: String) = TextView(this).apply {
        text = t
        textSize = 15f
        setTypeface(typeface, Typeface.BOLD)
        setTextColor(getColor(R.color.acento))
        gravity = Gravity.START
        setPadding(0, (6 * resources.displayMetrics.density).toInt(), 0, (6 * resources.displayMetrics.density).toInt())
        isClickable = true
        setOnClickListener { _: View -> startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
    }
}
