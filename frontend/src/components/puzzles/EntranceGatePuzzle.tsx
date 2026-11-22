import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Move,
  Trash2,
} from 'lucide-react';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { deterministicShuffle } from '../../utils/shuffle';
import { toPersianDigits } from '../../utils/persian';

interface PieceSpec {
  id: string;
  label: string;
  targetX: number;
  targetY: number;
  color: string;
}

interface PlacedPiece {
  id: string;
  x: number;
  y: number;
  snapped: boolean;
}

const PIECE_SPECS: PieceSpec[] = [
  { id: 'ring_a', label: 'حلقه ۶ضلعی با =O', targetX: 90, targetY: 145, color: '#22d3ee' },
  { id: 'ring_b', label: 'حلقه ۶ضلعی با CH3', targetX: 158, targetY: 145, color: '#34d399' },
  { id: 'ring_c', label: 'حلقه ۶ضلعی با OH', targetX: 192, targetY: 88, color: '#38bdf8' },
  { id: 'ring_d', label: 'حلقه ۵ضلعی با CH3', targetX: 256, targetY: 88, color: '#c084fc' },
  { id: 'c17_sidechain', label: 'زنجیره -CO-CH2OH', targetX: 306, targetY: 50, color: '#fbbf24' },
  { id: 'benzene_decoy', label: 'حلقه بنزن آروماتیک', targetX: 0, targetY: 0, color: '#fb923c' },
  { id: 'indole_decoy', label: 'حلقه دوگانه نیتروژن‌دار', targetX: 0, targetY: 0, color: '#f472b6' },
];

const SNAP_RADIUS = 34;

interface Props {
  isSolved: boolean;
  onSubmit: (answer: string[], elapsedSeconds: number) => Promise<{ correct: boolean; feedback: string }>;
  onNext: () => void;
}

function renderPieceGraphic(id: string) {
  switch (id) {
    case 'ring_a':
      return (
        <g>
          <polygon points="-34,-19 0,-38 34,-19 34,19 0,38 -34,19" fill="rgba(6,182,212,0.16)" stroke="#22d3ee" strokeWidth="2.4" />
          <line x1="2" y1="31" x2="28" y2="16" stroke="#38bdf8" strokeWidth="2" />
          <line x1="-54" y1="29" x2="-34" y2="19" stroke="#f87171" strokeWidth="2.4" />
          <line x1="-51" y1="34" x2="-31" y2="24" stroke="#f87171" strokeWidth="2.4" />
          <text x="-68" y="38" fill="#f87171" fontSize="13" fontWeight="bold" fontFamily="monospace">O</text>
        </g>
      );
    case 'ring_b':
      return (
        <g>
          <polygon points="-34,-19 0,-38 34,-19 34,19 0,38 -34,19" fill="rgba(16,185,129,0.16)" stroke="#34d399" strokeWidth="2.4" />
          <polygon points="-34,-19 -38,-48 -30,-48" fill="#34d399" />
          <text x="-45" y="-53" fill="#34d399" fontSize="10.5" fontWeight="bold" fontFamily="monospace">CH3</text>
        </g>
      );
    case 'ring_c':
      return (
        <g>
          <polygon points="-34,19 -34,-19 0,-38 34,-19 34,19 0,38" fill="rgba(56,189,248,0.16)" stroke="#38bdf8" strokeWidth="2.4" />
          <polygon points="-34,-19 -54,-34 -49,-40" fill="#38bdf8" />
          <text x="-74" y="-39" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">HO</text>
        </g>
      );
    case 'ring_d':
      return (
        <g>
          <polygon points="-30,-19 6,-30 28,0 6,30 -30,19" fill="rgba(192,132,252,0.16)" stroke="#c084fc" strokeWidth="2.4" />
          <polygon points="-30,-19 -34,-47 -26,-47" fill="#c084fc" />
          <text x="-40" y="-53" fill="#c084fc" fontSize="10.5" fontWeight="bold" fontFamily="monospace">CH3</text>
        </g>
      );
    case 'c17_sidechain':
      return (
        <g>
          <polygon points="-44,8 -18,-9 -14,-3" fill="#fbbf24" />
          <text x="-12" y="-4" fill="#fbbf24" fontSize="11.5" fontWeight="bold" fontFamily="monospace">CO-CH2OH</text>
        </g>
      );
    case 'benzene_decoy':
      return (
        <g>
          <polygon points="-24,-14 0,-28 24,-14 24,14 0,28 -24,14" fill="rgba(251,146,60,0.16)" stroke="#fb923c" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="13" fill="none" stroke="#fb923c" strokeWidth="1.8" />
        </g>
      );
    case 'indole_decoy':
      return (
        <g>
          <polygon points="-30,-12 -10,-24 10,-12 10,12 -10,24 -30,12" fill="rgba(244,114,182,0.16)" stroke="#f472b6" strokeWidth="2" />
          <polyline points="10,-12 32,-7 38,8 24,19 10,12" fill="rgba(244,114,182,0.12)" stroke="#f472b6" strokeWidth="2" />
          <text x="37" y="21" fill="#f472b6" fontSize="10" fontWeight="bold" fontFamily="monospace">NH</text>
        </g>
      );
    default:
      return null;
  }
}

export const EntranceGatePuzzle: React.FC<Props> = ({ isSolved, onSubmit, onNext }) => {
  const [placed, setPlaced] = useState<PlacedPiece[]>(() =>
    isSolved
      ? PIECE_SPECS.filter((p) => p.targetX > 0).map((p) => ({
          id: p.id,
          x: p.targetX,
          y: p.targetY,
          snapped: true,
        }))
      : []
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gateTimer = usePuzzleTimer(true, isSolved);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);

  const shuffledSpecs = useMemo(() => deterministicShuffle(PIECE_SPECS, 'entrance-pieces-v3'), []);

  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current !== null) {
        window.clearTimeout(autoAdvanceRef.current);
      }
    };
  }, []);

  const isLocked = (isSolved || justUnlocked) && !practiceMode;

  const addPieceToCanvas = (pieceId: string) => {
    if (isLocked) return;
    if (placed.some((p) => p.id === pieceId)) return;
    // قرار دادن قطعه در موقعیت آزاد و قابل جابه‌جایی روی بوم
    const offset = (placed.length % 4) * 32;
    setPlaced((prev) => [
      ...prev,
      { id: pieceId, x: 140 + offset, y: 120 + (placed.length % 2) * 35, snapped: false },
    ]);
    setFeedback(null);
  };

  const removePiece = (pieceId: string) => {
    if (isLocked) return;
    setPlaced((prev) => prev.filter((p) => p.id !== pieceId));
    setFeedback(null);
  };

  const getSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 200, y: 120 };
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 420;
    const y = ((clientY - rect.top) / rect.height) * 240;
    return {
      x: Math.max(36, Math.min(385, x)),
      y: Math.max(36, Math.min(205, y)),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId || isLocked) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    const spec = PIECE_SPECS.find((p) => p.id === draggingId);
    let finalX = x;
    let finalY = y;
    let snapped = false;

    if (spec && spec.targetX > 0) {
      const dist = Math.hypot(x - spec.targetX, y - spec.targetY);
      if (dist <= SNAP_RADIUS) {
        finalX = spec.targetX;
        finalY = spec.targetY;
        snapped = true;
      }
    }

    setPlaced((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, x: finalX, y: finalY, snapped } : p))
    );
  };

  const handleVerify = async () => {
    if (placed.length === 0 || loading) return;
    const coreIds = ['ring_a', 'ring_b', 'ring_c', 'ring_d', 'c17_sidechain'];
    const hasAllCore = coreIds.every((id) => placed.some((p) => p.id === id));
    const allSnapped = placed
      .filter((p) => coreIds.includes(p.id))
      .every((p) => p.snapped);

    if (hasAllCore && !allSnapped) {
      setFeedback({
        ok: false,
        text: 'قطعات درست را آورده‌ای، اما هنوز دقیق به هم وصل نشده‌اند! هر قطعه را روی بوم بکش و کنار هم بچین تا به جای درستش قفل (Snap) شود.',
      });
      return;
    }

    setLoading(true);
    setFeedback(null);
    const elapsed = gateTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmit(
        placed.map((p) => p.id),
        elapsed
      );
      setFeedback({ ok: res.correct, text: res.feedback });
      if (res.correct && !isSolved) {
        setJustUnlocked(true);
        autoAdvanceRef.current = window.setTimeout(() => {
          onNext();
        }, 1400);
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

  const unlocked = isSolved || justUnlocked;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-base sm:text-lg mb-1">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <span>ورودی کارخانه مولکول دکتر ارول</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-7">
            اینجا درِ کارخونه‌ست! برای ورود، قطعات درست رو وارد بوم کن و <strong>آزادانه کنار هم بچین</strong> تا یه اسکلت استروئید کامل بسازی و به عنوان کلید ورود ازش استفاده کنی.
          </p>
        </div>
        {unlocked && (
          <button
            type="button"
            onClick={() => {
              setPracticeMode((p) => !p);
              if (!practiceMode) {
                setPlaced([]);
                setFeedback(null);
              }
            }}
            className="self-start sm:self-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 whitespace-nowrap"
          >
            {practiceMode ? 'خروج از تمرین مجدد' : 'تمرین دوباره چیدمان'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* پالت قطعات تصویری (با ترتیب تصادفی) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              قطعات موجود (کلیک کن تا وارد بوم شود)
            </h3>
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
              {toPersianDigits(placed.length)} قطعه روی بوم
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {shuffledSpecs.map((spec) => {
              const onCanvas = placed.some((p) => p.id === spec.id);
              return (
                <div
                  key={spec.id}
                  onClick={() => (onCanvas ? removePiece(spec.id) : addPieceToCanvas(spec.id))}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition cursor-pointer ${
                    onCanvas
                      ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-cyan-400 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg viewBox="-75 -65 130 115" className="w-12 h-10 shrink-0 bg-slate-950 rounded-lg p-0.5">
                      {renderPieceGraphic(spec.id)}
                    </svg>
                    <span className="font-semibold">{spec.label}</span>
                  </div>
                  <span className="text-[11px] font-bold shrink-0">
                    {onCanvas ? <Trash2 className="w-3.5 h-3.5 text-rose-500" /> : '+ افزودن'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* بوم آزاد چیدمان قطعات با ماوس و لمس */}
        <div className="lg:col-span-8 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-white dark:bg-[#07111f] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Move className="w-4 h-4" />
              بوم ساخت کلید استروئیدی (قطعات را آزادانه بکش و کنار هم بچین)
            </span>
            {!isLocked && placed.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setPlaced([]);
                  setFeedback(null);
                }}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                پاکسازی بوم
              </button>
            )}
          </div>

          <div
            dir="ltr"
            className="my-2 flex items-center justify-center bg-slate-950 rounded-xl p-2 border border-slate-800 min-h-[260px] touch-none select-none"
          >
            <svg
              ref={svgRef}
              viewBox="0 0 420 240"
              className="w-full h-64 sm:h-72"
              onPointerMove={handlePointerMove}
              onPointerUp={() => setDraggingId(null)}
              onPointerLeave={() => setDraggingId(null)}
            >
              {/* شبکه راهنمای ملایم آزمایشگاهی */}
              <defs>
                <pattern id="canvasGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="420" height="240" fill="url(#canvasGrid)" />

              {/* سایه خیلی کمرنگ جایگاه کلید در قفل در (بدون لو دادن قطعه) */}
              <circle cx="90" cy="145" r="4" fill="rgba(148,163,184,0.22)" />
              <circle cx="158" cy="145" r="4" fill="rgba(148,163,184,0.22)" />
              <circle cx="192" cy="88" r="4" fill="rgba(148,163,184,0.22)" />
              <circle cx="256" cy="88" r="4" fill="rgba(148,163,184,0.22)" />
              <circle cx="306" cy="50" r="4" fill="rgba(148,163,184,0.22)" />

              {placed.length === 0 && (
                <text x="210" y="125" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="Vazirmatn, sans-serif">
                  قطعات را از ستون کناری اضافه کن و اینجا کنار هم بچین
                </text>
              )}

              {placed.map((p) => (
                <g
                  key={p.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  onPointerDown={(e) => {
                    if (isLocked) return;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    setDraggingId(p.id);
                  }}
                  className={isLocked ? '' : 'cursor-grab active:cursor-grabbing'}
                >
                  {p.snapped && (
                    <circle cx="0" cy="0" r="40" fill="none" stroke="rgba(52,211,153,0.35)" strokeWidth="1.5" strokeDasharray="4,3" />
                  )}
                  {renderPieceGraphic(p.id)}
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-2">
            <ProgressiveHintBox
              solved={unlocked && !practiceMode}
              hints={[
                'اسکلت استروئید از سه حلقه شش‌ضلعی (A، B، C) و یک حلقه پنج‌ضلعی (D) تشکیل شده که به شکل پله‌ای به هم متصل‌اند.',
                'حلقه A (با =O) پایین-چپ، حلقه B کنارش، حلقه C کمی بالاتر، حلقه ۵ضلعی D کنار C و زنجیره کتول در بالا-راست قرار می‌گیرد. قطعات بنزن و دوحلقه‌ای اضافی هستند.',
              ]}
            />
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
            {unlocked && !practiceMode ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 text-sm transition shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>ورود به راهروی اتاق‌های کارخانه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || placed.length === 0}
                onClick={handleVerify}
                className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 text-sm transition shadow-md"
              >
                {loading ? 'در حال بررسی کلید...' : 'تایید ساختار و باز کردن در کارخانه'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
