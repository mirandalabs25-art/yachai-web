// Prepara lo que se publica en el artifact para revisar la web desde el celular.
// El host del artifact pone su propio <!doctype>/<html>/<head>/<body>, así que la página
// que se le pasa es el inicio SIN esas etiquetas: <title> corto + los <link> del <head> +
// el contenido del <body>. Las demás páginas y los assets van como archivos acompañantes.
//
// Uso:   node herramientas/preparar-artifact.js <carpeta-de-salida>
// Deja:  <salida>/index.html     la página (fragmento)
//        <salida>/archivos.json  el mapa {ruta: ruta} para el parámetro `files`
// Después, en Claude Code: Artifact publish con file_path = <salida>/index.html, url = el
// enlace de siempre y files = el contenido de archivos.json (más "ruta": null para retirar
// un archivo que ya no exista). Si la publicación se rechaza por «no viste la versión en
// vivo», hay que leer entera la copia guardada que entrega la lectura del artifact.
// Receta completa: Obsidian/resources/aplicar-manual-de-marca-a-una-web.md
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..').split(path.sep).join('/');
const SALIDA = path.resolve(process.argv[2] || 'artifact');

// Lo que la web no usa en ninguna página (o que no debe salir): no se publica.
const EXCLUIR = [
  /^assets\/img\/marca\/iconos\//, /^assets\/img\/marca\/construccion\.json$/,
  /^assets\/img\/marca\/compartir\.png$/, /^assets\/img\/marca\/favicon-(16|32)\.png$/, /^assets\/img\/marca\/isotipo-/,
  /caso-famystore|caso-trueink/,        // capturas con el nombre del cliente: nunca
  /^assets\/img\/diag-/, /chakana/,     // material superado
];

const html = fs.readFileSync(RAIZ + '/index.html', 'utf8');
const cuerpo = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
const enlaces = [...html.match(/<head>([\s\S]*?)<\/head>/)[1].matchAll(/<link [^>]*>/g)].map((m) => m[0]);
// El título del artifact es un nombre (2 a 4 palabras), no un resumen.
const fragmento = '<title>Yachai</title>\n' + enlaces.join('\n') + '\n' + cuerpo.trim() + '\n';
fs.mkdirSync(SALIDA, { recursive: true });
fs.writeFileSync(SALIDA + '/index.html', fragmento);

const lista = fs.readdirSync(RAIZ).filter((f) => f.endsWith('.html') && f !== 'index.html');
(function recorrer(d) {
  for (const e of fs.readdirSync(RAIZ + '/' + d, { withFileTypes: true })) {
    const rel = d + '/' + e.name;
    if (e.isDirectory()) recorrer(rel); else if (!EXCLUIR.some((r) => r.test(rel))) lista.push(rel);
  }
})('assets');
lista.sort();
const mapa = Object.fromEntries(lista.map((p) => [p, p]));
fs.writeFileSync(SALIDA + '/archivos.json', JSON.stringify(mapa));

const mb = lista.reduce((s, p) => s + fs.statSync(RAIZ + '/' + p).size, 0) / 1e6;
console.log(`fragmento ${(fragmento.length / 1024).toFixed(0)} KB · ${lista.length} archivos acompañantes · ${mb.toFixed(1)} MB`);
const faltan = [...new Set([...fragmento.matchAll(/(?:href|src|poster|data-video)="(assets\/[^"?#]+)/g)].map((m) => m[1]).filter((p) => !lista.includes(p) && !/NN\.mp4$/.test(p)))];
console.log(faltan.length ? '⚠ referencias sin archivo: ' + faltan.join(', ') : 'todas las referencias del inicio tienen archivo');
