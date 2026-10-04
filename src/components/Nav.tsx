import type { Tab } from '../types';
import { IconHome, IconClock, IconBook, IconTable } from './Icons';

interface Props {
  tab: Tab;
  onGo: (t: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'journee', label: 'Journée' },
  { id: 'ceremonie', label: 'Cérémonie' },
  { id: 'plan', label: 'Plan de table' },
];

export function BottomNav({ tab, onGo }: Props) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 0px))',
      background: '#F7F0E2',
      borderTop: '1px solid rgba(162, 129, 65, 0.5)',
      display: 'flex', padding: '6px 6px calc(10px + env(safe-area-inset-bottom, 0px))', zIndex: 5,
    }}>
      {TABS.map(({ id, label }) => {
        const active = id === tab;
        const color = active ? '#103E33' : '#9A7A3B';
        return (
          <button
            key={id}
            onClick={() => onGo(id)}
            style={{
              flex: 1, minHeight: 56, background: 'none', border: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, cursor: 'pointer',
              color, padding: 0,
            }}
          >
            {id === 'accueil' && <IconHome color={color} />}
            {id === 'journee' && <IconClock color={color} />}
            {id === 'ceremonie' && <IconBook color={color} />}
            {id === 'plan' && <IconTable color={color} />}
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: '.08em' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
