// การเงินของฉัน — hamburger menu: hides the chip row and shows tools grouped by category in a drop-down panel.
(function () {
  var en = (function () { try { return (new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang")) === "en"; } catch (e) { return false; } })();
  var GROUPS = [
    { th: "ความรู้และกิจกรรม", en: "Learn & activities", items: ["game.html", "deductions-2569.html", "quiz.html", "challenge.html"] },
    { th: "ภาษีและเงินเดือน", en: "Tax & salary", items: ["tax.html", "salary.html", "vat.html"] },
    { th: "ผ่อนและสินเชื่อ", en: "Loans & credit", items: ["home.html", "car.html", "credit-card.html"] },
    { th: "ออมและลงทุน", en: "Saving & investing", items: ["savings.html", "invest.html", "retire.html"] },
    { th: "การเงินทั่วโลก", en: "World finance", items: ["currency.html", "inflation.html"] },
    { th: "อื่น ๆ", en: "Other", items: ["age.html"] }
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
