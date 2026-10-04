import type { Data, Table } from '../types';
import { IconPhone } from '../components/Icons';

interface Props {
  data: Data | null;
  query: string;
  setQuery: (q: string) => void;
  sel: string | null;
  setSel: (id: string | null) => void;
}

/** Normalise un numéro : garde uniquement les chiffres, gère +33 */
function telN(s: string): string {
  let x = String(s || '').replace(/\D/g, '');
  if (x.startsWith('0033')) x = '0' + x.slice(4);
  else if (x.startsWith('33') && x.length === 11) x = '0' + x.slice(2);
  return x;
}

function guestTel(g: Table['invites'][number]): string {
  return telN(g.telephone || '');
}

function guestName(g: Table['invites'][number]): string {
  return g.nom;
}

export function PlanDeTable({ data, query, setQuery, sel, setSel }: Props) {
  if (!data) return null;

  const qd = telN(query);
  const active = qd.length >= 10;
  const typing = qd.length > 0 && !active;

  // Search results
  type Result = { t: Table; g: Table['invites'][number] };
  const results: Result[] = [];
  if (active) {
    data.tables.forEach(t => {
      t.invites.forEach(g => {
        if (guestTel(g) === qd && results.length < 4) results.push({ t, g });
      });
    });
  }
  const foundIds = results.map(r => r.t.id);

  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const plus = v.trim().startsWith('+');
    const dg = v.replace(/\D/g, '').slice(0, plus ? 11 : 10);
    setQuery((plus ? '+' : '') + dg.replace(/(\d{2})(?=\d)/g, '$1 '));
  };

  const clearSearch = () => {
    setQuery('');
  };

  const openTableFromResult = (tableId: string) => {
    setSel(tableId);
    setQuery('');
  };

  const displayTables = data.tables.map((table, index) => {
    const hasCustomPosition = Number.isFinite(table.x) && Number.isFinite(table.y) && !(table.x === 0 && table.y === 0);
    const columns = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(Math.max(data.tables.length, 1)))));
    const row = Math.floor(index / columns);
    const col = index % columns;

    return {
      ...table,
      displayX: hasCustomPosition ? table.x : (table.honneur ? 50 : 16 + col * (68 / Math.max(columns - 1, 1))),
      displayY: hasCustomPosition ? table.y : (table.honneur ? 14 : 18 + row * 18),
    };
  });

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
          placeholder="06 12 34 56 78"
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
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {results.map(({ t, g }, i) => {
            const nomComplet = guestName(g);
            const maskedTel = '•• •• •• ' + qd.slice(6, 8) + ' ' + qd.slice(8);
            const autres = t.invites.filter(x => x !== g).map(guestName);
            return (
              <div key={i} style={{
                border: '1px solid rgba(228,201,138,0.7)',
                background: 'linear-gradient(135deg, rgba(201,164,92,0.18), rgba(12,42,31,0.9), rgba(10,14,13,0.96))',
                borderRadius: 18,
                padding: '10px 12px',
                boxShadow: '0 16px 30px rgba(0,0,0,0.22), 0 0 20px rgba(201,164,92,0.12)',
                backdropFilter: 'blur(4px)',
                animation: 'fadeUp .3s ease both',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.12em', color: '#E4C98A', textTransform: 'uppercase' }}>
                    Table trouvée
                  </div>
                  <button
                    onClick={clearSearch}
                    aria-label="Fermer le résultat"
                    style={{
                      width: 28, height: 28, borderRadius: 999,
                      border: '1px solid rgba(201,164,92,.55)',
                      background: 'rgba(201,164,92,.08)', color: '#F4D9A4',
                      fontSize: 18, cursor: 'pointer', lineHeight: 1,
                    }}
                  >×</button>
                </div>

                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 28, color: '#F4D9A4', lineHeight: 1.1 }}>{nomComplet}</div>
                    <div style={{ marginTop: 2, fontFamily: 'Cinzel, serif', fontSize: 19, fontWeight: 700, color: '#F6EFE2' }}>{t.nom}</div>
                    <div style={{ marginTop: 2, fontSize: 12, color: 'rgba(246,239,226,.76)' }}>{maskedTel}</div>
                  </div>
                  <button
                    onClick={() => openTableFromResult(t.id)}
                    style={{
                      minHeight: 40, padding: '0 14px',
                      background: 'linear-gradient(135deg, #D9B76B, #B98A42)', border: 0, borderRadius: 999, color: '#132B20',
                      fontFamily: 'Cinzel, serif', fontSize: 10, fontWeight: 700,
                      letterSpacing: '.1em', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >Voir</button>
                </div>

                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(201,164,92,.26)' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: '.12em', color: '#E4C98A', textTransform: 'uppercase' }}>
                    {autres.length > 0 ? 'À votre table' : 'Vous êtes seul à cette table'}
                  </div>
                  {autres.map((n, k) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 34, fontSize: 17, color: 'rgba(246,239,226,.92)' }}>
                      <span style={{ color: '#C9A45C', fontSize: 9 }}>✦</span>{n}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Typing indicator */}
      {typing && (
        <div style={{ marginTop: 10, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: '.14em', color: '#C9A45C' }}>
          Encore {10 - qd.length} chiffre{10 - qd.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Not found */}
      {active && results.length === 0 && (
        <div style={{ marginTop: 14, padding: 16, textAlign: 'center', border: '1px dashed rgba(201,164,92,.6)', fontSize: 17 }}>
          Ce numéro ne figure pas sur la liste. Vérifiez-le ou adressez-vous à l'accueil.
        </div>
      )}

      {/* Plan view */}
      <div style={{ marginTop: 22, border: '1px solid rgba(201,164,92,0.7)', padding: 5, background: 'linear-gradient(180deg, rgba(10,42,31,0.95), rgba(8,20,18,0.98))', borderRadius: 16, boxShadow: '0 18px 36px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'relative', height: 440, border: '1px solid rgba(201,164,92,.4)', background: 'radial-gradient(ellipse at 50% 30%, rgba(24,80,63,1), rgba(10,42,31,0.96) 45%, rgba(7,21,17,1) 100%)', overflow: 'hidden', borderRadius: 12 }}>
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
                      left: t.displayX + '%', top: t.displayY + '%',
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
                        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 600, letterSpacing: '.04em', lineHeight: 1.2 }}>{t.nom}</span>
                        <span style={{ fontSize: 12, fontStyle: 'italic' }}>{t.invites.length} pers.</span>
                      </span>
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
