import React from 'react';

export interface SteroidRenderProps {
  name?: string;
  formulaNote?: string;
  hasDelta1?: boolean;
  has9AlphaF?: boolean;
  has11BetaOH?: boolean;
  has11Keto?: boolean;
  c16Sub?: 'none' | 'alpha-OH' | 'alpha-CH3' | 'beta-CH3';
  c6AlphaSub?: 'none' | 'CH3' | 'F';
  c17AlphaOH?: boolean;
  highlightPositions?: string[];
  compact?: boolean;
}

/**
 * High-contrast 2D IUPAC Steroid SVG Renderer for the Tactile Lab Workbook:
 * - Transparent SVG over 20px dot-grid (#D6D3CD)
 * - Carbon bonds: 2px thick in #18181B
 * - Oxygen: #E11D48 | Halogens (F): #0D9488 | Alkyl highlights: #18181B
 */
export const SteroidMoleculeSVG: React.FC<SteroidRenderProps> = ({
  name,
  formulaNote,
  hasDelta1 = false,
  has9AlphaF = false,
  has11BetaOH = true,
  has11Keto = false,
  c16Sub = 'none',
  c6AlphaSub = 'none',
  c17AlphaOH = true,
  compact = false,
}) => {
  return (
    <div
      dir="ltr"
      className="flex flex-col items-center justify-center rounded-[8px] border-2 border-[#18181B] molecule-dot-grid p-3 select-none shadow-[3px_3px_0px_#18181B]"
    >
      <svg
        viewBox="0 0 345 215"
        className={compact ? 'w-56 h-36 bg-transparent' : 'w-full max-w-[330px] h-48 bg-transparent'}
        role="img"
        aria-label={name || 'ساختار شیمیایی استروئید'}
      >
        {/* C3=O */}
        <line x1="36" y1="162" x2="57" y2="150" stroke="#E11D48" strokeWidth="2" />
        <line x1="39" y1="167" x2="60" y2="155" stroke="#E11D48" strokeWidth="2" />
        <text x="19" y="172" fill="#E11D48" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
          O
        </text>

        {/* Ring A */}
        <polygon
          points="58,114 91,95 124,114 124,152 91,171 58,152"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
        />
        {/* Δ4 */}
        <line x1="92" y1="164" x2="118" y2="149" stroke="#18181B" strokeWidth="2" />
        {/* Optional Δ1 */}
        {hasDelta1 && (
          <line x1="64" y1="118" x2="90" y2="103" stroke="#0D9488" strokeWidth="2.2" />
        )}

        {/* C19 Angular Methyl (β wedge) */}
        <polygon points="124,114 120,84 128,84" fill="#18181B" />
        <text x="114" y="79" fill="#18181B" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
          CH3
        </text>

        {/* Ring B */}
        <polygon
          points="124,114 157,95 190,114 190,152 157,171 124,152"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
        />

        {/* C6α Substituent */}
        {c6AlphaSub !== 'none' && (
          <>
            <line
              x1="157"
              y1="171"
              x2="157"
              y2="194"
              stroke={c6AlphaSub === 'F' ? '#0D9488' : '#18181B'}
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text
              x="149"
              y="207"
              fill={c6AlphaSub === 'F' ? '#0D9488' : '#18181B'}
              fontSize="11"
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
            >
              {c6AlphaSub}
            </text>
          </>
        )}

        {/* 9α-F (Halogen -> #0D9488) */}
        {has9AlphaF && (
          <>
            <line
              x1="157"
              y1="95"
              x2="157"
              y2="124"
              stroke="#0D9488"
              strokeWidth="2.2"
              strokeDasharray="3,2"
            />
            <text x="153" y="138" fill="#0D9488" fontSize="13" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              F
            </text>
          </>
        )}

        {/* Ring C */}
        <polygon
          points="157,95 157,57 190,38 223,57 223,95 190,114"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
        />

        {/* 11β-OH or 11=O (Oxygen -> #E11D48) */}
        {has11BetaOH && !has11Keto && (
          <>
            <polygon points="157,57 137,43 142,37" fill="#18181B" />
            <text x="118" y="38" fill="#E11D48" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              HO
            </text>
          </>
        )}
        {has11Keto && (
          <>
            <line x1="157" y1="54" x2="138" y2="41" stroke="#E11D48" strokeWidth="2" />
            <line x1="154" y1="59" x2="135" y2="46" stroke="#E11D48" strokeWidth="2" />
            <text x="122" y="42" fill="#E11D48" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              O
            </text>
          </>
        )}

        {/* C18 Angular Methyl */}
        <polygon points="223,57 219,29 227,29" fill="#18181B" />
        <text x="213" y="23" fill="#18181B" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
          CH3
        </text>

        {/* Ring D */}
        <polygon
          points="223,57 259,46 281,76 259,106 223,95"
          fill="none"
          stroke="#18181B"
          strokeWidth="2"
        />

        {/* C17β Ketol (-CO-CH2OH) */}
        <polygon points="259,46 284,29 288,35" fill="#18181B" />
        <line x1="285" y1="32" x2="285" y2="14" stroke="#E11D48" strokeWidth="1.8" />
        <line x1="289" y1="32" x2="289" y2="14" stroke="#E11D48" strokeWidth="1.8" />
        <text x="282" y="12" fill="#E11D48" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
          O
        </text>
        <line x1="286" y1="32" x2="307" y2="41" stroke="#18181B" strokeWidth="2" />
        <text x="299" y="53" fill="#E11D48" fontSize="10" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
          CH2OH
        </text>

        {/* 17α-OH */}
        {c17AlphaOH && (
          <>
            <line
              x1="259"
              y1="46"
              x2="283"
              y2="59"
              stroke="#18181B"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text x="286" y="65" fill="#E11D48" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              OH
            </text>
          </>
        )}

        {/* C16 Substituent */}
        {c16Sub !== 'none' && (
          <>
            <line
              x1="281"
              y1="76"
              x2="305"
              y2="87"
              stroke="#18181B"
              strokeWidth={c16Sub.startsWith('beta') ? '3' : '2'}
              strokeDasharray={c16Sub.startsWith('alpha') ? '3,2' : undefined}
            />
            <text
              x="308"
              y="93"
              fill={c16Sub.includes('OH') ? '#E11D48' : '#18181B'}
              fontSize="10"
              fontWeight="bold"
              fontFamily="JetBrains Mono, monospace"
            >
              {c16Sub.replace('alpha-', '').replace('beta-', '')}
            </text>
          </>
        )}
      </svg>

      {name && (
        <div dir="rtl" className="mt-2 pt-1.5 w-full border-t border-[#18181B]/20 text-center">
          <div className="text-xs font-extrabold text-[#18181B]">{name}</div>
          {formulaNote && <div className="text-[11px] text-[#52525B]">{formulaNote}</div>}
        </div>
      )}
    </div>
  );
};
