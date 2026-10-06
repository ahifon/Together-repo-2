import { WeddingApp } from './WeddingApp';

const SPARKLES = Array.from({ length: 34 }, (_, i) => ({
  left: (i * 37) % 94 + 3,
  top: (i * 53) % 72 + 2,
  star: i % 4 === 0,
  size: i % 4 === 0 ? 11 + (i % 3) * 5 : 2 + (i % 3),
  duration: 2.6 + (i % 5) * 0.9,
  delay: (i * 0.55) % 5,
}));

function DesktopAside() {
  return (
    <aside className="desk-aside" aria-hidden>
      <div className="desk-photo" />
      <div className="desk-sheen" />
      <div className="desk-sparkles">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className={s.star ? 'star' : 'dot'}
            style={{
              left: s.left + '%', top: s.top + '%',
              ...(s.star ? { fontSize: s.size } : { width: s.size, height: s.size }),
              animationDuration: s.duration + 's', animationDelay: s.delay + 's',
            }}
          >{s.star ? '✦' : null}</span>
        ))}
      </div>
      <div className="desk-content">
        <div className="desk-kicker">Le mariage de</div>
        <div className="desk-names">
          Seynan <span>&amp;</span> Ezechiel
        </div>
        <div className="desk-ornament"><i /><b>✦</b><i /></div>
        <div className="desk-date">Vendredi 16 octobre 2026</div>
        <p className="desk-note">
          Retrouvez le programme, le livret de cérémonie, le plan de table et toutes les informations pratiques.
        </p>
      </div>
    </aside>
  );
}

export function App() {
  return (
    <div className="app-root">
      <DesktopAside />
      <div className="app-stage">
        <WeddingApp />
      </div>
    </div>
  );
}
