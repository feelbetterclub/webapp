const en = {
  nav: {
    rituals: "Rituals",
    about: "About",
    contact: "Contact",
    bookClass: "Book a Class",
  },
  hero: {
    tagline: "Morning Endorphins & Sea Vitamins Workouts",
    headline1: "Strong Body",
    headline2: "Clear Mind",
    subtitle:
      "Reconnect with Nature and your True Power. Holistic health rituals designed for lifestyle-driven athletes.",
    cta1: "Discover our rituals",
    cta2: "Book a class",
  },
  rituals: {
    label: "Our Rituals",
    title: "Designed for Athletes, Powered by Nature",
    subtitle:
      "Each ritual targets a specific need. Combine them for a complete transformation.",
    mobility: {
      name: "Mobility Flow",
      description:
        "Unlock your hips, shoulders and spine with deep mobility work. Designed for kiters and surfers to improve rotation, prevent injuries and move with more freedom on the water.",
    },
    strength: {
      name: "Strength Flow",
      description:
        "Build functional core strength and upper body power. Perfect for watersports athletes seeking more stability on the board and explosive performance in every session.",
    },
    pilates: {
      name: "Pilates Flow",
      description:
        "Low-impact, high-precision exercises that strengthen your core, improve posture and accelerate recovery. Ideal after intense water sessions.",
    },
    breathwork: {
      name: "Breathwork",
      description:
        "Master breathing techniques that boost energy, reduce stress and sharpen focus. Learn to control your breath for better performance on and off the water.",
    },
    soundHealing: {
      name: "Sound Healing",
      description:
        "Deep relaxation through tibetan bowls and sound frequencies. Release tension, calm your nervous system and restore balance after intense training days.",
    },
    nutrition: {
      name: "Holistic Nutrition",
      description:
        "Learn how to fuel your body with whole foods that enhance recovery, energy and overall wellbeing. Workshops tailored for active lifestyles.",
    },
  },
  about: {
    label: "About Us",
    title: "A Sanctuary for Athletes",
    p1: "Feel Better Club was born from the belief that small, consistent rituals create massive transformation. Our holistic approach combines movement, breath and awareness to help you perform better and feel better every day.",
    p2: "Whether you're a seasoned kiter, a weekend surfer or just starting your journey — there's a place for you here. Small groups, certified coaches, flexible schedules.",
    highlights: [
      "Small groups for personalized attention",
      "Certified coaches with years of experience",
      "Spaces designed for comfort and relaxation",
      "Flexible schedules adapted to your routine",
    ],
    stat: "happy athletes",
  },
  contact: {
    label: "Contact",
    title: "Ready to Feel Better?",
    subtitle: "Write to us and we'll help you find the perfect class.",
    trialTitle: "Try your first class free",
    trialText:
      "Come meet us with no commitment. Choose the discipline that calls you and book your spot.",
    trialCta: "Book a trial class",
    form: {
      name: "Name",
      email: "Email",
      interest: "I'm interested in",
      selectOption: "Select an option",
      message: "Message",
      messagePlaceholder: "Tell us what you need...",
      submit: "Send message",
      sent: "Message sent",
      sentText: "We'll get back to you as soon as possible.",
    },
  },
  booking: {
    title: "Book your spot",
    subtitle: "Select a day and choose the class you like",
    firstName: "First Name",
    firstNamePlaceholder: "Your first name",
    mobile: "Mobile Number",
    mobilePlaceholder: "+34 612 345 678",
    emailOptional: "Email (optional)",
    emailPlaceholder: "you@email.com",
    paymentNote: "Payment is handled on-site (Cash / Card / Revolut).",
    confirm: "Confirm Booking",
    booking: "Booking...",
    confirmed: "Booking Confirmed",
    confirmedText: "We're looking forward to seeing you at",
    at: "at",
    bookAnother: "Book another class",
    spots: "spots",
    full: "Full",
    loading: "Loading classes...",
    noClasses: "No classes scheduled for this day",
    cancelSpot: "Cancel Spot",
    upcomingClass: "Upcoming Class",
    managementNote:
      "You can return to this site anytime to manage a new class or cancel your spot.",
  },
  footer: {
    links: "Links",
    followUs: "Follow Us",
    rights: "All rights reserved.",
    holisticHealth: "Holistic Health Routines",
    tagline: "Small Step · Big Impact",
  },
  admin: {
    dashboard: "Dashboard",
    classes: "Classes",
    schedules: "Schedules",
    students: "Students",
    backToSite: "Back to site",
  },
  common: {
    loading: "Loading...",
    noData: "No data available",
  },
};

// Deep make all values string for translation compatibility
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
      ? string[]
      : DeepStringify<T[K]>;
};

export type Translations = DeepStringify<typeof en>;
export default en;
