import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

interface Props {
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: '۱. گیت بیومتریک ورود به آزمایشگاه',
    desc: 'ابتدا باید قطعات سازنده اسکلت پایه استروئید (حلقه‌های A، B، C، D و زنجیره کتول C17β) را درون راکتور قرار دهید تا دسترسی شما به نقشه شرکت باز شود.',
  },
  {
    title: '۲. کاوش در ۵ دپارتمان تخصصی شیمی دارویی',
    desc: 'هر دپارتمان (گلوکوکورتیکوئیدها، مینرالوکورتیکوئیدها، استروژن‌ها، پروژستین‌ها و آندروژن‌ها) حاوی معماهای SAR، متابولیسم و داکینگ است که با حل آن‌ها سرنخی از ترکیب اهریمن کشف می‌کنید.',
  },
  {
    title: '۳. سنتز پادزهر نهایی و پرسشنامه MEEGA+',
    desc: 'پس از جمع‌آوری هر ۵ سرنخ، وارد اتاق مخفی دکتر ارول شوید، پادزهر آنتاگونیست را سنتز کنید و در پایان پرسشنامه پژوهشی MEEGA+ را ثبت نمایید.',
  },
];

export const GuidedTour: React.FC<Props> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-white dark:bg-[#0d1b2e] text-slate-900 dark:text-slate-100 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>راهنمای ماموریت ({toPersianDigits(step + 1)} از {toPersianDigits(TOUR_STEPS.length)})</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{current.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">{current.desc}</p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" /> قبلی
          </button>

          {step < TOUR_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 text-xs"
            >
              بعدی <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 text-xs"
            >
              شروع ماموریت!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
