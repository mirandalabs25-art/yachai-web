// Hoja de contacto: junta un lote de imágenes en una sola captura para REVISARLAS ANTES DE CARGARLAS a la web
// (una miniatura esconde defectos; para los bordes de las poses con alfa, además, hacer zoom a un recorte).
// Necesita ffmpeg en el PATH y nada más.
//
//   node herramientas/hoja-de-contacto.js <salida.png> <columnas> <ancho celda> <alto celda> <img1> <img2> ...
//   ejemplo: node herramientas/hoja-de-contacto.js hoja.png 4 400 400 produccion/imagenes/*.jpg
//
// Receta: Obsidian/resources/aplicar-manual-de-marca-a-una-web.md (paso 20) y ciclo-claude-chatgpt-mejora-continua.md
const { execFileSync } = require('child_process');
const [salida, cols, w, h, ...archivos] = process.argv.slice(2);
const filas = Math.ceil(archivos.length / Number(cols));
const args = ['-hide_banner', '-loglevel', 'error', '-y'];
archivos.forEach((a) => args.push('-i', a));
const partes = archivos.map((_, i) => `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=#202020[v${i}]`);
const entradas = archivos.map((_, i) => `[v${i}]`).join('');
const layout = archivos.map((_, i) => `${(i % Number(cols)) * Number(w)}_${Math.floor(i / Number(cols)) * Number(h)}`).join('|');
const filtro = partes.join(';') + ';' + entradas + `xstack=inputs=${archivos.length}:layout=${layout}:fill=#202020[out]`;
args.push('-filter_complex', filtro, '-map', '[out]', '-frames:v', '1', salida);
execFileSync('ffmpeg', args, { stdio: 'inherit' });
console.log('hoja escrita:', salida, `${cols}x${filas}`, archivos.length, 'imágenes');
