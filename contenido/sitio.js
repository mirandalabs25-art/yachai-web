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
   - Precios: referencia de mercado del 2026-09-22, "desde". El usuario los
     pidió así; se confirman con él (ver REVISAR en precios).
   ========================================================================== */

// REVISAR: cambiar al número nuevo de Yachai cuando exista el chip.
const WA_NUMERO = '51969322677';
const WA_VISIBLE = '+51 969 322 677';
const wa = (texto) => `https://wa.me/${WA_NUMERO}?text=${encodeURIComponent(texto)}`;

// La oferta de entrada (dictada por el usuario, 2026-09-22): asesoría de una
// semana, gratis por lanzamiento; después cuesta S/600.
const ASESORIA = {
  precio: 600,
  titulo: 'Asesoría gratis por lanzamiento',
  corto: 'Asesoría gratis',
  texto: 'Una semana de asesoría: entiendo tu negocio, veo qué se puede automatizar y te entrego un plan con prioridades y costos. Después la usas conmigo o con quien quieras.',
  // REVISAR: fechas exactas de la promoción (del __ al __).
  vigencia: 'Promoción de lanzamiento, por tiempo limitado.',
  whatsapp: wa('Hola Rodrigo, quiero la asesoría gratis de lanzamiento para mi negocio'),
};

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
    slug: 'bot-de-whatsapp', cara: '01', grupo: 'atender',
    nombre: 'Bot de WhatsApp',
    menu: 'Atiende, cotiza y agenda las 24 horas',
    h1: 'Un WhatsApp que atiende solo, las 24 horas',
    dolor: 'Me paso el día contestando mensajes.',
    entrega: 'Responde lo que siempre te preguntan, cotiza, agenda y te pasa la conversación cuando hay que cerrar. Tú entras solo cuando hace falta.',
    precio: { desde: 800, nota: 'Bot con botones: respuestas, horarios y agenda simple. Con inteligencia artificial para entender texto libre, desde S/1,500.' },
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
    precio: { desde: 1500, nota: 'Incluye pasar tus datos actuales. Un CRM grande con licencias por usuario se cotiza aparte.' },
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
    precio: { desde: 1500, nota: 'Por tarea automatizada. Varias tareas conectadas entre sí se cotizan como proyecto.' },
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
    slug: 'web-propia', cara: '04', grupo: 'atender',
    nombre: 'Web propia',
    menu: 'Tu web, tu dominio y tu servidor',
    h1: 'Tu web propia: que te encuentren cuando te buscan',
    dolor: 'No existo en internet.',
    entrega: 'Una web a tu nombre, con tu dominio, rápida en el celular y con los pedidos llegando directo a tu WhatsApp.',
    precio: { desde: 950, nota: 'Web de una página. Con catálogo de productos, desde S/1,950. Hosting en servidor propio: S/50 al mes. Dominio a tu nombre, al costo.' },
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
    precio: { desde: 2500, nota: 'Incluye ordenar el catálogo. El costo mensual depende de dónde se publique.' },
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
    precio: { desde: 60, unidad: 'por hora de audio', nota: 'Si prefieres hacerlo tú, instalo la transcripción en tu computadora y se cotiza aparte.' },
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
    slug: 'software-a-medida', cara: '07', grupo: 'medida',
    nombre: 'Software a medida',
    menu: 'Cuando ninguna herramienta te sirve',
    h1: 'Software a medida, cuando ninguna herramienta te sirve',
    dolor: 'Necesito algo que no existe.',
    entrega: 'Sistemas y aplicaciones hechos para tu negocio, conectados con lo que ya usas. La herramienta se elige después del problema, no al revés.',
    precio: { desde: 5000, nota: 'Depende del alcance. Primero una prueba chica para ver si sirve, después el resto por partes.' },
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
    slug: 'clases-de-ia', cara: null, grupo: 'medida',
    nombre: 'Clases de IA',
    menu: 'Claude, ChatGPT y Gemini en tu trabajo',
    h1: 'Clases de inteligencia artificial para tu trabajo',
    dolor: 'Quiero aprender a usar IA.',
    entrega: 'Clases prácticas para ti o tu equipo: Claude, ChatGPT y Gemini aplicados a las tareas de todos los días. Sales usándolos, no con apuntes.',
    precio: { desde: 600, nota: 'Por persona, taller práctico. Para equipos, precio por grupo.' },
    estado: ['listo', 'En marcha: introducción a la IA para el equipo de un estudio jurídico.'],
    incluye: [
      ['Con tus tareas reales', 'Traes lo que haces todos los días y lo resolvemos con IA en la clase.'],
      ['Qué herramienta para qué', 'Claude, ChatGPT o Gemini: cuándo conviene cada uno.'],
      ['Qué no hacer', 'Qué datos no poner nunca en una IA, y cómo revisar lo que te responde.'],
      ['Material para después', 'Las instrucciones que armamos quedan contigo.'],
    ],
    pasos: [
      ['Vemos qué haces', 'Qué tareas te quitan más tiempo.'],
      ['Clases prácticas', 'Por videollamada, con tus propios documentos y tareas.'],
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
    slug: 'seguridad', cara: null, grupo: 'medida',
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
];

const GRUPOS = [
  { id: 'atender', titulo: 'Atender y vender' },
  { id: 'ordenar', titulo: 'Ordenar tu negocio' },
  { id: 'medida',  titulo: 'A medida y aprendizaje' },
];

/* --------------------------------------------------------------------------
   Soluciones por rubro. Los cinco primeros son los que el usuario eligió
   para empezar (2026-09-22). Cada página tiene contenido propio: nada de
   copiar la misma plantilla cambiando el nombre del rubro.
   `clave` es la del asistente de main.js (RUBROS / PRIMERO).
   -------------------------------------------------------------------------- */
const RUBROS = [
  {
    slug: 'para-hoteles', clave: 'hotel',
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
    slug: 'para-restaurantes', clave: 'restaurante',
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
    slug: 'para-consultorios', clave: 'consultorio',
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
    slug: 'para-estudios-juridicos', clave: 'oficina',
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
    slug: 'para-tiendas', clave: 'tienda',
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
  { texto: 'Precios', href: 'precios.html' },
  { texto: 'Casos', href: 'casos.html' },
  { texto: 'Aprende', href: 'aprende.html' },
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
  WA_NUMERO, WA_VISIBLE, wa, ASESORIA, ESTADOS, SERVICIOS, GRUPOS, RUBROS,
  OTROS_RUBROS, CIFRAS, MENU, PROHIBIDAS,
};
