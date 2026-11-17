import React, { useEffect, useState } from 'react';
import {
  Skull,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Timer,
  ClipboardCheck,
} from 'lucide-react';

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
    title: 'حذف اتم فلوئور 9α (-F)',
    desc: 'کاهش میل ترکیبی فوق‌العاده بالا به گیرنده گلوکوکورتیکوئید و توقف سمیت سیستمیک',
  },
  {
    id: 'remove_cyanide',
    title: 'حذف گروه‌های سیانید (-C≡N)',
    desc: 'جلوگیری از مهار برگشت‌ناپذیر آنزیم‌های سیتوکروم و حذف سمیت سلولی',
  },
  {
    id: 'add_11beta_antagonist_aryl',
    title: 'افزودن گروه حجیم 11β-(4-دی‌متیل‌آمینوفنیل) مشابه میفپریستون',
    desc: 'ایجاد ممانعت فضایی روی هلیکس ۱۲ گیرنده و تبدیل آگونیست به آنتاگونیست خالص',
  },
  {
    id: 'hydrolyze_lipophilic_ester',
    title: 'هیدرولیز زنجیره استری لیپوفیل C17β',
    desc: 'افزایش قطبیت مولکول برای دفع سریع کلیوی و جلوگیری از تجمع در بافت چربی',
  },
  {
    id: 'add_extra_fluorine_decoy',
    title: 'افزودن فلوئور دوم در موقعیت 6α (فریبنده)',
    desc: 'هشدار: این تغییر قدرت سمیت گلوکوکورتیکوئیدی مولکول را دو برابر می‌کند!',
  },
];

const HIDDEN_STRUCTURES = [
  { id: '1', label: 'گلوکوکورتیکوئید' },
  { id: '2', label: 'مینرالوکورتیکوئید' },
  { id: '3', label: 'آندروژن' },
  { id: '4', label: 'پروژسترون' },
  { id: '5', label: 'استروژن' },
] as const;

export const FinalAntidoteLab: React.FC<Props> = ({
  mappingSolved,
  vaultSolved,
  antidoteSolved,
  onSubmitPuzzle,
  onOpenSurvey,
  onBackToMap,
}) => {
  const [structureClasses, setStructureClasses] = useState({
    '1': mappingSolved ? 'glucocorticoid' : '',
    '2': mappingSolved ? 'mineralocorticoid' : '',
    '3': mappingSolved ? 'androgen' : '',
    '4': mappingSolved ? 'progesterone' : '',
    '5': mappingSolved ? 'estrogen' : '',
  });
  const [mappingStart] = useState<number>(() => Date.now());
  const [mappingFeedback, setMappingFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [mappingLoading, setMappingLoading] = useState(false);

  // معمای ۲: مسیر بیوسنتز کلسترول + رمز CORTICOSTEROID
  const [biosynthesis, setBiosynthesis] = useState({
    step_1: vaultSolved ? 'Pregnenolone' : '',
    step_2: vaultSolved ? 'Progesterone' : '',
    step_3: vaultSolved ? 'Testosterone' : '',
    vault_password: vaultSolved ? 'CORTICOSTEROID' : '',
  });
  const [vaultStart] = useState<number>(() => Date.now());
  const [vaultFeedback, setVaultFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);

  // معمای ۲: چالش ۶۰ ثانیه‌ای سنتز پادزهر
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
      setClimaxTimer((prev) => (prev > 0 ? prev - 1 : 60));
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

  const hasRemovedF = selectedTools.includes('remove_9alpha_f');
  const hasRemovedCN = selectedTools.includes('remove_cyanide');
  const hasAddedAryl = selectedTools.includes('add_11beta_antagonist_aryl');
  const hasHydrolyzedEster = selectedTools.includes('hydrolyze_lipophilic_ester');

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-l from-rose-950/40 via-slate-900 to-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-extrabold text-lg">
            <Skull className="w-6 h-6" />
            <span>مرحله نهایی: اتاق مخفی دکتر ارول و سنتز پادزهر «پروژه اهریمن»</span>
          </div>
          <p className="text-slate-300 text-sm mt-1 leading-6">
            تمام ۵ سرنخ جمع‌آوری شدند: گلوکوکورتیکوئید فلوئوردار (9α-F)، موضعی، دارای سیانید (-C≡N)،
            خواص پروژسترونی و مهارکننده 5α-reductase. اکنون گاوصندوق اصلی را باز کرده و مولکول را خنثی کنید!
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-600 hover:border-cyan-400 px-4 py-2 text-xs font-semibold text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* بخش ۱: قفل اتاق مخفی */}
      <form
        onSubmit={handleMappingSubmit}
        className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 space-y-5"
      >
        <div className="flex items-center gap-2 font-bold text-base text-cyan-300">
          <KeyRound className="w-5 h-5" />
          <span>گام ۱: بازکردن قفل اتاق مخفی</span>
        </div>
        <p className="text-xs leading-6 text-slate-300">
          هر ساختار شماره‌گذاری‌شده را به خانواده هورمونی مربوط وصل کنید تا به گاوصندوق دسترسی پیدا کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {HIDDEN_STRUCTURES.map((structure) => (
            <label key={structure.id} className="space-y-1 text-[11px] text-slate-300">
              <span>ساختار {structure.id}</span>
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
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-2 py-2 text-xs text-white"
              >
                <option value="">انتخاب خانواده...</option>
                <option value="glucocorticoid">گلوکوکورتیکوئید</option>
                <option value="mineralocorticoid">مینرالوکورتیکوئید</option>
                <option value="androgen">آندروژن</option>
                <option value="progesterone">پروژسترون</option>
                <option value="estrogen">استروژن</option>
              </select>
            </label>
          ))}
        </div>
        {mappingFeedback && (
          <div
            role="status"
            className={`rounded-xl border p-3 text-sm ${
              mappingFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
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

      {/* بخش ۲: گاوصندوق مسیر بیوسنتز کلسترول */}
      <form
        onSubmit={handleVaultSubmit}
        className={`rounded-2xl border p-6 space-y-5 transition ${
          mappingSolved
            ? 'border-slate-700/80 bg-slate-900/80'
            : 'border-slate-800 bg-slate-900/30 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-base text-amber-300">
          <KeyRound className="w-5 h-5" />
          <span>گام ۲: رمزگشایی گاوصندوق بیوسنتز استروئیدها</span>
        </div>

        <p className="text-xs text-slate-300 leading-6">
          واسطه‌های کلیدی مسیر بیوسنتز از <strong>کلسترول (Cholesterol)</strong> و کلیدواژه ۱۴ حرفی را تکمیل کنید:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-300">۱. اولین محصول برش زنجیره جانبی کلسترول (CYP11A1):</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_1}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_1: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              <option value="">انتخاب ترکیب ۱...</option>
              <option value="Pregnenolone">Pregnenolone</option>
              <option value="Aldosterone">Aldosterone</option>
              <option value="Estrone">Estrone</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-300">۲. محصول عمل آنزیم 3β-HSD و ایزومراز روی ترکیب ۱:</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_2}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_2: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              <option value="">انتخاب ترکیب ۲...</option>
              <option value="Progesterone">Progesterone</option>
              <option value="Estriol">Estriol</option>
              <option value="Finasteride">Finasteride</option>
            </select>
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#081220] p-4 space-y-2">
            <div className="text-xs font-bold text-cyan-300">۳. پیش‌ساز مستقیم 5α-DHT و استرادیول (حاصل 17β-HSD):</div>
            <select
              required
              disabled={!mappingSolved || vaultSolved}
              value={biosynthesis.step_3}
              onChange={(e) => setBiosynthesis((p) => ({ ...p, step_3: e.target.value }))}
              dir="ltr"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              <option value="">انتخاب ترکیب ۳...</option>
              <option value="Testosterone">Testosterone</option>
              <option value="Cortisone">Cortisone</option>
              <option value="Spironolactone">Spironolactone</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-amber-200">کلیدواژه رمز گاوصندوق (نام انگلیسی خانواده هورمون‌های قشر آدرنال):</div>
            <div className="text-[11px] text-slate-400 mt-0.5">راهنما: ۱۴ حرف انگلیسی (شروع با CORTICO...)</div>
          </div>
          <input
            type="text"
            required
            disabled={!mappingSolved || vaultSolved}
            dir="ltr"
            placeholder="CORTICO......."
            value={biosynthesis.vault_password}
            onChange={(e) => setBiosynthesis((p) => ({ ...p, vault_password: e.target.value.toUpperCase() }))}
            className="rounded-xl border border-amber-500/50 bg-slate-950 px-4 py-2 text-sm font-mono font-bold text-amber-300 tracking-widest focus:outline-none"
          />
        </div>

        {vaultFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              vaultFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
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

      {/* بخش ۳: اوج بازی — سنتز پادزهر اهریمن */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          vaultSolved
            ? 'border-rose-500/40 bg-slate-900/85'
            : 'border-slate-800 bg-slate-900/30 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-extrabold text-base text-rose-300">
            <Sparkles className="w-5 h-5" />
            <span>گام ۳ (اوج بحران): مهندسی معکوس مولکول اهریمن و سنتز پادزهر</span>
          </div>
          {!antidoteSolved && vaultSolved && (
            <div className="flex items-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-950/60 px-3 py-1.5 text-xs font-bold text-rose-200">
              <Timer className="w-4 h-4 animate-spin" />
              <span>چرخه پایداری راکتور: {climaxTimer} ثانیه</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* نمایش زنده ساختار اهریمن / پادزهر در راکتور */}
          <div dir="ltr" className="lg:col-span-6 rounded-2xl border border-slate-700 bg-[#07111f] p-4 flex flex-col items-center">
            <svg viewBox="0 0 360 225" className="w-full max-w-[360px] h-56">
              {/* حلقه‌های استروئیدی A, B, C, D */}
              <polygon points="55,115 89,95 123,115 123,153 89,173 55,153" fill="none" stroke="#cbd5e1" strokeWidth="2.2" />
              <line x1="35" y1="163" x2="55" y2="153" stroke="#f87171" strokeWidth="2.2" />
              <text x="20" y="170" fill="#f87171" fontSize="12" fontWeight="bold">O</text>
              {/* سیستم کتو-انول */}
              <line x1="61" y1="118" x2="87" y2="103" stroke="#a3e635" strokeWidth="2.2" />
              <line x1="89" y1="173" x2="89" y2="195" stroke="#a3e635" strokeWidth="2" />
              <text x="80" y="208" fill="#a3e635" fontSize="11" fontWeight="bold">OH</text>

              <polygon points="123,115 157,95 191,115 191,153 157,173 123,153" fill="none" stroke="#cbd5e1" strokeWidth="2.2" />
              <polygon points="157,95 191,75 225,95 225,133 191,153 191,115" fill="none" stroke="#cbd5e1" strokeWidth="2.2" />
              <polygon points="225,95 262,106 271,139 247,157 225,133" fill="none" stroke="#cbd5e1" strokeWidth="2.2" />

              {/* اتم فلوئور 9α (اگر حذف نشده باشد) */}
              {!hasRemovedF && (
                <>
                  <line x1="157" y1="115" x2="157" y2="140" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="3,2" />
                  <text x="152" y="153" fill="#22d3ee" fontSize="13" fontWeight="bold">F</text>
                </>
              )}

              {/* گروه‌های سیانید (اگر حذف نشده باشند) */}
              {!hasRemovedCN && (
                <>
                  <line x1="191" y1="153" x2="205" y2="178" stroke="#fbbf24" strokeWidth="2.4" />
                  <text x="202" y="191" fill="#fbbf24" fontSize="12" fontWeight="bold">C≡N</text>
                  <line x1="271" y1="139" x2="292" y2="156" stroke="#fbbf24" strokeWidth="2.4" />
                  <text x="292" y="166" fill="#fbbf24" fontSize="12" fontWeight="bold">C≡N</text>
                </>
              )}

              {/* گروه حجیم آنتاگونیستی 11β-آریل (در صورت افزودن) */}
              {hasAddedAryl ? (
                <g>
                  <polygon points="191,75 173,50 181,46" fill="#34d399" />
                  <polygon points="152,24 172,24 180,40 172,56 152,56 144,40" fill="rgba(52,211,153,0.2)" stroke="#34d399" strokeWidth="2" />
                  <text x="95" y="38" fill="#34d399" fontSize="10" fontWeight="bold">(CH3)2N-Ar</text>
                </g>
              ) : (
                <>
                  <polygon points="191,75 177,52 183,49" fill="#94a3b8" />
                  <text x="163" y="46" fill="#94a3b8" fontSize="11">HO</text>
                </>
              )}

              {/* زنجیره C17 (استر لیپوفیل یا اسید هیدرولیزشده) */}
              <line x1="262" y1="106" x2="288" y2="85" stroke="#c084fc" strokeWidth="2.2" />
              <text x="285" y="79" fill="#c084fc" fontSize="11" fontWeight="bold">C≡CH</text>
              {hasHydrolyzedEster ? (
                <text x="278" y="114" fill="#34d399" fontSize="11" fontWeight="bold">-COOH (قطبی)</text>
              ) : (
                <text x="275" y="114" fill="#f43f5e" fontSize="10" fontWeight="bold">-COO-R-CN</text>
              )}
            </svg>

            <div dir="rtl" className="text-xs font-bold mt-1">
              {hasRemovedF && hasRemovedCN && hasAddedAryl && hasHydrolyzedEster ? (
                <span className="text-emerald-400">وضعیت مولکول: آنتاگونیست بی‌خطر و محلول (پادزهر آماده)</span>
              ) : (
                <span className="text-rose-400">وضعیت مولکول: ترکیب سمی فعال (پروژه اهریمن)</span>
              )}
            </div>
          </div>

          {/* ابزارهای ویرایش مولکول */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-bold text-slate-200 mb-1">
              ابزارهای اصلاح شیمیایی را برای خنثی‌سازی فارماکوفورهای سمی انتخاب کنید:
            </div>
            {ANTIDOTE_TOOLS.map((tool) => {
              const active = selectedTools.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start justify-between gap-3 ${
                    active
                      ? 'border-emerald-400 bg-emerald-950/35'
                      : 'border-slate-700 bg-[#081220] hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-100">{tool.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{tool.desc}</div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md shrink-0 ${
                      active ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {active ? 'اعمال شد ✓' : 'اجرا'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {antidoteFeedback && (
          <div
            className={`rounded-xl border p-4 text-sm flex items-start gap-2.5 ${
              antidoteFeedback.ok
                ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-100'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
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
              onClick={onOpenSurvey}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-3 text-sm transition flex items-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>تکمیل پرسشنامه پژوهشی MEEGA+ و ثبت نهایی ماموریت</span>
            </button>
          ) : (
            <button
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
