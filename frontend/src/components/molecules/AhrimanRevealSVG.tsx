import React from 'react';
import { Skull, Sparkles } from 'lucide-react';

/**
 * نمایش ساختار واقعی و رنگ‌آمیزی‌شده مولکول «اهریمن» (مطابق صفحه پایانی کارخانه مولکول دکتر ارول)
 * با هایلایت رنگی هر ۵ سرنخ کشف‌شده از ۵ اتاق کارخانه.
 */
export const AhrimanRevealSVG: React.FC = () => {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-slate-950 via-[#081220] to-slate-950 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm sm:text-base">
          <Skull className="w-5 h-5 text-rose-400" />
          <span>تبریک می‌گم! تو به ساختار نهایی مولکول «اهریمن» رسیدی</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-400/40 px-2.5 py-0.5 text-[11px] font-bold text-rose-200">
          <Sparkles className="w-3 h-3" />
          ترکیب هر ۵ سرنخ
        </span>
      </div>

      <div dir="ltr" className="w-full flex justify-center bg-white rounded-xl p-3 sm:p-4">
        <svg
          viewBox="0 0 430 235"
          className="w-full max-w-[440px] h-56"
          role="img"
          aria-label="ساختار رنگ‌آمیزی‌شده مولکول اهریمن"
        >
          {/* هایلایت‌های رنگی مطابق ۵ سرنخ */}
          {/* ۱. کتو-انول مهار ۵-آلفا ردوکتاز (سبز لیمویی) */}
          <path
            d="M 32 168 L 58 152 L 58 114 L 91 95"
            fill="none"
            stroke="rgba(163,230,53,0.45)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="91" cy="196" r="15" fill="rgba(163,230,53,0.45)" />

          {/* ۲. گلوکوکورتیکوئید قوی با فلوئور (سبزآبی) */}
          <circle cx="136" cy="40" r="15" fill="rgba(45,212,191,0.38)" />
          <circle cx="157" cy="128" r="14" fill="rgba(45,212,191,0.38)" />
          <circle cx="190" cy="64" r="13" fill="rgba(45,212,191,0.38)" />
          <circle cx="157" cy="198" r="12" fill="rgba(45,212,191,0.38)" />

          {/* ۳. خاصیت پروژسترونی — اتینیل 17α (بنفش) */}
          <path
            d="M 259 46 L 235 16"
            fill="none"
            stroke="rgba(168,85,247,0.38)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* ۴. استر موضعی لیپوفیل (صورتی) */}
          <path
            d="M 284 46 L 314 60 L 340 44 L 365 58"
            fill="none"
            stroke="rgba(244,114,182,0.4)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ۵. گروه‌های سیانید (نارنجی/طلایی) */}
          <path
            d="M 190 114 L 214 148"
            fill="none"
            stroke="rgba(251,191,36,0.45)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M 259 106 L 274 136"
            fill="none"
            stroke="rgba(251,191,36,0.45)"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M 365 58 L 398 76"
            fill="none"
            stroke="rgba(251,191,36,0.45)"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* اسکلت ۴ حلقه‌ای استروئید */}
          {/* حلقه A */}
          <polygon points="58,114 91,95 124,114 124,152 91,171 58,152" fill="none" stroke="#0f172a" strokeWidth="2.2" />
          <line x1="64" y1="118" x2="90" y2="103" stroke="#0f172a" strokeWidth="2" />
          {/* C3=O و 4-OH (کتو-انول) */}
          <line x1="36" y1="162" x2="57" y2="150" stroke="#0f172a" strokeWidth="2" />
          <line x1="39" y1="167" x2="60" y2="155" stroke="#0f172a" strokeWidth="2" />
          <text x="20" y="172" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="monospace">O</text>
          <line x1="91" y1="171" x2="91" y2="189" stroke="#0f172a" strokeWidth="2" />
          <text x="81" y="203" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">OH</text>

          {/* حلقه B */}
          <polygon points="124,114 157,95 190,114 190,152 157,171 124,152" fill="none" stroke="#0f172a" strokeWidth="2.2" />
          {/* 6α-CH3 */}
          <line x1="157" y1="171" x2="157" y2="196" stroke="#0f172a" strokeWidth="2" strokeDasharray="3,2" />
          {/* 9α-F */}
          <line x1="157" y1="95" x2="157" y2="120" stroke="#0f172a" strokeWidth="2.2" strokeDasharray="3,2" />
          <text x="153" y="133" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="monospace">F</text>
          {/* 8-CN */}
          <line x1="190" y1="114" x2="210" y2="138" stroke="#0f172a" strokeWidth="2" />
          <line x1="210" y1="138" x2="210" y2="154" stroke="#0f172a" strokeWidth="2" />
          <line x1="214" y1="138" x2="214" y2="154" stroke="#0f172a" strokeWidth="1.6" />
          <line x1="206" y1="138" x2="206" y2="154" stroke="#0f172a" strokeWidth="1.6" />
          <text x="206" y="166" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">N</text>

          {/* حلقه C */}
          <polygon points="157,95 157,57 190,38 223,57 223,95 190,114" fill="none" stroke="#0f172a" strokeWidth="2.2" />
          {/* 11β-OH */}
          <polygon points="157,57 140,44 145,38" fill="#0f172a" />
          <text x="122" y="42" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">HO</text>
          {/* 12-F */}
          <line x1="190" y1="38" x2="190" y2="58" stroke="#0f172a" strokeWidth="2" />
          <text x="186" y="70" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">F</text>

          {/* حلقه D */}
          <polygon points="223,57 259,46 281,76 259,106 223,95" fill="none" stroke="#0f172a" strokeWidth="2.2" />
          {/* 16α-CH3 */}
          <line x1="281" y1="76" x2="300" y2="85" stroke="#0f172a" strokeWidth="2" strokeDasharray="3,2" />
          {/* 15-CN */}
          <line x1="259" y1="106" x2="270" y2="128" stroke="#0f172a" strokeWidth="2" />
          <line x1="263" y1="104" x2="274" y2="126" stroke="#0f172a" strokeWidth="1.6" />
          <text x="270" y="142" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">N</text>

          {/* 17α-اتینیل (پروژسترونی) */}
          <line x1="259" y1="46" x2="245" y2="26" stroke="#0f172a" strokeWidth="2" />
          <line x1="245" y1="26" x2="233" y2="12" stroke="#0f172a" strokeWidth="2" />
          <line x1="241" y1="29" x2="229" y2="15" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="249" y1="23" x2="237" y2="9" stroke="#0f172a" strokeWidth="1.5" />

          {/* زنجیره استر لیپوفیل موضعی + سیانید انتهایی */}
          <line x1="259" y1="46" x2="286" y2="46" stroke="#0f172a" strokeWidth="2" />
          <line x1="284" y1="46" x2="284" y2="26" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="288" y1="46" x2="288" y2="26" stroke="#0f172a" strokeWidth="1.8" />
          <text x="281" y="22" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">O</text>

          <line x1="286" y1="46" x2="306" y2="57" stroke="#0f172a" strokeWidth="2" />
          <text x="307" y="65" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">O</text>
          <line x1="319" y1="56" x2="340" y2="44" stroke="#0f172a" strokeWidth="2" />
          <line x1="338" y1="44" x2="338" y2="25" stroke="#0f172a" strokeWidth="1.8" />
          <line x1="342" y1="44" x2="342" y2="25" stroke="#0f172a" strokeWidth="1.8" />
          <text x="335" y="21" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">O</text>

          <line x1="340" y1="44" x2="365" y2="58" stroke="#0f172a" strokeWidth="2" />
          <line x1="365" y1="58" x2="395" y2="74" stroke="#0f172a" strokeWidth="2" />
          <line x1="367" y1="54" x2="397" y2="70" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="363" y1="62" x2="393" y2="78" stroke="#0f172a" strokeWidth="1.5" />
          <text x="399" y="81" fill="#0f172a" fontSize="12" fontWeight="bold" fontFamily="monospace">N</text>
        </svg>
      </div>

      {/* راهنمای رنگ‌های ۵ سرنخ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[11px]">
        <div className="rounded-lg border border-teal-400/40 bg-teal-500/10 px-2.5 py-1.5 text-teal-200 font-semibold">
          ● گلوکوکورتیکوئید قوی + فلوئور
        </div>
        <div className="rounded-lg border border-pink-400/40 bg-pink-500/10 px-2.5 py-1.5 text-pink-200 font-semibold">
          ● استر لیپوفیل موضعی
        </div>
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-2.5 py-1.5 text-amber-200 font-semibold">
          ● گروه‌های سیانید (-C≡N)
        </div>
        <div className="rounded-lg border border-purple-400/40 bg-purple-500/10 px-2.5 py-1.5 text-purple-200 font-semibold">
          ● اتینیل 17α (پروژسترونی)
        </div>
        <div className="rounded-lg border border-lime-400/40 bg-lime-500/10 px-2.5 py-1.5 text-lime-200 font-semibold">
          ● کتو-انول مهار 5α-ردوکتاز
        </div>
      </div>
    </div>
  );
};
