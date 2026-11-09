/* =====================================================================
   ALAN STORE MX · script.js
   Todo es mejora progresiva: si algo falla, la página se ve completa.
   Contenido: 1 Configuración · 2 Utilidades · 3 Cargador · 4 WhatsApp ·
   5 Encabezado/menú · 6 Revelado y titulares · 7 Motor de scroll
   (hero, manifiesto, universos, pasos) · 8 Partículas · 9 Puntero
   (tilt, cursor, imán) · 10 Catálogo y pedido · 11 Estado de horario ·
   12 Formulario · 13 Extras · 14 Arranque
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- 1. CONFIGURACIÓN ---------- */
  // Número de WhatsApp del negocio, en formato internacional sin "+": 52 + 10 dígitos.
  // Es el ÚNICO lugar donde vive el número. Si queda vacío, los botones de WhatsApp se ocultan.
  var WHATSAPP_NUMBER = '525649498382';
  var NEGOCIO = 'Alan Store MX';
  var HORARIO = { abre: 7, cierra: 22, zona: 'America/Mexico_City' };

  var root = document.documentElement;
  root.classList.add('js');
  root.classList.add('is-loading');

  /* ---------- 2. UTILIDADES ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var reduced = mq('(prefers-reduced-motion: reduce)');
  var finePointer = mq('(hover: hover) and (pointer: fine)');
  var coarse = !finePointer;
  var ready = false;
  var onReadyQueue = [];

  function safe(nombre, fn) {
    try { fn(); } catch (err) {
      if (window.console && console.warn) console.warn('[Alan Store MX] ' + nombre + ':', err);
    }
  }

  function whenReady(fn) { if (ready) fn(); else onReadyQueue.push(fn); }

  function markReady() {
    if (ready) return;
    ready = true;
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    onReadyQueue.splice(0).forEach(function (fn) { safe('ready', fn); });
  }
  // Red de seguridad: pase lo que pase, el hero se muestra
  setTimeout(markReady, 2300);

  /* ---------- 3. CARGADOR (se cierra solo en ~2 s) ---------- */
  function initLoader() {
    var el = $('#cargador');
    if (!el) { markReady(); return; }
    var pct = $('#cargaPct');
    var dur = reduced ? 350 : 1100;
    var t0 = performance.now();
    var closed = false;

    function finish() {
      if (closed) return;
      closed = true;
      el.style.setProperty('--pct', '1');
      if (pct) pct.textContent = '100';
      el.classList.add('is-done');
      root.classList.remove('is-loading');
      setTimeout(markReady, 240);
      setTimeout(function () { el.classList.add('is-gone'); el.setAttribute('aria-hidden', 'true'); }, 1000);
    }
    function tick(now) {
      var t = clamp((now - t0) / dur, 0, 1);
      var e = easeOut(t);
      el.style.setProperty('--pct', e.toFixed(3));
      if (pct) pct.textContent = String(Math.round(e * 100));
      if (t < 1) requestAnimationFrame(tick); else finish();
    }
    requestAnimationFrame(tick);
    setTimeout(finish, 1700); // por si el navegador pausa requestAnimationFrame
  }

  /* ---------- 4. WHATSAPP ---------- */
  function waUrl(texto) {
    if (!WHATSAPP_NUMBER) return '';
    return 'https://wa.me/' + WHATSAPP_NUMBER + (texto ? '?text=' + encodeURIComponent(texto) : '');
  }

  function initWhatsApp() {
    if (!WHATSAPP_NUMBER) {
      root.classList.add('no-wa');
      $$('[data-wa], [data-wa-order]').forEach(function (el) { el.hidden = true; });
      var enviar = $('[data-submit]');
      if (enviar) enviar.hidden = true;
      return;
    }
    $$('[data-wa]').forEach(function (a) {
      a.href = waUrl(a.getAttribute('data-wa-msg') || '¡Hola ' + NEGOCIO + '! 👑 Quiero información sobre su streaming.');
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });
  }

  /* ---------- 5. ENCABEZADO, MENÚ Y BARRA DE PROGRESO ---------- */
  function initHeader() {
    var hdr = $('#encabezado');
    var nav = $('#menu');
    var burger = $('.burger');
    if (!hdr) return;
    var lastY = window.scrollY;
    var ticking = false;
    var menuOpen = false;

    function onScroll() {
      var y = window.scrollY;
      hdr.classList.toggle('is-solid', y > 24);
      if (!menuOpen) {
        if (y > 260 && y > lastY + 6) hdr.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 260) hdr.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (!burger || !nav) return;
    function setMenu(abierto) {
      menuOpen = abierto;
      nav.classList.toggle('is-open', abierto);
      burger.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      root.classList.toggle('menu-open', abierto);
      if (abierto) hdr.classList.remove('is-hidden');
    }
    burger.addEventListener('click', function () { setMenu(!menuOpen); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900 && menuOpen) setMenu(false); });
  }

  /* ---------- 6. REVELADO AL HACER SCROLL, TITULARES Y CONTADORES ---------- */
  function splitWords(el) {
    var texto = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    texto.split(' ').forEach(function (palabra, i) {
      var w = document.createElement('span');
      w.className = 'w';
      var s = document.createElement('span');
      s.textContent = palabra;
      s.style.setProperty('--k', String(i));
      w.appendChild(s);
      el.appendChild(w);
      el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('is-split');
  }

  var counterPending = [];

  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    if (!isFinite(to)) return;
    if (reduced) { el.textContent = pre + to + suf; return; }
    var obj = { v: 0 };
    if (window.anime) {
      window.anime({
        targets: obj, v: to, round: 1, duration: 1700, easing: 'easeOutExpo',
        update: function () { el.textContent = pre + obj.v + suf; }
      });
    } else {
      var t0 = performance.now();
      (function step(now) {
        var t = clamp((now - t0) / 1500, 0, 1);
        el.textContent = pre + Math.round(to * easeOut(t)) + suf;
        if (t < 1) requestAnimationFrame(step);
      })(t0);
    }
  }

  var revealIO = null;
  var counterIO = null;

  function observeReveal(els) {
    els.forEach(function (el) {
      if (reduced || !revealIO) el.classList.add('is-in');
      else revealIO.observe(el);
    });
  }

  function initReveal() {
    // Escalonado automático en grupos
    $$('[data-stagger]').forEach(function (grupo) {
      Array.prototype.filter.call(grupo.children, function (c) { return c.hasAttribute('data-reveal'); })
        .forEach(function (c, i) { c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
    });
    // Tarjetas del catálogo: escalonado por columnas
    $$('.items').forEach(function (lista) {
      $$('.item', lista).forEach(function (it, i) { it.style.setProperty('--d', ((i % 4) * 0.07).toFixed(2) + 's'); });
    });
    $$('[data-split]').forEach(splitWords);

    if ('IntersectionObserver' in window) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          if (en.target.classList.contains('card--hours')) updateStatus();
          revealIO.unobserve(en.target);
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

      counterIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          counterIO.unobserve(en.target);
          if (ready) runCount(en.target); else counterPending.push(en.target);
        });
      }, { threshold: 0.6 });
    }

    observeReveal($$('[data-reveal], [data-split], [data-bars], .item'));

    $$('[data-count]').forEach(function (el) {
      var pre = el.getAttribute('data-prefix') || '';
      var suf = el.getAttribute('data-suffix') || '';
      if (reduced || !counterIO) { el.textContent = pre + el.getAttribute('data-count') + suf; return; }
      el.textContent = pre + '0' + suf;
      counterIO.observe(el);
    });
    whenReady(function () { counterPending.splice(0).forEach(runCount); });
  }

  /* ---------- 7. MOTOR DE SCROLL (con inercia suave) ---------- */
  var S = { y: window.scrollY, target: window.scrollY, vh: window.innerHeight };
  var effects = [];
  var measures = [];
  var rafScroll = 0;

  function loopScroll() {
    rafScroll = 0;
    S.y += (S.target - S.y) * (reduced ? 1 : 0.13);
    if (Math.abs(S.target - S.y) < 0.25) S.y = S.target;
    for (var i = 0; i < effects.length; i++) effects[i](S.y);
    if (S.y !== S.target) rafScroll = requestAnimationFrame(loopScroll);
  }
  function kick() { if (!rafScroll) rafScroll = requestAnimationFrame(loopScroll); }
  function measureAll() {
    S.vh = window.innerHeight;
    measures.forEach(function (m) { safe('medir', m); });
    S.target = window.scrollY;
    kick();
  }
  function absTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  function initScrollEngine() {
    if (!reduced) root.classList.add('fx');
    window.addEventListener('scroll', function () { S.target = window.scrollY; kick(); }, { passive: true });
    var rz = 0;
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(measureAll, 150); });
    window.addEventListener('orientationchange', function () { setTimeout(measureAll, 300); });

    // Barra de progreso del encabezado
    var hdr = $('#encabezado');
    if (hdr) {
      effects.push(function (y) {
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        hdr.style.setProperty('--sp', clamp(y / max, 0, 1).toFixed(4));
      });
    }

    // Hero: se aleja y se desvanece al bajar
    var hero = $('.hero');
    if (hero && !reduced) {
      var heroH = 1;
      measures.push(function () { heroH = hero.offsetHeight; });
      effects.push(function (y) {
        hero.style.setProperty('--hp', clamp(y / (heroH * 0.85), 0, 1).toFixed(4));
      });
    }

    if (reduced) { measureAll(); return; }

    // Manifiesto: el logo se abre de tarjeta a pantalla completa
    var man = $('.manifesto');
    if (man) {
      var mTop = 0, mRange = 1;
      measures.push(function () {
        var pin = $('.manifesto__pin', man);
        mTop = absTop(man);
        mRange = Math.max(1, man.offsetHeight - (pin ? pin.offsetHeight : window.innerHeight));
      });
      effects.push(function (y) {
        var p = clamp((y - mTop) / mRange, 0, 1);
        man.style.setProperty('--p', easeInOut(clamp(p / 0.55, 0, 1)).toFixed(4));
        man.style.setProperty('--q', easeInOut(clamp((p - 0.5) / 0.38, 0, 1)).toFixed(4));
      });
    }

    // Universos: scroll vertical que mueve un carrusel horizontal fijado
    var worlds = $('.worlds');
    var wTrack = worlds && $('.worlds__track', worlds);
    var wPin = worlds && $('.worlds__pin', worlds);
    if (worlds && wTrack && wPin) {
      var wTop = 0, wTravel = 0, wLen = 1;
      measures.push(function () {
        worlds.style.height = '';
        wTravel = Math.max(0, wTrack.scrollWidth - wPin.clientWidth);
        wLen = Math.max(1, wTravel * 1.15);
        worlds.style.height = Math.round(wPin.offsetHeight + wLen) + 'px';
        wTop = absTop(worlds);
      });
      effects.push(function (y) {
        var p = clamp((y - wTop) / wLen, 0, 1);
        wTrack.style.transform = 'translate3d(' + (-wTravel * p).toFixed(1) + 'px,0,0)';
        worlds.style.setProperty('--wp', p.toFixed(4));
      });
      // Si alguien navega con teclado a una tarjeta fuera de pantalla, movemos el scroll vertical
      wPin.addEventListener('scroll', function () { wPin.scrollLeft = 0; });
      wPin.addEventListener('focusin', function (e) {
        var card = e.target.closest('.world');
        if (!card || wTravel <= 0) return;
        var objetivo = clamp((card.offsetLeft - 20) / wTravel, 0, 1);
        window.scrollTo({ top: wTop + objetivo * wLen, behavior: 'auto' });
      });
    }

    // Pasos: la línea se llena y se encienden los números
    var lista = $('.steps__list');
    if (lista) {
      var pasos = $$('.step', lista);
      var sTop = 0, sH = 1;
      measures.push(function () { sTop = absTop(lista); sH = lista.offsetHeight; });
      effects.push(function (y) {
        var p = clamp((y + S.vh * 0.8 - sTop) / (sH + S.vh * 0.5), 0, 1);
        lista.style.setProperty('--sp', p.toFixed(4));
        pasos.forEach(function (st, i) { st.classList.toggle('is-on', p >= 0.12 + (0.7 / Math.max(1, pasos.length)) * i); });
      });
    }

    window.addEventListener('load', measureAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
    measureAll();
  }

  /* ---------- 8. PARTÍCULAS (estrellas, coronas y destellos) ---------- */
  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }
  function drawCrown(ctx, x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(rot) * 0.4);
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(-s * 0.9, -s * 0.5);
    ctx.lineTo(-s * 0.4, s * 0.05);
    ctx.lineTo(0, -s * 0.8);
    ctx.lineTo(s * 0.4, s * 0.05);
    ctx.lineTo(s * 0.9, -s * 0.5);
    ctx.lineTo(s, s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function createField(canvas, opts) {
    if (!canvas || !canvas.getContext) return;
    var host = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    if (!ctx || !host) return;
    var pal = ['176,97,255', '224,75,255', '255,255,255', '255,194,26'];
    var W = 0, H = 0, parts = [], run = false, raf = 0;
    var mouse = { x: -999, y: -999, on: false };
    var sprites = pal.map(function (c) {
      var s = document.createElement('canvas');
      s.width = s.height = 64;
      var g = s.getContext('2d');
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(' + c + ',1)');
      gr.addColorStop(0.25, 'rgba(' + c + ',0.55)');
      gr.addColorStop(1, 'rgba(' + c + ',0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return s;
    });

    function build() {
      var n = Math.round(clamp(W * H / (coarse ? 24000 : 15000), 22, 90) * ((opts && opts.density) || 1));
      parts = [];
      for (var i = 0; i < n; i++) {
        var q = Math.random();
        var kind = q < 0.12 ? 2 : (q < 0.4 ? 1 : 0);
        parts.push({
          x: rand(0, W), y: rand(0, H), z: rand(0.3, 1),
          r: kind === 0 ? rand(2, 7) : rand(4, 9),
          vy: rand(0.12, 0.45), ph: rand(0, 6.28), tw: rand(0.8, 2.2),
          c: kind === 2 ? 3 : Math.floor(Math.random() * pal.length), kind: kind
        });
      }
    }
    function size() {
      var r = host.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (!run) frame(performance.now(), true);
    }
    function frame(t, once) {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!once && !reduced) {
          p.y -= p.vy * p.z;
          p.x += Math.sin(t * 0.0006 + p.ph) * 0.18 * p.z;
          if (p.y < -20) { p.y = H + 20; p.x = rand(0, W); }
          if (mouse.on) {
            var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < 130) { var f = (130 - d) / 130; p.x += dx / d * f * 2.2; p.y += dy / d * f * 2.2; }
          }
        }
        ctx.globalAlpha = (0.25 + 0.75 * (Math.sin(t * 0.001 * p.tw + p.ph) * 0.5 + 0.5)) * p.z;
        if (p.kind === 0) {
          var s = p.r * 2 * p.z + 6;
          ctx.drawImage(sprites[p.c], p.x - s / 2, p.y - s / 2, s, s);
        } else if (p.kind === 1) {
          ctx.fillStyle = 'rgb(' + pal[p.c] + ')';
          drawStar(ctx, p.x, p.y, p.r * p.z + 2);
        } else {
          ctx.fillStyle = 'rgb(255,194,26)';
          drawCrown(ctx, p.x, p.y, p.r * p.z + 3, t * 0.0004 + p.ph);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      if (run && !once) raf = requestAnimationFrame(frame);
    }

    size();
    var rz = 0;
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(size, 200); });
    if (reduced) return;
    if (finePointer) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
      }, { passive: true });
      host.addEventListener('pointerleave', function () { mouse.on = false; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !run) { run = true; raf = requestAnimationFrame(frame); }
        else if (!visible) { run = false; cancelAnimationFrame(raf); }
      }).observe(host);
    } else {
      run = true;
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------- 9. PUNTERO: tilt 3D, foco de luz, cursor e imán ---------- */
  function initHeroStage() {
    var hero = $('.hero');
    var rotor = $('.stage__rotor');
    if (!hero || !rotor || reduced) return;
    var usePointer = false;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    var visible = true;

    if (finePointer) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
        ty = clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
        usePointer = true;
      }, { passive: true });
      hero.addEventListener('pointerleave', function () { usePointer = false; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    }
    (function loop(t) {
      if (visible) {
        // Sin ratón (o sin moverlo): balanceo suave y constante
        var gx = usePointer ? tx : Math.sin(t / 2600) * 0.55;
        var gy = usePointer ? ty : Math.cos(t / 3100) * 0.4;
        cx += (gx - cx) * 0.06;
        cy += (gy - cy) * 0.06;
        rotor.style.setProperty('--rx', (cx * 15).toFixed(2) + 'deg');
        rotor.style.setProperty('--ry', (-cy * 11).toFixed(2) + 'deg');
      }
      requestAnimationFrame(loop);
    })(performance.now());
  }

  function initPointerFX() {
    if (!finePointer) return;
    var cur = null;
    var mag = null;
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var t = e.target.closest ? e.target.closest('.item, .spot') : null;
      if (cur && cur !== t) { cur.style.transform = ''; }
      cur = t;
      if (t) {
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        t.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (t.classList.contains('item') && !reduced) {
          t.style.transform = 'perspective(700px) rotateX(' + ((0.5 - y) * 9).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 11).toFixed(2) + 'deg)';
        }
      }
      var m = e.target.closest ? e.target.closest('.btn--magnetic') : null;
      if (mag && mag !== m) { mag.style.removeProperty('--tx'); mag.style.removeProperty('--ty'); }
      mag = m;
      if (m && !reduced) {
        var br = m.getBoundingClientRect();
        m.style.setProperty('--tx', (((e.clientX - br.left) / br.width - 0.5) * 14).toFixed(1) + 'px');
        m.style.setProperty('--ty', (((e.clientY - br.top) / br.height - 0.5) * 10).toFixed(1) + 'px');
      }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () {
      if (cur) { cur.style.transform = ''; cur = null; }
      if (mag) { mag.style.removeProperty('--tx'); mag.style.removeProperty('--ty'); mag = null; }
    });

    // Cursor luminoso
    var dot = $('.cursor');
    if (!dot || reduced) return;
    root.classList.add('has-cursor');
    var x = -100, y = -100, tx = x, ty = y, running = false;
    function move() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) requestAnimationFrame(move); else running = false;
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      var hot = e.target.closest && e.target.closest('a, button, summary, input, select, textarea, label');
      dot.classList.toggle('is-hot', Boolean(hot));
      if (!running) { running = true; requestAnimationFrame(move); }
    }, { passive: true });
  }

  /* ---------- 10. CATÁLOGO, PEDIDO Y BANDEJA ---------- */
  var cart = new Map();
  var catalogEls = {};

  function money(n) { return '$' + Number(n).toLocaleString('es-MX'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function orderLines() {
    var items = Array.from(cart.values());
    var total = items.reduce(function (a, i) { return a + i.price * i.qty; }, 0);
    var lines = items.map(function (i) { return '• ' + i.qty + '× ' + i.name + ' (' + i.kind + ') — ' + money(i.price * i.qty); });
    return { lines: lines, total: total, count: items.reduce(function (a, i) { return a + i.qty; }, 0) };
  }
  function orderMessage() {
    var o = orderLines();
    return '¡Hola ' + NEGOCIO + '! 👑 Quiero hacer este pedido:\n\n' + o.lines.join('\n') +
      '\n\nTotal según catálogo: ' + money(o.total) + ' MXN\n\n¿Me confirman disponibilidad y cómo pago? ¡Gracias!';
  }

  function burst(x, y) {
    if (reduced || !window.anime) return;
    var glyphs = ['✦', '♛', '✧', '✦'];
    var colors = ['#ffc21a', '#e04bff', '#b061ff', '#ffffff'];
    for (var i = 0; i < 12; i++) {
      var s = document.createElement('span');
      s.className = 'burst';
      s.textContent = glyphs[i % glyphs.length];
      s.style.color = colors[i % colors.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 70;
      (function (el) {
        window.anime({
          targets: el,
          translateX: Math.cos(ang) * dist,
          translateY: Math.sin(ang) * dist - 20,
          rotate: Math.random() * 240 - 120,
          scale: [0.2, 1 + Math.random() * 0.6],
          opacity: [1, 0],
          duration: 700 + Math.random() * 500,
          easing: 'easeOutQuad',
          complete: function () { el.remove(); }
        });
      })(s);
    }
  }

  function syncItem(li) {
    var q = (cart.get(li.getAttribute('data-id')) || { qty: 0 }).qty;
    li.classList.toggle('is-in-cart', q > 0);
    var out = $('output', li);
    if (out) out.textContent = String(q);
  }

  function renderTray() {
    var t = catalogEls;
    if (!t.tray) return;
    var o = orderLines();
    t.tray.classList.toggle('is-on', o.count > 0);
    document.body.classList.toggle('has-cart', o.count > 0);
    t.count.textContent = String(o.count);
    t.total.textContent = money(o.total);
    t.list.innerHTML = Array.from(cart.values()).map(function (i) {
      return '<li data-id="' + esc(i.id) + '"><span>' + esc(i.name) + '<small>' + esc(i.kind) + '</small></span>' +
        '<span class="qty"><button type="button" data-tdec aria-label="Quitar uno de ' + esc(i.name) + '">−</button><output>' + i.qty + '</output><button type="button" data-tinc aria-label="Agregar otro de ' + esc(i.name) + '">+</button></span>' +
        '<b>' + money(i.price * i.qty) + '</b></li>';
    }).join('');
    if (t.send && WHATSAPP_NUMBER) {
      t.send.href = o.count > 0 ? waUrl(orderMessage()) : '#contacto';
      t.send.target = '_blank';
      t.send.rel = 'noopener noreferrer';
    }
    if (o.count === 0) setPanel(false);
  }

  function setPanel(open) {
    var t = catalogEls;
    if (!t.panel) return;
    t.panel.hidden = !open;
    t.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function changeQty(li, delta, origin) {
    var id = li.getAttribute('data-id');
    var cur = cart.get(id) || { id: id, name: li.getAttribute('data-name'), kind: li.getAttribute('data-kind'), price: Number(li.getAttribute('data-price')), qty: 0 };
    cur.qty = clamp(cur.qty + delta, 0, 20);
    if (cur.qty === 0) cart.delete(id); else cart.set(id, cur);
    syncItem(li);
    renderTray();
    if (delta > 0 && origin) {
      var r = origin.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      var badge = $('.tray__badge');
      if (badge) { badge.classList.remove('is-bump'); void badge.offsetWidth; badge.classList.add('is-bump'); }
    }
  }

  function initCatalog() {
    var tabs = $$('.tab');
    var panels = $$('.panel');
    var ink = $('.tabs__ink');
    var tabsBar = $('.tabs');
    if (!tabs.length || !panels.length) return;

    // Bandeja
    catalogEls = {
      tray: $('#bandeja'), panel: $('#bandejaPanel'), list: $('.tray__list'),
      count: $('[data-tray-count]'), total: $('[data-tray-total]'),
      toggle: $('.tray__toggle'), send: $('[data-wa-order]')
    };

    // Stepper en cada tarjeta
    $$('.item').forEach(function (li) {
      var act = $('.item__act', li);
      var nombre = li.getAttribute('data-name');
      if (!act) return;
      act.insertAdjacentHTML('beforeend',
        '<div class="stepper" role="group" aria-label="Cantidad de ' + esc(nombre) + ' (' + esc(li.getAttribute('data-kind')) + ')">' +
        '<button type="button" data-dec aria-label="Quitar uno"><svg class="ico" aria-hidden="true"><use href="#i-minus"/></svg></button>' +
        '<output aria-live="polite">0</output>' +
        '<button type="button" data-inc aria-label="Agregar otro"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></button></div>');
    });

    function moveInk() {
      var a = $('.tab.is-active');
      if (!a || !ink) return;
      ink.style.setProperty('--x', a.offsetLeft + 'px');
      ink.style.setProperty('--w', a.offsetWidth + 'px');
    }
    function replay(panel) {
      var items = $$('.item', panel);
      items.forEach(function (it) { it.style.transition = 'none'; it.classList.remove('is-in'); });
      void panel.offsetWidth;
      requestAnimationFrame(function () {
        items.forEach(function (it) { it.style.transition = ''; it.classList.add('is-in'); });
      });
    }
    function select(nombre, opts) {
      var objetivo = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === nombre;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (on && opts && opts.focus) t.focus();
      });
      panels.forEach(function (p) {
        var on = p.getAttribute('data-panel') === nombre;
        p.hidden = !on;
        if (on) objetivo = p;
      });
      moveInk();
      var activa = $('.tab.is-active');
      if (activa && tabsBar && tabsBar.scrollWidth > tabsBar.clientWidth) {
        tabsBar.scrollTo({ left: activa.offsetLeft - (tabsBar.clientWidth - activa.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
      }
      if (objetivo && !(opts && opts.initial)) replay(objetivo);
    }

    select('perfiles', { initial: true });
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab')); });
      t.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        select(tabs[(i + dir + tabs.length) % tabs.length].getAttribute('data-tab'), { focus: true });
      });
    });
    $$('[data-goto]').forEach(function (a) {
      a.addEventListener('click', function () { select(a.getAttribute('data-goto')); });
    });
    window.addEventListener('resize', moveInk);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
    window.addEventListener('load', moveInk);

    // Agregar, sumar, restar
    var cat = $('#catalogo');
    cat.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      var inc = e.target.closest('[data-inc]');
      var dec = e.target.closest('[data-dec]');
      var btn = add || inc || dec;
      if (!btn) return;
      var li = btn.closest('.item');
      if (li) changeQty(li, dec ? -1 : 1, dec ? null : btn);
    });

    // Bandeja
    if (catalogEls.tray) {
      catalogEls.toggle.addEventListener('click', function () { setPanel(catalogEls.panel.hidden); });
      catalogEls.tray.addEventListener('click', function (e) {
        var inc = e.target.closest('[data-tinc]');
        var dec = e.target.closest('[data-tdec]');
        var clear = e.target.closest('[data-clear]');
        if (clear) {
          cart.clear();
          $$('.item').forEach(syncItem);
          renderTray();
          return;
        }
        if (!inc && !dec) return;
        var li = $('.item[data-id="' + e.target.closest('li').getAttribute('data-id') + '"]');
        if (li) changeQty(li, inc ? 1 : -1, null);
      });
      var send = catalogEls.send;
      if (send) {
        send.addEventListener('click', function (e) {
          if (!WHATSAPP_NUMBER) { e.preventDefault(); return; }
          var r = send.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2);
        });
      }
    }
    renderTray();
  }

  /* ---------- 11. ESTADO DE HORARIO (hora de Ciudad de México) ---------- */
  function mxNow() {
    try {
      var partes = new Intl.DateTimeFormat('es-MX', { timeZone: HORARIO.zona, hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var h = Number(partes.filter(function (p) { return p.type === 'hour'; })[0].value) % 24;
      var m = Number(partes.filter(function (p) { return p.type === 'minute'; })[0].value);
      return { h: h, m: m };
    } catch (err) {
      var d = new Date();
      return { h: d.getHours(), m: d.getMinutes() };
    }
  }
  function updateStatus() {
    var now = mxNow();
    var abierto = now.h >= HORARIO.abre && now.h < HORARIO.cierra;
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-closed', !abierto);
      var t = $('[data-status-text]', el);
      if (!t) return;
      t.textContent = abierto
        ? 'Abierto ahora · atendemos hasta las 22:00'
        : 'Fuera de horario por ahora · abrimos a las 7:00';
    });
    var card = $('.card--hours');
    if (card && card.classList.contains('is-in')) {
      card.style.setProperty('--hand', (((now.h + now.m / 60) / 24) * 360).toFixed(1) + 'deg');
    }
  }
  function initStatus() {
    updateStatus();
    setInterval(updateStatus, 60000);
  }

  /* ---------- 12. FORMULARIO → WHATSAPP ---------- */
  function initForm() {
    var form = $('#formContacto');
    if (!form) return;
    var error = $('.form__error', form);
    function mostrar(msg, campo) {
      if (error) { error.hidden = false; error.textContent = msg; }
      if (campo) { campo.classList.add('is-invalid'); campo.focus(); }
    }
    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); if (error) error.hidden = true; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.elements.nombre.value.trim();
      var servicio = form.elements.servicio.value.trim();
      var tipo = form.elements.tipo.value;
      var mensaje = form.elements.mensaje.value.trim();
      if (!nombre) { mostrar('Cuéntanos tu nombre para saber cómo llamarte.', form.elements.nombre); return; }
      if (!servicio) { mostrar('Elige qué te gustaría ver para armar tu mensaje.', form.elements.servicio); return; }
      if (!WHATSAPP_NUMBER) { mostrar('El envío por WhatsApp aún no está disponible.'); return; }

      var texto = '¡Hola ' + NEGOCIO + '! 👑\nSoy ' + nombre + '.\nMe interesa: ' + servicio + ' (' + tipo + ').';
      if (mensaje) texto += '\n\nMensaje: ' + mensaje;
      var o = orderLines();
      if (o.count > 0) texto += '\n\nTambién armé este pedido en el catálogo:\n' + o.lines.join('\n') + '\nTotal según catálogo: ' + money(o.total) + ' MXN';
      texto += '\n\n¿Me ayudan, por favor? ¡Gracias!';

      var btn = $('[data-submit]', form);
      if (btn) { var r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); }
      var w = window.open(waUrl(texto), '_blank', 'noopener');
      if (!w) window.location.href = waUrl(texto);
    });
  }

  /* ---------- 13. EXTRAS ---------- */
  function initFaq() {
    var det = $$('.qa');
    det.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        det.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  function initCtaBursts() {
    if (reduced) return;
    $$('[data-wa]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var r = a.getBoundingClientRect();
        var px = e.clientX || r.left + r.width / 2;
        var py = e.clientY || r.top + r.height / 2;
        burst(px, py);
      });
    });
  }

  function initFab() {
    var fab = $('.fab');
    if (!fab || !WHATSAPP_NUMBER || coarse) return;
    whenReady(function () {
      setTimeout(function () { fab.classList.add('is-tip'); }, 9000);
      setTimeout(function () { fab.classList.remove('is-tip'); }, 16000);
    });
  }

  function initYear() {
    var y = $('#anio');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- 14. ARRANQUE ---------- */
  function start() {
    safe('cargador', initLoader);
    safe('whatsapp', initWhatsApp);
    safe('encabezado', initHeader);
    try { initReveal(); } catch (err) { root.classList.add('reveal-all'); }
    safe('scroll', initScrollEngine);
    safe('estado', initStatus);
    safe('hero-3d', initHeroStage);
    safe('puntero', initPointerFX);
    safe('catalogo', initCatalog);
    safe('formulario', initForm);
    safe('faq', initFaq);
    safe('chispas', initCtaBursts);
    safe('boton-flotante', initFab);
    safe('anio', initYear);
    safe('particulas-hero', function () { createField($('.hero__field'), { density: 1 }); });
    safe('particulas-contacto', function () { createField($('.contact__field'), { density: 0.8 }); });
  }

  // Si algo se rompe al arrancar, quitamos el modo "con JS" para que todo se vea
  try { start(); } catch (err) {
    root.classList.remove('js', 'fx', 'is-loading');
    var c = $('#cargador');
    if (c) c.style.display = 'none';
  }
})();
