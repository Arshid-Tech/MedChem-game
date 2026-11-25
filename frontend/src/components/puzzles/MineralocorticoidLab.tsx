import React, { useMemo, useState } from 'react';
import {
  Droplets,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RotateCcw,
  PhoneCall,
  ScrollText,
} from 'lucide-react';
import { SteroidMoleculeSVG } from '../molecules/SteroidMoleculeSVG';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { deterministicShuffle } from '../../utils/shuffle';
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
    revealedName: 'دگزامتازون (سیستمیک)',
    revealedNote: 'دارای Δ1، فلوئور 9α، متیل 16α و هیدروکسیل آزاد C21',
    smiles: 'C[C@@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@]4(C)[C@@]3(F)[C@@H](O)C[C@]2(C)[C@@]1(O)C(=O)CO',
  },
  {
    id: '2',
    blindLabel: 'ترکیب ۲',
    revealedName: 'فلوسینولون استونید (موضعی)',
    revealedNote: 'کتال حلقوی استونید 16α,17α + دو فلوئور با نفوذ پوستی بالا',
    smiles: 'CC1(C)O[C@@H]2C[C@H]3[C@@H]4C[C@H](F)C5=CC(=O)C=C[C@]5(C)[C@@]4(F)[C@@H](O)C[C@]3(C)[C@@]2(O1)C(=O)CO',
  },
  {
    id: '3',
    blindLabel: 'ترکیب ۳',
    revealedName: 'بکلومتازون دی‌پروپیونات (استنشاقی)',
    revealedNote: 'دارای کلر 9α، متیل 16β و دو استر پروپیونات در C17/C21',
    smiles: 'CCC(=O)OCC(=O)[C@@]1(OC(=O)CC)[C@@H](C)C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@]4(C)[C@@]3(Cl)[C@@H](O)C[C@@]12C',
  },
  {
    id: '4',
    blindLabel: 'ترکیب ۴',
    revealedName: 'بودزوناید (استنشاقی)',
    revealedNote: 'استال نامتقارن بوتیرآلدهید روی C16,C17 با کلیرانس کبدی بالا',
    smiles: 'CCCC1O[C@@H]2C[C@H]3[C@@H]4CCC5=CC(=O)C=C[C@]5(C)[C@H]4[C@@H](O)C[C@]3(C)[C@@]2(O1)C(=O)CO',
  },
  {
    id: '5',
    blindLabel: 'ترکیب ۵',
    revealedName: 'پردنیزولون (سیستمیک)',
    revealedNote: 'هسته Δ1,4 با هیدروکسیل آزاد 11β، 17α و C21 بدون استر لیپوفیل',
    smiles: 'C[C@]12C=CC(=O)C=C1CC[C@@H]3[C@@H]2[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(O)C(=O)CO',
  },
  {
    id: '6',
    blindLabel: 'ترکیب ۶',
    revealedName: 'آلکلومتازون دی‌پروپیونات (موضعی)',
    revealedNote: 'دارای کلر 7α، متیل 16α و دی‌پروپیونات C17/C21 برای مصرف پوستی',
    smiles: 'CCC(=O)OCC(=O)[C@@]1(OC(=O)CC)[C@H](C)C[C@H]2[C@@H]3[C@H](Cl)CC4=CC(=O)C=C[C@]4(C)[C@H]3[C@@H](O)C[C@@]12C',
  },
  {
    id: '7',
    blindLabel: 'ترکیب ۷',
    revealedName: 'آمسینوناید (موضعی)',
    revealedNote: 'کتال سیکلوپنتیلیدن 16α,17α + استات C21 با لیپوفیلیته موضعی بالا',
    smiles: 'CC(=O)OCC(=O)[C@@]12OC3(CCCC3)O[C@@H]1C[C@H]4[C@@H]5CCC6=CC(=O)C=C[C@]6(C)[C@@]5(F)[C@@H](O)C[C@@]24C',
  },
  {
    id: '8',
    blindLabel: 'ترکیب ۸',
    revealedName: 'متیل‌پردنیزولون (سیستمیک)',
    revealedNote: 'هیدروکسیل آزاد C21 و متیل 6α برای مصرف خوراکی/سیستمیک',
    smiles: 'C[C@H]1C[C@H]2[C@@H]3CC[C@](O)(C(=O)CO)[C@@]3(C)C[C@H](O)[C@@H]2[C@@]4(C)C=CC(=O)C=C14',
  },
  {
    id: '9',
    blindLabel: 'ترکیب ۹',
    revealedName: 'فلوتیکازون پروپیونات (استنشاقی)',
    revealedNote: 'تیواستر فلوئورومتیل در C17β + دو فلوئور با متابولیسم کبدی بسیار سریع',
    smiles: 'CCC(=O)O[C@@]1(C(=O)SCF)[C@H](C)C[C@H]2[C@@H]3C[C@H](F)C4=CC(=O)C=C[C@]4(C)[C@@]3(F)[C@@H](O)C[C@@]12C',
  },
];

// ساختارهای نامه کژتاب به زهتاب (مقایسه مینرالوکورتیکوئید پایه و ترکیب پرفشار با 9α-F و 18-CHO)
const KAZHTAB_LETTER_DOC_SMILES = 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2CC[C@]4(C)[C@H]3CC[C@@H]4C(=O)CO';
const KAZHTAB_LETTER_HIGH_MC_SMILES =
  'C[C@H]1C[C@H]2[C@@H]3CC[C@@H](C(=O)CO)[C@@]3(C=O)C[C@H](O)[C@@]2(F)[C@@]4(C)CCC(=O)C=C14';

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

  const [phoneAnswered, setPhoneAnswered] = useState(routesSolved);
  const [buckets, setBuckets] = useState<Record<BucketKey, string[]>>(
    routesSolved
      ? { systemic: ['1', '5', '8'], topical: ['2', '6', '7'], inhalation: ['3', '4', '9'] }
      : { systemic: [], topical: [], inhalation: [] }
  );
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const routeTimer = usePuzzleTimer(arrowsSolved && phoneAnswered, routesSolved);
  const [routeFeedback, setRouteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const shuffledCompounds = useMemo(
    () => deterministicShuffle(ROUTE_COMPOUNDS, 'mc-route-cards-v3'),
    []
  );

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
            <span>🧂 اتاق گوله نمک — اتاق پروفسور زهتاب (مینرالوکورتیکوئیدها)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-6">
            پروفسور زهتاب، برادر پروفسور کژتاب، برخلاف برادرش رفت سراغ مینرالوکورتیکوئیدها و کنترل آب و نمک بدن...
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-300 dark:border-slate-600 hover:border-cyan-500 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          بازگشت به نقشه کارخانه
        </button>
      </div>

      {/* گام ۱: مقایسه متیل‌پردنیزولون (۱) نسبت به پردنیزولون (۲) مطابق PDF */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(1)}: برای ورود به اتاق، این دو ساختار رو با هم مقایسه کن و فلش‌هاشونو بزن
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SteroidMoleculeSVG
            name={arrowsSolved ? 'ساختار ۱ — متیل‌پردنیزولون' : 'ساختار ۱'}
            formulaNote={arrowsSolved ? 'دارای پیوند دوگانه Δ1 و متیل 6α' : undefined}
            hasDelta1
            c6AlphaSub="CH3"
          />
          <SteroidMoleculeSVG
            name={arrowsSolved ? 'ساختار ۲ — پردنیزولون' : 'ساختار ۲'}
            formulaNote={arrowsSolved ? 'دارای پیوند دوگانه Δ1 بدون متیل 6α' : undefined}
            hasDelta1
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'anti_inflammatory' as const, label: 'اثر ضدالتهابی ترکیب ۱ نسبت به ۲' },
            { key: 'half_life' as const, label: 'نیمه‌عمر ترکیب ۱ نسبت به ۲' },
            { key: 'mineralocorticoid' as const, label: 'اثر مینرالوکورتیکوئید ترکیب ۱ نسبت به ۲' },
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
            'هر دو ساختار پیوند دوگانه Δ1 دارند؛ تفاوت اصلی، افزودن گروه متیل 6α روی حلقه B در ساختار ۱ است.',
            'افزودن متیل 6α اثر ضدالتهابی و نیمه‌عمر را بیشتر می‌کند و هم‌زمان اثر مینرالوکورتیکوئیدی (احتباس سدیم) را کاهش می‌دهد.',
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
              {arrowLoading ? 'در حال بررسی...' : 'باز کردن در اتاق گوله نمک'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۲ (نامه کژتاب + دو ساختار پیوست نامه) و زنگ خوردن تلفن زهتاب */}
      {arrowsSolved && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300">
              <ScrollText className="w-4 h-4" />
              <span>نامه پروفسور کژتاب روی میز زهتاب</span>
            </div>
            <p className="text-xs leading-7 text-slate-700 dark:text-slate-200 italic">
              «زهتاب جان، می‌دونم از من دلخوری. راست می‌گی، من اشتباه کردم رفتم سراغ گلوکو... ولی الان فرصت ندارم حرفامو بزنم. یه چیزی می‌خوام ازت: <strong>اثر مینرال ترکیبم رو کم کن!</strong>»
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MoleculeStructureCard
                smiles={KAZHTAB_LETTER_DOC_SMILES}
                label="ساختار پایه مینرالوکورتیکوئید (بدون 11β-OH و 17α-OH)"
                compact
              />
              <MoleculeStructureCard
                smiles={KAZHTAB_LETTER_HIGH_MC_SMILES}
                label="ترکیب ارسالی کژتاب (دارای 9α-F و آلدهید C18 با اثر مینرال شدید)"
                compact
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              نکته آموزشی: با افزودن استخلاف روی C16 یا حذف 9α-F/آلدهید C18 (قابل تست در «میز کار مولکول‌سازی») اثر احتباس آب و نمک به حداقل می‌رسد.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 space-y-3 shadow-sm transition ${
              phoneAnswered
                ? 'border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20'
                : 'border-rose-500/50 bg-rose-50/80 dark:bg-rose-950/30 animate-pulse'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-rose-700 dark:text-rose-300">
                <PhoneCall className="w-4 h-4" />
                <span>{phoneAnswered ? 'تماس تلفنی شنود شد!' : 'تلفن میز زهتاب داره زنگ می‌خوره!'}</span>
              </div>
              {!phoneAnswered && (
                <button
                  type="button"
                  onClick={() => setPhoneAnswered(true)}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold px-3.5 py-1.5 text-xs shadow"
                >
                  برداشتن گوشی 📞
                </button>
              )}
            </div>
            {phoneAnswered ? (
              <p className="text-xs leading-7 text-slate-700 dark:text-slate-200">
                صدای ناشناس پشت خط: <strong>«قراره اهریمن رو موضعی بسازیم...»</strong>
                <br />
                <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                  🎧 همکار پشت بی‌سیم: یعنی دکتر ارول نمی‌خواد کل بدن رو درگیر کنه، فقط یه نقطه خاص! توی چرک‌نویسای دکتر ترکیبات رو جدا کن تا موضعی‌ها رو پیدا کنی.
                </span>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                زود گوشی رو بردار و ببین کی پشت خطه!
              </p>
            )}
          </div>
        </div>
      )}

      {/* گام ۳: چرک‌نویس ۹ ترکیب دقیقاً مطابق PDF با ترتیب تصادفی */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          arrowsSolved && phoneAnswered
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-500" />
            <span>گام {toPersianDigits(3)}: جداسازی چرک‌نویس ترکیبات زهتاب (سیستمیک، موضعی، استنشاقی)</span>
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
          هر کدوم از {toPersianDigits(9)} ساختار زیر رو با <strong>Drag & Drop</strong> (یا کلیک روی کارت و سپس سبد مقصد) توی دسته خودش بذار. برای دیدن جزئیات دقیق‌تر می‌تونی روی آیکون بزرگ‌نمایی کلیک کنی:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shuffledCompounds
            .filter((c) => !assignedIds.includes(c.id))
            .map((comp) => (
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
              { key: 'systemic', title: 'سبد ۱: سیستمیک (خوراکی/تزریقی)', color: 'border-sky-500/40' },
              { key: 'topical', title: 'سبد ۲: موضعی (پوستی)', color: 'border-amber-500/40' },
              { key: 'inhalation', title: 'سبد ۳: استنشاقی (تنفسی)', color: 'border-purple-500/40' },
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
                      className="rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-2 text-xs text-slate-800 dark:text-slate-100 cursor-pointer hover:border-rose-400 space-y-1"
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
                    ساختارها را اینجا رها کن
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={routesSolved}
          disabled={!arrowsSolved || !phoneAnswered}
          hints={[
            'ترکیباتی که هیدروکسیل‌های آزاد 17α و C21 بدون استر/کتال لیپوفیل دارند (۱، ۵ و ۸) برای مصرف سیستمیک هستند.',
            'استونیدها و کتال سیکلوپنتیلیدن و 7α-کلر دی‌پروپیونات (۲، ۶ و ۷) موضعی‌اند؛ بکلومتازون دی‌پروپیونات (۳)، بودزوناید (۴) و فلوتیکازون تیواستر (۹) استنشاقی هستند.',
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
              ذخیره سرنخ دوم (اهریمن موضعی است) و بازگشت ←
            </button>
          ) : (
            <button
              type="button"
              disabled={routeLoading || assignedIds.length < 9}
              onClick={handleRouteSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {routeLoading ? 'در حال بررسی...' : 'تایید دسته‌بندی و کشف سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
