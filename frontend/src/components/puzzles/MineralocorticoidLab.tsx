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
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { toPersianDigits } from '../../utils/persian';

interface RouteCompound {
  id: string;
  blindLabel: string;
  revealedName: string;
  revealedNote: string;
  smiles: string;
}

const ROUTE_COMPOUNDS: RouteCompound[] = [
  {
    id: '1',
    blindLabel: 'ترکیب ۱',
    revealedName: 'پردنیزولون فسفات (Prednisolone Phosphate)',
    revealedNote: 'استر فسفات قطبی و محلول در آب در C21 — مناسب مصرف سیستمیک',
    smiles: 'C[C@]12C=CC(=O)C=C1CC[C@@H]3[C@@H]2[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(O)C(=O)COP(=O)(O)O',
  },
  {
    id: '2',
    blindLabel: 'ترکیب ۲',
    revealedName: 'فلوسینولون استونید (Fluocinolone Acetonide)',
    revealedNote: 'کتال 16α,17α-استونید لیپوفیل + دو فلوئور — مناسب مصرف موضعی پوستی',
    smiles: 'CC1(C)O[C@@H]2C[C@H]3[C@@H]4C[C@H](F)C5=CC(=O)C=C[C@]5(C)[C@@]4(F)[C@@H](O)C[C@]3(C)[C@@]2(O1)C(=O)CO',
  },
  {
    id: '3',
    blindLabel: 'ترکیب ۳',
    revealedName: 'فلوتیکازون پروپیونات (Fluticasone Propionate)',
    revealedNote: 'فلوئورومتیل کربوتیوآت در C17β با متابولیسم عبور اول کبدی بسیار سریع — استنشاقی',
    smiles: 'CCC(=O)O[C@@]1(C(=O)SCF)[C@H](C)C[C@H]2[C@@H]3C[C@H](F)C4=CC(=O)C=C[C@]4(C)[C@@]3(F)[C@@H](O)C[C@@]12C',
  },
  {
    id: '4',
    blindLabel: 'ترکیب ۴',
    revealedName: 'بودزوناید (Budesonide)',
    revealedNote: 'استال نامتقارن بوتیرآلدهید در 16α,17α با کلیرانس کبدی سریع — استنشاقی',
    smiles: 'CCCC1O[C@@H]2C[C@H]3[C@@H]4CCC5=CC(=O)C=C[C@]5(C)[C@H]4[C@@H](O)C[C@]3(C)[C@@]2(O1)C(=O)CO',
  },
  {
    id: '5',
    blindLabel: 'ترکیب ۵',
    revealedName: 'هیدروکورتیزون همی‌سوکسینات',
    revealedNote: 'استر همی‌سوکسینات محلول در آب در C21 — تزریقی/سیستمیک',
    smiles: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(O)C(=O)COC(=O)CCC(=O)O',
  },
  {
    id: '6',
    blindLabel: 'ترکیب ۶',
    revealedName: 'بتامتازون والرات (Betamethasone Valerate)',
    revealedNote: 'استر والرات لیپوفیل در C17α با نفوذ بالای پوستی — موضعی',
    smiles: 'CCCCC(=O)O[C@@]1(C(=O)CO)[C@@H](C)C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@]4(C)[C@@]3(F)[C@@H](O)C[C@@]12C',
  },
  {
    id: '7',
    blindLabel: 'ترکیب ۷',
    revealedName: 'تریامسینولون استونید (Triamcinolone Acetonide)',
    revealedNote: 'کتال حلقوی C16,C17 با لیپوفیلیته بالا و جذب سیستمیک ناچیز — موضعی',
    smiles: 'CC1(C)O[C@@H]2C[C@H]3[C@@H]4CCC5=CC(=O)C=C[C@]5(C)[C@@]4(F)[C@@H](O)C[C@]3(C)[C@@]2(O1)C(=O)CO',
  },
  {
    id: '8',
    blindLabel: 'ترکیب ۸',
    revealedName: 'متیل‌پردنیزولون (Methylprednisolone)',
    revealedNote: 'هیدروکسیل آزاد C21 و متیل 6α — خوراکی/سیستمیک',
    smiles: 'C[C@H]1C[C@H]2[C@@H]3CC[C@](O)(C(=O)CO)[C@@]3(C)C[C@H](O)[C@@H]2[C@@]4(C)C=CC(=O)C=C14',
  },
  {
    id: '9',
    blindLabel: 'ترکیب ۹',
    revealedName: 'مومتازون فوروئات (Mometasone Furoate)',
    revealedNote: 'استر فوروئات C17α و کلر C9α/C21 — افشانه تنفسی/استنشاقی',
    smiles: 'C[C@@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@]4(C)[C@@]3(Cl)[C@@H](O)C[C@]2(C)[C@@]1(OC(=O)c5ccco5)C(=O)CCl',
  },
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
  const [arrows, setArrows] = useState<{
    anti_inflammatory: 'up' | 'down' | '';
    half_life: 'up' | 'down' | '';
    mineralocorticoid: 'up' | 'down' | '';
  }>(
    arrowsSolved
      ? { anti_inflammatory: 'up', half_life: 'up', mineralocorticoid: 'down' }
      : { anti_inflammatory: '', half_life: '', mineralocorticoid: '' }
  );
  const arrowTimer = usePuzzleTimer(true, arrowsSolved);
  const [arrowFeedback, setArrowFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [arrowLoading, setArrowLoading] = useState(false);

  const [buckets, setBuckets] = useState<Record<BucketKey, string[]>>(
    routesSolved
      ? { systemic: ['1', '5', '8'], topical: ['2', '6', '7'], inhalation: ['3', '4', '9'] }
      : { systemic: [], topical: [], inhalation: [] }
  );
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const routeTimer = usePuzzleTimer(arrowsSolved, routesSolved);
  const [routeFeedback, setRouteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const handleArrowSubmit = async () => {
    setArrowLoading(true);
    setArrowFeedback(null);
    const elapsed = arrowTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('effect_arrows', arrows, elapsed);
      setArrowFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setArrowFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
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
    const elapsed = routeTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('route_classification', buckets, elapsed);
      setRouteFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setRouteFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-lg">
            <Droplets className="w-6 h-6" />
            <span>دپارتمان دوم: بخش مینرالوکورتیکوئیدها و فارماکوکینتیک موضعی</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            یادداشت رمزگشایی‌شده: <em>«اثر احتباس آب و سدیم را به حداقل برسان؛ اهریمن قرار نیست کل بدن را درگیر کند، فقط یک بافت هدف موضعی...»</em>
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-300 dark:border-slate-600 hover:border-cyan-500 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: مقایسه ساختاری ترکیب ۱ و ۲ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(1)}: مقایسه فارماکولوژیک ساختار ۱ نسبت به ساختار ۲
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SteroidMoleculeSVG
            name={arrowsSolved ? 'ساختار ۱ — متیل‌پردنیزولون' : 'ساختار ۱'}
            formulaNote={arrowsSolved ? 'دارای پیوند دوگانه Δ1 و گروه متیل 6α' : undefined}
            hasDelta1
            c6AlphaSub="CH3"
          />
          <SteroidMoleculeSVG
            name={arrowsSolved ? 'ساختار ۲ — هیدروکورتیزون' : 'ساختار ۲'}
            formulaNote={arrowsSolved ? 'ساختار مرجع بدون Δ1 و بدون متیل 6α' : undefined}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'anti_inflammatory' as const, label: 'اثر ضدالتهابی ساختار ۱ نسبت به ۲' },
            { key: 'half_life' as const, label: 'نیمه‌عمر پلاسمایی ساختار ۱ نسبت به ۲' },
            { key: 'mineralocorticoid' as const, label: 'اثر مینرالوکورتیکوئیدی ساختار ۱ نسبت به ۲' },
          ].map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={arrowsSolved}
                  onClick={() => setArrows((p) => ({ ...p, [item.key]: 'up' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                    arrows[item.key] === 'up'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" /> افزایش (↑)
                </button>
                <button
                  type="button"
                  disabled={arrowsSolved}
                  onClick={() => setArrows((p) => ({ ...p, [item.key]: 'down' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                    arrows[item.key] === 'down'
                      ? 'border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-200'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" /> کاهش (↓)
                </button>
              </div>
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={arrowsSolved}
          hints={[
            'ساختار ۱ نسبت به ساختار ۲ دو تغییر کلیدی دارد: پیوند دوگانه Δ1 در حلقه A و گروه متیل 6α در حلقه B.',
            'Δ1 و متیل 6α متابولیسم کبدی حلقه A را کند می‌کنند (افزایش نیمه‌عمر و اثر ضدالتهابی) و هم‌زمان اثر احتباس سدیم را کاهش می‌دهند.',
          ]}
        />

        {arrowFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              arrowFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {arrowFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{arrowFeedback.text}</span>
          </div>
        )}

        {!arrowsSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={arrowLoading || !arrows.anti_inflammatory || !arrows.half_life || !arrows.mineralocorticoid}
              onClick={handleArrowSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {arrowLoading ? 'در حال بررسی...' : 'ثبت تحلیل مقایسه‌ای'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: دسته‌بندی مسیر تجویز ۹ ساختار واقعی */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          arrowsSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            <span>معمای {toPersianDigits(2)}: تفکیک ساختارها بر اساس مسیر تجویز (سیستمیک، موضعی، استنشاقی)</span>
          </h3>
          {!routesSolved && assignedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setBuckets({ systemic: [], topical: [], inhalation: [] })}
              className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> بازنشانی سبدها
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          با بررسی گروه‌های عاملی (استرهای قطبی، استونیدها، تیواسترها و فوروئات) هر یک از {toPersianDigits(9)} ساختار زیر را با <strong>Drag & Drop</strong> (یا کلیک روی کارت و سپس کلیک روی سبد مقصد) در دسته دارویی مناسب قرار دهید. برای مشاهده دقیق‌تر هر ساختار، روی آیکون بزرگ‌نمایی کلیک کنید:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ROUTE_COMPOUNDS.filter((c) => !assignedIds.includes(c.id)).map((comp) => (
            <div
              key={comp.id}
              draggable={!routesSolved}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', comp.id)}
              onClick={() => setSelectedChip(selectedChip === comp.id ? null : comp.id)}
              className={`rounded-xl transition cursor-pointer ${
                selectedChip === comp.id
                  ? 'ring-2 ring-cyan-500 shadow-md'
                  : 'hover:ring-1 hover:ring-cyan-400/60'
              }`}
            >
              <MoleculeStructureCard
                smiles={comp.smiles}
                label={comp.blindLabel}
                revealed={routesSolved}
                revealedName={comp.revealedName}
                revealedNote={comp.revealedNote}
                compact
              />
            </div>
          ))}
        </div>

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
              className={`min-h-[170px] rounded-2xl border-2 border-dashed ${b.color} bg-slate-100/70 dark:bg-slate-950/70 p-4 space-y-2.5`}
            >
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.title}</div>
              <div className="space-y-2">
                {buckets[b.key].map((id) => {
                  const item = ROUTE_COMPOUNDS.find((c) => c.id === id)!;
                  return (
                    <div
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromBucket(b.key, id);
                      }}
                      className="rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-800 dark:text-slate-100 cursor-pointer hover:border-rose-400 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {item.blindLabel}
                          {routesSolved ? ` — ${item.revealedName}` : ''}
                        </span>
                        {!routesSolved && <span className="text-rose-500 text-xs font-bold">×</span>}
                      </div>
                      {routesSolved && (
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                          {item.revealedNote}
                        </div>
                      )}
                    </div>
                  );
                })}
                {buckets[b.key].length === 0 && (
                  <div className="text-[11px] text-slate-400 pt-4 text-center">
                    ساختارها را اینجا رها کنید
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={routesSolved}
          disabled={!arrowsSolved}
          hints={[
            'ترکیبات دارای گروه‌های یونی/قطبی (فسفات، همی‌سوکسینات) یا هیدروکسیل آزاد بدون استر لیپوفیل برای مصرف سیستمیک هستند.',
            'کتال‌های 16,17-استونید متقارن و والرات C17 (۲، ۶، ۷) موضعی‌اند؛ در حالی که تیواستر فلوئورومتیل (۳)، استال نامتقارن بوتیرآلدهید (۴) و فوروئات کلردار (۹) استنشاقی هستند.',
          ]}
        />

        {routeFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              routeFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {routeFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{routeFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {routesSolved ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ دوم و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              type="button"
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
