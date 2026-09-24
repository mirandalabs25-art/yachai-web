// Prueba de navegación en un Chrome de celular, sin dependencias (Node 22+ trae WebSocket).
// Baja al final de una página, abre el menú, toca una sección y mide dónde abre la nueva.
// Uso:  node herramientas/probar-navegacion.js                     (casos por defecto)
//       node herramientas/probar-navegacion.js '[["index.html","precios.html"]]'
//       SIMULAR=1 node herramientas/probar-navegacion.js         (imita al visor del artifact,
//       que conserva el scroll: cada página nueva carga ya bajada a 4000 px)
// Esperado: y = 0 en todas, salvo los enlaces con #ancla. Receta: Obsidian/resources/web-yachai-desde-obsidian.md
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const RAIZ = path.resolve(__dirname, '..').split(path.sep).join('/') + '/';
const url = (p) => 'file:///' + encodeURI(RAIZ + p);
const PUERTO = 9333;
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil,
  '--no-first-run', '--allow-file-access-from-files', 'about:blank'
], { stdio: 'ignore' });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = {}; const eventos = [];
function cmd(method, params = {}) {
  return new Promise((res, rej) => {
    const i = ++id; pend[i] = { res, rej };
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}
async function ev(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return 'ERR ' + JSON.stringify(r.exceptionDetails.exception && r.exceptionDetails.exception.description);
  return r.result.value;
}
async function cargado() {
  for (let k = 0; k < 60; k++) {
    await espera(150);
    try { if (await ev('document.readyState') === 'complete') return; } catch (e) {}
  }
}

(async () => {
  let lista;
  for (let k = 0; k < 40; k++) {
    try { lista = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json(); break; } catch (e) { await espera(250); }
  }
  const pag = lista.find((t) => t.type === 'page');
  ws = new WebSocket(pag.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend[d.id]) { d.error ? pend[d.id].rej(d.error) : pend[d.id].res(d.result); delete pend[d.id]; }
    else if (d.method) eventos.push(d.method);
  });
  await cmd('Page.enable'); await cmd('Runtime.enable');
  if (process.env.SIMULAR) await cmd('Page.addScriptToEvaluateOnNewDocument', { source: "(function(){ if (location.hash) return; var b=function(){ try{ window.scrollTo({top:4000,behavior:'instant'}); }catch(e){} }; document.addEventListener('readystatechange', function(){ if (document.readyState==='interactive') b(); }); window.addEventListener('load', b); })();" });
  await cmd('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  const casos = (process.argv[2] ? JSON.parse(process.argv[2]) : [
    ['index.html', 'precios.html'], ['index.html', 'casos.html'],
    ['servicios.html', 'nosotros.html'], ['precios.html', 'bot-de-whatsapp.html'],
    ['precios.html', 'precios.html']
  ]);
  for (const [desde, hacia] of casos) {
    await cmd('Page.navigate', { url: url(desde) }); await cargado(); await espera(600);
    await ev(`window.scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'}); 1`);
    await espera(1800);
    const antes = await ev('Math.round(scrollY)');
    const clic = await ev(`(function(){
      var b = document.querySelector('.nav__menu'); if (b) b.click();
      var a = [].slice.call(document.querySelectorAll('.nav a')).filter(function(x){ return x.getAttribute('href') === '${hacia}'; })[0];
      if (!a) return 'sin enlace';
      var sub = a.closest('.submenu'); if (sub) { var bt = sub.previousElementSibling; if (bt && bt.click) bt.click(); }
      a.click(); return 'ok';
    })()`);
    await espera(400); await cargado(); await espera(1500);
    const despues = await ev(`JSON.stringify({pagina: location.pathname.split('/').pop(), y: Math.round(scrollY), alto: document.documentElement.scrollHeight, tipo: (performance.getEntriesByType('navigation')[0]||{}).type})`);
    console.log(desde.padEnd(16), '→', hacia.padEnd(22), 'y antes', String(antes).padStart(6), '| clic', clic, '|', despues);
  }
  ws.close(); chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
