import type { Data } from '../types';

interface Props {
  data: Data | null;
}

const INK = '#0E3B2C';
const GOLD = '#B08A3E';
const WINE = '#8E2A23';

function Ornament({ width = 170 }: { width?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px auto', width, color: GOLD }}>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
      <span style={{ fontSize: 12 }}>✦</span>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
    </div>
  );
}

export function Ceremonie({ data }: Props) {
  if (!data) return null;

  return (
    <div style={{ padding: '28px 14px 24px', animation: 'fadeUp .4s ease both' }}>
      <div style={{
        background: 'linear-gradient(180deg, #F8F0E2 0%, #F2E6D2 100%)',
        color: INK,
        border: '1px solid #B86C4F',
        borderRadius: 6,
        padding: 5,
        boxShadow: '0 18px 40px rgba(2,10,7,.45), 0 0 0 1px rgba(228,201,138,.25)',
      }}>
        <div style={{ border: '1px solid rgba(176,138,62,.75)', borderRadius: 3, padding: '30px 20px 26px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.38em', color: WINE, textTransform: 'uppercase' }}>
              Livret de cérémonie
            </div>
            <h2 style={{ margin: '6px 0 0', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 52, lineHeight: 1.05, color: INK }}>
              Culte de mariage
            </h2>
            <div style={{ marginTop: 4, fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.22em', color: '#3A2416', textTransform: 'uppercase' }}>
              Vendredi 16 octobre 2026
            </div>
            <Ornament />
            <div style={{ fontSize: 16, fontStyle: 'italic', color: '#5A4630' }}>
              Durée prévue · environ 1 h 30
            </div>
          </div>

          {/* Steps */}
          <ol style={{ listStyle: 'none', margin: '26px 0 0', padding: 0, position: 'relative' }}>
            <div aria-hidden style={{
              position: 'absolute', left: 17, top: 18, bottom: 18, width: 1,
              background: `linear-gradient(180deg, transparent, ${GOLD} 4%, ${GOLD} 96%, transparent)`,
            }} />

            {data.livret.map((s, i) => (
              <li key={i} style={{ position: 'relative', display: 'flex', gap: 14, paddingBottom: i === data.livret.length - 1 ? 0 : 22 }}>
                <div style={{
                  position: 'relative', zIndex: 1, flex: 'none',
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#F8F0E2', border: `1px solid ${GOLD}`,
                  boxShadow: '0 0 0 3px #F5EBDB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, color: WINE,
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 600, letterSpacing: '.04em', lineHeight: 1.3, color: INK }}>
                      {s.titre}
                    </div>
                    {s.duree && (
                      <div style={{
                        flex: 'none', padding: '2px 9px', borderRadius: 999,
                        border: '1px solid rgba(176,138,62,.6)', background: 'rgba(201,164,92,.12)',
                        fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.08em', color: '#7A5A22', whiteSpace: 'nowrap',
                      }}>
                        {s.duree}
                      </div>
                    )}
                  </div>

                  {s.details && s.details.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {s.details.map((d, j) => (
                        <div key={j} style={{ fontSize: 17, lineHeight: 1.45, color: '#2E2418' }}>{d}</div>
                      ))}
                    </div>
                  )}

                  {s.chants && s.chants.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.chants.map((c, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', borderLeft: `2px solid ${GOLD}`,
                          background: 'rgba(201,164,92,.1)',
                          fontSize: 17, fontStyle: 'italic', color: WINE,
                        }}>
                          <span aria-hidden style={{ fontStyle: 'normal', fontSize: 13, color: GOLD }}>♪</span>
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <Ornament width={120} />
          <div style={{ textAlign: 'center', color: GOLD, fontSize: 14, letterSpacing: '.6em' }}>✦ ✦ ✦</div>
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', fontFamily: "'Great Vibes', cursive", fontSize: 24, color: '#C9A45C' }}>
        Seynan &amp; Ezechiel · 16.10.2026
      </div>
    </div>
  );
}
