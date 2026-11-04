// การเงินของฉัน — hamburger menu: hides the chip row and shows tools grouped by category in a drop-down panel.
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
    panel.innerHTML = html;
    nav.replaceWith(panel);

    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "burger";
    btn.setAttribute("aria-label", en ? "Menu" : "เมนู");
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "menu-panel");
    btn.innerHTML = "<span></span><span></span><span></span>";
    head.appendChild(btn);

    function set(open) {
      panel.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(panel.hidden); });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
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
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
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
      e.stopPropagation(); scrollTo({ top: 0, behavior: "smooth" });
      var b = document.querySelector(".burger"); if (b) b.click();
    });
  });
})();
