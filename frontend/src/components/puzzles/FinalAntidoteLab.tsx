import React, { useEffect, useState } from 'react';
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

const ANTIDOTE_TOOLS = [
  {
    id: 'remove_9alpha_f',
    title: 'حذف اتم فلوئور از موقعیت 9α (Defluorination)',
    desc: 'کاهش شدید سمیت گلوکوکورتیکوئیدی و میل اتصال مهارناپذیر به گیرنده GR',
  },
  {
    id: 'remove_cyanide',
    title: 'حذف گروه سیانید (-C≡N) متصل به حلقه',
    desc: 'رفع مهار غیرانتخابی سیتوکروم P450 و سمیت متابولیک',
  },
  {
    id: 'add_11beta_antagonist_aryl',
    title: 'افزودن گروه حجیم 11β-(4-دی‌متیل‌آمینوفنیل) مشابه میفپریستون',
    desc: 'ممانعت فضایی در جابه‌جایی هلیکس ۱۲ گیرنده هسته‌ای و تبدیل آگونیست به آنتاگونیست قوی (پادزهر)',
  },
  {
    id: 'hydrolyze_lipophilic_ester',
    title: 'هیدرولیز استر لیپوفیل موضعی (تبدیل به فرم قطبی قابل دفع)',
    desc: 'کاهش ماندگاری بافتی و تسهیل دفع کلیوی ترکیب سمی',
  },
  {
    id: 'add_extra_fluorine_decoy',
    title: 'افزودن اتم فلوئور دوم در موقعیت 6α',
    desc: 'افزایش لیپوفیلیته و قدرت اتصال به گیرنده‌های هسته‌ای در حلقه B',
  },
];

const HIDDEN_STRUCTURES = [
  {
    id: '1',
    blindLabel: 'ساختار ۱',
    revealedName: 'پردنیزولون — خانواده گلوکوکورتیکوئید',
    revealedNote: 'هسته پرگنان ۲۱ کربنه با Δ1,4، هیدروکسیل 11β و کتول C17',
    smiles: 'C[C@]12C=CC(=O)C=C1CC[C@@H]3[C@@H]2[C@@H](O)C[C@]4(C)[C@H]3CC[C@]4(O)C(=O)CO',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'فلودروکورتیزون استات — خانواده مینرالوکورتیکوئید',
    revealedNote: 'دارای فلوئور 9α و استات C21 با قدرت بسیار بالای احتباس سدیم',
    smiles: 'CC(=O)OCC(=O)[C@@]1(O)CC[C@H]2[C@@H]3CCC4=CC(=O)CC[C@]4(C)[C@@]3(F)[C@@H](O)C[C@@]12C',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'اکسی‌متولون — خانواده آندروژن',
    revealedNote: 'هسته آندروستان ۱۹ کربنه با 17β-OH و 17α-متیل',
    smiles: 'C[C@]12CC[C@H]3[C@@H](CC[C@@H]4CC(=O)C(=CO)C[C@]34C)[C@@H]1CC[C@]2(C)O',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: 'مدروکسی‌پروژسترون استات — خانواده پروژسترون',
    revealedNote: 'هسته پرگنان ۲۱ کربنه با 6α-متیل و استات 17α (بدون هیدروکسیل C11 و C21)',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C[C@H](C)C4=CC(=O)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '5',
    blindLabel: 'ساختار ۵',
    revealedName: 'مسترانول — خانواده استروژن',
    revealedNote: 'هسته استران ۱۸ کربنه با حلقه A آروماتیک، اتر C3-OCH3 و اتینیل 17α',
    smiles: 'C#C[C@]1(O)CC[C@H]2[C@@H]3CCc4cc(OC)ccc4[C@H]3CC[C@@]12C',
  },
] as const;

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
  const [mappingStart] = useState<number>(() => Date.now());
  const [mappingFeedback, setMappingFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [mappingLoading, setMappingLoading] = useState(false);

  const [biosynthesis, setBiosynthesis] = useState({
    step_1: vaultSolved ? 'Pregnenolone' : '',
    step_2: vaultSolved ? 'Progesterone' : '',
    step_3: vaultSolved ? 'Testosterone' : '',
    vault_password: vaultSolved ? 'CORTICOSTEROID' : '',
  });
  const [vaultStart] = useState<number>(() => Date.now());
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
  const [antidoteStart] = useState<number>(() => Date.now());
  const [antidoteFeedback, setAntidoteFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [antidoteLoading, setAntidoteLoading] = useState(false);

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
    const elapsed = Math.max(1, Math.round((Date.now() - mappingStart) / 1000));
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
    const elapsed = Math.max(1, Math.round((Date.now() - vaultStart) / 1000));
    try {
      const res = await onSubmitPuzzle('biosynthesis_vault', biosynthesis, elapsed);
      setVaultFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setVaultFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setVaultLoading(false);
    }
  };

  const toggleTool = (id: string) => {
    if (!vaultSolved || antidoteSolved) return;
    setSelectedTools((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleAntidoteSubmit = async () => {
    if (!vaultSolved || !selectedTools.length) return;
    setAntidoteLoading(true);
    setAntidoteFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - antidoteStart) / 1000));
    try {
      const res = await onSubmitPuzzle('antidote_synthesis', selectedTools, elapsed);
      setAntidoteFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setAntidoteFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setAntidoteLoading(false);
    }
  };

  const hasDefluor = selectedTools.includes('remove_9alpha_f');
  const hasNoCn = selectedTools.includes('remove_cyanide');
  const hasAryl = selectedTools.includes('add_11beta_antagonist_aryl');
  const hasHydrolysis = selectedTools.includes('hydrolyze_lipophilic_ester');

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-rose-500/40 bg-rose-50/60 dark:bg-gradient-to-l dark:from-rose-950/60 dark:to-slate-900/90 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-lg">
            <Skull className="w-6 h-6" />
            <span>مرحله نهایی: اتاق مخفی دکتر ارول و سنتز پادزهر «اهریمن»</span>
          </div>
          <p className="text-slate-700 dark:text-slate-200 text-sm mt-1 leading-6">
            تمام ۵ سرنخ جمع‌آوری شده‌اند. اکنون باید قفل اتاق مخفی و گاوصندوق بیوسنتز را بشکنید و پیش از ورود بازرسان FDA، ساختار سمی اهریمن را به آنتاگونیست بی‌خطر تبدیل نمایید!
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

      {/* گام ۱: قفل اتاق مخفی با ۵ ساختار واقعی */}
      <form
        onSubmit={handleMappingSubmit}
        className="rounded-2xl border border-slate-200 dark:border-cyan-500/30 bg-white dark:bg-slate-900/80 p-6 space-y-5 shadow-sm"
      >
        <div className="flex items-center gap-2 font-bold text-base text-cyan-700 dark:text-cyan-300">
          <Layers className="w-5 h-5" />
          <span>گام {toPersianDigits(1)}: باز کردن قفل اتاق مخفی (تطبیق ۵ ساختار با خانواده‌های استروئیدی)</span>
        </div>
        <p className="text-xs leading-6 text-slate-600 dark:text-slate-300">
          هر ساختار زیر را تحلیل کرده و به خانواده هورمونی مربوط متصل کنید تا به گاوصندوق دسترسی پیدا کنید:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIDDEN_STRUCTURES.map((structure) => (
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
              {mappingLoading ? 'در حال بررسی...' : 'باز کردن اتاق مخفی'}
            </button>
          </div>
        )}
      </form>

      {/* گام ۲: گاوصندوق مسیر بیوسنتز کلسترول */}
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
          <span>گام {toPersianDigits(2)}: رمزگشایی گاوصندوق بیوسنتز استروئیدها</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          واسطه‌های کلیدی مسیر بیوسنتز از <strong>کلسترول (Cholesterol)</strong> و کلیدواژه {toPersianDigits(14)} حرفی را تکمیل کنید:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۱. اولین محصول برش زنجیره جانبی کلسترول (CYP11A1):</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_1}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_1: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select intermediate...</option>
              <option value="Pregnenolone">Pregnenolone</option>
              <option value="Aldosterone">Aldosterone</option>
              <option value="Estradiol">Estradiol</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۲. محصول عمل آنزیم 3β-HSD و ایزومراز روی ترکیب ۱:</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_2}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_2: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select intermediate...</option>
              <option value="Progesterone">Progesterone</option>
              <option value="Cortisone">Cortisone</option>
              <option value="Estriol">Estriol</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">۳. پیش‌ساز مستقیم 5α-DHT و استرادیول (حاصل 17β-HSD):</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_3}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_3: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              <option value="">Select intermediate...</option>
              <option value="Testosterone">Testosterone</option>
              <option value="Cholesterol">Cholesterol</option>
              <option value="Flutamide">Flutamide</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
              کلیدواژه رمز گاوصندوق (نام انگلیسی خانواده هورمون‌های قشر آدرنال):
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              راهنما: {toPersianDigits(14)} حرف انگلیسی (شروع با CORTICO...)
            </div>
          </div>
          <input
            type="text"
            required
            disabled={!mappingSolved || vaultSolved}
            dir="ltr"
            placeholder="CORTICO......."
            value={biosynthesis.vault_password}
            onChange={(e) => setBiosynthesis((p) => ({ ...p, vault_password: e.target.value.toUpperCase() }))}
            className="w-full sm:w-56 rounded-xl border border-amber-500/50 bg-white dark:bg-slate-950 px-4 py-2 font-mono text-sm tracking-widest text-amber-700 dark:text-amber-300 uppercase focus:outline-none focus:border-amber-400"
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

      {/* گام ۳: اوج بازی — سنتز پادزهر اهریمن */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          vaultSolved
            ? 'border-rose-500/40 bg-white dark:bg-slate-900/85 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-extrabold text-base text-rose-600 dark:text-rose-300">
            <Sparkles className="w-5 h-5" />
            <span>گام {toPersianDigits(3)} (اوج بحران): مهندسی معکوس مولکول اهریمن و سنتز پادزهر</span>
          </div>
          {!antidoteSolved && vaultSolved && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-950/85 px-3 py-1.5 text-xs font-bold text-rose-200">
              <Timer className="w-4 h-4 animate-spin" />
              <span>چرخه پایداری راکتور: {toPersianDigits(climaxTimer)} ثانیه</span>
            </div>
          )}
        </div>

        {/* پیش‌نمایش زنده مولکول اهریمن در حال خنثی‌سازی */}
        <div className="rounded-2xl border border-slate-700 bg-[#06101e] p-5 flex flex-col items-center">
          <div className="text-xs font-bold text-slate-300 mb-2">
            {antidoteSolved ? 'ساختار پادزهر آنتاگونیست نهایی (خنثی و ایمن ✓)' : 'ساختار فعال پروژه اهریمن (Project Leviathan)'}
          </div>
          <div dir="ltr" className="w-full flex justify-center">
            <svg viewBox="0 0 380 215" className="w-full max-w-[400px] h-48">
              <polygon points="58,114 91,95 124,114 124,152 91,171 58,152" fill="none" stroke="#cbd5e1" strokeWidth="2.3" />
              <polygon points="124,114 157,95 190,114 190,152 157,171 124,152" fill="none" stroke="#cbd5e1" strokeWidth="2.3" />
              <polygon points="157,95 157,57 190,38 223,57 223,95 190,114" fill="none" stroke="#cbd5e1" strokeWidth="2.3" />
              <polygon points="223,57 259,46 281,76 259,106 223,95" fill="none" stroke="#cbd5e1" strokeWidth="2.3" />

              <line x1="36" y1="162" x2="57" y2="150" stroke="#f87171" strokeWidth="2.2" />
              <line x1="39" y1="167" x2="60" y2="155" stroke="#f87171" strokeWidth="2.2" />
              <text x="19" y="172" fill="#f87171" fontSize="12" fontWeight="bold">O</text>

              {!hasDefluor && (
                <g>
                  <line x1="157" y1="95" x2="157" y2="124" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="3,2" />
                  <text x="152" y="138" fill="#f43f5e" fontSize="13" fontWeight="bold">9α-F</text>
                </g>
              )}

              {!hasNoCn && (
                <g>
                  <line x1="281" y1="76" x2="314" y2="88" stroke="#f43f5e" strokeWidth="2.5" />
                  <text x="317" y="92" fill="#f43f5e" fontSize="12" fontWeight="bold">-C≡N</text>
                </g>
              )}

              {hasAryl && (
                <g>
                  <polygon points="157,57 137,43 142,37" fill="#34d399" />
                  <polygon points="110,18 130,18 140,34 130,50 110,50 100,34" fill="rgba(52,211,153,0.18)" stroke="#34d399" strokeWidth="2" />
                  <text x="48" y="37" fill="#34d399" fontSize="10" fontWeight="bold">11β-Aryl-N(Me)2</text>
                </g>
              )}

              {!hasHydrolysis ? (
                <g>
                  <line x1="259" y1="46" x2="288" y2="30" stroke="#fbbf24" strokeWidth="2.3" />
                  <text x="291" y="33" fill="#fbbf24" fontSize="10" fontWeight="bold">Lipophilic Ester</text>
                </g>
              ) : (
                <g>
                  <line x1="259" y1="46" x2="285" y2="32" stroke="#34d399" strokeWidth="2.3" />
                  <text x="288" y="35" fill="#34d399" fontSize="11" fontWeight="bold">-OH (Polar)</text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* ابزارهای ویرایش شیمیایی */}
        <div className="space-y-2.5">
          {ANTIDOTE_TOOLS.map((tool) => {
            const active = selectedTools.includes(tool.id);
            return (
              <div
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`rounded-xl border p-4 cursor-pointer transition flex items-start justify-between gap-3 ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/40'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{tool.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{tool.desc}</div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md shrink-0 ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {active ? 'اعمال شد ✓' : 'اجرا'}
                </span>
              </div>
            );
          })}
        </div>

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
