// การเงินของฉัน — tools sheet (opened from the bottom tab bar) and the settings & info panel (gear button).
(function () {
  var en = (function () { try { return (new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang")) === "en"; } catch (e) { return false; } })();
  var GROUPS = [
    { th: "ภาษีและเงินเดือน", en: "Tax & salary", items: ["tax.html", "salary.html", "vat.html", "deductions-2569.html"] },
    { th: "ผ่อนและหนี้", en: "Loans & debt", items: ["home.html", "car.html", "credit-card.html"] },
    { th: "ออมและลงทุน", en: "Saving & investing", items: ["savings.html", "invest.html", "retire.html", "inflation.html", "challenge.html"] },
    { th: "เครื่องมือและความรู้", en: "Tools & learning", items: ["currency.html", "age.html", "quiz.html"] }
  ];
  document.addEventListener("DOMContentLoaded", function () {
    var head = document.querySelector(".site-head .in"), nav = head && head.querySelector(".nav");
    if (!nav) return;
    var links = {};
    nav.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").replace(/^\//, "")] = a; });

    var panel = document.createElement("div");
    panel.className = "menu-panel"; panel.id = "menu-panel"; panel.hidden = true;
    var html = '<a class="menu-home" href="' + (location.pathname.indexOf("/404") > -1 ? "/" : "index.html") + '">' + (en ? "Home – all tools" : "หน้าแรก · เครื่องมือทั้งหมด") + "</a>";
    GROUPS.forEach(function (g) {
      html += '<div class="menu-group"><p>' + (en ? g.en : g.th) + "</p><div>";
      g.items.forEach(function (h) {
        var a = links[h]; if (!a) return;
        html += '<a href="' + a.getAttribute("href") + '"' + (a.getAttribute("aria-current") ? ' aria-current="page"' : "") + ">" + a.innerHTML + "</a>";
      });
      html += "</div></div>";
    });
    panel.innerHTML = '<div class="sheet-h"><b>' + (en ? "All tools" : "เครื่องมือทั้งหมด") + '</b><button type="button" class="x" data-close aria-label="' + (en ? "Close" : "ปิด") + '">✕</button></div>' + html;
    panel.className = "menu-panel sheet"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", en ? "All tools" : "เครื่องมือทั้งหมด");
    nav.remove();
    document.body.appendChild(panel);

    var T = function (th, e2) { return en ? e2 : th; };
    var fsLg = document.documentElement.classList.contains("fs-lg");
    var root = location.pathname.indexOf("/404") > -1 ? "/" : "";
    var shade = document.createElement("div"); shade.className = "shade"; shade.hidden = true; document.body.appendChild(shade);
    var st = document.createElement("div");
    st.className = "settings"; st.id = "settings"; st.hidden = true; st.setAttribute("role", "dialog"); st.setAttribute("aria-label", T("ตั้งค่าและข้อมูล", "Settings & info"));
    st.innerHTML =
      '<div class="sheet-h"><b>' + T("ตั้งค่าและข้อมูล", "Settings & info") + '</b><button type="button" class="x" data-close aria-label="' + T("ปิด", "Close") + '">✕</button></div>' +
      '<p class="st-sec">' + T("ตั้งค่า", "Settings") + "</p>" +
      '<div class="st-row"><span>' + T("ภาษา", "Language") + '</span><div class="seg"><button type="button" data-lang="th" aria-pressed="' + !en + '">ไทย</button><button type="button" data-lang="en" aria-pressed="' + en + '">English</button></div></div>' +
      '<div class="st-row"><span>' + T("ขนาดตัวอักษร", "Text size") + '</span><div class="seg"><button type="button" data-fs="0" aria-pressed="' + !fsLg + '">' + T("ปกติ", "Normal") + '</button><button type="button" data-fs="1" aria-pressed="' + fsLg + '">' + T("ใหญ่", "Large") + "</button></div></div>" +
      '<div class="st-row st-col"><span>' + T("ข้อมูลที่เก็บในเครื่องนี้", "Data saved on this device") + '<small>' + T("ความคืบหน้าชาเลนจ์เก็บเงิน และอัตราแลกเปลี่ยนที่จำไว้", "Savings-challenge progress and the remembered exchange rate") + '</small></span><button type="button" class="st-btn danger" id="st-clear">' + T("ล้างข้อมูล", "Clear data") + "</button></div>" +
      '<p class="st-sec">' + T("ข้อมูล", "Information") + "</p>" +
      '<div class="st-card"><b>' + T("เกณฑ์ปีภาษี 2569 · อัปเดตพฤศจิกายน 2569", "Tax-year 2026 rules · updated November 2026") + '</b><small>' + T("แหล่งข้อมูล: กรมสรรพากร, สำนักงานประกันสังคม, ExchangeRate-API", "Sources: Revenue Department, Social Security Office, ExchangeRate-API") + "</small></div>" +
      '<nav class="st-links"><a href="' + root + 'about.html">' + T("เกี่ยวกับเรา", "About us") + '</a><a href="' + root + 'privacy.html">' + T("นโยบายความเป็นส่วนตัว", "Privacy policy") + '</a><a href="' + root + 'deductions-2569.html">' + T("ลดหย่อนภาษี 2569", "Tax deductions 2026") + "</a></nav>" +
      '<div class="st-row st-col"><span>' + T("ติดต่อเรา", "Contact") + '<small class="mono">kanngoenkhongchan@gmail.com</small></span><button type="button" class="st-btn" id="st-mail">' + T("คัดลอกอีเมล", "Copy email") + "</button></div>" +
      '<div class="st-row st-col"><span>' + T("แชร์เว็บนี้ให้เพื่อน", "Share this site") + '<small>kanngoenkhongchan.com</small></span><button type="button" class="st-btn" id="st-share">' + T("แชร์", "Share") + "</button></div>" +
      '<details class="st-det"><summary>' + T("เพิ่มลงหน้าจอหลัก ใช้เหมือนแอป", "Add to home screen") + "</summary><p>" +
      T("iPhone: กดปุ่มแชร์ใน Safari → \"เพิ่มไปยังหน้าจอโฮม\" · Android: กด ⋮ ใน Chrome → \"เพิ่มลงในหน้าจอหลัก\"", "iPhone: tap Share in Safari → “Add to Home Screen”. Android: tap ⋮ in Chrome → “Add to Home screen”.") + "</p></details>" +
      '<p class="st-msg" id="st-msg" aria-live="polite"></p>' +
      '<p class="st-legal">' + T("ผลคำนวณเป็นการประมาณ ไม่ใช่คำแนะนำทางการเงิน", "Results are estimates, not financial advice.") + "</p>";
    document.body.appendChild(st);

    var gear = document.createElement("button");
    gear.type = "button"; gear.className = "gear";
    gear.setAttribute("aria-label", T("ตั้งค่าและข้อมูล", "Settings & info")); gear.setAttribute("aria-controls", "settings"); gear.setAttribute("aria-expanded", "false");
    gear.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    head.appendChild(gear);

    var open = null;
    function show(el) {
      [panel, st].forEach(function (x) { x.hidden = x !== el; });
      shade.hidden = !el; open = el;
      gear.setAttribute("aria-expanded", String(el === st));
      document.body.classList.toggle("modal-open", !!el);
    }
    window.knOpenTools = function () { show(panel); };
    gear.addEventListener("click", function () { show(open === st ? null : st); });
    shade.addEventListener("click", function () { show(null); });
    [panel, st].forEach(function (x) { x.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) show(null); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) show(null); });

    var msg = function (t) { var e = document.getElementById("st-msg"); e.textContent = t; };
    st.querySelectorAll("[data-lang]").forEach(function (b2) { b2.addEventListener("click", function () { if (window.setLang) window.setLang(b2.dataset.lang); }); });
    st.querySelectorAll("[data-fs]").forEach(function (b2) { b2.addEventListener("click", function () {
      var on = b2.dataset.fs === "1"; document.documentElement.classList.toggle("fs-lg", on);
      try { localStorage.setItem("kn-fs", on ? "1" : "0"); } catch (e) {}
      st.querySelectorAll("[data-fs]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b2)); });
    }); });
    var armed = false, clr = st.querySelector("#st-clear");
    clr.addEventListener("click", function () {
      if (!armed) { armed = true; clr.textContent = T("แตะอีกครั้งเพื่อยืนยัน", "Tap again to confirm"); return; }
      try { ["kn-challenge-v1", "kn-game-best", "kn-usd", "kn-usd-prev"].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
      armed = false; clr.textContent = T("ล้างข้อมูล", "Clear data"); msg(T("ล้างข้อมูลในเครื่องนี้แล้ว", "Data on this device cleared"));
    });
    st.querySelector("#st-mail").addEventListener("click", function () {
      var t = "kanngoenkhongchan@gmail.com";
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { msg(T("คัดลอกอีเมลแล้ว", "Email copied")); }, function () { msg(t); });
    });
    st.querySelector("#st-share").addEventListener("click", function () {
      var url = "https://kanngoenkhongchan.com/", text = T("เครื่องคำนวณการเงินฟรี ภาษี ผ่อนบ้าน ออมเงิน", "Free finance calculators for Thailand");
      if (navigator.share) { navigator.share({ text: text, url: url }).catch(function () {}); return; }
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { msg(T("คัดลอกลิงก์แล้ว", "Link copied")); }, function () { msg(url); });
    });
  });
})();

// Live strip (USD/THB + tax deadline) and document header on calculator results.
(function () {
  var en = (function () { try { return (new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang")) === "en"; } catch (e) { return false; } })();
  var T = function (th, e) { return en ? e : th; };
  function deadline() {
    var now = new Date(), y = now.getFullYear(), end = new Date(y, 11, 31), d = Math.ceil((end - now) / 864e5);
    if (now.getMonth() >= 9) return T("อีก <b>" + d + "</b> วัน หมดเขตซื้อ SSF/RMF/Thai ESG ลดหย่อนปีภาษี " + (y + 543), "<b>" + d + "</b> days left to buy SSF/RMF/Thai ESG for tax year " + y);
    if (now.getMonth() <= 3) return T("เปิดยื่นภาษีปีภาษี " + (y + 542) + " ออนไลน์ที่ efiling.rd.go.th", "Tax returns for " + (y - 1) + " are open at efiling.rd.go.th");
    return T("ประกันสังคมปี " + (y + 543) + " สมทบสูงสุด 875 บาท/เดือน", "Social security " + y + ": max 875 THB/month");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var head = document.querySelector(".site-head");
    if (head) {
      var t = document.createElement("div"); t.className = "ticker";
      t.innerHTML = '<div class="tk-in"><span class="tk-fx">USD/THB <b id="tk-usd">–</b></span><span class="tk-dl">' + deadline() + "</span></div>";
      head.insertBefore(t, head.firstChild);
      var show = function (v) { var e = document.getElementById("tk-usd"); if (e && v) e.textContent = Number(v).toFixed(2); };
      var c = null; try { c = JSON.parse(localStorage.getItem("kn-usd") || "null"); } catch (e) {}
      if (c) show(c.v);
      if (!c || Date.now() - c.t > 6 * 36e5) {
        fetch("https://open.er-api.com/v6/latest/USD").then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.rates && j.rates.THB) { show(j.rates.THB); try { localStorage.setItem("kn-usd", JSON.stringify({ v: j.rates.THB, t: Date.now() })); } catch (e) {} }
        }).catch(function () {});
      }
    }
    var dl = document.getElementById("deadline");
    if (dl) dl.innerHTML = '<span class="dl-ico">⏳</span><span>' + deadline() + '</span><a href="deductions-2569.html">' + T("ดูรายการลดหย่อน", "See deductions") + " →</a>";
    var now = new Date(), path = location.pathname.split("/").pop() || "index";
    var h = 0; for (var i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) % 9000;
    var ref = "KN-" + String(now.getFullYear() + 543).slice(2) + String(now.getMonth() + 1).padStart(2, "0") + "-" + (1000 + h);
    document.querySelectorAll("form .result").forEach(function (r) {
      var dh = document.createElement("div"); dh.className = "doc-head";
      dh.innerHTML = "<b>" + T("ใบสรุปผลการคำนวณ", "Calculation summary") + "</b><span>" + T("เลขที่", "Ref.") + " " + ref + " · " +
        now.toLocaleDateString(en ? "en-GB" : "th-TH", { day: "numeric", month: "short", year: "numeric" }) + "</span>";
      r.insertBefore(dh, r.firstChild);
    });
  });
})();

// Dashboard shell: sidebar (desktop) and bottom tab bar (phone), built from the menu panel above.
(function () {
  var en = (function () { try { return (new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang")) === "en"; } catch (e) { return false; } })();
  var T = function (th, e) { return en ? e : th; };
  var ICO = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    tax: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 17l5-6"/>',
    loan: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9.5h18"/>',
    save: '<path d="M3 20h18"/><path d="M6 16v-3M10 16V9M14 16v-5M18 16V6"/>',
    menu: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'
  };
  var svg = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + "</svg>"; };
  document.addEventListener("DOMContentLoaded", function () {
    var panel = document.getElementById("menu-panel"), head = document.querySelector(".site-head");
    if (!panel || !head) return;
    var root = location.pathname.indexOf("/404") > -1 ? "/" : "";
    var page = location.pathname.split("/").pop() || "index.html";
    var isHome = page === "index.html" || page === "";

    // sidebar
    var side = document.createElement("aside");
    side.className = "side"; side.setAttribute("aria-label", T("เมนูเครื่องมือ", "Tools menu"));
    var html = '<div class="side-search"><input id="side-q" type="search" placeholder="' + T("ค้นหาเครื่องมือ…", "Search tools…") + '" aria-label="' + T("ค้นหาเครื่องมือ", "Search tools") + '"></div>' +
      '<a class="side-home"' + (isHome ? ' aria-current="page"' : "") + ' href="' + (root || "index.html") + '">' + svg("home") + T("ภาพรวม", "Overview") + "</a>";
    panel.querySelectorAll(".menu-group").forEach(function (g) {
      var links = g.querySelectorAll("a");
      html += '<div class="side-grp"><p class="side-h"><span>' + g.querySelector("p").textContent + '</span><i>' + links.length + "</i></p>";
      links.forEach(function (a) { html += '<a href="' + a.getAttribute("href") + '"' + (a.getAttribute("aria-current") ? ' aria-current="page"' : "") + ">" + a.textContent + "</a>"; });
      html += "</div>";
    });
    html += '<p class="side-foot">' + T("ปีภาษี 2569 · ไม่เก็บข้อมูลที่คุณกรอก", "Tax year 2026 · nothing you type is stored") + "</p>";
    side.innerHTML = html;
    head.insertAdjacentElement("afterend", side);
    document.body.classList.add("has-side");
    var q = side.querySelector("#side-q");
    q.addEventListener("input", function () {
      var v = q.value.trim().toLowerCase();
      side.querySelectorAll(".side-grp").forEach(function (g) {
        var any = false;
        g.querySelectorAll("a").forEach(function (a) { var ok = !v || a.textContent.toLowerCase().indexOf(v) > -1; a.hidden = !ok; any = any || ok; });
        g.hidden = !any;
      });
    });
    var setTop = function () { document.documentElement.style.setProperty("--headh", head.offsetHeight + "px"); };
    setTop(); addEventListener("resize", setTop);

    // bottom tab bar
    var tabs = [["home", root || "index.html", T("หน้าแรก", "Home"), isHome], ["tax", root + "tax.html", T("ภาษี", "Tax"), page === "tax.html"],
      ["loan", root + "home.html", T("ผ่อน", "Loans"), /^(home|car|credit-card)\.html$/.test(page)], ["save", root + "savings.html", T("ออม", "Save"), /^(savings|invest|retire|inflation|challenge)\.html$/.test(page)]];
    var bar = document.createElement("nav");
    bar.className = "tabbar"; bar.setAttribute("aria-label", T("เมนูลัด", "Quick menu"));
    bar.innerHTML = tabs.map(function (t) { return '<a href="' + t[1] + '"' + (t[3] ? ' aria-current="page"' : "") + ">" + svg(t[0]) + "<span>" + t[2] + "</span></a>"; }).join("") +
      '<button type="button" id="tab-menu">' + svg("menu") + "<span>" + T("ทั้งหมด", "All") + "</span></button>";
    document.body.appendChild(bar);
    document.body.classList.add("has-tabbar");
    bar.querySelector("#tab-menu").addEventListener("click", function (e) {
      e.stopPropagation(); if (window.knOpenTools) window.knOpenTools();
    });
  });
})();
