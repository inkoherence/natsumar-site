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
  // Each language in its own name, for the compact picker on narrow screens.
  var names = { en: "English", es: "Español", fr: "Français", it: "Italiano", pt: "Português", de: "Deutsch", ja: "日本語" };
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-switch").forEach(function (sw) {
      var sel = document.createElement("select");
      sel.className = "lang-select";
      sel.setAttribute("aria-label", "Language");
      sw.querySelectorAll("a").forEach(function (a) {
        var l = a.getAttribute("hreflang");
        a.setAttribute("aria-current", l === lang ? "true" : "false");
        var o = document.createElement("option");
        o.value = l; o.textContent = names[l] || l; o.selected = l === lang;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () { location.search = "?lang=" + sel.value; });
      sw.appendChild(sel);
    });
  });
})();
