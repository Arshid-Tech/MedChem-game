import React, { useState } from 'react';
import {
  Droplets,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { SteroidMoleculeSVG } from '../molecules/SteroidMoleculeSVG';

interface RouteCompound {
  id: string;
  label: string;
  hint: string;
  props: {
    hasDelta1?: boolean;
    has9AlphaF?: boolean;
    c16Sub?: 'none' | 'alpha-OH' | 'alpha-CH3' | 'beta-CH3';
    c6AlphaSub?: 'none' | 'CH3' | 'F';
  };
}

const ROUTE_COMPOUNDS: RouteCompound[] = [
  { id: '1', label: 'ترکیب ۱ (پردنیزولون سدیم فسفات)', hint: 'استر قطبی محلول در آب (C21-Phosphate)', props: { hasDelta1: true } },
  { id: '2', label: 'ترکیب ۲ (فلوسینولون استونید)', hint: 'دارای حلقه استونید 16α,17α-ketal لیپوفیل', props: { hasDelta1: true, has9AlphaF: true, c6AlphaSub: 'F', c16Sub: 'alpha-OH' } },
  { id: '3', label: 'ترکیب ۳ (فلوتیکازون پروپیونات)', hint: 'کربوتیوآت فلوئورومتيل در C17β (متابولیسم سریع کبدی)', props: { hasDelta1: true, has9AlphaF: true, c6AlphaSub: 'F', c16Sub: 'alpha-CH3' } },
  { id: '4', label: 'ترکیب ۴ (بودزوناید)', hint: 'استال نامتقارن 16α,17α با کلیرانس کبدی بالا', props: { hasDelta1: true, c16Sub: 'alpha-OH' } },
  { id: '5', label: 'ترکیب ۵ (هیدروکورتیزون همی‌سوکسینات)', hint: 'استر قطبی تزریقی/خوراکی با نیمه‌عمر کوتاه', props: {} },
  { id: '6', label: 'ترکیب ۶ (بتامتازون والرات)', hint: 'استر والرات در C17α با نفوذ بالای پوستی', props: { hasDelta1: true, has9AlphaF: true, c16Sub: 'beta-CH3' } },
  { id: '7', label: 'ترکیب ۷ (تریامسینولون استونید)', hint: 'کتال حلقوی C16,C17 با جذب سیستمیک ناچیز', props: { hasDelta1: true, has9AlphaF: true, c16Sub: 'alpha-OH' } },
  { id: '8', label: 'ترکیب ۸ (متیل‌پردنیزولون خوراکی)', hint: 'متیل 6α + گروه هیدروکسیل آزاد C21', props: { hasDelta1: true, c6AlphaSub: 'CH3' } },
  { id: '9', label: 'ترکیب ۹ (مومتازون فوروئات)', hint: 'استر فوروئات C17α و کلر C21 برای افشانه تنفسی', props: { hasDelta1: true, c16Sub: 'alpha-CH3' } },
];

type BucketKey = 'systemic' | 'topical' | 'inhalation';

interface Props {
  arrowsSolved: boolean;
  routesSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

export const MineralocorticoidLab: React.FC<Props> = ({
  arrowsSolved,
  routesSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  // معمای ۱: فلش‌های مقایسه ترکیب ۱ نسبت به ۲
  const [arrows, setArrows] = useState<{
    anti_inflammatory: 'up' | 'down' | '';
    half_life: 'up' | 'down' | '';
    mineralocorticoid: 'up' | 'down' | '';
  }>(
    arrowsSolved
      ? { anti_inflammatory: 'up', half_life: 'up', mineralocorticoid: 'down' }
      : { anti_inflammatory: '', half_life: '', mineralocorticoid: '' }
  );
  const [arrowStart] = useState<number>(() => Date.now());
  const [arrowFeedback, setArrowFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [arrowLoading, setArrowLoading] = useState(false);

  // معمای ۲: دسته‌بندی ۹ ترکیب در ۳ سبد
  const [buckets, setBuckets] = useState<Record<BucketKey, string[]>>(
    routesSolved
      ? { systemic: ['1', '5', '8'], topical: ['2', '6', '7'], inhalation: ['3', '4', '9'] }
      : { systemic: [], topical: [], inhalation: [] }
  );
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [routeStart] = useState<number>(() => Date.now());
  const [routeFeedback, setRouteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const handleArrowSubmit = async () => {
    setArrowLoading(true);
    setArrowFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - arrowStart) / 1000));
    try {
      const res = await onSubmitPuzzle('effect_arrows', arrows, elapsed);
      setArrowFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setArrowFeedback({ ok: false, text: err.message });
    } finally {
      setArrowLoading(false);
    }
  };

  const assignToBucket = (bucket: BucketKey, id: string) => {
    if (routesSolved) return;
    setBuckets((prev) => {
      const cleaned: Record<BucketKey, string[]> = {
        systemic: prev.systemic.filter((x) => x !== id),
        topical: prev.topical.filter((x) => x !== id),
        inhalation: prev.inhalation.filter((x) => x !== id),
      };
      cleaned[bucket] = [...cleaned[bucket], id];
      return cleaned;
    });
    setSelectedChip(null);
  };

  const removeFromBucket = (bucket: BucketKey, id: string) => {
    if (routesSolved) return;
    setBuckets((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((x) => x !== id),
    }));
  };

  const assignedIds = [...buckets.systemic, ...buckets.topical, ...buckets.inhalation];

  const handleRouteSubmit = async () => {
    setRouteLoading(true);
    setRouteFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - routeStart) / 1000));
    try {
      const res = await onSubmitPuzzle('route_classification', buckets, elapsed);
      setRouteFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setRouteFeedback({ ok: false, text: err.message });
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <Droplets className="w-6 h-6" />
            <span>دپارتمان دوم: بخش مینرالوکورتیکوئیدها و فارماکوکینتیک موضعی</span>
          </div>
          <p className="text-slate-300 text-sm mt-1 leading-6">
            یادداشت رمزگشایی‌شده: <em>«اثر احتباس آب و سدیم را به حداقل برسان؛ اهریمن قرار نیست کل بدن را درگیر کند، فقط یک بافت هدف موضعی...»</em>
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-600 hover:border-cyan-400 px-4 py-2 text-xs font-semibold text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: مقایسه ترکیب ۱ و ۲ */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-6 space-y-5">
        <h3 className="font-bold text-base text-slate-100">
          معمای ۱: مقایسه فارماکولوژیک ترکیب ۱ (دارای Δ1 و متیل 6α) نسبت به ترکیب ۲ (کورتیزول)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SteroidMoleculeSVG
            name="ترکیب ۱ (متیل‌پردنیزولون)"
            formulaNote="دارای پیوند دوگانه Δ1 و گروه متیل 6α"
            hasDelta1
            c6AlphaSub="CH3"
          />
          <SteroidMoleculeSVG
            name="ترکیب ۲ (هیدروکورتیزون)"
            formulaNote="ساختار مرجع بدون Δ1 و بدون متیل 6α"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'anti_inflammatory' as const, label: 'اثر ضدالتهابی ترکیب ۱ نسبت به ۲' },
            { key: 'half_life' as const, label: 'نیمه‌عمر پلاسمایی ترکیب ۱ نسبت به ۲' },
            { key: 'mineralocorticoid' as const, label: 'اثر مینرالوکورتیکوئیدی ترکیب ۱ نسبت به ۲' },
          ].map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-700 bg-[#081220] p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-200">{item.label}</div>
              <div className="flex gap-2">
                <button
                  disabled={arrowsSolved}
                  onClick={() => setArrows((p) => ({ ...p, [item.key]: 'up' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                    arrows[item.key] === 'up'
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" /> افزایش (↑)
                </button>
                <button
                  disabled={arrowsSolved}
                  onClick={() => setArrows((p) => ({ ...p, [item.key]: 'down' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                    arrows[item.key] === 'down'
                      ? 'border-rose-400 bg-rose-500/20 text-rose-200'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" /> کاهش (↓)
                </button>
              </div>
            </div>
          ))}
        </div>

        {arrowFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              arrowFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {arrowFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{arrowFeedback.text}</span>
          </div>
        )}

        {!arrowsSolved && (
          <div className="flex justify-end">
            <button
              disabled={arrowLoading || !arrows.anti_inflammatory || !arrows.half_life || !arrows.mineralocorticoid}
              onClick={handleArrowSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {arrowLoading ? 'در حال بررسی...' : 'ثبت تحلیل مقایسه‌ای'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: دسته‌بندی مسیر تجویز ۹ ترکیب */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          arrowsSolved
            ? 'border-slate-700/80 bg-slate-900/75'
            : 'border-slate-800 bg-slate-900/30 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>معمای ۲: تفکیک ترکیبات بر اساس مسیر تجویز (سیستمیک، موضعی، استنشاقی)</span>
          </h3>
          {!routesSolved && assignedIds.length > 0 && (
            <button
              onClick={() => setBuckets({ systemic: [], topical: [], inhalation: [] })}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> بازنشانی سبدها
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-6">
          هر یک از ۹ ترکیب زیر را با <strong>Drag & Drop</strong> (یا کلیک روی کارت و سپس کلیک روی سبد مقصد) در دسته دارویی مناسب قرار دهید:
        </p>

        {/* کارت‌های دسته‌بندی نشده */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROUTE_COMPOUNDS.filter((c) => !assignedIds.includes(c.id)).map((comp) => (
            <div
              key={comp.id}
              draggable={!routesSolved}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', comp.id)}
              onClick={() => setSelectedChip(selectedChip === comp.id ? null : comp.id)}
              className={`rounded-xl border p-3 cursor-pointer transition ${
                selectedChip === comp.id
                  ? 'border-cyan-400 bg-cyan-950/50'
                  : 'border-slate-700 bg-[#081220] hover:border-slate-500'
              }`}
            >
              <div className="font-bold text-xs text-cyan-300">{comp.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{comp.hint}</div>
            </div>
          ))}
        </div>

        {/* سه سبد مقصد */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {(
            [
              { key: 'systemic', title: 'سبد ۱: مصرف سیستمیک (خوراکی/تزریقی)', color: 'border-sky-500/40' },
              { key: 'topical', title: 'سبد ۲: مصرف موضعی (پوستی/درماتولوژیک)', color: 'border-amber-500/40' },
              { key: 'inhalation', title: 'سبد ۳: مصرف استنشاقی (ریوی/بینی)', color: 'border-purple-500/40' },
            ] as const
          ).map((b) => (
            <div
              key={b.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id) assignToBucket(b.key, id);
              }}
              onClick={() => {
                if (selectedChip) assignToBucket(b.key, selectedChip);
              }}
              className={`min-h-[160px] rounded-2xl border-2 border-dashed ${b.color} bg-slate-950/70 p-4 space-y-2.5`}
            >
              <div className="text-xs font-bold text-slate-200">{b.title}</div>
              <div className="space-y-1.5">
                {buckets[b.key].map((id) => {
                  const item = ROUTE_COMPOUNDS.find((c) => c.id === id)!;
                  return (
                    <div
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromBucket(b.key, id);
                      }}
                      className="flex items-center justify-between rounded-lg bg-slate-800/90 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 cursor-pointer hover:border-rose-400"
                    >
                      <span>{item.label}</span>
                      {!routesSolved && <span className="text-rose-400 text-[11px]">×</span>}
                    </div>
                  );
                })}
                {buckets[b.key].length === 0 && (
                  <div className="text-[11px] text-slate-500 pt-4 text-center">
                    ترکیبات را اینجا رها کنید
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {routeFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              routeFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {routeFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{routeFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {routesSolved ? (
            <button
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ دوم و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              disabled={routeLoading || assignedIds.length < 9}
              onClick={handleRouteSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {routeLoading ? 'در حال بررسی دسته‌بندی...' : 'تایید دسته‌بندی و استخراج سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
