import type { Data } from '../types';

interface Props {
  data: Data | null;
  open: Record<number, boolean>;
  setOpen: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
}

export function Ceremonie({ data, open, setOpen }: Props) {
  if (!data) return null;

  const toggle = (i: number) => {
    setOpen(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div style={{ padding: '28px 14px 24px', animation: 'fadeUp .4s ease both' }}>
      {/* Booklet frame */}
      <div style={{
        background: '#F5EBDD', color: '#0E3B2C',
        border: '1px solid #B86C4F', padding: 4,
        boxShadow: '0 10px 30px rgba(58,36,22,.28)',
      }}>
        <div style={{ border: '1px solid rgba(201,164,92,.7)', padding: '28px 18px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.3em', color: '#8E4A39' }}></div>
            <h2 style={{ margin: '4px 0 0', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 48, lineHeight: 1.1, color: '#0E3B2C' }}>Cérémonie Réligieuse</h2>
            <div style={{ fontSize: 17, fontStyle: 'italic', color: '#3A2416' }}>Domaines des Rois · 14h00</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px auto 8px', color: '#C9A45C', width: 160 }}>
              <span style={{ flex: 1, height: 1, background: '#C9A45C' }} />
              <span style={{ fontSize: 12 }}>✦</span>
              <span style={{ flex: 1, height: 1, background: '#C9A45C' }} />
            </div>
          </div>

          {/* Sections */}
          {data.livret.map((sec, i) => {
            const isOpen = !!open[i];
            const [first = '', ...rest] = sec.texte;
            const lead = first.match(/^[«"“\s]*\S/)?.[0] ?? '';
            const lettrine = lead;
            const premier = first.slice(lead.length);

            return (
              <div key={i} style={{ borderBottom: '1px solid rgba(201,164,92,.55)' }}>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%', minHeight: 60,
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 2px', background: 'none', border: 0,
                    textAlign: 'left', cursor: 'pointer', color: '#0E3B2C',
                  }}
                >
                  <span style={{ width: 34, flex: 'none', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, color: '#8E2A23' }}>
                    {i + 1}.
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, letterSpacing: '.05em' }}>{sec.titre}</span>
                    {sec.sous && <span style={{ display: 'block', fontSize: 16, fontStyle: 'italic', color: '#3A2416' }}>{sec.sous}</span>}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E2A23" strokeWidth="1.5"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 2px 18px 42px', animation: 'fadeUp .3s ease both', fontSize: 18, lineHeight: 1.55 }}>
                    {sec.lecteur && (
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.1em', color: '#8E2A23', marginBottom: 8 }}>
                        {sec.lecteur}
                      </div>
                    )}
                    <p style={{ margin: 0 }}>
                      <span style={{
                        float: 'left',
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: 58, lineHeight: .8,
                        color: '#B08A3E',
                        margin: '6px 6px 0 0',
                      }}>{lettrine}</span>
                      {premier}
                    </p>
                    {rest.map((p, j) => (
                      <p key={j} style={{ margin: '10px 0 0' }}>{p}</p>
                    ))}
                    {sec.paroles && sec.paroles.length > 0 && (
                      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {sec.paroles.map((v, j) => (
                          <div key={j} style={{ padding: '12px 14px', background: '#EFE5D2', borderTop: '1px solid #C9A45C' }}>
                            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.18em', color: '#8E2A23', marginBottom: 4 }}>{v.type}</div>
                            <div style={{ whiteSpace: 'pre-line', fontSize: 19, fontStyle: 'italic', lineHeight: 1.5 }}>{v.lignes}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ textAlign: 'center', marginTop: 22, color: '#C9A45C', fontSize: 14, letterSpacing: '.6em' }}>✦ ✦ ✦</div>
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', fontFamily: "'Great Vibes', cursive", fontSize: 24, color: '#C9A45C' }}>
        Seynan &amp; Ezechiel · 16.10.2026
      </div>
    </div>
  );
}
