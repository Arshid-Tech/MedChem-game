import React, { useState } from 'react';
import { Radio, ChevronLeft, ChevronRight, X, Volume2 } from 'lucide-react';
import { STORY_CHARACTERS, StoryBeat } from '../data/storyData';
import { toPersianDigits } from '../utils/persian';

interface Props {
  beat: StoryBeat;
  onClose: () => void;
}

/**
 * پنجره دیالوگ داستانی تعاملی (بی‌سیم مامور مخفی و شخصیت‌های کارخانه دکتر ارول)
 * بازیکن می‌تواند دیالوگ‌ها را گام‌به‌گام بخواند یا رد کند و هر زمان دوباره مرور نماید.
 */
export const StoryCommsModal: React.FC<Props> = ({ beat, onClose }) => {
  const [index, setIndex] = useState(0);
  const currentMsg = beat.messages[index];
  const character = STORY_CHARACTERS[currentMsg.speaker];
  const isLast = index === beat.messages.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-beat-title"
      className="fixed inset-0 z-[95] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/40 bg-white dark:bg-[#091424] text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
        {/* نوار بالای بی‌سیم */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#060e1a]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h2 id="story-beat-title" className="text-sm font-extrabold text-slate-900 dark:text-white">
                {beat.title}
              </h2>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>{beat.timeStamp}</span>
                <span>•</span>
                <span>{beat.location}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پیام داستانی"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بدنه دیالوگ */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 transition-all ${character.accentClass}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {character.emoji}
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    {character.name}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">{character.role}</div>
                </div>
              </div>
              {currentMsg.mood && (
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${character.badgeClass}`}>
                  {currentMsg.mood}
                </span>
              )}
            </div>

            <p className="text-sm leading-8 text-slate-800 dark:text-slate-100 font-medium">
              {currentMsg.text}
            </p>
          </div>

          {/* نشانگر پیشرفت دیالوگ */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {beat.messages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`پیام ${toPersianDigits(i + 1)}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? 'w-6 bg-cyan-500'
                      : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-cyan-400/60'
                  }`}
                />
              ))}
              <span className="mr-2 text-[11px] text-slate-500 dark:text-slate-400">
                {toPersianDigits(index + 1)} از {toPersianDigits(beat.messages.length)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i - 1)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 hover:border-cyan-400 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>قبلی</span>
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 text-xs sm:text-sm flex items-center gap-1.5 transition shadow-md"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>ادامه ماموریت</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i + 1)}
                  className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-5 py-2 text-xs sm:text-sm flex items-center gap-1 transition shadow-md"
                >
                  <span>بعدی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
