import type { AgentState } from '../types';

const STATE_CONFIG: Record<AgentState, { label: string; color: string; bg: string }> = {
  IDLE:         { label: 'Idle',         color: '#6b6b8a', bg: '#1f1f2e' },
  LISTENING:    { label: 'Listening…',   color: '#22c55e', bg: '#14311f' },
  PROCESSING:   { label: 'Thinking…',   color: '#f59e0b', bg: '#2d2210' },
  SPEAKING:     { label: 'Speaking',     color: '#3b82f6', bg: '#101c35' },
  INTERRUPTED:  { label: 'Interrupted',  color: '#ef4444', bg: '#2d1010' },
  DISCONNECTED: { label: 'Disconnected', color: '#6b6b8a', bg: '#1f1f2e' },
};

export function StateBadge({ state }: { state: AgentState }) {
  const { label, color, bg } = STATE_CONFIG[state] ?? STATE_CONFIG.IDLE;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 16px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: '0.02em',
      background: bg,
      color,
      transition: 'all 0.2s',
    }}>
      <span style={{
        width: 8, height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: 'pulse 2s infinite',
      }} />
      {label}
    </span>
  );
}
