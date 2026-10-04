import { WeddingApp } from './WeddingApp';

export function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0d3a2d 0%, #123f30 34%, #0b2e23 100%)',
      }}
    >
      <WeddingApp />
    </div>
  );
}
