import React, { useState } from 'react';
import {
  FlaskConical,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { SteroidMoleculeSVG, SteroidRenderProps } from '../molecules/SteroidMoleculeSVG';
import { toPersianDigits } from '../../utils/persian';

interface CompoundCard {
  id: string;
  codeName: string;
  subtitle: string;
  props: SteroidRenderProps;
}

const COMPOUNDS: CompoundCard[] = [
  {
    id: '1',
    codeName: 'ترکیب شماره ۱ (کورتیزون)',
    subtitle: 'دارای گروه 11-کتو (پیش‌دارو، نیازمند احیا به 11β-OH)',
    props: { has11BetaOH: false, has11Keto: true, hasDelta1: false, has9AlphaF: false },
  },
  {
    id: '2',
    codeName: 'ترکیب شماره ۲ (هیدروکورتیزون)',
    subtitle: 'دارای گروه فعال 11β-OH بدون پیوند دوگانه Δ1',
    props: { has11BetaOH: true, hasDelta1: false, has9AlphaF: false },
  },
  {
    id: '3',
    codeName: 'ترکیب شماره ۳ (تریامسینولون)',
    subtitle: 'دارای Δ1 + فلوئور 9α + هیدروکسیل 16α',
    props: { has11BetaOH: true, hasDelta1: true, has9AlphaF: true, c16Sub: 'alpha-OH' },
  },
  {
    id: '4',
    codeName: 'ترکیب شماره ۴ (متیل‌پردنیزولون)',
    subtitle: 'دارای پیوند دوگانه Δ1 و گروه متیل 6α بدون فلوئور',
    props: { has11BetaOH: true, hasDelta1: true, has9AlphaF: false, c6AlphaSub: 'CH3' },
  },
  {
    id: '5',
    codeName: 'ترکیب شماره ۵ (بتامتازون / دگزامتازون)',
    subtitle: 'دارای Δ1 + فلوئور 9α + استخلاف متیل در موقعیت C16',
    props: { has11BetaOH: true, hasDelta1: true, has9AlphaF: true, c16Sub: 'beta-CH3' },
  },
  {
    id: '6',
    codeName: 'ترکیب شماره ۶ (پردنیزولون)',
    subtitle: 'دارای پیوند دوگانه Δ1 (C1=C2) و گروه 11β-OH',
    props: { has11BetaOH: true, hasDelta1: true, has9AlphaF: false },
  },
];

interface Props {
  conformationSolved: boolean;
  sarSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

export const GlucocorticoidLab: React.FC<Props> = ({
  conformationSolved,
  sarSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  const [conf, setConf] = useState<{ H8: string; H9: string; H14: string }>(
    conformationSolved
      ? { H8: 'beta', H9: 'alpha', H14: 'alpha' }
      : { H8: '', H9: '', H14: '' }
  );
  const [confStart] = useState<number>(() => Date.now());
  const [confFeedback, setConfFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [confLoading, setConfLoading] = useState(false);

  const [order, setOrder] = useState<string[]>(
    sarSolved ? ['5', '3', '4', '6', '2', '1'] : ['1', '2', '3', '4', '5', '6']
  );
  const [sarStart] = useState<number>(() => Date.now());
  const [sarFeedback, setSarFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [sarLoading, setSarLoading] = useState(false);

  const handleConfSubmit = async () => {
    setConfLoading(true);
    setConfFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - confStart) / 1000));
    try {
      const res = await onSubmitPuzzle('conformation_lock', conf, elapsed);
      setConfFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setConfFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setConfLoading(false);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (sarSolved) return;
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const copy = [...order];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    setOrder(copy);
  };

  const handleSarSubmit = async () => {
    setSarLoading(true);
    setSarFeedback(null);
    const elapsed = Math.max(1, Math.round((Date.now() - sarStart) / 1000));
    try {
      const res = await onSubmitPuzzle('sar_potency_sort', order, elapsed);
      setSarFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setSarFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setSarLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-lg">
            <FlaskConical className="w-6 h-6" />
            <span>دپارتمان اول: آزمایشگاه گلوکوکورتیکوئیدها (دفتر سابق دکتر ارول)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            یادداشت روی دیوار آزمایشگاه: <em>«هر چقدر قدرت ضدالتهابی را بیشتر کنی، به فرمول اهریمن نزدیک‌تر می‌شوی...»</em>
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

      {/* معمای ۱: قفل کانفورماسیون استریوشیمیایی */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {conformationSolved ? (
              <Unlock className="w-5 h-5 text-emerald-500" />
            ) : (
              <Lock className="w-5 h-5 text-amber-500" />
            )}
            <span>معمای {toPersianDigits(1)}: تنظیم کانفورماسیون فضایی هیدروژن‌های اتصال حلقه‌ها</span>
          </h3>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              conformationSolved
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
            }`}
          >
            {conformationSolved ? 'قفل باز شده ✓' : 'قفل امنیتی فعال'}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">
          برای دسترسی به سیستم کامپیوتر دکتر ارول، آرایش فضایی (آلفا با پیوند خط‌چین به سمت پشت صفحه یا بتا با گوه توپر به سمت جلوی صفحه)
          را برای سه اتم هیدروژن کلیدی در اتصالات حلقه‌های <strong>B/C</strong> و <strong>C/D</strong> (کربن‌های 8، 9 و 14) در گلوکوکورتیکوئیدهای فعال بیولوژیک تنظیم کنید:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['H8', 'H9', 'H14'] as const).map((pos) => (
            <div
              key={pos}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 flex flex-col items-center gap-3"
            >
              <div dir="ltr" className="font-mono text-base font-bold text-cyan-700 dark:text-cyan-300">
                موقعیت {pos}
              </div>
              <div className="flex gap-2 w-full">
                <button
                  type="button"
                  disabled={conformationSolved}
                  onClick={() => setConf((prev) => ({ ...prev, [pos]: 'alpha' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                    conf[pos] === 'alpha'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-800 dark:text-cyan-200'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  α (خط‌چین / پشت)
                </button>
                <button
                  type="button"
                  disabled={conformationSolved}
                  onClick={() => setConf((prev) => ({ ...prev, [pos]: 'beta' }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                    conf[pos] === 'beta'
                      ? 'border-purple-500 bg-purple-500/20 text-purple-800 dark:text-purple-200'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  β (گوه توپر / جلو)
                </button>
              </div>
            </div>
          ))}
        </div>

        {confFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              confFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {confFeedback.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{confFeedback.text}</span>
          </div>
        )}

        {!conformationSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={confLoading || !conf.H8 || !conf.H9 || !conf.H14}
              onClick={handleConfSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {confLoading ? 'در حال بررسی...' : 'ثبت آرایش فضایی و باز کردن کامپیوتر'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: مرتب‌سازی قدرت اثر SAR گلوکوکورتیکوئیدها */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          conformationSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-500" />
            <span>معمای {toPersianDigits(2)}: تحلیل رابطه ساختار-اثر (SAR) و رتبه‌بندی قدرت ضدالتهابی</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            از قوی‌ترین (رتبه {toPersianDigits(1)}) به ضعیف‌ترین (رتبه {toPersianDigits(6)})
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">
          در ایمیل بازیابی‌شده از دکتر ارول آمده است: <em>«این ۶ مشتق کورتیکواستروئیدی را از قوی‌ترین به ضعیف‌ترین مرتب کن تا ویژگی مشترک دو ترکیب فوق‌قوی برایت آشکار شود.»</em>
          با دکمه‌های بالا و پایین، ترتیب کارت‌ها را از <strong>قوی‌ترین (بالا)</strong> به <strong>ضعیف‌ترین (پایین)</strong> بچینید:
        </p>

        <div className="space-y-3">
          {order.map((compId, idx) => {
            const comp = COMPOUNDS.find((c) => c.id === compId)!;
            return (
              <div
                key={comp.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#081220] p-4 flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 font-extrabold flex items-center justify-center shrink-0">
                    {toPersianDigits(idx + 1)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{comp.codeName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{comp.subtitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <SteroidMoleculeSVG {...comp.props} compact />
                  {!sarSolved && (
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, -1)}
                        title="افزایش رتبه قدرت"
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-400 disabled:opacity-30 text-slate-700 dark:text-slate-200"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === order.length - 1}
                        onClick={() => moveItem(idx, 1)}
                        title="کاهش رتبه قدرت"
                        className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-400 disabled:opacity-30 text-slate-700 dark:text-slate-200"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sarFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              sarFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {sarFeedback.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{sarFeedback.text}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {sarSolved ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ اول و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              type="button"
              disabled={sarLoading}
              onClick={handleSarSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {sarLoading ? 'در حال اعتبارسنجی ترتیب...' : 'ثبت ترتیب قدرت و استخراج سرنخ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
