import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { SteroidMoleculeSVG } from '../molecules/SteroidMoleculeSVG';

interface Piece {
  id: string;
  label: string;
  chemName: string;
  formula: string;
  isValid: boolean;
}

const AVAILABLE_PIECES: Piece[] = [
  {
    id: 'ring_a',
    label: 'حلقه الف (سیکلوهگزنون Δ۴)',
    chemName: '3-Keto-Δ4 Ring A',
    formula: 'C6H7O',
    isValid: true,
  },
  {
    id: 'ring_b',
    label: 'حلقه ب (سیکلوهگزان C5-C10)',
    chemName: 'Ring B + C19 Methyl',
    formula: 'C6H10',
    isValid: true,
  },
  {
    id: 'ring_c',
    label: 'حلقه ج (سیکلوهگزان C8-C14)',
    chemName: 'Ring C (11β-OH)',
    formula: 'C6H10O',
    isValid: true,
  },
  {
    id: 'ring_d',
    label: 'حلقه د (سیکلوپنتان)',
    chemName: 'Cyclopentane Ring D',
    formula: 'C5H8',
    isValid: true,
  },
  {
    id: 'c17_sidechain',
    label: 'زنجیره کتول C17β',
    chemName: '17β-Ketol (-CO-CH2OH)',
    formula: 'C2H3O2',
    isValid: true,
  },
  {
    id: 'benzene_decoy',
    label: 'حلقه بنزن آروماتیک (فریبنده)',
    chemName: 'Aromatic Benzene',
    formula: 'C6H6',
    isValid: false,
  },
  {
    id: 'indole_decoy',
    label: 'هسته ایندول (فریبنده)',
    chemName: 'Indole Heterocycle',
    formula: 'C8H7N',
    isValid: false,
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

  const handleDropPiece = (pieceId: string) => {
    if (isSolved) return;
    if (!selectedIds.includes(pieceId)) {
      setSelectedIds((prev) => [...prev, pieceId]);
    }
  };

  const handleRemovePiece = (pieceId: string) => {
    if (isSolved) return;
    setSelectedIds((prev) => prev.filter((id) => id !== pieceId));
  };

  const handleVerify = async () => {
    setLoading(true);
    setFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    try {
      const res = await onSubmit(selectedIds, elapsed);
      setFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setFeedback({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const hasRingA = selectedIds.includes('ring_a');
  const hasRingB = selectedIds.includes('ring_b');
  const hasRingC = selectedIds.includes('ring_c');
  const hasRingD = selectedIds.includes('ring_d');
  const hasC17 = selectedIds.includes('c17_sidechain');

  // بررسی خودکار زمانی که ۵ قطعه صحیح کامل انتخاب شوند
  const isCompleteMatch =
    selectedIds.length === 5 &&
    selectedIds.includes('ring_a') &&
    selectedIds.includes('ring_b') &&
    selectedIds.includes('ring_c') &&
    selectedIds.includes('ring_d') &&
    selectedIds.includes('c17_sidechain');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg mb-2">
          <ShieldCheck className="w-6 h-6" />
          <span>مرحله ورود: گیت بیومتریک بخش R&D شرکت Apex Pharma</span>
        </div>
        <p className="text-slate-300 text-sm leading-7">
          دکتر ارول پیش از خروج، قفل بیومتریک آزمایشگاه مرکزی را روی حالت سنتز مولکولی تنظیم کرده است.
          برای اثبات هویت خود به عنوان <strong>متخصص ارشد شیمی دارویی</strong>، ۵ قطعه صحیح را انتخاب یا به
          درون راکتور بکشید تا اسکلت پایه استروئیدی تکمیل شده و گیت به‌صورت خودکار باز شود.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* بانک قطعات مولکولی */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>بانک قطعات ساختاری (کلیک یا Drag)</span>
            <span className="text-xs text-cyan-400 font-mono">{selectedIds.length} / ۵ قطعه</span>
          </h3>

          <div className="space-y-2">
            {AVAILABLE_PIECES.map((piece) => {
              const active = selectedIds.includes(piece.id);
              return (
                <div
                  key={piece.id}
                  draggable={!isSolved && !active}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', piece.id)}
                  onClick={() => (active ? handleRemovePiece(piece.id) : handleDropPiece(piece.id))}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition cursor-pointer ${
                    active
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-700 bg-slate-800/70 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs sm:text-sm">{piece.label}</div>
                    <div dir="ltr" className="text-[11px] text-slate-400 font-mono text-right">
                      {piece.chemName} ({piece.formula})
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md shrink-0 ${
                      active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-300'
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
          className="lg:col-span-7 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-[#07111f] p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              محفظه سنتز اسکلت پایه استروئید (Drop Zone)
            </span>
            {!isSolved && selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                پاکسازی راکتور
              </button>
            )}
          </div>

          <div dir="ltr" className="my-2 flex items-center justify-center bg-slate-950/80 rounded-xl p-4 border border-slate-800">
            <svg viewBox="0 0 330 200" className="w-full max-w-[340px] h-52">
              <polygon points="55,110 89,90 123,110 123,148 89,168 55,148" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4,4" />
              <polygon points="123,110 157,90 191,110 191,148 157,168 123,148" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4,4" />
              <polygon points="157,90 191,70 225,90 225,128 191,148 191,110" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4,4" />
              <polygon points="225,90 262,101 271,134 247,152 225,128" fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4,4" />

              {hasRingA && (
                <g>
                  <polygon points="55,110 89,90 123,110 123,148 89,168 55,148" fill="rgba(6,182,212,0.12)" stroke="#22d3ee" strokeWidth="2.5" />
                  <line x1="35" y1="158" x2="55" y2="148" stroke="#f87171" strokeWidth="2.5" />
                  <text x="20" y="166" fill="#f87171" fontSize="13" fontWeight="bold">O</text>
                  <text x="83" y="133" fill="#22d3ee" fontSize="13" fontWeight="bold">الف</text>
                </g>
              )}

              {hasRingB && (
                <g>
                  <polygon points="123,110 157,90 191,110 191,148 157,168 123,148" fill="rgba(16,185,129,0.12)" stroke="#34d399" strokeWidth="2.5" />
                  <line x1="123" y1="110" x2="123" y2="82" stroke="#34d399" strokeWidth="2.5" />
                  <text x="114" y="77" fill="#34d399" fontSize="11">CH3</text>
                  <text x="151" y="133" fill="#34d399" fontSize="13" fontWeight="bold">ب</text>
                </g>
              )}

              {hasRingC && (
                <g>
                  <polygon points="157,90 191,70 225,90 225,128 191,148 191,110" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="191" y1="70" x2="177" y2="48" stroke="#38bdf8" strokeWidth="2.2" />
                  <text x="160" y="44" fill="#38bdf8" fontSize="11">HO</text>
                  <text x="186" y="113" fill="#38bdf8" fontSize="13" fontWeight="bold">ج</text>
                </g>
              )}

              {hasRingD && (
                <g>
                  <polygon points="225,90 262,101 271,134 247,152 225,128" fill="rgba(192,132,252,0.14)" stroke="#c084fc" strokeWidth="2.5" />
                  <text x="242" y="125" fill="#c084fc" fontSize="13" fontWeight="bold">د</text>
                </g>
              )}

              {hasC17 && (
                <g>
                  <line x1="262" y1="101" x2="288" y2="83" stroke="#fbbf24" strokeWidth="2.5" />
                  <text x="285" y="78" fill="#fbbf24" fontSize="11" fontWeight="bold">CO-CH2OH</text>
                </g>
              )}

              {(selectedIds.includes('benzene_decoy') || selectedIds.includes('indole_decoy')) && (
                <text x="60" y="30" fill="#f43f5e" fontSize="11" fontWeight="bold">
                  ! هشدار: ناخالصی در راکتور !
                </text>
              )}
            </svg>
          </div>

          {feedback && (
            <div
              className={`mt-3 rounded-xl border p-3 text-sm flex items-start gap-2 ${
                feedback.ok
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
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

          <div className="mt-4 flex items-center justify-end gap-3">
            {isSolved ? (
              <button
                onClick={onNext}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
              >
                ورود به نقشه دپارتمان‌های R&D ←
              </button>
            ) : (
              <button
                disabled={loading || selectedIds.length === 0}
                onClick={handleVerify}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 text-sm transition shadow-lg"
              >
                {loading ? 'در حال بررسی ساختار...' : isCompleteMatch ? 'تایید و باز کردن گیت (ارسال نهایی)' : 'بررسی ساختار انتخاب‌شده'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
