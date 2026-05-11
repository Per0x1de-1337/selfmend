import { useState } from 'react';
import { MicButton }      from './components/MicButton';
import { WaveformCanvas } from './components/WaveformCanvas';
import { TranscriptBox }  from './components/TranscriptBox';
import { MetricsOverlay } from './components/MetricsOverlay';
import { useVoiceAgent }  from './hooks/useVoiceAgent';

export default function App() {
  const { agentState, turns, metrics, noiseFloor, vadThreshold, isRunning, analyser, session, start, stop } =
    useVoiceAgent();

  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (isRunning) {
      stop();
      setError(null);
    } else {
      try {
        setError(null);
        await start();
      } catch (e) {
        setError((e as Error).message);
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#09090d',
      color: '#e2e2ee',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontSize: 14,
    }}>

      {/* Minimal header */}
      <header style={{
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid #111118',
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
          stroke="#3b82f6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8"  y1="22" x2="16" y2="22" />
        </svg>
        <span style={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: 15 }}>Tulu</span>
        <span style={{ color: '#2d2d3f', fontSize: 13 }}>·</span>
        <span style={{ color: '#4b5563', fontSize: 13 }}>full-duplex voice agent</span>
      </header>

      {/* Main centered content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 40,
      }}>

        <MicButton
          state={agentState}
          isRunning={isRunning}
          onClick={handleToggle}
          error={error}
        />

        <WaveformCanvas analyser={analyser} state={agentState} />

        <TranscriptBox turns={turns} />
      </main>

      {/* Metrics hover overlay (fixed, bottom-right) */}
      <MetricsOverlay
        metrics={metrics}
        noiseFloor={noiseFloor}
        vadThreshold={vadThreshold}
        session={session}
      />
    </div>
  );
}
