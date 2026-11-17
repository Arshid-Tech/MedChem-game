import React, { useState } from 'react';
import { Atom, RotateCw, CheckCircle2, AlertTriangle, FlaskConical, Pill, ShieldAlert } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface Props {
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

const AROMATASE_DRUGS = [
  {
    id: 'A',
    name: 'ترکیب A (اگزمستان - Exemestane)',
    desc: 'مهارکننده استروئیدی غیرقابل برگشت (دارای متیلن C6)',
  },
  {
    id: 'B',
    name: 'ترکیب B (رالوکسیفن - Raloxifene)',
    desc: 'تعدیل‌کننده انتخابی گیرنده استروژن (SERM بنزوتیوفنی)',
  },
  {
    id: 'C',
    name: 'ترکیب C (فولوسترانت - Fulvestrant)',
    desc: 'آنتاگونیست خالص گیرنده استروژن (زنجیره آلکیل سولفوکسید C7α)',
  },
  {
    id: 'D',
    name: 'ترکیب D (لتروزول - Letrozole)',
    desc: 'مهارکننده غیر استروئیدی آروماتاز دارای حلقه تری‌آزول و دو گروه سیانید (-C≡N)',
  },
];

const POTENCY_CARDS = [
  { id: '1', name: 'ترکیب ۱: استرادیول (17β-Estradiol)', desc: 'استروژن طبیعی مرجع با گروه 17β-OH آزاد' },
  { id: '2', name: 'ترکیب ۲: اتینیل استرادیول (Ethinyl Estradiol)', desc: 'دارای گروه 17α-اتینیل مقاوم به متابولیسم کبدی' },
  { id: '3', name: 'ترکیب ۳: دی‌اتیل‌استیل‌بسترول (DES)', desc: 'استروژن غیر استروئیدی ترانس با بالاترین میل ترکیبی و قدرت اثر' },
  { id: '4', name: 'ترکیب ۴: استریول (Estriol)', desc: 'دارای هیدروکسیل 16α و 17β (کمترین قدرت اثر استروژنی)' },
];

export const EstrogenLab: React.FC<Props> = ({
  oralDesignSolved,
  potencySolved,
  metaboliteSolved,
  classificationSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  // معمای ۱: طراحی استروژن خوراکی و طولانی‌اثر از استرادیول
  const [oralMods, setOralMods] = useState<string[]>(
    oralDesignSolved ? ['c17_alpha_ethynyl', 'c3_ester_or_ether'] : []
  );
  const [oralStart] = useState<number>(() => Date.now());
  const [oralFeedback, setOralFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [oralLoading, setOralLoading] = useState(false);

  // معمای ۲: رتبه‌بندی قدرت اثر استروژنی + داکینگ DES
  const [potencyOrder, setPotencyOrder] = useState<string[]>(
    potencySolved ? ['3', '2', '1', '4'] : ['1', '2', '3', '4']
  );
  const [angle, setAngle] = useState<number>(potencySolved ? 180 : 0);
  const [potStart] = useState<number>(() => Date.now());
  const [potFeedback, setPotFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [potLoading, setPotLoading] = useState(false);

  // معمای ۳: اصلاح ساختار برای جلوگیری از تشکیل متابولیت فعال سرطان‌زا
  const [metMod, setMetMod] = useState<string>(metaboliteSolved ? 'block_16alpha_or_catechol' : '');
  const [metStart] = useState<number>(() => Date.now());
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  // معمای ۴: دسته‌بندی آنتی‌استروژن‌ها و مهارکننده‌های آروماتاز
  const [selectedDrug, setSelectedDrug] = useState<string>(classificationSolved ? 'D' : '');
  const [classStart] = useState<number>(() => Date.now());
  const [classFeedback, setClassFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [classLoading, setClassLoading] = useState(false);

  const toggleOralMod = (id: string) => {
    if (oralDesignSolved) return;
    setOralMods((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleOralSubmit = async () => {
    setOralLoading(true);
    setOralFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - oralStart) / 1000));
    try {
      const res = await onSubmitPuzzle('oral_long_acting_design', oralMods, elapsed);
      setOralFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setOralFeedback({ ok: false, text: err.message });
    } finally {
      setOralLoading(false);
    }
  };

  const movePotency = (idx: number, dir: -1 | 1) => {
    if (potencySolved) return;
    const target = idx + dir;
    if (target < 0 || target >= potencyOrder.length) return;
    const copy = [...potencyOrder];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setPotencyOrder(copy);
  };

  const handlePotSubmit = async () => {
    setPotLoading(true);
    setPotFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - potStart) / 1000));
    try {
      const res = await onSubmitPuzzle(
        'estrogen_potency_and_docking',
        { order: potencyOrder, rotation_angle: angle % 360 },
        elapsed
      );
      setPotFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setPotFeedback({ ok: false, text: err.message });
    } finally {
      setPotLoading(false);
    }
  };

  const handleMetSubmit = async () => {
    setMetLoading(true);
    setMetFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - metStart) / 1000));
    try {
      const res = await onSubmitPuzzle('prevent_active_metabolite', metMod, elapsed);
      setMetFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setMetFeedback({ ok: false, text: err.message });
    } finally {
      setMetLoading(false);
    }
  };

  const handleClassSubmit = async () => {
    setClassLoading(true);
    setClassFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - classStart) / 1000));
    try {
      const res = await onSubmitPuzzle('receptor_docking_and_class', { non_steroidal_ai: selectedDrug }, elapsed);
      setClassFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setClassFeedback({ ok: false, text: err.message });
    } finally {
      setClassLoading(false);
    }
  };

  const isAligned = angle % 360 === 180;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-lg">
            <Atom className="w-6 h-6" />
            <span>دپارتمان سوم: آزمایشگاه استروژن‌ها و داکینگ گیرنده هسته‌ای (ERα)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            تیم این بخش روی استروژن‌های خوراکی طولانی‌اثر، اتصال به رسپتور استروژن و مهارکننده‌های آروماتاز تحقیق می‌کردند.
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-300 dark:border-slate-600 hover:border-cyan-500 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: طراحی فرم خوراکی و طولانی‌اثر استروژن */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Pill className="w-5 h-5 text-cyan-500" />
          <span>معمای {toPersianDigits(1)}: تبدیل استرادیول تزریقی به فرم خوراکی و طولانی‌اثر</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          استرادیول طبیعی به دلیل متابولیسم عبور اول کبدی (اکسیداسیون سریع 17β-OH) خوراکی نیست. کدام اصلاحات را برای ایجاد فعالیت خوراکی و افزایش طول اثر اعمال می‌کنید؟
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'c17_alpha_ethynyl', title: 'افزودن گروه 17α-اتینیل (-C≡CH)', desc: 'ممانعت فضایی در برابر آنزیم 17β-HSD و ایجاد فراهمی زیستی خوراکی' },
            { id: 'c3_ester_or_ether', title: 'اتریفیکاسیون C3 (مسترانول) یا استریفیکاسیون', desc: 'افزایش لیپوفیلیته و آزادسازی آهسته برای طولانی‌اثر شدن دارو' },
            { id: 'reduce_ring_a_decoy', title: 'اشباع کردن حلقه آروماتیک A (فریبنده)', desc: 'از بین رفتن کامل اتصال به گیرنده استروژن' },
          ].map((item) => {
            const active = oralMods.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleOralMod(item.id)}
                className={`rounded-xl border p-4 cursor-pointer transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220]'
                }`}
              >
                <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{item.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
              </div>
            );
          })}
        </div>

        {oralFeedback && (
          <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${oralFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
            {oralFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{oralFeedback.text}</span>
          </div>
        )}

        {!oralDesignSolved && (
          <div className="flex justify-end">
            <button disabled={oralLoading || oralMods.length === 0} onClick={handleOralSubmit} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm">
              {oralLoading ? 'در حال بررسی...' : 'تایید اصلاحات خوراکی و طولانی‌اثر'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: رتبه‌بندی قدرت + داکینگ DES در گیرنده */}
      <div className={`rounded-2xl border p-6 space-y-5 transition ${oralDesignSolved ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'}`}>
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          معمای {toPersianDigits(2)}: رتبه‌بندی قدرت اثر استروژنی و داکینگ DES در پاکت ERα
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-2.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
              ترتیب از قوی‌ترین (بالا) به ضعیف‌ترین (پایین):
            </div>
            {potencyOrder.map((id, idx) => {
              const card = POTENCY_CARDS.find((c) => c.id === id)!;
              return (
                <div key={id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 ml-2">
                      {toPersianDigits(idx + 1)}.
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{card.name}</span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</div>
                  </div>
                  {!potencySolved && (
                    <div className="flex gap-1">
                      <button type="button" disabled={idx === 0} onClick={() => movePotency(idx, -1)} className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs disabled:opacity-30">↑</button>
                      <button type="button" disabled={idx === potencyOrder.length - 1} onClick={() => movePotency(idx, 1)} className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-xs disabled:opacity-30">↓</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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
                disabled={potencySolved}
                onClick={() => setAngle((a) => (a + 45) % 360)}
                className="rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/50 px-4 py-2 text-xs font-bold text-cyan-200 flex items-center gap-1.5"
              >
                <RotateCw className="w-4 h-4" /> چرخش {toPersianDigits(45)} درجه ({toPersianDigits(angle)}°)
              </button>
              <span className={`text-xs font-bold ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAligned ? 'پیوند هیدروژنی برقرار شد ✓' : 'در جستجوی زاویه اتصال...'}
              </span>
            </div>
          </div>
        </div>

        {potFeedback && (
          <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${potFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
            {potFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{potFeedback.text}</span>
          </div>
        )}

        {!potencySolved && (
          <div className="flex justify-end">
            <button disabled={potLoading} onClick={handlePotSubmit} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 text-sm">
              {potLoading ? 'در حال بررسی...' : 'تایید رتبه‌بندی و داکینگ'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۳: مهار تشکیل متابولیت فعال */}
      <div className={`rounded-2xl border p-6 space-y-4 transition ${potencySolved ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'}`}>
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <span>معمای {toPersianDigits(3)}: جلوگیری از تبدیل دارو به متابولیت فعال سرطان‌زا</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'block_16alpha_or_catechol', title: 'مسدودسازی موقعیت‌های ارتو (C2/C4) یا 16α با فلوئور', desc: 'جلوگیری از تشکیل کاتکول استروژن و اپوکسیدهای واکنش‌پذیر آسیب‌زننده به DNA' },
            { id: 'add_nitro_group', title: 'افزودن گروه نیترو (-NO2) روی حلقه A', desc: 'افزایش شدید سمیت کبدی و رادیکال‌های آزاد' },
            { id: 'remove_c3_oh', title: 'حذف کامل گروه 3-OH فنولیک', desc: 'از بین رفتن تمایل به گیرنده' },
          ].map((opt) => (
            <div
              key={opt.id}
              onClick={() => !metaboliteSolved && setMetMod(opt.id)}
              className={`rounded-xl border p-4 cursor-pointer transition ${
                metMod === opt.id ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220]'
              }`}
            >
              <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{opt.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
            </div>
          ))}
        </div>
        {metFeedback && (
          <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${metFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
            {metFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{metFeedback.text}</span>
          </div>
        )}
        {!metaboliteSolved && (
          <div className="flex justify-end">
            <button disabled={metLoading || !metMod} onClick={handleMetSubmit} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm">
              {metLoading ? 'در حال بررسی...' : 'تایید اصلاح متابولیک'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۴: شناسایی مهارکننده غیر استروئیدی آروماتاز دارای سیانید */}
      <div className={`rounded-2xl border p-6 space-y-4 transition ${metaboliteSolved ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm' : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'}`}>
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-cyan-500" />
          <span>معمای {toPersianDigits(4)}: شناسایی مهارکننده غیر استروئیدی آروماتاز و استخراج سرنخ</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AROMATASE_DRUGS.map((d) => (
            <div
              key={d.id}
              onClick={() => !classificationSolved && setSelectedDrug(d.id)}
              className={`rounded-xl border p-3.5 cursor-pointer transition ${
                selectedDrug === d.id
                  ? 'border-cyan-500 bg-cyan-50 dark:border-cyan-400 dark:bg-cyan-950/50'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220]'
              }`}
            >
              <div className="font-bold text-xs text-cyan-700 dark:text-cyan-300">{d.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{d.desc}</div>
            </div>
          ))}
        </div>

        {classFeedback && (
          <div className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${classFeedback.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
            {classFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{classFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {classificationSolved ? (
            <button onClick={onBackToMap} className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm">
              ذخیره سرنخ سوم (سیانید) و بازگشت به نقشه ←
            </button>
          ) : (
            <button disabled={classLoading || !selectedDrug} onClick={handleClassSubmit} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm">
              {classLoading ? 'در حال بررسی...' : 'تایید و استخراج سرنخ سوم'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
