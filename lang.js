// Language handling for the static per-language pages (/, /es/, /fr/…).
// Each page is already in one language; this script only:
//  - sends old ?lang=xx links (and the email's confirmation link) to the
//    right URL, keeping the rest of the query;
//  - on an English page, takes visitors whose browser prefers another
//    supported language to their version, unless they already chose one;
//  - turns the footer's list of languages into a small menu and remembers
//    the choice. Only an explicit choice is stored (a preference the visitor
//    asked for, exempt from consent); automatic detection stores nothing.
// Loaded synchronously in <head> so a redirect happens before paint.
(function () {
  var supported = ["en", "es", "fr", "it", "pt", "de", "ja"];
  var root = document.documentElement;
  var lang = root.lang || "en";
  root.setAttribute("data-lang", lang);
  root.classList.add("js");

  // The same page in another language: /es/terms.html <-> /terms.html.
  function alternate(l) {
    var rest = location.pathname.replace(/^\/(es|fr|it|pt|de|ja)(\/|$)/, "/");
    return (l === "en" ? "" : "/" + l) + rest;
  }
  function go(l, params) {
    if (l === lang) return false;
    params.delete("lang");
    var q = params.toString();
    location.replace(alternate(l) + (q ? "?" + q : "") + location.hash);
    return true;
  }

  var params = new URLSearchParams(location.search);
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  var asked = params.get("lang");
  if (asked && supported.indexOf(asked) >= 0) {
    try { localStorage.setItem("lang", asked); } catch (e) {}
    if (go(asked, params)) return;
  } else if (lang === "en" && !saved) {
    var nav = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"])
      .map(function (l) { return String(l).slice(0, 2).toLowerCase(); });
    var best = nav.filter(function (l) { return supported.indexOf(l) >= 0; })[0];
    if (best && best !== "en" && go(best, params)) return;
  }

  var names = { en: "English", es: "Español", fr: "Français", it: "Italiano", pt: "Português", de: "Deutsch", ja: "日本語" };
  var globe = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-switch").forEach(function (sw) {
      var det = document.createElement("details");
      det.className = "lang-menu";
      var sum = document.createElement("summary");
      sum.setAttribute("aria-label", "Language: " + (names[lang] || lang));
      sum.innerHTML = globe + "<span>" + lang.toUpperCase() + "</span>";
      var menu = document.createElement("div");
      menu.className = "menu";
      sw.querySelectorAll("a").forEach(function (a) {
        var l = a.getAttribute("hreflang");
        var item = document.createElement("a");
        // Keep the rest of the query (e.g. ?status= on the confirmation page).
        item.href = a.getAttribute("href") + location.search.replace(/([?&])lang=[^&]*&?/, "$1").replace(/[?&]$/, "");
        item.hreflang = l;
        item.textContent = names[l] || l;
        item.setAttribute("aria-current", l === lang ? "true" : "false");
        item.addEventListener("click", function () { try { localStorage.setItem("lang", l); } catch (e) {} });
        menu.appendChild(item);
      });
      det.appendChild(sum);
      det.appendChild(menu);
      sw.appendChild(det);
      sw.classList.add("is-menu");
      document.addEventListener("click", function (e) { if (!det.contains(e.target)) det.open = false; });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") det.open = false; });
    });
  });
})();
