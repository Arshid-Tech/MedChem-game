import React, { useState } from 'react';
import { Shield, Lock, Unlock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';

interface Props {
  codeSolved: boolean;
  designSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

const PROGESTIN_STRUCTURES = [
  { id: '1', name: 'ترکیب ۱ (مژسترول استات)', note: 'مشتق پرگنان با متیل C6 و استات C17α (بدون اکسیم C3)' },
  { id: '2', name: 'ترکیب ۲ (نورژستیمات)', note: 'مشتق ۱۹-نورآندروستان دارای اکسیم C3، اتینیل 17α و استات 17β' },
  { id: '3', name: 'ترکیب ۳ (پیش‌داروی اکسیم-استر 6α-متیل)', note: 'دارای اکسیم C3، استات C17α و متیل ممانعت‌کننده در C6α' },
  { id: '4', name: 'ترکیب ۴ (اتینودیول دی‌استات)', note: 'دارای استرهای 3β و 17β-دی‌استات و اتینیل 17α (بدون اکسیم C3)' },
];

const DESIGN_MODIFICATIONS = [
  {
    id: 'remove_c19_methyl',
    title: 'حذف گروه متیل زاویه‌ای C19 (تبدیل به اسکلت ۱۹-نورآندروستان)',
    effect: 'کاهش شدید خواص آندروژنی و تقویت انتخاب‌پذیری گیرنده پروژسترون',
  },
  {
    id: 'c17_alpha_ethynyl',
    title: 'افزودن گروه اتینیل (-C≡CH) در موقعیت 17α',
    effect: 'جلوگیری از اکسیداسیون کبدی C17-OH و ایجاد فعالیت خوراکی (Oral Activity)',
  },
  {
    id: 'c3_oxime_or_ester',
    title: 'استریفیکاسیون 17β یا تبدیل C3 به اکسیم (=N-OH)',
    effect: 'افزایش لیپوفیلیته و طولانی‌تر شدن نیمه‌عمر و طول اثر دارو',
  },
  {
    id: 'aromatize_ring_a',
    title: 'آروماتیک کردن حلقه A (فریبنده — مربوط به استروژن‌ها)',
    effect: 'تبدیل مولکول به لیگاند گیرنده استروژن و از بین رفتن اثر پروژسترونی',
  },
];

export const ProgestinLab: React.FC<Props> = ({
  codeSolved,
  designSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  const [checks, setChecks] = useState<{
    bioavailability: string[];
    half_life: string[];
    low_androgen: string[];
  }>(
    codeSolved
      ? { bioavailability: ['3', '4'], half_life: ['2', '3', '4'], low_androgen: ['1', '2', '3'] }
      : { bioavailability: [], half_life: [], low_androgen: [] }
  );
  const [codeStart] = useState<number>(() => Date.now());
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  const [selectedMods, setSelectedMods] = useState<string[]>(
    designSolved ? ['remove_c19_methyl', 'c17_alpha_ethynyl', 'c3_oxime_or_ester'] : []
  );
  const [designStart] = useState<number>(() => Date.now());
  const [designFeedback, setDesignFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [designLoading, setDesignLoading] = useState(false);

  const toggleCheck = (row: keyof typeof checks, num: string) => {
    if (codeSolved) return;
    setChecks((prev) => {
      const exists = prev[row].includes(num);
      const next = exists ? prev[row].filter((x) => x !== num) : [...prev[row], num].sort();
      return { ...prev, [row]: next };
    });
  };

  const sumDigits = (arr: string[]) => arr.reduce((acc, v) => acc + Number(v), 0);

  const handleCodeSubmit = async () => {
    setCodeLoading(true);
    setCodeFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - codeStart) / 1000));
    try {
      const res = await onSubmitPuzzle('pk_safe_code', checks, elapsed);
      setCodeFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setCodeFeedback({ ok: false, text: err.message });
    } finally {
      setCodeLoading(false);
    }
  };

  const toggleMod = (id: string) => {
    if (designSolved) return;
    setSelectedMods((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDesignSubmit = async () => {
    setDesignLoading(true);
    setDesignFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - designStart) / 1000));
    try {
      const res = await onSubmitPuzzle('norandrostane_design', selectedMods, elapsed);
      setDesignFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: any) {
      setDesignFeedback({ ok: false, text: err.message });
    } finally {
      setDesignLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <Shield className="w-6 h-6" />
            <span>دپارتمان چهارم: بخش پروژستین‌ها و مشتقات ۱۹-نورآندروستان</span>
          </div>
          <p className="text-slate-300 text-sm mt-1 leading-6">
            محققان این بخش یادداشتی درباره نحوه خنثی‌سازی اثرات پروژسترونی ترکیب اهریمن در گاوصندوق رمزگذاری کرده‌اند.
          </p>
        </div>
        <button
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-600 hover:border-cyan-400 px-4 py-2 text-xs font-semibold text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: رمزگشایی کد گاوصندوق */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
            {codeSolved ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            <span>معمای ۱: رمزگشایی کد دیجیتال گاوصندوق بر اساس ویژگی‌های فارماکوکینتیک</span>
          </h3>
          <div dir="ltr" className="font-mono text-xs bg-slate-950 border border-cyan-500/40 px-3 py-1 rounded-lg text-cyan-300">
            CODE: {sumDigits(checks.bioavailability)} / {sumDigits(checks.half_life)} / {sumDigits(checks.low_androgen)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROGESTIN_STRUCTURES.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-700 bg-[#081220] p-3">
              <div className="font-bold text-xs text-cyan-300">{s.name}</div>
              <div className="text-[11px] text-slate-400 mt-1">{s.note}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {(
            [
              { key: 'bioavailability', label: '↑ افزایش فراهمی زیستی (Bioavailability)' },
              { key: 'half_life', label: '↑ افزایش نیمه‌عمر (Half-life)' },
              { key: 'low_androgen', label: '↓ کاهش عوارض آندروژنی (Low Androgenicity)' },
            ] as const
          ).map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3"
            >
              <span className="text-xs font-bold text-slate-200">{row.label}</span>
              <div className="flex items-center gap-2">
                {['1', '2', '3', '4'].map((num) => {
                  const active = checks[row.key].includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={codeSolved}
                      onClick={() => toggleCheck(row.key, num)}
                      className={`w-9 h-9 rounded-lg font-mono text-sm font-bold border transition ${
                        active
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {codeFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              codeFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {codeFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{codeFeedback.text}</span>
          </div>
        )}

        {!codeSolved && (
          <div className="flex justify-end">
            <button
              disabled={
                codeLoading ||
                !checks.bioavailability.length ||
                !checks.half_life.length ||
                !checks.low_androgen.length
              }
              onClick={handleCodeSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {codeLoading ? 'در حال بررسی رمز...' : 'وارد کردن رمز گاوصندوق'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: طراحی پروژستین خوراکی طولانی‌اثر */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          codeSolved
            ? 'border-slate-700/80 bg-slate-900/75'
            : 'border-slate-800 bg-slate-900/30 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span>معمای ۲: اعمال اصلاحات ساختاری برای تولید پروژستین خوراکی و طولانی‌اثر</span>
        </h3>

        <div className="space-y-2.5">
          {DESIGN_MODIFICATIONS.map((mod) => {
            const active = selectedMods.includes(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => toggleMod(mod.id)}
                className={`rounded-xl border p-4 cursor-pointer transition flex items-start justify-between gap-3 ${
                  active
                    ? 'border-cyan-400 bg-cyan-950/45'
                    : 'border-slate-700 bg-[#081220] hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-slate-100">{mod.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{mod.effect}</div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md shrink-0 ${
                    active ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {active ? 'اعمال شد ✓' : 'انتخاب'}
                </span>
              </div>
            );
          })}
        </div>

        {designFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              designFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/40 text-rose-200'
            }`}
          >
            {designFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{designFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end">
          {designSolved ? (
            <button
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ چهارم و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              disabled={designLoading || selectedMods.length === 0}
              onClick={handleDesignSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {designLoading ? 'در حال سنتز...' : 'تایید اصلاحات ساختاری'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
