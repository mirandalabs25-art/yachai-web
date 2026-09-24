// Genera la página de prompts para ChatGPT (un fragmento HTML para publicar como artifact, con botón de
// «Copiar prompt» y casilla «ya la hice», pensado para usarse desde el celular).
// La fuente de verdad de los prompts es prompts-data.js (grupos, nombres de archivo, formatos, base visual).
// Las familias con hechas:true se muestran plegadas, como ya creadas.
//
//   node herramientas/pedido-de-imagenes/hacer-pagina.js <salida.html>
//   luego: publicar <salida.html> como artifact (el mismo archivo mantiene el mismo enlace)
//
// Receta: Obsidian/resources/ciclo-claude-chatgpt-mejora-continua.md · Pedido vigente: Obsidian/yachai-web/pedido-de-imagenes.md
const fs = require('fs');
const { grupos, noSeHacenConChatGPT, promptCompleto, BASE_ESCENA, BASE_PUMA } = require('./prompts-data.js');

const md = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');

const datos = grupos.map((g) => ({
  id: g.id, base: g.id === 'puma' ? g.base : g.base,
  items: g.items.map((it) => ({ archivo: it.archivo, full: promptCompleto(g, it) })),
}));
const total = grupos.reduce((n, g) => n + g.items.length, 0);
const nuevos = grupos.filter((g) => !g.hechas);
const yaHechos = grupos.filter((g) => g.hechas);
const nNuevos = nuevos.reduce((n, g) => n + g.items.length, 0);
const nHechos = yaHechos.reduce((n, g) => n + g.items.length, 0);
const primeros = nuevos.flatMap((g) => g.items.map((i) => i.archivo));

const tarjeta = (g, it) => `
    <article class="img" id="a-${it.archivo.replace(/\./g, '-')}" data-archivo="${it.archivo}" data-inicial="${g.hechas ? 1 : 0}">
      <div class="img__cab">
        <h3 class="img__arch">${it.archivo}</h3>
        <span class="chip">${it.formato}</span>${it.primero ? '<span class="chip chip--oro">Primero</span>' : ''}${it.opcional ? '<span class="chip">Opcional</span>' : ''}
      </div>
      <p class="img__uso">${md(it.uso)}</p>
      <p class="img__prompt">${md(it.prompt)}</p>
      <div class="img__acc">
        <button type="button" class="copiar" data-g="${g.id}" data-a="${it.archivo}">Copiar prompt</button>
        <label class="hecha"><input type="checkbox" class="hecha__caja" id="h-${it.archivo.replace(/\./g, '-')}"><span>Ya la hice</span></label>
      </div>
    </article>`;

const seccion = (g) => `
  <section class="grupo" id="${g.id}" aria-labelledby="t-${g.id}">
    <div class="grupo__cab">
      <h2 id="t-${g.id}">${md(g.titulo)}</h2>
      <p class="grupo__fmt">${g.items.length} ${g.items.length === 1 ? 'imagen' : 'imágenes'} · ${g.formato}</p>
    </div>
    <p class="grupo__nota">${md(g.nota)}</p>
    <details class="base">
      <summary>Ver la base visual que se agrega a cada prompt</summary>
      <p class="base__texto">${md(g.base)}${g.fondo ? '<br><br>' + md(g.fondo) : ''}${g.cierre ? '<br><br>' + md(g.cierre) : ''}</p>
      <p class="base__nota">El botón «Copiar prompt» de cada imagen ya la incluye.</p>
    </details>
    ${g.items.map((it) => tarjeta(g, it)).join('')}
  </section>`;

const html = `<title>Imágenes de Yachai</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
:root{
  color-scheme:dark;
  --negro:#000000; --carbon:#151515; --grafito:#262626;
  --hueso:#ededea; --gris:#9a9a95; --qori:#f5c518; --azul:#315cff;
  --filete:rgba(237,237,234,.14); --filete-fuerte:rgba(237,237,234,.34);
  --display:'Manrope',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'JetBrains Mono',ui-monospace,Consolas,monospace;
}
*{box-sizing:border-box}
body{margin:0;background:var(--negro);color:var(--hueso);font:400 16px/1.55 var(--display);-webkit-text-size-adjust:100%}
.pagina{max-width:760px;margin:0 auto;padding:clamp(28px,6vw,64px) 16px clamp(56px,10vw,110px)}
h1,h2,h3,p{margin:0}
h1{font-size:clamp(2rem,7vw,2.9rem);font-weight:800;line-height:1.08;letter-spacing:-.025em;text-wrap:balance}
h2{font-size:clamp(1.4rem,4.4vw,1.75rem);font-weight:700;line-height:1.2;letter-spacing:-.015em}
code{font-family:var(--mono);font-size:.86em;background:var(--grafito);padding:1px 6px;border-radius:5px;overflow-wrap:anywhere}
b{font-weight:700}

.cab{display:grid;gap:18px}
.cab__firma{font:500 12px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--qori)}
.lead{color:var(--gris);max-width:58ch;font-size:1.05rem}
.avance{display:grid;gap:10px;margin-top:6px}
.avance__txt{font:500 13px/1 var(--mono);letter-spacing:.04em;color:var(--hueso)}
.avance__barra{height:6px;background:var(--grafito);border-radius:3px;overflow:hidden}
.avance__lleno{height:100%;width:0;background:var(--qori);transition:width .3s}

.pasos{list-style:none;margin:clamp(30px,5vw,44px) 0 0;padding:0;display:grid;gap:0;counter-reset:p}
.pasos li{counter-increment:p;display:grid;grid-template-columns:34px 1fr;gap:12px;padding:16px 0;border-top:1px solid var(--filete)}
.pasos li::before{content:counter(p);font:700 15px/1 var(--mono);color:var(--qori);padding-top:4px}
.pasos b{display:block;margin-bottom:2px}
.pasos span{color:var(--gris)}

.primero{margin-top:clamp(28px,5vw,40px);padding:20px;background:var(--carbon);border-radius:14px}
.primero p{color:var(--gris);margin-top:6px}
.primero ul{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;gap:8px}
.primero a{display:inline-flex;align-items:center;min-height:44px;padding:0 14px;border:1px solid var(--filete-fuerte);border-radius:10px;color:var(--hueso);text-decoration:none;font:500 13px/1 var(--mono)}
.primero a:hover{border-color:var(--qori);color:var(--qori)}

.grupo{margin-top:clamp(44px,8vw,72px)}
.grupo__cab{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 16px}
.grupo__fmt{font:500 12px/1.4 var(--mono);letter-spacing:.06em;color:var(--gris)}
.grupo__nota{color:var(--gris);margin-top:12px;max-width:62ch}
.grupo__nota b{color:var(--hueso)}
.base{margin:16px 0 8px;border:1px solid var(--filete);border-radius:12px;padding:0 16px}
.base summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font-weight:600;font-size:.92rem}
.base__texto{color:var(--gris);font-size:.92rem;padding-bottom:6px}
.base__nota{font:500 12px/1.4 var(--mono);color:var(--qori);padding:6px 0 16px}

.img{padding:22px 0 24px;border-top:1px solid var(--filete);display:grid;gap:10px}
.img__cab{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.img__arch{font:600 15px/1.3 var(--mono);overflow-wrap:anywhere;margin-right:4px}
.chip{font:500 11px/1 var(--mono);letter-spacing:.06em;padding:5px 8px;border:1px solid var(--filete-fuerte);border-radius:6px;color:var(--hueso)}
.chip--oro{background:var(--qori);border-color:var(--qori);color:var(--negro);font-weight:700}
.img__uso{color:var(--gris);font-size:.92rem}
.img__prompt{background:var(--carbon);border-radius:10px;padding:14px 16px;font-size:.96rem;line-height:1.6;overflow-wrap:anywhere}
.img__acc{display:flex;flex-wrap:wrap;align-items:center;gap:10px 20px}
.copiar{min-height:48px;padding:0 20px;border:1px solid var(--qori);background:var(--qori);color:var(--negro);font:700 15px/1 var(--display);border-radius:10px;cursor:pointer;transition:background .16s,color .16s}
.copiar:hover{background:var(--hueso);border-color:var(--hueso)}
.copiar.ok{background:transparent;color:var(--qori)}
.hecha{display:inline-flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;font-size:.95rem}
.hecha__caja{width:22px;height:22px;accent-color:var(--qori);margin:0;cursor:pointer}
.img.listo .img__prompt{opacity:.45}
.img.listo .img__arch{text-decoration:line-through;text-decoration-color:var(--qori)}
:focus-visible{outline:2px solid var(--qori);outline-offset:3px}

.primera{margin-top:clamp(44px,8vw,72px);border-top:1px solid var(--filete-fuerte)}
.primera > summary{cursor:pointer;min-height:56px;display:flex;align-items:center;font-weight:700;font-size:1.05rem;list-style:none}
.primera > summary::-webkit-details-marker{display:none}
.primera > summary::before{content:"+";font:700 18px/1 var(--mono);color:var(--qori);margin-right:12px}
.primera[open] > summary::before{content:"−"}
.aparte{margin-top:clamp(44px,8vw,72px)}
.aparte dl{margin:14px 0 0;display:grid;gap:0}
.aparte div{padding:16px 0;border-top:1px solid var(--filete)}
.aparte dt{font-weight:700}
.aparte dd{margin:4px 0 0;color:var(--gris)}
.pie{margin-top:clamp(40px,7vw,64px);padding-top:18px;border-top:1px solid var(--filete);color:var(--gris);font-size:.88rem}
@media (prefers-reduced-motion:reduce){.avance__lleno,.copiar{transition:none}}
</style>

<main class="pagina">
  <header class="cab">
    <p class="cab__firma">Yachai · pedido de imágenes</p>
    <h1>${nNuevos ? nNuevos + ' imágenes más para crear con ChatGPT' : 'Todo lo pedido está creado'}</h1>
    <p class="lead">${nNuevos ? 'Las ' + nHechos + ' primeras ya están creadas y cargadas en la web (abajo puedes verlas). Estas ' + nNuevos + ' son opcionales, para redes: cada una trae su nombre de archivo, su formato y el prompt listo para copiar, alineado al manual de marca.' : 'Las ' + nHechos + ' imágenes del pedido ya están creadas y cargadas: la web no tiene huecos y las poses de Yachay para redes también llegaron. Abajo quedan los prompts, por si hay que regenerar alguna o crear más.'}</p>
    <div class="avance" aria-live="polite">
      <p class="avance__txt" id="avance-txt">${nHechos} de ${total} hechas</p>
      <div class="avance__barra" aria-hidden="true"><div class="avance__lleno" id="avance-lleno"></div></div>
    </div>
  </header>

  <ol class="pasos">
    <li><div><b>Copia el prompt</b><span>El botón dorado copia el texto completo, con la base visual incluida.</span></div></li>
    <li><div><b>Pégalo en ChatGPT</b><span>En las del puma, adjunta antes las dos imágenes de referencia del kit (se explica en esa sección).</span></div></li>
    <li><div><b>Guarda la imagen con el nombre exacto</b><span>Web: carpeta <code>produccion/imagenes/</code>. Puma: <code>produccion/yachai/</code>. La web las convierte sola.</span></div></li>
  </ol>

  <section class="primero"${nNuevos ? '' : ' hidden'} aria-labelledby="t-primero">
    <h2 id="t-primero">Lo que sigue</h2>
    <p>${nuevos.map((g) => g.resumen).filter(Boolean).join(' ')}</p>
    <ul>${primeros.map((a) => `<li><a href="#a-${a.replace(/\./g, '-')}">${a}</a></li>`).join('')}</ul>
  </section>
${nuevos.map(seccion).join('')}

  <details class="primera"${nNuevos ? '' : ' open'}>
    <summary>${nNuevos ? 'Primera tanda: las ' : 'Las '}${nHechos} imágenes ya creadas, con sus prompts</summary>
${yaHechos.map(seccion).join('')}
  </details>

  <section class="aparte" aria-labelledby="t-aparte">
    <h2 id="t-aparte">Lo que no se le pide a ChatGPT</h2>
    <dl>${noSeHacenConChatGPT.map(([t, d]) => `<div><dt>${md(t)}</dt><dd>${md(d)}</dd></div>`).join('')}</dl>
  </section>

  <p class="pie">Todas las imágenes se publican rotuladas como ilustrativas, generadas con IA: no representan clientes ni resultados reales. La versión de trabajo de este pedido vive en Obsidian: <code>yachai-web/pedido-de-imagenes</code>.</p>
</main>

<script>
(function () {
  var DATA = ${JSON.stringify(datos)};
  var TOTAL = ${total};
  var CLAVE = 'yachai-imagenes-hechas';
  var hechas = {};
  try { hechas = JSON.parse(localStorage.getItem(CLAVE) || '{}') || {}; } catch (e) { hechas = {}; }

  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(hechas)); } catch (e) {} }
  function pintar() {
    var n = 0;
    document.querySelectorAll('.img').forEach(function (art) {
      var a = art.getAttribute('data-archivo');
      var caja = art.querySelector('.hecha__caja');
      var ok = (a in hechas) ? !!hechas[a] : art.getAttribute('data-inicial') === '1';
      caja.checked = ok; art.classList.toggle('listo', ok);
      if (ok) n++;
    });
    document.getElementById('avance-txt').textContent = n + ' de ' + TOTAL + ' hechas';
    document.getElementById('avance-lleno').style.width = (n * 100 / TOTAL) + '%';
  }
  function textoDe(g, a) {
    for (var i = 0; i < DATA.length; i++) if (DATA[i].id === g) {
      for (var j = 0; j < DATA[i].items.length; j++) if (DATA[i].items[j].archivo === a) return DATA[i].items[j].full;
    }
    return '';
  }
  function copiarTexto(txt, boton) {
    var fin = function (bien) {
      var previo = boton.getAttribute('data-txt') || boton.textContent;
      boton.setAttribute('data-txt', previo);
      boton.textContent = bien ? 'Copiado' : 'Selecciona y copia';
      boton.classList.toggle('ok', bien);
      setTimeout(function () { boton.textContent = previo; boton.classList.remove('ok'); }, 1800);
    };
    var respaldo = function () {
      var t = document.createElement('textarea');
      t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      var bien = false;
      try { bien = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); fin(bien);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { fin(true); }, respaldo);
    } else { respaldo(); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.copiar');
    if (b) copiarTexto(textoDe(b.getAttribute('data-g'), b.getAttribute('data-a')), b);
  });
  document.addEventListener('change', function (e) {
    if (!e.target.classList || !e.target.classList.contains('hecha__caja')) return;
    var art = e.target.closest('.img'); var a = art.getAttribute('data-archivo');
    hechas[a] = e.target.checked ? 1 : 0;
    guardar(); pintar();
  });
  pintar();
})();
</script>
`;

fs.writeFileSync(process.argv[2], html);
console.log('página escrita:', process.argv[2], (html.length / 1024).toFixed(0) + ' KB · ' + total + ' imágenes · nuevas: ' + nNuevos + ' · ya hechas: ' + nHechos);
