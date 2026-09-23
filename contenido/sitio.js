/* ==========================================================================
   YACHAI — el contenido del sitio, en un solo lugar
   --------------------------------------------------------------------------
   herramientas/construir.js lee este archivo y arma todas las páginas: el
   menú, los servicios, las soluciones por rubro, los precios y el pie.
   Los artículos (Aprende) y los casos NO viven acá: salen del vault de
   Obsidian, de las notas con `web: publicar` en Obsidian/yachai-web/.

   Reglas que este archivo respeta (y que el constructor revisa por código):
   - Sin nombres de clientes ni de familiares: referencias amplias por rubro.
   - El estado de cada servicio es el real, con los niveles del vault
     (herramientas-y-conocimiento/README.md). Nada 🔵 o ⚪ se vende como hecho.
   - Precios "desde": la mitad de la referencia del mercado peruano de 2026,
     para Cusco (decisión del usuario, 2026-09-23: "para Cusco… la mitad,
     para ir mejorando"). Sin IGV.
   ========================================================================== */

const MARCA = {
  que: 'Agencia de inteligencia artificial y marketing',
  corto: 'Agencia de IA y marketing',
  enfasis: 'Asesorías en inteligencia artificial',
};

// REVISAR: cambiar al número nuevo de Yachai cuando exista el chip.
const WA_NUMERO = '51969322677';
const WA_VISIBLE = '+51 969 322 677';
const wa = (texto) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`;

// RUC de persona natural, confirmado por el usuario el 2026-09-23 (el dígito
// final se validó con el algoritmo de SUNAT).
const RUC = '10705854543';

// La oferta de entrada (dictada por el usuario, 2026-09-23): 15 días de
// asesoría gratis, el primer gancho del QR. Corre todo octubre; la asesoría
// vale US$1,000.
// Ojo, Indecopi (precedente de la Resolución 186-2021/CCD): un «precio
// regular» tachado tiene que ser un precio que de verdad se cobra. Por eso no
// se escribe «antes US$1,000», sino lo que es cierto: gratis en octubre y
// desde noviembre cuesta eso.
const ASESORIA = {
  precioTexto: 'US$1,000',
  dias: 15,
  titulo: '15 días de asesoría en IA gratis',
  corto: 'Asesoría gratis',
  texto: '15 días de asesoría en inteligencia artificial: entiendo tu negocio, veo qué se puede automatizar y te entrego un plan con prioridades y costos. Después lo haces conmigo o con quien quieras.',
  vigencia: 'Del 1 al 31 de octubre de 2026.',
  mes: 'octubre',
  despues: 'Desde noviembre, US$1,000',
  // El gancho (dictado 2026-09-23): "que diga te regalamos mil dólares". Va
  // siempre con "en asesoría": sin eso se lee como plata regalada, y eso sí
  // sería engañoso. Vale porque US$1,000 es el precio desde noviembre.
  regalo: 'Te regalamos US$1,000',
  regaloDetalle: '',
  // Lo que explica el regalo: va siempre al lado del titular.
  regaloExplica: '15 días de asesoría en IA y tu web, gratis todo octubre',
  inicioISO: '2026-10-01T00:00:00-05:00',
  finISO: '2026-10-31T23:59:59-05:00',
  pagina: 'asesoria-gratis.html',
  whatsapp: wa('Hola Rodrigo, quiero el regalo de octubre: la asesoría en IA y mi web gratis'),
};

// Lo que incluye el regalo (dictado 2026-09-23): la asesoría gratuita, una
// asesoría complementaria y el inicio de la web gratis.
// - La complementaria cubre lo que se aprende en las mentorías (Marketing y
//   ADS, marca y contenido, ventas, IA en Acción: n8n, agentes, bases de
//   datos, seguridad): "lo necesario para que su empresa escale".
// - La web gratis (solo octubre): el cliente da la web de referencia que le
//   gusta y paga su propio servidor (VPS). "No es tanto como canje."
//   El dominio también lo paga el cliente (confirmado el 2026-09-23). El
//   diseño y la construcción son lo gratis.
const REGALO = [
  { titulo: '15 días de asesoría', mini: '03', texto: 'Entiendo tu negocio, veo qué se puede automatizar y te entrego un plan con prioridades y costos, por escrito.' },
  { titulo: 'Asesoría complementaria', mini: '06', texto: 'Te acompaño en lo que tu negocio necesita para crecer: marketing y anuncios, contenido y marca, ventas, bases de datos, automatización con n8n, agentes de IA y la seguridad de tus bots.' },
  { titulo: 'Tu web, gratis', mini: '04', texto: 'Me pasas una web que te guste como referencia y armamos la tuya sin costo. Lo único que pagas es tu servidor (VPS) y tu dominio, a tu nombre, para que la web sea tuya.' },
];

// REVISAR: URL del webhook de n8n que guarda cada contacto en la base (Baserow).
const REGISTRO_CONTACTOS = null;

// Cupos de la promoción (aceptado por el usuario el 2026-09-23: "ponle eso de
// cupos limitados… está bien"). Es un límite real: lo que se puede atender.
const CUPOS = 10;

// Testimonios reales, cuando lleguen: { texto, quien, rubro, foto? }. Con la
// lista vacía, la sección no aparece. Nunca inventar uno.
const TESTIMONIOS = [];

/* --------------------------------------------------------------------------
   Estados: qué tan hecho está cada servicio. Se muestra tal cual.
   -------------------------------------------------------------------------- */
const ESTADOS = {
  vivo:    { marca: '●', clase: 'vivo' },
  listo:   { marca: '◐', clase: 'listo' },
  prepara: { marca: '○', clase: 'prepara' },
};

/* --------------------------------------------------------------------------
   Servicios. `cara` es el número de la escena del inicio: de ahí salen la
   imagen, el video y la demostración, para no escribirlos dos veces.
   -------------------------------------------------------------------------- */
const SERVICIOS = [
  {
    slug: 'asesoria-en-ia', cara: null, grupo: 'asesoria', destacado: true,
    imagen: 'assets/img/rodrigo.jpg',
    nombre: 'Asesoría en IA y marketing',
    menu: 'Qué automatizar, qué anunciar y en qué orden',
    h1: 'Asesoría en inteligencia artificial y marketing para tu negocio',
    dolor: 'No sé por dónde empezar.',
    entrega: 'Reviso tu negocio contigo y te entrego un plan por escrito: qué automatizar, qué anunciar y en qué orden, con lo que cuesta cada paso.',
    precio: { texto: 'US$1,000 · gratis en octubre', nota: '15 días de asesoría. En octubre es gratis, con solo 10 cupos; desde noviembre cuesta US$1,000.' },
    ctaHref: 'asesoria-gratis.html',
    estado: ['listo', 'Lista para empezar en octubre, con 10 cupos. La doy yo, uno por uno.'],
    incluye: [
      ['Diagnóstico de tu negocio', 'Cómo atiendes, cómo vendes, qué repites y dónde se pierden clientes.'],
      ['Plan por escrito', 'Qué hacer primero, en orden, y cuánto cuesta cada paso.'],
      ['Marketing y anuncios', 'Qué contar, dónde y a quién, para que te encuentren los clientes correctos.'],
      ['Acompañamiento', 'Lo que tu negocio necesita para crecer: contenido, ventas, bases de datos, automatización y seguridad.'],
    ],
    pasos: [
      ['Conversamos', 'Me cuentas tu negocio y qué te quita el tiempo.'],
      ['Reviso contigo', 'Presencial en Cusco o por Meet, a tu ritmo.'],
      ['Te entrego el plan', 'Por escrito. Lo haces conmigo o con quien quieras.'],
    ],
    rubros: ['hotel', 'restaurante', 'consultorio', 'oficina', 'tienda'],
    faq: [
      ['¿Cuánto dura?', '15 días. Al final te quedas con el plan por escrito.'],
      ['¿De verdad es gratis?', 'En octubre sí, con 10 cupos. Desde noviembre cuesta US$1,000.'],
    ],
    mensaje: 'Hola Rodrigo, quiero la asesoría en IA gratis de octubre para mi negocio',
    cta: 'Quiero mi asesoría',
  },
  {
    slug: 'bot-de-whatsapp', cara: '01', grupo: 'atender',
    nombre: 'Bot de WhatsApp',
    menu: 'Atiende, cotiza y agenda las 24 horas',
    h1: 'Un WhatsApp que atiende solo, las 24 horas',
    dolor: 'Me paso el día contestando mensajes.',
    entrega: 'Responde lo que siempre te preguntan, cotiza, agenda y te pasa la conversación cuando hay que cerrar. Tú entras solo cuando hace falta.',
    precio: { desde: 400, nota: 'Bot con botones: respuestas, horarios y agenda simple. Con inteligencia artificial para entender texto libre, desde S/750.' },
    estado: ['listo', 'Listo para construir. El asistente de esta misma web es un bot con botones como el que te armaría.'],
    incluye: [
      ['Las preguntas de siempre, respondidas', 'Precios, horarios, dirección, formas de pago. Lo que hoy contestas veinte veces al día.'],
      ['Agenda y cotizaciones', 'El cliente elige día y hora, o arma su pedido, sin esperar a que tú estés libre.'],
      ['Te pasa la conversación', 'Cuando alguien quiere comprar o tiene un caso raro, el bot te avisa y sigues tú.'],
      ['Tu tono, no el de un robot', 'Los mensajes se escriben con tu forma de hablar y se corrigen contigo antes de salir.'],
    ],
    pasos: [
      ['Listamos las preguntas', 'Revisamos tus chats y juntamos lo que más te preguntan.'],
      ['Armamos las respuestas', 'Botones claros para lo común; tú para lo que no es común.'],
      ['Lo pruebas con clientes reales', 'Corriendo de verdad, y corrigiendo lo que haga falta.'],
    ],
    rubros: ['hotel', 'restaurante', 'consultorio', 'tienda'],
    faq: [
      ['¿Necesito pagarle algo a WhatsApp?', 'Con la app gratis de WhatsApp Business, no. Si el volumen pide la versión de pago de WhatsApp, Meta cobra por mensaje aparte, y te lo explico antes de decidir.'],
      ['¿Y si el bot no sabe responder?', 'Te pasa la conversación. Un bot bien hecho sabe cuándo callarse.'],
      ['¿Lo pueden engañar?', 'Las acciones importantes (cobrar, dar descuentos, cambiar datos) se revisan en el código, no dependen de lo que el cliente escriba. Lo explico en la página de seguridad.'],
    ],
    mensaje: 'Hola Rodrigo, quiero un bot de WhatsApp que atienda mi negocio',
    cta: 'Quiero este bot',
  },
  {
    slug: 'base-de-clientes', cara: '02', grupo: 'ordenar',
    nombre: 'Base de clientes',
    menu: 'Del cuaderno a una base ordenada y tuya',
    h1: 'Tus clientes, del cuaderno a una base ordenada',
    dolor: 'Tengo todo en un cuaderno y en la cabeza.',
    entrega: 'Quién te compró, cuándo, qué y cuánto. Una base con el historial de cada cliente, tuya y no de una app que te la alquila.',
    precio: { desde: 750, nota: 'Incluye pasar tus datos actuales. Un CRM grande con licencias por usuario se cotiza aparte.' },
    estado: ['listo', 'Listo para construir. Más de cinco años trabajando con CRM (HubSpot, Go High Level).'],
    incluye: [
      ['Tu historial, pasado en limpio', 'Del cuaderno, del Excel o de los chats a una sola base.'],
      ['La ficha de cada cliente', 'Visitas, compras, último trabajo, preferencias. Lo que hoy recuerdas tú.'],
      ['Etiquetas y seguimiento', 'Nuevo, en conversación, cliente, por volver. Sabes a quién escribirle hoy.'],
      ['Tuya de verdad', 'La base queda a tu nombre y la puedes descargar cuando quieras.'],
    ],
    pasos: [
      ['Vemos qué datos tienes', 'Cuaderno, Excel, chats: lo que haya, así esté desordenado.'],
      ['Los pasamos a la base', 'Con los campos que tu negocio necesita, no más.'],
      ['Te enseño a usarla', 'Desde el celular, en diez minutos al día.'],
    ],
    rubros: ['consultorio', 'tienda', 'oficina', 'hotel'],
    faq: [
      ['¿Necesito un CRM caro?', 'No para empezar. Con pocos clientes, las etiquetas de WhatsApp Business y una base sencilla alcanzan. El CRM grande se justifica cuando hay volumen.'],
      ['¿Dónde quedan mis datos?', 'En una base a tu nombre. Si un día dejas de trabajar conmigo, te la llevas completa.'],
    ],
    mensaje: 'Hola Rodrigo, quiero pasar mis clientes del cuaderno a una base de datos',
    cta: 'Ordenar mis clientes',
  },
  {
    slug: 'asistentes-automaticos', cara: '03', grupo: 'ordenar',
    nombre: 'Asistentes automáticos',
    menu: 'La tarea de todos los días, hecha sola',
    h1: 'La tarea que haces todos los días, hecha sola',
    dolor: 'Hago lo mismo todos los días.',
    entrega: 'Un asistente que hace esa tarea a la hora que toca y te avisa solo cuando algo necesita tu decisión: plazos, reportes, recordatorios, avisos.',
    precio: { desde: 750, nota: 'Por tarea automatizada. Varias tareas conectadas entre sí se cotizan como proyecto.' },
    estado: ['vivo', 'Funcionando en mi propio sistema: tres asistentes me reportan todos los días a hora fija.'],
    incluye: [
      ['La tarea, a su hora', 'Revisar plazos, armar un reporte, mandar recordatorios: sin que nadie lo dispare.'],
      ['Aviso solo cuando importa', 'Te escribe cuando algo necesita tu decisión, no para contarte que todo está bien.'],
      ['Nada importante sin tu OK', 'Lo que se puede deshacer lo hace solo; lo que no, espera tu aprobación.'],
      ['Registro de lo que hizo', 'Puedes ver qué hizo y cuándo, sin adivinar.'],
    ],
    pasos: [
      ['Elegimos una tarea', 'La que más tiempo te quita y menos criterio necesita.'],
      ['La automatizamos', 'Con reglas claras primero; inteligencia artificial solo donde de verdad hace falta.'],
      ['La miramos juntos', 'Corre a tu lado hasta que confíes en ella.'],
    ],
    rubros: ['oficina', 'consultorio', 'hotel'],
    faq: [
      ['¿Usa inteligencia artificial?', 'Solo cuando hace falta. Si la tarea se resuelve con una regla fija, una regla es más barata y no se equivoca.'],
      ['¿Qué pasa si falla?', 'Te avisa. Un asistente que falla en silencio es peor que no tenerlo, por eso se construye para avisar.'],
    ],
    mensaje: 'Hola Rodrigo, tengo una tarea que hago todos los días y quiero automatizarla',
    cta: 'Automatizar mi tarea',
  },
  {
    slug: 'web-propia', cara: '04', grupo: 'atender', promo: true,
    tipos: [
      ['Landing de una página', 'Para una oferta, un evento o un QR. Desde S/480.'],
      ['Web para restaurantes', 'La carta, las reservas y los pedidos a WhatsApp.'],
      ['Web para hoteles y hospedajes', 'Habitaciones, fotos y reservas directas, sin comisión.'],
      ['Web comercial y catálogo', 'Tus productos con foto y precio, y el pedido a WhatsApp. Desde S/980.'],
      ['Web para agencias', 'Portafolio, casos y un formulario que llega ordenado.'],
      ['Web para consultorios y estudios', 'Servicios, equipo y citas.'],
    ],
    nombre: 'Webs profesionales',
    menu: 'Tu web, tu dominio y tu servidor',
    h1: 'Tu web propia: que te encuentren cuando te buscan',
    dolor: 'No existo en internet.',
    entrega: 'Una web a tu nombre, con tu dominio, rápida en el celular y con los pedidos llegando directo a tu WhatsApp.',
    precio: { desde: 480, nota: 'Web de una página. Con catálogo de productos, desde S/980. Hosting en servidor propio: S/50 al mes. Dominio a tu nombre, al costo.' },
    estado: ['vivo', 'En producción: una tienda con catálogo de 491 productos en web propia, dominio y servidor propio.'],
    incluye: [
      ['Diseño para tu negocio', 'Partimos de una web que te guste y la adaptamos. Te mando una imagen antes de empezar.'],
      ['Pensada para el celular', 'Ahí te van a ver casi todos tus clientes. Se prueba en varios celulares antes de entregarla.'],
      ['Pedidos a tu WhatsApp', 'Cada botón abre un chat contigo con el mensaje ya escrito.'],
      ['Tu dominio, a tu nombre', 'La web es tuya. Si mañana cambias de proveedor, te la llevas.'],
    ],
    pasos: [
      ['Describes tu web', 'Me cuentas cómo la imaginas y te mando una imagen de cómo quedaría.'],
      ['La armo y la ves en tu celular', 'Corregimos sobre el mismo enlace hasta que quede.'],
      ['La publicamos', 'Con tu dominio y en un servidor propio, sin plantillas que se repiten.'],
    ],
    rubros: ['tienda', 'restaurante', 'hotel', 'consultorio'],
    faq: [
      ['¿Cuánto demora?', 'Depende de cuánto tengas listo: fotos, textos, productos. Te doy el plazo exacto en la asesoría, antes de empezar.'],
      ['¿Me sirve la web si vendo por WhatsApp?', 'Sí: la web es donde te encuentran y te creen; el WhatsApp es donde cierras. Una lleva a la otra.'],
      ['¿Qué pasa con el hosting?', 'La alojo en un servidor propio por S/50 al mes, o la puedes llevar a donde quieras. El dominio siempre queda a tu nombre.'],
    ],
    mensaje: 'Hola Rodrigo, quiero una web propia para mi negocio',
    cta: 'Quiero mi web',
  },
  {
    slug: 'publicaciones-automaticas', cara: '05', grupo: 'atender',
    nombre: 'Publicaciones y catálogo',
    menu: 'Publicaciones que salen solas, con tu OK',
    h1: 'Publicaciones que salen solas, con tu aprobación',
    dolor: 'Publico poco, o publico sin orden.',
    entrega: 'Tu catálogo en una base, y las publicaciones armadas solas. Te llegan por WhatsApp para que las apruebes antes de que salga nada.',
    precio: { desde: 1250, nota: 'Incluye ordenar el catálogo. El costo mensual depende de dónde se publique.' },
    estado: ['listo', 'Diseñado y listo para construir, sobre un catálogo real de 491 productos con foto.'],
    incluye: [
      ['Catálogo ordenado', 'Tus productos con foto, precio y categoría en una base.'],
      ['Publicaciones armadas', 'Foto, texto y precio, rotando para que no se repita siempre lo mismo.'],
      ['Aprobación por WhatsApp', 'Te llega la publicación, respondes sí o no. Sin tu sí, no sale.'],
      ['Calendario que se cumple', 'Publicas con constancia aunque tengas un día lleno.'],
    ],
    pasos: [
      ['Ordenamos el catálogo', 'Fotos, precios y categorías en una sola base.'],
      ['Definimos el ritmo', 'Cuántas publicaciones, qué días, qué productos primero.'],
      ['Tú apruebas', 'Cada publicación pasa por tu WhatsApp antes de salir.'],
    ],
    rubros: ['tienda', 'restaurante'],
    faq: [
      ['¿Se publica algo sin que yo lo vea?', 'No. Todo pasa por tu aprobación en WhatsApp.'],
      ['¿Sirve para el menú del día?', 'Sí: el menú se arma con la foto del día y sale a la hora que elijas, con tu OK.'],
    ],
    mensaje: 'Hola Rodrigo, quiero que mis publicaciones salgan solas con mi aprobación',
    cta: 'Ordenar mis publicaciones',
  },
  {
    slug: 'transcripcion-de-audios', cara: '06', grupo: 'ordenar',
    nombre: 'Transcripción de audios',
    menu: 'Reuniones y audios, convertidos en texto',
    h1: 'Tus audios y reuniones, en texto que se puede buscar',
    dolor: 'Tengo horas de audio y papeles sin procesar.',
    entrega: 'Reuniones, clases y audios convertidos en texto ordenado y buscable. Se procesa en tu propia computadora: tus grabaciones no se suben a ningún servicio ajeno.',
    precio: { desde: 30, unidad: 'por hora de audio', nota: 'Si prefieres hacerlo tú, instalo la transcripción en tu computadora y se cotiza aparte.' },
    estado: ['vivo', 'Funcionando: así proceso mis propias clases y reuniones.'],
    incluye: [
      ['Texto completo', 'Todo lo que se dijo, no un resumen que corta lo importante.'],
      ['Ordenado por temas', 'Con títulos y los puntos clave marcados, para encontrar las cosas.'],
      ['Privado', 'Se procesa en una computadora, sin subir el audio a internet.'],
      ['Conectado', 'Cada reunión enlazada con las anteriores del mismo tema.'],
    ],
    pasos: [
      ['Me pasas el audio', 'De WhatsApp, de una grabadora o de una videollamada.'],
      ['Se transcribe y se ordena', 'Con los términos de tu rubro corregidos.'],
      ['Te lo entrego buscable', 'En documentos o en tu propia base de notas.'],
    ],
    rubros: ['oficina', 'consultorio'],
    faq: [
      ['¿Quién escucha mis audios?', 'Nadie más: la transcripción corre en una computadora, no en un servicio en la nube.'],
      ['¿Entiende términos legales o médicos?', 'Se revisan y se corrigen a mano los términos que la máquina entiende mal.'],
    ],
    mensaje: 'Hola Rodrigo, quiero probar la transcripción de audios',
    cta: 'Transcribir mis audios',
  },
  {
    slug: 'bases-de-datos', cara: null, grupo: 'ordenar',
    nombre: 'Bases de datos y herramientas',
    menu: 'Qdrant, Baserow, Notion, Obsidian, n8n',
    h1: 'Tus datos y tus herramientas, ordenados y conectados',
    dolor: 'Tengo la información regada en mil lados.',
    entrega: 'Ordeno tus datos en la herramienta que te sirve —Baserow, Notion, Obsidian o una base con IA como Qdrant— y la conecto con n8n para que trabaje sola.',
    precio: { desde: 750, nota: 'Una base ordenada y conectada. Con un asistente de IA que responde con tus documentos (Qdrant), desde S/2,500.' },
    estado: ['listo', 'Listo para construir: mi propio segundo cerebro corre en Obsidian, conectado con agentes. La parte de IA con Qdrant, en preparación.'],
    demo: 'documentos',
    herramientas: ['Qdrant', 'Baserow', 'Notion', 'Obsidian', 'n8n', 'Claude Code'],
    incluye: [
      ['Tus datos en un solo lugar', 'En Baserow, Notion u Obsidian, según cómo trabajas tú y tu equipo.'],
      ['Conectados con n8n', 'Lo que entra por WhatsApp o por la web se guarda solo, sin copiar a mano.'],
      ['Búsqueda con IA', 'Con Qdrant, un asistente responde con tus documentos y dice de dónde sacó la respuesta.'],
      ['Tuyos', 'A tu nombre, y los puedes descargar cuando quieras.'],
    ],
    pasos: [
      ['Vemos dónde está tu información', 'Cuadernos, Excel, chats, carpetas.'],
      ['Elegimos la herramienta', 'La que tu equipo va a usar de verdad, no la de moda.'],
      ['La conectamos', 'Para que se llene sola y se consulte fácil.'],
    ],
    rubros: ['oficina', 'consultorio', 'hotel', 'tienda'],
    faq: [
      ['¿Qué herramienta me conviene?', 'Depende de cómo trabajas. Baserow es como un Excel que no se rompe; Notion, para equipos que escriben; Obsidian, para ordenar conocimiento; Qdrant, para que una IA busque en tus documentos.'],
      ['¿Qué es Qdrant?', 'Una base de datos que busca por significado, no por palabras exactas. Por eso encuentra la respuesta aunque la pregunta esté dicha de otra forma.'],
    ],
    mensaje: 'Hola Rodrigo, quiero ordenar los datos de mi negocio',
    cta: 'Ordenar mis datos',
  },
  {
    slug: 'aplicaciones-web', cara: null, grupo: 'ordenar',
    nombre: 'Aplicaciones web',
    menu: 'Reservas, paneles y sistemas en el navegador',
    h1: 'Aplicaciones web a medida para tu negocio',
    dolor: 'Necesito un sistema, no solo una página.',
    entrega: 'Sistemas que se usan desde el navegador o el celular: reservas, pedidos, paneles para tu equipo o un portal para tus clientes. Sin instalar nada.',
    precio: { desde: 2500, nota: 'Depende del alcance. Primero la parte más importante funcionando; después crece por partes.' },
    estado: ['listo', 'Listo para construir. Esta misma web se arma sola desde notas, con un sistema propio.'],
    demo: 'panel',
    incluye: [
      ['Funciona en el celular', 'Tu equipo y tus clientes la usan desde el navegador.'],
      ['Usuarios y permisos', 'Cada uno ve y toca solo lo que le corresponde.'],
      ['Conectada', 'Con WhatsApp, tu base de clientes y lo que ya uses.'],
      ['A tu nombre', 'En tu servidor y con tu dominio.'],
    ],
    pasos: [
      ['Definimos lo mínimo', 'La parte que más te sirve, primero.'],
      ['La construyo por partes', 'Ves cada avance en tu celular.'],
      ['Crece con tu negocio', 'Se suma lo que ya demostró que sirve.'],
    ],
    rubros: ['hotel', 'consultorio', 'oficina'],
    faq: [
      ['¿Es lo mismo que una app de celular?', 'Se usa igual desde el celular, pero sin pasar por las tiendas de apps ni instalar nada.'],
      ['¿Quién la mantiene?', 'Queda documentada y a tu nombre. La puedo mantener yo o cualquier programador.'],
    ],
    mensaje: 'Hola Rodrigo, necesito una aplicación web para mi negocio',
    cta: 'Contarte mi idea',
  },
  {
    slug: 'software-a-medida', cara: '07', grupo: 'ordenar',
    nombre: 'Software a medida',
    menu: 'Cuando ninguna herramienta te sirve',
    h1: 'Software a medida, cuando ninguna herramienta te sirve',
    dolor: 'Necesito algo que no existe.',
    entrega: 'Sistemas y aplicaciones hechos para tu negocio, conectados con lo que ya usas. La herramienta se elige después del problema, no al revés.',
    precio: { desde: 2500, nota: 'Depende del alcance. Primero una prueba chica para ver si sirve, después el resto por partes.' },
    estado: ['vivo', 'Funcionando: mi propio sistema de trabajo, con reglas de seguridad impuestas por código.'],
    incluye: [
      ['Hecho para tu proceso', 'Se adapta a cómo trabajas, no al revés.'],
      ['Conectado', 'Con WhatsApp, tu base de clientes, tu web o lo que ya uses.'],
      ['Por partes', 'Ves cada avance en tu celular y lo corregimos sobre la marcha.'],
      ['Documentado', 'Queda escrito cómo funciona, para que no dependas de mí.'],
    ],
    pasos: [
      ['Entendemos el problema', 'Antes de hablar de tecnología.'],
      ['Una prueba chica', 'La parte más importante, funcionando con tu negocio real.'],
      ['Crece por partes', 'Solo lo que ya demostró que sirve.'],
    ],
    rubros: ['oficina', 'hotel', 'tienda'],
    faq: [
      ['¿Con qué tecnología trabajas?', 'n8n, Python, bases de datos, servidor propio y agentes con Claude. Se elige según el problema.'],
      ['¿Y si después quiero cambiar algo?', 'Queda documentado y a tu nombre. Lo puede tocar cualquiera que sepa, no solo yo.'],
    ],
    mensaje: 'Hola Rodrigo, necesito algo a medida y quiero conversarlo',
    cta: 'Contarte mi idea',
  },
  {
    slug: 'clases-de-ia', cara: null, grupo: 'asesoria',
    nombre: 'Clases de IA',
    menu: 'Claude, ChatGPT y Gemini en tu trabajo',
    h1: 'Clases de inteligencia artificial para tu trabajo',
    dolor: 'Quiero aprender a usar IA.',
    entrega: 'Clases prácticas para ti o tu equipo: Claude, ChatGPT y Gemini aplicados a las tareas de todos los días. Sales usándolos, no con apuntes.',
    precio: { desde: 300, nota: 'Por persona, taller práctico. Para equipos, precio por grupo.' },
    estado: ['listo', 'En marcha: introducción a la IA para el equipo de un estudio jurídico.'],
    incluye: [
      ['Con tus tareas reales', 'Traes lo que haces todos los días y lo resolvemos con IA en la clase.'],
      ['Qué herramienta para qué', 'Claude, ChatGPT o Gemini: cuándo conviene cada uno.'],
      ['Qué no hacer', 'Qué datos no poner nunca en una IA, y cómo revisar lo que te responde.'],
      ['Material para después', 'Las instrucciones que armamos quedan contigo.'],
    ],
    pasos: [
      ['Vemos qué haces', 'Qué tareas te quitan más tiempo.'],
      ['Clases prácticas', 'Presenciales en Cusco o por Meet, con tus propios documentos y tareas.'],
      ['Seguimiento', 'Resolvemos las dudas que salgan cuando ya lo estás usando.'],
    ],
    rubros: ['oficina', 'consultorio'],
    faq: [
      ['¿Necesito saber de tecnología?', 'No. Si usas WhatsApp, puedes usar estas herramientas.'],
      ['¿Es seguro poner mis documentos en una IA?', 'Depende del documento y de la herramienta. Eso es lo primero que vemos en la clase.'],
    ],
    mensaje: 'Hola Rodrigo, quiero aprender a usar IA en mi trabajo',
    cta: 'Quiero clases',
  },
  {
    slug: 'seguridad', cara: null, grupo: 'asesoria',
    nombre: 'Seguridad de bots',
    menu: 'Que un cliente tramposo no engañe a tu bot',
    h1: 'Seguro por diseño',
    dolor: 'Me da miedo que engañen a mi bot.',
    entrega: 'Un bot que atiende a tus clientes también puede ser engañado por ellos. Reviso tus bots y automatizaciones, y construyo los míos con candados en el código.',
    precio: { desde: null, nota: 'Revisión de bots y automatizaciones existentes: se cotiza según cuántos sean.' },
    estado: ['prepara', 'En preparación: lo aplico primero en mis propios sistemas, antes de ofrecerlo como revisión.'],
    rubros: ['oficina', 'consultorio', 'hotel'],
    mensaje: 'Hola Rodrigo, quiero revisar la seguridad de mis bots',
    cta: 'Revisar mis bots',
  },
  {
    slug: 'anuncios-meta-ads', cara: null, grupo: 'atender', pagado: true,
    nombre: 'Anuncios en redes',
    menu: 'Facebook e Instagram, con reporte claro',
    h1: 'Anuncios en Facebook e Instagram que sabes si funcionan',
    dolor: 'Invierto en anuncios y no sé si funcionan.',
    entrega: 'Armo tus campañas en Meta, las ajusto cada semana y te llega un reporte simple: cuánto gastaste, cuántos mensajes llegaron y cuánto costó cada uno.',
    precio: { desde: 300, unidad: 'al mes', nota: 'Gestión de campañas. Lo que se invierte en los anuncios lo pagas tú directo a Meta, desde tu cuenta.' },
    estado: ['listo', 'Listo para trabajar. Más de cinco años en marketing.'],
    demo: 'reporte',
    incluye: [
      ['Anuncios que llevan a WhatsApp', 'La persona toca el anuncio y te escribe. Así sabes qué anuncio trajo cada mensaje.'],
      ['El público correcto', 'Gente de Cusco, turistas o el rubro que te sirve, no cualquiera.'],
      ['Reporte en palabras simples', 'Cada semana: cuánto gastaste y qué conseguiste.'],
      ['Tu cuenta, a tu nombre', 'Las campañas y los datos son tuyos, no de la agencia.'],
    ],
    pasos: [
      ['Vemos tu presupuesto', 'Cuánto quieres invertir y qué quieres conseguir.'],
      ['Armamos las campañas', 'Con tus fotos, tus precios y tu forma de hablar.'],
      ['Cada semana, reporte y ajustes', 'Lo que funciona se queda; lo que no, se cambia.'],
    ],
    rubros: ['tienda', 'restaurante', 'hotel'],
    faq: [
      ['¿Cuánto tengo que invertir en anuncios?', 'Lo definimos juntos según tu negocio. Ese dinero va directo a Meta, desde tu cuenta, aparte de la gestión.'],
      ['¿Y si todavía no tengo presupuesto?', 'Empieza por lo que no cuesta mantener: tu web, tu perfil de Google y responder rápido por WhatsApp.'],
    ],
    mensaje: 'Hola Rodrigo, quiero anuncios en Facebook e Instagram para mi negocio',
    cta: 'Quiero anunciar',
  },
  {
    slug: 'videos-con-ia', cara: null, grupo: 'atender', pagado: true,
    video: 'assets/video/05-publicar.mp4', poster: 'assets/img/giro/05-publicar.webp', mini: '05',
    nombre: 'Videos con IA',
    menu: 'Videos para tus redes, sin rodaje',
    h1: 'Videos para tu marca, hechos con inteligencia artificial',
    dolor: 'No tengo videos para mis redes.',
    entrega: 'Videos cortos para tus redes y tu web, hechos con inteligencia artificial a partir de tus productos y tu idea. Sin rodaje y sin actores.',
    precio: { desde: 750, unidad: 'al mes', nota: 'Pack de videos cortos para redes. Un video puntual se cotiza aparte.' },
    estado: ['vivo', 'Funcionando: los videos de las escenas de esta misma web se hicieron así.'],
    incluye: [
      ['Idea y guion', 'Qué mostrar y cómo contarlo en pocos segundos.'],
      ['Imagen y movimiento con IA', 'Escenas que no necesitan cámara ni locación.'],
      ['El formato de cada red', 'Vertical para reels y TikTok, horizontal para tu web.'],
      ['Tus productos, tu estilo', 'Se parte de tus fotos reales, no de imágenes genéricas.'],
    ],
    pasos: [
      ['Me cuentas qué quieres mostrar', 'Un producto, tu local, una promoción.'],
      ['Armo guion e imágenes', 'Te muestro la idea antes de animarla.'],
      ['Te entrego los videos', 'Listos para subir.'],
    ],
    rubros: ['tienda', 'restaurante', 'hotel'],
    faq: [
      ['¿Puedo usar mis propias fotos?', 'Sí, y es lo mejor: la IA parte de tus productos reales.'],
      ['¿Sirve para anuncios?', 'Sí. Se pueden usar en tus campañas de Facebook e Instagram.'],
    ],
    mensaje: 'Hola Rodrigo, quiero videos con IA para mis redes',
    cta: 'Quiero mis videos',
  },
];

const GRUPOS = [
  { id: 'asesoria', titulo: 'Asesoría y aprendizaje' },
  { id: 'atender', titulo: 'Atender y vender' },
  { id: 'ordenar', titulo: 'Ordenar y construir' },
];

/* --------------------------------------------------------------------------
   Soluciones por rubro. Los cinco primeros son los que el usuario eligió
   para empezar (2026-09-22). Cada página tiene contenido propio: nada de
   copiar la misma plantilla cambiando el nombre del rubro.
   `clave` es la del asistente de main.js (RUBROS / PRIMERO).
   -------------------------------------------------------------------------- */
const RUBROS = [
  {
    slug: 'para-hoteles', clave: 'hotel', escena: '01',
    nombre: 'Hoteles y hospedajes', menu: 'Reservas y huéspedes, a cualquier hora',
    h1: 'Automatización para hoteles y hospedajes en Cusco',
    bajada: 'Tus huéspedes escriben a cualquier hora y en cualquier idioma. Que nadie se quede sin respuesta mientras duermes.',
    dolores: [
      ['Preguntan de madrugada', 'El turista escribe desde otro país, con otra hora. Si respondes a la mañana, ya reservó en otro lado.'],
      ['Las mismas preguntas en tres idiomas', 'Traslado del aeropuerto, hora de entrada, cómo llegar a Machu Picchu, qué hacer con la altura.'],
      ['El huésped se va y no vuelve', 'No queda registro de quién vino, qué le gustó ni cuándo pedirle una reseña.'],
    ],
    antesDespues: [
      ['23:40 · Llega un mensaje en inglés preguntando por una doble para mañana.', 'El bot responde en inglés con las habitaciones libres y el precio. Tú lo ves a la mañana, ya confirmado.'],
      ['Un día antes de la llegada, nadie le avisa nada al huésped.', 'Le llega solo un mensaje con la dirección, la hora de entrada y un consejo para la altura.'],
      ['El huésped se va y se pierde el contacto.', 'Queda en tu base, y a los dos días recibe un mensaje pidiéndole una reseña.'],
    ],
    servicios: ['bot-de-whatsapp', 'web-propia', 'asistentes-automaticos', 'base-de-clientes'],
    faq: [
      ['¿El bot atiende en inglés?', 'Sí. Se arma en los idiomas que recibes, y lo que no entiende te lo pasa a ti.'],
      ['¿Reemplaza a Booking o Airbnb?', 'No. Te ayuda a que más reservas lleguen directo a ti, sin comisión, y a atender mejor las que llegan por ahí.'],
    ],
    mensaje: 'Hola Rodrigo, tengo un hotel u hospedaje en Cusco y quiero atender mejor a mis huéspedes',
  },
  {
    slug: 'para-restaurantes', clave: 'restaurante', escena: '05',
    nombre: 'Restaurantes', menu: 'Carta, pedidos y el menú del día',
    h1: 'Automatización para restaurantes en Cusco',
    bajada: 'En la hora punta nadie tiene tiempo de contestar el celular. Que la carta, las reservas y el menú del día salgan solos.',
    dolores: [
      ['El celular suena en plena hora punta', 'Preguntan si hay mesa, si hacen delivery, cuánto cuesta el menú. Y la cocina no para.'],
      ['El menú del día no se publica, o sale tarde', 'Se sube cuando alguien se acuerda, y el cliente ya decidió dónde almorzar.'],
      ['El cliente de siempre no recibe nada', 'No sabes quién viene seguido para avisarle de un plato nuevo o una promoción.'],
    ],
    antesDespues: [
      ['12:30 · Tres personas preguntan por WhatsApp si hay mesa para cuatro.', 'El bot responde con la disponibilidad y anota la reserva. Tú solo la confirmas.'],
      ['El menú del día sale a las 12, si sale.', 'A las 10 te llega la publicación armada con la foto del día. Respondes «sí» y se publica.'],
      ['Un turista escanea la mesa y no hay carta en inglés.', 'El QR abre un asistente con la carta, los precios y las alergias, en su idioma.'],
    ],
    servicios: ['bot-de-whatsapp', 'publicaciones-automaticas', 'web-propia', 'base-de-clientes'],
    faq: [
      ['¿Sirve para delivery?', 'Sí: el pedido llega armado a tu WhatsApp, con dirección y forma de pago.'],
      ['¿Tengo que cambiar mi sistema de caja?', 'No. Esto funciona al lado de lo que ya usas.'],
    ],
    mensaje: 'Hola Rodrigo, tengo un restaurante en Cusco y quiero que la atención por WhatsApp sea más rápida',
  },
  {
    slug: 'para-consultorios', clave: 'consultorio', escena: '02',
    nombre: 'Consultorios', menu: 'Citas, recordatorios e historial',
    h1: 'Automatización para consultorios en Cusco',
    bajada: 'Salud, belleza, estética, odontología o tatuajes: citas que se agendan solas, pacientes que no te dejan plantado.',
    dolores: [
      ['Te dejan plantado', 'La cita se agendó hace dos semanas y nadie la recordó. El horario queda vacío.'],
      ['El historial vive en un cuaderno', 'Qué se le hizo, cuándo volvió, qué prefiere: todo depende de tu memoria.'],
      ['Agendas por chat, a mano', 'Ida y vuelta de mensajes para encontrar un horario que a los dos les sirva.'],
    ],
    antesDespues: [
      ['El paciente escribe «¿tienes cita el jueves?» y esperas un rato libre para responder.', 'El bot le ofrece los horarios libres y agenda. Tú ves la cita en tu calendario.'],
      ['El día anterior nadie confirma nada.', 'Le llega un recordatorio un día antes y otro el mismo día, con opción de reprogramar.'],
      ['El paciente vuelve y hay que preguntarle todo de nuevo.', 'Abres su ficha: visitas anteriores, último trabajo y notas.'],
    ],
    servicios: ['bot-de-whatsapp', 'base-de-clientes', 'asistentes-automaticos', 'web-propia'],
    faq: [
      ['¿Y los datos de salud de mis pacientes?', 'Solo se guarda lo necesario, en una base a tu nombre, y nada sensible viaja por la web pública.'],
      ['¿Qué pasa si el paciente quiere cambiar la cita?', 'El recordatorio trae la opción de reprogramar, y el horario libre vuelve a ofrecerse.'],
    ],
    mensaje: 'Hola Rodrigo, tengo un consultorio en Cusco y quiero agendar y recordar citas automáticamente',
  },
  {
    slug: 'para-estudios-juridicos', clave: 'oficina', escena: '03',
    nombre: 'Estudios jurídicos y contables', menu: 'Plazos, expedientes y reuniones',
    h1: 'Automatización para estudios jurídicos y contables en Cusco',
    bajada: 'Plazos que se revisan uno por uno, reuniones que nadie anota y consultas que se repiten. Que el trabajo repetitivo lo haga un asistente.',
    dolores: [
      ['Los plazos se revisan a mano', 'Cada expediente con su fecha, y la cuenta de días hábiles hecha en la cabeza o en un cuaderno.'],
      ['Las reuniones se pierden', 'Lo que se acordó con el cliente queda en la memoria de quien estuvo.'],
      ['Las mismas consultas, una y otra vez', 'Qué documentos traer, cuánto cuesta, en qué va mi trámite.'],
    ],
    antesDespues: [
      ['Lunes 8 am: repasar a mano qué plazos vencen esta semana.', 'A las 7 am te llega el aviso: qué expediente vence, en cuántos días hábiles, y el borrador listo para revisar.'],
      ['Reunión de una hora con el cliente, y notas a medias.', 'La grabación se convierte en texto ordenado, conectado con el expediente.'],
      ['«¿En qué va mi trámite?», cinco veces al día.', 'El cliente consulta por WhatsApp y recibe el estado, sin interrumpirte.'],
    ],
    servicios: ['asistentes-automaticos', 'transcripcion-de-audios', 'clases-de-ia', 'base-de-clientes'],
    faq: [
      ['¿La IA redacta los escritos?', 'Prepara borradores que tú revisas y firmas. La decisión y la responsabilidad siguen siendo tuyas.'],
      ['¿Qué pasa con la confidencialidad?', 'Los audios se transcriben en una computadora, sin subirlos a internet, y nada sensible viaja por la web.'],
    ],
    mensaje: 'Hola Rodrigo, tengo un estudio en Cusco y quiero automatizar plazos y consultas',
  },
  {
    slug: 'para-tiendas', clave: 'tienda', escena: '04',
    nombre: 'Tiendas y microempresas', menu: 'Ropa, accesorios y tiendas pequeñas',
    h1: 'Automatización para tiendas y microempresas en Cusco',
    bajada: 'Ropa, accesorios, regalos, tiendas pequeñas que venden por WhatsApp y Marketplace. Menos tiempo respondiendo, más tiempo vendiendo.',
    dolores: [
      ['Preguntan precio y talla todo el día', '«¿Precio?», «¿tienes en otra talla?»: las mismas preguntas, mientras atiendes a quien está en la tienda.'],
      ['Tienes cientos de productos y publicas diez', 'Subir fotos una por una no alcanza, y el catálogo no se ve.'],
      ['No te encuentran en Google', 'Quien busca lo que vendes en Cusco encuentra a otro.'],
    ],
    antesDespues: [
      ['Preguntan el precio por Marketplace y respondes cuando puedes.', 'El bot responde precio y tallas al instante, y te pasa al cliente que quiere comprar.'],
      ['Publicas cuando te acuerdas.', 'El catálogo rota solo, con tu aprobación por WhatsApp.'],
      ['Tu tienda no aparece cuando la buscan.', 'Web propia con catálogo, que lleva los pedidos a tu WhatsApp.'],
    ],
    servicios: ['bot-de-whatsapp', 'publicaciones-automaticas', 'web-propia', 'base-de-clientes'],
    faq: [
      ['¿Necesito una tienda en línea con pagos?', 'No para empezar. Un catálogo que lleva el pedido a tu WhatsApp es más simple y ya vende.'],
      ['Vendo bien sin web, ¿para qué la quiero?', 'Para que te encuentren quienes todavía no te conocen, y para que tu catálogo esté visible siempre, no solo cuando publicas.'],
    ],
    mensaje: 'Hola Rodrigo, tengo una tienda y quiero vender más por WhatsApp',
  },
];

// Rubros sin página propia todavía: aparecen en Soluciones con su idea.
const OTROS_RUBROS = [
  ['Agencias de turismo', 'Atención en varios idiomas y reservas que se confirman solas.', 'Hola Rodrigo, tengo una agencia de turismo y quiero automatizar la atención'],
  ['Academias y colegios', 'Matrículas, recordatorios de pago y consultas de padres, respondidas.', 'Hola Rodrigo, tengo una academia y quiero automatizar la atención'],
  ['Agencias de marketing', 'Reportes de campaña que se arman solos y tareas repetidas automatizadas.', 'Hola Rodrigo, tengo una agencia de marketing y quiero automatizar reportes'],
];

/* --------------------------------------------------------------------------
   Cifras que se muestran (verificadas en el vault, 2026-09-22).
   -------------------------------------------------------------------------- */
const CIFRAS = [
  { valor: 3, sufijo: '+', texto: 'Años automatizando' },
  { valor: 5, sufijo: '+', texto: 'Años en marketing y CRM' },
  { valor: 6, sufijo: '+', texto: 'Rubros atendidos' },
  { valor: 491, sufijo: '', texto: 'Productos en un catálogo en línea' },
];

/* --------------------------------------------------------------------------
   Menú principal. `sub` = submenú; `activo` = qué páginas lo marcan como
   la sección actual.
   -------------------------------------------------------------------------- */
const MENU = [
  { texto: 'Servicios', sub: 'servicios', href: 'servicios.html' },
  { texto: 'Soluciones', sub: 'soluciones', href: 'soluciones.html' },
  { texto: 'Aprende IA', sub: 'aprende', href: 'aprende.html' },
  { texto: 'Precios', href: 'precios.html' },
  { texto: 'Casos', href: 'casos.html' },
  { texto: 'Nosotros', href: 'nosotros.html' },
  { texto: 'Contacto', href: 'contacto.html' },
];

// Palabras que nunca pueden salir publicadas (nombres de clientes y
// familiares, identificadores internos, números privados, IP). Si aparecen
// en cualquier página o nota publicada, el constructor se detiene.
const PROHIBIDAS = [
  /famy/i, /true ?ink/i, /zilver/i, /luz marina/i, /florencio/i, /mayumi/i,
  /\bjos[ée]\b/i, /\bcarmen\b/i, /\bvicky\b/i, /inticusco/i, /inticaps/i,
  /993\s?242\s?555/, /967\s?370\s?885/, /145\.223\./,
  /la tribu/i, /juanpe/i, /edu garc[ií]a/i, /diego viegas/i, /jos[uú]e est[ée]vez/i,
  /(sk|pk|rk)-[a-z0-9]{16,}/i, /eyJ[a-zA-Z0-9_-]{20,}/, /N8N_API_KEY|EASYPANEL_TOKEN/,
];

module.exports = {
  MARCA, WA_NUMERO, WA_VISIBLE, wa, RUC, REGISTRO_CONTACTOS, ASESORIA, REGALO, CUPOS, TESTIMONIOS, ESTADOS, SERVICIOS, GRUPOS, RUBROS,
  OTROS_RUBROS, CIFRAS, MENU, PROHIBIDAS,
};
