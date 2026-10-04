import { useState, useEffect, useRef } from 'react';
import type { Data, Tab, Sim } from './types';
import { Accueil } from './tabs/Accueil';
import { Journee } from './tabs/Journee';
import { Ceremonie } from './tabs/Ceremonie';
import { PlanDeTable } from './tabs/PlanDeTable';
import { BottomNav } from './components/Nav';
import { BottomSheet } from './components/BottomSheet';
import { loadWeddingData } from './lib/weddingData';

const SIM: Record<string, [number, number, number]> = {
  veille:  [10, 18,  0],
  matin:   [16, 11,  0],
  '14h30': [16, 14, 30],
  '17h30': [16, 17, 30],
  '21h':   [16, 21,  0],
};

export interface WeddingAppProps {
  initialTab?:   Tab;
  simulation?:   Sim;
  initialQuery?: string;
}

export function WeddingApp({
  initialTab   = 'accueil',
  simulation   = 'reel',
  initialQuery = '',
}: WeddingAppProps) {
  const [data,  setData]  = useState<Data | null>(null);
  const [tab,   setTab]   = useState<Tab>(initialTab);
  const [query, setQuery] = useState(initialQuery);
  const [view,  setView]  = useState<'plan' | 'liste'>('plan');
  const [sel,   setSel]   = useState<string | null>(null);
  const [open,  setOpen]  = useState<Record<number, boolean>>({ 0: true });
  const [, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    loadWeddingData()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch(() => {
        if (active) {
          setData(null);
        }
      });

    const timer = setInterval(() => setTick(t => t + 1), 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const now = (): Date => {
    const m = SIM[simulation];
    return m ? new Date(2026, 9, m[0], m[1], m[2]) : new Date();
  };

  const go = (t: Tab) => {
    setTab(t);
    setSel(null);
    const el = scrollRef.current;
    if (el) {
      // instant scroll to top without smooth animation
      const prev = el.style.scrollBehavior;
      el.style.scrollBehavior = 'auto';
      el.scrollTop = 0;
      el.style.scrollBehavior = prev;
    }
  };

  const selTable = data?.tables.find(t => t.id === sel) ?? null;

  return (
    <div style={{
      width: '100%',
      maxWidth: 430,
      minHeight: '100vh',
      height: '100dvh',
      position: 'relative', overflow: 'hidden',
      background: 'radial-gradient(ellipse at top, rgba(214,176,89,0.35) 0%, rgba(214,176,89,0.12) 18%, rgba(10,44,33,0.9) 35%, rgba(5,26,20,1) 100%), linear-gradient(180deg, #103e2f 0%, #0d3128 100%)',
      color: '#F7F0E5',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 17, lineHeight: 1.5,
      margin: '0 auto',
      boxShadow: '0 0 0 1px rgba(201,164,92,0.45), 0 12px 30px rgba(0,0,0,0.24)',
    }}>
      {/* Scrollable content area */}
      <div
        ref={scrollRef}
        style={{
          position: 'absolute', inset: '0 0 76px 0',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {tab === 'accueil' && (
          <Accueil
            data={data}
            now={now()}
            goDay={() => go('journee')}
            goPlan={() => go('plan')}
            goBook={() => go('ceremonie')}
          />
        )}
        {tab === 'journee' && (
          <Journee data={data} now={now()} />
        )}
        {tab === 'ceremonie' && (
          <Ceremonie data={data} open={open} setOpen={setOpen} />
        )}
        {tab === 'plan' && (
          <PlanDeTable
            data={data}
            query={query}
            setQuery={setQuery}
            view={view}
            setView={setView}
            sel={sel}
            setSel={setSel}
          />
        )}
      </div>

      {/* Bottom sheet overlay (table details) */}
      {selTable && (
        <BottomSheet
          table={selTable}
          onClose={() => setSel(null)}
        />
      )}

      {/* Fixed bottom navigation */}
      <BottomNav tab={tab} onGo={go} />
    </div>
  );
}
