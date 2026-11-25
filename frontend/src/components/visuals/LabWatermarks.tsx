import React from 'react';

/**
 * Corner Chemistry Watermarks:
 * 3 oversized, clean single-stroke inline SVG illustrations fixed to outer viewport corners
 * (steroid scaffold, round-bottom flask, and laboratory pipette).
 */
export const LabWatermarks: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {/* Top-Left: Oversized Steroid / Cyclopentanoperhydrophenanthrene Scaffold */}
      <svg
        viewBox="0 0 320 220"
        className="fixed -top-6 -left-8 w-[340px] sm:w-[420px] h-auto"
        style={{ opacity: 0.06 }}
        fill="none"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="44,128 78,108 112,128 112,168 78,188 44,168" />
        <line x1="52" y1="133" x2="78" y2="118" />
        <line x1="78" y1="178" x2="104" y2="163" />
        <line x1="20" y1="181" x2="44" y2="168" />
        <line x1="24" y1="187" x2="48" y2="174" />
        <polygon points="112,128 146,108 180,128 180,168 146,188 112,168" />
        <polygon points="146,108 146,68 180,48 214,68 214,108 180,128" />
        <polygon points="214,68 252,56 276,88 252,120 214,108" />
        <line x1="112" y1="128" x2="112" y2="94" />
        <line x1="214" y1="68" x2="214" y2="34" />
        <line x1="252" y1="56" x2="286" y2="38" />
        <line x1="286" y1="38" x2="306" y2="52" />
      </svg>

      {/* Bottom-Left: Oversized Round-Bottom Flask */}
      <svg
        viewBox="0 0 220 260"
        className="fixed -bottom-10 -left-8 w-[240px] sm:w-[300px] h-auto"
        style={{ opacity: 0.06 }}
        fill="none"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="86" y="18" width="48" height="12" rx="4" />
        <line x1="94" y1="30" x2="94" y2="92" />
        <line x1="126" y1="30" x2="126" y2="92" />
        <path d="M94 92 C52 104 34 148 48 190 C62 230 108 248 150 232 C190 216 202 168 184 128 C174 106 150 96 126 92" />
        <path d="M54 176 Q110 190 176 172" />
        <circle cx="92" cy="198" r="6" />
        <circle cx="122" cy="212" r="4" />
        <circle cx="142" cy="190" r="5" />
      </svg>

      {/* Bottom-Right: Oversized Laboratory Pipette */}
      <svg
        viewBox="0 0 260 260"
        className="fixed -bottom-6 -right-8 w-[260px] sm:w-[330px] h-auto"
        style={{ opacity: 0.06 }}
        fill="none"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <g transform="rotate(-35 130 130)">
          <path d="M114 22 C114 8 146 8 146 22 L146 58 L114 58 Z" />
          <rect x="118" y="58" width="24" height="120" rx="2" />
          <line x1="118" y1="80" x2="130" y2="80" />
          <line x1="118" y1="98" x2="134" y2="98" />
          <line x1="118" y1="116" x2="130" y2="116" />
          <line x1="118" y1="134" x2="134" y2="134" />
          <line x1="118" y1="152" x2="130" y2="152" />
          <path d="M118 178 L126 228 L134 228 L142 178 Z" />
          <path d="M130 236 C125 245 125 252 130 254 C135 252 135 245 130 236 Z" />
        </g>
      </svg>
    </div>
  );
};
