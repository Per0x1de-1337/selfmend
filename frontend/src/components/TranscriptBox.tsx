import type { Turn } from '../types';

interface Props {
  turns: Turn[];
}

export function TranscriptBox({ turns }: Props) {
  // Show last 4 turns (2 exchanges) to keep it clean
  const visible = turns.slice(-4);

  if (visible.length === 0) return null;

  return (
    <div style={{
      width: '100%', maxWidth: 520,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {visible.map(turn => (
        <div
          key={turn.id}
          style={{
            display: 'flex',
            justifyContent: turn.speaker === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fade-in 0.2s ease',
          }}
        >
          <div style={{
            maxWidth: '80%',
            padding: '9px 14px',
            borderRadius: turn.speaker === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: turn.speaker === 'user' ? '#1a1f2e' : '#111118',
            border: `1px solid ${turn.speaker === 'user' ? '#2a3a5a' : '#1f1f2e'}`,
            fontSize: 14,
            lineHeight: 1.5,
            color: turn.final ? '#d4d4e8' : '#7b7b9a',
            fontStyle: !turn.final && turn.text === '…' ? 'normal' : 'normal',
            transition: 'color 0.25s',
          }}>
            {turn.text || '…'}
            {!turn.final && turn.text !== '…' && (
              <span style={{
                display: 'inline-block', width: 4, height: 4,
                background: '#3b82f6', borderRadius: '50%',
                marginLeft: 4, verticalAlign: 'middle',
                animation: 'dot-pulse 0.8s ease infinite',
              }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
