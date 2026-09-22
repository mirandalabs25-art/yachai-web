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

  var estado = window.YACHAI_HERO;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ======================================================================
     1. Entrada: la chakana se arma
     Los veinte vértices llegan desde donde estaban sueltos y se cierran en
     la cruz. El titular ya sube solo por CSS; la bajada llega detrás.
     ====================================================================== */

  var entrada = gsap.timeline({ delay: 0.15 });
  if (estado) entrada.to(estado, { armado: 1, duration: 2.4, ease: 'expo.inOut' }, 0);
  entrada.from('.hero__bajada', { autoAlpha: 0, y: 18, duration: 1, ease: 'power3.out' }, 0.7);
  entrada.from('.hero__pie', { autoAlpha: 0, duration: 1 }, 1.2);

  /* ======================================================================
     2. Bajar atraviesa la chakana
     Mientras las tarjetas suben sobre el hero, la cruz gira un octavo de
     vuelta y la cámara entra por el hueco del centro.
     ====================================================================== */

  var heroScroll = gsap.timeline({
    scrollTrigger: {
      trigger: '.carrusel',
      start: 'top bottom',   // la primera tarjeta asoma por abajo
      end: 'top top',        // el carrusel llegó arriba
      scrub: 0.8
    }
  });
  if (estado) heroScroll.to(estado, { zoom: 5.5, giro: Math.PI / 4, ease: 'power2.in' }, 0);
  heroScroll
    .to('.hero__texto', { autoAlpha: 0, y: -60, ease: 'power1.in' }, 0)
    // fromTo sin render inmediato: si no, pisa el fundido de entrada del pie.
    .fromTo('.hero__pie', { autoAlpha: 1 }, { autoAlpha: 0, ease: 'none', duration: 0.4, immediateRender: false }, 0)
    .fromTo('.hero__sombra', { '--sombra': 0 }, { '--sombra': 0.75, ease: 'none' }, 0);

  /* ======================================================================
     3. Carrusel: el scroll vertical desfila las tarjetas
     La pista ya la centra main.js (padding lateral). Acá se mueve con
     inercia (scrub) y se detiene en una tarjeta entera (snap).
     ====================================================================== */

  var carrusel = $('.carrusel');
  var fijo = $('.carrusel__fijo');
  var pista = $('.carrusel__pista');
  var fondo = $('.carrusel__fondo');
  var tarjetas = $$('.tarjeta');

  function efectoVentana() {
    // La del centro entera; las de los lados, más chicas y apagadas.
    var medio = window.innerWidth / 2;
    tarjetas.forEach(function (tj) {
      var r = tj.getBoundingClientRect();
      var d = Math.abs((r.left + r.width / 2) - medio) / window.innerWidth;
      tj.style.transform = 'scale(' + Math.max(0.76, 1 - d * 0.54).toFixed(3) + ')';
      tj.style.opacity = Math.max(0.34, 1 - d * 1.3).toFixed(3);
    });
  }

  if (carrusel && pista && fijo && tarjetas.length) {
    var pasos = tarjetas.length - 1;
    gsap.to(pista, {
      x: function () { return -Math.max(0, pista.scrollWidth - fijo.clientWidth); },
      ease: 'none',
      scrollTrigger: {
        trigger: carrusel,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        snap: pasos > 0 ? {
          snapTo: 1 / pasos,
          duration: { min: 0.2, max: 0.6 },
          delay: 0.08,
          ease: 'power2.inOut'
        } : false,
        onUpdate: function (self) {
          if (fondo) fondo.style.setProperty('--opacidad', Math.min(1, self.progress * 1.9).toFixed(3));
        }
      },
      onUpdate: efectoVentana
    });
    efectoVentana();
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
