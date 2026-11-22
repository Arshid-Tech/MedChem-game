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
 * رندر استاندارد SVG از هسته استروئیدی (A, B, C, D) با هندسه دقیق IUPAC
 * و نمایش صحیح استریوشیمی (گوه توپر β و خط‌چین α).
 *
 * مختصات رئوس کلیدی:
 * Ring A: C1(91,95) C2(58,114) C3(58,152) C4(91,171) C5(124,152) C10(124,114)
 * Ring B: C5(124,152) C6(157,171) C7(190,152) C8(190,114) C9(157,95) C10(124,114)
 * Ring C: C8(190,114) C9(157,95) C11(157,57) C12(190,38) C13(223,57) C14(223,95)
 * Ring D: C13(223,57) C17(259,46) C16(281,76) C15(259,106) C14(223,95)
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
      className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-900 dark:bg-[#081220] p-3 select-none"
    >
      <svg
        viewBox="0 0 345 215"
        className={compact ? 'w-56 h-36' : 'w-full max-w-[330px] h-48'}
        role="img"
        aria-label={name || 'ساختار شیمیایی استروئید'}
      >
        {/* پیوند دوگانه C3=O متصل به C3(58,152) */}
        <line x1="36" y1="162" x2="57" y2="150" stroke="#f87171" strokeWidth="2.2" />
        <line x1="39" y1="167" x2="60" y2="155" stroke="#f87171" strokeWidth="2.2" />
        <text x="19" y="172" fill="#f87171" fontSize="13" fontWeight="bold" fontFamily="monospace">
          O
        </text>

        {/* حلقه A */}
        <polygon
          points="58,114 91,95 124,114 124,152 91,171 58,152"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />
        {/* پیوند دوگانه C4=C5 (Δ4) */}
        <line x1="92" y1="164" x2="118" y2="149" stroke="#38bdf8" strokeWidth="2" />
        {/* پیوند دوگانه اختیاری C1=C2 (Δ1) */}
        {hasDelta1 && (
          <line x1="64" y1="118" x2="90" y2="103" stroke="#34d399" strokeWidth="2.2" />
        )}

        {/* متیل زاویه‌ای C19 روی C10(124,114) (گوه بتا) */}
        <polygon points="124,114 120,84 128,84" fill="#e2e8f0" />
        <text x="114" y="79" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
          CH3
        </text>

        {/* حلقه B */}
        <polygon
          points="124,114 157,95 190,114 190,152 157,171 124,152"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* استخلاف C6α متصل به C6(157,171) */}
        {c6AlphaSub !== 'none' && (
          <>
            <line
              x1="157"
              y1="171"
              x2="157"
              y2="194"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text x="149" y="207" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {c6AlphaSub}
            </text>
          </>
        )}

        {/* فلوئور 9α متصل دقیقاً به C9(157,95) (خط‌چین آلفا) */}
        {has9AlphaF && (
          <>
            <line
              x1="157"
              y1="95"
              x2="157"
              y2="124"
              stroke="#22d3ee"
              strokeWidth="2.4"
              strokeDasharray="3,2"
            />
            <text x="153" y="138" fill="#22d3ee" fontSize="13" fontWeight="bold" fontFamily="monospace">
              F
            </text>
          </>
        )}

        {/* حلقه C (شش‌ضلعی منتظم متصل به ضلع C9-C8) */}
        <polygon
          points="157,95 157,57 190,38 223,57 223,95 190,114"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* گروه 11β-OH یا 11=O متصل به C11(157,57) */}
        {has11BetaOH && !has11Keto && (
          <>
            <polygon points="157,57 137,43 142,37" fill="#34d399" />
            <text x="118" y="38" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">
              HO
            </text>
          </>
        )}
        {has11Keto && (
          <>
            <line x1="157" y1="54" x2="138" y2="41" stroke="#f87171" strokeWidth="2" />
            <line x1="154" y1="59" x2="135" y2="46" stroke="#f87171" strokeWidth="2" />
            <text x="122" y="42" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">
              O
            </text>
          </>
        )}

        {/* متیل زاویه‌ای C18 روی C13(223,57) (گوه بتا) */}
        <polygon points="223,57 219,29 227,29" fill="#e2e8f0" />
        <text x="213" y="23" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">
          CH3
        </text>

        {/* حلقه پنج‌ضلعی منتظم D متصل به ضلع C13-C14 */}
        <polygon
          points="223,57 259,46 281,76 259,106 223,95"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2.2"
        />

        {/* زنجیره جانبی C17β (-CO-CH2OH) متصل به C17(259,46) */}
        <polygon points="259,46 284,29 288,35" fill="#38bdf8" />
        <line x1="285" y1="32" x2="285" y2="14" stroke="#f87171" strokeWidth="1.8" />
        <line x1="289" y1="32" x2="289" y2="14" stroke="#f87171" strokeWidth="1.8" />
        <text x="282" y="12" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">
          O
        </text>
        <line x1="286" y1="32" x2="307" y2="41" stroke="#cbd5e1" strokeWidth="2" />
        <text x="299" y="53" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
          CH2OH
        </text>

        {/* گروه 17α-OH متصل به C17(259,46) */}
        {c17AlphaOH && (
          <>
            <line
              x1="259"
              y1="46"
              x2="283"
              y2="59"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="3,2"
            />
            <text x="286" y="65" fill="#34d399" fontSize="10.5" fontWeight="bold" fontFamily="monospace">
              OH
            </text>
          </>
        )}

        {/* استخلاف C16 متصل به C16(281,76) */}
        {c16Sub !== 'none' && (
          <>
            <line
              x1="281"
              y1="76"
              x2="305"
              y2="87"
              stroke={c16Sub.startsWith('beta') ? '#c084fc' : '#fbbf24'}
              strokeWidth={c16Sub.startsWith('beta') ? '3' : '2'}
              strokeDasharray={c16Sub.startsWith('alpha') ? '3,2' : undefined}
            />
            <text
              x="308"
              y="93"
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
