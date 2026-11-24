"use strict";
const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("en-PH", {minimumFractionDigits: 2, maximumFractionDigits: 2});
const show = (el, html, isError = false) => { el.innerHTML = html; el.classList.toggle("error", isError); };

/* Navigation */
const sections = ["home", "conversion", "tax", "looping", "payroll"];
const route = () => {
  const id = sections.includes(location.hash.slice(1)) ? location.hash.slice(1) : "home";
  sections.forEach(s => $(s).classList.toggle("active", s === id));
  document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("active", a.dataset.s === id));
  window.scrollTo(0, 0);
};
window.addEventListener("hashchange", route);
route();

/* 1. Conversion */
const num = id => { const v = $(id).value; return v.trim() === "" ? NaN : Number(v); };
const round = n => Math.round(n * 10000) / 10000;

$("tempBtn").addEventListener("click", () => {
  const v = num("tempIn");
  if (Number.isNaN(v)) return show($("tempOut"), "Enter a number to convert.", true);
  const out = $("tempMode").value === "c2f"
    ? `${v} °C = ${round(v * 9 / 5 + 32)} °F`
    : `${v} °F = ${round((v - 32) * 5 / 9)} °C`;
  show($("tempOut"), out);
});

$("lenBtn").addEventListener("click", () => {
  const v = num("lenIn");
  if (Number.isNaN(v)) return show($("lenOut"), "Enter a number to convert.", true);
  const out = $("lenMode").value === "m2ft"
    ? `${v} m = ${round(v * 3.28084)} ft`
    : `${v} ft = ${round(v / 3.28084)} m`;
  show($("lenOut"), out);
});

/* 2. Income tax */
const computeTax = income => {
  if (income <= 250000) return 0;
  if (income <= 400000) return 0.20 * (income - 250000);
  if (income <= 800000) return 30000 + 0.25 * (income - 400000);
  if (income <= 2000000) return 130000 + 0.30 * (income - 800000);
  if (income <= 8000000) return 490000 + 0.32 * (income - 2000000);
  return 2410000 + 0.35 * (income - 8000000);
};

$("taxBtn").addEventListener("click", () => {
  const income = num("taxIn");
  if (Number.isNaN(income) || income < 0) return show($("taxOut"), "Enter a valid taxable income (0 or more).", true);
  show($("taxOut"), `Taxable income: ₱${money(income)}<br><strong>Income tax: ₱${money(computeTax(income))}</strong>`);
});

/* 3. Looping */
const getN = out => {
  const n = num("nIn");
  if (!Number.isInteger(n) || n < 1) { show($(out), "Enter n as a whole number of 1 or more.", true); return null; }
  return n;
};

$("facBtn").addEventListener("click", () => {
  const n = getN("facOut");
  if (n === null) return;
  if (n > 170) return show($("facOut"), "n is too large; the result goes beyond what JavaScript can hold. Use 170 or less.", true);
  let result = 1, i = n;
  while (i > 1) { result *= i; i--; }
  show($("facOut"), `${n}! = <strong>${result.toLocaleString("en-US")}</strong>`);
});

$("sumBtn").addEventListener("click", () => {
  const n = getN("sumOut");
  if (n === null) return;
  let sum = 0, i = 1;
  do { sum += i; i++; } while (i <= n);
  show($("sumOut"), `1 + 2 + … + ${n} = <strong>${sum.toLocaleString("en-US")}</strong>`);
});

$("avgBtn").addEventListener("click", () => {
  const n = getN("avgOut");
  if (n === null) return;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  show($("avgOut"), `Average of 1 to ${n} = <strong>${round(sum / n)}</strong>`);
});

/* 4. Payroll */
const employees = [];
const esc = s => s.replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

const renderPayroll = () => {
  $("payBody").innerHTML = employees.length === 0
    ? `<tr><td colspan="7" class="muted">No employees yet.</td></tr>`
    : employees.map((e, i) => {
        const gross = e.days * e.rate;
        return `<tr><td>${i + 1}</td><td>${esc(e.name)}</td><td class="num">${e.days}</td><td class="num">${money(e.rate)}</td><td class="num">${money(gross)}</td><td class="num">${money(e.ded)}</td><td class="num">${money(gross - e.ded)}</td></tr>`;
      }).join("");
};

$("addBtn").addEventListener("click", () => {
  const name = $("pName").value.trim();
  const days = num("pDays"), rate = num("pRate"), ded = num("pDed");
  if (!name || [days, rate, ded].some(v => Number.isNaN(v) || v < 0))
    return show($("payMsg"), "Fill in all four fields. Numbers must be 0 or more.", true);
  employees.push({name, days, rate, ded});
  renderPayroll();
  ["pName", "pDays", "pRate", "pDed"].forEach(id => $(id).value = "");
  $("pName").focus();
  show($("payMsg"), `Added ${esc(name)} as line ${employees.length}.`);
});

$("delBtn").addEventListener("click", () => {
  const no = num("delNo");
  if (!Number.isInteger(no) || no < 1 || no > employees.length)
    return show($("payMsg"), employees.length ? `Enter a line number from 1 to ${employees.length}.` : "The list is empty.", true);
  const [removed] = employees.splice(no - 1, 1);
  renderPayroll();
  $("delNo").value = "";
  show($("payMsg"), `Deleted line ${no} (${esc(removed.name)}). Lines were renumbered.`);
});
