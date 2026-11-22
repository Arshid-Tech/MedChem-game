import React, { useEffect, useMemo, useState } from 'react';
import {
  Atom,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Siren,
} from 'lucide-react';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { SteroidSandbox } from '../molecules/SteroidSandbox';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { deterministicShuffle } from '../../utils/shuffle';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  metabolismSolved: boolean;
  dockingSolved: boolean;
  oralDesignSolved: boolean;
  potencySolved: boolean;
  metaboliteSolved: boolean;
  classificationSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

const ENZYME_OPTIONS = deterministicShuffle(
  ['Estradiol dehydrogenase', '16a-hydroxylase', 'Aromatase (CYP19)', '5a-reductase'],
  'est-enzymes-v3'
);

const ESTROGEN_STRUCTURES = [
  {
    id: '1',
    blindLabel: 'ساختار ۱',
    revealedName: 'استرادیول (Estradiol - E2)',
    revealedNote: 'دارای 3-OH فنولی و 17β-OH',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1CC[C@@H]2O',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'استرون (Estrone - E1)',
    revealedNote: 'دارای کتون C17=O',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1CCC2=O',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'استریول (Estriol - E3)',
    revealedNote: 'دارای هیدروکسیل 16α و 17β',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1C[C@@H](O)[C@@H]2O',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: '16α-هیدروکسی‌استرون',
    revealedNote: 'دارای کتون C17=O و هیدروکسیل 16α',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1C[C@@H](O)C2=O',
  },
];

const POTENCY_COMPOUNDS = [
  {
    id: '1',
    blindLabel: 'ترکیب ۱',
    revealedName: '17β-استرادیول',
    revealedNote: 'استروژن طبیعی مرجع',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1CC[C@@H]2O',
  },
  {
    id: '2',
    blindLabel: 'ترکیب ۲',
    revealedName: 'اتینیل استرادیول',
    revealedNote: 'مشتق خوراکی با قدرت هم‌تراز استرادیول',
    smiles: 'C#C[C@]1(O)CC[C@H]2[C@@H]3CCc4cc(O)ccc4[C@H]3CC[C@@]12C',
  },
  {
    id: '3',
    blindLabel: 'ترکیب ۳',
    revealedName: 'دی‌اتیل‌استیل‌بسترول (DES)',
    revealedNote: 'آگونیست غیراستروئیدی ترانس با بالاترین قدرت اثر',
    smiles: 'CC/C(=C(/CC)c1ccc(O)cc1)c2ccc(O)cc2',
  },
  {
    id: '4',
    blindLabel: 'ترکیب ۴',
    revealedName: 'استریول',
    revealedNote: 'متابولیت قطبی با کمترین قدرت اثر',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CCc4cc(O)ccc34)[C@@H]1C[C@@H](O)[C@@H]2O',
  },
];

const INITIAL_POTENCY_ORDER = deterministicShuffle(['1', '2', '3', '4'], 'est-potency-v3');

const METABOLITE_OPTIONS = deterministicShuffle(
  [
    { id: 'promote_active_metabolite', label: 'افزایش تبدیل دارو به متابولیت فعال' },
    { id: 'increase_parent_exposure', label: 'افزایش تماس با داروی اولیه بدون تغییر مسیر متابولیک' },
    { id: 'prevent_active_metabolite', label: 'اصلاح ساختار برای جلوگیری از تشکیل متابولیت فعال سرطان‌زا' },
  ],
  'est-met-path-v3'
);

const DRUG_CLASS_FIELDS = [
  { key: 'serm', blindTitle: '۱) تعدیل‌کننده انتخابی گیرنده استروژن (SERM)', revealedTitle: '۱) SERM — رالوکسیفن' },
  { key: 'pure_antiestrogen', blindTitle: '۲) آنتی‌استروژن خالص (Pure Antiestrogen)', revealedTitle: '۲) آنتی‌استروژن خالص — فولوسترانت' },
  { key: 'steroid_aromatase_inhibitor', blindTitle: '۳) مهارکننده استروئیدی آروماتاز', revealedTitle: '۳) مهارکننده استروئیدی آروماتاز — اگزمستان' },
  { key: 'non_steroid_aromatase_inhibitor', blindTitle: '۴) مهارکننده غیراستروئیدی آروماتاز', revealedTitle: '۴) مهارکننده غیراستروئیدی آروماتاز — لتروزول' },
] as const;

const DRUG_CLASS_STRUCTURES = [
  {
    id: 'A',
    blindLabel: 'ساختار A',
    revealedName: 'اگزمستان (Exemestane)',
    revealedNote: 'مهارکننده استروئیدی آروماتاز',
    smiles: 'C[C@]12CCC(=O)C=C1C(=C)C[C@@H]3[C@@H]2CC[C@]4(C)[C@H]3CCC4=O',
  },
  {
    id: 'B',
    blindLabel: 'ساختار B',
    revealedName: 'رالوکسیفن (Raloxifene)',
    revealedNote: 'تعدیل‌کننده انتخابی گیرنده استروژن (SERM)',
    smiles: 'Oc1ccc(cc1)c2sc3cc(O)ccc3c2C(=O)c4ccc(OCCN5CCCCC5)cc4',
  },
  {
    id: 'C',
    blindLabel: 'ساختار C',
    revealedName: 'فولوسترانت (Fulvestrant)',
    revealedNote: 'آنتی‌استروژن خالص با زنجیره بلند C7α',
    smiles: 'C[C@]12CC[C@H]3[C@@H]([C@@H](CCCCCCCCC[S](=O)CCCC(F)(F)C(F)(F)F)Cc4cc(O)ccc34)[C@@H]1CC[C@@H]2O',
  },
  {
    id: 'D',
    blindLabel: 'ساختار D',
    revealedName: 'لتروزول (Letrozole)',
    revealedNote: 'مهارکننده غیراستروئیدی آروماتاز دارای سیانید (-C≡N)',
    smiles: 'N#Cc1ccc(cc1)C(c2ccc(C#N)cc2)n3cncn3',
  },
];

export const EstrogenLab: React.FC<Props> = ({
  metabolismSolved,
  dockingSolved,
  oralDesignSolved,
  potencySolved,
  metaboliteSolved,
  classificationSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  const [enzymes, setEnzymes] = useState({
    top_horizontal: metabolismSolved ? 'Estradiol dehydrogenase' : '',
    bottom_horizontal: metabolismSolved ? 'Estradiol dehydrogenase' : '',
    left_vertical: metabolismSolved ? '16a-hydroxylase' : '',
    right_vertical: metabolismSolved ? '16a-hydroxylase' : '',
  });
  const [structurePositions, setStructurePositions] = useState({
    estradiol: metabolismSolved ? '1' : '',
    estrone: metabolismSolved ? '2' : '',
    estriol: metabolismSolved ? '3' : '',
    hydroxyestrone: metabolismSolved ? '4' : '',
  });
  const metTimer = usePuzzleTimer(true, metabolismSolved);
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  const [oralMods, setOralMods] = useState<string[]>(
    oralDesignSolved ? ['add_17alpha_ethynyl', 'methylate_3_hydroxyl'] : []
  );
  const oralTimer = usePuzzleTimer(metabolismSolved, oralDesignSolved);
  const [oralFeedback, setOralFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [oralLoading, setOralLoading] = useState(false);

  const [potencyOrder, setPotencyOrder] = useState<string[]>(
    potencySolved ? ['3', '1', '2', '4'] : INITIAL_POTENCY_ORDER
  );
  const potencyTimer = usePuzzleTimer(oralDesignSolved, potencySolved);
  const [potencyFeedback, setPotencyFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [potencyLoading, setPotencyLoading] = useState(false);

  const [angle, setAngle] = useState<number>(dockingSolved ? 180 : 0);
  const [hasRotated, setHasRotated] = useState(dockingSolved);
  const [escapeSeconds, setEscapeSeconds] = useState(10);
  const [escapeStarted, setEscapeStarted] = useState(false);
  const dockTimer = usePuzzleTimer(potencySolved, dockingSolved);
  const [dockFeedback, setDockFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [dockLoading, setDockLoading] = useState(false);

  const [metabolitePath, setMetabolitePath] = useState(
    metaboliteSolved ? 'prevent_active_metabolite' : ''
  );
  const metaboliteTimer = usePuzzleTimer(dockingSolved, metaboliteSolved);
  const [metaboliteFeedback, setMetaboliteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metaboliteLoading, setMetaboliteLoading] = useState(false);

  const [classifications, setClassifications] = useState({
    serm: classificationSolved ? 'B' : '',
    pure_antiestrogen: classificationSolved ? 'C' : '',
    steroid_aromatase_inhibitor: classificationSolved ? 'A' : '',
    non_steroid_aromatase_inhibitor: classificationSolved ? 'D' : '',
  });
  const classificationTimer = usePuzzleTimer(metaboliteSolved, classificationSolved);
  const [classificationFeedback, setClassificationFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [classificationLoading, setClassificationLoading] = useState(false);

  const shuffledMetStructures = useMemo(
    () => deterministicShuffle(ESTROGEN_STRUCTURES, 'est-met-cards-v3'),
    []
  );
  const shuffledDrugStructures = useMemo(
    () => deterministicShuffle(DRUG_CLASS_STRUCTURES, 'est-class-cards-v3'),
    []
  );

  useEffect(() => {
    if (!escapeStarted || dockingSolved) return;
    const timer = window.setInterval(() => {
      setEscapeSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [escapeStarted, dockingSolved]);

  const handleMetSubmit = async () => {
    if (
      metabolismSolved ||
      Object.values(enzymes).some((value) => !value) ||
      Object.values(structurePositions).some((value) => !value)
    )
      return;
    setMetLoading(true);
    setMetFeedback(null);
    const elapsed = metTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle(
        'metabolism_enzymes',
        { ...enzymes, structure_positions: structurePositions },
        elapsed
      );
      setMetFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setMetFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setMetLoading(false);
    }
  };

  const handleOralSubmit = async () => {
    if (!metabolismSolved || !oralMods.length) return;
    setOralLoading(true);
    setOralFeedback(null);
    try {
      const elapsed = oralTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('oral_long_acting_design', oralMods, elapsed);
      setOralFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setOralFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setOralLoading(false);
    }
  };

  const movePotencyItem = (index: number, direction: -1 | 1) => {
    if (!oralDesignSolved || potencySolved) return;
    const target = index + direction;
    if (target < 0 || target >= potencyOrder.length) return;
    const next = [...potencyOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setPotencyOrder(next);
  };

  const handlePotencySubmit = async () => {
    if (!oralDesignSolved) return;
    setPotencyLoading(true);
    setPotencyFeedback(null);
    try {
      const elapsed = potencyTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('estrogen_potency_sort', potencyOrder, elapsed);
      setPotencyFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setPotencyFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setPotencyLoading(false);
    }
  };

  const handleDockSubmit = async () => {
    if (!potencySolved || !hasRotated || escapeSeconds === 0) return;
    setDockLoading(true);
    setDockFeedback(null);
    const elapsed = dockTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle(
        'receptor_docking_and_class',
        { rotation_angle: angle % 360 },
        elapsed
      );
      setDockFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setDockFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setDockLoading(false);
    }
  };

  const handleMetaboliteSubmit = async () => {
    if (!dockingSolved || !metabolitePath) return;
    setMetaboliteLoading(true);
    setMetaboliteFeedback(null);
    try {
      const elapsed = metaboliteTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('active_metabolite_prevention', metabolitePath, elapsed);
      setMetaboliteFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setMetaboliteFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setMetaboliteLoading(false);
    }
  };

  const handleClassificationSubmit = async () => {
    if (!metaboliteSolved || Object.values(classifications).some((value) => !value)) return;
    setClassificationLoading(true);
    setClassificationFeedback(null);
    try {
      const elapsed = classificationTimer.consumeElapsedSeconds();
      const res = await onSubmitPuzzle('estrogen_drug_classification', classifications, elapsed);
      setClassificationFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setClassificationFeedback({
        ok: false,
        text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.',
      });
    } finally {
      setClassificationLoading(false);
    }
  };

  const isAligned = angle % 360 === 180;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-lg">
            <Atom className="w-6 h-6" />
            <span>🍯 اتاق ماه عسل — آزمایشگاه آقا و خانم لارنس (استروژن‌ها)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-6">
            آقا و خانم لارنس یک ساله داخل آزمایشگاه حیوانات روی تولید یه استروژن «فول‌شارژ» کار می‌کنن. حواست باشه توی دامشون نیفتی!
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

      {/* گام ۱: ورود به اتاق با جانمایی ساختارها و آنزیم‌ها */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(1)}: برای ورود به اتاق، ساختارها و آنزیم‌های متابولیسم رو جای درستشون بذار
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shuffledMetStructures.map((st) => (
            <MoleculeStructureCard
              key={st.id}
              smiles={st.smiles}
              label={st.blindLabel}
              revealed={metabolismSolved}
              revealedName={st.revealedName}
              revealedNote={st.revealedNote}
              compact
            />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['estradiol', 'استرادیول (Estradiol)'],
              ['estrone', 'استرون (Estrone)'],
              ['estriol', 'استریول (Estriol)'],
              ['hydroxyestrone', '16α-هیدروکسی‌استرون'],
            ].map(([molecule, label]) => (
              <label key={molecule} className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-semibold block">کدام ساختار مربوط به {label} است؟</span>
                <select
                  required
                  disabled={metabolismSolved}
                  value={structurePositions[molecule as keyof typeof structurePositions]}
                  onChange={(event) =>
                    setStructurePositions((previous) => ({
                      ...previous,
                      [molecule]: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="">انتخاب شماره ساختار...</option>
                  {shuffledMetStructures.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.blindLabel}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-50/70 dark:bg-cyan-950/30 p-3">
              <div className="font-bold text-cyan-800 dark:text-cyan-300 text-sm">استرادیول</div>
            </div>
            <div>
              <label className="block text-[11px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
                آنزیم تبدیل برگشت‌پذیر استرادیول ⇄ استرون
              </label>
              <select
                disabled={metabolismSolved}
                value={enzymes.top_horizontal}
                onChange={(e) => setEnzymes((p) => ({ ...p, top_horizontal: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-purple-500/40 bg-purple-50/70 dark:bg-purple-950/30 p-3">
              <div className="font-bold text-purple-800 dark:text-purple-300 text-sm">استرون</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div>
              <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                آنزیم مسیر استرادیول → استریول
              </label>
              <select
                disabled={metabolismSolved}
                value={enzymes.left_vertical}
                onChange={(e) => setEnzymes((p) => ({ ...p, left_vertical: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 font-mono">↓ مسیر تبدیل عمودی ↓</div>
            <div>
              <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                آنزیم مسیر استرون → 16α-هیدروکسی‌استرون
              </label>
              <select
                disabled={metabolismSolved}
                value={enzymes.right_vertical}
                onChange={(e) => setEnzymes((p) => ({ ...p, right_vertical: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">استریول</div>
            </div>
            <div>
              <label className="block text-[11px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
                آنزیم تبدیل استریول ⇄ 16α-هیدروکسی‌استرون
              </label>
              <select
                disabled={metabolismSolved}
                value={enzymes.bottom_horizontal}
                onChange={(e) => setEnzymes((p) => ({ ...p, bottom_horizontal: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30 p-3">
              <div className="font-bold text-amber-800 dark:text-amber-300 text-sm">16α-هیدروکسی‌استرون</div>
            </div>
          </div>
        </div>

        <ProgressiveHintBox
          solved={metabolismSolved}
          hints={[
            'پسوند -diol یعنی دو گروه OH (ساختار ۱)، -one یعنی کتون C17=O (ساختار ۲) و -triol یعنی سه گروه OH (ساختار ۳).',
            'تبدیل الکل و کتون C17 با Estradiol dehydrogenase و افزودن OH روی کربن ۱۶ با 16a-hydroxylase انجام می‌شود.',
          ]}
        />

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

        {!metabolismSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={
                metLoading ||
                Object.values(enzymes).some((value) => !value) ||
                Object.values(structurePositions).some((value) => !value)
              }
              onClick={handleMetSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {metLoading ? 'در حال بررسی...' : 'تایید و ورود به اتاق ماه عسل'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۲: قفسه موش‌ها — ساخت فرم خوراکی و طولانی‌اثر با میز کار جامع */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          metabolismSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(2)}: قفسه موش‌ها — فرم خوراکی و طولانی‌اثر استروژن رو بساز
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          به محض ورود چشمت به قفسه موش‌ها می‌افته که دارن یه دارویی می‌خورن؛ اما برای رد گم‌کنی، ماده‌ای که روی ویال کشیدن اصلاً خوراکی نیست! با جعبه‌ابزار آزاد، فرم <strong>خوراکی و طولانی‌اثرش</strong> رو بساز:
        </p>

        <SteroidSandbox
          mode="estrogen_oral"
          disabled={!metabolismSolved}
          solved={oralDesignSolved}
          onTokensChange={setOralMods}
        />

        {oralFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              oralFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {oralFeedback.text}
          </div>
        )}
        {!oralDesignSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!metabolismSolved || oralLoading || oralMods.length === 0}
              onClick={handleOralSubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {oralLoading ? 'در حال بررسی...' : 'ثبت ساختار ساخته‌شده'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۳: قفل کامپیوتر لارنس‌ها */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          oralDesignSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(3)}: رمز کامپیوتر قفل‌شده — این ۴ مولکول رو بر اساس قدرت مرتب کن
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          از قوی‌ترین (بالا) به ضعیف‌ترین (پایین) مرتب کن تا قفل کامپیوترشون باز بشه (دو ترکیب قدرت برابر دارند):
        </p>
        <div className="space-y-3">
          {potencyOrder.map((id, index) => {
            const item = POTENCY_COMPOUNDS.find((c) => c.id === id)!;
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
                      revealed={potencySolved}
                      revealedName={item.revealedName}
                      revealedNote={item.revealedNote}
                      compact
                    />
                  </div>
                </div>
                {!potencySolved && (
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={!oralDesignSolved || index === 0}
                      onClick={() => movePotencyItem(index, -1)}
                      aria-label={`بالا بردن ترکیب ${id}`}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={!oralDesignSolved || index === potencyOrder.length - 1}
                      onClick={() => movePotencyItem(index, 1)}
                      aria-label={`پایین بردن ترکیب ${id}`}
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
          solved={potencySolved}
          disabled={!oralDesignSolved}
          hints={[
            'ترکیب غیراستروئیدی ترانس با دو حلقه فنولی بیشترین قدرت اتصال به گیرنده را دارد.',
            'ترکیب دارای ۳ گروه OH (استریول) ضعیف‌ترین است و ترکیب ۱ و ۲ هم‌ترازند.',
          ]}
        />

        {potencyFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              potencyFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {potencyFeedback.text}
          </div>
        )}
        {!potencySolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!oralDesignSolved || potencyLoading}
              onClick={handlePotencySubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {potencyLoading ? 'در حال بررسی...' : 'باز کردن قفل کامپیوتر'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۴: لو رفتن توسط خانم لارنس + ۱۰ ثانیه فرار */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          potencySolved
            ? 'border-rose-500/40 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="rounded-xl border border-rose-500/40 bg-rose-50/80 dark:bg-rose-950/30 p-4 flex items-start gap-3">
          <Siren className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs sm:text-sm leading-6 text-rose-900 dark:text-rose-200">
            <strong>اوه اوهههه! خانم لارنس بالا سر کامپیوترش دیدت — لو رفتی!</strong>
            <br />
            فقط <strong>{toPersianDigits(10)} ثانیه</strong> وقت داری ساختار رو داخل رسپتور بچرخونی و قفل در رو باز کنی تا فرار کنی!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 rounded-2xl border border-slate-700 bg-[#07111f] p-4 flex flex-col items-center">
            <div dir="ltr" className="w-full flex justify-center">
              <svg viewBox="0 0 320 220" className="w-full max-w-[320px] h-52">
                <rect x="12" y="130" width="76" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" />
                <text x="22" y="148" fill="#38bdf8" fontSize="11" fontWeight="bold">Glu 353 (COO⁻)</text>

                <rect x="115" y="182" width="90" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" />
                <text x="125" y="200" fill="#38bdf8" fontSize="11" fontWeight="bold">Arg 394 (NH₂⁺)</text>

                <rect x="225" y="25" width="82" height="28" rx="6" fill="#1e293b" stroke="#c084fc" />
                <text x="235" y="43" fill="#c084fc" fontSize="11" fontWeight="bold">His 524 (N-H)</text>

                {isAligned && (
                  <>
                    <line x1="88" y1="142" x2="115" y2="132" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                    <line x1="150" y1="182" x2="140" y2="152" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                    <line x1="225" y1="45" x2="198" y2="75" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                  </>
                )}

                <g transform={`rotate(${angle} 160 110)`}>
                  <line x1="145" y1="110" x2="175" y2="110" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="145" y1="115" x2="175" y2="115" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="115,95 135,95 145,112 135,130 115,130 105,112" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="80" y="116" fill="#f87171" fontSize="11" fontWeight="bold">HO</text>
                  <polygon points="185,95 205,95 215,112 205,130 185,130 175,112" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="219" y="116" fill="#f87171" fontSize="11" fontWeight="bold">OH</text>
                </g>
              </svg>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                disabled={!potencySolved || dockingSolved || escapeSeconds === 0}
                onClick={() => {
                  setAngle((a) => (a + 45) % 360);
                  setHasRotated(true);
                  setEscapeStarted(true);
                }}
                className="rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/70 disabled:opacity-40 px-4 py-2 text-xs font-bold text-cyan-200 flex items-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" /> چرخش {toPersianDigits(45)} درجه ({toPersianDigits(angle)}°)
              </button>
              <span className={`text-xs font-bold ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAligned ? 'هم‌تراز شد ✓' : 'بچرخون...'}
              </span>
            </div>
            <div className="mt-3 text-xs text-rose-300" role="status" aria-live="polite">
              {escapeSeconds > 0
                ? `مهلت فرار: ${toPersianDigits(escapeSeconds)} ثانیه`
                : 'مهلت تمام شد! روی دکمه زیر بزن و دوباره سریع بچرخون.'}
            </div>
            {potencySolved && escapeSeconds === 0 && !dockingSolved && (
              <button
                type="button"
                onClick={() => {
                  setAngle(0);
                  setHasRotated(false);
                  setEscapeSeconds(10);
                  setEscapeStarted(false);
                }}
                className="mt-2 rounded-lg border border-rose-500/40 px-3 py-2 text-xs font-bold text-rose-200"
              >
                تلاش دوباره ({toPersianDigits(10)} ثانیه)
              </button>
            )}
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs leading-7 text-slate-600 dark:text-slate-300">
              ساختار رو بچرخون تا دو طرفش با Glu 353، Arg 394 و His 524 پیوند هیدروژنی بده!
            </div>
            {dockingSolved && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/25 p-4 text-xs leading-7 text-amber-900 dark:text-amber-200">
                <strong>پیچش داستانی!</strong> با اینکه درست وصل کردی، متاسفانه رمز خروج رو عوض کردن و گیر افتادی... اما نگران نباش، خانم لارنس حرف مهمی باهات داره!
              </div>
            )}
          </div>
        </div>

        {dockFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              dockFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {dockFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{dockFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {!dockingSolved && (
            <button
              type="button"
              disabled={!potencySolved || dockLoading || !hasRotated || escapeSeconds === 0}
              onClick={handleDockSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {dockLoading ? 'در حال ثبت...' : 'ثبت اتصال و تلاش برای فرار'}
            </button>
          )}
        </div>
      </div>

      {/* گام ۵: معامله با خانم لارنس */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          dockingSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(5)}: گفت‌وگو با خانم لارنس
        </h3>
        <div className="rounded-xl border border-pink-500/30 bg-pink-50/70 dark:bg-pink-950/20 p-3.5 text-xs leading-7 text-slate-700 dark:text-slate-200">
          <strong>🔬 خانم لارنس:</strong> <em>«که اومدی اینجا جاسوسی کنی! باشه، من بهت کمک می‌کنم؛ چون ارول یه دارویی به من داد بخورم و باعث شد به سرطان مبتلا بشم... کمکم کن طوری تغییرش بدیم که به متابولیت فعالش تبدیل نشه.»</em>
        </div>
        <div className="space-y-2">
          {METABOLITE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={!dockingSolved || metaboliteSolved}
              onClick={() => setMetabolitePath(opt.id)}
              className={`w-full text-right rounded-xl border p-3.5 text-xs sm:text-sm transition ${
                metabolitePath === opt.id
                  ? 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-100 font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] text-slate-700 dark:text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {metaboliteFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              metaboliteFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {metaboliteFeedback.text}
          </div>
        )}
        {!metaboliteSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={!dockingSolved || metaboliteLoading || !metabolitePath}
              onClick={handleMetaboliteSubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {metaboliteLoading ? 'در حال بررسی...' : 'کمک به خانم لارنس'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۶: پاداش خانم لارنس و کشف سرنخ سیانید */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          metaboliteSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          گام {toPersianDigits(6)}: وصل کردن ساختارها به دسته دارویی (پاداش خانم لارنس)
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          <strong>🔬 خانم لارنس:</strong> <em>«دستت درد نکنه که کمکم کردی! منم در ازای لطفت بهت می‌گم این ساختارها رو به دسته داروییشون وصل کن و اونی که مربوط به مورد ۴ هست رو خوب یادت باشه...»</em>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shuffledDrugStructures.map((st) => (
            <MoleculeStructureCard
              key={st.id}
              smiles={st.smiles}
              label={st.blindLabel}
              revealed={classificationSolved}
              revealedName={st.revealedName}
              revealedNote={st.revealedNote}
              compact
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DRUG_CLASS_FIELDS.map((field) => (
            <label key={field.key} className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">
                {classificationSolved ? field.revealedTitle : field.blindTitle}
              </span>
              <select
                required
                disabled={!metaboliteSolved || classificationSolved}
                value={classifications[field.key]}
                onChange={(event) =>
                  setClassifications((previous) => ({
                    ...previous,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب ساختار...</option>
                {shuffledDrugStructures.map((option) => (
                  <option key={option.id} value={option.id}>
                    {classificationSolved ? `${option.blindLabel} — ${option.revealedName}` : option.blindLabel}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <ProgressiveHintBox
          solved={classificationSolved}
          disabled={!metaboliteSolved}
          hints={[
            'مهارکننده استروئیدی آروماتاز هسته ۴حلقه‌ای دارد؛ مهارکننده غیراستروئیدی آروماتاز دارای حلقه تری‌آزول و دو گروه سیانید (-CN) است.',
            'آنتی‌استروژن خالص زنجیره بسیار بلند فلوئوره دارد و SERM دارای داربست بنزوتیوفن است.',
          ]}
        />

        {classificationFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              classificationFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {classificationFeedback.text}
          </div>
        )}
        {!classificationSolved ? (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={
                !metaboliteSolved ||
                classificationLoading ||
                Object.values(classifications).some((value) => !value)
              }
              onClick={handleClassificationSubmit}
              className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              {classificationLoading ? 'در حال بررسی...' : 'ثبت دسته‌بندی و استخراج سرنخ سیانید'}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              ذخیره سرنخ سوم (سیانید) و بازگشت ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
