// Capturas de pantalla de la web en un Chrome con medidas de celular o de escritorio,
// sin dependencias (Node 22+ trae WebSocket). Sirve para revisar la web antes de
// publicarla: mira cómo se ve, avisa si algo se desborda del ancho y lista los
// errores de la consola.
//
// Uso:
//   node herramientas/capturar.js <carpeta-de-salida> '<lista JSON>'
//   cada elemento:  { "p": "index.html", "w": 390, "h": 844, "y": 0, "pagina": false, "espera": 2500,
//                     "nombre": "inicio-celular", "js": "…", "reducido": false }
//     p        página a abrir (ruta relativa a la web)
//     w, h     medidas de la ventana (w < 600 = celular: táctil y con escala 2)
//     y        hasta dónde bajar antes de capturar (px); "fin" = al final de la página
//     pagina   true = captura la página entera, no solo lo que se ve
//     espera   milisegundos a esperar tras cargar (las animaciones del inicio duran ~2 s)
//     js       código que se ejecuta antes de capturar (abrir el menú, tocar un botón…)
//     tras     milisegundos a esperar después de bajar (por defecto 1400; el avance automático del giro actúa al segundo)
//     medir    expresión JS cuyo resultado se imprime
//     reducido true = emula «reducir movimiento» (muestra el estado final, sin animaciones)
//
// Ejemplo:
//   node herramientas/capturar.js "$TEMP/caps" '[{"p":"index.html","w":390,"h":844,"nombre":"inicio-m"}]'
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const RAIZ = path.resolve(__dirname, '..').split(path.sep).join('/') + '/';
const url = (p) => 'file:///' + encodeURI(RAIZ + p);
const PUERTO = 9344;
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-'));
const salida = path.resolve(process.argv[2] || 'capturas');
const lista = JSON.parse(process.argv[3] || '[]');
fs.mkdirSync(salida, { recursive: true });

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=' + PUERTO, '--user-data-dir=' + perfil,
  '--no-first-run', '--allow-file-access-from-files', '--hide-scrollbars', 'about:blank'
], { stdio: 'ignore' });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pend = {}; let consola = [];
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
  for (let k = 0; k < 80; k++) {
    await espera(150);
    try { if (await ev('document.readyState') === 'complete') return; } catch (e) {}
  }
}

(async () => {
  let pags;
  for (let k = 0; k < 40; k++) {
    try { pags = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json(); break; } catch (e) { await espera(250); }
  }
  const pag = pags.find((t) => t.type === 'page');
  ws = new WebSocket(pag.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pend[d.id]) { d.error ? pend[d.id].rej(d.error) : pend[d.id].res(d.result); delete pend[d.id]; return; }
    if (d.method === 'Runtime.exceptionThrown') {
      const x = d.params.exceptionDetails;
      consola.push('EXCEPCIÓN: ' + ((x.exception && x.exception.description) || x.text).split('\n')[0]);
    } else if (d.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(d.params.type)) {
      consola.push(d.params.type.toUpperCase() + ': ' + d.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
    } else if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') {
      consola.push('RED/LOG: ' + d.params.entry.text + ' ' + (d.params.entry.url || '').slice(-80));
    }
  });
  await cmd('Page.enable'); await cmd('Runtime.enable'); await cmd('Log.enable');

  for (const c of lista) {
    const w = c.w || 1440, h = c.h || 900, movil = w < 600;
    consola = [];
    await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: movil ? 2 : 1, mobile: movil });
    await cmd('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: c.reducido ? 'reduce' : 'no-preference' }] });
    await cmd('Page.navigate', { url: url(c.p) }); await cargado();
    await espera(c.espera == null ? 2500 : c.espera);
    if (c.js) { const r = await ev(c.js); if (String(r).startsWith('ERR')) consola.push('js: ' + r); await espera(700); }
    if (c.y != null) {
      await ev(`window.scrollTo({top: ${c.y === 'fin' ? 'document.documentElement.scrollHeight' : Number(c.y)}, behavior: 'instant'}); 1`);
      await espera(c.tras == null ? 1400 : c.tras);
    }
    if (c.medir) console.log('   medir:', await ev(c.medir));
    const medidas = JSON.parse(await ev(`JSON.stringify({
      ancho: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
      alto: document.documentElement.scrollHeight, y: Math.round(scrollY),
      desborda: [].slice.call(document.querySelectorAll('body *')).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.right>document.documentElement.clientWidth+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('.anuncio,.letrero,.rubros__lista,.laptop,table,.articulo,.giro__nodos');}).slice(0,4).map(function(e){return e.tagName.toLowerCase()+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')+' →'+Math.round(e.getBoundingClientRect().right)}),
      fuentes: [].slice.call(document.fonts||[]).filter(function(f){return f.status==='loaded'}).map(function(f){return f.family+' '+f.weight}).slice(0,12)
    })`));
    const nombre = (c.nombre || c.p.replace(/\.html$/, '') + '-' + w) + '.png';
    const pantallazo = await cmd('Page.captureScreenshot', c.pagina
      ? { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(medidas.alto, 9000), scale: 1 } }
      : { format: 'png' });
    fs.writeFileSync(path.join(salida, nombre), Buffer.from(pantallazo.data, 'base64'));
    const avisos = [];
    if (medidas.scroll > medidas.ancho + 1) avisos.push(`⚠ se sale del ancho (${medidas.scroll} > ${medidas.ancho})`);
    if (medidas.desborda.length) avisos.push('⚠ desbordan: ' + medidas.desborda.join(', '));
    console.log(`${nombre.padEnd(34)} ${w}×${h}  alto ${medidas.alto}  y ${medidas.y}  ${avisos.join(' | ') || 'sin desborde'}`);
    if (consola.length) console.log('   consola: ' + [...new Set(consola)].slice(0, 6).join('\n            '));
    if (process.env.FUENTES) console.log('   fuentes cargadas: ' + medidas.fuentes.join(', '));
  }
  ws.close(); chrome.kill();
  process.exit(0);
})().catch((e) => { console.error(e); chrome.kill(); process.exit(1); });
