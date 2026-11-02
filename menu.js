// การเงินของฉัน — hamburger menu: hides the chip row and shows tools grouped by category in a drop-down panel.
(function () {
  var en = (function () { try { return (new URLSearchParams(location.search).get("lang") || localStorage.getItem("lang")) === "en"; } catch (e) { return false; } })();
  var GROUPS = [
    { th: "ความรู้และกิจกรรม", en: "Learn & activities", items: ["deductions-2569.html", "quiz.html", "challenge.html"] },
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
