// Picks the page language: ?lang=xx, then the last choice, then the browser's
// languages, then English.
// Loaded synchronously in <head> so the other language never flashes.
(function () {
  var supported = ["en", "es", "fr", "it", "pt", "de", "ja"];
  var q = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  // Every browser language in order of preference (e.g. ca, es → es).
  var nav = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"])
    .map(function (l) { return String(l).slice(0, 2).toLowerCase(); });
  var lang = [q, saved].concat(nav).filter(function (l) { return supported.indexOf(l) >= 0; })[0] || "en";
  if (q && supported.indexOf(q) >= 0) { try { localStorage.setItem("lang", q); } catch (e) {} }
  var root = document.documentElement;
  root.setAttribute("data-lang", lang);
  root.lang = lang;
  var t = root.getAttribute("data-title-" + lang);
  if (t) document.title = t;
  root.classList.add("js");
  // One small globe button instead of seven pills: the links stay in the
  // HTML (crawlers, no-JS) and become the items of a menu.
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
        var u = new URL(location.href); u.searchParams.set("lang", l);
        item.href = u.search + u.hash;
        item.hreflang = l;
        item.lang = "";
        item.textContent = names[l] || l;
        item.setAttribute("aria-current", l === lang ? "true" : "false");
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
