import React, { useState } from 'react';
import { BookOpenCheck, AlertTriangle, X, Sparkles } from 'lucide-react';
import { api } from '../api';
import { MolecularTrophyBadge } from './visuals/ChemBadges';
import { toPersianDigits } from '../utils/persian';

interface Props {
  phase: 'pre' | 'post';
  preScorePercent?: number | null;
  onClose: () => void;
  onSubmitted: (phase: 'pre' | 'post', assessment: any) => void;
}

const QUESTIONS: {
  id: string;
  question: string;
  options: { key: 'a' | 'b' | 'c' | 'd'; text: string }[];
  explanation: string;
}[] = [
  {
    id: 'k1',
    question:
      'در گلوکوکورتیکوئیدهای فلوئوردار (9α-F)، افزودن استخلاف متیل یا هیدروکسیل روی کربن C16 چه اثر کلیدی ایجاد می‌کند؟',
    options: [
      { key: 'a', text: 'افزایش شدید احتباس آب و سدیم (اثر مینرالوکورتیکوئیدی)' },
      { key: 'b', text: 'حذف یا کاهش شدید اثر مینرالوکورتیکوئیدی با حفظ قدرت ضدالتهابی بالا' },
      { key: 'c', text: 'از بین رفتن کامل اتصال به گیرنده گلوکوکورتیکوئید' },
      { key: 'd', text: 'تبدیل مولکول به پیش‌داروی نیازمند احیا در کبد' },
    ],
    explanation:
      'استخلاف C16 (مانند 16α-OH در تریامسینولون یا 16α/β-CH3 در دگزامتازون و بتامتازون) اثر احتباس سدیم ناشی از 9α-F را تقریباً به صفر می‌رساند.',
  },
  {
    id: 'k2',
    question:
      'کدام ویژگی ساختاری کورتیکواستروئیدها را برای مصرف موضعی (پوستی) با نفوذ بالا و جذب سیستمیک ناچیز مناسب می‌سازد؟',
    options: [
      { key: 'a', text: 'افزودن گروه فسفات یا همی‌سوکسینات یونی روی C21' },
      { key: 'b', text: 'حذف پیوند دوگانه Δ4 و گروه کتون C3' },
      { key: 'c', text: 'ایجاد کتال حلقوی 16α,17α-استونید یا استرهای لیپوفیل C17/C21' },
      { key: 'd', text: 'آروماتیک کردن حلقه A مشابه استروژن‌ها' },
    ],
    explanation:
      'استونیدها و استرهای لیپوفیل (مانند فلوسینولون استونید و بتامتازون والرات) با افزایش LogP، نفوذ به لایه شاخی پوست را به حداکثر می‌رسانند.',
  },
  {
    id: 'k3',
    question:
      'دلیل اصلی فعال بودن خوراکی «اتینیل‌استرادیول» نسبت به استرادیول طبیعی چیست؟',
    options: [
      { key: 'a', text: 'ممانعت فضایی گروه 17α-اتینیل در برابر اکسیداسیون کبدی C17-OH توسط 17β-HSD' },
      { key: 'b', text: 'حذف گروه فنولی 3-OH از حلقه A' },
      { key: 'c', text: 'افزایش انحلال‌پذیری در آب توسط حلقه تری‌آزول' },
      { key: 'd', text: 'تبدیل شدن مستقیم به استریول در معده' },
    ],
    explanation:
      'گروه 17α-اتینیل مانع اکسیداسیون سریع 17β-OH به استرون کم‌اثر در عبور اول کبدی می‌شود.',
  },
  {
    id: 'k4',
    question:
      'حذف گروه متیل زاویه‌ای C19 (ایجاد اسکلت ۱۹-نورآندروستان) در طراحی پروژستین‌ها چه نتیجه‌ای دارد؟',
    options: [
      { key: 'a', text: 'افزایش شدید عوارض آندروژنی و تبدیل به DHT' },
      { key: 'b', text: 'ایجاد خاصیت مهارکنندگی آروماتاز' },
      { key: 'c', text: 'جلوگیری از اتصال دارو به گیرنده پروژسترون' },
      { key: 'd', text: 'کاهش عوارض آندروژنی و تقویت انتخاب‌پذیری برای گیرنده پروژسترون' },
    ],
    explanation:
      'حذف متیل C19 (مشتقات ۱۹-نور) میل اتصال به گیرنده پروژسترون را تقویت و اثرات ناخواسته آندروژنی را کاهش می‌دهد.',
  },
  {
    id: 'k5',
    question:
      'مکانیسم مهار آنزیم ۵-آلفا ردوکتاز توسط ۴-آزااستروئیدها (مانند فیناستراید و دوتاستراید) چگونه است؟',
    options: [
      { key: 'a', text: 'کلاته کردن اتم آهن گروه هم (Heme Fe) در سیتوکروم P450' },
      { key: 'b', text: 'تشکیل آداکت کووالانسی برگشت‌ناپذیر با کوفاکتور NADPH در سایت فعال آنزیم' },
      { key: 'c', text: 'پیوند یونی با Glu 353 در گیرنده استروژن' },
      { key: 'd', text: 'مهار مستقیم آنزیم 17α-هیدروکسیلاز آدرنال' },
    ],
    explanation:
      'سیستم کونژوگه لاکتام حلقه A در ۴-آزااستروئیدها با NADPH یک کمپلکس کووالانسی بسیار پایدار در سایت فعال ۵-آلفا ردوکتاز تشکیل می‌دهد.',
  },
];

export const KnowledgeQuizModal: React.FC<Props> = ({
  phase,
  preScorePercent,
  onClose,
  onSubmitted,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    assessment: any;
    answer_key: Record<string, string> | null;
  } | null>(null);

  const answeredCount = QUESTIONS.filter((q) => Boolean(answers[q.id])).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setError('لطفاً به هر ۵ سوال آزمون پاسخ دهید.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitAssessment({ phase, answers });
      setResult(res);
      onSubmitted(phase, res.assessment);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ثبت آزمون ناموفق بود.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-title"
      className="fixed inset-0 z-[105] bg-[#18181B]/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto lab-card p-5 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-4 sticky top-0 bg-[#FFFFFF] z-10">
          <div className="flex items-center gap-2.5">
            <BookOpenCheck className="w-6 h-6 text-[#0D9488] shrink-0" />
            <div>
              <h2 id="quiz-title" className="font-heading font-bold text-base sm:text-lg text-[#18181B]">
                {phase === 'pre'
                  ? 'پیش‌آزمون کوتاه شیمی دارویی (Pre-test)'
                  : 'پس‌آزمون ارزیابی یادگیری (Post-test)'}
              </h2>
              <p className="text-xs text-[#52525B]">
                {phase === 'pre'
                  ? '۵ سوال کوتاه برای سنجش سطح دانش اولیه پیش از شروع ماموریت'
                  : '۵ سوال برای سنجش میزان رشد یادگیری پس از تکمیل آزمایشگاه‌ها'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن آزمون"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {result ? (
          <div className="space-y-5">
            <div className="rounded-[8px] border-2 border-[#18181B] bg-[#DCFCE7] p-5 text-center space-y-2">
              <MolecularTrophyBadge className="w-14 h-14 mx-auto" />
              <div className="text-lg font-heading font-bold text-[#18181B]">
                نمره شما:{' '}
                <span dir="ltr" className="font-mono metric-mono">
                  {result.assessment.score}/{result.assessment.total_questions} ({result.assessment.percentage}%)
                </span>
              </div>
              {phase === 'post' && preScorePercent != null && (
                <div className="text-xs font-mono font-bold text-[#0D9488] metric-mono">
                  Learning Gain: {result.assessment.percentage >= preScorePercent ? '+' : ''}
                  {Math.round((result.assessment.percentage - preScorePercent) * 10) / 10}% (vs Pre: {preScorePercent}%)
                </div>
              )}
              {phase === 'pre' && (
                <p className="text-xs text-[#52525B]">
                  پاسخنامه تشریحی پس از تکمیل بازی و انجام پس‌آزمون در اختیار شما قرار می‌گیرد.
                </p>
              )}
            </div>

            {phase === 'post' && result.answer_key && (
              <div className="space-y-3">
                <div className="text-xs font-heading font-bold text-[#0D9488]">پاسخنامه تشریحی:</div>
                {QUESTIONS.map((q, idx) => {
                  const correctKey = result.answer_key![q.id];
                  const isRight = answers[q.id] === correctKey;
                  const correctOption = q.options.find((o) => o.key === correctKey);
                  return (
                    <div
                      key={q.id}
                      className={`rounded-[6px] border-2 border-[#18181B] p-3.5 text-xs space-y-1.5 ${
                        isRight ? 'bg-[#DCFCE7]' : 'bg-[#FFE4E6]'
                      }`}
                    >
                      <div className="font-bold text-[#18181B]">
                        {toPersianDigits(idx + 1)}. {q.question}
                      </div>
                      <div className="text-[#16A34A] font-bold">پاسخ صحیح: {correctOption?.text}</div>
                      <div className="text-[#52525B] leading-5">{q.explanation}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="btn-tactile btn-tactile-primary px-6 py-2.5 text-sm">
                ادامه
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-[8px] border-2 border-[#18181B] bg-[#F7F5F0] p-4 space-y-2.5"
                >
                  <div className="text-xs sm:text-sm font-bold text-[#18181B] leading-6">
                    {toPersianDigits(idx + 1)}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt) => {
                      const selected = answers[q.id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.key }));
                            if (error) setError(null);
                          }}
                          className={`w-full text-right rounded-[6px] border-2 border-[#18181B] px-3.5 py-2.5 text-xs transition ${
                            selected
                              ? 'bg-[#0D9488] text-white font-bold shadow-[2px_2px_0px_#18181B]'
                              : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFECE6]'
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FFE4E6] p-3 text-xs font-bold text-[#E11D48] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="font-mono text-xs font-bold text-[#52525B] metric-mono">
                {answeredCount}/{QUESTIONS.length} answered
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="btn-tactile btn-tactile-surface px-4 py-2 text-xs">
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading || !allAnswered}
                  className="btn-tactile btn-tactile-emerald px-5 py-2 text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'در حال ثبت...' : 'ثبت پاسخ‌های آزمون'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
