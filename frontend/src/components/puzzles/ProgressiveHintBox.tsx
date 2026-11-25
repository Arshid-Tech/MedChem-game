import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  hints: [string, string];
  solved: boolean;
  disabled?: boolean;
}

export const ProgressiveHintBox: React.FC<Props> = ({ hints, solved, disabled = false }) => {
  const [level, setLevel] = useState<0 | 1 | 2>(0);

  if (solved || disabled) return null;

  return (
    <div className="rounded-[8px] border-2 border-[#18181B] bg-[#FEF3C7] p-3.5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#18181B]">
          <Lightbulb className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>مشاوره با مدیر ارشد R&D (راهنمای پله‌ای)</span>
        </div>
        {level < 2 && (
          <button
            type="button"
            onClick={() => setLevel((prev) => (prev === 0 ? 1 : 2))}
            className="btn-tactile btn-tactile-surface px-3 py-1 text-[11px]"
          >
            <span>
              {level === 0
                ? `راهنمای سطح ${toPersianDigits(1)} (مفهومی)`
                : `راهنمای سطح ${toPersianDigits(2)} (ساختاری)`}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {level >= 1 && (
        <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FFFFFF] p-2.5 text-xs leading-6 text-[#18181B]">
          <span className="font-bold text-[#F59E0B] ml-1">نکته {toPersianDigits(1)}:</span>
          {hints[0]}
        </div>
      )}

      {level >= 2 && (
        <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FFFFFF] p-2.5 text-xs leading-6 text-[#18181B]">
          <span className="font-bold text-[#0D9488] ml-1">نکته {toPersianDigits(2)}:</span>
          {hints[1]}
        </div>
      )}
    </div>
  );
};
