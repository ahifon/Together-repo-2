import { useState } from 'react';
import type { Chant, Data, Lecture as LectureData } from '../types';

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

const GOLD_LIGHT = '#E4C98A';

function Depliant({ icon, label, titre, children }: {
  icon: React.ReactNode;
  label: string;
  titre: string;
  children: (open: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${open ? GOLD : 'rgba(176,138,62,.55)'}`,
      boxShadow: open ? '0 14px 30px rgba(14,59,44,.28)' : 'none',
      transition: 'box-shadow .4s, border-color .4s',
    }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 12px', border: 0, textAlign: 'left', cursor: 'pointer', color: INK,
          background: 'linear-gradient(135deg, rgba(201,164,92,.2), rgba(201,164,92,.06))',
        }}
      >
        <span aria-hidden style={{
          flex: 'none', width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: INK, color: GOLD_LIGHT, fontSize: 15,
          border: `1px solid ${GOLD}`, boxShadow: '0 0 0 3px rgba(201,164,92,.18)',
        }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.28em', color: WINE, textTransform: 'uppercase' }}>
            {label}
          </span>
          <span style={{ display: 'block', marginTop: 2, fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 600, letterSpacing: '.05em', lineHeight: 1.3, color: INK, textTransform: 'uppercase' }}>
            {titre}
          </span>
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={WINE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .35s' }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div aria-hidden={!open} style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .5s ease' }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{
            position: 'relative', padding: '24px 10px 26px', textAlign: 'center', color: '#F6EFE2',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(228,201,138,.16), transparent 60%), linear-gradient(180deg, #0E3B2C 0%, #0A2A1F 100%)',
            borderTop: `1px solid ${GOLD}`,
          }}>
            <div aria-hidden style={{ position: 'absolute', inset: 6, border: '1px solid rgba(228,201,138,.25)', borderRadius: 10, pointerEvents: 'none' }} />
            {children(open)}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ kicker, titre, open }: { kicker: string; titre: string; open: boolean }) {
  return (
    <div style={{ position: 'relative', animation: open ? 'fadeUp .6s ease both' : 'none' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.34em', color: GOLD, textTransform: 'uppercase' }}>
        {kicker}
      </div>
      <div style={{
        marginTop: 4, fontFamily: "'Great Vibes', cursive", fontSize: 36, lineHeight: 1.1,
        background: 'linear-gradient(180deg, #FFF3D2, #E4C98A 55%, #B98A42)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        {titre}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px auto 4px', width: 150, color: GOLD }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
        <span style={{ fontSize: 11 }}>✦</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
      </div>
    </div>
  );
}

function Cantique({ c }: { c: Chant }) {
  return (
    <Depliant icon="♪" label={`${c.label ?? 'Cantique'}${c.numero ? ` · n° ${c.numero}` : ''}`} titre={c.titre}>
      {(open) => (
        <>
          <PanelHeader kicker={`Cantique${c.numero ? ` n° ${c.numero}` : ''}`} titre={c.titre} open={open} />

          {c.couplets?.map((v, i) => (
            <div key={i} style={{ position: 'relative', animation: open ? `fadeUp .6s ease ${0.12 + i * 0.1}s both` : 'none' }}>
              {i > 0 && <div aria-hidden style={{ margin: '16px 0 14px', color: GOLD, fontSize: 10, letterSpacing: '.6em' }}>✦</div>}
              <div style={{ marginTop: i === 0 ? 14 : 0 }}>
                {v.split('\n').map((line, j) => {
                  const amen = /^amen\s*!?$/i.test(line);
                  return (
                    <div key={j} style={amen
                      ? { marginTop: 8, fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 600, letterSpacing: '.3em', textTransform: 'uppercase', color: GOLD_LIGHT }
                      : { fontSize: 17, fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(246,239,226,.94)' }}
                    >{line}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </Depliant>
  );
}

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD_LIGHT} strokeWidth="1.5" strokeLinejoin="round">
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
    <path d="M12 6.5v13" />
  </svg>
);

function Lecture({ l }: { l: LectureData }) {
  return (
    <Depliant icon={<BookIcon />} label="Lecture biblique" titre={l.reference}>
      {(open) => (
        <>
          <PanelHeader kicker="Lecture biblique" titre={l.reference} open={open} />

          <p style={{
            position: 'relative', margin: '14px 6px 0', padding: '0 4px', textAlign: 'left',
            fontSize: 18, lineHeight: 1.7, color: 'rgba(246,239,226,.94)',
            animation: open ? 'fadeUp .7s ease .15s both' : 'none',
          }}>
            {l.versets.map(v => (
              <span key={v.n}>
                <sup style={{ marginRight: 3, fontFamily: 'Cinzel, serif', fontSize: 10, fontWeight: 600, color: GOLD_LIGHT }}>{v.n}</sup>
                {v.t}{' '}
              </span>
            ))}
          </p>

          <div aria-hidden style={{ position: 'relative', marginTop: 18, color: GOLD, fontSize: 10, letterSpacing: '.6em' }}>✦</div>
        </>
      )}
    </Depliant>
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
          </div>

          {/* Steps */}
          <ol style={{ listStyle: 'none', margin: '26px 0 0', padding: 0, position: 'relative' }}>
            <div aria-hidden style={{
              position: 'absolute', left: 17, top: 18, bottom: 18, width: 1,
              background: `linear-gradient(180deg, transparent, ${GOLD} 4%, ${GOLD} 96%, transparent)`,
            }} />

            {data.deroule.map((s, i) => (
              <li key={i} style={{ position: 'relative', display: 'flex', gap: 14, paddingBottom: i === data.deroule.length - 1 ? 0 : 22 }}>
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
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 600, letterSpacing: '.04em', lineHeight: 1.3, color: INK }}>
                      {s.titre}
                    </div>
                  </div>

                  {s.details && s.details.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {s.details.map((d, j) => (
                        <div key={j} style={{ fontSize: 17, lineHeight: 1.45, color: '#2E2418' }}>{d}</div>
                      ))}
                    </div>
                  )}

                  {s.lecture && (
                    <div style={{ marginTop: 8 }}>
                      <Lecture l={s.lecture} />
                    </div>
                  )}

                  {s.chants && s.chants.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {s.chants.map((c, j) => typeof c !== 'string' ? (
                        <Cantique key={j} c={c} />
                      ) : (
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
