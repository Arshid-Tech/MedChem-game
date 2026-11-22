import React, { useState } from 'react';
import { Grid3X3, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

interface CrosswordRow {
  id: string;
  clueNumber: string;
  clue: string;
  answer: string;
  /** نگاشت اندیس حرف (۰-مبنا) به شماره خانه رمز (۱ تا ۱۴) */
  numberedCells: Record<number, number>;
}

const CROSSWORD_ROWS: CrosswordRow[] = [
  {
    id: 'w1',
    clueNumber: '۱ →',
    clue: 'پیش‌ساز ۲۷ کربنه تمام هورمون‌های استروئیدی (Cholesterol)',
    answer: 'CHOLESTEROL',
    numberedCells: { 0: 1, 2: 2, 8: 3 },
  },
  {
    id: 'w2',
    clueNumber: '۲ →',
    clue: 'گلوکوکورتیکوئید طبیعی اصلی بدن (Cortisol)',
    answer: 'CORTISOL',
    numberedCells: { 4: 5, 0: 6, 1: 7, 5: 8 },
  },
  {
    id: 'w3',
    clueNumber: '۳ →',
    clue: 'آندروژن کلیدی و پیش‌ساز مستقیم 5α-DHT و استرادیول (Testosterone)',
    answer: 'TESTOSTERONE',
    numberedCells: { 0: 4, 5: 9, 6: 10, 7: 11, 8: 12 },
  },
  {
    id: 'w4',
    clueNumber: '۴ →',
    clue: 'قوی‌ترین استروژن طبیعی با حلقه A آروماتیک (Estradiol)',
    answer: 'ESTRADIOL',
    numberedCells: { 6: 13, 5: 14 },
  },
];

interface Props {
  disabled?: boolean;
  solved?: boolean;
  onPasswordExtracted: (password: string) => void;
}

/**
 * جدول کلمات متقاطع تعاملی اتاق مخفی دکتر ارول (الهام‌گرفته از برگه مجله علمی روی گاوصندوق).
 * دانشجو با پر کردن کلمات، حروف خانه‌های شماره‌گذاری‌شده ۱ تا ۱۴ را کنار هم می‌بیند
 * تا کلیدواژه ۱۴ حرفی رمز گاوصندوق (CORTICOSTEROID) آشکار شود.
 */
export const BiosynthesisCrossword: React.FC<Props> = ({
  disabled = false,
  solved = false,
  onPasswordExtracted,
}) => {
  const [inputs, setInputs] = useState<Record<string, string>>(() =>
    solved
      ? {
          w1: 'CHOLESTEROL',
          w2: 'CORTISOL',
          w3: 'TESTOSTERONE',
          w4: 'ESTRADIOL',
        }
      : { w1: '', w2: '', w3: '', w4: '' }
  );

  const extractLetters = (current: Record<string, string>): string[] => {
    const slots = Array<string>(14).fill('');
    CROSSWORD_ROWS.forEach((row) => {
      const val = (current[row.id] || '').toUpperCase();
      Object.entries(row.numberedCells).forEach(([idxStr, slotNum]) => {
        const ch = val[Number(idxStr)] || '';
        if (ch) slots[slotNum - 1] = ch;
      });
    });
    return slots;
  };

  const handleRowChange = (rowId: string, raw: string, maxLen: number) => {
    if (disabled || solved) return;
    const cleaned = raw.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, maxLen);
    const next = { ...inputs, [rowId]: cleaned };
    setInputs(next);
    const extracted = extractLetters(next);
    if (extracted.every((ch) => ch !== '')) {
      onPasswordExtracted(extracted.join(''));
    }
  };

  const slots = extractLetters(inputs);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-[#081220] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
          <Grid3X3 className="w-4 h-4 shrink-0" />
          <span>جدول کلمات متقاطع روی گاوصندوق (حروف خانه‌های شماره‌دار ۱ تا ۱۴ = رمز)</span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          با حروف انگلیسی تایپ کن
        </span>
      </div>

      <div className="space-y-3">
        {CROSSWORD_ROWS.map((row) => {
          const val = inputs[row.id] || '';
          const isRowMatch = val === row.answer;
          return (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-3 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 ml-1.5">
                    {row.clueNumber}
                  </span>
                  {row.clue}
                </span>
                <input
                  type="text"
                  dir="ltr"
                  disabled={disabled || solved}
                  maxLength={row.answer.length}
                  placeholder={`${row.answer.length} letters`}
                  value={val}
                  onChange={(e) => handleRowChange(row.id, e.target.value, row.answer.length)}
                  className={`w-44 rounded-lg border px-2.5 py-1 font-mono text-xs uppercase tracking-wider focus:outline-none ${
                    isRowMatch
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-amber-400'
                  }`}
                />
              </div>

              {/* خانه‌های گرافیکی جدول */}
              <div dir="ltr" className="flex flex-wrap gap-1">
                {Array.from({ length: row.answer.length }).map((_, idx) => {
                  const slotNum = row.numberedCells[idx];
                  const char = val[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`relative w-7 h-8 rounded-md border flex items-center justify-center font-mono text-xs font-extrabold ${
                        slotNum
                          ? 'border-rose-500/70 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {slotNum && (
                        <span className="absolute -top-1.5 -right-1 px-1 rounded bg-rose-500 text-white text-[9px] leading-tight">
                          {toPersianDigits(slotNum)}
                        </span>
                      )}
                      <span>{char}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* پیش‌نمایش رمز ۱۴ حرفی استخراج‌شده از خانه‌های قرمز */}
      <div className="rounded-xl border border-rose-500/30 bg-white dark:bg-slate-950/80 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>حروف استخراج‌شده از خانه‌های ۱ تا ۱۴ جدول:</span>
        </div>
        <div dir="ltr" className="flex flex-wrap gap-1 justify-center">
          {slots.map((ch, i) => (
            <div
              key={i}
              className="w-7 h-8 rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 flex flex-col items-center justify-center"
            >
              <span className="text-[8px] text-rose-500 font-bold leading-none">{i + 1}</span>
              <span className="font-mono text-xs font-extrabold text-amber-800 dark:text-amber-200 leading-tight">
                {ch || '·'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
