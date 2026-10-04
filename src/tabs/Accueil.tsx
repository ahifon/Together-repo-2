import type { Data } from '../types';
import { CornerOrnament } from '../components/Icons';

interface Props {
  data: Data | null;
  now: Date;
  goDay: () => void;
  goPlan: () => void;
  goBook: () => void;
}

const PARTICLE_XS = [8, 22, 35, 50, 64, 78, 90, 15, 44, 70, 85, 28];

function fmt(hm: string) { return hm.replace(':', 'h'); }

function at(day: number, hm: string) {
  const [h, m] = hm.split(':').map(Number);
  return new Date(2026, 9, day, h, m);
}

export function Accueil({ data, now, goDay, goPlan, goBook }: Props) {
  if (!data) {
    return (
      <div style={{ padding: 48, textAlign: 'center', fontFamily: 'Cinzel, serif', color: '#C9A45C', fontSize: 14, letterSpacing: '.2em' }}>
        Chargement…
      </div>
    );
  }

  const wedding = at(16, '14:00');
  const end = new Date(2026, 9, 17, 3, 0);
  const sameDay = now.getFullYear() === 2026 && now.getMonth() === 9 &&
    (now.getDate() === 16 || (now.getDate() === 17 && now < end));
  const mode: 'avant' | 'jour' | 'apres' = now >= end ? 'apres' : sameDay ? 'jour' : 'avant';

  const diff = Math.max(0, wedding.getTime() - now.getTime());
  const days = Math.floor(diff / 86400000);
  const hours = String(Math.floor(diff / 3600000) % 24).padStart(2, '0');
  const minutes = String(Math.floor(diff / 60000) % 60).padStart(2, '0');

  // Current step for "jour" mode
  const steps = data.programme;
  let cur = -1;
  steps.forEach((s, i) => { if (now >= at(16, s.heure)) cur = i; });
  if (now >= end) cur = steps.length;
  const curStep = steps[cur] || null;
  const nextStep = steps[cur + 1] || null;
  const todayLine = curStep
    ? 'En ce moment · ' + curStep.titre
    : nextStep ? 'Première étape · ' + fmt(nextStep.heure) + ' · ' + nextStep.titre : '';
  const todaySub = curStep
    ? curStep.lieu + (nextStep ? ' — ensuite : ' + nextStep.titre + ' à ' + fmt(nextStep.heure) : '')
    : nextStep ? nextStep.lieu : '';

  const lieuTxt = [data.mariage.lieu.nom, data.mariage.lieu.adresse].filter(Boolean).join(', ');
  const enc = encodeURIComponent(lieuTxt);

  return (
    <div style={{
      position: 'relative', padding: '64px 24px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', animation: 'fadeUp .4s ease both',
    }}>
      {/* Background photo (transparent) */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none',
        aspectRatio: '1086 / 1448',
        backgroundImage: 'url(couple.jpg)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.15,
      }} />

      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {PARTICLE_XS.map((x, i) => (
          <span key={i} style={{
            position: 'absolute',
            left: x + '%',
            top: (6 + (i * 37) % 70) + '%',
            width: i % 3 ? 3 : 4,
            height: i % 3 ? 3 : 4,
            borderRadius: '50%',
            background: '#E4C98A',
            boxShadow: '0 0 8px 2px rgba(228,201,138,.6)',
            animation: `twinkle ${3 + (i % 4)}s ease-in-out ${(i * 0.7) % 4}s infinite`,
            opacity: 0,
            display: 'block',
          }} />
        ))}
      </div>

      {/* Corner ornaments */}
      <CornerOrnament />
      <CornerOrnament flip />

      {/* Title */}
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.32em', color: '#E8D39B', textTransform: 'uppercase' }}>
        Le mariage de
      </div>
      <h1 style={{ margin: '10px 0 0', fontFamily: "'Great Vibes', cursive", fontWeight: 400, color: '#F5E9C9', lineHeight: .95, textShadow: '0 0 24px rgba(168,136,69,.18)' }}>
        <span style={{ display: 'block', fontSize: 72 }}>Seynan</span>
        <span style={{ display: 'block', fontSize: 40, color: '#C6A65A', margin: '2px 0' }}>&amp;</span>
        <span style={{ display: 'block', fontSize: 72 }}>Ezechiel</span>
      </h1>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0 12px', color: '#D4B467', width: 200 }}>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#D4B467)' }} />
        <span style={{ fontSize: 12 }}>✦</span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,transparent,#D4B467)' }} />
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '.16em', color: '#F7F0E5' }}>
        Vendredi 16 octobre 2026 · Nangis
      </div>

      {/* Countdown / Today / After box */}
      <div style={{ marginTop: 28, width: '100%', border: '1px solid #D4B467', padding: 4, background: 'rgba(10,42,31,.58)' }}>
        <div style={{ border: '1px solid rgba(212,180,103,.55)', padding: '20px 16px' }}>
          {mode === 'avant' && (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.28em', color: '#E4C98A', marginBottom: 12 }}>Dans</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 46, fontWeight: 500, lineHeight: 1 }}>{days}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#C9A45C', marginTop: 6 }}>jours</div>
                </div>
                <div style={{ width: 1, height: 48, background: 'rgba(201,164,92,.45)' }} />
                <div>
                  <div style={{ fontSize: 46, fontWeight: 500, lineHeight: 1 }}>{hours}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#C9A45C', marginTop: 6 }}>heures</div>
                </div>
                <div style={{ width: 1, height: 48, background: 'rgba(201,164,92,.45)' }} />
                <div>
                  <div style={{ fontSize: 46, fontWeight: 500, lineHeight: 1 }}>{minutes}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#C9A45C', marginTop: 6 }}>minutes</div>
                </div>
              </div>
            </>
          )}
          {mode === 'jour' && (
            <>
              <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 42, color: '#E4C98A', lineHeight: 1.1 }}>C'est aujourd'hui !</div>
              <div style={{ marginTop: 10, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '.1em' }}>{todayLine}</div>
              <div style={{ marginTop: 4, fontStyle: 'italic', fontSize: 17, color: 'rgba(246,239,226,.85)' }}>{todaySub}</div>
              <button
                onClick={goDay}
                style={{
                  marginTop: 12, minHeight: 44, padding: '0 18px',
                  background: 'none', border: '1px solid #C9A45C',
                  color: '#E4C98A', fontFamily: 'Cinzel, serif',
                  fontSize: 12, letterSpacing: '.14em', cursor: 'pointer',
                }}
              >Voir le programme</button>
            </>
          )}
          {mode === 'apres' && (
            <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 38, color: '#E4C98A', lineHeight: 1.1 }}>Merci d'avoir été là</div>
          )}
        </div>
      </div>

      {/* Quote */}
      <p style={{ margin: '28px 8px 4px', fontStyle: 'italic', fontSize: 21, lineHeight: 1.4 }}>
        « {data.mariage.accueil} »
      </p>

      {/* Shortcut cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        <ShortcutCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="4" r="1.3"/><circle cx="12" cy="20" r="1.3"/><circle cx="4" cy="12" r="1.3"/><circle cx="20" cy="12" r="1.3"/></svg>}
          title="Trouver ma table"
          sub="Avec votre numéro de téléphone"
          onClick={goPlan}
        />
        <ShortcutCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>}
          title="Programme de la journée"
          sub="De la cérémonie à la soirée"
          onClick={goDay}
        />
        <ShortcutCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5v13"/></svg>}
          title="Livret de cérémonie"
          sub="Lectures, chants et paroles"
          onClick={goBook}
        />
      </div>

      {/* Venue */}
      <div style={{ width: '100%', marginTop: 28, padding: '20px 16px', borderTop: '1px solid rgba(201,164,92,.45)', borderBottom: '1px solid rgba(201,164,92,.45)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.28em', color: '#E4C98A' }}>Le lieu</div>
        <div style={{ marginTop: 6, fontSize: 21, fontWeight: 500 }}>{data.mariage.lieu.nom}</div>
        <div style={{ fontSize: 17, color: 'rgba(246,239,226,.85)' }}>{data.mariage.lieu.adresse}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${enc}`} target="_blank" rel="noreferrer"
            style={{ flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#C9A45C', color: '#0A2A1F', textDecoration: 'none', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, letterSpacing: '.1em' }}>
            Itinéraire
          </a>
          <a href={`https://waze.com/ul?q=${enc}&navigate=yes`} target="_blank" rel="noreferrer"
            style={{ flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #C9A45C', color: '#E4C98A', textDecoration: 'none', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '.1em' }}>
            Waze
          </a>
        </div>
      </div>

      <div style={{ marginTop: 28, fontFamily: "'Great Vibes', cursive", fontSize: 24, color: '#C9A45C' }}>
        Seynan &amp; Ezechiel · 16.10.2026
      </div>
    </div>
  );
}

function ShortcutCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, minHeight: 76,
        padding: '12px 16px',
        background: 'rgba(246,239,226,.05)',
        border: '1px solid rgba(201,164,92,.5)',
        borderRadius: 2, color: '#F6EFE2', textAlign: 'left', cursor: 'pointer',
      }}
    >
      <span style={{ width: 44, height: 44, flex: 'none', borderRadius: '50%', border: '1px solid #C9A45C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C9A45C' }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: '.06em' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 16, color: 'rgba(246,239,226,.8)' }}>{sub}</span>
      </span>
      <span style={{ color: '#C9A45C', fontSize: 24 }}>›</span>
    </button>
  );
}
