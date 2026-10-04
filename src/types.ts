export type Tab = 'accueil' | 'journee' | 'ceremonie' | 'plan';
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

export interface Parole {
  type: string;
  lignes: string;
}

export interface Section {
  titre: string;
  sous: string;
  lecteur?: string;
  texte: string[];
  paroles?: Parole[];
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
  livret: Section[];
  tables: Table[];
}
