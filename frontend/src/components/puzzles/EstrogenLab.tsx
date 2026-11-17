import React, { useState } from 'react';
import { Atom, RotateCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  oralDesignSolved: boolean;
  potencySolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

const ENZYME_OPTIONS = ['Estradiol dehydrogenase', '16a-hydroxylase', 'Aromatase (CYP19)', '5a-reductase'];

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

export const EstrogenLab: React.FC<Props> = ({
  oralDesignSolved,
  potencySolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  // معمای ۱: مسیر متابولیسم استروژن‌ها
  const [enzymes, setEnzymes] = useState({
    top_horizontal: oralDesignSolved ? 'Estradiol dehydrogenase' : '',
    bottom_horizontal: oralDesignSolved ? 'Estradiol dehydrogenase' : '',
    left_vertical: oralDesignSolved ? '16a-hydroxylase' : '',
    right_vertical: oralDesignSolved ? '16a-hydroxylase' : '',
  });
  const [metStart] = useState<number>(() => Date.now());
  const [metFeedback, setMetFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [metLoading, setMetLoading] = useState(false);

  // معمای ۲: چرخش لیگاند در سایت فعال رسپتور + انتخاب مهارکننده غیر استروئیدی آروماتاز
  const [angle, setAngle] = useState<number>(potencySolved ? 180 : 0);
  const [selectedDrug, setSelectedDrug] = useState<string>(potencySolved ? 'D' : '');
  const [dockStart] = useState<number>(() => Date.now());
  const [dockFeedback, setDockFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [dockLoading, setDockLoading] = useState(false);

  const handleMetSubmit = async () => {
    setMetLoading(true);
    setMetFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - metStart) / 1000));
    try {
      const res = await onSubmitPuzzle('metabolism_enzymes', enzymes, elapsed);
      setMetFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setMetFeedback({ ok: false, text: err.message });
    } finally {
      setMetLoading(false);
    }
  };

  const handleDockSubmit = async () => {
    setDockLoading(true);
    setDockFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - dockStart) / 1000));
    try {
      const res = await onSubmitPuzzle(
        'receptor_docking_and_class',
        { rotation_angle: angle % 360, non_steroidal_ai: selectedDrug },
        elapsed
      );
      setDockFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setDockFeedback({ ok: false, text: err.message });
    } finally {
      setDockLoading(false);
    }
  };

  const isAligned = angle % 360 === 180;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <Atom className="w-6 h-6" />
            <span>دپارتمان سوم: آزمایشگاه استروژن‌ها و داکینگ گیرنده هسته‌ای (ERα)</span>
          </div>
          <p className="text-slate-300 text-sm mt-1 leading-6">
            تیم این بخش روی استروژن‌های خوراکی طولانی‌اثر (اتینیل استرادیول و مسترانول) و مهارکننده‌های آروماتاز تحقیق می‌کردند.
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-600 hover:border-cyan-400 px-4 py-2 text-xs font-semibold text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: چرخه تبدیل استرادیول، استرون و استریول */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-6 space-y-5">
        <h3 className="font-bold text-base text-slate-100">
          معمای ۱: تکمیل نقشه متابولیسم کبدی استروژن‌های درون‌زا
        </h3>

        <div className="rounded-2xl border border-slate-700 bg-[#081220] p-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-3">
              <div className="font-bold text-cyan-300 text-sm">۱. استرادیول (Estradiol - E2)</div>
              <div className="text-[11px] text-slate-400 mt-1">قوی‌ترین استروژن طبیعی (دارای 17β-OH)</div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-300 mb-1">آنزیم تبدیل برگشت‌پذیر E2 ⇄ E1</label>
              <select
                disabled={oralDesignSolved}
                value={enzymes.top_horizontal}
                onChange={(e) => setEnzymes((p) => ({ ...p, top_horizontal: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-purple-500/40 bg-purple-950/30 p-3">
              <div className="font-bold text-purple-300 text-sm">۲. استرون (Estrone - E1)</div>
              <div className="text-[11px] text-slate-400 mt-1">دارای گروه کتون در موقعیت C17=O</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div>
              <label className="block text-[11px] text-emerald-300 mb-1">آنزیم مسیر E2 → E3</label>
              <select
                disabled={oralDesignSolved}
                value={enzymes.left_vertical}
                onChange={(e) => setEnzymes((p) => ({ ...p, left_vertical: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-500 font-mono">↓ هیدروکسیلاسیون موقعیت 16α ↓</div>
            <div>
              <label className="block text-[11px] text-emerald-300 mb-1">آنزیم مسیر E1 → 16α-OH-E1</label>
              <select
                disabled={oralDesignSolved}
                value={enzymes.right_vertical}
                onChange={(e) => setEnzymes((p) => ({ ...p, right_vertical: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3">
              <div className="font-bold text-emerald-300 text-sm">۳. استریول (Estriol - E3)</div>
              <div className="text-[11px] text-slate-400 mt-1">متابولیت نهایی قطبی (16α, 17β-diol)</div>
            </div>

            <div>
              <label className="block text-[11px] text-amber-300 mb-1">آنزیم تبدیل E3 ⇄ 16α-Hydroxyestrone</label>
              <select
                disabled={oralDesignSolved}
                value={enzymes.bottom_horizontal}
                onChange={(e) => setEnzymes((p) => ({ ...p, bottom_horizontal: e.target.value }))}
                dir="ltr"
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-white"
              >
                <option value="">انتخاب آنزیم...</option>
                {ENZYME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3">
              <div className="font-bold text-amber-300 text-sm">۴. 16α-هیدروکسی‌استرون</div>
              <div className="text-[11px] text-slate-400 mt-1">واسطه هیدروکسیله در حلقه D</div>
            </div>
          </div>
        </div>

        {metFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              metFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {metFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{metFeedback.text}</span>
          </div>
        )}

        {!oralDesignSolved && (
          <div className="flex justify-end">
            <button
              disabled={metLoading}
              onClick={handleMetSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {metLoading ? 'در حال بررسی...' : 'تایید مسیر متابولیک'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: چرخش لیگاند در گیرنده + انتخاب مهارکننده غیر استروئیدی آروماتاز */}
      <div
        className={`rounded-2xl border p-6 space-y-6 transition ${
          oralDesignSolved
            ? 'border-slate-700/80 bg-slate-900/75'
            : 'border-slate-800 bg-slate-900/30 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-100">
          معمای ۲: داکینگ دی‌اتیل‌استیل‌بسترول (DES) در پاکت اتصال ERα و شناسایی مهارکننده دارای سیانید
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* شبیه‌ساز چرخش مولکول در سایت فعال */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-700 bg-[#07111f] p-4 flex flex-col items-center">
            <div dir="ltr" className="w-full flex justify-center">
              <svg viewBox="0 0 320 220" className="w-full max-w-[320px] h-52">
                {/* آمینواسیدهای سایت فعال */}
                <rect x="12" y="130" width="76" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" />
                <text x="22" y="148" fill="#38bdf8" fontSize="11" fontWeight="bold">Glu 353 (COO⁻)</text>

                <rect x="115" y="182" width="90" height="28" rx="6" fill="#1e293b" stroke="#38bdf8" />
                <text x="125" y="200" fill="#38bdf8" fontSize="11" fontWeight="bold">Arg 394 (NH₂⁺)</text>

                <rect x="225" y="25" width="82" height="28" rx="6" fill="#1e293b" stroke="#c084fc" />
                <text x="235" y="43" fill="#c084fc" fontSize="11" fontWeight="bold">His 524 (N-H)</text>

                {/* پیوندهای هیدروژنی هنگام هم‌ترازی ۱۸۰ درجه */}
                {isAligned && (
                  <>
                    <line x1="88" y1="142" x2="115" y2="132" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                    <line x1="150" y1="182" x2="140" y2="152" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                    <line x1="225" y1="45" x2="198" y2="75" stroke="#34d399" strokeWidth="2.5" strokeDasharray="4,3" />
                  </>
                )}

                {/* مولکول DES قابل چرخش */}
                <g transform={`rotate(${angle} 160 110)`}>
                  <line x1="145" y1="110" x2="175" y2="110" stroke="#f8fafc" strokeWidth="3" />
                  <line x1="145" y1="115" x2="175" y2="115" stroke="#38bdf8" strokeWidth="2" />
                  {/* حلقه فنل ۱ */}
                  <polygon points="115,95 135,95 145,112 135,130 115,130 105,112" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="80" y="116" fill="#f87171" fontSize="11" fontWeight="bold">HO</text>
                  {/* حلقه فنل ۲ */}
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
                <RotateCw className="w-4 h-4" /> چرخش ۴۵ درجه ({angle}°)
              </button>
              <span className={`text-xs font-bold ${isAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAligned ? 'پیوند هیدروژنی برقرار شد ✓' : 'در جستجوی زاویه اتصال...'}
              </span>
            </div>
          </div>

          {/* انتخاب ترکیب مهارکننده غیر استروئیدی آروماتاز */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold text-slate-200">
              کدام یک از ترکیبات زیر «مهارکننده غیر استروئیدی آروماتاز» است که سرنخ گروه سیانید را آشکار می‌کند؟
            </div>
            {AROMATASE_DRUGS.map((d) => (
              <div
                key={d.id}
                onClick={() => !potencySolved && setSelectedDrug(d.id)}
                className={`rounded-xl border p-3.5 cursor-pointer transition ${
                  selectedDrug === d.id
                    ? 'border-cyan-400 bg-cyan-950/50'
                    : 'border-slate-700 bg-[#081220] hover:border-slate-500'
                }`}
              >
                <div className="font-bold text-xs text-cyan-300">{d.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {dockFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              dockFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {dockFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{dockFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {potencySolved ? (
            <button
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ سوم (سیانید) و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              disabled={dockLoading || !selectedDrug}
              onClick={handleDockSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {dockLoading ? 'در حال ثبت داکینگ...' : 'تایید اتصال رسپتور و استخراج سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
