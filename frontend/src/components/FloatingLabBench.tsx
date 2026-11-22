import React, { useState } from 'react';
import { FlaskConical, X, Sparkles } from 'lucide-react';
import { SteroidSandbox } from './molecules/SteroidSandbox';

/**
 * دکمه شناور و پنجره «میز کار آزاد مولکول‌سازی» که در تمام صفحات بازی در دسترس است
 * تا دانشجو هر زمان خواست آزادانه ساختار استروئیدی بسازد و اثر SAR آن را ببیند.
 */
export const FloatingLabBench: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-2xl border border-cyan-400/60 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold px-4 py-3 text-xs sm:text-sm shadow-xl shadow-cyan-950/30 flex items-center gap-2 transition"
      >
        <FlaskConical className="w-4 h-4 shrink-0" />
        <span>میز کار مولکول‌سازی</span>
        <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-lab-title"
          className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border border-cyan-500/40 bg-white dark:bg-[#091424] text-slate-900 dark:text-slate-100 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <div>
                  <h2 id="floating-lab-title" className="text-sm sm:text-base font-extrabold">
                    آزمایشگاه آزاد ساخت مولکول و تحلیل زنده SAR
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    در هر مرحله‌ای از بازی می‌توانی اینجا گروه‌های عاملی را آزادانه امتحان کنی و اثر دارویی‌شان را ببینی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن میز کار"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SteroidSandbox mode="free" />
          </div>
        </div>
      )}
    </>
  );
};
