import React, { useEffect, useState } from 'react';
import { Atom, RotateCw, CheckCircle2, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';
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

const ENZYME_OPTIONS = ['Estradiol dehydrogenase', '16a-hydroxylase', 'Aromatase (CYP19)', '5a-reductase'];

const ESTROGEN_STRUCTURES = [
  { id: '1', title: 'ساختار ۱', desc: 'حلقه A آروماتیک + گروه 3-OH و گروه 17β-OH (بدون گروه در C16)' },
  { id: '2', title: 'ساختار ۲', desc: 'حلقه A آروماتیک + گروه 3-OH و گروه کتون C17=O' },
  { id: '3', title: 'ساختار ۳', desc: 'حلقه A آروماتیک + 3-OH، 16α-OH و 17β-OH (تری‌هیدروکسی)' },
  { id: '4', title: 'ساختار ۴', desc: 'حلقه A آروماتیک + 3-OH، 16α-OH و گروه کتون C17=O' },
];

const POTENCY_COMPOUNDS = [
  { id: '1', name: 'ترکیب ۱ (17β-Estradiol)', desc: 'استروژن طبیعی مرجع با 3-OH و 17β-OH' },
  { id: '2', name: 'ترکیب ۲ (Ethinyl Estradiol)', desc: 'مشتق 17α-اتینیل مقاوم به متابولیسم کبدی (قدرت هم‌تراز در گیرنده)' },
  { id: '3', name: 'ترکیب ۳ (Diethylstilbestrol - DES)', desc: 'آگونیست غیر استروئیدی ترانس با بیشترین میل اتصال و قدرت اثر' },
  { id: '4', name: 'ترکیب ۴ (Estriol)', desc: 'متابولیت قطبی 16α,17β-دی‌اول با کمترین قدرت اثر استروژنی' },
];

const DRUG_CLASS_FIELDS = [
  { key: 'serm', title: 'تعدیل‌کننده انتخابی گیرنده استروژن — SERM (رالوکسیفن)' },
  { key: 'pure_antiestrogen', title: 'آنتی‌استروژن خالص — Pure Antiestrogen (فولوسترانت)' },
  { key: 'steroid_aromatase_inhibitor', title: 'مهارکننده استروئیدی آروماتاز (اگزمستان)' },
  { key: 'non_steroid_aromatase_inhibitor', title: 'مهارکننده غیراستروئیدی آروماتاز (لتروزول)' },
] as const;

const DRUG_CLASS_OPTIONS = [
  { id: 'A', title: 'ساختار A — هسته استروئیدی با متیلن C6 و کتون C3/C17 (اگزمستان)' },
  { id: 'B', title: 'ساختار B — داربست بنزوتیوفن با زنجیره آمینی پیپریدین (رالوکسیفن)' },
  { id: 'C', title: 'ساختار C — آنالوگ استرادیول با زنجیره بلند آلکیل سولفوکسید C7α (فولوسترانت)' },
  { id: 'D', title: 'ساختار D — حلقه تری‌آزول متصل به دو حلقه بنزونیتریل دارای گروه سیانید -C≡N (لتروزول)' },
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
  // معمای ۱: جانمایی ساختارها و آنزیم‌های متابولیسم
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
  const [metStart] = useState<number>(() => Date.now());
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  // معمای ۲: طراحی استروژن خوراکی طولانی‌اثر
  const [oralMods, setOralMods] = useState<string[]>(
    oralDesignSolved ? ['add_17alpha_ethynyl', 'methylate_3_hydroxyl'] : []
  );
  const [oralStart] = useState<number>(() => Date.now());
  const [oralFeedback, setOralFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [oralLoading, setOralLoading] = useState(false);

  // معمای ۳: رتبه‌بندی قدرت
  const [potencyOrder, setPotencyOrder] = useState<string[]>(
    potencySolved ? ['3', '1', '2', '4'] : ['1', '2', '3', '4']
  );
  const [potencyStart] = useState<number>(() => Date.now());
  const [potencyFeedback, setPotencyFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [potencyLoading, setPotencyLoading] = useState(false);

  // معمای ۴: داکینگ DES در گیرنده استروژن با تایمر ۱۰ ثانیه‌ای
  const [angle, setAngle] = useState<number>(dockingSolved ? 180 : 0);
  const [hasRotated, setHasRotated] = useState(dockingSolved);
  const [escapeSeconds, setEscapeSeconds] = useState(10);
  const [escapeStarted, setEscapeStarted] = useState(false);
  const [dockStart] = useState<number>(() => Date.now());
  const [dockFeedback, setDockFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [dockLoading, setDockLoading] = useState(false);

  // معمای ۵: پیشگیری از متابولیت فعال سرطان‌زا
  const [metabolitePath, setMetabolitePath] = useState(
    metaboliteSolved ? 'prevent_active_metabolite' : ''
  );
  const [metaboliteStart] = useState<number>(() => Date.now());
  const [metaboliteFeedback, setMetaboliteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metaboliteLoading, setMetaboliteLoading] = useState(false);

  // معمای ۶: طبقه‌بندی داروهای استروژنی و استخراج سرنخ سیانید
  const [classifications, setClassifications] = useState({
    serm: classificationSolved ? 'B' : '',
    pure_antiestrogen: classificationSolved ? 'C' : '',
    steroid_aromatase_inhibitor: classificationSolved ? 'A' : '',
    non_steroid_aromatase_inhibitor: classificationSolved ? 'D' : '',
  });
  const [classificationStart] = useState<number>(() => Date.now());
  const [classificationFeedback, setClassificationFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [classificationLoading, setClassificationLoading] = useState(false);

  useEffect(() => {
    if (!escapeStarted || dockingSolved || escapeSeconds === 0) return;
    const timer = window.setInterval(() => {
      setEscapeSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [escapeStarted, dockingSolved, escapeSeconds]);

  const handleMetSubmit = async () => {
    if (
      metabolismSolved ||
      Object.values(enzymes).some((value) => !value) ||
      Object.values(structurePositions).some((value) => !value)
    )
      return;
    setMetLoading(true);
    setMetFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - metStart) / 1000));
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

  const toggleOralModification = (id: string) => {
    if (!metabolismSolved || oralDesignSolved) return;
    setOralMods((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  };

  const handleOralSubmit = async () => {
    if (!metabolismSolved || !oralMods.length) return;
    setOralLoading(true);
    setOralFeedback(null);
    try {
      const elapsed = Math.max(1, Math.round((Date.now() - oralStart) / 1000));
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
      const elapsed = Math.max(1, Math.round((Date.now() - potencyStart) / 1000));
      const res = await onSubmitPuzzle('estrogen_potency_sort', potencyOrder, elapsed);
      setPotencyFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setPotencyFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setPotencyLoading(false);
    }
  };

  const handleDockSubmit = async () => {
    if (!potencySolved || !hasRotated) return;
    setDockLoading(true);
    setDockFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - dockStart) / 1000));
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
      const elapsed = Math.max(1, Math.round((Date.now() - metaboliteStart) / 1000));
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
      const elapsed = Math.max(1, Math.round((Date.now() - classificationStart) / 1000));
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
            <span>دپارتمان سوم: آزمایشگاه استروژن‌ها و داکینگ گیرنده هسته‌ای (ERα)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            آقا و خانم لارنس در این بخش روی استروژن‌های پایدار خوراکی، اتصال به رسپتور و مهارکننده‌های آروماتاز تحقیق می‌کردند.
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

      {/* معمای ۱: جانمایی ساختارها و آنزیم‌های متابولیسم */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(1)}: جانمایی چهار ساختار استروژنی و تکمیل نقشه متابولیسم کبدی
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ESTROGEN_STRUCTURES.map((st) => (
            <div
              key={st.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-3"
            >
              <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{st.title}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{st.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['estradiol', 'استرادیول (Estradiol - E2)'],
              ['estrone', 'استرون (Estrone - E1)'],
              ['estriol', 'استریول (Estriol - E3)'],
              ['hydroxyestrone', '16α-هیدروکسی‌استرون'],
            ].map(([molecule, label]) => (
              <label key={molecule} className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <span className="font-semibold block">جایگاه ساختار: {label}</span>
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
                  <option value="1">ساختار ۱</option>
                  <option value="2">ساختار ۲</option>
                  <option value="3">ساختار ۳</option>
                  <option value="4">ساختار ۴</option>
                </select>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-50/70 dark:bg-cyan-950/30 p-3">
              <div className="font-bold text-cyan-800 dark:text-cyan-300 text-sm">استرادیول (E2)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">قوی‌ترین استروژن طبیعی</div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
                آنزیم تبدیل برگشت‌پذیر E2 ⇄ E1
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
              <div className="font-bold text-purple-800 dark:text-purple-300 text-sm">استرون (E1)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">دارای گروه کتون C17=O</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div>
              <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                آنزیم مسیر E2 → E3
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
            <div className="text-xs text-slate-500 font-mono">↓ هیدروکسیلاسیون موقعیت 16α ↓</div>
            <div>
              <label className="block text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
                آنزیم مسیر E1 → 16α-OH-E1
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
              <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">استریول (E3)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">متابولیت نهایی قطبی</div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-700 dark:text-amber-300 font-semibold mb-1">
                آنزیم تبدیل E3 ⇄ 16α-Hydroxyestrone
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
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">واسطه هیدروکسیله حلقه D</div>
            </div>
          </div>
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
              {metLoading ? 'در حال بررسی...' : 'تایید مسیر متابولیک'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: طراحی استروژن خوراکی طولانی‌اثر */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          metabolismSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(2)}: طراحی استروژن خوراکی و طولانی‌اثر از استرادیول
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          ماده روی ویال آزمایشگاه موش‌ها (استرادیول) خوراکی نیست. تغییرات ساختاری مؤثر برای تولید فرم خوراکی و طولانی‌اثر (اتینیل‌استرادیول و مسترانول) را انتخاب کنید:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'add_17alpha_ethynyl',
              title: 'افزودن گروه 17α-اتینیل (-C≡CH)',
              desc: 'ممانعت فضایی در برابر اکسیداسیون کبدی C17-OH توسط 17β-HSD',
            },
            {
              id: 'methylate_3_hydroxyl',
              title: 'متیله‌کردن هیدروکسیل فنولی C3 (پیش‌داروی مسترانول)',
              desc: 'افزایش لیپوفیلیته و آزادسازی آهسته کبدی برای افزایش طول اثر',
            },
            {
              id: 'remove_17beta_hydroxyl',
              title: 'حذف کامل گروه 17β-هیدروکسیل',
              desc: 'حذف گروه عامل ضروری برای پیوند هیدروژنی با His 524 گیرنده',
            },
          ].map((modification) => {
            const active = oralMods.includes(modification.id);
            return (
              <button
                key={modification.id}
                type="button"
                disabled={!metabolismSolved || oralDesignSolved}
                aria-pressed={active}
                onClick={() => toggleOralModification(modification.id)}
                className={`rounded-xl border p-4 text-right transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50 text-cyan-900 dark:text-cyan-100'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{modification.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{modification.desc}</div>
              </button>
            );
          })}
        </div>
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
              {oralLoading ? 'در حال بررسی...' : 'ثبت طراحی خوراکی'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۳: رتبه‌بندی قدرت */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          oralDesignSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(3)}: ترتیب قدرت اثر ترکیبات استروژنی (قوی‌ترین به ضعیف‌ترین)
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          چهار ترکیب زیر را از قوی‌ترین (رتبه ۱) به ضعیف‌ترین (رتبه ۴) مرتب کنید (ترکیب‌های ۱ و ۲ قدرت هم‌تراز دارند):
        </p>
        <div className="space-y-2">
          {potencyOrder.map((id, index) => {
            const item = POTENCY_COMPOUNDS.find((c) => c.id === id)!;
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-3"
              >
                <div>
                  <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 ml-2">
                    رتبه {toPersianDigits(index + 1)} —
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-cyan-200">{item.name}</span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
                </div>
                {!potencySolved && (
                  <div className="flex gap-2">
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
              {potencyLoading ? 'در حال بررسی...' : 'ثبت ترتیب قدرت'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۴: چرخش لیگاند در گیرنده */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          potencySolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(4)}: داکینگ دی‌اتیل‌استیل‌بسترول (DES) در پاکت اتصال ERα
        </h3>

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
                className="rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/70 px-4 py-2 text-xs font-bold text-cyan-200 flex items-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" /> چرخش {toPersianDigits(45)} درجه ({toPersianDigits(angle)}°)
              </button>
              <span className={`text-xs font-bold ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAligned ? 'پیوند هیدروژنی برقرار شد ✓' : 'در جستجوی زاویه اتصال...'}
              </span>
            </div>
            <div className="mt-3 text-xs text-rose-300" role="status" aria-live="polite">
              {escapeSeconds > 0
                ? `مهلت خروج: ${toPersianDigits(escapeSeconds)} ثانیه`
                : 'مهلت تمام شد؛ برای تلاش دوباره، بازه را از نو آغاز کنید.'}
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
                شروع دوباره مهلت {toPersianDigits(10)} ثانیه‌ای
              </button>
            )}
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs leading-6 text-slate-600 dark:text-slate-300">
              دی‌اتیل‌استیل‌بسترول را بچرخانید تا با Glu 353، Arg 394 و His 524 هم‌تراز شود. پس از چرخش، پرونده به گفت‌وگو و شناسایی متابولیت فعال می‌رسد.
            </div>
            {isAligned && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 p-4 text-xs leading-6 text-emerald-800 dark:text-emerald-200">
                ساختار در زاویه درست قرار گرفت؛ هرچند خروج از اتاق موفق نبود، اطلاعات اتصال برای ادامه پرونده ثبت می‌شود.
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
              disabled={!potencySolved || dockLoading || !hasRotated}
              onClick={handleDockSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {dockLoading ? 'در حال ثبت داکینگ...' : 'ثبت داکینگ'}
            </button>
          )}
        </div>
      </div>

      {/* معمای ۵: جلوگیری از تشکیل متابولیت فعال */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          dockingSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(5)}: جلوگیری از تشکیل متابولیت فعال سرطان‌زا
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          خانم لارنس می‌گوید دارویی که مصرف کرده باعث بیماری شده است. کدام هدف باید در طراحی اصلاح دارو دنبال شود؟
        </p>
        <select
          required
          disabled={!dockingSolved || metaboliteSolved}
          value={metabolitePath}
          onChange={(event) => setMetabolitePath(event.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
        >
          <option value="">انتخاب مسیر متابولیک...</option>
          <option value="prevent_active_metabolite">اصلاح ساختار برای جلوگیری از تشکیل متابولیت فعال</option>
          <option value="promote_active_metabolite">افزایش تبدیل دارو به متابولیت فعال</option>
          <option value="increase_parent_exposure">افزایش تماس با داروی اولیه بدون تغییر متابولیت</option>
        </select>
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
              {metaboliteLoading ? 'در حال بررسی...' : 'ثبت مسیر مهاری'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۶: طبقه‌بندی داروهای استروژنی */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          metaboliteSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(6)}: شناسایی کلاس‌های دارویی استروژن و استخراج سرنخ سوم
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          چهار ساختار A تا D را با کلاس دارویی درست تطبیق دهید؛ گروه سیانید (-C≡N)، مهارکننده غیراستروئیدی آروماتاز را مشخص می‌کند.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DRUG_CLASS_FIELDS.map((field) => (
            <label key={field.key} className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">{field.title}</span>
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
                {DRUG_CLASS_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
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
              {classificationLoading ? 'در حال بررسی...' : 'ثبت طبقه‌بندی و استخراج سرنخ'}
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              تکمیل پرونده و بازگشت به نقشه ←
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
