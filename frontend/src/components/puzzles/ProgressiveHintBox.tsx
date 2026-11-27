import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  hints: string[];
  solved: boolean;
  disabled?: boolean;
}

export const ProgressiveHintBox: React.FC<Props> = ({ hints, solved, disabled = false }) => {
  const [level, setLevel] = useState<number>(0);

  if (solved || disabled || hints.length === 0) return null;

  return (
    <div className="rounded-[8px] border-2 border-[#18181B] bg-[#FEF3C7] p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#18181B]">
          <Lightbulb className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>مشاوره با مدیر ارشد R&D (راهنمای مفهومی)</span>
        </div>
        {level < hints.length && (
          <button
            type="button"
            onClick={() => setLevel((prev) => Math.min(hints.length, prev + 1))}
            className="btn-tactile btn-tactile-surface px-3 py-1 text-[11px]"
          >
            <span>
              {level === 0
                ? `نمایش راهنمای ${toPersianDigits(1)}`
                : `نمایش راهنمای ${toPersianDigits(level + 1)}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {hints.slice(0, level).map((hintText, idx) => (
        <div
          key={idx}
          className="rounded-[6px] border-2 border-[#18181B] bg-[#FFFFFF] p-2.5 text-xs leading-6 text-[#18181B]"
        >
          <span className="font-bold text-[#0D9488] ml-1">
            راهنمای {toPersianDigits(idx + 1)}:
          </span>
          {hintText}
        </div>
      ))}
    </div>
  );
};
