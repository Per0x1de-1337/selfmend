import type { AgentState } from '../types';

const STATE: Record<AgentState, { color: string; label: string; bg: string; ring: boolean; spin: boolean }> = {
  IDLE:         { color: '#4b5563', label: 'Tap to start', bg: '#111118',    ring: false, spin: false },
  LISTENING:    { color: '#22c55e', label: 'Listening',    bg: '#0d2318',    ring: true,  spin: false },
  PROCESSING:   { color: '#f59e0b', label: 'Thinking…',   bg: '#1c1408',    ring: false, spin: true  },
  SPEAKING:     { color: '#3b82f6', label: 'Speaking',     bg: '#0a1628',    ring: true,  spin: false },
  INTERRUPTED:  { color: '#ef4444', label: 'Interrupted',  bg: '#1c0808',    ring: false, spin: false },
  DISCONNECTED: { color: '#4b5563', label: 'Disconnected', bg: '#111118',    ring: false, spin: false },
};

interface Props {
  state: AgentState;
  isRunning: boolean;
  onClick: () => void;
  error?: string | null;
}

export function MicButton({ state, isRunning, onClick, error }: Props) {
  const cfg = STATE[state] ?? STATE.IDLE;
  const SIZE = 120;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Outer ring container */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>

        {/* Expanding rings (LISTENING / SPEAKING) */}
        {cfg.ring && [0, 1].map(i => (
          <span key={i} style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `2px solid ${cfg.color}`,
            animation: `ring-expand 1.8s ease-out ${i * 0.6}s infinite`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Spinning arc (PROCESSING) */}
        {cfg.spin && (
          <span style={{
            position: 'absolute', inset: -6,
            borderRadius: '50%',
            border: `2px solid transparent`,
            borderTopColor: cfg.color,
            borderRightColor: cfg.color,
            animation: 'ring-spin 1s linear infinite',
            pointerEvents: 'none',
          }} />
        )}

        {/* Main button */}
        <button
          onClick={onClick}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: `1.5px solid ${cfg.color}30`,
            background: cfg.bg,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
            boxShadow: `0 0 30px ${cfg.color}18, inset 0 1px 0 ${cfg.color}20`,
            outline: 'none',
          }}
          aria-label={isRunning ? 'Stop agent' : 'Start agent'}
        >
          <MicSVG color={cfg.color} size={38} muted={!isRunning} />
        </button>
      </div>

      {/* State label */}
      <div style={{ textAlign: 'center' }}>
        <div key={state} style={{
          fontSize: 15, fontWeight: 500, color: cfg.color,
          letterSpacing: '-0.01em',
          animation: 'fade-in 0.25s ease',
        }}>
          {isRunning ? cfg.label : 'Tap to start'}
        </div>
        {isRunning && (
          <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
            click to stop
          </div>
        )}
        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 6, maxWidth: 240, textAlign: 'center' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function MicSVG({ color, size, muted }: { color: string; size: number; muted: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity: muted ? 0.35 : 1, transition: 'opacity 0.3s' }}
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8"  y1="22" x2="16" y2="22" />
    </svg>
  );
}
