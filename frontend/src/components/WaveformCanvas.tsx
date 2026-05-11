import { useEffect, useRef } from 'react';
import type { AgentState } from '../types';

const STATE_COLORS: Record<string, string> = {
  LISTENING:    '#22c55e',
  PROCESSING:   '#f59e0b',
  SPEAKING:     '#3b82f6',
  INTERRUPTED:  '#ef4444',
  IDLE:         '#2d2d3f',
  DISCONNECTED: '#2d2d3f',
};

interface Props {
  analyser: AnalyserNode | null;
  state: AgentState;
}

export function WaveformCanvas({ analyser, state }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx  = canvas.getContext('2d')!;

    if (!analyser) {
      // Flat idle line
      const W = canvas.width || 1;
      const H = canvas.height || 1;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#1a1a26';
      ctx.fillRect(0, H / 2 - 1, W, 2);
      return;
    }

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const color = STATE_COLORS[state] ?? '#2d2d3f';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      const step = W / data.length;
      data.forEach((v, i) => {
        const y = ((v - 128) / 128) * (H / 2) + H / 2;
        if (i === 0) ctx.moveTo(0, y);
        else         ctx.lineTo(i * step, y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: 480, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 44, display: 'block', opacity: analyser ? 1 : 0.3, transition: 'opacity 0.4s' }}
      />
    </div>
  );
}
