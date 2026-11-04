/*
 * Calendario Pagano · núcleo común
 * Día del calendario celta de Coligny, rueda del año con las ocho fiestas y fase lunar.
 *
 * Este archivo no depende de ninguna plataforma: el script de build lo inserta
 * en cada widget (Cinnamon, GNOME, KDE Plasma, Tauri, Übersicht, web) junto con
 * un adaptador de dibujo. El dibujo usa una API tipo Cairo (`cr`) y un objeto `G`
 * con dos funciones, `G.text` y `G.moon`, que cada adaptador implementa.
 *
 * Autoría de contenidos: Andrea M. Miranda Duque y Fernando A. Muñoz Villarejo
 * - La Caetra, retrocultura (https://lacaetra.com/).
 * Código: GPL-3.0-or-later. Contenidos: CC BY-SA 4.0.
 */

// ===== Motor del calendario =====
const DAY = 24 * 60 * 60 * 1000;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_REFERENCE = Date.UTC(2000, 0, 6, 18, 14); // luna nueva de referencia

const MONTHS = [
    ["Samonios", 30], ["Dumannios", 29], ["Riuros", 30], ["Anagantios", 29],
    ["Ogronios", 30], ["Cutios", 29], ["Giamonios", 30], ["Simiuisonna", 29],
    ["Equos", 30], ["Elembiuos", 29], ["Edrinios", 30], ["Cantlos", 29],
];
const INTERCALARY = "Mid Samonios";

// Orden de la rueda, empezando arriba por Samhain y en sentido horario.
const FESTIVALS = [
    {key: "samhain",   name: "Samhain",   detail: "Año nuevo · III Fiesta de la Cosecha"},
    {key: "yule", solar: true,      name: "Yule",      detail: "Solsticio de invierno"},
    {key: "imbolc",    name: "Imbolc",    detail: "Fiesta de Brigit"},
    {key: "ostara", solar: true,    name: "Ostara",    detail: "Equinoccio de primavera"},
    {key: "beltane",   name: "Beltane",   detail: "Inicio del verano"},
    {key: "litha", solar: true,     name: "Litha",     detail: "Solsticio de verano"},
    {key: "lughnasad", name: "Lughnasad", detail: "I Fiesta de la Cosecha"},
    {key: "mabon", solar: true,     name: "Mabon",     detail: "Equinoccio de otoño · II Fiesta de la Cosecha"},
];

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const GREG_MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function midnight(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

function daysBetween(a, b) {
    return Math.round((midnight(b) - midnight(a)) / DAY);
}

// Fases de la Luna 2026, Observatorio Astronómico Nacional (IGN), en UTC.
// Fuente: https://www.ign.es/resources/astronomia/luna/FASES_LUNA_2026.JPG
const IGN_PHASES = [
    [Date.UTC(2026, 0, 3, 10, 3), 0.5],
    [Date.UTC(2026, 0, 10, 15, 48), 0.75],
    [Date.UTC(2026, 0, 18, 19, 52), 0],
    [Date.UTC(2026, 0, 26, 4, 47), 0.25],
    [Date.UTC(2026, 1, 1, 22, 9), 0.5],
    [Date.UTC(2026, 1, 9, 12, 43), 0.75],
    [Date.UTC(2026, 1, 17, 12, 1), 0],
    [Date.UTC(2026, 1, 24, 12, 28), 0.25],
    [Date.UTC(2026, 2, 3, 11, 38), 0.5],
    [Date.UTC(2026, 2, 11, 9, 39), 0.75],
    [Date.UTC(2026, 2, 19, 1, 24), 0],
    [Date.UTC(2026, 2, 25, 19, 18), 0.25],
    [Date.UTC(2026, 3, 2, 2, 12), 0.5],
    [Date.UTC(2026, 3, 10, 4, 52), 0.75],
    [Date.UTC(2026, 3, 17, 11, 52), 0],
    [Date.UTC(2026, 3, 24, 2, 32), 0.25],
    [Date.UTC(2026, 4, 1, 17, 23), 0.5],
    [Date.UTC(2026, 4, 9, 21, 10), 0.75],
    [Date.UTC(2026, 4, 16, 20, 1), 0],
    [Date.UTC(2026, 4, 23, 11, 11), 0.25],
    [Date.UTC(2026, 4, 31, 8, 45), 0.5],
    [Date.UTC(2026, 5, 8, 10, 1), 0.75],
    [Date.UTC(2026, 5, 15, 2, 54), 0],
    [Date.UTC(2026, 5, 21, 21, 56), 0.25],
    [Date.UTC(2026, 5, 29, 23, 57), 0.5],
    [Date.UTC(2026, 6, 7, 19, 29), 0.75],
    [Date.UTC(2026, 6, 14, 9, 44), 0],
    [Date.UTC(2026, 6, 21, 11, 6), 0.25],
    [Date.UTC(2026, 6, 29, 14, 36), 0.5],
    [Date.UTC(2026, 7, 6, 2, 21), 0.75],
    [Date.UTC(2026, 7, 12, 17, 37), 0],
    [Date.UTC(2026, 7, 20, 2, 46), 0.25],
    [Date.UTC(2026, 7, 28, 4, 19), 0.5],
    [Date.UTC(2026, 8, 4, 7, 51), 0.75],
    [Date.UTC(2026, 8, 11, 3, 27), 0],
    [Date.UTC(2026, 8, 18, 20, 44), 0.25],
    [Date.UTC(2026, 8, 26, 16, 49), 0.5],
    [Date.UTC(2026, 9, 3, 13, 25), 0.75],
    [Date.UTC(2026, 9, 10, 15, 50), 0],
    [Date.UTC(2026, 9, 18, 16, 13), 0.25],
    [Date.UTC(2026, 9, 26, 4, 12), 0.5],
    [Date.UTC(2026, 10, 1, 20, 28), 0.75],
    [Date.UTC(2026, 10, 9, 7, 2), 0],
    [Date.UTC(2026, 10, 17, 11, 48), 0.25],
    [Date.UTC(2026, 10, 24, 14, 54), 0.5],
    [Date.UTC(2026, 11, 1, 6, 9), 0.75],
    [Date.UTC(2026, 11, 9, 0, 52), 0],
    [Date.UTC(2026, 11, 17, 5, 43), 0.25],
    [Date.UTC(2026, 11, 24, 1, 28), 0.5],
    [Date.UTC(2026, 11, 30, 19, 0), 0.75],
];

// Fase como fracción del ciclo: 0 nueva, 0.5 llena. Dentro del periodo de la
// tabla del IGN se interpola entre sus fases; fuera, cálculo aproximado.
function moonPhase(date) {
    const t = date.getTime();
    const last = IGN_PHASES.length - 1;
    if (t >= IGN_PHASES[0][0] && t < IGN_PHASES[last][0]) {
        let i = 0;
        while (IGN_PHASES[i + 1][0] <= t) i++;
        const [t0, p0] = IGN_PHASES[i], [t1] = IGN_PHASES[i + 1];
        return (p0 + 0.25 * (t - t0) / (t1 - t0)) % 1;
    }
    const age = ((t - NEW_MOON_REFERENCE) / DAY) % SYNODIC_MONTH;
    return ((age + SYNODIC_MONTH) % SYNODIC_MONTH) / SYNODIC_MONTH;
}

function moonPhaseName(phase) {
    if (phase < 0.03 || phase >= 0.97) return "Luna nueva";
    if (phase < 0.22) return "Luna creciente";
    if (phase < 0.28) return "Cuarto creciente";
    if (phase < 0.47) return "Gibosa creciente";
    if (phase < 0.53) return "Luna llena";
    if (phase < 0.72) return "Gibosa menguante";
    if (phase < 0.78) return "Cuarto menguante";
    return "Luna menguante";
}

// Primera luna llena estrictamente posterior a un instante (aprox. ±0,5 días).
function nextFullMoon(after) {
    const ign = IGN_PHASES.find(([t, p]) => p === 0.5 && t > after.getTime());
    if (ign && after.getTime() >= IGN_PHASES[0][0] - 30 * DAY) return new Date(ign[0]);
    const n = Math.floor((after.getTime() - NEW_MOON_REFERENCE) / DAY / SYNODIC_MONTH - 0.5) + 1;
    let t = NEW_MOON_REFERENCE + (n + 0.5) * SYNODIC_MONTH * DAY;
    if (t <= after.getTime()) t += SYNODIC_MONTH * DAY;
    return new Date(t);
}

// Equinoccios y solsticios (Meeus, valores medios, error de minutos).
function season(year, which) {
    const Y = (year - 2000) / 1000;
    const terms = [
        [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057], // marzo
        [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030],  // junio
        [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078],  // septiembre
        [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032], // diciembre
    ][which];
    const jde = terms[0] + terms[1] * Y + terms[2] * Y * Y + terms[3] * Y ** 3 + terms[4] * Y ** 4;
    return new Date((jde - 2440587.5) * DAY);
}

// Fiestas de un "año de la rueda": desde el equinoccio de otoño de `year`
// hasta el de `year + 1`. Las del fuego caen en la segunda luna llena tras
// el solsticio o equinoccio anterior, como indica la guía.
function wheelYear(year) {
    const mabon = season(year, 2);
    const yule = season(year, 3);
    const ostara = season(year + 1, 0);
    const litha = season(year + 1, 1);
    const second = start => nextFullMoon(new Date(nextFullMoon(start).getTime() + DAY));
    const dates = {
        samhain: second(mabon), yule, imbolc: second(yule), ostara,
        beltane: second(ostara), litha, lughnasad: second(litha), mabonNext: season(year + 1, 2),
    };
    const list = FESTIVALS.slice(0, 7).map(f => Object.assign({}, f, {date: midnight(dates[f.key])}));
    list.push(Object.assign({}, FESTIVALS[7], {date: midnight(dates.mabonNext)}));
    return list;
}

// Todas las fiestas ordenadas en torno a una fecha, con su índice en la rueda.
function festivalsAround(date) {
    const y = date.getFullYear();
    let all = [];
    for (const year of [y - 2, y - 1, y])
        all = all.concat(wheelYear(year).map((f, i) => Object.assign(f, {index: i})));
    all.sort((a, b) => a.date - b.date);
    return all;
}

function festivalState(date) {
    const today = midnight(date);
    const all = festivalsAround(date);
    let i = all.findIndex(f => f.date > today);
    const next = all[i], previous = all[i - 1];
    const todayFestival = previous && previous.date.getTime() === today.getTime() ? previous : null;
    const span = daysBetween(previous.date, next.date);
    const fraction = span > 0 ? daysBetween(previous.date, today) / span : 0;
    return {previous, next, today: todayFestival, all,
        wheelPosition: (previous.index + fraction) % 8,       // 0..8, 0 = Samhain arriba
        daysToNext: daysBetween(today, next.date)};
}

// Día del calendario de Coligny. El año empieza con Samhain y cada mes empieza
// con su luna llena (Guía de festividades, p. 23): los meses duran 29 o 30 días
// según la luna real. Si el año tiene 13 lunas, la 13.ª es Mid Samonios.
function celticDate(date) {
    const today = midnight(date);
    const samhains = festivalsAround(date).concat(wheelYear(date.getFullYear() + 1))
        .filter(f => f.key === "samhain").sort((a, b) => a.date - b.date);
    const startIndex = samhains.findIndex(f => f.date > today) - 1;
    const start = samhains[startIndex].date, end = samhains[startIndex + 1].date;
    // inicios de mes: Samhain y las lunas llenas siguientes hasta el próximo Samhain
    const starts = [start];
    let fm = nextFullMoon(new Date(start.getTime() + DAY));
    while (midnight(fm) < end) {
        starts.push(midnight(fm));
        fm = nextFullMoon(new Date(fm.getTime() + DAY));
    }
    starts.push(end);
    let i = 0;
    while (starts[i + 1] <= today) i++;
    const name = i < MONTHS.length ? MONTHS[i][0] : INTERCALARY;
    const length = daysBetween(starts[i], starts[i + 1]);
    return {month: name, day: daysBetween(starts[i], today) + 1, length, monthStart: starts[i],
        intercalary: name === INTERCALARY, matos: length === 30};
}

function countdownText(days) {
    if (days === 0) return "es hoy";
    if (days === 1) return "falta 1 día";
    return `faltan ${days} días`;
}

function gregorianShort(date) {
    return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} · ${WEEKDAYS[date.getDay()]}`;
}

function gregorianLong(date) {
    return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${GREG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// ===== Dibujo de la rueda del año (API tipo Cairo + adaptador G) =====
const C_BRG = [0x00 / 255, 0x42 / 255, 0x25 / 255];
const C_BRG_DARK = [0x00 / 255, 0x2e / 255, 0x1c / 255];
const C_CREAM = [0xf5 / 255, 0xf0 / 255, 0xe8 / 255];
const C_GOLD = [0xc9 / 255, 0xa8 / 255, 0x4c / 255];

function src(cr, c, a) {
    cr.setSourceRGBA(c[0], c[1], c[2], a === undefined ? 1 : a);
}

function wheelAngle(position) {
    return position / 8 * 2 * Math.PI;   // 0 arriba, sentido horario
}

function polar(c, r, a) {
    return [c + r * Math.sin(a), c - r * Math.cos(a)];
}

// Datos que necesita la rueda.
function viewData(now) {
    const phase = moonPhase(now);
    return {now, celtic: celticDate(now), fest: festivalState(now), phase, phaseName: moonPhaseName(phase)};
}

function festivalLine(fest) {
    if (fest.today) return `${fest.today.name} · es hoy`;
    return `${fest.next.name} · ${countdownText(fest.daysToNext)}`;
}

function drawWheel(cr, G, S, v, opts) {
    const c = S / 2, R = S / 2 - 6, ring = R - 30;
    // anillo de las fiestas (el interior queda transparente)
    // mitad oscura (Samhain → Beltane, lado derecho) y mitad luminosa (Beltane → Samhain)
    const half = (a0, a1, col, al) => {
        cr.newPath(); cr.arc(c, c, R, a0 - Math.PI / 2, a1 - Math.PI / 2);
        cr.arcNegative(c, c, ring, a1 - Math.PI / 2, a0 - Math.PI / 2); cr.closePath();
        src(cr, col, al); cr.fill();
    };
    half(0, Math.PI, [0.0, 0.13, 0.08], 0.95);
    half(Math.PI, 2 * Math.PI, [0.18, 0.40, 0.22], 0.9);
    // separación en Samhain y Beltane
    for (const a of [0, Math.PI]) {
        const [x0, y0] = polar(c, ring, a), [x1, y1] = polar(c, R, a);
        cr.newPath(); cr.moveTo(x0, y0); cr.lineTo(x1, y1); src(cr, C_GOLD, 0.7); cr.setLineWidth(1); cr.stroke();
    }
    cr.newPath(); cr.arc(c, c, R, 0, 2 * Math.PI);
    src(cr, C_GOLD, 0.95); cr.setLineWidth(2); cr.stroke();
    cr.newPath(); cr.arc(c, c, ring, 0, 2 * Math.PI);
    src(cr, C_GOLD, 0.5); cr.setLineWidth(1); cr.stroke();

    // tramo recorrido desde la última fiesta
    const aNow = wheelAngle(v.fest.wheelPosition);
    const aPrev = wheelAngle(v.fest.previous.index);
    cr.newPath(); cr.arc(c, c, ring, aPrev - Math.PI / 2, aNow - Math.PI / 2 + (aNow < aPrev ? 2 * Math.PI : 0));
    src(cr, C_GOLD, 0.85); cr.setLineWidth(4); cr.stroke();

    // aguja de hoy
    const [p1x, p1y] = polar(c, ring - 26, aNow);
    const [p2x, p2y] = polar(c, ring, aNow);
    cr.newPath(); cr.moveTo(p1x, p1y); cr.lineTo(p2x, p2y);
    src(cr, C_GOLD, 0.8); cr.setLineWidth(2); cr.stroke();
    // cabeza de la aguja: anillo hueco, para que se vea el punto de la fiesta que haya debajo
    cr.newPath(); cr.arc(p2x, p2y, 8, 0, 2 * Math.PI);
    src(cr, C_BRG_DARK, 1); cr.setLineWidth(4); cr.stroke();
    cr.newPath(); cr.arc(p2x, p2y, 8, 0, 2 * Math.PI);
    src(cr, C_GOLD, 1); cr.setLineWidth(2); cr.stroke();

    // fiestas: marca y nombre
    const nextKey = (v.fest.today || v.fest.next).key;
    FESTIVALS.forEach((f, i) => {
        const a = wheelAngle(i);
        const [tx, ty] = polar(c, ring, a);
        const isNext = f.key === nextKey;
        // solares en dorado, lunares en crema; la próxima, más grande
        cr.newPath(); cr.arc(tx, ty, isNext ? 5 : 3.5, 0, 2 * Math.PI);
        src(cr, f.solar ? C_GOLD : C_CREAM, 1); cr.fillPreserve();
        src(cr, C_BRG_DARK, 1); cr.setLineWidth(1); cr.stroke();
        const [lx, ly] = polar(c, ring + 15, a);
        let rot = a;
        if (a > Math.PI / 2 + 0.01 && a < 3 * Math.PI / 2 - 0.01) rot += Math.PI;
        G.text(cr, f.name.toUpperCase(), {x: lx, y: ly, size: 11, serif: true, bold: isNext, rot,
            color: isNext ? C_GOLD : C_CREAM, alpha: isNext ? 1 : 0.85, spacing: 1.5});
    });

    // centro
    G.text(cr, gregorianLong(v.now), {x: c, y: c - 70, size: 13, color: C_CREAM, alpha: 0.9, shadow: true});
    G.moon(cr, c, c - 30, 50, v.phase);
    G.text(cr, `${v.celtic.month} · ${v.celtic.day}`, {x: c, y: c + 16, size: 22, serif: true, bold: true, color: C_CREAM, shadow: true});
    G.text(cr, festivalLine(v.fest), {x: c, y: c + 42, size: 12, bold: true, color: C_GOLD, shadow: true});
    if (opts.showPhaseName)
        G.text(cr, v.phaseName, {x: c, y: c + 60, size: 10, color: C_CREAM, alpha: 0.9, shadow: true});
}

// Tamaño de diseño de la rueda, en píxeles. Los widgets escalan a partir de aquí.
const WHEEL_SIZE = 360;
const VERSION = "@@VERSION@@";
