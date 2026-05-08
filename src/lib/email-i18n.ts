/**
 * Email-specific translations for Feel Better Club.
 *
 * Only user-facing emails are translated (EN / ES / PT).
 * Coach-facing emails (contactNotification, onDemandLead, messageNotification)
 * always stay in English.
 *
 * Brand terms kept in English: "Feel Better Club", "#FEELBETTERCLUB", class names.
 * "Moni" stays as-is in every language.
 */

export type EmailLang = "en" | "es" | "pt";

export interface WelcomeStrings {
  subject: string;
  greeting: (name: string) => string;
  p1: string;
  p2: string;
  p3: string;
  p4: string;
  p5: string;
  signoff: string;
  role: string;
}

export interface BookingStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  detailsLabel: string;
  dateLabel: string;
  timeLabel: string;
  classLabel: string;
  cancelIntro: string;
  signoff: string;
}

export interface WaitlistStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  detailsLabel: string;
  classLabel: string;
  dateLabel: string;
  timeLabel: string;
  statusLabel: string;
  statusValue: string;
  body: string;
  signoff: string;
}

export interface ContactAutoReplyStrings {
  subject: string;
  greeting: (name: string) => string;
  body: string;
  cta: string;
  ctaLabel: string;
  signoff: string;
  role: string;
}

export interface OnDemandConfirmationStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  detailsLabel: string;
  groupSizeLabel: string;
  preferredDateLabel: string;
  followUp: string;
  meanwhile: string;
  signoff: string;
  role: string;
}

export interface EmailTranslationSet {
  welcome: WelcomeStrings;
  booking: BookingStrings;
  waitlist: WaitlistStrings;
  contactAutoReply: ContactAutoReplyStrings;
  onDemandConfirmation: OnDemandConfirmationStrings;
}

const en: EmailTranslationSet = {
  welcome: {
    subject: "Welcome — your outdoor training journey starts here",
    greeting: (name) => `Hi ${name},`,
    p1: "I'm genuinely excited to have you with us. The Feel Better Club was created with one simple intention: to bring people together through movement, nature, and the kind of energy that only shared effort can create.",
    p2: "Every session is designed to feel uplifting and connected — whether we're training on the beach at sunrise, doing mobility at sunset, or challenging ourselves in the forest at midday. My goal is to make each workout something you look forward to, not just for the training itself, but for the atmosphere and the people around you.",
    p3: "By joining, you're not just signing up for workouts. You're becoming part of a Feel Better Community that supports each other, grows together, and enjoys the outdoors as our \"gym\". I'm grateful to have you with us.",
    p4: "As a welcome gift, you'll receive the details about date and time for your free outdoor class in a separate message shortly. I can't wait for you to experience it and give us feedback.",
    p5: "As a member you can easily book a class or manage your reservations. You also get premium access to special events, sport nutrition tips and holistic health rituals. And of course, you can always reach out if you have questions or ideas — this community grows stronger when we build it together.",
    signoff: "See you outside.",
    role: "Feel Better Coach &amp; Founder",
  },
  booking: {
    subject: "Your Spot Is Confirmed — See You Outdoors",
    greeting: (name) => `Hi ${name},`,
    intro: "Thank you for choosing Feel Better Club and your reservation. I am excited to train with you. You are the reason why I show up every day to create the space where you can discover your inner Power and Connect with your true potential.",
    detailsLabel: "Your booking:",
    dateLabel: "Date:",
    timeLabel: "Time:",
    classLabel: "Class:",
    cancelIntro: "If your plans change, you can cancel up to 12 hours before the class using the link below:",
    signoff: "Let's grow and Feel Better — together :)",
  },
  waitlist: {
    subject: "You're on the Waitlist — We'll Let You Know",
    greeting: (name) => `Hi ${name},`,
    intro: "Thanks for your interest in joining us! The class is currently full, but you're on the waitlist.",
    detailsLabel: "Your waitlist details:",
    classLabel: "Class:",
    dateLabel: "Date:",
    timeLabel: "Time:",
    statusLabel: "Status:",
    statusValue: "On the waitlist",
    body: "If a spot opens up, you'll receive a confirmation email automatically with all the details and a cancellation link. No action needed from your side — just keep your fingers crossed!",
    signoff: "See you soon, hopefully!",
  },
  contactAutoReply: {
    subject: "We Got Your Message — Feel Better Club",
    greeting: (name) => `Hi ${name},`,
    body: "Thank you for reaching out! We've received your message and Moni will get back to you as soon as possible.",
    cta: "In the meantime, feel free to check out our classes and upcoming sessions at",
    ctaLabel: "thefeelbetterclub.com",
    signoff: "See you outside!",
    role: "Feel Better Coach &amp; Founder",
  },
  onDemandConfirmation: {
    subject: "Your Request Has Been Received — Feel Better Club",
    greeting: (name) => `Hi ${name},`,
    intro: "Thank you for reaching out! We've received your on-demand class request and we're excited to make it happen.",
    detailsLabel: "Your request details:",
    groupSizeLabel: "Group size:",
    preferredDateLabel: "Preferred date:",
    followUp: "Moni will review your request and get back to you shortly to confirm the details and arrange everything just right for you.",
    meanwhile: "In the meantime, if you have any questions feel free to reply to this email.",
    signoff: "See you outside!",
    role: "Feel Better Coach &amp; Founder",
  },
};

const es: EmailTranslationSet = {
  welcome: {
    subject: "Bienvenid@ — tu aventura de entrenamiento al aire libre empieza aqui",
    greeting: (name) => `Hola ${name},`,
    p1: "Me hace mucha ilusion tenerte con nosotros. El Feel Better Club nacio con una intencion muy sencilla: reunir a personas a traves del movimiento, la naturaleza y esa energia especial que solo se crea cuando entrenamos juntos.",
    p2: "Cada sesion esta pensada para que te sientas bien y conectad@ — ya sea entrenando en la playa al amanecer, haciendo movilidad al atardecer o retandonos en el bosque a mediodia. Mi objetivo es que cada entrenamiento sea algo que esperas con ganas, no solo por el ejercicio en si, sino por el ambiente y la gente que te rodea.",
    p3: "Al unirte, no solo te apuntas a entrenamientos. Te conviertes en parte de una comunidad Feel Better que se apoya, crece junta y disfruta del aire libre como nuestro \"gimnasio\". Estoy muy agradecida de tenerte con nosotros.",
    p4: "Como regalo de bienvenida, recibiras los detalles de fecha y hora de tu clase gratuita al aire libre en un mensaje aparte muy pronto. Tengo muchas ganas de que la pruebes y nos des tu opinion.",
    p5: "Como miembro puedes reservar clases facilmente o gestionar tus reservas. Tambien tienes acceso premium a eventos especiales, consejos de nutricion deportiva y rituales de bienestar holistico. Y por supuesto, siempre puedes escribirnos si tienes preguntas o ideas — esta comunidad crece cuando la construimos juntos.",
    signoff: "Nos vemos fuera.",
    role: "Feel Better Coach &amp; Fundadora",
  },
  booking: {
    subject: "Tu plaza esta confirmada — nos vemos al aire libre",
    greeting: (name) => `Hola ${name},`,
    intro: "Gracias por elegir Feel Better Club y por tu reserva. Estoy deseando entrenar contigo. Tu eres la razon por la que me levanto cada dia para crear el espacio donde puedas descubrir tu fuerza interior y conectar con tu verdadero potencial.",
    detailsLabel: "Tu reserva:",
    dateLabel: "Fecha:",
    timeLabel: "Hora:",
    classLabel: "Clase:",
    cancelIntro: "Si cambian tus planes, puedes cancelar hasta 12 horas antes de la clase usando el enlace de abajo:",
    signoff: "Crezcamos y sintamonos mejor — juntos :)",
  },
  waitlist: {
    subject: "Estas en la lista de espera — te avisamos",
    greeting: (name) => `Hola ${name},`,
    intro: "Gracias por tu interes en unirte! La clase esta completa, pero estas en la lista de espera.",
    detailsLabel: "Detalles de tu lista de espera:",
    classLabel: "Clase:",
    dateLabel: "Fecha:",
    timeLabel: "Hora:",
    statusLabel: "Estado:",
    statusValue: "En lista de espera",
    body: "Si se libera una plaza, recibiras un email de confirmacion automaticamente con todos los detalles y un enlace de cancelacion. No necesitas hacer nada — cruza los dedos!",
    signoff: "Esperamos verte pronto!",
  },
  contactAutoReply: {
    subject: "Hemos recibido tu mensaje — Feel Better Club",
    greeting: (name) => `Hola ${name},`,
    body: "Gracias por escribirnos! Hemos recibido tu mensaje y Moni te respondera lo antes posible.",
    cta: "Mientras tanto, puedes echar un vistazo a nuestras clases y proximas sesiones en",
    ctaLabel: "thefeelbetterclub.com",
    signoff: "Nos vemos fuera!",
    role: "Feel Better Coach &amp; Fundadora",
  },
  onDemandConfirmation: {
    subject: "Tu solicitud ha sido recibida — Feel Better Club",
    greeting: (name) => `Hola ${name},`,
    intro: "Gracias por contactarnos! Hemos recibido tu solicitud de clase personalizada y estamos deseando hacerla realidad.",
    detailsLabel: "Detalles de tu solicitud:",
    groupSizeLabel: "Tamano del grupo:",
    preferredDateLabel: "Fecha preferida:",
    followUp: "Moni revisara tu solicitud y te contactara pronto para confirmar los detalles y organizarlo todo a tu medida.",
    meanwhile: "Mientras tanto, si tienes alguna pregunta no dudes en responder a este email.",
    signoff: "Nos vemos fuera!",
    role: "Feel Better Coach &amp; Fundadora",
  },
};

const pt: EmailTranslationSet = {
  welcome: {
    subject: "Bem-vind@ — a tua jornada de treino ao ar livre comeca aqui",
    greeting: (name) => `Ola ${name},`,
    p1: "Estou muito feliz por te ter connosco. O Feel Better Club foi criado com uma intencao simples: juntar pessoas atraves do movimento, da natureza e daquela energia especial que so o esforco partilhado consegue criar.",
    p2: "Cada sessao e pensada para te fazer sentir bem e conectad@ — seja a treinar na praia ao nascer do sol, a fazer mobilidade ao por do sol ou a desafiar-nos na floresta ao meio-dia. O meu objetivo e que cada treino seja algo que esperas com entusiasmo, nao so pelo exercicio em si, mas pelo ambiente e pelas pessoas a tua volta.",
    p3: "Ao juntares-te, nao te estas so a inscrever em treinos. Estas a fazer parte de uma comunidade Feel Better que se apoia, cresce junta e aproveita o ar livre como o nosso \"ginasio\". Estou muito grata por te ter connosco.",
    p4: "Como presente de boas-vindas, vais receber os detalhes de data e hora da tua aula gratuita ao ar livre numa mensagem separada em breve. Mal posso esperar que a experimentes e nos des o teu feedback.",
    p5: "Como membro podes facilmente reservar aulas ou gerir as tuas reservas. Tambem tens acesso premium a eventos especiais, dicas de nutricao desportiva e rituais de saude holistica. E claro, podes sempre contactar-nos se tiveres perguntas ou ideias — esta comunidade fica mais forte quando a construimos juntos.",
    signoff: "Vemo-nos la fora.",
    role: "Feel Better Coach &amp; Fundadora",
  },
  booking: {
    subject: "O teu lugar esta confirmado — vemo-nos ao ar livre",
    greeting: (name) => `Ola ${name},`,
    intro: "Obrigada por escolheres o Feel Better Club e pela tua reserva. Estou entusiasmada por treinar contigo. Tu es a razao pela qual apareco todos os dias para criar o espaco onde podes descobrir a tua forca interior e conectar com o teu verdadeiro potencial.",
    detailsLabel: "A tua reserva:",
    dateLabel: "Data:",
    timeLabel: "Hora:",
    classLabel: "Aula:",
    cancelIntro: "Se os teus planos mudarem, podes cancelar ate 12 horas antes da aula usando o link abaixo:",
    signoff: "Vamos crescer e sentir-nos melhor — juntos :)",
  },
  waitlist: {
    subject: "Estas na lista de espera — avisamos-te",
    greeting: (name) => `Ola ${name},`,
    intro: "Obrigada pelo teu interesse em juntar-te a nos! A aula esta completa, mas estas na lista de espera.",
    detailsLabel: "Detalhes da tua lista de espera:",
    classLabel: "Aula:",
    dateLabel: "Data:",
    timeLabel: "Hora:",
    statusLabel: "Estado:",
    statusValue: "Na lista de espera",
    body: "Se um lugar ficar disponivel, recebes um email de confirmacao automaticamente com todos os detalhes e um link de cancelamento. Nao precisas de fazer nada — cruza os dedos!",
    signoff: "Esperamos ver-te em breve!",
  },
  contactAutoReply: {
    subject: "Recebemos a tua mensagem — Feel Better Club",
    greeting: (name) => `Ola ${name},`,
    body: "Obrigada por entrares em contacto! Recebemos a tua mensagem e a Moni vai responder-te o mais rapido possivel.",
    cta: "Entretanto, podes dar uma vista de olhos as nossas aulas e proximas sessoes em",
    ctaLabel: "thefeelbetterclub.com",
    signoff: "Vemo-nos la fora!",
    role: "Feel Better Coach &amp; Fundadora",
  },
  onDemandConfirmation: {
    subject: "O teu pedido foi recebido — Feel Better Club",
    greeting: (name) => `Ola ${name},`,
    intro: "Obrigada por entrares em contacto! Recebemos o teu pedido de aula personalizada e estamos entusiasmados para o tornar realidade.",
    detailsLabel: "Detalhes do teu pedido:",
    groupSizeLabel: "Tamanho do grupo:",
    preferredDateLabel: "Data preferida:",
    followUp: "A Moni vai rever o teu pedido e entrar em contacto em breve para confirmar os detalhes e organizar tudo a tua medida.",
    meanwhile: "Entretanto, se tiveres alguma duvida nao hesites em responder a este email.",
    signoff: "Vemo-nos la fora!",
    role: "Feel Better Coach &amp; Fundadora",
  },
};

const emailTranslations: Record<EmailLang, EmailTranslationSet> = { en, es, pt };

export function getEmailStrings(lang?: string): EmailTranslationSet {
  const key = (lang || "en") as EmailLang;
  return emailTranslations[key] || emailTranslations.en;
}
