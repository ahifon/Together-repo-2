/** Inline SVG icons matching the prototype exactly */

export const IconAlliances = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <circle cx="9" cy="14" r="5.5" />
    <circle cx="15" cy="14" r="5.5" />
    <path d="M13 4.5 15 3l2 1.5-2 2.5z" />
  </svg>
);

export const IconPhoto = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M3 8h4l1.5-2.5h7L17 8h4v11H3z" />
    <circle cx="12" cy="13" r="3.8" />
  </svg>
);

export const IconFlutes = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M6 3h4l-.5 7a1.5 1.5 0 0 1-3 0z" />
    <path d="M8 11.5V20M6 20h4" />
    <path d="M14 3h4l-.5 7a1.5 1.5 0 0 1-3 0z" />
    <path d="M16 11.5V20M14 20h4" />
    <path d="M11 2.5l1 1M12 6l1.5-.5" />
  </svg>
);

export const IconCloche = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M4 17a8 8 0 0 1 16 0z" />
    <path d="M2.5 19.5h19M12 9V7.5M10.5 7.5h3" />
  </svg>
);

export const IconMusic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M9 18V5l11-2v13" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </svg>
);

export const IconHome = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11 12 4l9 7" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const IconClock = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconBook = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round">
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
    <path d="M12 6.5v13" />
  </svg>
);

export const IconTable = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3">
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="4" r="1.3" />
    <circle cx="12" cy="20" r="1.3" />
    <circle cx="4" cy="12" r="1.3" />
    <circle cx="20" cy="12" r="1.3" />
  </svg>
);

export const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A45C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3.5h3.5l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

export const CornerOrnament = ({ flip }: { flip?: boolean }) => (
  <div style={{ position: 'absolute', top: 0, ...(flip ? { right: 0, transform: 'scaleX(-1)' } : { left: 0 }), pointerEvents: 'none' }}>
    <svg width="120" height="110" viewBox="0 0 120 110" fill="none">
      <path d="M2 4C30 10 52 30 66 62" stroke="#C9A45C" strokeWidth="1" />
      <path d="M14 8c4-8 14-8 16-4-6 4-12 6-16 4Z M30 16c6-6 15-4 16 0-6 3-12 3-16 0Z M42 28c7-4 15-1 15 3-7 2-12 1-15-3Z M50 42c7-2 14 2 13 6-6 0-11-2-13-6Z" fill="#1F5A42" stroke="#C9A45C" strokeWidth=".8" />
      <path d="M8 18c-2 8 2 14 6 14 0-6-2-11-6-14Z M22 28c-1 8 3 13 7 13 0-6-3-10-7-13Z M34 40c0 7 4 11 8 11-1-6-4-9-8-11Z" fill="#1F5A42" stroke="#C9A45C" strokeWidth=".8" />
      <circle cx="38" cy="10" r="2.2" fill="#F6EFE2" />
      <circle cx="56" cy="22" r="1.8" fill="#F6EFE2" />
      <circle cx="18" cy="38" r="1.8" fill="#F6EFE2" />
      <circle cx="60" cy="54" r="2.4" fill="#8E2A23" stroke="#C9A45C" strokeWidth=".5" />
      <circle cx="65" cy="50" r="2" fill="#8E2A23" stroke="#C9A45C" strokeWidth=".5" />
    </svg>
  </div>
);

export const IconBed = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 19V6" />
    <path d="M3 15h18v4" />
    <path d="M21 15v-3a3 3 0 0 0-3-3h-7v6" />
    <circle cx="7" cy="11.5" r="1.8" />
  </svg>
);
