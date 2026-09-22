/* ==========================================================================
   YACHAI — comportamiento
   Sin librerías: canvas, IntersectionObserver y requestAnimationFrame.
   ========================================================================== */

(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Si GSAP cargó, movimiento.js se encarga del scroll (hero y carrusel).
  // Si no cargó, este archivo hace todo solo, como antes.
  var usaGsap = !!(window.gsap && window.ScrollTrigger) && !sinMovimiento;

  // Estado del hero que GSAP anima desde movimiento.js:
  //   armado: 0 = vértices dispersos, 1 = chakana formada
  //   zoom / giro: la cámara que atraviesa la chakana al bajar
  var estado = window.YACHAI_HERO = { armado: usaGsap ? 0 : 1, zoom: 1, giro: 0 };

  /* ======================================================================
     1. Hero generativo — grafo de nodos sobre una chakana
     ----------------------------------------------------------------------
     No hay foto de Rodrigo, y una de banco sería una persona ajena haciendo
     de él. Se dibuja lo que realmente hace: nodos sueltos que se enlazan.
     Los nodos "ancla" están puestos sobre el contorno de una chakana —
     la cruz andina— así que la forma de Cusco se insinúa sin dibujarla.
     ====================================================================== */

  var lienzo = document.getElementById('lienzo');
  var ctx = lienzo && lienzo.getContext ? lienzo.getContext('2d') : null;
  var nodos = [];
  var ancho = 0, alto = 0, dpr = 1;

  // Contorno de la chakana en coordenadas de rejilla (-3..3).
  // Los 20 vertices de la chakana, en orden, centrados en (0,0).
  var CHAKANA = [
    [-1, 5], [1, 5], [1, 3], [3, 3], [3, 1], [5, 1], [5, -1], [3, -1],
    [3, -3], [1, -3], [1, -5], [-1, -5], [-1, -3], [-3, -3], [-3, -1],
    [-5, -1], [-5, 1], [-3, 1], [-3, 3], [-1, 3]
  ];

  function medirLienzo() {
    if (!lienzo) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = lienzo.clientWidth;
    alto = lienzo.clientHeight;
    lienzo.width = Math.floor(ancho * dpr);
    lienzo.height = Math.floor(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var cx = 0, cy = 0, escala = 1;

  function sembrar() {
    if (!lienzo) return;
    nodos = [];
    escala = Math.min(ancho, alto) / 14;
    cx = ancho / 2; cy = alto / 2;

    // Nodos ancla: los vértices de la chakana, más brillantes y quietos.
    // bx/by es su lugar en la chakana (relativo al centro); ox/oy, el punto
    // disperso desde el que llegan cuando la chakana se arma.
    CHAKANA.forEach(function (p) {
      nodos.push({
        x: cx + p[0] * escala, y: cy + p[1] * escala,
        bx: p[0] * escala, by: p[1] * escala,
        ox: (Math.random() - 0.5) * ancho, oy: (Math.random() - 0.5) * alto,
        vx: 0, vy: 0, r: 2.1, ancla: true, fase: Math.random() * 6.28
      });
    });

    // Nodos sueltos: la parte viva. Menos en pantallas chicas.
    var sueltos = ancho < 700 ? 26 : 54;
    for (var i = 0; i < sueltos; i++) {
      nodos.push({
        x: Math.random() * ancho, y: Math.random() * alto,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.1 + 0.5, ancla: false, fase: 0
      });
    }
  }

  var t = 0;
  function dibujar() {
    if (!ctx) return;
    t += 0.006;
    ctx.clearRect(0, 0, ancho, alto);

    var i, j, a, b, dx, dy, d;
    var limite = Math.min(ancho, alto) * 0.19;
    var k = estado.armado, z = estado.zoom;
    var cos = Math.cos(estado.giro), sen = Math.sin(estado.giro);

    // Ubicar las anclas: de su punto disperso a su vértice (armado), y
    // después girar y acercar alrededor del centro (la cámara del scroll).
    for (i = 0; i < CHAKANA.length; i++) {
      a = nodos[i];
      var px = a.ox + (a.bx - a.ox) * k + Math.sin(t + a.fase) * 5;
      var py = a.oy + (a.by - a.oy) * k + Math.cos(t * 0.8 + a.fase) * 5;
      a.x = cx + (px * cos - py * sen) * z;
      a.y = cy + (px * sen + py * cos) * z;
    }

    // El contorno de la chakana, uniendo anclas consecutivas. Sin esto la
    // forma no se lee: quedaban puntos sueltos. Aparece a medida que se arma.
    ctx.strokeStyle = 'rgba(245,197,24,' + (0.30 * k * k).toFixed(3) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (i = 0; i < CHAKANA.length; i++) {
      a = nodos[i];
      if (i === 0) ctx.moveTo(a.x, a.y); else ctx.lineTo(a.x, a.y);
    }
    ctx.closePath();
    ctx.stroke();

    // El hueco del centro, como en el signo de la marca. Al bajar, la
    // cámara lo atraviesa.
    ctx.strokeStyle = 'rgba(245,197,24,' + (0.45 * k * k).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(cx, cy, escala * 1.05 * z, 0, 6.2832);
    ctx.stroke();

    // Enlaces de proximidad, para que los nodos queden encima.
    for (i = 0; i < nodos.length; i++) {
      for (j = i + 1; j < nodos.length; j++) {
        a = nodos[i]; b = nodos[j];
        dx = a.x - b.x; dy = a.y - b.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d > limite) continue;
        var fuerza = 1 - d / limite;
        if (a.ancla && b.ancla) continue;   // ya los une el contorno
        var dorado = false;
        ctx.strokeStyle = dorado
          ? 'rgba(245,197,24,' + (fuerza * 0.5).toFixed(3) + ')'
          : 'rgba(237,237,234,' + (fuerza * 0.16).toFixed(3) + ')';
        ctx.lineWidth = dorado ? 1 : 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (i = 0; i < nodos.length; i++) {
      a = nodos[i];
      if (a.ancla) {
        // Ya ubicadas arriba: respiran alrededor de su vértice, no se van.
        ctx.fillStyle = 'rgba(245,197,24,.92)';
      } else {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > ancho) a.vx *= -1;
        if (a.y < 0 || a.y > alto) a.vy *= -1;
        ctx.fillStyle = 'rgba(237,237,234,.5)';
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, 6.2832);
      ctx.fill();
    }
  }

  function unCuadro() {
    dibujar();
    window.requestAnimationFrame(unCuadro);
  }

  if (ctx) {
    medirLienzo();
    sembrar();
    if (sinMovimiento) {
      dibujar();            // un solo cuadro, quieto
    } else {
      window.requestAnimationFrame(unCuadro);
    }
    window.addEventListener('resize', function () { medirLienzo(); sembrar(); });
  }

  /* ======================================================================
     2. Scroll: hero que se apaga y tarjetas que desfilan
     ====================================================================== */

  var progreso   = document.querySelector('.progreso');
  var hero       = document.querySelector('.hero');
  var heroTexto  = document.querySelector('.hero__texto');
  var heroSombra = document.querySelector('.hero__sombra');
  var carrusel   = document.querySelector('.carrusel');
  var carFijo    = document.querySelector('.carrusel__fijo');
  var carFondo   = document.querySelector('.carrusel__fondo');
  var carPista   = document.querySelector('.carrusel__pista');
  var tarjetas   = document.querySelectorAll('.tarjeta');
  var viaje = 0;

  function medir() {
    if (!carPista || !carFijo || !tarjetas.length) return;
    // Relleno lateral = medio hueco sobrante: la tarjeta activa queda
    // centrada y de las vecinas se asoma solo una franja.
    var margen = Math.max(0, (carFijo.clientWidth - tarjetas[0].offsetWidth) / 2);
    carPista.style.paddingLeft = margen + 'px';
    carPista.style.paddingRight = margen + 'px';
    viaje = Math.max(0, carPista.scrollWidth - carFijo.clientWidth);
  }

  function pintar() {
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (progreso) progreso.style.transform = 'scaleX(' + (alto > 0 ? window.scrollY / alto : 0) + ')';
    if (sinMovimiento || usaGsap) return;

    if (hero) {
      var ah = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      if (heroTexto) {
        heroTexto.style.opacity = String(Math.max(0, 1 - ah * 1.6));
        heroTexto.style.transform = 'translateY(' + (ah * -34).toFixed(1) + 'px)';
      }
      if (heroSombra) heroSombra.style.setProperty('--sombra', (ah * 0.75).toFixed(3));
    }

    if (carrusel && carPista) {
      var recorrido = carrusel.offsetHeight - window.innerHeight;
      var a = recorrido > 0 ? (window.scrollY - carrusel.offsetTop) / recorrido : 0;
      a = Math.min(1, Math.max(0, a));

      carPista.style.transform = 'translate3d(' + (-a * viaje).toFixed(1) + 'px,0,0)';
      if (carFondo) carFondo.style.setProperty('--opacidad', Math.min(1, a * 1.9).toFixed(3));

      // Efecto ventana: la del centro entera, las de los lados achicadas.
      var medio = window.innerWidth / 2;
      Array.prototype.forEach.call(tarjetas, function (tj) {
        var r = tj.getBoundingClientRect();
        var d = Math.abs((r.left + r.width / 2) - medio) / window.innerWidth;
        tj.style.transform = 'scale(' + Math.max(0.76, 1 - d * 0.54).toFixed(3) + ')';
        tj.style.opacity = Math.max(0.34, 1 - d * 1.3).toFixed(3);
      });
    }
  }

  var pedido = false;
  function alHacerScroll() {
    if (pedido) return;
    pedido = true;
    window.requestAnimationFrame(function () { pintar(); pedido = false; });
  }

  window.addEventListener('scroll', alHacerScroll, { passive: true });
  window.addEventListener('resize', function () { medir(); alHacerScroll(); });
  window.addEventListener('load', function () { medir(); pintar(); });
  medir();
  pintar();

  /* ======================================================================
     3. Revelado y cifras
     ====================================================================== */

  var porRevelar = document.querySelectorAll('.revelar');
  if (!('IntersectionObserver' in window) || sinMovimiento) {
    Array.prototype.forEach.call(porRevelar, function (el) { el.classList.add('visible'); });
  } else {
    var vigia = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        if (!x.isIntersecting) return;
        setTimeout(function () { x.target.classList.add('visible'); },
                   parseInt(x.target.dataset.retraso || '0', 10));
        vigia.unobserve(x.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(porRevelar, function (el) { vigia.observe(el); });
  }

  // Solo números reales del vault. Nada inventado.
  var cifras = document.querySelectorAll('[data-cifra]');
  if ('IntersectionObserver' in window && !sinMovimiento) {
    var contador = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        if (!x.isIntersecting) return;
        var el = x.target, fin = parseFloat(el.dataset.cifra), suf = el.dataset.sufijo || '', ini = null;
        function paso(ts) {
          if (ini === null) ini = ts;
          var p = Math.min(1, (ts - ini) / 1200);
          el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) window.requestAnimationFrame(paso);
        }
        window.requestAnimationFrame(paso);
        contador.unobserve(el);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(cifras, function (el) { contador.observe(el); });
  } else {
    Array.prototype.forEach.call(cifras, function (el) {
      el.textContent = el.dataset.cifra + (el.dataset.sufijo || '');
    });
  }

  /* --- marquesinas: duplicar para que el bucle no corte ------------------ */
  ['.anuncio__pista', '.letrero__pista'].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML += el.innerHTML;
  });

})();
