import React from 'react';

interface WatchNextLogoProps {
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'monogram';
  className?: string;
  textClassName?: string;
}

/**
 * Professional WatchNext Brand Logo
 * Features a modern geometric monogram uniting 'W' and 'N' with an integrated forward/play dynamic glyph.
 */
export function WatchNextLogo({
  size = 36,
  showText = true,
  variant = 'full',
  className = '',
  textClassName = '',
}: WatchNextLogoProps) {
  const pixelSize = typeof size === 'number' ? size : 36;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Monogram Mark */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          {/* Main Vibrant Brand Gradient */}
          <linearGradient id="wnBrandGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          {/* Accent Glow & Play Ribbon */}
          <linearGradient id="wnPlayGrad" x1="14" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Subtle drop glow */}
          <filter id="wnShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C5CFF" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Rounded Modern Badge Container */}
        <rect
          width="44"
          height="44"
          rx="12"
          fill="#0D111A"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />

        {/* Outer Glow Highlight */}
        <rect
          x="1"
          y="1"
          width="42"
          height="42"
          rx="11"
          fill="none"
          stroke="url(#wnBrandGrad)"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* Integrated WN Monogram with Play Arrow Dynamics */}
        <g filter="url(#wnShadow)">
          {/* 'W' left stem */}
          <path
            d="M9 13.5L13.2 30.5C13.4 31.4 14.5 31.8 15.2 31.1L19.5 22.5"
            stroke="url(#wnBrandGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 'W' center & 'N' bridge */}
          <path
            d="M19.5 22.5L23.8 31.1C24.5 31.8 25.6 31.4 25.8 30.5L28.5 19.5"
            stroke="url(#wnBrandGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 'N' forward slant & right upright */}
          <path
            d="M24 13.5L34 29.5V13.5"
            stroke="url(#wnPlayGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Micro forward-play arrow indicator */}
          <polygon
            points="31,21 35.5,23.5 31,26"
            fill="#22D3EE"
          />
        </g>
      </svg>

      {/* Typography / Wordmark */}
      {showText && variant !== 'monogram' && (
        <span className={`font-display font-bold tracking-tight text-white flex items-center ${textClassName || 'text-xl'}`}>
          <span>Watch</span>
          <span className="bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent ml-0.5">
            Next
          </span>
        </span>
      )}
    </div>
  );
}

export default WatchNextLogo;
