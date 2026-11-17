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
 * رندر دقیق و استاندارد SVG از هسته استروئیدی (A, B, C, D) با نمایش استریوشیمی (گوه توپر β و خط‌چین α)
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
      className="flex flex-col items-center justify-center rounded-xl border border-slate-700/80 bg-[#081220] p-3 select-none"
    >
      <svg
        viewBox="0 0 340 215"
        className={compact ? 'w-56 h-36' : 'w-full max-w-[320px] h-48'}
      >
        <defs>
          <marker id="dot" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4">
            <circle cx="3" cy="3" r="2" fill="#38bdf8" />
          </marker>
        </defs>

        {/* پیوند دوگانه C3=O */}
        <line x1="36" y1="158" x2="56" y2="146" stroke="#f87171" strokeWidth="2.2" />
        <line x1="39" y1="163" x2="59" y2="151" stroke="#f87171" strokeWidth="2.2" />
        <text x="20" y="168" fill="#f87171" fontSize="13" fontWeight="bold" fontFamily="monospace">
          O
        </text>

        {/* حلقه A (C1, C2, C3, C4, C5, C10) */}
        <polygon
          points="58,112 92,92 126,112 126,150 92,170 58,150"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />
        {/* پیوند دوگانه C4=C5 (Δ4) */}
        <line x1="94" y1="163" x2="120" y2="148" stroke="#38bdf8" strokeWidth="2" />
        {/* پیوند دوگانه اختیاری C1=C2 (Δ1 - پردنیزولون و مشتقات قوی‌تر) */}
        {hasDelta1 && (
          <line x1="64" y1="115" x2="90" y2="100" stroke="#34d399" strokeWidth="2.2" />
        )}

        {/* متیل زاویه‌ای C19 روی C10 (گوه بتا) */}
        <polygon points="126,112 122,82 130,82" fill="#e2e8f0" />
        <text x="116" y="77" fill="#94a3b8" fontSize="11" fontFamily="monospace">
          CH3
        </text>

        {/* حلقه B (C5, C10, C9, C8, C7, C6) */}
        <polygon
          points="126,112 160,92 194,112 194,150 160,170 126,150"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* استخلاف C6α */}
        {c6AlphaSub !== 'none' && (
          <>
            <line
              x1="160"
              y1="170"
              x2="160"
              y2="194"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text x="152" y="206" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {c6AlphaSub}
            </text>
          </>
        )}

        {/* فلوئور 9α روی C9 (خط‌چین آلفا) */}
        {has9AlphaF && (
          <>
            <line
              x1="160"
              y1="112"
              x2="160"
              y2="138"
              stroke="#22d3ee"
              strokeWidth="2.4"
              strokeDasharray="3,2"
            />
            <text x="155" y="151" fill="#22d3ee" fontSize="13" fontWeight="bold" fontFamily="monospace">
              F
            </text>
          </>
        )}

        {/* حلقه C (C9, C11, C12, C13, C14, C8) */}
        <polygon
          points="160,92 194,72 228,92 228,130 194,150 194,112"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* گروه 11β-OH یا 11=O */}
        {has11BetaOH && !has11Keto && (
          <>
            <polygon points="194,72 178,48 185,45" fill="#34d399" />
            <text x="163" y="42" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">
              HO
            </text>
          </>
        )}
        {has11Keto && (
          <>
            <line x1="192" y1="72" x2="192" y2="48" stroke="#f87171" strokeWidth="2" />
            <line x1="196" y1="72" x2="196" y2="48" stroke="#f87171" strokeWidth="2" />
            <text x="189" y="43" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
              O
            </text>
          </>
        )}

        {/* متیل زاویه‌ای C18 روی C13 (گوه بتا) */}
        <polygon points="228,92 224,62 232,62" fill="#e2e8f0" />
        <text x="218" y="57" fill="#94a3b8" fontSize="11" fontFamily="monospace">
          CH3
        </text>

        {/* حلقه پنج‌ضلعی D (C13, C14, C15, C16, C17) */}
        <polygon
          points="228,92 265,103 274,136 250,154 228,130"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* زنجیره جانبی C17β (-CO-CH2OH) */}
        <polygon points="265,103 288,83 292,89" fill="#38bdf8" />
        <line x1="290" y1="86" x2="290" y2="65" stroke="#f87171" strokeWidth="1.8" />
        <line x1="294" y1="86" x2="294" y2="65" stroke="#f87171" strokeWidth="1.8" />
        <text x="287" y="60" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">
          O
        </text>
        <line x1="291" y1="86" x2="312" y2="96" stroke="#cbd5e1" strokeWidth="2" />
        <text x="303" y="109" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
          CH2OH
        </text>

        {/* گروه 17α-OH */}
        {c17AlphaOH && (
          <>
            <line
              x1="265"
              y1="103"
              x2="287"
              y2="118"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text x="289" y="125" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
              OH
            </text>
          </>
        )}

        {/* استخلاف C16 */}
        {c16Sub !== 'none' && (
          <>
            <line
              x1="274"
              y1="136"
              x2="298"
              y2="146"
              stroke={c16Sub.startsWith('beta') ? '#c084fc' : '#fbbf24'}
              strokeWidth={c16Sub.startsWith('beta') ? '3' : '2'}
              strokeDasharray={c16Sub.startsWith('alpha') ? '3,2' : undefined}
            />
            <text
              x="301"
              y="152"
              fill={c16Sub.startsWith('beta') ? '#c084fc' : '#fbbf24'}
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {c16Sub.replace('alpha-', '').replace('beta-', '')}
            </text>
          </>
        )}
      </svg>

      {name && (
        <div dir="rtl" className="mt-1 text-center">
          <div className="text-xs font-bold text-cyan-300">{name}</div>
          {formulaNote && <div className="text-[11px] text-slate-400">{formulaNote}</div>}
        </div>
      )}
    </div>
  );
};
