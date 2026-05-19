import React from 'react';

const Loading: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#ffffff',
    flexDirection: 'column',
    gap: 16,
  }}>
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle
        cx="24" cy="24" r="22"
        stroke="url(#aura-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="110 30"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 24 24"
          to="360 24 24"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
      <defs>
        <linearGradient id="aura-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
    <span style={{
      fontSize: 18,
      fontWeight: 600,
      color: '#7c3aed',
      letterSpacing: '0.05em',
    }}>
      Aura
    </span>
  </div>
);

export default Loading;
