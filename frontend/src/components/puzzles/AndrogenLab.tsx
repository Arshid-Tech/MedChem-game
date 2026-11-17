import React, { useState } from 'react';
import { Dna, CheckCircle2, AlertTriangle, RotateCcw, Cpu, ArrowDown, ArrowUp } from 'lucide-react';
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
  { id: '1', name: 'ساختار ۱ (اکسی‌متولون - Oxymetholone)', desc: 'مشتق دی‌هیدروتستوسترون با گروه 2-هیدروکسی‌متیلن' },
  { id: '2', name: 'ساختار ۲ (استانوزولول - Stanozolol)', desc: 'دارای حلقه پیرازول متصل به حلقه A و گروه 17α-متیل' },
  { id: '3', name: 'ساختار ۳ (متابولنولون / استروئید متیله 1α,17α-دی‌متیل)', desc: 'ممانعت فضایی حداکثری در برابر متابولیسم و بیشترین قدرت اثر' },
  { id: '4', name: 'ساختار ۴ (فلوکسی‌مسترون / مشتق هیدروکسیله 11β)', desc: 'دارای فلوئور 9α و هیدروکسیل 11β' },
];

const ANDROGEN_DRUGS = [
  { id: '1', name: 'ترکیب ۱ (سیپروترون استات)', hint: 'استروئید دارای حلقه سیکلوپروپیل 1α,2α و کلر C6' },
  { id: '2', name: 'ترکیب ۲ (نیلوتامید)', hint: 'غیر استروئیدی دارای حلقه ایمیدازولیدین‌دیون و نیترو/تری‌فلورومتیل' },
  { id: '3', name: 'ترکیب ۳ (فیناستراید)', hint: '۴-آزااستروئید دارای پیوند دوگانه Δ1 و ترت-بوتیل آمید C17β' },
  { id: '4', name: 'ترکیب ۴ (لیاروزول / کتوکونازول آنالوگ)', hint: 'دارای حلقه ایمیدازول و بنزیمیدازول متصل به آهن هم (Heme)' },
  { id: '5', name: 'ترکیب ۵ (آبیراترون / سیکلوپروپیل آمینو استروئید)', hint: 'استروئید مهارکننده آنزیم لایز/هیدروکسیلاز آدرنال و گناد' },
  { id: '6', name: 'ترکیب ۶ (انوبوسارم / SARM فلوئوروفنوکسی)', hint: 'آریل‌پروپیونامید انتخابی گیرنده آندروژن بافت عضله و استخوان' },
  { id: '7', name: 'ترکیب ۷ (اوساترون / پیرازولواستروئید آنتی‌آندروژن)', hint: 'آنتاگونیست استروئیدی با گروه متان سولفونیل پیرازول' },
  { id: '8', name: 'ترکیب ۸ (بیکالوتامید)', hint: 'غیر استروئیدی دارای گروه سیانو (-CN) و پل سولفونیل (-SO2-)' },
  { id: '9', name: 'ترکیب ۹ (دوتاستراید)', hint: '۴-آزااستروئید دارای گروه بیس(تری‌فلورومتیل)فنیل آمید در C17β' },
  { id: '10', name: 'ترکیب ۱۰ (آندارین / SARM استامیدوفنوکسی)', hint: 'تعدیل‌کننده انتخابی گیرنده آندروژن با گروه پارا-استامیدو' },
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
    entryPotencySolved ? ['3', '2', '1', '4'] : ['1', '2', '3', '4']
  );
  const [entryStart] = useState<number>(() => Date.now());
  const [entryFeedback, setEntryFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [entryLoading, setEntryLoading] = useState(false);

  const [metabolite, setMetabolite] = useState<string>(
    metaboliteSolved ? '2-hydroxyflutamide' : ''
  );
  const [metStart] = useState<number>(() => Date.now());
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  const [sarmChoice, setSarmChoice] = useState(sarmSolved ? '10' : '');
  const [sarmStart] = useState<number>(() => Date.now());
  const [sarmFeedback, setSarmFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [sarmLoading, setSarmLoading] = useState(false);

  const [androgenicityMods, setAndrogenicityMods] = useState<string[]>(
    androgenicitySolved
      ? ['remove_androgenic_features', 'add_low_androgenic_features']
      : []
  );
  const [androgenicityStart] = useState<number>(() => Date.now());
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
  const [classStart] = useState<number>(() => Date.now());
  const [classFeedback, setClassFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  const [complexState, setComplexState] = useState({
    selected_inhibitors: enzymeComplexSolved ? ['3', '9'] : ([] as string[]),
    cofactor_complex: enzymeComplexSolved ? 'nadph_covalent_adduct' : '',
    pharmacophore: enzymeComplexSolved ? 'keto_enol_lactam' : '',
  });
  const [compStart] = useState<number>(() => Date.now());
  const [compFeedback, setCompFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [compLoading, setCompLoading] = useState(false);

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
      const elapsed = Math.max(1, Math.round((Date.now() - entryStart) / 1000));
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
    const elapsed = Math.max(1, Math.round((Date.now() - metStart) / 1000));
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
      const elapsed = Math.max(1, Math.round((Date.now() - sarmStart) / 1000));
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
      const elapsed = Math.max(1, Math.round((Date.now() - androgenicityStart) / 1000));
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
    const elapsed = Math.max(1, Math.round((Date.now() - classStart) / 1000));
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
    const elapsed = Math.max(1, Math.round((Date.now() - compStart) / 1000));
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
            <span>دپارتمان پنجم: بخش آندروژن‌ها و مهارکننده‌های ۵-آلفا ردوکتاز</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            آخرین بخش تحقیقاتی: بررسی متابولیسم آنتی‌آندروژن‌ها، انتخاب SARM و مکانیسم مهار آنزیم ۵-آلفا ردوکتاز برای کاهش آندروژنیسیته.
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

      {/* معمای ۱: رتبه‌بندی قدرت آندروژنی */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(1)}: رتبه‌بندی قدرت اثر مشتقات آندروژنی برای باز کردن قفل آزمایشگاه
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          چهار ترکیب زیر را بر اساس رابطه ساختار-اثر (SAR) از قوی‌ترین (رتبه ۱) به ضعیف‌ترین (رتبه ۴) مرتب کنید:
        </p>
        <div className="space-y-2">
          {entryOrder.map((id, index) => {
            const item = ENTRY_POTENCY_ITEMS.find((x) => x.id === id)!;
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
                {!entryPotencySolved && (
                  <div className="flex gap-2">
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
              {entryLoading ? 'در حال بررسی...' : 'ثبت ترتیب و باز کردن در'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: متابولیت ماژور فلوتامید */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          entryPotencySolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(2)}: شناسایی متابولیت ماژور و فعال داروی فلوتامید (Flutamide)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          فلوتامید یک پیش‌داروی غیر استروئیدی است که در کبد توسط CYP1A2 هیدروکسیله شده و به فرم بسیار قوی‌تر تبدیل می‌شود. کدام گزینه متابولیت فعال آن است؟
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: '2-hydroxyflutamide',
              title: '۲-هیدروکسی‌فلوتامید (2-Hydroxyflutamide)',
              desc: 'هیدروکسیلاسیون روی کربن متین زنجیره ایزوبوتیریل',
            },
            {
              id: 'nitro_reduced_amine',
              title: 'آمین آروماتیک احیاشده (-NH2)',
              desc: 'احیای گروه نیترو حلقه بنزن (متابولیت غیرفعال)',
            },
            {
              id: 'n_dealkylated_anilide',
              title: 'پارا-نیترو-متا-تری‌فلورومتیل آنیلین',
              desc: 'هیدرولیز کامل پیوند آمیدی (متابولیت سمی/غیرفعال)',
            },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => !metaboliteSolved && setMetabolite(opt.id)}
              className={`rounded-xl border p-4 cursor-pointer transition ${
                metabolite === opt.id
                  ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220]'
              }`}
            >
              <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{opt.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
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

      {/* معمای ۳: جایگزین SARM */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          metaboliteSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(3)}: پیشنهاد یک SARM انتخابی به‌جای بیکالوتامید
        </h3>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          آقای زیگموند به دارویی با اثر انتخابی بافتی و بدون عوارض متابولیک کبدی نیاز دارد. یکی از ساختارهای SARM را انتخاب کنید:
        </p>
        <select
          disabled={!metaboliteSolved || sarmSolved}
          value={sarmChoice}
          onChange={(event) => setSarmChoice(event.target.value)}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
        >
          <option value="">انتخاب ترکیب...</option>
          <option value="2">ترکیب ۲ — نیلوتامید (آنتاگونیست غیراستروئیدی ایمیدازولیدین‌دیون)</option>
          <option value="6">ترکیب ۶ — انوبوسارم (Enobosarm - SARM)</option>
          <option value="10">ترکیب ۱۰ — آندارین (Andarine - SARM)</option>
        </select>
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

      {/* معمای ۴: کاهش آندروژنیسیته */}
      <div
        className={`rounded-2xl border p-6 space-y-4 transition ${
          sarmSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(4)}: اصلاح ساختار برای کمینه‌کردن آندروژنیسیته
        </h3>
        <div className="space-y-2">
          {[
            { id: 'remove_androgenic_features', label: 'حذف بخش‌هایی از ساختار که خواص آندروژنی ایجاد می‌کنند (مانند متیل زاویه‌ای C19)' },
            { id: 'add_low_androgenic_features', label: 'افزودن تغییرات ساختاری کاهنده آندروژنیسیته و مهارکننده احیای 5α' },
            { id: 'add_androgenic_features', label: 'افزودن استخلاف‌های 17α-متیل و 9α-فلوئور برای تقویت اتصال گیرنده آندروژن' },
          ].map((modification) => {
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

      {/* معمای ۵: دسته‌بندی ۱۰ ترکیب */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          androgenicitySolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            معمای {toPersianDigits(5)}: دسته‌بندی {toPersianDigits(10)} ترکیب دارویی محور آندروژن در {toPersianDigits(5)} کلاس مکانیسمی
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {ANDROGEN_DRUGS.filter((d) => !Object.values(buckets).flat().includes(d.id)).map((drug) => (
            <div
              key={drug.id}
              draggable={androgenicitySolved && !classificationSolved}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', drug.id)}
              onClick={() => {
                if (!androgenicitySolved || classificationSolved) return;
                setSelectedChip(selectedChip === drug.id ? null : drug.id);
              }}
              className={`rounded-xl border p-3 cursor-pointer transition ${
                selectedChip === drug.id
                  ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220]'
              }`}
            >
              <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{drug.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{drug.hint}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {(
            [
              { key: 'steroid_antiandrogen', title: 'Steroid Antiandrogens' },
              { key: 'non_steroid_antiandrogen', title: 'Non-Steroid Antiandrogens' },
              { key: 'five_alpha_reductase', title: '5α-Reductase Inhibitors' },
              { key: 'cyp17_inhibitor', title: '17α-Hydroxylase / Lyase Inhibitors' },
              { key: 'sarms', title: 'SARMs (Selective Modulators)' },
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
                    className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-100 flex justify-between items-center cursor-pointer"
                  >
                    <span>{item.name}</span>
                    {!classificationSolved && <span className="text-rose-500">×</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

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

      {/* معمای ۶: کمپلکس آنزیم ۵-آلفا ردوکتاز */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          classificationSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-500" />
          <span>معمای {toPersianDigits(6)}: شبیه‌سازی کمپلکس مهارکننده در سایت فعال آنزیم ۵-آلفا ردوکتاز</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۱. شماره مهارکننده‌های ۵-آلفا ردوکتاز:</div>
            <div className="flex flex-wrap gap-2">
              {['1', '3', '6', '8', '9'].map((num) => {
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
              <option value="">انتخاب کمپلکس...</option>
              <option value="nadph_covalent_adduct">تشکیل آداکت کووالانسی برگشت‌ناپذیر با کوفاکتور NADPH</option>
              <option value="heme_iron_chelation">کلاته کردن اتم آهن هم (Heme Fe)</option>
              <option value="allosteric_zinc">اتصال آلوستریک به یون روی</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۳. فارماکوفور کلیدی حلقه A در ترکیب اهریمن:</div>
            <select
              disabled={!classificationSolved || enzymeComplexSolved}
              value={complexState.pharmacophore}
              onChange={(e) => setComplexState((p) => ({ ...p, pharmacophore: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">انتخاب فارماکوفور...</option>
              <option value="keto_enol_lactam">سیستم کونژوگه کتو-انول / لاکتام (Keto-Enol / Lactam)</option>
              <option value="phenolic_oh">حلقه فنولیک آروماتیک</option>
              <option value="nitro_benzene">حلقه نیتروبنزن</option>
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
              ذخیره سرنخ پنجم و بازگشت به نقشه ←
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
              {compLoading ? 'در حال ثبت کمپلکس...' : 'تایید کمپلکس آنزیمی و استخراج سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
