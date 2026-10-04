import type { Data } from '../types';
import { IconAlliances, IconPhoto, IconFlutes, IconCloche, IconMusic } from '../components/Icons';

interface Props {
  data: Data | null;
  now: Date;
}

function at(hm: string) {
  const [h, m] = hm.split(':').map(Number);
  return new Date(2026, 9, 16, h, m);
}

function fmt(hm: string) { return hm.replace(':', 'h'); }

export function Journee({ data, now }: Props) {
  if (!data) return null;

  const end = new Date(2026, 9, 17, 3, 0);
  const sameDay = now.getFullYear() === 2026 && now.getMonth() === 9 &&
    (now.getDate() === 16 || (now.getDate() === 17 && now < end));
  const mode: 'avant' | 'jour' | 'apres' = now >= end ? 'apres' : sameDay ? 'jour' : 'avant';

  let cur = -1;
  data.programme.forEach((s, i) => { if (now >= at(s.heure)) cur = i; });
  if (now >= end) cur = data.programme.length;

  const timeline = data.programme.map((s, i) => {
    const isCur = i === cur && mode === 'jour';
    const past = i < cur || mode === 'apres';
    return {
      ...s,
      heureTxt: fmt(s.heure),
      isCur, past,
      opacity: past ? 0.55 : 1,
      cardBg: isCur ? 'rgba(201,164,92,.14)' : 'rgba(246,239,226,.04)',
      cardBorder: isCur ? '#E4C98A' : 'rgba(201,164,92,.4)',
      cardAnim: isCur ? 'halo 3s ease-in-out infinite' : 'none',
    };
  });

  return (
    <div style={{ padding: '40px 20px 24px', animation: 'fadeUp .4s ease both' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.32em', color: '#E4C98A' }}>Vendredi 16 octobre</div>
        <h2 style={{ margin: '4px 0 0', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 52, color: '#E4C98A', lineHeight: 1.1 }}>La journée</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px auto 28px', color: '#C9A45C', width: 160 }}>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#C9A45C)' }} />
          <span style={{ fontSize: 12 }}>✦</span>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,transparent,#C9A45C)' }} />
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Vertical timeline line */}
        <div style={{
          position: 'absolute', left: 27, top: 20, bottom: 20, width: 1,
          background: 'linear-gradient(180deg,transparent,#C9A45C 6%,#C9A45C 94%,transparent)',
        }} />

        {timeline.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: s.opacity, transition: 'opacity .3s' }}>
            {/* Icon circle */}
            <div style={{
              position: 'relative', zIndex: 1,
              width: 56, height: 56, flex: 'none', borderRadius: '50%',
              background: '#0E3B2C', border: '1px solid #C9A45C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#E4C98A',
            }}>
              {s.icone === 'alliances' && <IconAlliances />}
              {s.icone === 'photo' && <IconPhoto />}
              {s.icone === 'flutes' && <IconFlutes />}
              {s.icone === 'cloche' && <IconCloche />}
              {s.icone === 'musique' && <IconMusic />}
            </div>

            {/* Card */}
            <div style={{
              flex: 1, minWidth: 0, padding: '14px 16px',
              background: s.cardBg,
              border: `1px solid ${s.cardBorder}`,
              borderRadius: 12,
              animation: s.cardAnim,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '.12em', color: '#E4C98A' }}>
                  {s.heureTxt}
                </span>
                {s.isCur && (
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.16em',
                    padding: '4px 10px', borderRadius: 999,
                    background: '#8E2A23', color: '#F6EFE2', border: '1px solid #C9A45C',
                  }}>En ce moment</span>
                )}
              </div>
              <div style={{ marginTop: 2, fontSize: 22, fontWeight: 600, lineHeight: 1.2 }}>{s.titre}</div>
              <div style={{ marginTop: 2, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.1em', color: '#C9A45C' }}>{s.lieu}</div>
              <div style={{ marginTop: 6, fontSize: 17, lineHeight: 1.4, color: 'rgba(246,239,226,.88)' }}>{s.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center', fontFamily: "'Great Vibes', cursive", fontSize: 24, color: '#C9A45C' }}>
        Seynan &amp; Ezechiel · 16.10.2026
      </div>
    </div>
  );
}
