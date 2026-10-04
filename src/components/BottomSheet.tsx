import type { Table } from '../types';

interface Props {
  table: Table;
  onClose: () => void;
}

const guestName = (g: Table['invites'][number]) => g.nom;

export function BottomSheet({ table, onClose }: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(10,20,14,.6)',
          zIndex: 8, animation: 'fadeUp .2s ease both',
        }}
      />
      {/* Sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 9,
        maxHeight: '70%', overflowY: 'auto',
        background: '#F6F0E6',
        color: '#0E3B2C',
        borderTop: '1px solid #C9A75A',
        boxShadow: '0 -12px 40px rgba(58,36,22,.24)',
        padding: '10px 20px 28px',
        animation: 'sheetUp .3s cubic-bezier(.2,0,0,1) both',
      }}>
        {/* Handle */}
        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(201,164,92,.6)', margin: '0 auto 14px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.24em', color: '#8D4D3A' }}>Table</div>
            <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 42, color: '#8D4D3A', lineHeight: 1.1 }}>{table.nom}</div>
            <div style={{ fontSize: 16, fontStyle: 'italic' }}>{table.invites.length} convives</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 44, height: 44, flex: 'none',
              border: '1px solid #C9A45C', borderRadius: '50%',
              background: 'none', color: '#8D4D3A',
              fontSize: 22, cursor: 'pointer',
            }}
          >×</button>
        </div>

        <div style={{ height: 1, background: 'rgba(201,164,92,.5)', margin: '14px 0 6px' }} />

        {table.invites.map((g, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            minHeight: 44,
            borderBottom: '1px solid rgba(141, 77, 58, 0.18)',
            fontSize: 19,
          }}>
            <span style={{ color: '#9E5F47', fontSize: 10 }}>✦</span>
            {guestName(g)}
          </div>
        ))}
      </div>
    </>
  );
}
