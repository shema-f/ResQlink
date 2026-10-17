import { Language } from '../types';

/**
 * Localised marketing copy for the landing page.
 *
 * Kept separate from `translations.ts` (which holds short UI chrome strings)
 * because marketing prose is long-form, structured and translated by a
 * different kind of reviewer. The `Record<Language, LandingCopy>` type means a
 * missing or misspelled key is a compile error rather than a silent English
 * fallback in production.
 *
 * Icons, names, IDs and numbers deliberately live in the component — this file
 * is pure text so it can be handed to a translator as-is.
 */
export interface LandingCopy {
  ticker: string[];

  hero: {
    badgeNew: string;
    badgeTail: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    body: string;
    ratingsSuffix: string;
    downloadsSuffix: string;
    freeForever: string;
    ctaDemo: string;
    ctaAi: string;
    chipDispatch: string;
    chipDispatchSub: string;
    chipSms: string;
    chipSmsSub: string;
  };

  phone: {
    live: string;
    locationLocked: string;
    locationName: string;
    sos: string;
    tapToDispatch: string;
    unitName: string;
    unitStatus: string;
    aiHint: string;
  };

  stats: { label: string }[];

  features: {
    eyebrow: string;
    title: string;
    body: string;
    items: { title: string; body: string }[];
  };

  ai: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    body: string;
    bullets: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    note: string;
  };

  steps: {
    eyebrow: string;
    title: string;
    items: { title: string; body: string }[];
  };

  agencies: {
    eyebrow: string;
    title: string;
    body: string;
    badges: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    consoleTitle: string;
    consoleMeta: string;
    consoleUnits: string;
    consoleSocket: string;
    rows: { type: string; priority: string; eta: string }[];
  };

  testimonials: {
    title: string;
    items: { quote: string; role: string }[];
  };

  invite: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    body: string;
    bullets: string[];
    cta: string;
  };

  faq: { title: string; items: { q: string; a: string }[] };

  download: {
    badge: string;
    title: string;
    body: string;
    reviews: string;
    tollFree: string;
    scan: string;
    platforms: string;
  };

  compliance: string[];
}

const en: LandingCopy = {
  ticker: [
    'One-tap SOS dispatch',
    'Gemini-powered AI copilot',
    'Offline SMS + USSD *113#',
    'Live responder tracking',
    'Kinyarwanda · English · Français',
    'DPPO compliant',
    'All 30 districts covered'
  ],

  hero: {
    badgeNew: 'New',
    badgeTail: 'AI copilot & offline SMS now live',
    titleLead: 'Help arrives in',
    titleAccent: 'seconds,',
    titleTail: 'not minutes.',
    body: 'resQlink is Rwanda\u2019s national emergency response app. One tap sends your exact GPS position, casualties and hazards straight to the Rwanda National Police, SAMU and the Fire & Rescue Brigade — with an AI copilot talking you through every second.',
    ratingsSuffix: 'ratings',
    downloadsSuffix: 'downloads',
    freeForever: 'Free forever',
    ctaDemo: 'Try the live SOS demo',
    ctaAi: 'Ask the AI copilot',
    chipDispatch: '4.2s to dispatch',
    chipDispatchSub: '256-bit, RNP encrypted',
    chipSms: 'SMS fallback ready',
    chipSmsSub: '*113# · no data needed'
  },

  phone: {
    live: 'Live',
    locationLocked: 'Location locked · ±6 m',
    locationName: 'KN 5 Rd, Kimihurura',
    sos: 'SOS',
    tapToDispatch: 'Tap to dispatch',
    unitName: 'RNP Unit Alpha-4',
    unitStatus: 'En route · ETA 4 min',
    aiHint: 'I pre-briefed the 112 operator in Kinyarwanda. Keep the rider still.'
  },

  stats: [
    { label: 'Average alert to dispatch' },
    { label: 'Citizens protected' },
    { label: 'Districts covered' },
    { label: 'GPS accuracy under 10m' }
  ],

  features: {
    eyebrow: 'Built for Rwanda',
    title: 'Everything an emergency needs, in one pocket app.',
    body: 'Designed with the Rwanda National Police traffic directorate and SAMU paramedics, then hardened for the reality of Rwandan roads.',
    items: [
      {
        title: 'One-tap SOS',
        body: 'A single, panic-proof button locks your GPS and pushes a triaged report to RNP & SAMU in seconds.'
      },
      {
        title: 'Uwera AI copilot',
        body: 'Gemini-powered guidance in Kinyarwanda, English or French — CPR steps, what to say, what not to touch.'
      },
      {
        title: 'Live RNP dispatch',
        body: 'Watch the assigned patrol, ambulance or fire unit move towards you with a live ETA on the map.'
      },
      {
        title: 'Works without data',
        body: 'No signal on the Nyungwe road? Incidents queue locally and fall back to SMS and USSD *113#.'
      },
      {
        title: 'Truly multilingual',
        body: 'Kinyarwanda, English and French across the whole flow — including the AI and the operator script.'
      },
      {
        title: 'DPPO compliant',
        body: 'Location and health data handled under Rwanda Law No. 058/2021 with a full audit trail.'
      }
    ]
  },

  ai: {
    eyebrow: 'AI copilot',
    titleLead: 'Meet',
    titleAccent: 'Uwera',
    titleTail: ', the calm voice in the chaos.',
    body: 'Powered by Google Gemini, Uwera understands Kinyarwanda, English and French. It triages what you describe, gives you the exact first-aid steps, tells you which of the four emergency lines to dial, and pre-writes the briefing the operator will ask for.',
    bullets: [
      'Natural conversation in your own language',
      'Suggests the fastest emergency number, instantly',
      'Prepares the operator briefing from your answers',
      'Voice-note triage for when you cannot type'
    ],
    ctaPrimary: 'Chat with Uwera now',
    ctaSecondary: 'How it is built',
    note: 'Uwera guides, it never dispatches. In a life-threatening emergency always call 112.'
  },

  steps: {
    eyebrow: 'Three taps',
    title: 'From panic to a dispatched unit.',
    items: [
      {
        title: 'Get the app',
        body: 'Install resQlink from Google Play or the App Store — free, under 12 MB, works on 3G.'
      },
      {
        title: 'Tap SOS',
        body: 'Confirm your GPS pin, pick the incident type and casualty count. That is the whole triage.'
      },
      {
        title: 'Help is rolling',
        body: 'RNP, SAMU or Fire & Rescue is dispatched instantly. Track the unit and talk to it from the app.'
      }
    ]
  },

  agencies: {
    eyebrow: 'For agencies',
    title: 'The command side of resQlink.',
    body: 'Dispatchers see every incident live on a PostGIS map with automatic spatial triage. Field units get a responder app with GPS heartbeats, navigation to the scene and one tap status transitions.',
    badges: [
      'Real-time siren alerts',
      'Road hazard workflows',
      'PostGIS proximity routing',
      'Photo & voice evidence'
    ],
    ctaPrimary: 'Open Command Center',
    ctaSecondary: 'Responder view',
    consoleTitle: 'RNP Operations · Live',
    consoleMeta: 'Kigali · 06:47',
    consoleUnits: '4 units en route',
    consoleSocket: 'Socket.IO connected',
    rows: [
      { type: 'Moto collision', priority: 'CRITICAL', eta: '4 min' },
      { type: 'Truck overturned', priority: 'HIGH', eta: '7 min' },
      { type: 'Pedestrian struck', priority: 'MODERATE', eta: 'On scene' }
    ]
  },

  testimonials: {
    title: 'Trusted on every hill.',
    items: [
      {
        quote:
          'I was on the Kigali–Musanze road at night. One tap, GPS sent, ambulance in eleven minutes. resQlink honestly saved my leg.',
        role: 'Moto taxi operator, Kigali'
      },
      {
        quote:
          'The triage details arrive before the call does. We stopped guessing where the accident happened — the coordinates are exact.',
        role: 'RNP Traffic Directorate'
      },
      {
        quote:
          'My mother collapsed and I panicked. Uwera kept talking me through it in Kinyarwanda while SAMU was on the way.',
        role: 'Citizen, Huye'
      }
    ]
  },

  invite: {
    eyebrow: 'Invite & protect',
    titleLead: 'Turn one install into a',
    titleAccent: 'safety net',
    titleTail: '.',
    body: 'resQlink only moves as fast as the nearest person who has it. Share your personal code over WhatsApp or SMS — your family, your moto cooperative, your whole street.',
    bullets: [
      'One tap to share on WhatsApp or by plain SMS',
      'Milestones and a district board for the citizens who recruit most',
      'Codes travel with the link — no typing, no friction'
    ],
    cta: 'See the invite programme'
  },

  faq: {
    title: 'Questions, answered.',
    items: [
      {
        q: 'Is resQlink really free?',
        a: 'Yes. Downloading and using resQlink is free for every resident and visitor in Rwanda. Emergency calls to 112, 113, 111 and 912 are toll-free.'
      },
      {
        q: 'Does it work without internet?',
        a: 'Your report is saved on the device and transmitted over SMS and the USSD *113# menu as soon as a network is available. GPS and the offline guidance stay available with no data at all.'
      },
      {
        q: 'Who can see my location?',
        a: 'Only the RNP/SAMU dispatcher handling your incident, for as long as it takes to resolve it. Everything is logged under Rwanda Law No. 058/2021 and the DPPO audit trail.'
      },
      {
        q: 'What exactly does the AI do?',
        a: 'Uwera is a guidance copilot, not a dispatcher. It gives first-aid steps, tells you which number to call and prepares an operator briefing in your language. Every reply nudges you to call 112 when it matters.'
      },
      {
        q: 'Is it available outside Kigali?',
        a: 'resQlink covers all 30 districts of Rwanda, with verified RNP stations, hospitals, health centres and fire brigades mapped nationwide.'
      }
    ]
  },

  download: {
    badge: 'Free · No ads · Under 12 MB',
    title: 'Install resQlink before you need it.',
    body: 'The seconds you save installing it today are the seconds that save a life tomorrow. Available now for Android and iPhone across Rwanda.',
    reviews: 'reviews',
    tollFree: 'Toll-free emergency lines built in',
    scan: 'Scan to install',
    platforms: 'Android · iOS'
  },

  compliance: [
    'DPPO · Law No. 058/2021',
    'Rwanda National Police aligned',
    'RNP Traffic Directorate',
    'Fire & Rescue Brigade',
    'SAMU Emergency Medical'
  ]
};

const rw: LandingCopy = {
  ticker: [
    'Kanda rimwe, ubutabazi buhita buhamagarwa',
    'Umufasha wa AI (Gemini)',
    'SMS na USSD *113# nta interineti',
    'Gukurikirana umutabazi mu nzira',
    'Ikinyarwanda · Icyongereza · Igifaransa',
    'Bubahiriza amategeko ya DPPO',
    'Uturere twose 30'
  ],

  hero: {
    badgeNew: 'Nshya',
    badgeTail: 'Umufasha wa AI na SMS nta interineti birakora',
    titleLead: 'Ubutabazi buhagera',
    titleAccent: 'vuba cyane,',
    titleTail: 'ntibutinda.',
    body: 'resQlink ni porogaramu y\u2019igihugu y\u2019ubutabazi mu Rwanda. Kanda rimwe, ahantu uri, umubare w\u2019abakomeretse n\u2019ibyago bihita biherezwa kuri Polisi y\u2019u Rwanda, SAMU na Kizimyamuriro — hamwe n\u2019umufasha wa AI ukubwira icyo gukora buri kanya.',
    ratingsSuffix: 'amanota',
    downloadsSuffix: 'bakuramo',
    freeForever: 'Ni ubuntu iteka',
    ctaDemo: 'Gerageza ubutabazi (SOS)',
    ctaAi: 'Baza umufasha wa AI',
    chipDispatch: 'Amasegonda 4.2 kugera ku butabazi',
    chipDispatchSub: 'Bishyizwe mu ibanga na RNP',
    chipSms: 'SMS yiteguye',
    chipSmsSub: '*113# · nta interineti ikenewe'
  },

  phone: {
    live: 'Birakora',
    locationLocked: 'Aho uri hamenyekanye · ±6 m',
    locationName: 'KN 5 Rd, Kimihurura',
    sos: 'SOS',
    tapToDispatch: 'Kanda uhamagare',
    unitName: 'Ikipe ya RNP Alpha-4',
    unitStatus: 'Iri mu nzira · amasegonda 4',
    aiHint: 'Nabwiye uwakira kuri 112 mu Kinyarwanda. Ntuhindure umunyamotoka.'
  },

  stats: [
    { label: 'Igihe rusange kuva ukanze kugera ku butabazi' },
    { label: 'Abaturage barinzwe' },
    { label: 'Uturere twose' },
    { label: 'GPS yizewe munsi ya metero 10' }
  ],

  features: {
    eyebrow: 'Yakorewe u Rwanda',
    title: 'Ibyose ubutabazi bukeneye, muri porogaramu imwe.',
    body: 'Yakorewe hamwe n\u2019ishami ry\u2019impanuka rya Polisi y\u2019u Rwanda n\u2019abaganga ba SAMU, hanyuma igakomezwa ku buryo buhuye n\u2019imihanda y\u2019u Rwanda.',
    items: [
      {
        title: 'SOS mu kanda rimwe',
        body: 'Akabuto kamwe gashyira ahantu uri kuri GPS, gahita kohereza raporo kuri RNP na SAMU mu masegonda make.'
      },
      {
        title: 'Umufasha wa AI, Uwera',
        body: 'Ufasha mu Kinyarwanda, Icyongereza cyangwa Igifaransa — intambwe za CPR, icyo uvuga, n\u2019icyo utakora.'
      },
      {
        title: 'Gukurikirana ubutabazi',
        body: 'Reba imodoka ya Polisi, iy\u2019abakomeretse cyangwa iy\u2019abazimya umuriro aho iri n\u2019igihe izagera ku ikarita.'
      },
      {
        title: 'Ikora nta interineti',
        body: 'Nta signal mu ishyamba rya Nyungwe? Raporo ibikwa muri telefone, hanyuma yoherezwa kuri SMS na USSD *113#.'
      },
      {
        title: 'Indimi eshatu',
        body: 'Ikinyarwanda, Icyongereza na Igifaransa mu byose — harimo umufasha wa AI n\u2019inyandiko y\u2019uwakira telefone.'
      },
      {
        title: 'Bubahiriza DPPO',
        body: 'Amakuru y\u2019ahantu uri n\u2019ubuzima acungwa hakurikijwe itegeko No. 058/2021 hamwe n\u2019ubugenzuzi bukomeye.'
      }
    ]
  },

  ai: {
    eyebrow: 'Umufasha wa AI',
    titleLead: 'Menya',
    titleAccent: 'Uwera',
    titleTail: ', ijwi rituma utatakaza umutwe.',
    body: 'Uwera akoresha ubwenge buhangano bwa Google Gemini, kandi aumva Ikinyarwanda, Icyongereza na Igifaransa. Asuzuma ibyabaye, akaguha intambwe z\u2019ubufasha bwihutirwa, akakubwira nimero yo guhamagara mu zine, hanyuma agategura ubutumwa uwakira telefone azakenera.',
    bullets: [
      'Ikiganiro kigenda mu rurimi rwawe',
      'Akubwira nimero y\u2019ubutabazi yihuse',
      'Agategura ubutumwa bw\u2019uwakira telefone',
      'Ijwi ry\u2019ubufasha igihe udashobora kwandika'
    ],
    ctaPrimary: 'Vugana na Uwera ubu',
    ctaSecondary: 'Uko yakorewe',
    note: 'Uwera agufasha gusa, ntiyigeze yohereza ubutabazi. Mu kaga gakomeye, hamagara 112 ako kanya.'
  },

  steps: {
    eyebrow: 'Inzira eshatu',
    title: 'Kuva mu bwoba kugera ku butabazi buhagera.',
    items: [
      {
        title: 'Shakira porogaramu',
        body: 'Kuramo resQlink kuri Google Play cyangwa App Store — ni ubuntu, munsi ya 12 MB, ikora kuri 3G.'
      },
      {
        title: 'Kanda SOS',
        body: 'Emeza aho uri kuri GPS, hitamo ubwoko bw\u2019impanuka n\u2019umubare w\u2019abakomeretse. Ni byo byose.'
      },
      {
        title: 'Ubutabazi buri mu nzira',
        body: 'RNP, SAMU cyangwa Kizimyamuriro bihita boherezwa. Kurikirana ikipe kandi uvugane na yo muri porogaramu.'
      }
    ]
  },

  agencies: {
    eyebrow: 'Ku bigo',
    title: 'Uruhande rw\u2019ibiro bikuru bya resQlink.',
    body: 'Abakira ubutabazi babona impanuka zose ku ikarita ya PostGIS, hamwe n\u2019isuzuma ryihuse ry\u2019ahantu. Amakipe ari mu muhanda abona porogaramu ifite GPS, inzira igana aho byabereye, n\u2019ihindura ry\u2019imiterere mu kanda rimwe.',
    badges: [
      'Impuruza zihita zivuga',
      'Gucunga inzitizi zo mu muhanda',
      'Inzira zishingiye kuri PostGIS',
      'Amafoto n\u2019amajwi nk\u2019ibimenyetso'
    ],
    ctaPrimary: 'Fungura Ibiro Bikuru',
    ctaSecondary: 'Reba umutabazi',
    consoleTitle: 'Ibikorwa bya RNP · Birakora',
    consoleMeta: 'Kigali · 06:47',
    consoleUnits: 'Amakipe 4 ari mu nzira',
    consoleSocket: 'Socket.IO ihujwe',
    rows: [
      { type: 'Impanuka ya moto', priority: 'BYIHUTIRWA', eta: '4 min' },
      { type: 'Ikamyo yapindutse', priority: 'IKOMEYE', eta: '7 min' },
      { type: 'Umunyamaguru yagonzwe', priority: 'ICIRIRITSE', eta: 'Aho byabereye' }
    ]
  },

  testimonials: {
    title: 'Bizerwa ku misozi yose.',
    items: [
      {
        quote:
          'Nari mu muhanda wa Kigali–Musanze nijoro. Kanda rimwe, GPS yoherejwe, imodoka y\u2019abakomeretse ihagera mu minota cumi n\u2019umwe. resQlink yarokoye ukuguru kwanjye.',
        role: 'Umunyamotoka, Kigali'
      },
      {
        quote:
          'Amakuru y\u2019impanuka arahagera mbere y\u2019uko telefone ihamagara. Twaretse kwiyumvisha aho byabereye — aho hantu ni ukuri.',
        role: 'Ishami ry\u2019impanuka rya RNP'
      },
      {
        quote:
          'Mama yaguye maze ndatakaza umutwe. Uwera yambwirizaga mu Kinyarwanda mu gihe SAMU yari mu nzira.',
        role: 'Umuturage, Huye'
      }
    ]
  },

  invite: {
    eyebrow: 'Tumira & urinde',
    titleLead: 'Hindura ukoresha umwe mo',
    titleAccent: 'urufunguzo rw\u2019umutekano',
    titleTail: '.',
    body: 'resQlink ikorera ku muvuduko w\u2019umuntu uri hafi wayifite. Sangiza kode yawe binyuze kuri WhatsApp cyangwa SMS — umuryango wawe, koperative yawe ya moto, cyangwa umuhanda wanyu wose.',
    bullets: [
      'Kanda rimwe usangize kuri WhatsApp cyangwa SMS',
      'Ibihembo n\u2019urutonde rw\u2019akarere ku batumira benshi',
      'Kode igenda hamwe n\u2019umurongo — nta kwandika'
    ],
    cta: 'Reba gahunda yo gutumira'
  },

  faq: {
    title: 'Ibibazo, ibisubizo.',
    items: [
      {
        q: 'Ese resQlink ni ubuntu koko?',
        a: 'Yego. Kuramo no gukoresha resQlink ni ubuntu ku baturage bose n\u2019abashyitsi mu Rwanda. Guhamagara 112, 113, 111 na 912 ntibiritse.'
      },
      {
        q: 'Ese ikora nta interineti?',
        a: 'Raporo yawe ibikwa muri telefone, hanyuma yoherezwa kuri SMS na USSD *113# ako kanya interineti ibonetse. GPS n\u2019ubufasha bwayo bikomeza gukora nta interineti na gato.'
      },
      {
        q: 'Ni nde ushobora kubona aho ndi?',
        a: 'Ni uwakira ubutabazi muri RNP cyangwa SAMU ukora kuri impanuka yawe gusa, mu gihe isabwa kugira ngo irangire. Byose byandikwa hakurikijwe itegeko No. 058/2021 na DPPO.'
      },
      {
        q: 'Umufasha wa AI akora iki nyine?',
        a: 'Uwera ni umufasha ugutera inkunga, ntabwo ari uwakira telefone. Akaguha intambwe z\u2019ubufasha bwihutirwa, akakubwira nimero yo guhamagara, kandi agategure ubutumwa uwakira telefone azasaba. Buri gisubizo agushishikariza guhamagara 112.'
      },
      {
        q: 'Ese iraboneka hanze ya Kigali?',
        a: 'resQlink ikora mu turere twose 30 tw\u2019u Rwanda, hamwe n\u2019ibitaro, ibigo nderabuzima, sitasiyo za Polisi na Kizimyamuriro byanditswe ku ikarita.'
      }
    ]
  },

  download: {
    badge: 'Ubuntu · Nta kwamamaza · Munsi ya 12 MB',
    title: 'Shyiraho resQlink mbere y\u2019uko uyikenera.',
    body: 'Amasegonda uzigama uyishyiraho uyu munsi ni yo azarokora ubuzima ejo. Iraboneka kuri Android na iPhone mu Rwanda hose.',
    reviews: 'amanota',
    tollFree: 'Nimero z\u2019ubutabazi ziri muri porogaramu',
    scan: 'Sikana kugira ushyireho',
    platforms: 'Android · iOS'
  },

  compliance: [
    'DPPO · Itegeko No. 058/2021',
    'Bihuye na Polisi y\u2019u Rwanda',
    'Ishami ry\u2019impanuka rya RNP',
    'Kizimyamuriro',
    'SAMU · Ubutabazi bw\u2019ubuvuzi'
  ]
};

const fr: LandingCopy = {
  ticker: [
    'Alerte SOS en un seul geste',
    'Copilote IA propulsé par Gemini',
    'SMS et USSD *113# hors ligne',
    'Suivi des secours en direct',
    'Kinyarwanda · Anglais · Français',
    'Conforme DPPO',
    'Les 30 districts couverts'
  ],

  hero: {
    badgeNew: 'Nouveau',
    badgeTail: 'copilote IA et SMS hors ligne disponibles',
    titleLead: 'Les secours arrivent en',
    titleAccent: 'quelques secondes,',
    titleTail: 'pas en minutes.',
    body: 'resQlink est l\u2019application nationale d\u2019urgence du Rwanda. Un seul geste envoie votre position GPS exacte, le nombre de blessés et les dangers directement à la Police Nationale du Rwanda, au SAMU et aux Sapeurs-Pompiers — avec un copilote IA qui vous guide à chaque seconde.',
    ratingsSuffix: 'notes',
    downloadsSuffix: 'téléchargements',
    freeForever: 'Gratuit pour toujours',
    ctaDemo: 'Essayer la démo SOS',
    ctaAi: 'Interroger le copilote IA',
    chipDispatch: '4,2 s jusqu\u2019à l\u2019alerte',
    chipDispatchSub: 'Chiffré 256 bits, RNP',
    chipSms: 'Repli SMS prêt',
    chipSmsSub: '*113# · sans données mobiles'
  },

  phone: {
    live: 'En direct',
    locationLocked: 'Position verrouillée · ±6 m',
    locationName: 'KN 5 Rd, Kimihurura',
    sos: 'SOS',
    tapToDispatch: 'Touchez pour alerter',
    unitName: 'Unité RNP Alpha-4',
    unitStatus: 'En route · arrivée 4 min',
    aiHint: 'J\u2019ai préparé l\u2019opérateur du 112 en kinyarwanda. Ne déplacez pas le motard.'
  },

  stats: [
    { label: 'Délai moyen entre l\u2019alerte et le départ' },
    { label: 'Citoyens protégés' },
    { label: 'Districts couverts' },
    { label: 'Précision GPS sous 10 m' }
  ],

  features: {
    eyebrow: 'Conçu pour le Rwanda',
    title: 'Tout ce qu\u2019une urgence exige, dans une seule application.',
    body: 'Conçue avec la direction de la circulation de la Police Nationale du Rwanda et les urgentistes du SAMU, puis éprouvée sur la réalité des routes rwandaises.',
    items: [
      {
        title: 'SOS en un seul geste',
        body: 'Un seul bouton, impossible à rater, verrouille votre GPS et transmet un rapport trié à la RNP et au SAMU en quelques secondes.'
      },
      {
        title: 'Copilote IA Uwera',
        body: 'Une assistance propulsée par Gemini en kinyarwanda, anglais ou français — les gestes de réanimation, quoi dire, quoi ne pas toucher.'
      },
      {
        title: 'Déploiement RNP en direct',
        body: 'Suivez la patrouille, l\u2019ambulance ou les pompiers affectés à votre incident, avec un temps d\u2019arrivée en direct sur la carte.'
      },
      {
        title: 'Fonctionne sans données',
        body: 'Pas de réseau sur la route de Nyungwe ? Les incidents sont mis en file localement puis envoyés par SMS et USSD *113#.'
      },
      {
        title: 'Vraiment multilingue',
        body: 'Kinyarwanda, anglais et français sur tout le parcours — y compris l\u2019IA et le texte lu à l\u2019opérateur.'
      },
      {
        title: 'Conforme DPPO',
        body: 'Les données de localisation et de santé sont traitées selon la loi rwandaise n° 058/2021, avec une piste d\u2019audit complète.'
      }
    ]
  },

  ai: {
    eyebrow: 'Copilote IA',
    titleLead: 'Découvrez',
    titleAccent: 'Uwera',
    titleTail: ', la voix calme dans le chaos.',
    body: 'Propulsée par Google Gemini, Uwera comprend le kinyarwanda, l\u2019anglais et le français. Elle trie ce que vous décrivez, vous donne les gestes de premiers secours, vous indique lequel des quatre numéros d\u2019urgence appeler et prépare le message que l\u2019opérateur vous demandera.',
    bullets: [
      'Une conversation naturelle dans votre langue',
      'Le numéro d\u2019urgence le plus rapide, immédiatement',
      'Le message à lire à l\u2019opérateur, préparé pour vous',
      'Le tri par note vocale quand vous ne pouvez pas écrire'
    ],
    ctaPrimary: 'Parler à Uwera maintenant',
    ctaSecondary: 'Comment c\u2019est construit',
    note: 'Uwera vous guide, elle ne déclenche jamais les secours. En cas d\u2019urgence vitale, appelez immédiatement le 112.'
  },

  steps: {
    eyebrow: 'Trois gestes',
    title: 'De la panique à une unité en route.',
    items: [
      {
        title: 'Installez l\u2019application',
        body: 'Téléchargez resQlink depuis Google Play ou l\u2019App Store — gratuit, moins de 12 Mo, fonctionne en 3G.'
      },
      {
        title: 'Touchez SOS',
        body: 'Confirmez votre position GPS, choisissez le type d\u2019incident et le nombre de blessés. C\u2019est tout le tri.'
      },
      {
        title: 'Les secours roulent',
        body: 'La RNP, le SAMU ou les pompiers sont envoyés immédiatement. Suivez l\u2019unité et parlez-lui depuis l\u2019application.'
      }
    ]
  },

  agencies: {
    eyebrow: 'Pour les institutions',
    title: 'Le versant commandement de resQlink.',
    body: 'Les opérateurs voient chaque incident en direct sur une carte PostGIS avec un tri spatial automatique. Les unités de terrain disposent d\u2019une application avec position GPS continue, navigation vers la scène et changement de statut en un geste.',
    badges: [
      'Alertes sirène en temps réel',
      'Flux de travail des dangers routiers',
      'Routage par proximité PostGIS',
      'Preuves photo et vocales'
    ],
    ctaPrimary: 'Ouvrir le centre de commandement',
    ctaSecondary: 'Vue des intervenants',
    consoleTitle: 'Opérations RNP · En direct',
    consoleMeta: 'Kigali · 06:47',
    consoleUnits: '4 unités en route',
    consoleSocket: 'Socket.IO connecté',
    rows: [
      { type: 'Collision de moto', priority: 'CRITIQUE', eta: '4 min' },
      { type: 'Camion renversé', priority: 'ÉLEVÉ', eta: '7 min' },
      { type: 'Piéton renversé', priority: 'MODÉRÉ', eta: 'Sur place' }
    ]
  },

  testimonials: {
    title: 'Une confiance sur toutes les collines.',
    items: [
      {
        quote:
          'J\u2019étais sur la route Kigali–Musanze de nuit. Un geste, le GPS envoyé, l\u2019ambulance en onze minutes. resQlink m\u2019a sauvé la jambe.',
        role: 'Conducteur de moto-taxi, Kigali'
      },
      {
        quote:
          'Les détails du tri arrivent avant l\u2019appel. Nous ne devinons plus où l\u2019accident a eu lieu — les coordonnées sont exactes.',
        role: 'Direction de la circulation, RNP'
      },
      {
        quote:
          'Ma mère s\u2019est effondrée et j\u2019ai paniqué. Uwera m\u2019a guidée en kinyarwanda pendant que le SAMU arrivait.',
        role: 'Citoyenne, Huye'
      }
    ]
  },

  invite: {
    eyebrow: 'Inviter & protéger',
    titleLead: 'Transformez une installation en',
    titleAccent: 'filet de sécurité',
    titleTail: '.',
    body: 'resQlink n\u2019avance qu\u2019aussi vite que la personne la plus proche qui l\u2019a installée. Partagez votre code personnel par WhatsApp ou SMS — votre famille, votre coopérative de motos, toute votre rue.',
    bullets: [
      'Un geste pour partager sur WhatsApp ou par SMS simple',
      'Des paliers et un classement par district pour les plus actifs',
      'Le code voyage avec le lien — rien à saisir'
    ],
    cta: 'Voir le programme d\u2019invitation'
  },

  faq: {
    title: 'Vos questions, nos réponses.',
    items: [
      {
        q: 'resQlink est-il vraiment gratuit ?',
        a: 'Oui. Télécharger et utiliser resQlink est gratuit pour tout résident et tout visiteur au Rwanda. Les appels d\u2019urgence vers 112, 113, 111 et 912 sont gratuits.'
      },
      {
        q: 'Fonctionne-t-elle sans internet ?',
        a: 'Votre rapport est enregistré sur l\u2019appareil puis transmis par SMS et via le menu USSD *113# dès qu\u2019un réseau est disponible. Le GPS et l\u2019assistance hors ligne restent opérationnels sans aucune donnée.'
      },
      {
        q: 'Qui peut voir ma position ?',
        a: 'Seul l\u2019opérateur RNP ou SAMU qui traite votre incident, pendant le temps nécessaire à sa résolution. Tout est journalisé selon la loi rwandaise n° 058/2021 et la piste d\u2019audit DPPO.'
      },
      {
        q: 'Que fait exactement l\u2019IA ?',
        a: 'Uwera est un copilote d\u2019assistance, pas un opérateur de dispatch. Elle donne les gestes de premiers secours, indique le numéro à appeler et prépare un message pour l\u2019opérateur dans votre langue. Chaque réponse vous invite à appeler le 112 quand c\u2019est nécessaire.'
      },
      {
        q: 'Est-elle disponible hors de Kigali ?',
        a: 'resQlink couvre les 30 districts du Rwanda, avec les postes de police, hôpitaux, centres de santé et casernes de pompiers vérifiés et cartographiés à l\u2019échelle nationale.'
      }
    ]
  },

  download: {
    badge: 'Gratuit · Sans publicité · Moins de 12 Mo',
    title: 'Installez resQlink avant d\u2019en avoir besoin.',
    body: 'Les secondes gagnées en l\u2019installant aujourd\u2019hui sont celles qui sauveront une vie demain. Disponible dès maintenant sur Android et iPhone partout au Rwanda.',
    reviews: 'avis',
    tollFree: 'Numéros d\u2019urgence gratuits intégrés',
    scan: 'Scannez pour installer',
    platforms: 'Android · iOS'
  },

  compliance: [
    'DPPO · Loi n° 058/2021',
    'Aligné avec la Police Nationale du Rwanda',
    'Direction de la circulation, RNP',
    'Brigade des Sapeurs-Pompiers',
    'SAMU · Urgences médicales'
  ]
};

export const LANDING_CONTENT: Record<Language, LandingCopy> = { en, rw, fr };

/** Convenience accessor used by the landing page. */
export function landingCopy(lang: Language): LandingCopy {
  return LANDING_CONTENT[lang] ?? LANDING_CONTENT.en;
}
