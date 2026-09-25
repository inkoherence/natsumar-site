// Home page motion. The hero phone cycles through wallpapers and tints the
// header with each one, the lock screen shows the visitor's real time, the
// gallery loops, the colour demo swaps sets, and GSAP ties parallax to the
// scroll. Without JS, without GSAP or with reduced motion the page is static
// and complete.
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;
  var lang = document.documentElement.getAttribute("data-lang") || "en";

  function tick() {
    var now = new Date();
    document.querySelectorAll("[data-clock]").forEach(function (el) {
      el.textContent = now.toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit", hour12: false });
    });
    document.querySelectorAll("[data-date]").forEach(function (el) {
      el.textContent = now.toLocaleDateString(lang, { weekday: "long", day: "numeric", month: "long" });
    });
  }

  function load(img) { if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; } }

  // Crossfade the phone screen and the ambient tint together.
  function cycle() {
    var screens = document.querySelectorAll(".phone .screen > img");
    var tints = document.querySelectorAll(".hero-wrap .ambient img");
    if (screens.length < 2 || reduce) return;
    var i = 0;
    load(screens[1]);
    setInterval(function () {
      if (document.hidden) return;
      var next = (i + 1) % screens.length;
      load(screens[(next + 1) % screens.length]);
      screens[i].classList.remove("on"); screens[next].classList.add("on");
      if (tints[i]) tints[i].classList.remove("on");
      if (tints[next]) tints[next].classList.add("on");
      i = next;
    }, 4200);
  }

  // Duplicate rows and columns so the CSS drift loops seamlessly.
  function loops() {
    document.querySelectorAll(".row, .col").forEach(function (el) {
      Array.prototype.slice.call(el.children).forEach(function (img) {
        var c = img.cloneNode(true); c.setAttribute("aria-hidden", "true"); el.appendChild(c);
      });
    });
  }

  // Colour demo: pick the next swatch and flip the thumbnails to its set.
  function palette() {
    var sw = document.querySelectorAll(".swatches span");
    var th = document.querySelectorAll(".thumbs img");
    if (!sw.length || reduce) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      sw[i].classList.remove("sel");
      i = (i + 1) % sw.length;
      sw[i].classList.add("sel");
      var ids = sw[i].dataset.set.split(",");
      th.forEach(function (img, k) {
        setTimeout(function () {
          img.classList.add("out");
          setTimeout(function () {
            img.src = "img/art/" + ids[k] + "-360.webp";
            img.onload = function () { img.classList.remove("out"); };
          }, 250);
        }, k * 90);
      });
    }, 3200);
  }

  function reveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduce) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  // Scroll-linked motion with GSAP + smooth scrolling with Lenis.
  function scrollMotion() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    if (window.Lenis) {
      var lenis = new window.Lenis({ lerp: 0.1 });
      lenis.on("scroll", window.ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var target = document.querySelector(a.getAttribute("href"));
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -16, duration: 1.6 }); }
        });
      });
    }

    // Hero: the text drifts up and fades and the phone rises as you leave
    // the header.
    var hero = { trigger: ".hero-wrap", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero .intro", { yPercent: -10, opacity: 0.65, ease: "none", scrollTrigger: hero });
    gsap.to(".stage", { yPercent: -12, scale: 1.04, ease: "none", scrollTrigger: hero });

    // Gallery rows slide against each other with the scroll, on top of the drift.
    gsap.fromTo(".rows", { xPercent: 6 }, { xPercent: -6, ease: "none", scrollTrigger: { trigger: ".wall", start: "top bottom", end: "bottom top", scrub: true } });

    // Style cards: the art moves inside its frame.
    document.querySelectorAll(".style").forEach(function (card) {
      gsap.fromTo(card.querySelector("img"), { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    });

    // Night wall: the columns tilt a little more as the section passes.
    gsap.fromTo(".cols", { rotate: -4, scale: 1.05 }, { rotate: -10, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
  }

  // The hero phone follows the pointer a little (desktop only).
  function tilt() {
    var stage = document.querySelector(".stage");
    var t = document.querySelector(".tilt");
    if (!stage || !t || reduce || !fine) return;
    window.addEventListener("pointermove", function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      t.style.transform = "rotateY(" + (x * 14 - 6) + "deg) rotateX(" + (-y * 10 + 3) + "deg)";
    }, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    tick(); setInterval(tick, 15000);
    cycle(); loops(); palette(); reveal(); tilt();
    // GSAP loads with defer before this file, so it is ready here.
    scrollMotion();
  });
})();
