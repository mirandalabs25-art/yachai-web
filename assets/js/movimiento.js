/* ==========================================================================
   YACHAI — movimiento con GSAP + ScrollTrigger
   Corre después de main.js. Si GSAP no cargó o el visitante pidió reducir
   el movimiento, no hace nada y main.js sigue manejando todo como antes.
   ========================================================================== */

(function () {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var estado = window.YACHAI_HERO;

  /* ======================================================================
     1. Entrada: la chakana del hero se arma
     Los veinte vértices llegan desde donde estaban sueltos y se cierran en
     la cruz. El titular ya sube solo por CSS; la bajada llega detrás.
     ====================================================================== */

  var entrada = gsap.timeline({ delay: 0.15 });
  if (estado) entrada.to(estado, { armado: 1, duration: 2.4, ease: 'expo.inOut' }, 0);
  entrada.from('.hero__bajada', { autoAlpha: 0, y: 18, duration: 1, ease: 'power3.out' }, 0.7);
  entrada.from('.hero__pie', { autoAlpha: 0, duration: 1 }, 1.2);

  /* ======================================================================
     2. Bajar atraviesa la chakana del hero
     La cruz gira un octavo de vuelta y la cámara entra por su hueco. En el
     mismo tramo (el 38 % de una pantalla), main.js abre la escena 1 desde
     ese hueco: se entra a la primera cara a través de la chakana de nodos.
     (Corrección del 2026-09-22: antes aparecía primero la chakana de
     obsidiana y daba una vuelta sola; sobraba.)
     ====================================================================== */

  var heroScroll = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '+=38%',
      scrub: 0.6
    }
  });
  if (estado) heroScroll.to(estado, { zoom: 5.5, giro: Math.PI / 4, ease: 'power2.in' }, 0);
  heroScroll
    .to('.hero__texto', { autoAlpha: 0, y: -60, ease: 'power1.in' }, 0)
    // fromTo sin render inmediato: si no, pisa el fundido de entrada del pie.
    .fromTo('.hero__pie', { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', duration: 0.4, immediateRender: false }, 0)
    .fromTo('.hero__sombra', { '--sombra': 0 }, { '--sombra': 0.75, ease: 'none' }, 0);

  /* ======================================================================
     3. La chakana de obsidiana: el imán que frena en cada cara abierta
     El giro lo pinta main.js desde el scroll. Acá solo se agrega el snap:
     al soltar el dedo, la página se acomoda en la cara abierta más cercana.
     ====================================================================== */

  var giro = $('.giro');
  if (giro && giro.classList.contains('giro--vivo')) {
    var nCaras = $$('.cara').length;
    var puntos = [0];
    for (var k = 0; k < nCaras; k++) puntos.push((k + 0.62) / nCaras);
    puntos.push(1);
    ScrollTrigger.create({
      trigger: giro,
      start: 'top top',
      end: 'bottom bottom',
      // directional:false = frena en la cara más cercana, no en la siguiente.
      // Si no, un salto directo terminaba una cara más allá.
      snap: { snapTo: puntos, directional: false, duration: { min: 0.25, max: 0.7 }, delay: 0.12, ease: 'power2.inOut' }
    });
  }

  /* ======================================================================
     4. La banda se enciende palabra por palabra
     ====================================================================== */

  var bandaTexto = $('.banda__texto');
  if (bandaTexto) {
    bandaTexto.classList.remove('revelar');
    bandaTexto.setAttribute('aria-label', bandaTexto.textContent.trim());
    bandaTexto.innerHTML = bandaTexto.textContent.trim().split(/\s+/).map(function (p) {
      return '<span class="palabra" aria-hidden="true">' + p + '</span>';
    }).join(' ');
    gsap.fromTo('.banda__texto .palabra', { opacity: 0.18 }, {
      opacity: 1,
      stagger: 0.12,
      ease: 'none',
      scrollTrigger: { trigger: '.banda', start: 'top 85%', end: 'top 30%', scrub: true }
    });
  }

  /* ======================================================================
     5. Sacsayhuamán en parallax
     ====================================================================== */

  if ($('.cusco__foto')) {
    gsap.fromTo('.cusco__foto', { yPercent: -10, scale: 1.2 }, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: '.cusco', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ======================================================================
     6. El letrero responde al scroll
     Reemplaza la animación CSS por un bucle de GSAP para poder cambiarle la
     velocidad: acelera al bajar rápido y, si se sube, corre al revés.
     ====================================================================== */

  var letrero = $('.letrero__pista');
  if (letrero) {
    // main.js ya duplicó el contenido: -50% es exactamente una vuelta.
    letrero.style.animation = 'none';
    var bucle = gsap.to(letrero, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    // Arrancar "adelantado" para que la marcha atrás no se frene en el tiempo 0.
    bucle.totalTime(28 * 100);
    var sentido = 1;
    ScrollTrigger.create({
      trigger: '.letrero',
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: function (self) {
        sentido = self.direction;
        var v = Math.min(8, 1 + Math.abs(self.getVelocity()) / 250);
        gsap.to(bucle, { timeScale: v * sentido, duration: 0.2, overwrite: true });
        gsap.to(bucle, { timeScale: sentido, duration: 1.2, delay: 0.25, ease: 'power2.out' });
      }
    });
  }

  /* ======================================================================
     7. Cómo trabajo: la línea qori se dibuja al bajar y une los pasos
     ====================================================================== */

  if ($('.pasos')) {
    gsap.fromTo('.pasos', { '--avance': 0 }, {
      '--avance': 1,
      ease: 'none',
      scrollTrigger: { trigger: '.pasos', start: 'top 80%', end: 'bottom 55%', scrub: true }
    });
  }

  /* ======================================================================
     8. Seguro por diseño: el registro aparece línea por línea, como si
     estuviera pasando — el intento, la propuesta, el rechazo, la respuesta.
     ====================================================================== */

  if ($('.registro')) {
    gsap.from('.registro__linea', {
      autoAlpha: 0,
      x: -10,
      duration: 0.45,
      stagger: 0.7,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.registro', start: 'top 75%', once: true }
    });
  }

  // Las tipografías y las imágenes cambian los altos: recalcular al final.
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
