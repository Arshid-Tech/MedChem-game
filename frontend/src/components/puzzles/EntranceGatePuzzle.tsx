import React, { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, ShieldCheck, AlertTriangle, Sparkles, ArrowLeft } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface Piece {
  id: string;
  label: string;
  chemName: string;
  formula: string;
}

const AVAILABLE_PIECES: Piece[] = [
  {
    id: 'ring_a',
    label: 'حلقه A (سیکلوهگزنون Δ4)',
    chemName: '3-Keto-Δ4 Ring A',
    formula: 'C6H7O',
  },
  {
    id: 'ring_b',
    label: 'حلقه B (سیکلوهگزان C5-C10)',
    chemName: 'Ring B + C19 Methyl',
    formula: 'C6H10',
  },
  {
    id: 'ring_c',
    label: 'حلقه C (سیکلوهگزان C8-C14)',
    chemName: 'Ring C (11β-OH)',
    formula: 'C6H10O',
  },
  {
    id: 'ring_d',
    label: 'حلقه D (سیکلوپنتان)',
    chemName: 'Cyclopentane Ring D',
    formula: 'C5H8',
  },
  {
    id: 'c17_sidechain',
    label: 'زنجیره کتول C17β',
    chemName: '17β-Ketol (-CO-CH2OH)',
    formula: 'C2H3O2',
  },
  {
    id: 'benzene_decoy',
    label: 'حلقه بنزن آروماتیک',
    chemName: 'Aromatic Benzene',
    formula: 'C6H6',
  },
  {
    id: 'indole_decoy',
    label: 'هسته ایندول دوحلقه‌ای',
    chemName: 'Indole Heterocycle',
    formula: 'C8H7N',
  },
];

interface Props {
  isSolved: boolean;
  onSubmit: (answer: string[], elapsedSeconds: number) => Promise<{ correct: boolean; feedback: string }>;
  onNext: () => void;
}

export const EntranceGatePuzzle: React.FC<Props> = ({ isSolved, onSubmit, onNext }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    isSolved ? ['ring_a', 'ring_b', 'ring_c', 'ring_d', 'c17_sidechain'] : []
  );
  const [startTime] = useState<number>(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (isSolved && selectedIds.length === 0) {
      setSelectedIds(['ring_a', 'ring_b', 'ring_c', 'ring_d', 'c17_sidechain']);
    }
  }, [isSolved]);

  const handleDropPiece = (pieceId: string) => {
    if (isSolved || justUnlocked) return;
    if (!selectedIds.includes(pieceId)) {
      setSelectedIds((prev) => [...prev, pieceId]);
      setFeedback(null);
    }
  };

  const handleRemovePiece = (pieceId: string) => {
    if (isSolved || justUnlocked) return;
    setSelectedIds((prev) => prev.filter((id) => id !== pieceId));
    setFeedback(null);
  };

  const handleVerify = async () => {
    if (selectedIds.length === 0 || loading) return;
    setLoading(true);
    setFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    try {
      const res = await onSubmit(selectedIds, elapsed);
      setFeedback({ ok: res.correct, text: res.feedback });
      if (res.correct) {
        setJustUnlocked(true);
        window.setTimeout(() => {
          onNext();
        }, 1200);
      }
    } catch (err: unknown) {
      setFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'خطا در بررسی ساختار. دوباره تلاش کنید.',
      });
    } finally {
      setLoading(false);
    }
  };

  const hasRingA = selectedIds.includes('ring_a');
  const hasRingB = selectedIds.includes('ring_b');
  const hasRingC = selectedIds.includes('ring_c');
  const hasRingD = selectedIds.includes('ring_d');
  const hasC17 = selectedIds.includes('c17_sidechain');
  const hasBenzene = selectedIds.includes('benzene_decoy');
  const hasIndole = selectedIds.includes('indole_decoy');

  const unlocked = isSolved || justUnlocked;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-base sm:text-lg mb-2">
          <ShieldCheck className="w-6 h-6 shrink-0" />
          <span>مرحله ورود: گیت بیومتریک بخش R&D شرکت Apex Pharma</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-7">
          دکتر ارول پیش از خروج، قفل بیومتریک آزمایشگاه مرکزی را روی حالت سنتز مولکولی تنظیم کرده است.
          برای اثبات هویت خود به عنوان <strong>متخصص ارشد شیمی دارویی</strong>، قطعات صحیح را انتخاب یا به
          درون راکتور بکشید (Drag & Drop) تا اسکلت پایه استروئیدی (<strong>سیکلوپنتانوپرهیدروفنانترن</strong> همراه با زنجیره کتول C17) ساخته شود.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* بانک قطعات مولکولی */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 p-4 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span>بانک قطعات ساختاری (بکشید یا کلیک کنید)</span>
            <span className="text-xs text-cyan-700 dark:text-cyan-400">
              {toPersianDigits(selectedIds.length)} قطعه انتخاب شده
            </span>
          </h3>

          <div className="space-y-2">
            {AVAILABLE_PIECES.map((piece) => {
              const active = selectedIds.includes(piece.id);
              return (
                <div
                  key={piece.id}
                  draggable={!unlocked && !active}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', piece.id)}
                  onClick={() => (active ? handleRemovePiece(piece.id) : handleDropPiece(piece.id))}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition cursor-pointer ${
                    active
                      ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-slate-400 dark:hover:border-slate-500 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{piece.label}</div>
                    <div dir="ltr" className="text-xs text-slate-500 dark:text-slate-400 font-mono text-right">
                      {piece.chemName} ({piece.formula})
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md shrink-0 ${
                      active
                        ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {active ? 'در راکتور ✓' : '+ افزودن'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* راکتور سنتز و پیش‌نمایش زنده SVG */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            if (id) handleDropPiece(id);
          }}
          className="lg:col-span-7 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-100/80 dark:bg-[#07111f] p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              محفظه سنتز مولکولی راکتور (Drop Zone)
            </span>
            {!unlocked && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedIds([]);
                  setFeedback(null);
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                پاکسازی راکتور
              </button>
            )}
          </div>

          <div
            dir="ltr"
            className="my-2 flex items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800 min-h-[230px]"
          >
            {selectedIds.length === 0 ? (
              <div dir="rtl" className="text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">محفظه راکتور خالی است</p>
                <p>قطعات ساختاری مورد نظر را از ستون کناری انتخاب کنید تا ساختار در اینجا رسم شود.</p>
              </div>
            ) : (
              <svg viewBox="0 0 380 225" className="w-full max-w-[400px] h-56">
                {/* حلقه A */}
                {hasRingA && (
                  <g>
                    <polygon
                      points="48,118 82,98 116,118 116,156 82,176 48,156"
                      fill="rgba(6,182,212,0.14)"
                      stroke="#22d3ee"
                      strokeWidth="2.4"
                    />
                    <line x1="84" y1="169" x2="110" y2="154" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="28" y1="166" x2="48" y2="156" stroke="#f87171" strokeWidth="2.4" />
                    <line x1="31" y1="171" x2="51" y2="161" stroke="#f87171" strokeWidth="2.4" />
                    <text x="14" y="175" fill="#f87171" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      O
                    </text>
                    <text x="77" y="141" fill="#22d3ee" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      A
                    </text>
                  </g>
                )}

                {/* حلقه B */}
                {hasRingB && (
                  <g>
                    <polygon
                      points="116,118 150,98 184,118 184,156 150,176 116,156"
                      fill="rgba(16,185,129,0.14)"
                      stroke="#34d399"
                      strokeWidth="2.4"
                    />
                    <polygon points="116,118 112,88 120,88" fill="#34d399" />
                    <text x="106" y="83" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      CH3
                    </text>
                    <text x="145" y="141" fill="#34d399" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      B
                    </text>
                  </g>
                )}

                {/* حلقه C */}
                {hasRingC && (
                  <g>
                    <polygon
                      points="150,98 184,78 218,98 218,136 184,156 184,118"
                      fill="rgba(56,189,248,0.14)"
                      stroke="#38bdf8"
                      strokeWidth="2.4"
                    />
                    <polygon points="184,78 168,54 175,51" fill="#38bdf8" />
                    <text x="152" y="48" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      HO
                    </text>
                    <text x="179" y="121" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      C
                    </text>
                  </g>
                )}

                {/* حلقه D */}
                {hasRingD && (
                  <g>
                    <polygon
                      points="218,98 255,109 264,142 240,160 218,136"
                      fill="rgba(192,132,252,0.15)"
                      stroke="#c084fc"
                      strokeWidth="2.4"
                    />
                    <polygon points="218,98 214,68 222,68" fill="#c084fc" />
                    <text x="208" y="63" fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      CH3
                    </text>
                    <text x="235" y="133" fill="#c084fc" fontSize="13" fontWeight="bold" fontFamily="monospace">
                      D
                    </text>
                  </g>
                )}

                {/* زنجیره جانبی C17 */}
                {hasC17 && (
                  <g>
                    <polygon points="255,109 282,91 286,97" fill="#fbbf24" />
                    <text x="284" y="88" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      CO-CH2OH
                    </text>
                  </g>
                )}

                {/* حلقه بنزن آروماتیک (در صورت انتخاب توسط کاربر رسم می‌شود) */}
                {hasBenzene && (
                  <g transform="translate(268, 152)">
                    <polygon
                      points="24,0 45,12 45,36 24,48 3,36 3,12"
                      fill="rgba(251,146,60,0.15)"
                      stroke="#fb923c"
                      strokeWidth="2.2"
                    />
                    <circle cx="24" cy="24" r="12" fill="none" stroke="#fb923c" strokeWidth="1.8" />
                    <text x="50" y="28" fill="#fb923c" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      C6H6
                    </text>
                  </g>
                )}

                {/* هسته ایندول دوحلقه‌ای (در صورت انتخاب توسط کاربر رسم می‌شود) */}
                {hasIndole && (
                  <g transform="translate(18, 14)">
                    <polygon
                      points="22,0 42,12 42,35 22,47 2,35 2,12"
                      fill="rgba(244,114,182,0.15)"
                      stroke="#f472b6"
                      strokeWidth="2"
                    />
                    <line x1="8" y1="15" x2="22" y2="7" stroke="#f472b6" strokeWidth="1.6" />
                    <line x1="8" y1="32" x2="22" y2="40" stroke="#f472b6" strokeWidth="1.6" />
                    <polyline
                      points="42,12 64,17 70,32 56,43 42,35"
                      fill="rgba(244,114,182,0.12)"
                      stroke="#f472b6"
                      strokeWidth="2"
                    />
                    <text x="69" y="45" fill="#f472b6" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      NH (Indole)
                    </text>
                  </g>
                )}
              </svg>
            )}
          </div>

          {feedback && (
            <div
              role="status"
              className={`mt-3 rounded-xl border p-3 text-sm flex items-start gap-2 ${
                feedback.ok
                  ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {unlocked ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 text-sm transition shadow-md flex items-center gap-2"
              >
                <span>ورود به نقشه دپارتمان‌های R&D</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || selectedIds.length === 0}
                onClick={handleVerify}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 text-sm transition shadow-md"
              >
                {loading ? 'در حال بررسی ساختار...' : 'تایید سنتز و باز کردن گیت'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
