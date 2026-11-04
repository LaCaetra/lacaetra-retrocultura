/*
 * Calendario Pagano · widget de la pantalla de inicio.
 * Código: GPL-3.0-or-later
 */
package com.lacaetra.calendariopagano

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.RemoteViews
import kotlin.math.max
import kotlin.math.min

class RuedaWidget : AppWidgetProvider() {

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) actualizar(context, manager, id)
    }

    override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, id: Int, options: Bundle) {
        actualizar(context, manager, id)
    }

    // Cambio de hora, de zona horaria o de día: se redibuja al momento.
    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        when (intent.action) {
            Intent.ACTION_TIME_CHANGED, Intent.ACTION_TIMEZONE_CHANGED, Intent.ACTION_DATE_CHANGED -> actualizarTodos(context)
        }
    }

    companion object {
        /** Lado máximo del bitmap: los widgets tienen un límite de memoria. */
        private const val MAX_PX = 720

        fun actualizarTodos(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, RuedaWidget::class.java))
            for (id in ids) actualizar(context, manager, id)
        }

        fun actualizar(context: Context, manager: AppWidgetManager, id: Int) {
            val opts = manager.getAppWidgetOptions(id)
            val density = context.resources.displayMetrics.density
            // Tamaño real del widget: ancho en vertical y alto en vertical.
            val wDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 180)
            val hDp = opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 180)
            val px = min(MAX_PX, max(120, (min(wDp, hDp) * density).toInt()))

            val views = RemoteViews(context.packageName, R.layout.widget)
            views.setImageViewBitmap(R.id.rueda, Rueda.bitmap(px, System.currentTimeMillis(), Ajustes.mostrarFase(context)))
            val abrir = PendingIntent.getActivity(
                context, 0, Intent(context, MainActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.rueda, abrir)
            manager.updateAppWidget(id, views)
        }
    }
}
