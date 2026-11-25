import React, { useState } from 'react';
import { FlaskConical, X, Sparkles } from 'lucide-react';
import { SteroidSandbox } from './molecules/SteroidSandbox';

export const FloatingLabBench: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="باز کردن میز کار مولکول‌سازی"
        title="میز کار مولکول‌سازی"
        className="btn-tactile btn-tactile-primary fixed bottom-4 right-4 z-40 p-3 sm:px-4 sm:py-2.5 text-xs sm:text-sm"
      >
        <FlaskConical className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
        <span className="hidden sm:inline">میز کار مولکول‌سازی</span>
        <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="floating-lab-title"
          className="fixed inset-0 z-[90] bg-[#18181B]/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto lab-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#0D9488]" />
                <div>
                  <h2 id="floating-lab-title" className="text-sm sm:text-base font-heading font-bold text-[#18181B]">
                    آزمایشگاه آزاد ساخت مولکول و تحلیل زنده SAR
                  </h2>
                  <p className="text-[11px] text-[#52525B]">
                    در هر مرحله‌ای از بازی می‌توانی اینجا گروه‌های عاملی را آزادانه امتحان کنی و اثر دارویی‌شان را ببینی
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن میز کار"
                className="btn-tactile btn-tactile-surface p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SteroidSandbox mode="free" />
          </div>
        </div>
      )}
    </>
  );
};
