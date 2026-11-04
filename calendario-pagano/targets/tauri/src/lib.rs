//! Calendario Pagano · app de escritorio (Windows, macOS y escritorios Linux sin widgets propios).
//!
//! Una ventana sin marco, transparente y pegada al fondo muestra la rueda del año
//! (dist/web). Las opciones están en el icono de la bandeja del sistema.
//!
//! Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
//! - La Caetra, retrocultura (https://lacaetra.com/).
//! Código: GPL-3.0-or-later

use std::{fs, path::PathBuf, sync::Mutex};

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::TrayIconBuilder,
    AppHandle, Emitter, LogicalSize, Manager, Wry,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_window_state::StateFlags;

/// Tamaños de la rueda que se ofrecen en el menú, en píxeles lógicos.
const SIZES: [(u32, &str); 4] = [(260, "Pequeña"), (360, "Mediana"), (480, "Grande"), (640, "Muy grande")];

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", default)]
struct Ajustes {
    size: u32,
    show_phase_name: bool,
}

impl Default for Ajustes {
    fn default() -> Self {
        Self { size: 360, show_phase_name: true }
    }
}

struct Estado(Mutex<Ajustes>);

fn ruta_ajustes(app: &AppHandle) -> Option<PathBuf> {
    app.path().app_config_dir().ok().map(|d| d.join("ajustes.json"))
}

fn cargar(app: &AppHandle) -> Ajustes {
    ruta_ajustes(app)
        .and_then(|p| fs::read_to_string(p).ok())
        .and_then(|t| serde_json::from_str(&t).ok())
        .unwrap_or_default()
}

fn guardar(app: &AppHandle, a: &Ajustes) {
    if let Some(p) = ruta_ajustes(app) {
        if let Some(dir) = p.parent() {
            let _ = fs::create_dir_all(dir);
        }
        if let Ok(t) = serde_json::to_string_pretty(a) {
            let _ = fs::write(p, t);
        }
    }
}

/// Ajusta la ventana y avisa a la página para que se repinte.
fn aplicar(app: &AppHandle, a: &Ajustes) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.set_size(LogicalSize::new(a.size as f64, a.size as f64));
    }
    let _ = app.emit("ajustes", a.clone());
}

#[tauri::command]
fn get_settings(estado: tauri::State<Estado>) -> Ajustes {
    estado.0.lock().unwrap().clone()
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::POSITION)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![get_settings])
        .setup(|app| {
            let handle = app.handle().clone();
            let ajustes = cargar(&handle);
            app.manage(Estado(Mutex::new(ajustes.clone())));

            let fase = CheckMenuItem::with_id(app, "fase", "Mostrar el nombre de la fase lunar", true, ajustes.show_phase_name, None::<&str>)?;
            let tamanos: Vec<(u32, CheckMenuItem<Wry>)> = SIZES
                .iter()
                .map(|(px, nombre)| {
                    CheckMenuItem::with_id(app, format!("t{px}"), *nombre, true, *px == ajustes.size, None::<&str>)
                        .map(|item| (*px, item))
                })
                .collect::<Result<_, _>>()?;
            let refs: Vec<&dyn tauri::menu::IsMenuItem<Wry>> = tamanos.iter().map(|(_, i)| i as _).collect();
            let submenu = Submenu::with_items(app, "Tamaño", true, &refs)?;
            let inicio = CheckMenuItem::with_id(
                app, "inicio", "Iniciar con el sistema", true,
                app.autolaunch().is_enabled().unwrap_or(false), None::<&str>,
            )?;
            let acerca = MenuItem::with_id(app, "acerca", "La Caetra · retrocultura", false, None::<&str>)?;
            let salir = MenuItem::with_id(app, "salir", "Salir", true, None::<&str>)?;
            let sep1 = PredefinedMenuItem::separator(app)?;
            let sep2 = PredefinedMenuItem::separator(app)?;
            let menu = Menu::with_items(app, &[&fase, &submenu, &inicio, &sep1, &acerca, &sep2, &salir])?;

            TrayIconBuilder::with_id("bandeja")
                .icon(app.default_window_icon().cloned().expect("falta el icono"))
                .tooltip("Calendario Pagano")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(move |app, event| {
                    let id = event.id().as_ref().to_string();
                    match id.as_str() {
                        "salir" => app.exit(0),
                        "inicio" => {
                            let al = app.autolaunch();
                            let activo = al.is_enabled().unwrap_or(false);
                            let _ = if activo { al.disable() } else { al.enable() };
                            let _ = inicio.set_checked(!activo);
                        }
                        _ => {
                            let estado = app.state::<Estado>();
                            let copia = {
                                let mut a = estado.0.lock().unwrap();
                                if id == "fase" {
                                    a.show_phase_name = !a.show_phase_name;
                                    let _ = fase.set_checked(a.show_phase_name);
                                } else if let Some(px) = id.strip_prefix('t').and_then(|n| n.parse().ok()) {
                                    a.size = px;
                                } else {
                                    return;
                                }
                                a.clone()
                            };
                            for (px, item) in &tamanos {
                                let _ = item.set_checked(*px == copia.size);
                            }
                            guardar(app, &copia);
                            aplicar(app, &copia);
                        }
                    }
                })
                .build(app)?;

            aplicar(&handle, &ajustes);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("no se pudo iniciar Calendario Pagano");
}
