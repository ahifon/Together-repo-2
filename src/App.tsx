import { WeddingApp } from './WeddingApp';

function DesktopAside() {
  return (
    <aside className="desk-aside" aria-hidden>
      <div className="desk-photo" />
      <div className="desk-content">
        <div className="desk-kicker">Le mariage de</div>
        <div className="desk-names">
          Seynan <span>&amp;</span> Ezechiel
        </div>
        <div className="desk-ornament"><i /><b>✦</b><i /></div>
        <div className="desk-date">Vendredi 16 octobre 2026</div>
        <p className="desk-note">
          Retrouvez le programme, le livret de cérémonie, le plan de table et toutes les informations pratiques. Cette invitation est pensée pour votre téléphone.
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
