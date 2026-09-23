/* ==========================================================================
   YACHAI — comportamiento
   Sin librerías: canvas, IntersectionObserver y requestAnimationFrame.
   ========================================================================== */

(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Si GSAP cargó, movimiento.js anima el hero y agrega el imán de la
  // chakana. Si no cargó, este archivo hace todo solo.
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
  var chakana   = document.querySelector('.giro__chakana');
  var pieza     = document.querySelector('.giro__pieza');
  var cabecera  = document.querySelector('.cabecera');
  var caras     = [];
  var giroVivo  = !!(giro && escena && contCaras && chakana && pieza) && !sinMovimiento;

  // Medidas del hueco central de la imagen de la chakana (medidas en el
  // PNG de 1254 px: radio 164 px = 13,1 %; centro 0,8 % arriba del medio).
  // Se usa un poco menos de radio para que el borde quede bajo el aro dorado.
  var HUECO = 0.128, HUECO_Y = -0.0084, INTRO = 0;
  var m = { tramo: 1, tam: 0, hueco: 0, maxR: 0, hy: 0 };

  function leerCaras() {
    caras = contCaras ? Array.prototype.slice.call(contCaras.querySelectorAll('.cara')) : [];
  }

  function medirGiro() {
    if (!giroVivo) return;
    var W = escena.clientWidth, H = escena.clientHeight || window.innerHeight;
    m.tramo = Math.max(1, (giro.offsetHeight - H) / (caras.length + INTRO));
    m.tam = chakana.offsetWidth;
    m.hueco = m.tam * HUECO;
    m.maxR = Math.sqrt(W * W + H * H) / 2 + 40;
    if (cabecera) escena.style.setProperty('--alto-cabecera', cabecera.offsetHeight + 'px');
    escena.style.setProperty('--hx', (W / 2) + 'px');
    m.hy = chakana.offsetTop + m.tam * HUECO_Y;
  }

  function suave(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }

  /* --- video de cada cara: solo si el <article> trae data-video --------- */
  function crearVideo(cara) {
    var src = cara && cara.dataset.video;
    if (!src) return null;
    var v = cara.querySelector('video');
    if (!v) {
      v = document.createElement('video');
      v.className = 'cara__img cara__video';
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'auto';
      v.poster = cara.querySelector('.cara__img').currentSrc || '';
      v.src = src;
      cara.querySelector('.cara__medio').appendChild(v);
    }
    return v;
  }
  function prepararVideo(cara) {
    var v = crearVideo(cara);
    if (!v) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});   // sin autoplay: queda el póster
  }
  function pausarVideo(cara) {
    var v = cara && cara.querySelector('video');
    if (v) v.pause();
  }

  /* --- la demostración de cada cara, paso por paso ---------------------- */
  function correrDemo(cara) {
    var pasos = cara.querySelectorAll('.demo [data-paso]');
    var t = 300;
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

  function pintarGiro() {
    if (!giroVivo) return;
    var W = escena.clientWidth, H = escena.clientHeight || window.innerHeight;
    var y = window.scrollY - giro.offsetTop;   // la sección arranca pegada al hero
    var P = Math.max(0, y / m.tramo);          // 0 … número de caras
    var i = Math.min(caras.length - 1, Math.floor(P));
    var t = Math.min(1, P - i);
    var angulo, escala = 1, op = 1, abierto, activa, hy = null;

    if (i === 0) {
      // Cara 1: se abre desde el hueco de la chakana del hero, sin que
      // aparezca antes la de obsidiana. Esa entra recién al cerrar la cara,
      // para girar hacia la 2.
      angulo = 0;
      activa = caras[0];
      abierto = suave(t / 0.35) * (1 - suave((t - 0.82) / 0.18));
      if (t < 0.5) {
        op = 0;
        hy = H / 2;                            // el centro de la chakana del hero
      } else {
        escala = 1 + abierto * 2.6;
        op = 1 - Math.min(1, abierto * 1.5);
      }
    } else {
      var f = suave(t / 0.25);                 // media vuelta desde la cara anterior
      angulo = (i - 1 + f) * 180;
      activa = f < 0.5 ? caras[i - 1] : caras[i];
      abierto = suave((t - 0.25) / 0.25) * (1 - suave((t - 0.82) / 0.18));
      escala = 1 + abierto * 2.6;              // la cámara entra por el hueco
      op = 1 - Math.min(1, abierto * 1.5);
    }

    var cosA = Math.abs(Math.cos(angulo * Math.PI / 180));
    var ry = (i === 0 && t < 0.5)
      ? abierto * m.maxR
      : m.hueco * escala + abierto * (m.maxR - m.hueco * escala);

    // El fondo negro de la escena entra cuando la cara 1 ya cubre todo: antes
    // se tiene que ver el hero detrás.
    escena.style.setProperty('--fondo', suave((P - 0.25) / 0.1).toFixed(3));
    escena.style.setProperty('--rx', (ry * cosA).toFixed(1) + 'px');
    escena.style.setProperty('--ry', ry.toFixed(1) + 'px');
    escena.style.setProperty('--hy', (hy !== null ? hy : m.hy) + 'px');
    escena.style.setProperty('--velo', abierto.toFixed(3));
    chakana.style.setProperty('--escala', escala.toFixed(3));
    chakana.style.opacity = op.toFixed(3);
    pieza.style.transform = 'rotateY(' + angulo.toFixed(2) + 'deg)';
    // El canto dorado solo existe cuando la pieza está casi de perfil.
    pieza.style.setProperty('--canto', Math.max(0, (0.35 - cosA) / 0.35).toFixed(3));

    mostrar(abierto > 0.001 || i > 0 ? activa : null);
    abrir(abierto > 0.55 ? activa : null);
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
     4. Ideas — ir directo a una cara, y ordenar por rubro
     ----------------------------------------------------------------------
     Tocar una de "las que viste arriba" salta de golpe a esa cara ya
     abierta (sin recorrer las otras). ?cara=04 hace lo mismo desde un
     enlace o un QR. Los botones de rubro son una tabla, no IA (si se
     resuelve con un IF, no se usa un LLM): ordenan las caras de la chakana,
     los atajos y las ideas. ?rubro=hotel los activa desde un QR.
     ====================================================================== */

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
  var botonesRubro = document.querySelectorAll('.rubro');
  var listaDolores = document.querySelector('.ideas__dolores');
  var listaIdeas = document.querySelector('.ideas__lista');

  function saltar(top) {
    // 'instant' y no 'auto': el CSS tiene scroll suave, y un viaje suave
    // por el medio haría girar la chakana por todas las caras.
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

  function ordenar(contenedor, selector, esTuyo, desempate) {
    if (!contenedor) return;
    var lista = Array.prototype.slice.call(contenedor.querySelectorAll(selector));
    lista.sort(function (a, b) {
      var d = (esTuyo(b) ? 1 : 0) - (esTuyo(a) ? 1 : 0);
      return d !== 0 ? d : desempate(a, b);
    });
    lista.forEach(function (el) {
      contenedor.appendChild(el);
      el.classList.toggle('es-tuyo', esTuyo(el));
    });
  }

  function elegirRubro(rubro) {
    if (!PRIMERO.hasOwnProperty(rubro)) return;
    var prioridad = PRIMERO[rubro];
    function puesto(el) {
      var i = prioridad.indexOf(el.dataset.dolor);
      return i >= 0 ? i : 10 + parseInt(el.dataset.dolor, 10);
    }
    function esDolorTuyo(el) { return prioridad.indexOf(el.dataset.dolor) >= 0; }
    function porPuesto(a, b) { return puesto(a) - puesto(b); }

    ordenar(contCaras, '.cara', esDolorTuyo, porPuesto);
    Array.prototype.forEach.call(document.querySelectorAll('.cara'), function (c) {
      c.classList.toggle('cara--tuya', esDolorTuyo(c));
    });
    ordenar(listaDolores, 'li', esDolorTuyo, porPuesto);
    ordenar(listaIdeas, 'li', function (el) {
      return rubro !== 'otro' && (' ' + el.dataset.rubros + ' ').indexOf(' ' + rubro + ' ') >= 0;
    }, function () { return 0; });
    leerCaras();
    Array.prototype.forEach.call(botonesRubro, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.rubro === rubro));
    });
    try { history.replaceState(null, '', '?rubro=' + rubro); } catch (e) {}
    alHacerScroll();
  }

  Array.prototype.forEach.call(botonesRubro, function (b) {
    b.addEventListener('click', function () { elegirRubro(b.dataset.rubro); });
  });

  if (listaDolores) {
    listaDolores.addEventListener('click', function (e) {
      var enlace = e.target.closest('.ideas__dolor');
      if (!enlace) return;
      e.preventDefault();
      irACara(enlace.dataset.dolor);
    });
  }

  // Alto de la cabecera fija: el CSS lo usa como scroll-margin-top, para
  // que al llegar a una sección el título no quede tapado.
  function medirCabecera() {
    if (cabecera) document.documentElement.style.setProperty('--cabecera', cabecera.offsetHeight + 'px');
  }
  medirCabecera();
  window.addEventListener('resize', medirCabecera);

  // Enlaces internos (el menú): si el viaje cruza la chakana, van de golpe.
  // Con scroll suave, la chakana giraría por todas las caras en el camino.
  document.addEventListener('click', function (e) {
    var enlace = e.target.closest('a[href^="#"]');
    if (!enlace || !giroVivo || enlace.classList.contains('ideas__dolor')) return;
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
    var pedidoUrl = new URLSearchParams(location.search);
    if (pedidoUrl.get('rubro')) elegirRubro(pedidoUrl.get('rubro'));
    var caraUrl = pedidoUrl.get('cara');
    if (caraUrl && /^0[1-7]$/.test(caraUrl)) {
      window.addEventListener('load', function () { setTimeout(function () { irACara(caraUrl); }, 60); });
    }
  } catch (e) {}

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
    if (agendaBoton) agendaBoton.href = 'https://wa.me/51969322677?text=' + encodeURIComponent(texto);
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

  /* --- marquesinas: duplicar para que el bucle no corte ------------------ */
  ['.anuncio__pista', '.letrero__pista'].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML += el.innerHTML;
  });

})();
