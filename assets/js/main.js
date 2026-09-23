/* ==========================================================================
   YACHAI — comportamiento
   Sin librerías: canvas, IntersectionObserver y requestAnimationFrame.
   ========================================================================== */

(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Si GSAP cargó, movimiento.js arma la chakana del hero, hace entrar la
  // cámara por su hueco al bajar y agrega el imán que frena en cada escena.
  // Si no cargó, este archivo hace todo solo.
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
     2. Scroll: el hero se apaga y la chakana gira
     ----------------------------------------------------------------------
     La sección .giro es alta y su escena queda fija. El scroll se reparte
     en tramos: una intro (aparece la chakana) y un tramo por cara. En cada
     tramo la chakana da media vuelta (a los 90° cambia la escena que se ve
     por el hueco), el hueco se abre hasta llenar la pantalla, se lee, y se
     vuelve a cerrar. Todo sale de window.scrollY: funciona con o sin GSAP
     (GSAP solo agrega el "imán" que frena en cada cara).
     ====================================================================== */

  var progreso   = document.querySelector('.progreso');
  var hero       = document.querySelector('.hero');
  var heroTexto  = document.querySelector('.hero__texto');
  var heroSombra = document.querySelector('.hero__sombra');

  var giro      = document.querySelector('.giro');
  var escena    = document.querySelector('.giro__escena');
  var contCaras = document.querySelector('.giro__caras');
  var cabecera  = document.querySelector('.cabecera');
  var caras     = [];
  var giroVivo  = !!(giro && escena && contCaras) && !sinMovimiento;

  var INTRO = 0;
  var m = { tramo: 1, maxR: 0 };

  function leerCaras() {
    caras = contCaras ? Array.prototype.slice.call(contCaras.querySelectorAll('.cara')) : [];
  }

  function medirGiro() {
    if (!giroVivo) return;
    var W = escena.clientWidth, H = escena.clientHeight || window.innerHeight;
    m.tramo = Math.max(1, (giro.offsetHeight - H) / (caras.length + INTRO));
    m.maxR = Math.sqrt(W * W + H * H) / 2 + 40;
    if (cabecera) escena.style.setProperty('--alto-cabecera', cabecera.offsetHeight + 'px');
    escena.style.setProperty('--hx', (W / 2) + 'px');
  }

  function suave(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }

  /* --- video de cada cara: solo si el <article> trae data-video ---------
     Tres defensas, porque en celulares reales el autoplay falla por razones
     que el navegador de escritorio no muestra (2026-09-22: "en el celular no
     se ven los videos"):
     1. Si el celular bloquea la reproducción automática (app con visor
        propio, ahorro de batería, modo bajo consumo del iPhone), aparece
        "▶ Ver en movimiento". El primer toque en cualquier parte desbloquea
        todos los videos.
     2. Si el video da error al cargar (típico del iPhone cuando el servidor
        no entrega el archivo por partes), se reintenta bajándolo entero y
        reproduciéndolo desde memoria.
     3. El botón muestra en letra chica el motivo, para poder diagnosticarlo
        desde una captura del celular. */

  function marcarBloqueo(cara, motivo) {
    if (!cara) return;
    cara.classList.add('video-bloqueado');
    var b = cara.querySelector('.cara__play');
    if (!b) {
      b = document.createElement('button');
      b.type = 'button';
      b.className = 'cara__play';
      b.innerHTML = '<span>▶ Ver en movimiento</span><small></small>';
      b.addEventListener('click', function () { desbloquear(); reproducir(cara); });
      cara.querySelector('.cara__cabeza').appendChild(b);
    }
    b.querySelector('small').textContent = motivo || '';
  }

  function crearVideo(cara) {
    var src = cara && cara.dataset.video;
    if (!src) return null;
    var v = cara.querySelector('video');
    if (!v) {
      v = document.createElement('video');
      v.className = 'cara__img cara__video';
      v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', ''); v.setAttribute('disablepictureinpicture', '');
      v.preload = 'auto';
      v.poster = cara.querySelector('.cara__img').currentSrc || '';
      v.addEventListener('playing', function () { cara.classList.remove('video-bloqueado'); });
      v.addEventListener('error', function () {
        var codigo = v.error ? v.error.code : '?';
        if (v.dataset.reintento) { marcarBloqueo(cara, 'error de carga ' + codigo); return; }
        v.dataset.reintento = '1';
        fetch(src).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.blob();
        }).then(function (b) {
          v.src = URL.createObjectURL(b);
          if (cara === caraMostrada) reproducir(cara);
        }).catch(function (e) { marcarBloqueo(cara, 'error ' + codigo + ' · ' + (e && e.message || '')); });
      });
      v.src = src;
      cara.querySelector('.cara__medio').appendChild(v);
    }
    return v;
  }

  function reproducir(cara) {
    var v = crearVideo(cara);
    if (!v) return;
    var p = v.play();
    if (p && p.then) {
      p.then(function () { cara.classList.remove('video-bloqueado'); })
       .catch(function (e) { if (cara === caraMostrada) marcarBloqueo(cara, e && e.name || 'bloqueado'); });
    }
  }
  function prepararVideo(cara) { reproducir(cara); }

  // El primer toque "desbloquea" todos los videos: se reproducen y pausan
  // una vez dentro del gesto, y desde ahí el celular los deja arrancar solos.
  // Solo hace falta si alguno quedó bloqueado; si no, no baja nada de más.
  var desbloqueado = false;
  function desbloquear() {
    if (desbloqueado || !document.querySelector('.cara.video-bloqueado')) return;
    desbloqueado = true;
    caras.forEach(function (c) {
      var v = crearVideo(c);
      if (!v) return;
      var p = v.play();
      if (p && p.then) {
        p.then(function () { if (c !== caraMostrada) v.pause(); }).catch(function () {});
      }
    });
  }
  ['touchend', 'click', 'keydown'].forEach(function (tipo) {
    document.addEventListener(tipo, desbloquear, { passive: true });
  });

  function pausarVideo(cara) {
    var v = cara && cara.querySelector('video');
    if (v) v.pause();
  }

  /* --- la demostración de cada cara, paso por paso ---------------------- */
  function correrDemo(cara, retraso) {
    var pasos = cara.querySelectorAll('.demo [data-paso], .registro[data-paso], .registro [data-paso]');
    // En el celular la demo arranca después de que se vio el video solo.
    var t = retraso || (window.matchMedia('(max-width: 899px)').matches ? 1800 : 300);
    cara._relojes = [];
    Array.prototype.forEach.call(pasos, function (p, k) {
      cara._relojes.push(setTimeout(function () {
        p.classList.add('visible');
        var antes = pasos[k - 1];
        if (antes && antes.hasAttribute('data-fugaz')) antes.classList.remove('visible');
      }, t));
      t += p.hasAttribute('data-fugaz') ? 1000 : 700;
    });
  }
  function detenerDemo(cara) {
    (cara._relojes || []).forEach(clearTimeout);
    cara._relojes = [];
    Array.prototype.forEach.call(cara.querySelectorAll('.demo [data-paso]'), function (p) {
      p.classList.remove('visible');
    });
  }

  var caraMostrada = null, caraAbierta = null;
  function mostrar(cara) {
    if (cara === caraMostrada) return;
    if (caraMostrada) { caraMostrada.classList.remove('es-visible'); pausarVideo(caraMostrada); }
    caraMostrada = cara;
    if (cara) {
      cara.classList.add('es-visible');
      prepararVideo(cara);
      crearVideo(caras[caras.indexOf(cara) + 1]);   // la siguiente se va bajando
    }
  }
  function abrir(cara) {
    if (cara === caraAbierta) return;
    if (caraAbierta) { caraAbierta.classList.remove('abierta'); detenerDemo(caraAbierta); }
    caraAbierta = cara;
    if (cara) { cara.classList.add('abierta'); correrDemo(cara); }
  }

  // La chakanita con puntos que abre y cierra cada escena (pedido del
  // usuario, 2026-09-22: "en vez de ese círculo, una chakanita con puntos").
  // Usa los mismos 20 vértices que la chakana del hero.
  var nodosSvg = document.querySelector('.giro__nodos');
  var contornoSvg = nodosSvg && nodosSvg.querySelector('.giro__contorno');
  var puntosSvg = [];
  if (nodosSvg) {
    var grupo = nodosSvg.querySelector('.giro__puntos');
    CHAKANA.forEach(function () {
      var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', '3');
      grupo.appendChild(c);
      puntosSvg.push(c);
    });
  }

  function pintarGiro() {
    if (!giroVivo) return;
    var W = escena.clientWidth, H = escena.clientHeight || window.innerHeight;
    var y = window.scrollY - giro.offsetTop;
    var P = Math.max(0, y / m.tramo);          // 0 … número de caras
    var i = Math.min(caras.length - 1, Math.floor(P));
    var t = Math.min(1, P - i);

    // Cada escena se abre desde el centro con forma de chakana hasta llenar
    // la pantalla, se lee, y se cierra otra vez en una chakana. La última no
    // se cierra: la sección termina con ella abierta.
    var abre = suave((t - 0.04) / 0.3);
    var cierra = i === caras.length - 1 ? 0 : suave((t - 0.84) / 0.16);
    var abierto = abre * (1 - cierra);

    // Tamaño: con el cuadrado central (±3 unidades) ya cubre toda la
    // pantalla, gire como gire. Giro: en la escena 1 acompaña a la chakana
    // del hero (que gira al bajar); en las demás, un deslizamiento suave de
    // ~20° mientras se abre o se cierra.
    var escalaMax = Math.sqrt(W * W + H * H) / 2 / 3 * 1.06;
    var s = abierto * escalaMax;
    var desdeHero = i === 0 && t < 0.5;
    var ang = desdeHero ? (estado.giro || 0) : (1 - abierto) * 0.35;
    var cos = Math.cos(ang), sen = Math.sin(ang), cx = W / 2, cy = H / 2;
    var pts = CHAKANA.map(function (p) {
      return [cx + (p[0] * cos - p[1] * sen) * s, cy + (p[0] * sen + p[1] * cos) * s];
    });
    var poligono = pts.map(function (q) { return q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px'; }).join(',');

    // Escena 1: el fondo negro entra recién cuando la escena ya cubre todo;
    // antes se ve el hero detrás.
    escena.style.setProperty('--fondo', i === 0 ? suave((t - 0.25) / 0.1).toFixed(3) : '1');
    escena.style.setProperty('--forma', 'polygon(' + poligono + ')');
    escena.style.setProperty('--velo', abierto.toFixed(3));

    // El contorno y los puntos dorados: se ven mientras la chakana se abre o
    // se cierra. En la escena 1, al abrir, no hacen falta: ya están los del hero.
    if (nodosSvg) {
      var verNodos = abierto > 0.002 && abierto < 0.97 && !desdeHero;
      nodosSvg.style.opacity = verNodos ? '1' : '0';
      if (verNodos) {
        contornoSvg.setAttribute('points', pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '));
        puntosSvg.forEach(function (c, k) {
          c.setAttribute('cx', pts[k][0].toFixed(1));
          c.setAttribute('cy', pts[k][1].toFixed(1));
        });
      }
    }

    mostrar(abierto > 0.002 ? caras[i] : null);
    abrir(abierto > 0.55 ? caras[i] : null);
  }

  if (giroVivo) {
    giro.classList.add('giro--vivo');
    leerCaras();
    medirGiro();
    // Las escenas se piden apenas termina de cargar la página, no cuando
    // la cara se abre: así no hay un parpadeo negro en el celular.
    window.addEventListener('load', function () {
      Array.prototype.forEach.call(giro.querySelectorAll('img[loading="lazy"]'), function (im) { im.loading = 'eager'; });
    });
  }

  function pintar() {
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (progreso) progreso.style.transform = 'scaleX(' + (alto > 0 ? window.scrollY / alto : 0) + ')';
    if (sinMovimiento) return;
    pintarGiro();
    if (usaGsap) return;

    // Sin GSAP: el hero se apaga a mano.
    if (hero) {
      var ah = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
      if (heroTexto) {
        heroTexto.style.opacity = String(Math.max(0, 1 - ah * 1.6));
        heroTexto.style.transform = 'translateY(' + (ah * -34).toFixed(1) + 'px)';
      }
      if (heroSombra) heroSombra.style.setProperty('--sombra', (ah * 0.75).toFixed(3));
    }
  }

  var pedido = false;
  function alHacerScroll() {
    if (pedido) return;
    pedido = true;
    window.requestAnimationFrame(function () { pintar(); pedido = false; });
  }

  window.addEventListener('scroll', alHacerScroll, { passive: true });
  window.addEventListener('resize', function () { medirGiro(); alHacerScroll(); });
  window.addEventListener('load', function () { medirGiro(); pintar(); });
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

  /* ======================================================================
     3b. Saltos directos a una escena de la chakana
     ----------------------------------------------------------------------
     El asistente ("Ver cómo se ve"), el menú y el enlace ?cara=04 llevan de
     golpe a esa escena ya abierta. De golpe y no con scroll suave: un viaje
     suave por el medio haría girar la chakana por todas las caras.
     ====================================================================== */

  function saltar(top) {
    try { window.scrollTo({ top: top, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, top); }
  }

  function irACara(dolor) {
    var cara = document.getElementById('cara-' + dolor);
    if (!cara) return;
    if (giroVivo) {
      medirGiro();
      saltar(giro.offsetTop + (INTRO + caras.indexOf(cara) + 0.62) * m.tramo);
      alHacerScroll();
    } else {
      saltar(cara.getBoundingClientRect().top + window.scrollY);
    }
  }

  // Alto de la cabecera fija: el CSS lo usa como scroll-margin-top, para
  // que al llegar a una sección el título no quede tapado.
  function medirCabecera() {
    if (cabecera) document.documentElement.style.setProperty('--cabecera', cabecera.offsetHeight + 'px');
  }
  medirCabecera();
  window.addEventListener('resize', medirCabecera);

  // Enlaces internos (menú, botones del hero): si el viaje cruza la chakana,
  // van de golpe.
  document.addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="#"]');
    if (!enlace || !giroVivo) return;
    var destino = document.getElementById(enlace.getAttribute('href').slice(1));
    if (!destino) return;
    var top = destino === giro ? giro.offsetTop + 0.62 * m.tramo
      : destino.getBoundingClientRect().top + window.scrollY - (cabecera ? cabecera.offsetHeight : 0);
    var g0 = giro.offsetTop, g1 = g0 + giro.offsetHeight, desde = window.scrollY;
    if (destino === giro || (Math.min(desde, top) < g1 && Math.max(desde, top) > g0)) {
      e.preventDefault();
      saltar(Math.max(0, top));
      alHacerScroll();
    }
  });

  try {
    var caraUrl = new URLSearchParams(location.search).get('cara');
    if (caraUrl && /^0[1-7]$/.test(caraUrl)) {
      window.addEventListener('load', function () { setTimeout(function () { irACara(caraUrl); }, 60); });
    }
  } catch (e) {}

  /* ======================================================================
     4. Asistente con botones (la acción principal de la landing del QR)
     ----------------------------------------------------------------------
     Sin IA, a propósito (decisión del 2026-09-22): es una tabla de
     respuestas. Funciona sin servidor, no se equivoca y no se lo puede
     engañar. Lo que la persona deja —nombre, negocio, qué le interesa— sale
     armado a WhatsApp: todavía no hay cuenta de Go High Level para guardarlo
     en un CRM. Todo lo que escribe el visitante se muestra con textContent,
     nunca como HTML.
     ====================================================================== */

  // Datos del sitio (assets/js/datos.js, lo genera herramientas/construir.js
  // desde contenido/sitio.js): así el asistente funciona igual en las
  // páginas que no tienen las escenas del inicio.
  var DATOS = window.YACHAI_DATOS || { servicios: {}, rubros: {}, ideas: [], precios: {}, asesoria: {} };
  var DIAS = DATOS.asesoria.dias || 15;
  var MES = DATOS.asesoria.mes || 'octubre';
  var DESPUES = DATOS.asesoria.despues ? ' ' + DATOS.asesoria.despues + '.' : '';
  // En la página de aterrizaje del QR (data-chat="asesoria") el asistente
  // arranca con el gancho de la asesoría gratis, no con el menú general.
  var MODO = document.body.getAttribute('data-chat') || '';
  var WHATSAPP = 'https://wa.me/' + (DATOS.whatsapp || '51969322677') + '?text=';
  function soles(n) { return 'S/' + Number(n).toLocaleString('en-US'); }

  // Qué problemas de la sección "Qué resuelvo" van primero en cada rubro.
  var PRIMERO = {
    tienda:      ['01', '05', '04', '02'],
    restaurante: ['01', '04', '05', '02'],
    hotel:       ['01', '04', '03', '02'],
    turismo:     ['01', '04', '05', '02'],
    consultorio: ['01', '02', '03', '04'],
    oficina:     ['03', '06', '02', '01'],
    academia:    ['01', '06', '02', '05'],
    agencia:     ['05', '03', '06', '07'],
    otro:        []
  };
  var RUBROS = [
    ['tienda', 'Tienda', 'una tienda'],
    ['restaurante', 'Restaurante', 'un restaurante'],
    ['hotel', 'Hotel', 'un hotel u hospedaje'],
    ['turismo', 'Turismo', 'una agencia de turismo'],
    ['consultorio', 'Consultorio', 'un consultorio o estudio (salud, belleza, tatuajes)'],
    ['oficina', 'Oficina', 'una oficina (abogados, contadores)'],
    ['academia', 'Academia', 'una academia o colegio'],
    ['agencia', 'Agencia', 'una agencia de marketing'],
    ['otro', 'Otro negocio', 'otro negocio']
  ];

  function limpiar(t) { return (t || '').replace(/[«»]/g, '').replace(/\.\s*$/, '').trim(); }
  function tituloDolor(d) {
    var c = document.getElementById('cara-' + d);
    if (c) return limpiar(c.querySelector('.cara__dolor').textContent);
    return DATOS.servicios[d] ? limpiar(DATOS.servicios[d].dolor) : '';
  }
  function entregaDolor(d) {
    var c = document.getElementById('cara-' + d);
    if (c) return c.querySelector('.cara__entrega').textContent.trim();
    return DATOS.servicios[d] ? DATOS.servicios[d].entrega : '';
  }
  function ideasDe(rubro) {
    var lis = document.querySelectorAll('.mas-ideas .ideas__lista li[data-rubros]');
    if (lis.length) {
      return Array.prototype.slice.call(lis)
        .filter(function (li) { return (' ' + li.dataset.rubros + ' ').indexOf(' ' + rubro + ' ') >= 0; })
        .map(function (li) { return limpiar(li.querySelector('.idea__dolor').textContent); });
    }
    return (DATOS.ideas || [])
      .filter(function (i) { return i.rubros.indexOf(rubro) >= 0; })
      .map(function (i) { return i.dolor; });
  }

  var chat = document.querySelector('.chat');
  var registro = chat && chat.querySelector('.chat__registro');
  var opcionesEl = chat && chat.querySelector('.chat__opciones');
  var formulario = chat && chat.querySelector('.chat__formulario');
  var campo = chat && chat.querySelector('.chat__campo');
  var etiqueta = chat && chat.querySelector('.chat__etiqueta');
  var datos = { nombre: '', negocio: '', interes: '', consulta: '' };
  var ocupado = false;
  var pidiendo = '';

  function bajarRegistro() { if (registro) registro.scrollTop = registro.scrollHeight; }

  function burbuja(quien, contenido) {
    var p = document.createElement('div');
    p.className = 'burbuja burbuja--' + (quien === 'yo' ? 'cliente' : 'bot');
    if (typeof contenido === 'string') p.textContent = contenido;
    else p.appendChild(contenido);
    registro.appendChild(p);
    bajarRegistro();
  }

  // Muestra los mensajes del bot uno por uno, con "escribiendo…" entre ellos.
  function decir(mensajes, alTerminar) {
    ocupado = true;
    opcionesEl.innerHTML = '';
    var i = 0;
    (function siguiente() {
      if (i >= mensajes.length) { ocupado = false; if (alTerminar) alTerminar(); return; }
      if (sinMovimiento) { burbuja('bot', mensajes[i++]); siguiente(); return; }
      var puntos = document.createElement('div');
      puntos.className = 'escribiendo';
      puntos.setAttribute('aria-hidden', 'true');
      puntos.innerHTML = '<i></i><i></i><i></i>';
      registro.appendChild(puntos);
      bajarRegistro();
      setTimeout(function () {
        puntos.remove();
        burbuja('bot', mensajes[i++]);
        setTimeout(siguiente, 250);
      }, 650);
    })();
  }

  function ofrecer(lista) {
    opcionesEl.innerHTML = '';
    formulario.hidden = true;
    lista.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat__opcion';
      b.textContent = o[0];
      b.addEventListener('click', function () {
        if (ocupado) return;
        burbuja('yo', o[0]);
        ir(o[1]);
      });
      opcionesEl.appendChild(b);
    });
  }

  function lista(items) {
    var ul = document.createElement('ul');
    items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    return ul;
  }

  // Secciones que viven en otra página: si no están en esta, se va allá.
  var FUERA = { describe: 'contacto.html#describe', agenda: 'contacto.html#agenda', seguro: 'seguridad.html' };
  function saltarA(id) {
    var el = document.getElementById(id);
    if (el) {
      cerrarPanel();
      el.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' });
    } else if (FUERA[id]) {
      location.href = FUERA[id];
    }
  }

  var INICIO = [
    ['Quiero más información', 'info'],
    ['Asesoría gratis', 'asesoria'],
    ['¿Qué le sirve a mi negocio?', 'rubro'],
    ['Quiero una web', 'web'],
    ['Quiero automatizar algo', 'automatizar'],
    ['Quiero aprender IA', 'ia'],
    ['Hacer una consulta', 'consulta'],
    ['Hablar con Rodrigo', 'datos']
  ];

  function ir(destino) {
    if (destino.charAt(0) === '>') {         // ir a otra página del sitio
      location.href = destino.slice(1);
      return;
    }
    if (destino.indexOf('@cara-') === 0) {   // saltar a esa escena de la chakana
      var d = destino.slice(6);
      if (document.getElementById('cara-' + d)) { cerrarPanel(); irACara(d); }
      else if (DATOS.servicios[d]) location.href = DATOS.servicios[d].url;
      return;
    }
    if (destino.charAt(0) === '@') {        // saltar a una sección de la página
      saltarA(destino.slice(1));
      return;
    }
    var partes = destino.split(':');
    switch (partes[0]) {
      case 'inicio':
        decir(['¿Qué más te gustaría saber?'], function () { ofrecer(INICIO); });
        break;
      case 'info':
        datos.interes = datos.interes || 'conocer más de Yachai';
        decir([
          'Yachai es una empresa de automatización e inteligencia artificial nacida en Cusco.',
          'Construimos bots que atienden, bases de datos con tus clientes, webs, agentes que trabajan solos y software a medida. Todo queda a tu nombre.',
          'Tres años automatizando negocios y más de cinco en marketing.'
        ], function () {
          ofrecer([['¿Qué le sirve a mi negocio?', 'rubro'], ['¿Cómo trabajan?', 'como'], ['¿Cuánto cuesta?', 'precio'], ['Dejar mis datos', 'datos']]);
        });
        break;
      case 'como':
        decir([
          'Primero conversamos: me cuentas qué te quita el tiempo.',
          'Después armamos una prueba chica con tu negocio real y, si sirve, lo construimos por partes. Ves cada avance en tu celular.'
        ], function () { ofrecer([['¿Cuánto cuesta?', 'precio'], ['Dejar mis datos', 'datos'], ['Volver al inicio', 'inicio']]); });
        break;
      case 'precio':
        datos.interes = datos.interes || 'un presupuesto';
        decir([
          'Depende de lo que necesites. Como referencia: un bot de WhatsApp desde ' + soles(DATOS.precios['bot-de-whatsapp'] || 400) +
            ' y una web propia desde ' + soles(DATOS.precios['web-propia'] || 480) + '.',
          'Y si la pides en ' + MES + ', tienes ' + DIAS + ' días de asesoría gratis para armar tu plan.'
        ], function () { ofrecer([['Quiero la asesoría gratis', 'asesoria'], ['Ver todos los precios', '>precios.html'], ['Volver al inicio', 'inicio']]); });
        break;
      case 'asesoria':
        datos.interes = 'los ' + DIAS + ' días de asesoría gratis';
        decir([
          'Si la pides en ' + MES + ', tienes ' + DIAS + ' días de asesoría gratis.' + DESPUES,
          DATOS.asesoria.texto || 'Entiendo tu negocio, veo qué se puede automatizar y te entrego un plan con prioridades y costos.'
        ], function () {
          var opciones = [['La quiero', 'datos']];
          if (MODO !== 'asesoria' && DATOS.asesoria.pagina) opciones.push(['Ver qué incluye', '>' + DATOS.asesoria.pagina]);
          ofrecer(opciones.concat([['Ver precios', '>precios.html'], ['Volver al inicio', 'inicio']]));
        });
        break;
      case 'landing':   // la página del QR: el gancho va primero
        datos.interes = 'los ' + DIAS + ' días de asesoría gratis';
        decir([
          'Todo ' + MES + ', tienes ' + DIAS + ' días de asesoría gratis para tu negocio.' + DESPUES,
          'Para empezar, ¿qué negocio tienes?'
        ], function () { ofrecer(RUBROS.map(function (r) { return [r[1], 'es:' + r[0]]; })); });
        break;
      case 'web':
        datos.interes = 'una web para mi negocio';
        decir([
          'Hacemos webs propias: tu dominio, tu servidor y un diseño pensado para tu negocio.',
          'Si quieres, descríbeme cómo la imaginas y te mando una imagen de cómo quedaría.'
        ], function () { ofrecer([['Describir mi web', '@describe'], ['Dejar mis datos', 'datos'], ['Volver al inicio', 'inicio']]); });
        break;
      case 'ia':
        datos.interes = 'clases de IA';
        decir([
          'Damos clases prácticas de IA para ti o tu equipo: Claude, ChatGPT y Gemini aplicados a tu trabajo de todos los días.',
          'Nada de teoría: sales usándolas en tus propias tareas.'
        ], function () { ofrecer([['Quiero clases', 'datos'], ['Volver al inicio', 'inicio']]); });
        break;
      case 'automatizar':
        decir(['¿Cuál de estas te pasa?'], function () {
          ofrecer(['01', '02', '03', '04', '05', '06', '07'].map(function (d) {
            return [tituloDolor(d), 'dolor:' + d];
          }).concat([['Otra cosa', 'datos']]));
        });
        break;
      case 'dolor':
        datos.interes = tituloDolor(partes[1]).toLowerCase();
        decir([entregaDolor(partes[1])], function () {
          var opciones = [['Lo quiero', 'datos']];
          if (document.getElementById('cara-' + partes[1])) opciones.push(['Ver cómo se ve', '@cara-' + partes[1]]);
          if (DATOS.servicios[partes[1]]) opciones.push(['Cómo funciona y precio', '>' + DATOS.servicios[partes[1]].url]);
          ofrecer(opciones.concat([['Ver otra', 'automatizar'], ['Volver al inicio', 'inicio']]));
        });
        break;
      case 'rubro':
        decir(['¿Qué negocio tienes?'], function () {
          ofrecer(RUBROS.map(function (r) { return [r[1], 'es:' + r[0]]; }));
        });
        break;
      case 'es':
        var r = RUBROS.filter(function (x) { return x[0] === partes[1]; })[0];
        datos.negocio = r ? r[2] : '';
        if (partes[1] === 'otro') {
          decir(['Cuéntame tu caso y lo vemos juntos: casi siempre hay algo que se puede automatizar.'], function () { ir('datos'); });
          break;
        }
        var sugerencias = (PRIMERO[partes[1]] || []).slice(0, 3).map(tituloDolor)
          .concat(ideasDe(partes[1]).slice(0, 2));
        if (MODO !== 'asesoria') datos.interes = 'soluciones para ' + datos.negocio;
        decir(['Para ' + datos.negocio + ', esto es lo que más sirve:', lista(sugerencias)].concat(
          MODO === 'asesoria' ? ['En la asesoría vemos cuál conviene primero en tu caso, y cuánto costaría.'] : []
        ), function () {
          var opciones = [[MODO === 'asesoria' ? 'Quiero mi asesoría gratis' : 'Lo quiero', 'datos']];
          var pagina = DATOS.rubros[partes[1]];
          if (pagina) opciones.push(['Ver soluciones para ' + pagina.nombre.toLowerCase(), '>' + pagina.url]);
          else opciones.push(['Ver cómo se ve', '@cara-' + (PRIMERO[partes[1]][0] || '01')]);
          ofrecer(opciones.concat([['Ver otro negocio', 'rubro'], ['Volver al inicio', 'inicio']]));
        });
        break;
      case 'consulta':
        decir(['Cuéntame tu consulta y te respondo por WhatsApp.'], function () {
          pedir('consulta', 'Tu consulta', 'off', 'Ej.: ¿pueden hacer un bot para mi restaurante?');
        });
        break;
      case 'datos':
        decir(['Perfecto. ¿Cómo te llamas?'], function () { pedir('nombre', 'Tu nombre', 'name', ''); });
        break;
    }
  }

  function pedir(que, texto, autocompletar, ejemplo) {
    pidiendo = que;
    opcionesEl.innerHTML = '';
    etiqueta.textContent = texto;
    campo.value = '';
    campo.maxLength = que === 'consulta' ? 400 : 120;
    campo.setAttribute('autocomplete', autocompletar);
    campo.placeholder = ejemplo;
    formulario.hidden = false;
    campo.focus({ preventScroll: true });
  }

  // De dónde llega el mensaje: la página, y ?origen=qr (u otro) si vino de
  // una puerta marcada. Sin CRM todavía, así se sabe qué puerta funciona.
  function origen() {
    var partes = [];
    var p = document.body.getAttribute('data-origen');
    if (p) partes.push('página: ' + p);
    try {
      var o = new URLSearchParams(location.search).get('origen');
      if (o) partes.push('origen: ' + o.replace(/[^\w\s-]/g, '').slice(0, 40));
    } catch (e) {}
    return partes.length ? ' · ' + partes.join(' · ') : '';
  }

  function cerrar() {
    var texto = 'Hola Rodrigo, soy ' + datos.nombre + '.' +
      (datos.negocio ? ' Tengo ' + datos.negocio + '.' : '') +
      (datos.consulta ? ' Mi consulta: ' + datos.consulta : ' Me interesa: ' + (datos.interes || 'conocer más de Yachai') + '.') +
      ' (Te escribo desde la web de Yachai' + origen() + ')';
    var a = document.createElement('a');
    a.className = 'boton boton--qori chat__enviar';
    a.href = WHATSAPP + encodeURIComponent(texto);
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Enviar por WhatsApp';
    decir(['Listo, ' + datos.nombre + '. Toca el botón y tu mensaje me llega por WhatsApp. Ahí seguimos.', a], function () {
      ofrecer([['Volver al inicio', 'inicio']]);
    });
  }

  if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();
      var valor = campo.value.trim().slice(0, pidiendo === 'consulta' ? 400 : 120);
      if (!valor) { campo.focus(); return; }
      formulario.hidden = true;
      burbuja('yo', valor);
      if (pidiendo === 'consulta') {
        datos.consulta = valor;
        if (datos.nombre) { cerrar(); return; }
        decir(['Anotado. ¿Cómo te llamas?'], function () { pedir('nombre', 'Tu nombre', 'name', ''); });
      } else if (pidiendo === 'nombre') {
        datos.nombre = valor;
        if (datos.negocio || datos.consulta) { cerrar(); return; }
        decir(['Gracias, ' + valor + '. ¿Qué negocio tienes?'], function () {
          pedir('negocio', 'Tu negocio', 'organization', 'Ej.: una tienda de ropa en San Blas');
        });
      } else {
        datos.negocio = valor;
        cerrar();
      }
    });
  }

  // Arranca cuando el asistente entra en pantalla (o cuando se abre desde
  // los botones fijos): así el visitante ve cómo escribe.
  var arrancado = false;
  function arrancar(despues) {
    if (arrancado || !registro) return;
    arrancado = true;
    if (MODO === 'asesoria' && !despues) {
      decir(['¡Hola! Soy el asistente de Yachai.'], function () { ir('landing'); });
      return;
    }
    decir(['¡Hola! Soy el asistente de Yachai.', despues ? '' : '¿Qué te gustaría saber?'].filter(Boolean), function () {
      if (despues) despues(); else ofrecer(INICIO);
    });
  }
  // Se revisa con el scroll (y no solo con IntersectionObserver): algunos
  // visores de apps avisan tarde la visibilidad, y así arranca igual.
  function revisarAsistente() {
    if (arrancado || !chat || chat.closest('.panel-asistente')) return;
    var r = chat.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.85 && r.bottom > 0) arrancar();
  }
  if (chat) {
    window.addEventListener('scroll', revisarAsistente, { passive: true });
    window.addEventListener('load', revisarAsistente);
    revisarAsistente();
  }

  /* --- Botones fijos: Asistente · Consultar · WhatsApp --------------------
     Siempre visibles (pedido del usuario, 2026-09-22). "Asistente" y
     "Consultar" abren el chat en una ventana flotante, sin mover la página:
     el mismo chat de la sección se muda a la ventana y vuelve al cerrarla,
     así la conversación no se pierde. */
  var panel = document.getElementById('panel-asistente');
  var marcaChat = document.createComment(' aquí vive el chat cuando el panel está cerrado ');
  if (chat) chat.parentNode.insertBefore(marcaChat, chat);

  function abrirPanel(modo) {
    if (!panel || !chat) return;
    panel.querySelector('.panel-asistente__cuerpo').appendChild(chat);
    panel.hidden = false;
    document.documentElement.classList.add('con-panel');
    Array.prototype.forEach.call(document.querySelectorAll('[data-abrir-asistente]'), function (b) {
      b.setAttribute('aria-expanded', 'true');
    });
    var consulta = modo === 'consulta';
    if (!arrancado) {
      arrancar(consulta ? function () { ir('consulta'); } : null);
    } else if (consulta && !ocupado && pidiendo !== 'consulta') {
      burbuja('yo', 'Quiero hacer una consulta');
      ir('consulta');
    }
    bajarRegistro();
    panel.querySelector('.panel-asistente__cerrar').focus({ preventScroll: true });
  }

  function cerrarPanel() {
    if (!panel || panel.hidden) return;
    marcaChat.parentNode.insertBefore(chat, marcaChat.nextSibling);
    panel.hidden = true;
    document.documentElement.classList.remove('con-panel');
    Array.prototype.forEach.call(document.querySelectorAll('[data-abrir-asistente]'), function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-abrir-asistente]');
    if (b) { e.preventDefault(); abrirPanel(b.getAttribute('data-abrir-asistente')); return; }
    if (e.target.closest('.panel-asistente__cerrar')) cerrarPanel();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarPanel(); });

  /* --- El botón de contacto: uno solo, como el de WhatsApp ----------------
     Pedido del usuario (2026-09-23): "uno solo, no lo partas en tres". Al
     tocarlo pregunta con quién hablar: el asistente Yachai (abre la ventana
     del chat) o Rodrigo directo por WhatsApp. Si el chat está abierto, el
     mismo botón lo cierra. */
  var contacto = document.querySelector('.contacto');
  if (contacto) {
    var contactoBoton = contacto.querySelector('.contacto__boton');
    var globo = contacto.querySelector('.contacto__globo');
    var mostrarGlobo = function (si) {
      globo.hidden = !si;
      contactoBoton.setAttribute('aria-expanded', String(si));
      contacto.classList.toggle('contacto--abierto', si);
    };
    contactoBoton.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel && !panel.hidden) { cerrarPanel(); mostrarGlobo(false); return; }
      mostrarGlobo(globo.hidden);
    });
    // Elegir una opción cierra el globo (la del asistente abre el chat solo,
    // por su data-abrir-asistente).
    globo.addEventListener('click', function (e) {
      if (e.target.closest('a, [data-abrir-asistente]')) mostrarGlobo(false);
    });
    document.addEventListener('click', function (e) {
      if (!globo.hidden && !contacto.contains(e.target)) mostrarGlobo(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !globo.hidden) { mostrarGlobo(false); contactoBoton.focus(); }
    });
  }

  /* ======================================================================
     4b. Describe tu web → WhatsApp
     Hoy la imagen se hace a mano y se envía por WhatsApp; cuando la
     automatización esté lista, este mismo formulario la va a disparar.
     ====================================================================== */

  var describe = document.querySelector('.describe');
  if (describe) {
    var estilo = '';
    var estilos = describe.querySelector('.describe__estilos');
    if (estilos) {
      estilos.addEventListener('click', function (e) {
        var b = e.target.closest('.opcion');
        if (!b) return;
        Array.prototype.forEach.call(estilos.querySelectorAll('.opcion'), function (x) {
          x.setAttribute('aria-pressed', String(x === b));
        });
        estilo = b.textContent.trim();
      });
    }
    describe.addEventListener('submit', function (e) {
      e.preventDefault();
      var negocio = describe.querySelector('[name="negocio"]').value.trim();
      var idea = describe.querySelector('[name="idea"]').value.trim();
      var texto = 'Hola Rodrigo, quiero ver cómo quedaría mi web.' +
        (negocio ? '\nNegocio: ' + negocio : '') +
        (estilo ? '\nEstilo: ' + estilo : '') +
        (idea ? '\nLa imagino así: ' + idea : '');
      // Un enlace y no window.open: con 'noopener', window.open devuelve
      // null siempre y no se puede saber si se abrió.
      var a = document.createElement('a');
      a.href = WHATSAPP + encodeURIComponent(texto);
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  /* ======================================================================
     5. Agenda — arma el mensaje de WhatsApp con el día y la franja
     No muestra horarios disponibles: no están definidos y no se inventan.
     ====================================================================== */

  var agendaDias = document.querySelector('.agenda__dias');
  var agendaMensaje = document.querySelector('.agenda__mensaje');
  var agendaBoton = document.querySelector('.agenda__boton');
  var eleccion = { dia: '', franja: '' };

  function redactar() {
    var texto = 'Hola Rodrigo, quiero agendar una llamada';
    if (eleccion.dia) texto += ' el ' + eleccion.dia;
    if (eleccion.franja) texto += ' ' + eleccion.franja;
    texto += '.';
    if (agendaMensaje) agendaMensaje.textContent = texto;
    if (agendaBoton) agendaBoton.href = WHATSAPP + encodeURIComponent(texto);
  }

  function grupoExclusivo(contenedor, alElegir) {
    contenedor.addEventListener('click', function (e) {
      var b = e.target.closest('.opcion');
      if (!b) return;
      Array.prototype.forEach.call(contenedor.querySelectorAll('.opcion'), function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      alElegir(b);
      redactar();
    });
  }

  if (agendaDias) {
    var corto = new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: 'numeric' });
    var largo = new Intl.DateTimeFormat('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    for (var d = 1; d <= 6; d++) {
      var fecha = new Date();
      fecha.setDate(fecha.getDate() + d);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opcion';
      b.setAttribute('aria-pressed', 'false');
      b.textContent = corto.format(fecha).replace('.', '');
      b.dataset.dia = largo.format(fecha).replace(',', '');
      agendaDias.appendChild(b);
    }
    grupoExclusivo(agendaDias, function (b) { eleccion.dia = b.dataset.dia; });
  }
  var agendaFranjas = document.querySelector('.agenda__franjas');
  if (agendaFranjas) grupoExclusivo(agendaFranjas, function (b) { eleccion.franja = b.dataset.franja; });

  /* --- demostraciones de las páginas interiores ---------------------------
     Las mismas de las escenas del inicio: arrancan cuando entran en
     pantalla, una vez. Sin movimiento, se ven completas desde el principio. */
  var demosPagina = document.querySelectorAll('.demo--animada');
  if (demosPagina.length) {
    if (sinMovimiento || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.demo--animada [data-paso]:not([data-fugaz])'), function (p) {
        p.classList.add('visible');
      });
    } else {
      var vigiaDemo = new IntersectionObserver(function (e) {
        e.forEach(function (x) {
          if (!x.isIntersecting) return;
          vigiaDemo.unobserve(x.target);
          correrDemo(x.target.parentNode, 500);
        });
      }, { threshold: 0.35 });
      Array.prototype.forEach.call(demosPagina, function (d) { vigiaDemo.observe(d); });
    }
  }

  /* --- marquesinas: duplicar para que el bucle no corte ------------------ */
  ['.anuncio__pista', '.letrero__pista'].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML += el.innerHTML;
  });

})();
