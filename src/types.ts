export type Tab = 'accueil' | 'journee' | 'ceremonie' | 'plan' | 'hebergements';
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

export interface Section {
  titre: string;
  details?: string[];
  chants?: string[];
}

export interface Etape {
  titre: string;
  sous?: string;
  texte?: string[];
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
  deroule: Section[];
  livret: Etape[];
  tables: Table[];
}
