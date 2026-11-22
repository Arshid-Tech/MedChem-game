import React, { useMemo, useState } from 'react';
import { Dna, CheckCircle2, AlertTriangle, RotateCcw, Cpu, ArrowDown, ArrowUp } from 'lucide-react';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { deterministicShuffle } from '../../utils/shuffle';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  entryPotencySolved: boolean;
  metaboliteSolved: boolean;
  sarmSolved: boolean;
  androgenicitySolved: boolean;
  classificationSolved: boolean;
  enzymeComplexSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

const ENTRY_POTENCY_ITEMS = [
  {
    id: '1',
    blindLabel: 'ساختار ۱',
    revealedName: 'اکسی‌متولون (Oxymetholone)',
    revealedNote: 'مشتق دی‌هیدروتستوسترون با 2-هیدروکسی‌متیلن',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CC[C@@H]4CC(=O)C(=CO)C[C@]34C)[C@@H]1CC[C@]2(C)O',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'استانوزولول (Stanozolol)',
    revealedNote: 'دارای حلقه پیرازول متصل به حلقه A',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CC[C@@H]4Cc5c[nH]nc5C[C@]34C)[C@@H]1CC[C@]2(C)O',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'میبولرون / مشتق دی‌متیل',
    revealedNote: 'بیشترین قدرت اثر در این مجموعه',
    smiles: 'C[C@@H]1CC2=CC(=O)CC[C@@H]2[C@H]3CC[C@]4(C)[C@H]([C@@H]13)CC[C@]4(C)O',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: 'فلوکسی‌مسترون (Fluoxymesterone)',
    revealedNote: 'دارای فلوئور 9α و هیدروکسیل 11β',
    smiles: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@]2(F)[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(C)O',
  },
];

const INITIAL_ENTRY_ORDER = deterministicShuffle(['1', '2', '3', '4'], 'and-entry-order-v3');

const FLUTAMIDE_PARENT_SMILES = 'CC(C)C(=O)Nc1ccc([N+](=O)[O-])c(C(F)(F)F)c1';
const BICALUTAMIDE_SMILES = 'CC(O)(CS(=O)(=O)c1ccc(F)cc1)C(=O)Nc2ccc(C#N)c(C(F)(F)F)c2';

const FLUTAMIDE_CANDIDATES = [
  {
    id: '2-hydroxyflutamide',
    blindLabel: 'ساختار الف',
    revealedName: '۲-هیدروکسی‌فلوتامید (متابولیت فعال)',
    revealedNote: 'هیدروکسیلاسیون روی کربن متین زنجیره ایزوبوتیریل',
    smiles: 'CC(C)(O)C(=O)Nc1ccc([N+](=O)[O-])c(C(F)(F)F)c1',
  },
  {
    id: 'nitro_reduced_amine',
    blindLabel: 'ساختار ب',
    revealedName: 'آمین آروماتیک احیاشده (غیرفعال)',
    revealedNote: 'احیای گروه نیترو حلقه بنزن',
    smiles: 'CC(C)C(=O)Nc1ccc(N)c(C(F)(F)F)c1',
  },
  {
    id: 'n_dealkylated_anilide',
    blindLabel: 'ساختار ج',
    revealedName: 'محصول هیدرولیز پیوند آمیدی (غیرفعال)',
    revealedNote: 'شکست کامل زنجیره آمیدی',
    smiles: 'Nc1ccc([N+](=O)[O-])c(C(F)(F)F)c1',
  },
];

const ANDROGENICITY_OPTIONS = deterministicShuffle(
  [
    { id: 'add_androgenic_features', label: 'افزودن استخلاف‌های 17α-متیل و 9α-فلوئور روی هسته آندروستان' },
    { id: 'remove_androgenic_features', label: 'حذف بخش‌هایی که خواص آندروژنی ایجاد می‌کنند (مثل متیل زاویه‌ای C19)' },
    { id: 'add_low_androgenic_features', label: 'افزودن تغییرات کاهنده آندروژنیسیته و مهارکننده احیای 5α' },
  ],
  'and-low-opts-v3'
);

const COFACTOR_OPTIONS = deterministicShuffle(
  [
    { value: 'heme_iron_chelation', label: 'کلاته کردن اتم آهن هم (Heme Fe)' },
    { value: 'nadph_covalent_adduct', label: 'تشکیل کمپلکس کووالانسی برگشت‌ناپذیر با کوفاکتور NADPH' },
    { value: 'allosteric_zinc', label: 'اتصال آلوستریک به یون روی' },
  ],
  'and-cofactor-v3'
);

const PHARMACOPHORE_OPTIONS = deterministicShuffle(
  [
    { value: 'phenolic_oh', label: 'حلقه فنولیک آروماتیک' },
    { value: 'nitro_benzene', label: 'حلقه نیتروبنزن' },
    { value: 'keto_enol_lactam', label: 'سیستم کتو-انول / لاکتام حلقه A' },
  ],
  'and-pharm-v3'
);

const ANDROGEN_DRUGS = [
  {
    id: '1',
    blindLabel: 'ترکیب ۱',
    revealedName: 'سیپروترون استات',
    revealedNote: 'آنتی‌اندروژن استروئیدی',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C=C(Cl)C4=CC(=O)[C@@H]5C[C@@H]5[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '2',
    blindLabel: 'ترکیب ۲',
    revealedName: 'نیلوتامید',
    revealedNote: 'آنتی‌اندروژن غیراستروئیدی',
    smiles: 'CC1(C)NC(=O)N(c2ccc([N+](=O)[O-])c(C(F)(F)F)c2)C1=O',
  },
  {
    id: '3',
    blindLabel: 'ترکیب ۳',
    revealedName: 'فیناستراید',
    revealedNote: 'مهارکننده ۵-آلفا ردوکتاز',
    smiles: 'CC(C)(C)NC(=O)[C@H]1CC[C@H]2[C@@H]3CC[C@H]4NC(=O)C=C[C@]4(C)[C@H]3CC[C@]12C',
  },
  {
    id: '4',
    blindLabel: 'ترکیب ۴',
    revealedName: 'لیاروزول',
    revealedNote: 'مهارکننده 17α-هیدروکسیلاز / لایز',
    smiles: 'Clc1ccc(cc1)C(c2ccc3nc[nH]c3c2)n4ccnc4',
  },
  {
    id: '5',
    blindLabel: 'ترکیب ۵',
    revealedName: 'آبیراترون',
    revealedNote: 'مهارکننده 17α-هیدروکسیلاز / لایز',
    smiles: 'C[C@]12CC[C@H](O)CC1=CC[C@@H]3[C@@H]2CC[C@]4(C)[C@H]3CC=C4c5cccnc5',
  },
  {
    id: '6',
    blindLabel: 'ترکیب ۶',
    revealedName: 'انوبوسارم (SARM)',
    revealedNote: 'تعدیل‌کننده انتخابی گیرنده آندروژن',
    smiles: 'C[C@@](O)(COc1ccc(C#N)cc1)C(=O)Nc2ccc(C#N)c(C(F)(F)F)c2',
  },
  {
    id: '7',
    blindLabel: 'ترکیب ۷',
    revealedName: 'اوساترون استات',
    revealedNote: 'آنتی‌اندروژن استروئیدی',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C=C(Cl)C4=CC(=O)OC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '8',
    blindLabel: 'ترکیب ۸',
    revealedName: 'بیکالوتامید',
    revealedNote: 'آنتی‌اندروژن غیراستروئیدی',
    smiles: BICALUTAMIDE_SMILES,
  },
  {
    id: '9',
    blindLabel: 'ترکیب ۹',
    revealedName: 'دوتاستراید',
    revealedNote: 'مهارکننده ۵-آلفا ردوکتاز',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CC[C@@H]4NC(=O)C=C[C@]34C)[C@@H]1CC[C@@H]2C(=O)Nc5cc(C(F)(F)F)cc(C(F)(F)F)c5',
  },
  {
    id: '10',
    blindLabel: 'ترکیب ۱۰',
    revealedName: 'آندارین (SARM)',
    revealedNote: 'تعدیل‌کننده انتخابی گیرنده آندروژن',
    smiles: 'CC(=O)Nc1ccc(OC[C@](C)(O)C(=O)Nc2ccc([N+](=O)[O-])c(C(F)(F)F)c2)cc1',
  },
];

type AndrogenBucket =
  | 'steroid_antiandrogen'
  | 'non_steroid_antiandrogen'
  | 'five_alpha_reductase'
  | 'cyp17_inhibitor'
  | 'sarms';

export const AndrogenLab: React.FC<Props> = ({
  entryPotencySolved,
  metaboliteSolved,
  sarmSolved,
  androgenicitySolved,
  classificationSolved,
  enzymeComplexSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  const [entryOrder, setEntryOrder] = useState<string[]>(
    entryPotencySolved ? ['3', '2', '1', '4'] : INITIAL_ENTRY_ORDER
  );
  const entryTimer = usePuzzleTimer(true, entryPotencySolved);
  const [entryFeedback, setEntryFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  const [metabolite, setMetabolite] = useState<string>(
    metaboliteSolved ? '2-hydroxyflutamide' : ''
  );
  const metTimer = usePuzzleTimer(entryPotencySolved, metaboliteSolved);
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  const [sarmChoice, setSarmChoice] = useState(sarmSolved ? '10' : '');
  const sarmTimer = usePuzzleTimer(metaboliteSolved, sarmSolved);
  const [sarmFeedback, setSarmFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [sarmLoading, setSarmLoading] = useState(false);

  const [androgenicityMods, setAndrogenicityMods] = useState<string[]>(
    androgenicitySolved
      ? ['remove_androgenic_features', 'add_low_androgenic_features']
      : []
  );
  const androgenicityTimer = usePuzzleTimer(sarmSolved, androgenicitySolved);
  const [androgenicityFeedback, setAndrogenicityFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [androgenicityLoading, setAndrogenicityLoading] = useState(false);

  const [buckets, setBuckets] = useState<Record<AndrogenBucket, string[]>>(
    classificationSolved
      ? {
          steroid_antiandrogen: ['1', '7'],
          non_steroid_antiandrogen: ['2', '8'],
          five_alpha_reductase: ['3', '9'],
          cyp17_inhibitor: ['4', '5'],
          sarms: ['6', '10'],
        }
      : {
          steroid_antiandrogen: [],
          non_steroid_antiandrogen: [],
          five_alpha_reductase: [],
          cyp17_inhibitor: [],
          sarms: [],
        }
  );
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const classTimer = usePuzzleTimer(androgenicitySolved, classificationSolved);
  const [classFeedback, setClassFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  const [complexState, setComplexState] = useState({
    selected_inhibitors: enzymeComplexSolved ? ['3', '9'] : ([] as string[]),
    cofactor_complex: enzymeComplexSolved ? 'nadph_covalent_adduct' : '',
    pharmacophore: enzymeComplexSolved ? 'keto_enol_lactam' : '',
  });
  const compTimer = usePuzzleTimer(classificationSolved, enzymeComplexSolved);
  const [compFeedback, setCompFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [compLoading, setCompLoading] = useState(false);

  const shuffledFlutamide = useMemo(
    () => deterministicShuffle(FLUTAMIDE_CANDIDATES, 'and-flutamide-v3'),
    []
  );
  const shuffledSarms = useMemo(
    () =>
      deterministicShuffle(
        ANDROGEN_DRUGS.filter((d) => ['2', '6', '10'].includes(d.id)),
        'and-sarms-v3'
      ),
    []
  );
  const shuffledDrugs = useMemo(
    () => deterministicShuffle(ANDROGEN_DRUGS, 'and-all10-v3'),
    []
  );

  const moveEntryItem = (index: number, direction: -1 | 1) => {
    if (entryPotencySolved) return;
    const target = index + direction;
    if (target < 0 || target >= entryOrder.length) return;
    const next = [...entryOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setEntryOrder(next);
  };

  const handleEntrySubmit = async () => {
    setEntryLoading(true);
    setEntryFeedback(null);
    try {
      const elapsed = entryTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('androgen_entry_potency_sort', entryOrder, elapsed);
      setEntryFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setEntryFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setEntryLoading(false);
    }
  };

  const handleMetSubmit = async () => {
    if (!entryPotencySolved || !metabolite) return;
    setMetLoading(true);
    setMetFeedback(null);
    const elapsed = metTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('flutamide_metabolite', metabolite, elapsed);
      setMetFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setMetFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setMetLoading(false);
    }
  };

  const handleSarmSubmit = async () => {
    if (!metaboliteSolved || !sarmChoice) return;
    setSarmLoading(true);
    setSarmFeedback(null);
    try {
      const elapsed = sarmTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('sarm_alternative', sarmChoice, elapsed);
      setSarmFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setSarmFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setSarmLoading(false);
    }
  };

  const toggleAndrogenicityMod = (id: string) => {
    if (!sarmSolved || androgenicitySolved) return;
    setAndrogenicityMods((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAndrogenicitySubmit = async () => {
    if (!sarmSolved || !androgenicityMods.length) return;
    setAndrogenicityLoading(true);
    setAndrogenicityFeedback(null);
    try {
      const elapsed = androgenicityTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('low_androgenicity_design', androgenicityMods, elapsed);
      setAndrogenicityFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setAndrogenicityFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setAndrogenicityLoading(false);
    }
  };

  const assignToBucket = (bucket: AndrogenBucket, id: string) => {
    if (!androgenicitySolved || classificationSolved) return;
    setBuckets((prev) => {
      const next: Record<AndrogenBucket, string[]> = {
        steroid_antiandrogen: prev.steroid_antiandrogen.filter((x) => x !== id),
        non_steroid_antiandrogen: prev.non_steroid_antiandrogen.filter((x) => x !== id),
        five_alpha_reductase: prev.five_alpha_reductase.filter((x) => x !== id),
        cyp17_inhibitor: prev.cyp17_inhibitor.filter((x) => x !== id),
        sarms: prev.sarms.filter((x) => x !== id),
      };
      next[bucket] = [...next[bucket], id];
      return next;
    });
    setSelectedChip(null);
  };

  const removeFromBucket = (bucket: AndrogenBucket, id: string) => {
    if (!androgenicitySolved || classificationSolved) return;
    setBuckets((prev) => ({ ...prev, [bucket]: prev[bucket].filter((x) => x !== id) }));
  };

  const assignedCount = Object.values(buckets).flat().length;

  const handleClassSubmit = async () => {
    if (!androgenicitySolved || assignedCount < 10) return;
    setClassLoading(true);
    setClassFeedback(null);
    const elapsed = classTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('antiandrogen_classification', buckets, elapsed);
      setClassFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setClassFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setClassLoading(false);
    }
  };

  const toggleInhibitor = (id: string) => {
    if (!classificationSolved || enzymeComplexSolved) return;
    setComplexState((prev) => {
      const exists = prev.selected_inhibitors.includes(id);
      const next = exists
        ? prev.selected_inhibitors.filter((x) => x !== id)
        : [...prev.selected_inhibitors, id].sort();
      return { ...prev, selected_inhibitors: next };
    });
  };

  const handleComplexSubmit = async () => {
    if (
      !classificationSolved ||
      !complexState.selected_inhibitors.length ||
      !complexState.cofactor_complex ||
      !complexState.pharmacophore
    )
      return;
    setCompLoading(true);
    setCompFeedback(null);
    const elapsed = compTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('five_alpha_reductase_complex', complexState, elapsed);
      setCompFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setCompFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-lg">
            <Dna className="w-6 h-6" />
            <span>🧔 اتاق ریش و سیبیل — اتاق آقای زیگموند (آندروژن‌ها)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-6">
            آقای زیگموند (رفیق صمیمی و رقیب ارول) مبتلا به سرطان پروستاته و ارول بهش خیانت کرده! کمکش کن تا آخرین نامه ارول رو بهت بده...
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

      {/* گام ۱: ورود به اتاق با رتبه‌بندی ۴ ساختار */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(1)}: برای ورود به اتاق، ساختارها رو بر اساس قدرت مرتب کن
        </h3>
        <div className="space-y-3">
          {entryOrder.map((id, index) => {
            const item = ENTRY_POTENCY_ITEMS.find((x) => x.id === id)!;
            return (
              <div
                key={id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                    {toPersianDigits(index + 1)}
                  </div>
                  <div className="w-full sm:w-64">
                    <MoleculeStructureCard
                      smiles={item.smiles}
                      label={item.blindLabel}
                      revealed={entryPotencySolved}
                      revealedName={item.revealedName}
                      revealedNote={item.revealedNote}
                      compact
                    />
                  </div>
                </div>
                {!entryPotencySolved && (
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveEntryItem(index, -1)}
                      aria-label={`بالا بردن ساختار ${id}`}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === entryOrder.length - 1}
                      onClick={() => moveEntryItem(index, 1)}
                      aria-label={`پایین بردن ساختار ${id}`}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ProgressiveHintBox
          solved={entryPotencySolved}
          hints={[
            'ساختار ۳ (مشتق متیله بدون C19) بالاترین قدرت را دارد.',
            'حلقه پیرازول (ساختار ۲) قوی‌تر از 2-هیدروکسی‌متیلن (ساختار ۱) است و ترکیب فلوئوره (ساختار ۴) کمترین قدرت را دارد.',
          ]}
        />

        {entryFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              entryFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {entryFeedback.text}
          </div>
        )}
        {!entryPotencySolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={entryLoading}
              onClick={handleEntrySubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {entryLoading ? 'در حال بررسی...' : 'باز کردن در اتاق زیگموند'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۲: آزمایش PSA بالا و متابولیت ماژور فلوتامید */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          entryPotencySolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(2)}: متابولیت ماژور و فعال داروی فلوتامید
        </h3>
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/20 p-3.5 text-xs leading-7 text-slate-700 dark:text-slate-200">
          آقای زیگموند غمگین نشسته؛ توی آزمایشش <strong>تستوسترون، آندروستندیون و PSA خیلی بالاست</strong>. توی دستش فلوتامید رو می‌بینی و می‌گه: <em>«ارول گفته متابولیت ماژور و موثر اینو مصرف کنم ولی PSA هنوز بالاست... کدوم ساختار متابولیت فعالشه؟»</em>
        </div>

        <div className="max-w-xs">
          <MoleculeStructureCard
            smiles={FLUTAMIDE_PARENT_SMILES}
            label="داروی دست زیگموند: فلوتامید"
            compact
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shuffledFlutamide.map((opt) => (
            <div
              key={opt.id}
              onClick={() => !metaboliteSolved && setMetabolite(opt.id)}
              className={`rounded-xl cursor-pointer transition ${
                metabolite === opt.id
                  ? 'ring-2 ring-cyan-500 shadow-md'
                  : 'hover:ring-1 hover:ring-cyan-400/60'
              }`}
            >
              <MoleculeStructureCard
                smiles={opt.smiles}
                label={opt.blindLabel}
                revealed={metaboliteSolved}
                revealedName={opt.revealedName}
                revealedNote={opt.revealedNote}
                compact
              />
            </div>
          ))}
        </div>

        {metFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              metFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {metFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{metFeedback.text}</span>
          </div>
        )}

        {!metaboliteSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={metLoading || !metabolite}
              onClick={handleMetSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {metLoading ? 'در حال بررسی...' : 'تایید متابولیت فعال'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۳: پیشنهاد SARM از داربست بیکالوتامید */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          metaboliteSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(3)}: پیشنهاد یک SARM بهتر به‌جای بیکالوتامید
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          ساختار قبلی دو تا مشکل داره: ۱) باید چند بار در روز مصرف بشه، ۲) PSA زیگموند همچنان بالاست. از روی ساختار بیکالوتامید، کدوم ترکیب زیر یه <strong>SARM</strong> با اثر قوی‌تر و خطر متابولیسم کمتره؟
        </p>

        <div className="max-w-xs">
          <MoleculeStructureCard smiles={BICALUTAMIDE_SMILES} label="ساختار مرجع: بیکالوتامید" compact />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shuffledSarms.map((cand) => (
            <div
              key={cand.id}
              onClick={() => metaboliteSolved && !sarmSolved && setSarmChoice(cand.id)}
              className={`rounded-xl cursor-pointer transition ${
                sarmChoice === cand.id
                  ? 'ring-2 ring-cyan-500 shadow-md'
                  : 'hover:ring-1 hover:ring-cyan-400/60'
              }`}
            >
              <MoleculeStructureCard
                smiles={cand.smiles}
                label={cand.blindLabel}
                revealed={sarmSolved}
                revealedName={cand.revealedName}
                revealedNote={cand.revealedNote}
                compact
              />
            </div>
          ))}
        </div>
        {sarmFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              sarmFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {sarmFeedback.text}
          </div>
        )}
        {!sarmSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!metaboliteSolved || sarmLoading || !sarmChoice}
              onClick={handleSarmSubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {sarmLoading ? 'در حال بررسی...' : 'ثبت انتخاب SARM'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۴: کمک زیگموند — کمینه‌کردن آندروژنیسیته */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          sarmSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(4)}: راز زیگموند درباره کمینه‌کردن آندروژنیسیته
        </h3>
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/20 p-3.5 text-xs leading-7 text-slate-700 dark:text-slate-200">
          <strong>🧔 آقای زیگموند:</strong> <em>«ارول اهریمن رو با کمترین آندروژنیسیته می‌سازه؛ اون قسمتایی که خواص آندروژنی می‌دن رو باید حذف کنی و قسمتایی که آندروژنیسیته رو کم می‌کنن اضافه کنی.»</em>
        </div>
        <div className="space-y-2">
          {ANDROGENICITY_OPTIONS.map((modification) => {
            const active = androgenicityMods.includes(modification.id);
            return (
              <button
                key={modification.id}
                type="button"
                disabled={!sarmSolved || androgenicitySolved}
                aria-pressed={active}
                onClick={() => toggleAndrogenicityMod(modification.id)}
                className={`w-full rounded-xl border p-3.5 text-right text-xs sm:text-sm transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-100 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] text-slate-700 dark:text-slate-300'
                }`}
              >
                {modification.label}
              </button>
            );
          })}
        </div>
        {androgenicityFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              androgenicityFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {androgenicityFeedback.text}
          </div>
        )}
        {!androgenicitySolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!sarmSolved || androgenicityLoading || !androgenicityMods.length}
              onClick={handleAndrogenicitySubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {androgenicityLoading ? 'در حال بررسی...' : 'تایید اصلاحات آندروژنیسیته'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۵: آخرین نامه ارول — دسته‌بندی ۱۰ ساختار با ترتیب تصادفی */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          androgenicitySolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            گام {toPersianDigits(5)}: آخرین نامه ارول — جداسازی {toPersianDigits(10)} ساختار در {toPersianDigits(5)} دسته
          </h3>
          {!classificationSolved && assignedCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setBuckets({
                  steroid_antiandrogen: [],
                  non_steroid_antiandrogen: [],
                  five_alpha_reductase: [],
                  cyp17_inhibitor: [],
                  sarms: [],
                })
              }
              disabled={!androgenicitySolved}
              className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> پاکسازی
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          ارول توی آخرین نامه‌اش از زیگموند خواسته این {toPersianDigits(10)} ساختار رو بر اساس دسته‌هاشون جدا کنه و حواسش به ساختارهای مهارکننده ۵-آلفا ردوکتاز باشه:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {shuffledDrugs
            .filter((d) => !Object.values(buckets).flat().includes(d.id))
            .map((drug) => (
              <div
                key={drug.id}
                draggable={androgenicitySolved && !classificationSolved}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', drug.id)}
                onClick={() => {
                  if (!androgenicitySolved || classificationSolved) return;
                  setSelectedChip(selectedChip === drug.id ? null : drug.id);
                }}
                className={`rounded-xl cursor-pointer transition ${
                  selectedChip === drug.id
                    ? 'ring-2 ring-cyan-500 shadow-md'
                    : 'hover:ring-1 hover:ring-cyan-400/60'
                }`}
              >
                <MoleculeStructureCard
                  smiles={drug.smiles}
                  label={drug.blindLabel}
                  revealed={classificationSolved}
                  revealedName={drug.revealedName}
                  revealedNote={drug.revealedNote}
                  compact
                />
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {(
            [
              { key: 'steroid_antiandrogen', title: 'Steroid Antiandrogens' },
              { key: 'non_steroid_antiandrogen', title: 'Non-Steroid Antiandrogens' },
              { key: 'five_alpha_reductase', title: '5α-Reductase Inhibitors' },
              { key: 'cyp17_inhibitor', title: '17α-Hydroxylase / Lyase' },
              { key: 'sarms', title: 'SARMs' },
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
              onClick={() => selectedChip && assignToBucket(b.key, selectedChip)}
              className="min-h-[140px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 bg-slate-100/70 dark:bg-slate-950/70 p-3 space-y-2"
            >
              <div dir="ltr" className="text-[11px] font-bold text-cyan-700 dark:text-cyan-300 text-center">
                {b.title}
              </div>
              {buckets[b.key].map((id) => {
                const item = ANDROGEN_DRUGS.find((x) => x.id === id)!;
                return (
                  <div
                    key={id}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromBucket(b.key, id);
                    }}
                    className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-100 cursor-pointer space-y-0.5"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>
                        {item.blindLabel}
                        {classificationSolved ? ` — ${item.revealedName}` : ''}
                      </span>
                      {!classificationSolved && <span className="text-rose-500">×</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={classificationSolved}
          disabled={!androgenicitySolved}
          hints={[
            'مهارکننده‌های ۵-آلفا ردوکتاز (۳ و ۹) حلقه A لاکتامی (NH-C=O) دارند؛ مهارکننده‌های CYP17 (۴ و ۵) حلقه ایمیدازول یا پیریدین دارند.',
            'SARMها (۶ و ۱۰) پل اتری (-O-) دارند و آنتی‌آندروژن‌های غیراستروئیدی (۲ و ۸) ایمیدازولیدین‌دیون یا پل سولفونیل (-SO2-) دارند.',
          ]}
        />

        {classFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              classFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {classFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{classFeedback.text}</span>
          </div>
        )}

        {!classificationSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!androgenicitySolved || classLoading || assignedCount < 10}
              onClick={handleClassSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {classLoading ? 'در حال بررسی...' : `تایید دسته‌بندی ${toPersianDigits(10)} ترکیب`}
            </button>
          </div>
        )}
      </div>

      {/* گام ۶: قرار دادن مهارکننده ۵-آلفا ردوکتاز داخل سایت فعال آنزیم */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          classificationSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-500" />
          <span>گام {toPersianDigits(6)}: قرار دادن مهارکننده‌های ۵-آلفا ردوکتاز داخل سایت فعال آنزیم</span>
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          ببین کدوم قسمت از ساختار مهارکننده‌های ۵-آلفا ردوکتاز با کوفاکتور آنزیم وارد واکنش می‌شه و برای ارول مهم بوده:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۱. شماره مهارکننده‌های ۵-آلفا ردوکتاز:</div>
            <div className="flex flex-wrap gap-2">
              {['8', '1', '9', '6', '3'].map((num) => {
                const active = complexState.selected_inhibitors.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={!classificationSolved || enzymeComplexSolved}
                    onClick={() => toggleInhibitor(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      active
                        ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ترکیب {toPersianDigits(num)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۲. مکانیسم مهار در سایت فعال:</div>
            <select
              disabled={!classificationSolved || enzymeComplexSolved}
              value={complexState.cofactor_complex}
              onChange={(e) => setComplexState((p) => ({ ...p, cofactor_complex: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">انتخاب مکانیسم...</option>
              {COFACTOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۳. بخش کلیدی حلقه A در اهریمن:</div>
            <select
              disabled={!classificationSolved || enzymeComplexSolved}
              value={complexState.pharmacophore}
              onChange={(e) => setComplexState((p) => ({ ...p, pharmacophore: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">انتخاب بخش کلیدی...</option>
              {PHARMACOPHORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {compFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              compFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {compFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{compFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {enzymeComplexSolved ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ پنجم (کتو-انول مهار ۵-آلفا ردوکتاز) و بازگشت ←
            </button>
          ) : (
            <button
              type="button"
              disabled={
                compLoading ||
                !classificationSolved ||
                !complexState.selected_inhibitors.length ||
                !complexState.cofactor_complex ||
                !complexState.pharmacophore
              }
              onClick={handleComplexSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {compLoading ? 'در حال ثبت...' : 'تایید کمپلکس و کشف آخرین سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
