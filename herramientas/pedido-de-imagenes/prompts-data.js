// Fuente única de los prompts de imágenes de Yachai (2026-09-24). De acá salen la página del
// artifact (con botones de copiar) y la nota de Obsidian (yachai-web/pedido-de-imagenes.md).

const BASE_ESCENA = 'Imagen editorial fotorrealista para una marca de tecnología con identidad andina contemporánea, hecha en Cusco. ' +
  'Luz natural cálida y lateral, negros profundos con detalle, materiales de piedra oscura y madera. El dorado aparece solo en la luz o en un objeto pequeño; un acento azul (#315CFF) muy medido, solo en pantallas. ' +
  'Si hay personas: adultas, de aspecto natural, atentas a lo que hacen y sin mirar a la cámara, con vestuario actual, sin disfraces, sin ponchos y sin símbolos turísticos. ' +
  'Tecnología creíble y en uso, mano, mirada y dispositivo conectados. Textura creíble: piedra con relieve, madera con veta, sin brillo plástico. ' +
  'Sin texto, sin logotipos, sin hologramas, sin robots, sin cifras ni gráficos legibles. Es una escena ilustrativa generada, no una prueba de clientes ni de oficinas reales.';

const BASE_PUMA = 'Diseño de personaje. La imagen de REFERENCIA adjunta es la hoja aprobada del puma de la marca Yachai (el personaje se llama Yachay, con y griega, como la palabra quechua que significa conocimiento; la marca, la empresa, se llama Yachai). ' +
  'Genera exactamente ESE personaje: puma antropomórfico de pelaje cálido leonado, ojos ámbar, sudadera negra con capucha y cierre dorado, pantalón cargo negro y zapatillas negras; expresión madura, inteligente y amable; misma cara, hocico, orejas, proporciones y cola que en la referencia. ' +
  'No inventes un puma nuevo. Sin logotipos ni letras en la ropa (el isotipo oficial se aplica después). Sin poncho ni chullo. Ilustración 3D estilizada de alta calidad. Sin texto, sin objetos extra, sin paisaje.';

const V45 = 'Vertical 4:5 (1024 × 1280 px). Sujeto principal en la mitad superior y zona tranquila y oscura abajo (la web pone un degradado y texto ahí).';
const H169 = 'Horizontal 16:9 (1536 × 864 px). Sujeto hacia la derecha y zona tranquila a la izquierda para el título.';
const H32 = 'Horizontal 3:2 (1536 × 1024 px), con la zona limpia indicada para poner un titular después.';

const F32 = 'Horizontal 3:2 (1536 × 1024 px), con el sujeto en el tercio izquierdo y una zona tranquila a la derecha.';
const grupos = [
  {
    id: 'tanda3', hechas: true, tipo: 'puma', titulo: 'Tercera tanda: más poses de Yachay', formato: 'opcional · para redes',
    resumen: 'Opcional, para redes: 4 poses más de Yachay que el manual ya especifica (caminando, mostrando datos, sorprendido y neutral).',
    nota: 'El manual de marca describe seis expresiones (neutral, feliz, pensando, explicando, sorprendido, celebrando) y cinco poses (saludando, señalando, trabajando, mostrando datos, caminando). Ya hay siete; faltan **caminando**, **mostrando datos**, **sorprendido** y **neutral**. **Adjunta en ChatGPT las dos imágenes de referencia** (`07-Puma/puma-maestro-IA.png` y `12-Referencias/sistema-5-Photo-5.jpg`) y, si quieres asegurar la continuidad, una pose ya hecha (por ejemplo `yachai-saludando.png`). Guárdalas en `produccion/yachai/`. Los archivos nuevos llevan el prefijo `yachay-` (el personaje se llama Yachay); las siete anteriores conservan el `yachai-` con que las nombró el kit.',
    base: BASE_PUMA,
    fondo: 'Fondo negro liso #000000 (o transparente si ChatGPT te lo permite).',
    items: [
      { archivo: 'yachay-caminando.png', formato: '4:5', uso: 'Historias y videos sobre el método: «Vamos paso a paso», «Primero lo pruebas; después crece».',
        prompt: 'Cuerpo entero caminando hacia la cámara en tres cuartos, a paso tranquilo y seguro: una pata en el bolsillo de la sudadera y la otra balanceándose, expresión serena. Sensación de «vamos paso a paso». Vertical 4:5 (1024 × 1280 px), con margen alrededor.' },
      { archivo: 'yachay-mostrando-datos.png', formato: '16:9', uso: 'Publicaciones sobre reportes, bases de datos y anuncios.',
        prompt: 'De pie junto a una pantalla grande que muestra un panel abstracto con barras y una curva en azul (sin números ni texto legibles); la señala con una pata abierta y mira al espectador con expresión de explicar con calma. Horizontal 16:9 (1536 × 864 px), con el puma en el tercio izquierdo y la pantalla a la derecha.' },
      { archivo: 'yachay-sorprendido.png', formato: '1:1', uso: 'Publicaciones tipo «¿Sabías que…?».',
        prompt: 'De la cintura para arriba: ojos muy abiertos, orejas erguidas y la boca apenas abierta, una pata a medio levantar. Sorpresa amable, sin exagerar. Cuadrado 1:1 (1024 × 1024 px), con margen.' },
      { archivo: 'yachay-neutral.png', formato: '1:1', uso: 'Pose de reposo para armar piezas y presentaciones.',
        prompt: 'Cuerpo entero de frente, de pie y relajado, con los brazos a los costados y expresión neutra, amable y atenta. Sirve de pose base para componer piezas. Cuadrado 1:1 (1024 × 1024 px), con margen.' },
    ],
  },
  {
    id: 'tanda2', hechas: true, titulo: 'Segunda tanda: lo que sigue faltando', formato: 'faltan en la web',
    nota: 'Huecos que quedaron en la web al cargar las 28 primeras: los **tres casos sin foto** (jurídico, libros, agencias), la tarjeta **«Otro negocio»** y el **espacio a la derecha del chat de Yachay** en el inicio. **Los tres casos se publican rotulados «Ilustración con IA · no es una captura del trabajo»**: son escenas, no evidencia de un trabajo real. Guárdalas en `paginas web de Rodrigo/yachai/produccion/imagenes/` con el nombre exacto.',
    base: BASE_ESCENA,
    items: [
      { archivo: 'caso-estudios-juridicos.png', formato: '3:2', uso: 'Caso «Estudios jurídicos» (inicio y página Casos).',
        prompt: 'Un estudio jurídico pequeño de Cusco visto desde el escritorio: expedientes apilados con pestañas de colores, un calendario de pared con plazos marcados (sin texto legible) y una portátil abierta con una pantalla de calendario y una alerta azul discreta. Una abogada adulta, de perfil, revisa un documento con un lápiz en la mano. Luz de ventana lateral cálida, madera y piedra. Sensación de plazos bajo control, sin dramatismo. ' + F32 },
      { archivo: 'caso-libros-y-proyectos-largos.png', formato: '3:2', uso: 'Caso «Libros y proyectos largos» (inicio y página Casos).',
        prompt: 'Mesa de trabajo de una autora, de tres cuartos, ordenando pilas de manuscritos y cuadernos con notas adhesivas de colores. Al lado, una portátil que muestra una red abstracta de notas conectadas: puntos y líneas finas doradas y azules, sin texto. Un libro abierto y una taza. Luz cálida de tarde, madera y piedra. Sensación de material de años que se va ordenando. ' + F32 },
      { archivo: 'caso-agencias-de-marketing.png', formato: '3:2', uso: 'Caso «Agencias de marketing» (inicio y página Casos).',
        prompt: 'Mesa de trabajo de una agencia pequeña de marketing en Cusco: dos personas, de perfil, frente a una pantalla grande con un panel de campañas abstracto (barras y curvas en azul, sin números legibles) y un tablero con tarjetas de publicaciones; sobre la mesa, un celular con un reporte simple. Ambiente cálido, madera y piedra, luz de ventana. ' + F32 },
      { archivo: 'para-otro-negocio.png', formato: '4:5', uso: 'Tarjeta «Otro negocio» (inicio y página Soluciones): turismo, academias, agencias.',
        prompt: 'Mostrador de una agencia de turismo pequeña en Cusco: un mapa de papel de la región con alfileres dorados, un cuaderno de reservas abierto, un celular con una notificación azul y una taza; al fondo, estantes con guías y una ventana con la luz de la tarde. Sensación de negocio de servicios que atiende a personas. ' + V45 },
      { archivo: 'asistente-ia.png', formato: '4:5', uso: 'El espacio a la derecha del chat de Yachay, en la sección «¿En qué te ayudo?» del inicio.',
        prompt: 'Primer plano de las manos de una persona que sostiene un celular con una conversación en azul, sobre una mesa de madera de un negocio; al fondo, desenfocada, una portátil que muestra un flujo abstracto de nodos conectados con líneas finas doradas y azules. Piedra oscura y luz cálida lateral. Sensación de asistente de inteligencia artificial que ayuda a un negocio real, sin robots ni hologramas. ' + V45 },
    ],
  },
  {
    id: 'puma', hechas: true, titulo: 'Yachay, el puma', formato: 'Para redes, lives y videos',
    nota: 'Antes de pegar el prompt, **adjunta en ChatGPT las dos imágenes de referencia** del kit: `07-Puma/puma-maestro-IA.png` y `12-Referencias/sistema-5-Photo-5.jpg` (están en la carpeta YACHAI-Identidad-Completa-v1 del Escritorio). Sin ellas, ChatGPT inventa otro puma. Guárdalas en `produccion/yachai/`.',
    base: BASE_PUMA,
    fondo: 'Fondo negro liso #000000 (o transparente si ChatGPT te lo permite).',
    items: [
      { archivo: 'yachai-perfil.png', formato: '1:1', primero: true, uso: 'Foto de perfil de TikTok, Instagram, WhatsApp Business y Google.',
        prompt: 'Busto: cabeza y hombros, mirando al frente con una sonrisa serena. Ocupa el 75 % del cuadro, con margen. Cuadrado 1:1 (1024 × 1024 px).' },
      { archivo: 'yachai-saludando.png', formato: '1:1', primero: true, uso: 'Inicio de videos e historias: «Hola, soy Yachay».',
        prompt: 'Cuerpo entero en tres cuartos, con una pata levantada saludando y expresión feliz. Cuadrado 1:1 (1024 × 1024 px), con margen alrededor.' },
      { archivo: 'yachai-portada.png', formato: '9:16', primero: true, uso: 'Fondo del live y de las historias del regalo de octubre.',
        prompt: 'Cuerpo entero, pequeño y en la parte de abajo del cuadro, con mucho fondo negro liso arriba para poner texto encima. Vertical 9:16 (1080 × 1920 px); dejar 250 px libres arriba y abajo.' },
      { archivo: 'yachai-pensando.png', formato: '1:1', uso: 'Historias de preguntas y encuestas.',
        prompt: 'Cuerpo entero, con una pata en el mentón y la mirada hacia arriba, expresión pensativa. Un signo de interrogación dorado, simple, flotando arriba. Cuadrado 1:1 (1024 × 1024 px).' },
      { archivo: 'yachai-senalando.png', formato: '4:5', uso: 'Piezas con un dato o un titular al costado.',
        prompt: 'Cuerpo entero en tres cuartos, señalando con una pata hacia un costado, expresión explicando con calma. Deja la mitad del cuadro libre. Vertical 4:5 (1024 × 1280 px).' },
      { archivo: 'yachai-trabajando.png', formato: '16:9', uso: 'Piezas sobre bots, bases de datos y automatización.',
        prompt: 'Sentado frente a una portátil sin logotipo, tecleando, con la pantalla en un azul abstracto (sin texto). Plano medio. Horizontal 16:9 (1536 × 864 px), con espacio libre a un lado.' },
      { archivo: 'yachai-celebrando.png', formato: '1:1', uso: 'Cuando alguien toma un cupo o se cierra un caso.',
        prompt: 'Cuerpo entero con los brazos arriba, expresión de alegría contenida. Confeti pequeño, dorado y hueso, sin exagerar. Cuadrado 1:1 (1024 × 1024 px).' },
    ],
  },
  {
    id: 'rubros', hechas: true, titulo: 'Rubros', formato: 'Vertical 4:5',
    nota: 'Hoy cada página de rubro usa la escena de un servicio. Guarda cada una en `paginas web de Rodrigo/yachai/produccion/imagenes/` con el nombre exacto: la web las convierte sola.',
    base: BASE_ESCENA, cierre: V45,
    items: [
      { archivo: 'para-hoteles.png', formato: '4:5', primero: true, uso: 'Página «Hoteles y hospedajes».',
        prompt: 'Recepción de un hotel boutique de Cusco al atardecer: mostrador de madera, muro de piedra oscura, lámpara cálida y llaves de latón colgadas detrás. Una recepcionista adulta, de perfil, atiende un celular apoyado en el mostrador donde se ve una conversación (burbujas de mensaje sin texto legible, un acento azul pequeño).' },
      { archivo: 'para-restaurantes.png', formato: '4:5', primero: true, uso: 'Página «Restaurantes».',
        prompt: 'Cocina abierta de un restaurante cusqueño en hora punta: vapor, platos listos en el pase y un cocinero de espaldas con las manos en primer plano emplatando. Sobre el pase, un celular apoyado junto a la comanda con una notificación azul encendida.' },
      { archivo: 'para-consultorios.png', formato: '4:5', primero: true, uso: 'Página «Consultorios».',
        prompt: 'Mostrador de un consultorio pequeño y contemporáneo: una agenda de papel llena de tachones y notas a mano (sin texto legible) junto a un celular con un recordatorio en pantalla; la mano de una asistente marca una cita. Luz suave de ventana, una planta, madera clara y piedra.' },
      { archivo: 'para-estudios-juridicos.png', formato: '4:5', primero: true, uso: 'Página «Estudios jurídicos y contables».',
        prompt: 'Escritorio de madera de un estudio jurídico: expedientes apilados con pestañas de colores, un calendario de pared con fechas marcadas y una portátil abierta a un costado con una pantalla de calendario abstracta. Una abogada adulta, de tres cuartos, revisa un documento. Luz de ventana lateral cálida.' },
      { archivo: 'para-tiendas.png', formato: '4:5', primero: true, uso: 'Página «Tiendas y microempresas».',
        prompt: 'Tienda pequeña de ropa y accesorios en una calle de piedra de Cusco al atardecer: prendas y gorras colgadas y la vitrina encendida. La dueña, adulta, detrás del mostrador, mira su celular donde hay un mensaje de un cliente (sin texto legible). Vestuario actual, sin ponchos ni trajes típicos.' },
    ],
  },
  {
    id: 'servicios', hechas: true, titulo: 'Servicios sin imagen', formato: 'Vertical 4:5',
    nota: 'Los servicios que no tienen escena de las 7 del inicio. En la web, «Seguridad» ahora se llama «Seguridad en bots, agentes y software».',
    base: BASE_ESCENA, cierre: V45,
    items: [
      { archivo: 'bases-de-datos.png', formato: '4:5', uso: 'Servicio «Bases de datos y herramientas».',
        prompt: 'Un archivador de madera antiguo con carpetas y hojas, y sobre él una portátil con una hoja de cálculo abstracta (sin números legibles). Hilos finos de luz dorada unen las carpetas con la pantalla como una red, sin dibujar ningún símbolo. Las manos de una persona ordenan una carpeta.' },
      { archivo: 'aplicaciones-web.png', formato: '4:5', uso: 'Servicio «Aplicaciones web».',
        prompt: 'Una persona trabaja de noche en un escritorio, con una portátil y un celular al lado que muestran la misma interfaz de reservas: tarjetas, un calendario y botones abstractos, sin texto legible, con un acento azul en la pantalla. Plano sobre el hombro. Luz cálida de lámpara y piedra oscura al fondo.' },
      { archivo: 'clases-de-ia.png', formato: '4:5', uso: 'Servicio «Clases de IA».',
        prompt: 'Mesa de una clase uno a uno: dos adultos sentados de lado frente a una portátil, uno explica señalando la pantalla y el otro toma notas en un cuaderno; dos tazas de café. Luz de tarde por la ventana con una vista discreta de tejados y montañas de Cusco. Sin texto en la pantalla.' },
      { archivo: 'seguridad.png', formato: '4:5', uso: 'Servicio «Seguridad en bots, agentes y software».',
        prompt: 'Un candado de latón dorado sobre un teclado negro, y detrás una portátil con una pantalla oscura que muestra un panel abstracto con una barra azul. Plano cercano, tono serio, luz lateral cálida. Una mano se apoya cerca del candado. Sin símbolos añadidos.' },
      { archivo: 'anuncios-meta-ads.png', formato: '4:5', uso: 'Servicio «Anuncios en redes».',
        prompt: 'Un celular vertical sobre una mesa de madera muestra una publicación de una tienda de gorras y sombreros (fotografía de los productos, sin texto ni logotipos de redes) y notificaciones de mensajes que llegan en azul. Al fondo, desenfocada, una persona con un café.' },
      { archivo: 'videos-con-ia.png', formato: '4:5', uso: 'Servicio «Videos con IA».',
        prompt: 'Un pequeño estudio de video: un celular en un trípode frente a una mesa con productos, y una pantalla que muestra una línea de tiempo de edición abstracta (sin texto). Una persona ajusta una luz cálida. Ambiente de trabajo real, sin efectos futuristas.' },
      { archivo: 'asesoria-en-ia.png', formato: '4:5', opcional: true, uso: 'Página «Asesoría en IA»: reemplaza la foto de Rodrigo (opcional).',
        prompt: 'Una conversación de asesoría: dos adultos frente a frente en una mesa; uno tiene un cuaderno con un diagrama simple dibujado a mano (dos flechas que se separan, sin texto) y el otro una portátil cerrada. Plano medio cercano, sin mirar a la cámara, luz de ventana.' },
    ],
  },
  {
    id: 'aprende', hechas: true, titulo: 'Portadas de «Aprende»', formato: 'Horizontal 16:9',
    nota: 'Los 5 artículos no tienen imagen. Van arriba del texto y en la tarjeta.',
    base: BASE_ESCENA, cierre: H169,
    items: [
      { archivo: 'aprende-responder-en-la-primera-hora.png', formato: '16:9', uso: 'Artículo «Responder en la primera hora».',
        prompt: 'Un celular sobre el mostrador de un negocio, con una notificación de mensaje nuevo encendida en azul, y al lado un reloj de arena de latón con la arena cayendo. Una mano se acerca al celular. Luz dorada cálida.' },
      { archivo: 'aprende-whatsapp-cobra-desde-octubre.png', formato: '16:9', uso: 'Artículo «WhatsApp empieza a cobrar respuestas en octubre».',
        prompt: 'Un celular con una conversación abierta (burbujas sin texto legible ni logotipos) sobre una mesa de madera y, al lado, unas monedas de sol peruano apiladas; una mano cuenta las monedas.' },
      { archivo: 'aprende-aparecer-en-google-sin-local.png', formato: '16:9', uso: 'Artículo «Cómo aparecer en Google Maps sin local».',
        prompt: 'Un mapa de papel de Cusco, sin nombres legibles, sobre una mesa, con un alfiler dorado clavado, y al lado un celular que muestra un mapa abstracto con un pin. Una mano sostiene el alfiler.' },
      { archivo: 'aprende-por-que-un-bot-se-puede-enganar.png', formato: '16:9', uso: 'Artículo «Por qué un bot se puede engañar».',
        prompt: 'Un celular con una conversación en pantalla y, a su lado, una máscara de teatro dorada apoyada de lado. Tono de advertencia: luz baja, un toque de azul en la pantalla. Sin texto.' },
      { archivo: 'aprende-si-se-resuelve-con-una-regla.png', formato: '16:9', uso: 'Artículo «Si se resuelve con una regla».',
        prompt: 'Un cuaderno abierto con un diagrama simple dibujado a mano (dos flechas que se separan desde un punto, sin texto legible), una regla de madera y un lápiz; la mano de una persona traza una de las flechas.' },
    ],
  },
  {
    id: 'mundos', hechas: true, titulo: 'Fotos de los cuatro mundos', formato: 'Horizontal 3:2',
    nota: 'Del manual de marca (dirección fotográfica): para Nosotros, presentaciones y publicaciones. **El mundo «Negocios reales» ya está hecho** (`negocio-cusco-editorial-IA.png`, en el kit). Se guardan en `produccion/imagenes/`. Rotula siempre «Imagen ilustrativa generada con IA».',
    base: BASE_ESCENA, cierre: H32,
    items: [
      { archivo: 'mundo-tecnologia.png', formato: '3:2', uso: 'Tecnología aplicada. Zona limpia a la izquierda.',
        prompt: 'Plano sobre el hombro de una persona que usa una portátil en un negocio contemporáneo, con la mano, la mirada y la pantalla claramente conectadas. La pantalla muestra una interfaz abstracta y sobria, sin números ni frases legibles. Luz de ventana cálida y un acento azul pequeño. Zona limpia a la izquierda.' },
      { archivo: 'mundo-cusco.png', formato: '3:2', uso: 'Cusco contemporáneo. Zona limpia a la derecha.',
        prompt: 'Interior de trabajo contemporáneo con piedra y madera y una ventana con una vista evocadora de la ciudad y las montañas de Cusco. Al fondo, una persona prepara una reunión sin posar. Encuadre amplio con capas de profundidad. No reproducir un edificio real como ubicación documentada. Zona limpia a la derecha.' },
      { archivo: 'mundo-resultados.png', formato: '3:2', uso: 'Resultados humanos. Zona limpia arriba.',
        prompt: 'Dos adultos conversan después de revisar una tarea, con atención, claridad y una sonrisa leve; gestos contenidos. Un cuaderno y una portátil cerrada dan contexto. Sin números, trofeos ni celebraciones exageradas, sin insinuar resultados comerciales. Plano medio cercano. Zona limpia arriba.' },
      { archivo: 'mundo-textura.png', formato: '3:2', uso: 'Textura de apoyo para fondos de piezas.',
        prompt: 'Detalle de piedra oscura y madera natural con luz lateral cálida que revela el relieve. Composición sobria con zonas de detalle y zonas de calma. Sin símbolos tallados, sin textos y sin brillo metálico exagerado. La textura no debe formar ningún isotipo.', sinBase: true },
    ],
  },
];

const noSeHacenConChatGPT = [
  ['Capturas reales', 'Un bot respondiendo en WhatsApp con un número de prueba; un flujo de n8n sin credenciales ni nombres; lo que haya de clientes, con los nombres difuminados. En «Casos» nunca una imagen inventada: sin captura, el caso se queda sin imagen.'],
  ['Fotos y video de Rodrigo', 'Siguen en pausa (decisión del 23/09). No se sustituyen por una persona sintética presentada como Rodrigo.'],
  ['Testimonios', 'Con permiso de quien los da; nunca se inventa uno.'],
];

function promptCompleto(g, it) {
  const partes = (g.id === 'puma' || g.tipo === 'puma')
    ? [g.base, it.prompt, g.fondo]
    : (it.sinBase ? [it.prompt, 'Sin texto, sin logotipos.', g.cierre] : [g.base, it.prompt, g.cierre]);
  return partes.filter(Boolean).join('\n\n');
}

module.exports = { BASE_ESCENA, BASE_PUMA, grupos, noSeHacenConChatGPT, promptCompleto };
