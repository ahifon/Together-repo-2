import { useEffect, useState } from 'react';
import type { Data, Table } from '../types';
import { IconPhone } from '../components/Icons';

interface Props {
  data: Data | null;
  query: string;
  setQuery: (q: string) => void;
  sel: string | null;
  setSel: (id: string | null) => void;
}

const MIN_DIGITS = 8;
const MAX_DIGITS = 15;

/** Forme comparable d'un numéro : chiffres seuls, indicatif pays inclus quand il est connu */
function canon(raw: string): string {
  const trimmed = String(raw || '').trim();
  const d = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return d;
  if (d.startsWith('00')) return d.slice(2);
  if (d.length === 10 && d.startsWith('0')) return '33' + d.slice(1);
  return d;
}

/** Même numéro, avec ou sans indicatif pays (+33, +229, 00225…) */
function samePhone(a: string, b: string): boolean {
  const ca = canon(a);
  const cb = canon(b);
  if (ca.length < MIN_DIGITS || cb.length < MIN_DIGITS) return false;
  return ca === cb || ca.slice(-MIN_DIGITS) === cb.slice(-MIN_DIGITS);
}

function guestName(g: Table['invites'][number]): string {
  return g.nom;
}

export function PlanDeTable({ data, query, setQuery, sel, setSel }: Props) {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setSettled(false);
    const timer = setTimeout(() => setSettled(true), 1100);
    return () => clearTimeout(timer);
  }, [query]);

  if (!data) return null;

  const qd = query.replace(/\D/g, '');
  const active = qd.length >= MIN_DIGITS;
  const typing = qd.length > 0 && !active;

  // Search results
  type Result = { t: Table; g: Table['invites'][number] };
  const results: Result[] = [];
  if (active) {
    data.tables.forEach(t => {
      t.invites.forEach(g => {
        if (samePhone(g.telephone || '', query) && results.length < 4) results.push({ t, g });
      });
    });
  }
  const foundIds = results.map(r => r.t.id);

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const plus = v.trim().startsWith('+');
    const dg = v.replace(/\D/g, '').slice(0, MAX_DIGITS);
    setQuery((plus ? '+' : '') + dg.replace(/(\d{2})(?=\d)/g, '$1 '));
  };

  const clearSearch = () => {
    setQuery('');
  };

  const ROW_H = 84;
  const placedTables = data.tables.filter(t => t.ligne && t.colonne);
  const placed = placedTables.length > 0;
  const gridCols = placed ? Math.max(2, Math.ceil(Math.max(...placedTables.map(t => t.colonne as number)))) : 0;
  const lastPlacedRow = placed ? Math.ceil(Math.max(...placedTables.map(t => t.ligne as number))) : 0;
  let extra = 0;

  const displayTables = data.tables.map((table, index) => {
    if (placed) {
      let ligne = table.ligne;
      let colonne = table.colonne;
      if (!ligne || !colonne) {
        ligne = lastPlacedRow + 1 + Math.floor(extra / gridCols);
        colonne = (extra % gridCols) + 1;
        extra++;
      }
      return {
        ...table,
        ligne,
        displayX: 16 + (colonne - 1) * (68 / Math.max(gridCols - 1, 1)),
        displayTop: `${52 + (ligne - 1) * ROW_H}px`,
      };
    }

    const hasCustomPosition = Number.isFinite(table.x) && Number.isFinite(table.y) && !(table.x === 0 && table.y === 0);
    const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(Math.max(data.tables.length, 1)))));
    const row = Math.floor(index / columns);
    const col = index % columns;

    return {
      ...table,
      displayX: hasCustomPosition ? table.x : (table.honneur ? 50 : 16 + col * (68 / Math.max(columns - 1, 1))),
      displayTop: (hasCustomPosition ? table.y : (table.honneur ? 14 : 18 + row * 18)) + '%',
    };
  });

  const lastRow = placed ? Math.max(...displayTables.map(t => (t as { ligne?: number }).ligne ?? 1)) : 0;
  const canvasHeight = placed ? Math.max(440, 52 + (Math.ceil(lastRow) - 1) * ROW_H + 100) : 440;

  return (
    <div style={{ padding: '36px 16px 24px', animation: 'fadeUp .4s ease both' }}>
      <div style={{
        position: 'relative',
        padding: '18px 18px 12px',
        border: '1px solid rgba(214,176,89,0.55)',
        background: 'linear-gradient(135deg, rgba(201,164,92,0.14), rgba(14,59,44,0.52), rgba(11,22,18,0.9))',
        boxShadow: '0 20px 50px rgba(2,8,6,0.38), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 25px rgba(201,164,92,0.12)',
      }}>
        <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(201,164,92,0.18)', borderRadius: 12 }} />
        <h2 style={{ position: 'relative', margin: 0, textAlign: 'center', fontFamily: "'Great Vibes', cursive", fontWeight: 400, fontSize: 48, color: '#F4D9A4', lineHeight: 1.05, letterSpacing: '.02em' }}>
          Plan de table
        </h2>
        <div style={{ position: 'relative', marginTop: 8, textAlign: 'center', fontSize: 16, color: 'rgba(246,239,226,.82)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
          Retrouvez votre place avec élégance
        </div>
      </div>

      {/* Phone input */}
      <div style={{
        marginTop: 18,
        display: 'flex', alignItems: 'center', gap: 10,
        height: 62, padding: '0 6px 0 16px',
        border: '1px solid rgba(212,180,103,0.72)',
        background: 'linear-gradient(180deg, rgba(245,235,221,0.12), rgba(10,42,31,0.42))',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 10px 22px rgba(0,0,0,0.18)',
        borderRadius: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, color: '#D9B76B' }}>
          <IconPhone />
        </div>
        <input
          type="tel"
          inputMode="tel"
          value={query}
          onChange={handleQuery}
          placeholder="06 12 34 56 78 · +229 …"
          autoComplete="tel"
          style={{
            flex: 1, minWidth: 0, height: '100%',
            background: 'none', border: 0, outline: 'none',
            color: '#F6EFE2',
            fontFamily: 'Cinzel, serif', fontSize: 20, letterSpacing: '.08em',
          }}
        />
        {qd.length > 0 && (
          <button
            onClick={() => setQuery('')}
            aria-label="Effacer"
            style={{ width: 44, height: 44, background: 'rgba(201,164,92,.12)', border: '1px solid rgba(201,164,92,.4)', borderRadius: 12, color: '#F4D9A4', fontSize: 22, cursor: 'pointer' }}
          >×</button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {results.map(({ t, g }, i) => (
            <div key={i} style={{
              position: 'relative',
              padding: 5,
              borderRadius: 22,
              border: '1px solid rgba(228,201,138,0.75)',
              background: 'linear-gradient(145deg, rgba(228,201,138,0.22), rgba(12,42,31,0.92) 45%, rgba(8,18,15,0.98))',
              boxShadow: '0 22px 44px rgba(0,0,0,0.35), 0 0 32px rgba(201,164,92,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
              animation: 'fadeUp .35s ease both',
            }}>
              <div style={{
                position: 'relative',
                padding: '22px 20px 24px',
                borderRadius: 17,
                border: '1px solid rgba(201,164,92,0.38)',
                textAlign: 'center',
              }}>
                <button
                  onClick={clearSearch}
                  aria-label="Fermer le résultat"
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 30, height: 30, borderRadius: 999,
                    border: '1px solid rgba(201,164,92,.5)',
                    background: 'rgba(201,164,92,.08)', color: '#F4D9A4',
                    fontSize: 18, lineHeight: 1, cursor: 'pointer',
                  }}
                >×</button>

                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.34em', color: '#C9A45C', textTransform: 'uppercase' }}>
                  Bienvenue
                </div>
                <div style={{ marginTop: 6, fontFamily: "'Great Vibes', cursive", fontSize: 40, color: '#F4D9A4', lineHeight: 1.1, wordBreak: 'break-word' }}>
                  {guestName(g)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px auto 14px', width: 190, color: '#C9A45C' }}>
                  <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,#C9A45C)' }} />
                  <span style={{ fontSize: 11 }}>✦</span>
                  <span style={{ flex: 1, height: 1, background: 'linear-gradient(270deg,transparent,#C9A45C)' }} />
                </div>

                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.34em', color: 'rgba(246,239,226,.72)', textTransform: 'uppercase' }}>
                  Votre table
                </div>
                <div style={{ marginTop: 6, fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 600, letterSpacing: '.1em', color: '#F6EFE2', textTransform: 'uppercase', textShadow: '0 2px 14px rgba(228,201,138,0.35)' }}>
                  {t.nom}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Typing indicator */}
      {typing && (
        <div style={{ marginTop: 10, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.14em', color: '#C9A45C' }}>
          Saisissez votre numéro complet, avec l'indicatif si vous êtes à l'étranger
        </div>
      )}

      {/* Not found */}
      {active && settled && results.length === 0 && (
        <div style={{ marginTop: 14, padding: 16, textAlign: 'center', border: '1px dashed rgba(201,164,92,.6)', fontSize: 17 }}>
          Ce numéro ne figure pas sur la liste. Vérifiez-le ou adressez-vous à l'accueil.
        </div>
      )}

      {/* Plan view */}
      <div style={{ marginTop: 22, border: '1px solid rgba(201,164,92,0.7)', padding: 5, background: 'linear-gradient(180deg, rgba(10,42,31,0.95), rgba(8,20,18,0.98))', borderRadius: 16, boxShadow: '0 18px 36px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'relative', height: canvasHeight, border: '1px solid rgba(201,164,92,.4)', background: 'radial-gradient(ellipse at 50% 30%, rgba(24,80,63,1), rgba(10,42,31,0.96) 45%, rgba(7,21,17,1) 100%)', overflow: 'hidden', borderRadius: 12 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 0%, rgba(255,255,255,0.02) 100%)' }} />
              <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.24em', color: '#C9A45C' }}>
                Entrée
              </div>
              {displayTables.map(t => {
                const hi = t.id === sel || foundIds.includes(t.id);
                const bg = hi ? '#C9A45C' : '#0E3B2C';
                const fg = hi ? '#0A2A1F' : '#F6EFE2';
                const glow = hi ? '0 0 0 4px rgba(228,201,138,.25), 0 0 24px rgba(228,201,138,.55)' : '0 4px 10px rgba(0,0,0,.35)';

                return (
                  <div
                    key={t.id}
                    aria-label={t.nom}
                    style={{
                      position: 'absolute',
                      left: t.displayX + '%', top: t.displayTop,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {t.honneur ? (
                      <span style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        width: 190, height: 52, borderRadius: 26,
                        background: bg, color: fg,
                        border: '1px solid #E4C98A',
                        boxShadow: glow,
                        outline: '1px solid rgba(201,164,92,.4)', outlineOffset: 4,
                        transition: 'all .25s',
                      }}>
                        <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: 22, lineHeight: 1 }}>Seynan &amp; Ezechiel</span>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: '.16em' }}>Table d'honneur</span>
                      </span>
                    ) : (
                      <span style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        minWidth: 94, height: 72, padding: '8px 10px', borderRadius: 16,
                        background: bg, color: fg,
                        border: '1px solid #E4C98A',
                        boxShadow: glow,
                        outline: '1px dotted rgba(228,201,138,.7)', outlineOffset: 5,
                        transition: 'all .25s',
                      }}>
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', lineHeight: 1.2 }}>{t.nom}</span>                      </span>
                    )}
                  </div>
                );
              })}
            </div>
      </div>

      <div style={{ marginTop: 28, textAlign: 'center', fontFamily: "'Great Vibes', cursive", fontSize: 24, color: '#C9A45C' }}>
        Seynan &amp; Ezechiel · 16.10.2026
      </div>
    </div>
  );
}
