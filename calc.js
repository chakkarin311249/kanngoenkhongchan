// การเงินของฉัน — pure calculation functions (no DOM), shared by the pages and testable with Node.
(function (root) {
  const BRACKETS = [
    [150000, 0], [300000, 0.05], [500000, 0.10], [750000, 0.15],
    [1000000, 0.20], [2000000, 0.25], [5000000, 0.30], [Infinity, 0.35]
  ];
  const n = v => Math.max(0, Number(v) || 0);

  // Thai personal income tax for salaried income (40(1)/(2)).
  function computeTax(o) {
    const income = n(o.salary) * 12 + n(o.bonus) + n(o.otherIncome);
    const expense = Math.min(income * 0.5, 100000);
    const d = {};
    d.personal = 60000;
    d.spouse = o.spouse ? 60000 : 0;
    const kids = Math.floor(n(o.kids));
    const kids2 = Math.min(Math.floor(n(o.kids2)), Math.max(0, kids - 1));
    d.kids = kids * 30000 + kids2 * 30000;
    d.parents = Math.min(Math.floor(n(o.parents)), 4) * 30000;
    d.sso = Math.min(n(o.sso), 10500);
    const health = Math.min(n(o.health), 25000);
    d.insurance = Math.min(n(o.life) + health, 100000);
    d.parentHealth = Math.min(n(o.parentHealth), 15000);
    d.home = Math.min(n(o.homeInterest), 100000);
    const pvd = Math.min(n(o.pvd), income * 0.15);
    const rmf = Math.min(n(o.rmf), income * 0.30);
    const ssf = Math.min(n(o.ssf), income * 0.30, 200000);
    d.retirement = Math.min(pvd + rmf + ssf, 500000);
    d.esg = Math.min(n(o.esg), income * 0.30, 300000);
    d.other = n(o.other);
    const totalDeduct = Object.values(d).reduce((a, b) => a + b, 0);
    const beforeDonation = Math.max(0, income - expense - totalDeduct);
    const donation = Math.min(n(o.donation), beforeDonation * 0.10);
    const net = Math.max(0, beforeDonation - donation);

    let prev = 0, tax = 0, marginal = 0;
    const rows = BRACKETS.map(([cap, rate]) => {
      const part = Math.max(0, Math.min(net, cap) - prev);
      const t = part * rate;
      if (part > 0) marginal = rate;
      tax += t;
      const row = { from: prev, to: cap, rate, part, tax: t };
      prev = cap;
      return row;
    });
    return {
      income, expense, deductions: d, totalDeduct, donation, net,
      tax: Math.round(tax * 100) / 100, rows, marginal,
      effective: income ? tax / income : 0, monthly: tax / 12
    };
  }

  // Thai hire-purchase car loan (flat rate), VAT 7% on the installment when vat=true.
  function computeCar(o) {
    const price = n(o.price);
    const down = price * Math.min(n(o.downPct), 100) / 100;
    const finance = price - down;
    const months = Math.max(1, Math.floor(n(o.months)));
    const interest = finance * n(o.rate) / 100 * (months / 12);
    const base = (finance + interest) / months;
    const monthly = o.vat ? base * 1.07 : base;
    return { price, down, finance, months, interest, monthly, total: monthly * months + down };
  }

  const ZODIAC = ["ชวด (หนู)", "ฉลู (วัว)", "ขาล (เสือ)", "เถาะ (กระต่าย)", "มะโรง (งูใหญ่)", "มะเส็ง (งูเล็ก)",
    "มะเมีย (ม้า)", "มะแม (แพะ)", "วอก (ลิง)", "ระกา (ไก่)", "จอ (หมา)", "กุน (หมู)"];
  const DAYS = [["อาทิตย์", "แดง"], ["จันทร์", "เหลือง"], ["อังคาร", "ชมพู"], ["พุธ", "เขียว"],
    ["พฤหัสบดี", "ส้ม"], ["ศุกร์", "ฟ้า"], ["เสาร์", "ม่วง"]];

  // Age in years/months/days between two dates (local, date-only).
  function computeAge(birth, today) {
    let y = today.getFullYear() - birth.getFullYear();
    let m = today.getMonth() - birth.getMonth();
    let d = today.getDate() - birth.getDate();
    if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < today) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const toNext = Math.round((next - today) / 86400000);
    const totalDays = Math.round((today - birth) / 86400000);
    const ce = birth.getFullYear();
    return {
      years: y, months: m, days: d, toNext, totalDays,
      zodiac: ZODIAC[((ce - 4) % 12 + 12) % 12],
      weekday: DAYS[birth.getDay()][0], color: DAYS[birth.getDay()][1], be: ce + 543
    };
  }

  // Monthly take-home pay: salary minus social security (5%, wage ceiling 17,500 from 2569), PVD and estimated withholding tax.
  const SSO_CEIL = 17500, SSO_RATE = 0.05;
  function computeSalary(o) {
    const salary = n(o.salary);
    const sso = Math.min(salary, SSO_CEIL) * SSO_RATE;
    const pvd = salary * Math.min(n(o.pvdPct), 15) / 100;
    const t = computeTax({ ...o, salary, sso: sso * 12, pvd: pvd * 12 });
    const wht = t.tax / 12;
    return { salary, sso, pvd, wht, net: salary - sso - pvd - wht, annualTax: t.tax, marginal: t.marginal };
  }

  // Standard amortizing home loan, optional extra payment each month.
  function computeHome(o) {
    const price = n(o.price);
    const loan = price - price * Math.min(n(o.downPct), 100) / 100;
    const N = Math.max(1, Math.round(n(o.years) * 12));
    const r = n(o.rate) / 100 / 12;
    const pay = r ? loan * r / (1 - Math.pow(1 + r, -N)) : loan / N;
    const totalInterest = pay * N - loan;
    const extra = n(o.extra);
    let bal = loan, m = 0, interestExtra = 0;
    if (extra > 0) {
      while (bal > 0.005 && m < N) { const i = bal * r; interestExtra += i; bal = bal + i - (pay + extra); m++; }
    }
    const firstInterest = loan * r;
    return { loan, months: N, pay, totalInterest, total: pay * N, firstInterest, firstPrincipal: pay - firstInterest,
      extraMonths: extra > 0 ? m : N, extraInterest: extra > 0 ? interestExtra + Math.min(0, bal) : totalInterest };
  }

  // Savings with monthly deposits and monthly compounding; optional 15% withholding on interest.
  function computeSavings(o) {
    const r = n(o.rate) / 100 / 12, dep = n(o.monthly), taxRate = o.tax ? 0.15 : 0;
    let bal = n(o.initial), deposited = bal, interest = 0;
    const years = Math.max(1, Math.round(n(o.years)));
    const rows = [];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        bal += dep; deposited += dep;
        const i = bal * r * (1 - taxRate);
        bal += i; interest += i;
      }
      rows.push({ year: y, deposited, interest, balance: bal });
    }
    return { balance: bal, deposited, interest, rows };
  }

  // VAT 7% (add or extract) and withholding tax on the pre-VAT amount.
  function computeVat(o) {
    const amt = n(o.amount), whtPct = n(o.whtPct);
    const base = o.mode === "extract" ? amt / 1.07 : amt;
    const vat = base * 0.07, total = base + vat, wht = base * whtPct / 100;
    return { base, vat, total, wht, pay: total - wht };
  }

  // Inflation: what an amount costs in the future, and what it is worth in today's money.
  function computeInflation(o) {
    const amt = n(o.amount), r = n(o.rate) / 100, y = Math.max(0, n(o.years));
    const f = Math.pow(1 + r, y);
    return { future: amt * f, worth: amt / f, lost: 1 - 1 / f };
  }

  // Retirement: money needed at retirement and monthly saving to get there.
  function computeRetire(o) {
    const age = n(o.age), ret = n(o.retireAge), life = n(o.lifeAge);
    const Y = Math.max(0, ret - age), N = Math.max(1, life - ret);
    const inf = n(o.inflation) / 100, rb = n(o.returnBefore) / 100, ra = n(o.returnAfter) / 100;
    const yearlyAtRetire = n(o.expense) * 12 * Math.pow(1 + inf, Y);
    const rr = (1 + ra) / (1 + inf) - 1;
    const need = Math.abs(rr) < 1e-9 ? yearlyAtRetire * N : yearlyAtRetire * (1 - Math.pow(1 + rr, -N)) / rr;
    const have = n(o.saved) * Math.pow(1 + rb, Y);
    const gap = Math.max(0, need - have);
    const rm = rb / 12, m = Y * 12;
    const monthly = gap === 0 ? 0 : m === 0 ? gap : (rm ? gap * rm / (Math.pow(1 + rm, m) - 1) : gap / m);
    return { years: Y, retireYears: N, monthlyExpenseAtRetire: yearlyAtRetire / 12, need, have, gap, monthly };
  }

  // Credit card payoff: minimum payments vs a fixed monthly payment.
  function payoff(balance, apr, payFn) {
    let bal = n(balance), m = 0, interest = 0;
    const r = n(apr) / 100 / 12;
    while (bal > 0.005 && m < 1200) {
      const i = bal * r; interest += i; bal += i;
      const p = Math.min(bal, payFn(bal));
      if (p <= i - 1e-9 && m > 0) return { months: Infinity, interest: Infinity };
      bal -= p; m++;
    }
    return { months: m >= 1200 ? Infinity : m, interest };
  }
  function computeCard(o) {
    const pct = n(o.minPct) / 100, floor = n(o.minBaht);
    const min = payoff(o.balance, o.apr, b => Math.max(b * pct, floor));
    const fixed = n(o.fixed) > 0 ? payoff(o.balance, o.apr, () => n(o.fixed)) : null;
    return { firstMin: Math.min(n(o.balance) * (1 + n(o.apr) / 1200), Math.max(n(o.balance) * (1 + n(o.apr) / 1200) * pct, floor)), min, fixed };
  }

  const api = { computeTax, computeCar, computeAge, computeSalary, computeHome, computeSavings, computeVat,
    computeInflation, computeRetire, computeCard, BRACKETS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Calc = api;
})(this);

// Sticky bottom bar that mirrors the main result while the result box is off screen.
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    const box = document.querySelector(".result");
    const big = box && box.querySelector(".big");
    if (!big) return;
    const label = (box.querySelector(".note") || {}).textContent || "ผลลัพธ์";
    const bar = document.createElement("div");
    bar.className = "sumbar";
    bar.innerHTML = "<span></span><b></b>";
    bar.firstChild.textContent = label;
    document.body.appendChild(bar);
    document.body.classList.add("has-sumbar");
    const sync = () => { bar.lastChild.textContent = big.textContent; };
    new MutationObserver(sync).observe(big, { childList: true, characterData: true, subtree: true });
    sync();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => bar.classList.toggle("hide", es[0].isIntersecting)).observe(big);
    }
  });
}

// Number formatting helper for the pages.
function baht(v, digits) {
  return Number(v).toLocaleString("th-TH", { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 });
}
