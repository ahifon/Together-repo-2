interface Lodging {
  nom: string;
  trajet: string;
  parking: string;
  tarif: string;
  chambres: string;
  petitDej: string;
}

const LODGINGS: Lodging[] = [
  { nom: 'Le Domaine de Brie', trajet: '15 min en voiture', parking: 'Parking privé gratuit', tarif: '64 € à 110 € / nuit', chambres: "Jusqu'à 4 pers.", petitDej: 'Petit déjeuner buffet' },
  { nom: 'Hostellerie Le Chatel', trajet: '15 min en voiture', parking: 'Parking gratuit', tarif: '132 € à 160 € / nuit', chambres: "Jusqu'à 2 pers. / chambre", petitDej: 'Petit déjeuner buffet' },
  { nom: 'Les Crinières en Brie', trajet: '11 min en voiture', parking: 'Parking gratuit', tarif: '101 € à 114 € / nuit', chambres: "Jusqu'à 2 pers.", petitDej: 'Petit déjeuner buffet' },
  { nom: 'Jardin de Matilde', trajet: '12 min en voiture', parking: 'Pas de parking à disposition', tarif: '71 € à 89 € / nuit', chambres: "Jusqu'à 2 pers.", petitDej: 'Petit déjeuner proposé' },
  { nom: 'Domaine des Tiranages', trajet: '2 min en voiture (5 min à pied)', parking: 'Parking privé gratuit', tarif: '95 € à 290 € / nuit', chambres: "Jusqu'à 4 pers.", petitDej: 'Petit déjeuner buffet' },
];

const mapsUrl = (nom: string) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nom + ' Seine-et-Marne');

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 16, lineHeight: 1.4 }}>
      <span style={{ flex: 'none', width: 82, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#C9A45C' }}>{label}</span>
      <span style={{ flex: 1, color: 'rgba(246,239,226,.92)' }}>{value}</span>
    </div>
  );
}

export function Hebergements() {
  return (
    <div style={{ padding: '40px 20px 24px', animation: 'fadeUp .4s ease both' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.32em', color: '#E4C98A' }}>À l'attention des invités</div>
        <h2 style={{ margin: '4px 0 0', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 52, color: '#E4C98A', lineHeight: 1.1 }}>Logements</h2>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.2em', color: 'rgba(246,239,226,.8)', textTransform: 'uppercase' }}>
          à proximité de LA VENERIE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px auto 20px', color: '#C9A45C', width: 160 }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#C9A45C)' }} />
          <span style={{ fontSize: 12 }}>✦</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,transparent,#C9A45C)' }} />
        </div>
      </div>

      <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 17, lineHeight: 1.55, color: 'rgba(246,239,226,.9)' }}>
        <p style={{ margin: '0 0 12px' }}>Parce que certains d'entre vous viennent de loin pour partager cette belle journée à nos côtés, nous avons sélectionné quelques hébergements situés à proximité du lieu de réception.</p>
        <p style={{ margin: '0 0 12px' }}>Pour chaque proposition, retrouvez les informations essentielles : distance jusqu'au lieu de réception, tarif indicatif, types de chambres, petit-déjeuner et stationnement.</p>
        <p style={{ margin: '0 0 12px' }}>L'objectif est de vous permettre de profiter pleinement des festivités, sans vous soucier du trajet aller et retour, afin de terminer cette belle célébration en toute tranquillité.</p>
        <p style={{ margin: 0 }}>Nous espérons que ces quelques suggestions vous permettront de trouver l'hébergement qui correspondra le mieux à vos besoins et à votre organisation.</p>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {LODGINGS.map(l => (
          <div key={l.nom} style={{
            padding: '14px 16px',
            border: '1px solid rgba(201,164,92,.45)',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(246,239,226,.05), rgba(201,164,92,.06))',
            boxShadow: '0 10px 18px rgba(10,42,31,.18)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '.06em', color: '#E4C98A', textTransform: 'uppercase' }}>{l.nom}</div>
              <a
                href={mapsUrl(l.nom)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 'none', minHeight: 36, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 999, border: '1px solid rgba(201,164,92,.6)', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.1em', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >Voir</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Row label="Distance" value={l.trajet} />
              <Row label="Parking" value={l.parking} />
              <Row label="Tarif" value={l.tarif} />
              <Row label="Chambres" value={l.chambres} />
              <Row label="Matin" value={l.petitDej} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
