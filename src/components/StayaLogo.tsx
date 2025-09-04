import React from 'react';

interface StayaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact';
}

const StayaLogo: React.FC<StayaLogoProps> = ({ className = '', size = 'md', variant = 'full' }) => {
  const sizeClasses = {
    sm: variant === 'compact' ? 'w-12 h-12' : 'w-24 h-24',
    md: variant === 'compact' ? 'w-16 h-16' : 'w-32 h-32',
    lg: variant === 'compact' ? 'w-20 h-20' : 'w-40 h-40',
    xl: variant === 'compact' ? 'w-24 h-24' : 'w-48 h-48'
  };

  if (variant === 'compact') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          <defs>
            <radialGradient id="compactBgGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#1DBCBC" />
            </radialGradient>
          </defs>

          <circle cx="60" cy="60" r="55" fill="url(#compactBgGradient)"/>

          {/* Compact Suitcase */}
          <g transform="translate(60, 35)">
            <rect x="-12" y="-8" width="24" height="4" rx="2" fill="white"/>
            <rect x="-15" y="-4" width="30" height="35" rx="3" fill="white"/>
            <circle cx="-10" cy="33" r="2" fill="#1DBCBC"/>
            <circle cx="10" cy="33" r="2" fill="#1DBCBC"/>
            <rect x="-1" y="31" width="2" height="6" fill="#1DBCBC"/>
          </g>

          {/* Compact Orbital ring */}
          <g transform="translate(60, 55)">
            <ellipse cx="0" cy="0" rx="25" ry="8" stroke="white" strokeWidth="2" fill="none" transform="rotate(-15)"/>
          </g>

          {/* Compact STAYA Text */}
          <g transform="translate(60, 85)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-white font-bold"
              style={{ fontSize: '14px', fontFamily: 'Arial Black, Arial, sans-serif' }}
            >
              STAYA
            </text>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        {/* Background Circle with gradient */}
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#1DBCBC" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="190" fill="url(#bgGradient)" filter="url(#shadow)"/>

        {/* Suitcase */}
        <g transform="translate(200, 130)">
          {/* Handle */}
          <rect x="-18" y="-30" width="36" height="18" rx="9" fill="white" stroke="#1DBCBC" strokeWidth="2"/>

          {/* Main body */}
          <rect x="-50" y="-15" width="100" height="130" rx="12" fill="white" stroke="#1DBCBC" strokeWidth="3"/>

          {/* Suitcase details */}
          <rect x="-40" y="0" width="80" height="2" fill="#1DBCBC"/>
          <rect x="-40" y="20" width="80" height="2" fill="#1DBCBC"/>
          <rect x="-40" y="40" width="80" height="2" fill="#1DBCBC"/>

          {/* Wheels */}
          <circle cx="-35" cy="120" r="8" fill="#1DBCBC"/>
          <circle cx="35" cy="120" r="8" fill="#1DBCBC"/>
          <circle cx="-35" cy="120" r="4" fill="white"/>
          <circle cx="35" cy="120" r="4" fill="white"/>

          {/* Handle extension */}
          <rect x="-4" y="115" width="8" height="25" fill="#1DBCBC" rx="4"/>
        </g>

        {/* Orbital ring with animation */}
        <g transform="translate(200, 190)">
          <ellipse cx="0" cy="0" rx="90" ry="30" stroke="white" strokeWidth="6" fill="none" transform="rotate(-15)" opacity="0.9">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="-15 0 0"
              to="345 0 0"
              dur="8s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* STAYA Text with better styling */}
        <g transform="translate(200, 290)">
          <text
            x="0"
            y="0"
            textAnchor="middle"
            className="fill-white font-bold"
            style={{
              fontSize: '52px',
              fontFamily: 'Arial Black, Arial, sans-serif',
              letterSpacing: '2px',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            STAYA
          </text>
        </g>

        {/* BOOKINGS Text with better styling */}
        <g transform="translate(200, 330)">
          <line x1="-90" y1="0" x2="-25" y2="0" stroke="white" strokeWidth="4" opacity="0.9"/>
          <text
            x="0"
            y="6"
            textAnchor="middle"
            className="fill-white font-medium"
            style={{
              fontSize: '16px',
              fontFamily: 'Arial, sans-serif',
              letterSpacing: '6px',
              filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
            }}
          >
            BOOKINGS
          </text>
          <line x1="25" y1="0" x2="90" y2="0" stroke="white" strokeWidth="4" opacity="0.9"/>
        </g>
      </svg>
    </div>
  );
};

export default StayaLogo;
