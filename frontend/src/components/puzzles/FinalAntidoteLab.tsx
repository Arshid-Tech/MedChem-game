import React, { useEffect, useMemo, useState } from 'react';
import {
  Skull,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Timer,
  ClipboardCheck,
  Layers,
} from 'lucide-react';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { SteroidSandbox } from '../molecules/SteroidSandbox';
import { AhrimanRevealSVG } from '../molecules/AhrimanRevealSVG';
import { BiosynthesisCrossword } from './BiosynthesisCrossword';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { deterministicShuffle } from '../../utils/shuffle';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  mappingSolved: boolean;
  vaultSolved: boolean;
  antidoteSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onOpenSurvey: () => void;
  onBackToMap: () => void;
}

const HIDDEN_STRUCTURES = [
  {
    id: '1',
    blindLabel: 'ساختار ۱',
    revealedName: 'پردنیزولون — خانواده گلوکوکورتیکوئید',
    revealedNote: 'هسته پرگنان با Δ1,4، هیدروکسیل 11β و کتول C17',
    smiles: 'C[C@]12C=CC(=O)C=C1CC[C@@H]3[C@@H]2[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(O)C(=O)CO',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'فلودروکورتیزون استات — خانواده مینرالوکورتیکوئید',
    revealedNote: 'دارای فلوئور 9α و استات C21 با قدرت بالای احتباس سدیم',
    smiles: 'CC(=O)OCC(=O)[C@@]1(O)CC[C@H]2[C@@H]3CCC4=CC(=O)CC[C@]4(C)[C@@]3(F)[C@@H](O)C[C@@]12C',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'اکسی‌متولون — خانواده آندروژن',
    revealedNote: 'هسته ۱۹ کربنه آندروستان با 17β-OH',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CC[C@@H]4CC(=O)C(=CO)C[C@]34C)[C@@H]1CC[C@]2(C)O',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: 'مدروکسی‌پروژسترون استات — خانواده پروژسترون',
    revealedNote: 'هسته پرگنان ۲۱ کربنه با 6α-متیل و استات 17α',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C[C@H](C)C4=CC(=O)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '5',
    blindLabel: 'ساختار ۵',
    revealedName: 'مسترانول — خانواده استروژن',
    revealedNote: 'هسته ۱۸ کربنه با حلقه A آروماتیک، اتر C3-OCH3 و اتینیل 17α',
    smiles: 'C#C[C@]1(O)CC[C@H]2[C@@H]3CCc4cc(OC)ccc4[C@H]3CC[C@@]12C',
  },
] as const;

const STEP1_OPTIONS = deterministicShuffle(['Pregnenolone', 'Aldosterone', 'Estradiol'], 'bio-s1-v3');
const STEP2_OPTIONS = deterministicShuffle(['Progesterone', 'Cortisone', 'Estriol'], 'bio-s2-v3');
const STEP3_OPTIONS = deterministicShuffle(['Testosterone', 'Cholesterol', 'Flutamide'], 'bio-s3-v3');

export const FinalAntidoteLab: React.FC<Props> = ({
  mappingSolved,
  vaultSolved,
  antidoteSolved,
  onSubmitPuzzle,
  onOpenSurvey,
  onBackToMap,
}) => {
  const [structureClasses, setStructureClasses] = useState<Record<string, string>>({
    '1': mappingSolved ? 'glucocorticoid' : '',
    '2': mappingSolved ? 'mineralocorticoid' : '',
    '3': mappingSolved ? 'androgen' : '',
    '4': mappingSolved ? 'progesterone' : '',
    '5': mappingSolved ? 'estrogen' : '',
  });
  const mappingTimer = usePuzzleTimer(true, mappingSolved);
  const [mappingFeedback, setMappingFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [mappingLoading, setMappingLoading] = useState(false);

  const [biosynthesis, setBiosynthesis] = useState({
    step_1: vaultSolved ? 'Pregnenolone' : '',
    step_2: vaultSolved ? 'Progesterone' : '',
    step_3: vaultSolved ? 'Testosterone' : '',
    vault_password: vaultSolved ? 'CORTICOSTEROID' : '',
  });
  const vaultTimer = usePuzzleTimer(mappingSolved, vaultSolved);
  const [vaultFeedback, setVaultFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);

  const [selectedTools, setSelectedTools] = useState<string[]>(
    antidoteSolved
      ? [
          'remove_9alpha_f',
          'remove_cyanide',
          'add_11beta_antagonist_aryl',
          'hydrolyze_lipophilic_ester',
        ]
      : []
  );
  const [climaxTimer, setClimaxTimer] = useState<number>(60);
  const antidoteTimer = usePuzzleTimer(vaultSolved, antidoteSolved);
  const [antidoteFeedback, setAntidoteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [antidoteLoading, setAntidoteLoading] = useState(false);

  const shuffledHiddenStructures = useMemo(
    () => deterministicShuffle(HIDDEN_STRUCTURES, 'final-hidden-v3'),
    []
  );

  useEffect(() => {
    if (!vaultSolved || antidoteSolved) return;
    const t = setInterval(() => {
      setClimaxTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [vaultSolved, antidoteSolved]);

  const handleMappingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mappingSolved || Object.values(structureClasses).some((value) => !value)) return;
    setMappingLoading(true);
    setMappingFeedback(null);
    const elapsed = mappingTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('hidden_room_classification', structureClasses, elapsed);
      setMappingFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setMappingFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setMappingLoading(false);
    }
  };

  const handleVaultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingSolved) return;
    setVaultLoading(true);
    setVaultFeedback(null);
    const elapsed = vaultTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('biosynthesis_vault', biosynthesis, elapsed);
      setVaultFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setVaultFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setVaultLoading(false);
    }
  };

  const handleAntidoteSubmit = async () => {
    if (!vaultSolved || !selectedTools.length) return;
    setAntidoteLoading(true);
    setAntidoteFeedback(null);
    const elapsed = antidoteTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('antidote_synthesis', selectedTools, elapsed);
      setAntidoteFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setAntidoteFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setAntidoteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-rose-500/40 bg-rose-50/60 dark:bg-gradient-to-l dark:from-rose-950/60 dark:to-slate-900/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-lg">
            <Skull className="w-6 h-6" />
            <span>☠️ اتاق مخفی دکتر اِرول — کشف ساختار «اهریمن» و سنتز پادزهر</span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm mt-1 leading-6">
            همه اتاق‌ها رو گشتی و ۵ سرنخ رو جمع کردی! اما برای رسیدن به ساختار نهایی اهریمن، باید درِ اتاق مخفی خود ارول و گاوصندوقش رو باز کنی...
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

      {/* گام ۱: قفل اتاق مخفی با ۵ ساختار تصادفی */}
      <form
        onSubmit={handleMappingSubmit}
        className="rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm"
      >
        <div className="flex items-center gap-2 font-bold text-base text-cyan-700 dark:text-cyan-300">
          <Layers className="w-5 h-5" />
          <span>گام {toPersianDigits(1)}: باز کردن درِ اتاق مخفی دکتر ارول</span>
        </div>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          فقط کسی که روی همه مطالب استروئیدها مسلط باشه می‌تونه هر کدوم از این ۵ ساختار رو به دسته خودش وصل کنه تا درِ اتاق مخفی ارول باز بشه:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shuffledHiddenStructures.map((structure) => (
            <div
              key={structure.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-3 space-y-2.5 flex flex-col justify-between"
            >
              <MoleculeStructureCard
                smiles={structure.smiles}
                label={structure.blindLabel}
                revealed={mappingSolved}
                revealedName={structure.revealedName}
                revealedNote={structure.revealedNote}
                compact
              />
              <select
                required
                disabled={mappingSolved}
                value={structureClasses[structure.id]}
                onChange={(event) =>
                  setStructureClasses((previous) => ({
                    ...previous,
                    [structure.id]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب خانواده هورمونی...</option>
                <option value="glucocorticoid">گلوکوکورتیکوئید</option>
                <option value="mineralocorticoid">مینرالوکورتیکوئید</option>
                <option value="androgen">آندروژن</option>
                <option value="progesterone">پروژسترون</option>
                <option value="estrogen">استروژن</option>
              </select>
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={mappingSolved}
          hints={[
            'ساختاری که حلقه A آروماتیک دارد استروژن است، و ساختار ۱۹ کربنه بدون زنجیره دوکربنه روی C17 یک آندروژن است.',
            'بین سه ساختار ۲۱ کربنه، فلوئور 9α بدون Δ1 شاخص مینرالوکورتیکوئید، نبود OH روی C11 و C21 شاخص پروژسترون، و Δ1,4 با 11β-OH گلوکوکورتیکوئید است.',
          ]}
        />

        {mappingFeedback && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-sm ${
              mappingFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {mappingFeedback.text}
          </div>
        )}
        {!mappingSolved && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mappingLoading || Object.values(structureClasses).some((value) => !value)}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {mappingLoading ? 'در حال بررسی...' : 'باز کردن در اتاق مخفی'}
            </button>
          </div>
        )}
      </form>

      {/* گام ۲: گاوصندوق — مسیر بیوسنتز کلسترول + جدول کلمات متقاطع تعاملی */}
      <form
        onSubmit={handleVaultSubmit}
        className={`rounded-2xl border p-6 space-y-5 transition ${
          mappingSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-base text-amber-600 dark:text-amber-300">
          <KeyRound className="w-5 h-5" />
          <span>گام {toPersianDigits(2)}: گاوصندوق ارول — مسیر بیوسنتز کلسترول و جدول کلمات متقاطع</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          توی اتاق هیچ چیزی نیست جز یه گاوصندوق که رمزش یه کلیدواژه‌ست! یه برگه از مجله علمی (مسیر بیوسنتز کلسترول) و یه جدول کلمات متقاطع روش چسبیده. مسیر بیوسنتز رو کامل کن و از جدول زیر رمز {toPersianDigits(14)} حرفی رو دربیار:
        </p>

        {/* دیاگرام بصری مسیر بیوسنتز کلسترول */}
        <div dir="ltr" className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200">
              Cholesterol
            </span>
            <span className="text-cyan-500 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg border border-cyan-500/50 bg-cyan-500/15 font-bold text-cyan-700 dark:text-cyan-300">
              (1) {biosynthesis.step_1 || '؟'}
            </span>
            <span className="text-cyan-500 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg border border-amber-500/50 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300">
              (2) {biosynthesis.step_2 || '؟'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Androstenedione
            </span>
            <span className="text-cyan-500 font-bold">⇄</span>
            <span className="px-2.5 py-1 rounded-lg border border-purple-500/50 bg-purple-500/15 font-bold text-purple-700 dark:text-purple-300">
              (3) {biosynthesis.step_3 || '؟'}
            </span>
            <span className="text-cyan-500 font-bold">→</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              5α-DHT / Estradiol
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">جایگاه (۱) پس از برش زنجیره کلسترول:</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_1}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_1: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select (1)...</option>
              {STEP1_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">جایگاه (۲) محصول 3β-HSD روی (۱):</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_2}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_2: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select (2)...</option>
              {STEP2_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">جایگاه (۳) پیش‌ساز مستقیم DHT و استرادیول:</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_3}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_3: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select (3)...</option>
              {STEP3_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* جدول کلمات متقاطع تعاملی */}
        <BiosynthesisCrossword
          disabled={!mappingSolved}
          solved={vaultSolved}
          onPasswordExtracted={(pwd) =>
            setBiosynthesis((prev) => ({ ...prev, vault_password: pwd }))
          }
        />

        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
              رمز {toPersianDigits(14)} حرفی گاوصندوق (از جدول بالا استخراج یا مستقیم وارد کن):
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              پس از تکمیل جدول کلمات متقاطع، این کادر به‌طور خودکار پر می‌شود
            </div>
          </div>
          <input
            type="text"
            required
            disabled={!mappingSolved || vaultSolved}
            dir="ltr"
            placeholder="14-LETTER PASSWORD"
            value={biosynthesis.vault_password}
            onChange={(e) => setBiosynthesis((p) => ({ ...p, vault_password: e.target.value.toUpperCase() }))}
            className="w-full sm:w-60 rounded-xl border border-amber-500/50 bg-white dark:bg-slate-950 px-4 py-2 font-mono text-sm tracking-widest text-amber-700 dark:text-amber-300 uppercase focus:outline-none focus:border-amber-400"
          />
        </div>

        {vaultFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              vaultFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {vaultFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{vaultFeedback.text}</span>
          </div>
        )}

        {!vaultSolved && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!mappingSolved || vaultLoading}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 text-sm transition"
            >
              {vaultLoading ? 'در حال بررسی رمز...' : 'باز کردن قفل گاوصندوق ارول'}
            </button>
          </div>
        )}
      </form>

      {/* گام ۳: رونمایی از ساختار رنگ‌آمیزی‌شده اهریمن + سنتز پادزهر */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          vaultSolved
            ? 'border-rose-500/40 bg-white dark:bg-slate-900/85 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        {vaultSolved && <AhrimanRevealSVG />}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 font-extrabold text-base text-rose-600 dark:text-rose-300">
            <Sparkles className="w-5 h-5" />
            <span>گام {toPersianDigits(3)} (اوج عملیات): مهندسی معکوس اهریمن و سنتز پادزهر</span>
          </div>
          {!antidoteSolved && vaultSolved && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-950/85 px-3 py-1.5 text-xs font-bold text-rose-200">
              <Timer className={`w-4 h-4 ${climaxTimer > 0 ? 'animate-spin' : ''}`} />
              <span>
                {climaxTimer > 0
                  ? `چرخه پایداری راکتور: ${toPersianDigits(climaxTimer)} ثانیه`
                  : 'هشدار بحرانی راکتور! فوراً پادزهر را سنتز کنید'}
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          حالا که ساختار کامل اهریمن رو دیدی، از جعبه‌ابزار آزاد (پاک‌کن و گروه‌های عاملی) روی میز کار زیر استفاده کن تا بخش‌های سمی اهریمن حذف بشن و به یک <strong>پادزهر آنتاگونیست بی‌خطر</strong> تبدیل بشه:
        </p>

        <SteroidSandbox
          mode="antidote"
          disabled={!vaultSolved}
          solved={antidoteSolved}
          onTokensChange={setSelectedTools}
        />

        {antidoteFeedback && (
          <div
            className={`rounded-xl border p-4 text-sm flex items-start gap-2.5 ${
              antidoteFeedback.ok
                ? 'border-emerald-500/50 bg-emerald-950/85 text-emerald-100'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {antidoteFeedback.ok ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{antidoteFeedback.text}</span>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          {antidoteSolved ? (
            <button
              type="button"
              onClick={onOpenSurvey}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 text-sm transition flex items-center gap-2 shadow-lg"
            >
              <ClipboardCheck className="w-5 h-5" />
              تکمیل پرسشنامه پژوهشی MEEGA+ و دریافت کارنامه
            </button>
          ) : (
            <button
              type="button"
              disabled={!vaultSolved || antidoteLoading || selectedTools.length === 0}
              onClick={handleAntidoteSubmit}
              className="rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white font-extrabold px-6 py-3 text-sm transition"
            >
              {antidoteLoading ? 'در حال سنتز پادزهر...' : 'سنتز نهایی پادزهر و خنثی‌سازی اهریمن'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
