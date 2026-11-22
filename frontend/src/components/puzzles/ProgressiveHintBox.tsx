import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  hints: [string, string];
  solved: boolean;
  disabled?: boolean;
}

/**
 * سیستم راهنمای پله‌ای ۲ سطحی (مشاوره با مدیر ارشد R&D)
 * به جای آزمون و خطای کور، دانشجو ابتدا نکته مفهومی (سطح ۱) و در صورت نیاز نکته ساختاری (سطح ۲) را دریافت می‌کند.
 */
export const ProgressiveHintBox: React.FC<Props> = ({ hints, solved, disabled = false }) => {
  const [level, setLevel] = useState<0 | 1 | 2>(0);

  if (solved || disabled) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
          <Lightbulb className="w-4 h-4 shrink-0" />
          <span>مشاوره با مدیر ارشد R&D (راهنمای پله‌ای)</span>
        </div>
        {level < 2 && (
          <button
            type="button"
            onClick={() => setLevel((prev) => (prev === 0 ? 1 : 2))}
            className="rounded-lg border border-amber-500/40 bg-white dark:bg-slate-900 hover:border-amber-400 px-3 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 transition flex items-center gap-1"
          >
            <span>
              {level === 0
                ? `نمایش راهنمای سطح ${toPersianDigits(1)} (مفهومی)`
                : `نمایش راهنمای سطح ${toPersianDigits(2)} (ساختاری)`}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {level >= 1 && (
        <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 border border-amber-500/20 p-2.5 text-xs leading-6 text-slate-700 dark:text-slate-200">
          <span className="font-bold text-amber-700 dark:text-amber-300 ml-1">
            نکته {toPersianDigits(1)}:
          </span>
          {hints[0]}
        </div>
      )}

      {level >= 2 && (
        <div className="rounded-lg bg-white/80 dark:bg-slate-900/70 border border-amber-500/30 p-2.5 text-xs leading-6 text-slate-700 dark:text-slate-200">
          <span className="font-bold text-cyan-700 dark:text-cyan-300 ml-1">
            نکته {toPersianDigits(2)}:
          </span>
          {hints[1]}
        </div>
      )}
    </div>
  );
};
