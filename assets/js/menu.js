/* ==========================================================================
   YACHAI — menú con submenús
   --------------------------------------------------------------------------
   Criterios (Nielsen Norman Group, estudio del 2026-09-22):
   - Los submenús se abren con clic, no al pasar el mouse: el hover abre y
     cierra solo cuando el cursor cruza en diagonal.
   - La flecha avisa qué abre un submenú; la sección actual se marca.
   - En el celular, un botón que dice «Menú» con palabras (el ícono solo de
     tres rayas se descubre bastante menos), y los submenús como acordeón.
   - Escape y el clic afuera cierran todo; el foco vuelve a donde estaba.
   ========================================================================== */

(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  if (!nav) return;

  var cabecera = document.querySelector('.cabecera');
  var botonMenu = nav.querySelector('.nav__menu');
  var textoMenu = botonMenu && botonMenu.querySelector('.nav__menu-texto');
  var botonesSub = Array.prototype.slice.call(nav.querySelectorAll('.nav__boton'));
  var movil = window.matchMedia('(max-width: 1080px)');
  var esInicio = !document.body.classList.contains('pagina');
  var contenido = document.querySelector('.contenido');

  function algunoAbierto() {
    return botonesSub.some(function (b) { return b.getAttribute('aria-expanded') === 'true'; });
  }

  // En el inicio la cabecera es transparente sobre el hero y las escenas;
  // se oscurece al abrir un menú o al llegar al contenido. En las demás
  // páginas siempre tiene fondo.
  function marcarFondo() {
    if (!cabecera) return;
    var abierto = nav.classList.contains('nav--abierta') || algunoAbierto();
    var pasado = !esInicio || (contenido && contenido.getBoundingClientRect().top < 90);
    cabecera.classList.toggle('con-fondo', !!(abierto || pasado));
  }

  function cerrarSubs(excepto) {
    botonesSub.forEach(function (b) { if (b !== excepto) b.setAttribute('aria-expanded', 'false'); });
    marcarFondo();
  }

  function menuMovil(abrir) {
    if (!botonMenu) return;
    nav.classList.toggle('nav--abierta', abrir);
    botonMenu.setAttribute('aria-expanded', String(abrir));
    if (textoMenu) textoMenu.textContent = abrir ? 'Cerrar' : 'Menú';
    document.documentElement.classList.toggle('con-menu', abrir);
    if (!abrir) cerrarSubs();
    marcarFondo();
  }

  botonesSub.forEach(function (b) {
    b.addEventListener('click', function () {
      var abierto = b.getAttribute('aria-expanded') === 'true';
      cerrarSubs(b);
      b.setAttribute('aria-expanded', String(!abierto));
      marcarFondo();
    });
  });

  if (botonMenu) {
    botonMenu.addEventListener('click', function () {
      menuMovil(!nav.classList.contains('nav--abierta'));
    });
  }

  // Tocar un enlace cierra todo (importa para las anclas de la misma página).
  nav.addEventListener('click', function (e) {
    if (!e.target.closest('a')) return;
    cerrarSubs();
    if (nav.classList.contains('nav--abierta')) menuMovil(false);
  });

  document.addEventListener('click', function (e) {
    if (!movil.matches && !nav.contains(e.target) && algunoAbierto()) cerrarSubs();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var abierto = botonesSub.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
    if (abierto && !movil.matches) { cerrarSubs(); abierto.focus(); return; }
    if (nav.classList.contains('nav--abierta')) { menuMovil(false); botonMenu.focus(); }
  });

  // Al pasar de celular a escritorio (girar la tablet), se empieza limpio.
  var alCambiar = function () { menuMovil(false); cerrarSubs(); };
  if (movil.addEventListener) movil.addEventListener('change', alCambiar);
  else if (movil.addListener) movil.addListener(alCambiar);

  window.addEventListener('scroll', marcarFondo, { passive: true });
  marcarFondo();
})();
