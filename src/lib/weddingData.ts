import type { Data } from '../types';

function normalizeTableData(data: Data): Data {
  if (!data?.tables) {
    return data;
  }

  return {
    ...data,
    tables: data.tables.map((table) => {
      const sourceName = String((table as Data['tables'][number] & { table?: string }).table ?? table.nom ?? table.id ?? '').trim();
      const normalizedName = sourceName || table.nom || table.id;

      return {
        ...table,
        table: normalizedName,
        id: normalizedName,
        nom: normalizedName,
      };
    }),
  };
}

const FALLBACK_WEDDING_DATA: Data = {
  mariage: {
    maries: ['Lina', 'Arthur'],
    date: '2026-10-16',
    dateTexte: 'Vendredi 16 octobre 2026 · Château des Fées',
    accueil: 'Votre présence fera de ce moment une journée inoubliable.',
    lieu: {
      nom: 'Domaine des Rois',
      adresse: '77370 Nangis',
    },
  },
  programme: [
    {
      heure: '14:00',
      titre: 'Cérémonie religieuse',
      lieu: 'Église Saint-Pierre',
      description: 'Merci d’arriver 15 minutes avant le début de la cérémonie.',
      icone: 'alliances',
    },
    {
      heure: '16:00',
      titre: 'Séance photo',
      lieu: 'Jardins du château',
      description: 'Photos de famille et de groupe dans le parc.',
      icone: 'photo',
    },
    {
      heure: '18:00',
      titre: 'Vin d’honneur',
      lieu: 'Terrasse du château',
      description: 'Cocktails, bouchées et musique douce.',
      icone: 'flutes',
    },
    {
      heure: '19:30',
      titre: 'Dîner',
      lieu: 'Grande salle',
      description: 'Retrouvez votre table grâce à l’onglet Plan de table.',
      icone: 'cloche',
    },
    {
      heure: '21:00',
      titre: 'Soirée dansante',
      lieu: 'Salle des fêtes',
      description: 'Ouverture du bal puis danse jusqu’au bout de la nuit.',
      icone: 'musique',
    },
  ],
  livret: [
    {
      titre: 'Accueil',
      sous: 'Bienvenue',
      texte: ['Nous sommes ravis de vous accueillir pour ce jour unique.'],
    },
    {
      titre: 'Première lecture',
      sous: 'Mot de la famille',
      texte: ['L’amour est le plus beau voyage que l’on fait ensemble.'],
    },
    {
      titre: 'Échange des alliances',
      sous: 'Le moment fort',
      texte: ['Lina et Arthur s’échangent leurs alliances devant leurs proches.'],
    },
    {
      titre: 'Merci',
      sous: 'Un mot des mariés',
      texte: ['Merci d’être là pour célébrer cette journée avec nous.'],
    },
  ],
  tables: [
    {
      id: 'honneur',
      nom: 'Table d’honneur',
      x: 50,
      y: 12,
      honneur: true,
      invites: [
        { nom: 'Lina' },
        { nom: 'Arthur' },
        { nom: 'Sophie' },
        { nom: 'Marc' },
        { nom: 'Alicia' },
        { nom: 'Nicolas' },
      ],
    },
    {
      id: 'jade',
      nom: 'Jade',
      x: 20,
      y: 34,
      invites: [
        { nom: 'Claire' },
        { nom: 'Julien' },
        { nom: 'Amélie' },
        { nom: 'Thomas' },
        { nom: 'Léa' },
        { nom: 'Noah' },
        { nom: 'Emma' },
        { nom: 'Paul' },
      ],
    },
    {
      id: 'rose',
      nom: 'Rose',
      x: 50,
      y: 34,
      invites: [
        { nom: 'Camille' },
        { nom: 'Baptiste' },
        { nom: 'Inès' },
        { nom: 'Arthur' },
        { nom: 'Julie' },
        { nom: 'Victor' },
        { nom: 'Carla' },
        { nom: 'Lucas' },
      ],
    },
    {
      id: 'saphir',
      nom: 'Saphir',
      x: 80,
      y: 34,
      invites: [
        { nom: 'Romy' },
        { nom: 'Hugo' },
        { nom: 'Elise' },
        { nom: 'Antoine' },
        { nom: 'Manon' },
        { nom: 'Maxime' },
        { nom: 'Sarah' },
        { nom: 'Robin' },
      ],
    },
  ],
};

const SHEET_ID = '1J5izoIAZlEUYYj1UMljd77L4W1u2uNe2K1-WHuiKSac';
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',' || c === ';') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function cleanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 9 ? '0' + digits : digits;
}

async function loadTablesFromSheet(): Promise<Data['tables'] | null> {
  try {
    const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!response.ok) return null;

    const rows = parseCsv(await response.text());
    const header = (rows.shift() ?? []).map(h => h.trim().toLowerCase());
    const iTable = header.indexOf('table');
    const iNom = header.indexOf('nom');
    const iTel = header.indexOf('telephone');
    if (iTable < 0 || iNom < 0) return null;

    const byTable = new Map<string, Data['tables'][number]>();
    for (const r of rows) {
      const tableName = (r[iTable] ?? '').trim();
      const nom = (r[iNom] ?? '').trim();
      if (!tableName || !nom) continue;

      let table = byTable.get(tableName);
      if (!table) {
        table = { id: tableName, nom: tableName, x: 0, y: 0, invites: [] };
        byTable.set(tableName, table);
      }
      table.invites.push({ nom, telephone: iTel >= 0 ? cleanPhone(r[iTel] ?? '') : '' });
    }

    return byTable.size > 0 ? [...byTable.values()] : null;
  } catch {
    return null;
  }
}

export async function loadWeddingData(): Promise<Data | null> {
  let data = FALLBACK_WEDDING_DATA;
  try {
    const response = await fetch('/donnees.json', { cache: 'no-store' });
    if (response.ok) data = (await response.json()) as Data;
  } catch {
    // fallback data is used
  }

  const tables = await loadTablesFromSheet();
  return normalizeTableData(tables ? { ...data, tables } : data);
}
