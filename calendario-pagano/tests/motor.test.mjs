// Pruebas del motor del calendario: node --test tests/
// Comprueba fechas conocidas de la Guía de festividades y del calendario IGN 2026.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const code = fs.readFileSync(new URL("../core/coligny.js", import.meta.url), "utf8");
const ctx = vm.createContext({});
vm.runInContext(code + "\nthis.api = {celticDate, festivalState, wheelYear, moonPhaseName, moonPhase, viewData};", ctx);
const {celticDate, festivalState, wheelYear} = ctx.api;
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

test("Samonios 2026 empieza el 26 de octubre (Samhain)", () => {
    const c = celticDate(new Date(2026, 9, 26, 12));
    assert.equal(c.month, "Samonios");
    assert.equal(c.day, 1);
});

test("4 de noviembre de 2026 es Samonios 10", () => {
    const c = celticDate(new Date(2026, 10, 4, 12));
    assert.equal(`${c.month} ${c.day}`, "Samonios 10");
});

test("el 25 de octubre de 2026 aún es el año anterior", () => {
    assert.notEqual(celticDate(new Date(2026, 9, 25, 12)).month, "Samonios");
});

test("fiestas del año de la rueda 2026-2027", () => {
    const f = Object.fromEntries(wheelYear(2026).map(x => [x.key, ymd(x.date)]));
    assert.equal(f.samhain, "2026-10-26");
    assert.equal(f.yule, "2026-12-21");
    // Fiestas del fuego: segunda luna llena tras el solsticio/equinoccio anterior.
    assert.ok(f.imbolc > "2027-01-15" && f.imbolc < "2027-03-01", f.imbolc);
});

test("cuenta atrás hasta Yule el 4 de noviembre de 2026", () => {
    const s = festivalState(new Date(2026, 10, 4, 12));
    assert.equal(s.next.key, "yule");
    assert.equal(s.daysToNext, 47);
});

test("todos los días de 2026 a 2030 tienen fecha celta válida", () => {
    for (let d = new Date(2026, 0, 1); d < new Date(2031, 0, 1); d.setDate(d.getDate() + 1)) {
        const c = celticDate(d);
        assert.ok(c.day >= 1 && c.day <= c.length && (c.length === 29 || c.length === 30), `${ymd(d)} ${c.month} ${c.day}/${c.length}`);
    }
});
