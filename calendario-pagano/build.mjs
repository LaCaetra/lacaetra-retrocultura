#!/usr/bin/env node
/*
 * Genera todas las versiones del widget a partir de core/ y targets/.
 *
 *   node build.mjs           → dist/<destino>/... y dist/paquetes/*.zip
 *   node build.mjs --web     → solo dist/web (lo que necesita la app Tauri; no usa `zip`)
 *
 * Solo usa Node (≥ 18) y la orden `zip`. Para la extensión de GNOME usa
 * además `glib-compile-schemas` si está instalado.
 *
 * Código: GPL-3.0-or-later
 */
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const VERSION = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
const UUID = "calendario-pagano@lacaetra.com";
const DIST = path.join(ROOT, "dist");
const PKG = path.join(DIST, "paquetes");
const SOLO_WEB = process.argv.includes("--web");

const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const CORE = read("core/coligny.js").replaceAll("@@VERSION@@", VERSION);
const GJS = read("core/adapters/cairo-gjs.js");
const CANVAS = read("core/adapters/canvas2d.js");

function fill(text) {
    return text
        .replace("/*@@CORE@@*/", () => CORE)
        .replace("/*@@GJS_ADAPTER@@*/", () => GJS)
        .replace("/*@@CANVAS_ADAPTER@@*/", () => CANVAS)
        .replaceAll("@@VERSION@@", VERSION);
}

// Copia un directorio de targets/ a dist/, rellenando las plantillas de texto.
function copyTarget(from, to) {
    const src = path.join(ROOT, from);
    fs.mkdirSync(to, {recursive: true});
    for (const entry of fs.readdirSync(src, {withFileTypes: true})) {
        const s = path.join(src, entry.name), d = path.join(to, entry.name);
        if (entry.isDirectory()) copyTarget(path.relative(ROOT, s), d);
        else if (/\.(js|jsx|json|qml|xml|html|md)$/.test(entry.name)) fs.writeFileSync(d, fill(fs.readFileSync(s, "utf8")));
        else fs.copyFileSync(s, d);
    }
}

function zip(dir, file, {includeDir = false} = {}) {
    const out = path.join(PKG, file);
    fs.rmSync(out, {force: true});
    if (includeDir) execFileSync("zip", ["-qr9X", out, path.basename(dir)], {cwd: path.dirname(dir)});
    else execFileSync("zip", ["-qr9X", out, "."], {cwd: dir});
    return out;
}

fs.rmSync(DIST, {recursive: true, force: true});
fs.mkdirSync(PKG, {recursive: true});
const icon = path.join(ROOT, "core/icon.png");
const built = [];

if (!SOLO_WEB) {
// Cinnamon: desklet
{
    const dir = path.join(DIST, "cinnamon", UUID);
    copyTarget("targets/cinnamon", dir);
    fs.copyFileSync(icon, path.join(dir, "icon.png"));
    built.push(zip(dir, `calendario-pagano-cinnamon-${VERSION}.zip`, {includeDir: true}));
}

// GNOME Shell: extensión (zip con los archivos en la raíz, como `gnome-extensions pack`)
{
    const dir = path.join(DIST, "gnome", UUID);
    copyTarget("targets/gnome", dir);
    try {
        execFileSync("glib-compile-schemas", [path.join(dir, "schemas")]);
    } catch {
        console.warn("aviso: glib-compile-schemas no está instalado; GNOME 44+ compila los esquemas al instalar.");
    }
    built.push(zip(dir, `calendario-pagano-gnome-${VERSION}.zip`));
}

// KDE Plasma 6: plasmoide (.plasmoid = zip con los archivos en la raíz)
{
    const dir = path.join(DIST, "plasma", "org.lacaetra.calendariopagano");
    copyTarget("targets/plasma", dir);
    fs.renameSync(path.join(dir, "coligny.js"), path.join(dir, "contents/ui/coligny.js"));
    built.push(zip(dir, `calendario-pagano-plasma-${VERSION}.plasmoid`));
}

// macOS: widget de Übersicht
{
    const dir = path.join(DIST, "ubersicht", "calendario-pagano.widget");
    copyTarget("targets/ubersicht", dir);
    built.push(zip(dir, `calendario-pagano-macos-ubersicht-${VERSION}.zip`, {includeDir: true}));
}

}

// Web (vista previa y interfaz de la app Tauri)
{
    const dir = path.join(DIST, "web");
    copyTarget("targets/web", dir);
    fs.copyFileSync(icon, path.join(dir, "icon.png"));
}

// App de escritorio (Tauri): misma versión que el resto.
{
    const conf = path.join(ROOT, "targets/tauri/tauri.conf.json");
    fs.writeFileSync(conf, fs.readFileSync(conf, "utf8").replace(/"version": "[^"]*"/, `"version": "${VERSION}"`));
    const cargo = path.join(ROOT, "targets/tauri/Cargo.toml");
    fs.writeFileSync(cargo, fs.readFileSync(cargo, "utf8").replace(/^version = "[^"]*"/m, `version = "${VERSION}"`));
    // Si ya se compiló la app, sus paquetes se copian con nombres sin espacios.
    const bundle = path.join(ROOT, "targets/tauri/target/release/bundle");
    for (const [sub, ext, name] of [["deb", ".deb", "linux-amd64.deb"], ["rpm", ".rpm", "linux-x86_64.rpm"],
        ["appimage", ".AppImage", "linux-x86_64.AppImage"]]) {
        const dir = path.join(bundle, sub);
        const file = fs.existsSync(dir) && fs.readdirSync(dir).find(f => f.endsWith(ext) && f.includes(VERSION));
        if (file) {
            const out = path.join(PKG, `calendario-pagano-${VERSION}-${name}`);
            fs.copyFileSync(path.join(dir, file), out);
            built.push(out);
        }
    }
    const nsis = path.join(ROOT, "targets/tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis");
    const exe = fs.existsSync(nsis) && fs.readdirSync(nsis).find(f => f.endsWith(".exe") && f.includes(VERSION));
    if (exe) {
        const out = path.join(PKG, `calendario-pagano-${VERSION}-windows-x64-setup.exe`);
        fs.copyFileSync(path.join(nsis, exe), out);
        built.push(out);
    }
}

console.log(`Calendario Pagano ${VERSION}`);
for (const f of built) console.log("  " + path.relative(ROOT, f));
