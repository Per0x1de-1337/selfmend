import { useState } from 'react';
import type { Metrics } from '../types';

interface SessionStats {
  turns: number;
  interruptions: number;
  avgE2E: number | null;
}

interface Props {
  metrics: Metrics;
  noiseFloor: number;
  vadThreshold: number;
  session: SessionStats;
}

// Mini progress bar — shows how close to the "target" value we are.
// Green < target, yellow 1-1.5×, red >1.5×.
function Bar({ value, target }: { value: number; target: number }) {
  const pct  = Math.min((value / target) * 100, 100);
  const over = value > target;
  const bad  = value > target * 1.5;
  const color = bad ? '#ef4444' : over ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ flex: 1, height: 3, background: '#1f1f2e', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s' }} />
    </div>
  );
}

function Row({ label, value, unit = 'ms', target }: {
  label: string; value?: number; unit?: string; target: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 80, fontSize: 11, color: '#6b6b8a', flexShrink: 0 }}>{label}</span>
      <Bar value={value ?? 0} target={target} />
      <span style={{
        width: 56, textAlign: 'right', fontSize: 12, fontVariantNumeric: 'tabular-nums',
        fontWeight: 600, color: value !== undefined ? '#e2e2ee' : '#3b3b52',
      }}>
        {value !== undefined ? `${value}${unit}` : '—'}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#3b3b52',
      }}>{title}</div>
      {children}
    </div>
  );
}

export function MetricsOverlay({ metrics, noiseFloor, vadThreshold, session }: Props) {
  const [hovered, setHovered] = useState(false);
  const e2e = metrics.ttfp !== undefined && metrics.ttft !== undefined && metrics.ttfa !== undefined
    ? metrics.ttfp + metrics.ttft + metrics.ttfa : undefined;

  return (
    <div
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Expanded panel */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 44, right: 0,
          width: 280,
          background: '#0f0f16',
          border: '1px solid #1f1f2e',
          borderRadius: 14,
          padding: 20,
          display: 'flex', flexDirection: 'column', gap: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          animation: 'metrics-in 0.15s ease',
        }}>

          <Section title="Last Turn">
            <Row label="Endpointing" value={metrics.ttfp} target={500} />
            <Row label="LLM TTFT"    value={metrics.ttft} target={400} />
            <Row label="TTS TTFA"    value={metrics.ttfa} target={200} />
            <div style={{ borderTop: '1px solid #1a1a2a', paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#6b6b8a' }}>E2E latency</span>
                <span style={{
                  fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                  color: e2e === undefined ? '#3b3b52'
                    : e2e < 1200 ? '#22c55e'
                    : e2e < 2000 ? '#f59e0b' : '#ef4444',
                }}>
                  {e2e !== undefined ? `${e2e}ms` : '—'}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Live">
            <Row label="WS RTT" value={metrics.rtt} target={100} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 80, fontSize: 11, color: '#6b6b8a', flexShrink: 0 }}>VAD</span>
              <span style={{ fontSize: 11, color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
                floor {(noiseFloor * 1000).toFixed(1)} → thr {(vadThreshold * 1000).toFixed(1)}
              </span>
            </div>
          </Section>

          <Section title="Session">
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Turns',         value: session.turns },
                { label: 'Interruptions', value: session.interruptions },
                { label: 'Avg E2E',       value: session.avgE2E !== null ? `${Math.round(session.avgE2E)}ms` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#3b3b52', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e2ee', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Stack indicators */}
          <div style={{ borderTop: '1px solid #1a1a2a', paddingTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['Nova-2', 'Groq llama-3.1-8b', 'Sonic-2'].map(s => (
              <span key={s} style={{
                fontSize: 10, padding: '2px 8px',
                background: '#131320', border: '1px solid #1f1f2e',
                borderRadius: 999, color: '#6b6b8a',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Trigger chip */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px',
        background: hovered ? '#131320' : '#0f0f16',
        border: '1px solid #1f1f2e',
        borderRadius: 999,
        cursor: 'default',
        color: '#6b6b8a',
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.03em',
        transition: 'background 0.15s',
      }}>
        <BarChartIcon />
        metrics
        {e2e !== undefined && (
          <span style={{
            marginLeft: 4,
            fontSize: 11, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: e2e < 1200 ? '#22c55e' : e2e < 2000 ? '#f59e0b' : '#ef4444',
          }}>
            {e2e}ms
          </span>
        )}
      </button>
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4"  />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}
