// Picks the page language: ?lang=xx, then the last choice, then the browser.
// Loaded synchronously in <head> so the other language never flashes.
(function () {
  var supported = ["en", "es"];
  var q = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) {}
  var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  var lang = [q, saved, nav].filter(function (l) { return supported.indexOf(l) >= 0; })[0] || "en";
  if (q && supported.indexOf(q) >= 0) { try { localStorage.setItem("lang", q); } catch (e) {} }
  var root = document.documentElement;
  root.setAttribute("data-lang", lang);
  root.lang = lang;
  var t = root.getAttribute("data-title-" + lang);
  if (t) document.title = t;
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".lang-switch a").forEach(function (a) {
      a.setAttribute("aria-current", a.getAttribute("hreflang") === lang ? "true" : "false");
    });
  });
})();
