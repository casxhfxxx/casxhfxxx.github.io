/* CalcBox — tout tourne dans le navigateur, aucun fetch() vers un serveur externe. */

function setReadout(elId, text, state) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove("empty", "alert");
  if (state === "empty") el.classList.add("empty");
  if (state === "alert") el.classList.add("alert");
}

function round(n, d) {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
}

/* ---------- Widget signature : calcul rapide en direct (hero) ---------- */

function quickCalcEvaluate(raw) {
  const input = raw.trim();
  if (!input) return { text: "En attente de saisie…", idle: true };

  // Motif "X% de Y" / "X% of Y"
  let m = input.match(/^([\d.,]+)\s*%\s*(?:de|of)\s*([\d.,]+)$/i);
  if (m) {
    const pct = parseFloat(m[1].replace(",", "."));
    const total = parseFloat(m[2].replace(",", "."));
    return { text: `${round((pct / 100) * total, 4)}`, idle: false };
  }

  // Motif "X% de réduction sur Y"
  m = input.match(/^([\d.,]+)\s*%\s*(?:off|de réduction sur|de moins que)\s*([\d.,]+)$/i);
  if (m) {
    const pct = parseFloat(m[1].replace(",", "."));
    const total = parseFloat(m[2].replace(",", "."));
    return { text: `${round(total - (pct / 100) * total, 4)}`, idle: false };
  }

  // Sinon : expression arithmétique simple (chiffres, + - * / ( ) . , %  uniquement)
  if (!/^[\d\s+\-*/().,%]+$/.test(input)) {
    return { text: "Expression non reconnue", idle: false, alert: true };
  }
  const sanitized = input.replace(/,/g, ".").replace(/(\d)%/g, "($1/100)");
  try {
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${sanitized});`)();
    if (typeof value !== "number" || !isFinite(value)) {
      return { text: "Expression non reconnue", idle: false, alert: true };
    }
    return { text: `${round(value, 6)}`, idle: false };
  } catch {
    return { text: "Expression non reconnue", idle: false, alert: true };
  }
}

function initQuickCalc() {
  const input = document.getElementById("qc-input");
  const out = document.getElementById("qc-readout");
  if (!input || !out) return;

  const render = () => {
    const { text, idle, alert } = quickCalcEvaluate(input.value);
    out.textContent = text;
    out.classList.toggle("idle", !!idle);
    out.style.color = alert ? "var(--red)" : "";
    out.style.textShadow = alert ? "0 0 16px rgba(255,107,87,0.3)" : "";
  };

  input.addEventListener("input", render);
  render();
}

/* ---------- 01 Unités ---------- */

const UNIT_GROUPS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125, t: 1000 },
  volume: { l: 1, ml: 0.001, gal: 3.785411784, qt: 0.946352946, cup: 0.2365882365 },
};

function populateUnitSelects() {
  const type = document.getElementById("unit-type").value;
  const fromEl = document.getElementById("unit-from");
  const toEl = document.getElementById("unit-to");
  fromEl.innerHTML = "";
  toEl.innerHTML = "";
  if (type === "temp") {
    ["C", "F", "K"].forEach((u) => {
      fromEl.add(new Option(u, u));
      toEl.add(new Option(u, u));
    });
    toEl.value = "F";
  } else {
    Object.keys(UNIT_GROUPS[type]).forEach((u) => {
      fromEl.add(new Option(u, u));
      toEl.add(new Option(u, u));
    });
    toEl.selectedIndex = 1;
  }
}

function tempToCelsius(v, u) {
  if (u === "C") return v;
  if (u === "F") return (v - 32) * (5 / 9);
  if (u === "K") return v - 273.15;
}
function celsiusTo(v, u) {
  if (u === "C") return v;
  if (u === "F") return v * (9 / 5) + 32;
  if (u === "K") return v + 273.15;
}

function unitConvert() {
  const type = document.getElementById("unit-type").value;
  const val = Number(document.getElementById("unit-value").value);
  const from = document.getElementById("unit-from").value;
  const to = document.getElementById("unit-to").value;
  if (Number.isNaN(val)) { setReadout("unit-out", "Entrez un nombre valide.", "alert"); return; }

  let result;
  if (type === "temp") {
    result = celsiusTo(tempToCelsius(val, from), to);
  } else {
    const table = UNIT_GROUPS[type];
    result = (val * table[from]) / table[to];
  }
  setReadout("unit-out", `${val} ${from} = ${round(result, 6)} ${to}`);
}

/* ---------- 02 IMC ---------- */

function bmiCompute() {
  const weight = Number(document.getElementById("bmi-weight").value);
  const heightCm = Number(document.getElementById("bmi-height").value);
  if (!weight || !heightCm) { setReadout("bmi-out", "Renseignez poids et taille.", "alert"); return; }
  const h = heightCm / 100;
  const bmi = weight / (h * h);
  let cat;
  if (bmi < 18.5) cat = "Insuffisance pondérale";
  else if (bmi < 25) cat = "Corpulence normale";
  else if (bmi < 30) cat = "Surpoids";
  else cat = "Obésité";
  setReadout("bmi-out", `IMC : ${round(bmi, 1)}\nCatégorie : ${cat}`);
}

/* ---------- 03 Pourcentage ---------- */

function pctOf() {
  const pct = Number(document.getElementById("pct-a").value);
  const total = Number(document.getElementById("pct-b").value);
  setReadout("pct-out-1", `${pct}% de ${total} = ${round((pct / 100) * total, 4)}`);
}
function pctVariation() {
  const a = Number(document.getElementById("pct-c").value);
  const b = Number(document.getElementById("pct-d").value);
  if (!a) { setReadout("pct-out-2", "La valeur de départ ne peut pas être 0.", "alert"); return; }
  const variation = ((b - a) / a) * 100;
  const sign = variation >= 0 ? "+" : "";
  setReadout("pct-out-2", `Variation de ${a} à ${b} : ${sign}${round(variation, 2)}%`);
}

/* ---------- 04 Prêt ---------- */

function loanCompute() {
  const principal = Number(document.getElementById("loan-amount").value);
  const annualRate = Number(document.getElementById("loan-rate").value);
  const years = Number(document.getElementById("loan-years").value);
  if (!principal || !years) { setReadout("loan-out", "Renseignez montant et durée.", "alert"); return; }
  const n = years * 12;
  const r = annualRate / 100 / 12;
  let monthly;
  if (r === 0) monthly = principal / n;
  else monthly = (principal * r) / (1 - Math.pow(1 + r, -n));
  const total = monthly * n;
  const interest = total - principal;
  setReadout("loan-out",
    `Mensualité : ${round(monthly, 2)}\nCoût total : ${round(total, 2)}\nIntérêts totaux : ${round(interest, 2)}`);
}

/* ---------- 05 Âge ---------- */

function ageCompute() {
  const raw = document.getElementById("age-birth").value;
  if (!raw) { setReadout("age-out", "Choisissez une date de naissance.", "alert"); return; }
  const birth = new Date(raw);
  const now = new Date();
  if (isNaN(birth.getTime()) || birth > now) { setReadout("age-out", "Date invalide.", "alert"); return; }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) { months += 12; years -= 1; }

  const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
  setReadout("age-out", `${years} ans, ${months} mois, ${days} jours\nSoit ${totalDays.toLocaleString("fr-FR")} jours au total.`);
}

/* ---------- 06 TVA ---------- */

function vatCompute() {
  const amount = Number(document.getElementById("vat-amount").value);
  const rate = Number(document.getElementById("vat-rate").value);
  const direction = document.getElementById("vat-direction").value;
  if (!amount) { setReadout("vat-out", "Entrez un montant.", "alert"); return; }

  if (direction === "ht-ttc") {
    const ttc = amount * (1 + rate / 100);
    setReadout("vat-out", `HT : ${round(amount, 2)}\nTVA (${rate}%) : ${round(ttc - amount, 2)}\nTTC : ${round(ttc, 2)}`);
  } else {
    const ht = amount / (1 + rate / 100);
    setReadout("vat-out", `TTC : ${round(amount, 2)}\nTVA (${rate}%) : ${round(amount - ht, 2)}\nHT : ${round(ht, 2)}`);
  }
}

/* ---------- 07 Pourboire / addition ---------- */

function tipCompute() {
  const bill = Number(document.getElementById("tip-bill").value);
  const pct = Number(document.getElementById("tip-pct").value);
  const people = Math.max(1, Number(document.getElementById("tip-people").value) || 1);
  if (!bill) { setReadout("tip-out", "Entrez le montant de l'addition.", "alert"); return; }
  const tip = bill * (pct / 100);
  const total = bill + tip;
  setReadout("tip-out",
    `Pourboire : ${round(tip, 2)}\nTotal avec pourboire : ${round(total, 2)}\nPar personne (${people}) : ${round(total / people, 2)}`);
}

/* ---------- 08 Différence entre deux dates ---------- */

function dateDiffCompute() {
  const startRaw = document.getElementById("diff-start").value;
  const endRaw = document.getElementById("diff-end").value;
  if (!startRaw || !endRaw) { setReadout("diff-out", "Choisissez les deux dates.", "alert"); return; }
  const start = new Date(startRaw);
  const end = new Date(endRaw);
  const diffMs = end - start;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(Math.abs(diffDays) / 7);
  setReadout("diff-out",
    `${diffDays} jours\nSoit environ ${weeks} semaines\n${(diffDays / 365.25).toFixed(2)} années`);
}

/* ---------- 09 Fuseaux horaires ---------- */

const TIMEZONES = [
  "UTC", "Europe/Paris", "Europe/London", "America/New_York", "America/Los_Angeles",
  "America/Sao_Paulo", "Africa/Casablanca", "Africa/Lagos", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

function populateTimezones() {
  const el = document.getElementById("tz-zone");
  TIMEZONES.forEach((tz) => el.add(new Option(tz, tz)));
  el.value = "Asia/Tokyo";
}

function tzCompute() {
  const raw = document.getElementById("tz-time").value;
  const base = raw ? new Date(raw) : new Date();
  if (isNaN(base.getTime())) { setReadout("tz-out", "Heure locale invalide.", "alert"); return; }

  const lines = TIMEZONES.map((tz) => {
    const formatted = new Intl.DateTimeFormat("fr-FR", {
      timeZone: tz, weekday: "short", year: "numeric", month: "2-digit",
      day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(base);
    return `${tz.padEnd(20, " ")} ${formatted}`;
  });
  setReadout("tz-out", lines.join("\n"));
}

function tzNow() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  document.getElementById("tz-time").value =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  tzCompute();
}

/* ---------- 10 Intérêts composés ---------- */

function compoundCompute() {
  const principal = Number(document.getElementById("cmp-principal").value);
  const monthly = Number(document.getElementById("cmp-monthly").value) || 0;
  const annualRate = Number(document.getElementById("cmp-rate").value);
  const years = Number(document.getElementById("cmp-years").value);
  if (!years) { setReadout("cmp-out", "Renseignez une durée.", "alert"); return; }

  const r = annualRate / 100 / 12;
  const n = years * 12;
  let balance = principal;
  for (let i = 0; i < n; i++) {
    balance = balance * (1 + r) + monthly;
  }
  const invested = principal + monthly * n;
  const gains = balance - invested;
  setReadout("cmp-out",
    `Capital final : ${round(balance, 2)}\nTotal versé : ${round(invested, 2)}\nIntérêts gagnés : ${round(gains, 2)}`);
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initQuickCalc();
  populateUnitSelects();
  populateTimezones();
});
