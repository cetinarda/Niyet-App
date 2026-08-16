/* ─────────────────────────────────────────────────────────────────────────
   Sakin · sakin.life tanıtım sitesi — tema ve dil
   Tanıtım sayfası ve blog sayfaları bu dosyayı paylaşır.

   DİL: uygulamayla AYNI localStorage anahtarını kullanır (sakin_lang).
   Böylece kullanıcı sitede dilini seçip uygulamaya geçtiğinde dil korunur.
   Kod listesi de uygulamayla birebir: tr en de es pt fr ja (pt-BR DEĞİL).

   TEMA: uygulama koyu tema olduğu için varsayılan koyu. Kullanıcı açık temaya
   geçerse tercihi sakin_site_theme'e yazılır ve sayfalar arası korunur.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var LANGS = [
    { code: "tr", name: "Türkçe" },
    { code: "en", name: "English" },
    { code: "de", name: "Deutsch" },
    { code: "es", name: "Español" },
    { code: "pt", name: "Português" },
    { code: "fr", name: "Français" },
    { code: "ja", name: "日本語" }
  ];
  var CODES = LANGS.map(function (l) { return l.code; });

  /* ── TEMA ───────────────────────────────────────────────────────────── */
  function readTheme() {
    // ?theme=light|dark bağlantıyı belirli bir temada açar (paylaşım ve test için)
    try {
      var q = new URLSearchParams(location.search).get("theme");
      if (q === "light" || q === "dark") return q;
    } catch (e) {}
    try {
      var v = localStorage.getItem("sakin_site_theme");
      if (v === "light" || v === "dark") return v;
    } catch (e) {}
    return "light"; // varsayılan açık tema (kullanıcı tercihi)
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f6f4fa" : "#000000");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.textContent = t === "light" ? "☾" : "☀";
      b.setAttribute("aria-label", t === "light" ? "Koyu tema" : "Açık tema");
      b.setAttribute("title", t === "light" ? "Koyu tema" : "Açık tema");
    });
  }
  function toggleTheme() {
    var next = readTheme() === "light" ? "dark" : "light";
    try { localStorage.setItem("sakin_site_theme", next); } catch (e) {}
    applyTheme(next);
  }

  /* ── DİL ────────────────────────────────────────────────────────────── */
  // Sayfanın kendi dil sürümü var mı (blog yazıları gibi ayrı dosyalar)?
  function altHref(code) {
    var el = document.querySelector('link[rel="alternate"][hreflang="' + code + '"]');
    return el ? el.getAttribute("href") : null;
  }
  function isLangPage() {
    return !!document.querySelector('link[rel="alternate"][hreflang]');
  }

  function readLang() {
    // 1) ?lang= (paylaşılan bağlantı belirli bir dili zorlayabilsin)
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q && CODES.indexOf(q) > -1) return q;
    } catch (e) {}
    // 2) Sayfanın KENDİ dili. /blog/de/... gibi dile özel sayfalarda kayıtlı
    //    tercih değil, sayfanın dili geçerlidir; yoksa Almanca sayfada İngilizce
    //    arayüz metinleri çıkardı.
    if (isLangPage()) {
      var pl = document.documentElement.getAttribute("lang");
      if (pl && CODES.indexOf(pl) > -1) return pl;
    }
    // 2) kullanıcının daha önce seçtiği dil (uygulamayla ortak anahtar)
    try {
      var s = localStorage.getItem("sakin_lang");
      if (s && CODES.indexOf(s) > -1) return s;
    } catch (e) {}
    // 3) tarayıcı dili
    try {
      var n = (navigator.language || "").slice(0, 2).toLowerCase();
      if (CODES.indexOf(n) > -1) return n;
    } catch (e) {}
    return "tr";
  }

  function applyLang(code) {
    var dict = (window.SAKIN_I18N && window.SAKIN_I18N[code]) || {};
    var fallback = (window.SAKIN_I18N && window.SAKIN_I18N.tr) || {};

    document.documentElement.setAttribute("lang", code);

    document.querySelectorAll("[data-t]").forEach(function (el) {
      var k = el.getAttribute("data-t");
      var v = dict[k] !== undefined ? dict[k] : fallback[k];
      if (v === undefined) return;
      // data-t-attr="content" gibi durumlarda metin yerine öznitelik yazılır
      var attr = el.getAttribute("data-t-attr");
      if (attr) el.setAttribute(attr, v);
      else if (el.hasAttribute("data-t-html")) el.innerHTML = v;
      else el.textContent = v;
    });

    var title = dict.pageTitle || fallback.pageTitle;
    if (title) document.title = title;

    // Blog bağlantıları seçili dilin klasörüne gitsin. Tanıtım sayfası tek
    // dosya olduğu için bağlantılar burada yeniden yazılır; blog sayfaları
    // zaten dile özel dosyalar (hreflang ile birbirine bağlı).
    document.querySelectorAll("[data-blog-link]").forEach(function (el) {
      var slug = el.getAttribute("data-blog-link");
      var base = code === "tr" ? "/blog/" : "/blog/" + code + "/";
      el.setAttribute("href", base + slug);
    });

    document.querySelectorAll("[data-lang-label]").forEach(function (el) {
      el.textContent = code.toUpperCase();
    });
    document.querySelectorAll(".lang-menu button").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-lang") === code ? "true" : "false");
    });
  }

  function setLang(code) {
    try { localStorage.setItem("sakin_lang", code); } catch (e) {}
    // Dile özel bir sayfadaysak (blog yazıları) o dilin dosyasına git;
    // aksi hâlde metinleri yerinde değiştir (tanıtım sayfası).
    var href = isLangPage() ? altHref(code) : null;
    if (href && href !== location.href) { location.href = href; return; }
    applyLang(code);
  }

  /* ── Ambient derinlik ───────────────────────────────────────────────── */
  // Uygulamanın giriş ekranındaki fare-takipli ışık + yıldızlar efektinin
  // site için soluklaştırılmış hali (bkz. site.css .ambient*). Sayfa arka
  // planı boş durmasın diye eklendi; abartılı olmaması için sabit, az
  // sayıda yıldız ve çok düşük opasiteli tek bir ışık kullanılıyor.
  function buildAmbient() {
    if (document.querySelector(".ambient")) return;
    var wrap = document.createElement("div");
    wrap.className = "ambient";
    wrap.setAttribute("aria-hidden", "true");

    var glow = document.createElement("div");
    glow.className = "ambient-glow";
    wrap.appendChild(glow);

    var cursor = document.createElement("div");
    cursor.className = "ambient-cursor";
    wrap.appendChild(cursor);

    var STAR_COUNT = 22;
    for (var i = 0; i < STAR_COUNT; i++) {
      var star = document.createElement("div");
      star.className = "ambient-star";
      var size = i % 7 === 0 ? 2.4 : i % 4 === 0 ? 1.6 : 1;
      star.style.left = ((i * 41 + 7) % 100) + "%";
      star.style.top = ((i * 29 + 13) % 100) + "%";
      star.style.width = size + "px";
      star.style.height = size + "px";
      star.style.animationDuration = (3.5 + (i % 5)) + "s";
      star.style.animationDelay = ((i * 0.37) % 5) + "s";
      wrap.appendChild(star);
    }

    document.body.insertBefore(wrap, document.body.firstChild);

    var raf = null;
    window.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        wrap.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 100) + "%");
        wrap.style.setProperty("--my", ((e.clientY / window.innerHeight) * 100) + "%");
        cursor.classList.add("active");
        raf = null;
      });
    }, { passive: true });
  }

  /* ── Menüyü kur ─────────────────────────────────────────────────────── */
  function buildLangMenu() {
    var wrap = document.querySelector(".lang-menu");
    if (!wrap) return;
    wrap.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l.code + '">' +
             '<span>' + l.name + '</span><span class="code">' + l.code + '</span></button>';
    }).join("");
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-lang]");
      if (!b) return;
      setLang(b.getAttribute("data-lang"));
      wrap.classList.remove("open");
    });
  }

  /* Kaydırınca yumuşak, kademeli beliriş. `reveal` sınıfı BURADA eklenir
     (JS çalışmazsa hiç eklenmez → içerik görünür kalır, SEO/erişilebilirlik güvenli).
     Aynı grup içinde ufak gecikme kademesi (stagger) zarif bir ritim verir. */
  function buildReveal() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!("IntersectionObserver" in window)) return;
      var groups = [".tile", ".fam > div", ".card", ".sec-head", ".isnot > div", ".is"];
      var els = [];
      document.querySelectorAll(groups.join(",")).forEach(function (el) { els.push(el); });
      if (!els.length) return;
      // Grup içi index'e göre kademeli gecikme (yalnızca aynı ebeveyndekiler).
      var seen = new Map();
      els.forEach(function (el) {
        var key = el.parentElement;
        var i = seen.get(key) || 0; seen.set(key, i + 1);
        el.classList.add("reveal");
        el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
      });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    } catch (_) {}
  }

  function init() {
    applyTheme(readTheme());
    buildAmbient();
    buildLangMenu();
    applyLang(readLang());
    buildReveal();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", toggleTheme);
    });

    var btn = document.querySelector("[data-lang-toggle]");
    var menu = document.querySelector(".lang-menu");
    if (btn && menu) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("open");
      });
      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && e.target !== btn) menu.classList.remove("open");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") menu.classList.remove("open");
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
