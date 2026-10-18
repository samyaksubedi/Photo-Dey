import { useId, type ReactNode } from 'react';

export type SceneKind = 'wedding' | 'concert' | 'college' | 'family' | 'party';
export type Match = { x: number; y: number; w: number; h: number; label?: string; hot?: boolean };

const SKIN = ['#EDBB97', '#D29A72', '#B97C52', '#8B5A3A'];
const INK = '#21161A';

export function coverKind(name: string, id = ''): SceneKind {
  const n = name.toLowerCase();
  if (/wed|shaadi|bibaha|marriage|reception|sangeet|mehendi|mehndi|engagement|haldi/.test(n)) return 'wedding';
  if (/college|school|grad|convocation|campus|reunion|batch/.test(n)) return 'college';
  if (/concert|fest|show|live|music|dj|night/.test(n)) return 'concert';
  if (/birthday|party|anniversary|pasni|baby|bday/.test(n)) return 'party';
  if (/bratabandha|puja|family|ceremony|janai|teej|dashain|tihar|diwali|chhath|holi/.test(n)) return 'family';
  const kinds: SceneKind[] = ['wedding', 'concert', 'college', 'family', 'party'];
  const seed = [...(id || name)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return kinds[seed % kinds.length];
}

export function Bust({
  x,
  y,
  s = 1,
  skin = 1,
  cloth,
  hair = INK,
  longHair = false,
  extra,
}: {
  x: number;
  y: number;
  s?: number;
  skin?: number;
  cloth: string;
  hair?: string;
  longHair?: boolean;
  extra?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {longHair && <path d="M-26 -4 C-31 40 -28 62 -22 66 L22 66 C28 62 31 40 26 -4Z" fill={hair} />}
      <path d="M-36 100 C-36 56 -20 36 0 36 C20 36 36 56 36 100 Z" fill={cloth} />
      <rect x="-7" y="20" width="14" height="22" rx="6" fill={SKIN[skin]} />
      <circle r="23" fill={SKIN[skin]} />
      <path d="M-24 -2 C-26 -28 -9 -32 0 -32 C10 -32 26 -27 24 -2 C17 -15 7 -17 0 -17 C-8 -17 -17 -13 -24 -2Z" fill={hair} />
      <circle cx="-8" cy="3" r="1.9" fill={INK} />
      <circle cx="8" cy="3" r="1.9" fill={INK} />
      <path d="M-6 11 Q0 16 6 11" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {extra}
    </g>
  );
}

const topi = (
  <g>
    <path d="M-22 -10 L-20 -35 L20 -35 L22 -10 Z" fill="#6B4A36" />
    <path d="M-21 -21 H21" stroke="#F2A93B" strokeWidth="2.5" />
  </g>
);
const tikka = <circle cy="-12" r="2.6" fill="#C2185B" />;
const gradCap = (
  <g>
    <path d="M-31 -24 L0 -40 L31 -24 L0 -10 Z" fill={INK} />
    <path d="M-14 -19 V-6 Q0 0 14 -6 V-19" fill={INK} />
    <path d="M25 -25 V-8" stroke="#F2A93B" strokeWidth="2" />
    <circle cx="25" cy="-6" r="2.6" fill="#F2A93B" />
  </g>
);
const partyHat = (
  <g>
    <path d="M-14 -24 L0 -62 L14 -24Z" fill="#C2185B" />
    <path d="M-9 -38 H9" stroke="#F2A93B" strokeWidth="3" />
    <circle cy="-62" r="4" fill="#F2A93B" />
  </g>
);

function Brackets({ m }: { m: Match }) {
  const { x, y, w, h } = m;
  const c = Math.min(12, w / 3, h / 3);
  const color = m.hot ? '#F2A93B' : 'rgba(255,255,255,.9)';
  return (
    <g fill="none" stroke={color} strokeWidth={m.hot ? 3.2 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x} ${y + c}V${y}H${x + c}`} />
      <path d={`M${x + w - c} ${y}H${x + w}V${y + c}`} />
      <path d={`M${x} ${y + h - c}V${y + h}H${x + c}`} />
      <path d={`M${x + w - c} ${y + h}H${x + w}V${y + h - c}`} />
      {m.label && (
        <g stroke="none">
          <rect x={x} y={y + h + 7} width={m.label.length * 6.6 + 16} height="21" rx="10.5" fill="#F2A93B" />
          <text x={x + 8} y={y + h + 21.5} fontSize="11.5" fontWeight="700" fill="#2B0E18" fontFamily="Plus Jakarta Sans, sans-serif">
            {m.label}
          </text>
        </g>
      )}
    </g>
  );
}

function garland(d: string, color: string, width = 9) {
  return <path d={d} stroke={color} strokeWidth={width} strokeDasharray="0.1 11" strokeLinecap="round" fill="none" />;
}

function WeddingArt() {
  return (
    <>
      <path d="M40 84 L200 18 L360 84 Z" fill="#8E1F36" />
      <path d="M40 84 H360" stroke="#F2A93B" strokeWidth="6" />
      <rect x="62" y="84" width="14" height="190" fill="#8E1F36" />
      <rect x="324" y="84" width="14" height="190" fill="#8E1F36" />
      {garland('M76 100 Q200 176 324 100', '#F2A93B')}
      {garland('M76 112 Q200 188 324 112', '#E8563F', 7)}
      {[112, 152, 248, 288].map((x) => garland(`M${x} 96 V${128 + (x % 3) * 8}`, '#F2A93B', 8))}
      <Bust x={105} y={158} s={0.85} skin={2} cloth="#1F6F6B" longHair />
      <Bust x={296} y={158} s={0.85} skin={0} cloth="#F2A93B" extra={topi} />
      <Bust x={170} y={150} s={1.15} skin={1} cloth="#C0183B" longHair extra={tikka} />
      <Bust x={238} y={152} s={1.15} skin={2} cloth="#FFF3DA" extra={topi} />
      <rect y="254" width="400" height="46" fill="#6C1528" />
      <rect y="254" width="400" height="4" fill="#F2A93B" />
    </>
  );
}

function ConcertArt() {
  return (
    <>
      <path d="M120 0 L20 300 H180Z" fill="#fff" opacity=".07" />
      <path d="M200 0 L150 300 H330Z" fill="#F2A93B" opacity=".13" />
      <path d="M290 0 L220 300 H400Z" fill="#fff" opacity=".07" />
      <ellipse cx="200" cy="130" rx="190" ry="70" fill="#F2A93B" opacity=".12" />
      {[30, 90, 150, 215, 270, 340, 380, 60].map((x, i) => (
        <circle key={x} cx={x} cy={20 + ((i * 37) % 70)} r={1.6 + (i % 3)} fill="#fff" opacity=".7" />
      ))}
      {[
        [60, 6, '#2F2540'],
        [330, 6, '#2F2540'],
        [135, 4, '#4A1230'],
        [265, 4, '#4A1230'],
      ].map(([x, ph, c], i) => (
        <g key={i}>
          <g stroke={SKIN[(i + 1) % 4]} strokeWidth="9" strokeLinecap="round" fill="none">
            <path d={`M${Number(x) - 20} ${190 + Number(ph)} L${Number(x) - 34} 128`} />
            <path d={`M${Number(x) + 20} ${190 + Number(ph)} L${Number(x) + 30} 120`} />
          </g>
          <Bust x={Number(x)} y={170 + Number(ph)} s={0.9} skin={(i + 1) % 4} cloth={String(c)} />
        </g>
      ))}
      <Bust x={200} y={190} s={1.05} skin={1} cloth="#C0183B" longHair />
      <Bust x={95} y={215} s={0.95} skin={3} cloth="#1F6F6B" />
      <Bust x={305} y={215} s={0.95} skin={0} cloth="#F2A93B" />
    </>
  );
}

function CollegeArt() {
  return (
    <>
      <path d="M70 120 L200 66 L330 120Z" fill="#F4E7CF" />
      <rect x="82" y="120" width="236" height="140" fill="#F4E7CF" />
      {[100, 138, 176, 214, 252, 290].map((x) => (
        <rect key={x} x={x} y="126" width="14" height="130" rx="3" fill="#E6D3B0" />
      ))}
      <rect x="170" y="196" width="60" height="64" rx="4" fill="#8E1F36" />
      {[
        [58, 52, -18],
        [330, 40, 24],
        [262, 24, 8],
        [120, 28, -6],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M-14 0 L0 -8 L14 0 L0 8Z" fill={INK} />
          <path d="M10 1 V12" stroke="#F2A93B" strokeWidth="2" />
        </g>
      ))}
      <Bust x={116} y={170} s={1} skin={2} cloth="#8E1F36" extra={gradCap} />
      <Bust x={200} y={158} s={1.1} skin={0} cloth="#1F6F6B" longHair extra={gradCap} />
      <Bust x={284} y={170} s={1} skin={3} cloth="#2B0E18" extra={gradCap} />
      <rect y="262" width="400" height="38" fill="#2F8F83" />
    </>
  );
}

function FamilyArt() {
  return (
    <>
      {[
        [60, 60, 30],
        [340, 80, 36],
        [150, 30, 22],
        [260, 50, 26],
        [30, 160, 22],
        [376, 170, 22],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#F2A93B" opacity={0.16 + (i % 3) * 0.05} />
      ))}
      <Bust x={110} y={148} s={0.95} skin={3} cloth="#F2A93B" hair="#CFC8C2" longHair />
      <Bust x={290} y={148} s={0.95} skin={2} cloth="#FFF3DA" hair="#CFC8C2" extra={topi} />
      <Bust x={165} y={150} s={1.1} skin={1} cloth="#C0183B" longHair extra={tikka} />
      <Bust x={232} y={152} s={1.1} skin={2} cloth="#1F6F6B" />
      <Bust x={200} y={192} s={0.7} skin={1} cloth="#F2A93B" />
      <rect y="250" width="400" height="50" fill="#2B0E18" />
      {[70, 130, 200, 270, 330].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="268" rx="17" ry="8" fill="#F2A93B" />
          <path d={`M${x} 238 C${x + 9} 250 ${x + 6} 260 ${x} 262 C${x - 6} 260 ${x - 9} 250 ${x} 238Z`} fill="#FFE29A" />
          <circle cx={x} cy="252" r="22" fill="#F2A93B" opacity=".14" />
        </g>
      ))}
    </>
  );
}

function PartyArt() {
  const confetti = ['#C2185B', '#F2A93B', '#1F6F6B', '#8E1F36', '#F28C5B'];
  return (
    <>
      {Array.from({ length: 30 }, (_, i) => (
        <rect
          key={i}
          x={(i * 53) % 396}
          y={(i * 37) % 200}
          width="7"
          height="12"
          rx="2"
          fill={confetti[i % 5]}
          transform={`rotate(${(i * 47) % 180} ${(i * 53) % 396} ${(i * 37) % 200})`}
        />
      ))}
      <g>
        <ellipse cx="48" cy="120" rx="26" ry="32" fill="#C2185B" />
        <ellipse cx="82" cy="100" rx="22" ry="28" fill="#F2A93B" />
        <path d="M48 152 Q60 220 70 260M82 128 Q76 200 70 260" stroke="#8E1F36" strokeWidth="1.5" fill="none" />
        <ellipse cx="352" cy="110" rx="26" ry="32" fill="#1F6F6B" />
        <path d="M352 142 Q340 210 330 260" stroke="#8E1F36" strokeWidth="1.5" fill="none" />
      </g>
      <Bust x={130} y={160} s={1} skin={1} cloth="#8E1F36" longHair extra={partyHat} />
      <Bust x={206} y={150} s={1.15} skin={0} cloth="#1F6F6B" extra={partyHat} />
      <Bust x={282} y={162} s={1} skin={3} cloth="#F2A93B" longHair extra={partyHat} />
      <rect y="258" width="400" height="42" fill="#8E1F36" />
      <rect x="150" y="238" width="100" height="26" rx="6" fill="#FFF3DA" />
      <path d="M150 248 Q165 260 180 248 T210 248 T240 248" fill="#F2A93B" />
    </>
  );
}

const backgrounds: Record<SceneKind, [string, string]> = {
  wedding: ['#FBE3B0', '#F0A860'],
  concert: ['#1B0A22', '#5A1636'],
  college: ['#BFE6E1', '#F6EBD3'],
  family: ['#3A1424', '#7A1B30'],
  party: ['#FDF0D6', '#F8E1E6'],
};

export function Scene({
  kind,
  crop,
  matches,
  className = '',
}: {
  kind: SceneKind;
  crop?: [number, number, number, number];
  matches?: Match[];
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [cx, cy, cw, ch] = crop ?? [0, 0, 400, 300];
  const [top, bottom] = backgrounds[kind];
  return (
    <svg
      className={`scene ${className}`}
      viewBox={`${cx} ${cy} ${cw} ${ch}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg${uid})`} />
      {kind === 'wedding' && <WeddingArt />}
      {kind === 'concert' && <ConcertArt />}
      {kind === 'college' && <CollegeArt />}
      {kind === 'family' && <FamilyArt />}
      {kind === 'party' && <PartyArt />}
      {matches?.map((m, i) => <Brackets key={i} m={m} />)}
    </svg>
  );
}
