import type { Data } from '../types';

interface Props {
  data: Data | null;
}

const GOLD = '#C9A45C';
const GOLD_LIGHT = '#E4C98A';
const GOLD_PALE = '#F4D9A4';
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  return d.length === 10 ? d.replace(/(\d{2})(?=\d)/g, '$1 ') : raw;
}

function Ornament({ width = 170 }: { width?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto', width, color: GOLD }}>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
      <span style={{ fontSize: 11 }}>✦</span>
      <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
    </div>
  );
}

const PhoneIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

const MessageIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5v-3.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);

const roundBtn: React.CSSProperties = {
  width: 46, height: 46, flex: 'none', borderRadius: '50%',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  textDecoration: 'none',
};

export function Contact({ data }: Props) {
  if (!data) return null;

  const contacts = (data.contacts ?? []).filter(c => c.nom || c.telephone);

  return (
    <div style={{ padding: '36px 18px 28px', animation: 'fadeUp .4s ease both' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 74, height: 74, margin: '0 auto 14px', borderRadius: '50%',
          border: `1px solid ${GOLD}`,
          boxShadow: '0 0 0 4px rgba(201,164,92,.12), 0 0 30px rgba(228,201,138,.25), inset 0 0 18px rgba(228,201,138,.12)',
          background: 'radial-gradient(circle at 50% 30%, rgba(228,201,138,.18), rgba(10,42,31,.9))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Great Vibes', cursive", fontSize: 34, color: GOLD_PALE, lineHeight: 1,
        }}>
          S<span style={{ fontSize: 14, margin: '0 3px', color: GOLD }}>✦</span>E
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.38em', color: GOLD_LIGHT, textTransform: 'uppercase' }}>
          Une question ?
        </div>
        <h2 style={{ margin: '2px 0 10px', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 54, color: GOLD_LIGHT, lineHeight: 1.1, textShadow: '0 2px 22px rgba(228,201,138,.25)' }}>
          Contacts
        </h2>
        <Ornament />
        <p style={{ margin: '14px auto 0', maxWidth: 300, fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, color: 'rgba(246,239,226,.82)' }}>
          Avant comme pendant la journée, nous sommes à votre écoute.
        </p>
      </div>

      {/* Cards */}
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {contacts.map((c, i) => {
          const tel = (c.telephone ?? '').replace(/[^\d+]/g, '');
          const label = c.role || `Contact ${NUMERALS[i] ?? i + 1}`;

          return (
            <div key={i} style={{
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 14px 14px 18px',
              borderRadius: 20,
              border: '1px solid rgba(228,201,138,.55)',
              background: 'linear-gradient(135deg, rgba(228,201,138,.16), rgba(12,42,31,.9) 50%, rgba(8,18,15,.97))',
              boxShadow: '0 16px 32px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.1)',
              animation: `fadeUp .45s ease ${0.08 * i + 0.1}s both`,
            }}>
              <span aria-hidden style={{
                position: 'absolute', left: 0, top: 14, bottom: 14, width: 2,
                background: `linear-gradient(180deg, transparent, ${GOLD_LIGHT}, transparent)`,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.32em', color: GOLD, textTransform: 'uppercase' }}>
                  {label}
                </div>
                {c.nom && (
                  <div style={{ marginTop: 2, fontFamily: "'Great Vibes', cursive", fontSize: 28, color: GOLD_PALE, lineHeight: 1.1 }}>{c.nom}</div>
                )}
                {c.telephone && (
                  <div style={{
                    marginTop: c.nom ? 2 : 6,
                    fontFamily: 'Cinzel, serif', fontWeight: 600,
                    fontSize: 19, letterSpacing: '.1em', color: '#F6EFE2',
                    whiteSpace: 'nowrap',
                  }}>{formatPhone(c.telephone)}</div>
                )}
                {c.note && (
                  <div style={{ marginTop: 3, fontSize: 15, fontStyle: 'italic', color: 'rgba(246,239,226,.7)' }}>{c.note}</div>
                )}
              </div>

              {tel && (
                <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
                  <a
                    href={`sms:${tel}`}
                    aria-label={`Envoyer un message au ${formatPhone(c.telephone ?? '')}`}
                    style={{ ...roundBtn, border: '1px solid rgba(201,164,92,.6)', background: 'rgba(201,164,92,.08)' }}
                  >
                    <MessageIcon color={GOLD_LIGHT} />
                  </a>
                  <a
                    href={`tel:${tel}`}
                    aria-label={`Appeler le ${formatPhone(c.telephone ?? '')}`}
                    style={{ ...roundBtn, border: 0, background: 'linear-gradient(135deg, #F0D690, #B98A42)', boxShadow: '0 8px 18px rgba(0,0,0,.35), 0 0 16px rgba(228,201,138,.28)' }}
                  >
                    <PhoneIcon color="#132B20" />
                  </a>
                </div>
              )}
              {!tel && c.email && (
                <a href={`mailto:${c.email}`} aria-label="Écrire un e-mail" style={{ ...roundBtn, border: 0, background: 'linear-gradient(135deg, #F0D690, #B98A42)' }}>
                  <MessageIcon color="#132B20" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 34, textAlign: 'center' }}>
        <Ornament width={120} />
        <div style={{ marginTop: 14, fontFamily: "'Great Vibes', cursive", fontSize: 26, color: GOLD }}>
          Seynan &amp; Ezechiel
        </div>
        <div style={{ marginTop: 2, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.34em', color: 'rgba(246,239,226,.6)' }}>
          16 · 10 · 2026
        </div>
      </div>
    </div>
  );
}
