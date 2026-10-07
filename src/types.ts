export type Tab = 'accueil' | 'journee' | 'ceremonie' | 'plan' | 'hebergements' | 'contact';
export type Sim = 'reel' | 'veille' | 'matin' | '14h30' | '17h30' | '21h';

export interface Invite {
  nom: string;
  telephone?: string;
}

export interface Table {
  id: string;
  nom: string;
  table?: string;
  x: number;
  y: number;
  ligne?: number;
  colonne?: number;
  honneur?: boolean;
  invites: Invite[];
}

export interface Step {
  heure: string;
  titre: string;
  lieu: string;
  description: string;
  icone: 'alliances' | 'photo' | 'flutes' | 'cloche' | 'musique';
}

export interface Chant {
  label?: string;
  numero?: string;
  titre: string;
  couplets?: string[];
}

export interface Verset {
  n: number;
  t: string;
}

export interface Lecture {
  reference: string;
  versets: Verset[];
}

export interface Section {
  titre: string;
  details?: string[];
  lecture?: Lecture;
  chants?: (string | Chant)[];
}

export interface Etape {
  titre: string;
  sous?: string;
  texte?: string[];
}

export interface Contact {
  role: string;
  nom: string;
  telephone?: string;
  email?: string;
  note?: string;
}

export interface Data {
  mariage: {
    maries: string[];
    date: string;
    dateTexte: string;
    accueil: string;
    lieu: { nom: string; adresse: string };
  };
  programme: Step[];
  contacts?: Contact[];
  deroule: Section[];
  livret: Etape[];
  tables: Table[];
}
