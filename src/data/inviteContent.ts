import { Language } from '../types';
import type { RewardTier } from '../services/referral';

/**
 * Localised copy for the "Invite & protect" programme — both the full page and
 * the reusable share card read from here so the two never drift apart.
 */
export interface InviteCopy {
  liveLabel: string;
  recordingLabel: string;
  inviteSingular: string;
  invitePlural: string;
  toNextPrefix: string;

  hero: {
    titleLead: string;
    titleAccent: string;
    titleTail: string;
    body: string;
    ctaDemo: string;
    ctaCampaigns: string;
  };

  steps: { title: string; body: string }[];

  milestones: {
    eyebrow: string;
    title: string;
    body: string;
    tiers: RewardTier[];
  };

  board: {
    eyebrow: string;
    title: string;
    colRank: string;
    colCitizen: string;
    colDistrict: string;
    colInvites: string;
    colInstalls: string;
    empty: string;
  };

  final: {
    title: string;
    body: string;
    note: string;
  };
}

const en: InviteCopy = {
  liveLabel: 'Live',
  recordingLabel: 'Recording share…',
  inviteSingular: 'invite',
  invitePlural: 'invites',
  toNextPrefix: 'to',

  hero: {
    titleLead: 'Turn one install into a',
    titleAccent: 'safety net',
    titleTail: '.',
    body: 'resQlink only moves as fast as the nearest person who has it. Invite your family, your moto cooperative, your street — and every accident on that road is reported seconds earlier.',
    ctaDemo: 'Open the SOS demo',
    ctaCampaigns: 'RNP safety campaigns'
  },

  steps: [
    {
      title: 'Share your code',
      body: 'Send your resQlink invite link on WhatsApp or by SMS. It works on any phone, with or without data.'
    },
    {
      title: 'A friend installs it',
      body: 'They open the link and install resQlink from Google Play or the App Store. Your code travels with them.'
    },
    {
      title: 'The net gets tighter',
      body: 'Every new reporter means the next accident is reported faster — and the map gains another witness.'
    }
  ],

  milestones: {
    eyebrow: 'Recognition',
    title: 'Milestones along the way',
    body: 'Recognition only — these never affect how quickly an emergency is answered.',
    tiers: [
      {
        invites: 1,
        title: 'First Responder',
        body: 'You brought one more person into the safety net.'
      },
      {
        invites: 3,
        title: 'Umurinzi · Guardian',
        body: 'Unlocks the Guardian badge on your profile.'
      },
      {
        invites: 10,
        title: 'Street Champion',
        body: 'Your umudugudu appears on the district board.'
      },
      {
        invites: 25,
        title: 'District Champion',
        body: 'Invitation to RNP road-safety workshops.'
      }
    ]
  },

  board: {
    eyebrow: 'National board',
    title: 'Citizens growing the safety net',
    colRank: '#',
    colCitizen: 'Citizen',
    colDistrict: 'District',
    colInvites: 'Invites',
    colInstalls: 'Installs',
    empty: 'The board is warming up. Be the first in your district.'
  },

  final: {
    title: 'Not installed yet? Start there.',
    body: 'Free on Android and iPhone. Under 12 MB, works offline, and it speaks your language.',
    note: "Your friend's code is applied automatically when you arrive from their link."
  }
};

const rw: InviteCopy = {
  liveLabel: 'Birakora',
  recordingLabel: 'Turandika gusangiza…',
  inviteSingular: 'gutumira',
  invitePlural: 'gutumira',
  toNextPrefix: 'ugera kuri',

  hero: {
    titleLead: 'Hindura ukoresha umwe mo',
    titleAccent: 'urufunguzo rw\u2019umutekano',
    titleTail: '.',
    body: 'resQlink ikorera ku muvuduko w\u2019umuntu uri hafi wayifite. Tumira umuryango wawe, koperative yawe ya moto, cyangwa umuhanda wanyu wose — buri mpanuka itangazwa vuba kurushaho.',
    ctaDemo: 'Fungura ubutabazi (SOS)',
    ctaCampaigns: 'Ubukangurambaga bwa RNP'
  },

  steps: [
    {
      title: 'Sangiza kode yawe',
      body: 'Ohereza umurongo wawe wo gutumira kuri WhatsApp cyangwa SMS. Ikora kuri telefone iyo ari yo yose, n\u2019interineti cyangwa nta yo.'
    },
    {
      title: 'Inshuti yawe irayishyiraho',
      body: 'Afunze umurongo, agakura resQlink kuri Google Play cyangwa App Store. Kode yawe igenda hamwe na we.'
    },
    {
      title: 'Umutekano urushaho gukomera',
      body: 'Buri muntu mushya yongeweho bivuze ko impanuka ikurikira izatangazwa vuba — kandi ikarita igira undi wabona.'
    }
  ],

  milestones: {
    eyebrow: 'Icyubahiro',
    title: 'Intambwe ugenda ugera',
    body: 'Ni icyubahiro gusa — nta ngaruka ku buryo ubutabazi bwihuta.',
    tiers: [
      {
        invites: 1,
        title: 'Umutabazi wa Mbere',
        body: 'Wongeye umuntu umwe mu rufunguzo rw\u2019umutekano.'
      },
      {
        invites: 3,
        title: 'Umurinzi',
        body: 'Uhabwa ikimenyetso cy\u2019Umurinzi ku mwirondoro wawe.'
      },
      {
        invites: 10,
        title: 'Intwari y\u2019Umuhanda',
        body: 'Umudugudu wawe ugaragara ku rutonde rw\u2019akarere.'
      },
      {
        invites: 25,
        title: 'Intwari y\u2019Akarere',
        body: 'Utumirwa mu mahugurwa y\u2019umutekano wo mu muhanda ya RNP.'
      }
    ]
  },

  board: {
    eyebrow: 'Urutonde rw\u2019igihugu',
    title: 'Abaturage bakomeza umutekano',
    colRank: '#',
    colCitizen: 'Umuturage',
    colDistrict: 'Akarere',
    colInvites: 'Aboherereje',
    colInstalls: 'Bashyizeho',
    empty: 'Urutonde rutangira. Ba uwa mbere mu karere kawe.'
  },

  final: {
    title: 'Ntirayishyiraho? Tangira aho.',
    body: 'Ni ubuntu kuri Android na iPhone. Munsi ya 12 MB, ikora nta interineti, kandi ivuga ururimi rwawe.',
    note: 'Kode y\u2019umuturanyi wawe ishyirwa mu bikorwa yikora iyo uje uhereye ku murongo we.'
  }
};

const fr: InviteCopy = {
  liveLabel: 'En direct',
  recordingLabel: 'Enregistrement du partage…',
  inviteSingular: 'invitation',
  invitePlural: 'invitations',
  toNextPrefix: 'avant',

  hero: {
    titleLead: 'Transformez une installation en',
    titleAccent: 'filet de sécurité',
    titleTail: '.',
    body: 'resQlink n\u2019avance qu\u2019aussi vite que la personne la plus proche qui l\u2019a installée. Invitez votre famille, votre coopérative de motos, toute votre rue — et chaque accident sur cette route est signalé quelques secondes plus tôt.',
    ctaDemo: 'Ouvrir la démo SOS',
    ctaCampaigns: 'Campagnes de sécurité RNP'
  },

  steps: [
    {
      title: 'Partagez votre code',
      body: 'Envoyez votre lien d\u2019invitation resQlink par WhatsApp ou par SMS. Il fonctionne sur n\u2019importe quel téléphone, avec ou sans données.'
    },
    {
      title: 'Un proche l\u2019installe',
      body: 'Il ouvre le lien et installe resQlink depuis Google Play ou l\u2019App Store. Votre code voyage avec lui.'
    },
    {
      title: 'Le filet se resserre',
      body: 'Chaque nouveau signalement accélère le suivant — et la carte gagne un témoin de plus.'
    }
  ],

  milestones: {
    eyebrow: 'Reconnaissance',
    title: 'Les paliers à franchir',
    body: 'Reconnaissance uniquement — cela ne change jamais la rapidité de la réponse d\u2019urgence.',
    tiers: [
      {
        invites: 1,
        title: 'Premier intervenant',
        body: 'Vous avez ajouté une personne de plus au filet de sécurité.'
      },
      {
        invites: 3,
        title: 'Umurinzi · Gardien',
        body: 'Débloque le badge Gardien sur votre profil.'
      },
      {
        invites: 10,
        title: 'Champion de quartier',
        body: 'Votre umudugudu apparaît au classement du district.'
      },
      {
        invites: 25,
        title: 'Champion de district',
        body: 'Invitation aux ateliers de sécurité routière de la RNP.'
      }
    ]
  },

  board: {
    eyebrow: 'Classement national',
    title: 'Les citoyens qui élargissent le filet',
    colRank: '#',
    colCitizen: 'Citoyen',
    colDistrict: 'District',
    colInvites: 'Invitations',
    colInstalls: 'Installations',
    empty: 'Le classement se met en place. Soyez le premier de votre district.'
  },

  final: {
    title: 'Pas encore installée ? Commencez par là.',
    body: 'Gratuit sur Android et iPhone. Moins de 12 Mo, fonctionne hors ligne et parle votre langue.',
    note: 'Le code de votre proche s\u2019applique automatiquement quand vous arrivez depuis son lien.'
  }
};

export const INVITE_CONTENT: Record<Language, InviteCopy> = { en, rw, fr };

export function inviteCopy(lang: Language): InviteCopy {
  return INVITE_CONTENT[lang] ?? INVITE_CONTENT.en;
}
