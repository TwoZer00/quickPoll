export default {
  nav: {
    lastPolls: 'Últimas encuestas',
    createPoll: 'Crear encuesta',
    home: 'Inicio',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro'
  },
  home: {
    subtitle: 'Crea encuestas en segundos, comparte un enlace y mira los votos en tiempo real.',
    createBtn: 'Crear encuesta',
    features: {
      instant: { label: 'Creación instantánea', desc: 'Sin registro' },
      sharing: { label: 'Fácil de compartir', desc: 'Un solo enlace' },
      results: { label: 'Resultados en vivo', desc: 'Votos en tiempo real' }
    }
  },
  create: {
    title: 'Crear encuesta',
    subtitle: 'Agrega un título y al menos dos opciones para comenzar.',
    titleLabel: 'Título',
    optionLabel: 'Opción {{n}}',
    addOption: 'Agregar opción',
    addImage: 'Agregar imagen',
    durationNote: 'Votación abierta por <b>{{min}} min</b> después de la creación.',
    createBtn: 'Crear encuesta',
    confirmTitle: '¿Publicar encuesta?',
    confirmBody: 'Una vez publicada no se puede editar.',
    edit: 'Editar',
    publish: 'Publicar',
    successTitle: 'Encuesta creada',
    successBody: 'Tu encuesta está lista. Compártela para empezar a recibir votos.',
    close: 'Cerrar',
    viewPoll: 'Ver encuesta',
    errors: {
      titleMin: 'El título debe tener al menos 3 caracteres',
      titleMax: 'El título debe tener como máximo 200 caracteres',
      optionEmpty: 'La opción no puede estar vacía',
      duplicate: 'Opción duplicada',
      fixErrors: 'Por favor corrige los errores',
      imageType: 'Solo se permiten archivos de imagen',
      imageSize: 'La imagen debe pesar menos de 5MB',
      createFailed: 'Error al crear la encuesta'
    }
  },
  poll: {
    by: 'por {{name}}',
    vote: 'Votar',
    closed: 'Encuesta cerrada',
    created: 'Creada el {{date}}'
  },
  share: {
    copyLink: 'Copiar enlace',
    copyBars: 'Copiar como gráfico de barras',
    copyPie: 'Copiar como gráfico circular',
    shareX: 'Compartir en X',
    shareWhatsApp: 'Compartir en WhatsApp',
    copied: 'enlace copiado al portapapeles',
    copiedEmbed: 'código de inserción copiado al portapapeles',
    voteText: '¡Vota en esta encuesta!',
    embedPoll: 'Insertar encuesta'
  },
  time: {
    minLeft: '{{n}} min restantes',
    secLeft: '{{n}}s restantes',
    justNow: 'Ahora mismo',
    minsAgo: 'hace {{n}}m',
    hoursAgo: 'hace {{n}}h',
    voted: 'votado'
  },
  chart: {
    votes: 'votos'
  },
  mock: {
    title: '¿Cuál es el mejor lenguaje de programación?'
  },
  error: {
    tryAgain: 'Intenta volver atrás o recargar la página.',
    goHome: 'Ir al inicio'
  },
  terms: {
    pageTitle: 'Términos de Servicio'
  },
  privacy: {
    pageTitle: 'Política de Privacidad'
  },
  errors: {
    15: 'encuesta no encontrada',
    16: 'encuesta cerrada',
    17: 'error al cargar la encuesta',
    'permission-denied': 'no tienes permiso para hacer eso',
    unavailable: 'el servicio no está disponible, intenta de nuevo',
    'not-found': 'el recurso solicitado no fue encontrado',
    unauthenticated: 'autenticación fallida, recarga la página'
  }
}
