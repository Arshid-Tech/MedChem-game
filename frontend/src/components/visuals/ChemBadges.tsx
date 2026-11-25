import React from 'react';

interface IconProps {
  className?: string;
}

/** Custom Illustrated Reagent Vial Badge (#0D9488 teal + 2px #18181B ink outline) */
export const ReagentVialBadge: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
    <rect x="16" y="5" width="16" height="5" rx="2" fill="#EFECE6" stroke="#18181B" strokeWidth="2" />
    <path
      d="M19 10 V19 L10 35 C8.5 37.8 10.5 41 13.7 41 H34.3 C37.5 41 39.5 37.8 38 35 L29 19 V10 Z"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M14.5 29 H33.5 L36.6 35 C37.6 36.9 36.2 39 34 39 H14 C11.8 39 10.4 36.9 11.4 35 Z"
      fill="#0D9488"
      stroke="#18181B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="34" r="1.8" fill="#FFFFFF" />
    <circle cx="26" cy="32" r="1.4" fill="#F59E0B" />
  </svg>
);

/** Custom Illustrated Molecular Trophy Badge (#F59E0B amber + #0D9488 teal + 2px #18181B) */
export const MolecularTrophyBadge: React.FC<IconProps> = ({ className = 'w-11 h-11' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
    <polygon
      points="24,6 38,14 38,30 24,38 10,30 10,14"
      fill="#F59E0B"
      stroke="#18181B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <polygon
      points="24,12 33,17 33,27 24,32 15,27 15,17"
      fill="#FFFFFF"
      stroke="#18181B"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="24" cy="22" r="4" fill="#0D9488" stroke="#18181B" strokeWidth="2" />
    <path d="M18 39 H30 L32 43 H16 Z" fill="#EFECE6" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** Custom Illustrated Atomic Orbital Badge */
export const AtomicOrbitalBadge: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
    <ellipse cx="24" cy="24" rx="18" ry="7.5" transform="rotate(30 24 24)" stroke="#18181B" strokeWidth="2" />
    <ellipse cx="24" cy="24" rx="18" ry="7.5" transform="rotate(-30 24 24)" stroke="#18181B" strokeWidth="2" />
    <ellipse cx="24" cy="24" rx="18" ry="7.5" transform="rotate(90 24 24)" stroke="#18181B" strokeWidth="2" />
    <circle cx="24" cy="24" r="5" fill="#0D9488" stroke="#18181B" strokeWidth="2" />
    <circle cx="38" cy="16" r="2.6" fill="#F59E0B" stroke="#18181B" strokeWidth="1.8" />
    <circle cx="10" cy="32" r="2.6" fill="#F59E0B" stroke="#18181B" strokeWidth="1.8" />
  </svg>
);

/** Custom Illustrated Steroid Key / Molecule Scaffold Badge */
export const SteroidScaffoldBadge: React.FC<IconProps> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 56 40" className={className} fill="none" aria-hidden="true">
    <polygon points="6,20 13,16 20,20 20,28 13,32 6,28" fill="#EFECE6" stroke="#18181B" strokeWidth="2" />
    <polygon points="20,20 27,16 34,20 34,28 27,32 20,28" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
    <polygon points="27,16 27,8 34,4 41,8 41,16 34,20" fill="#0D9488" stroke="#18181B" strokeWidth="2" />
    <polygon points="41,8 49,6 53,12 49,18 41,16" fill="#F59E0B" stroke="#18181B" strokeWidth="2" />
  </svg>
);
