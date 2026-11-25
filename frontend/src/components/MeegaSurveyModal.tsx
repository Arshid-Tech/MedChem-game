import React, { useState } from 'react';
import { ClipboardCheck, AlertTriangle, X, Sparkles } from 'lucide-react';
import { api } from '../api';
import { MolecularTrophyBadge } from './visuals/ChemBadges';
import { toPersianDigits } from '../utils/persian';

interface Props {
  onClose: () => void;
  onSubmitted: () => void;
}

const MEEGA_QUESTIONS: { id: string; domain: string; text: string }[] = [
  { id: 'q1', domain: 'کاربردی بودن (زیبایی و طراحی)', text: 'طراحی ظاهری و رابط کاربری بازی جذاب و متناسب با فضای آزمایشگاه شیمی دارویی است.' },
  { id: 'q2', domain: 'کاربردی بودن (زیبایی و طراحی)', text: 'فونت‌ها، رنگ‌ها و ساختارهای شیمیایی نمایش‌داده‌شده خوانا و واضح هستند.' },
  { id: 'q3', domain: 'کاربردی بودن (سهولت یادگیری)', text: 'یادگیری نحوه کار با بخش‌های مختلف بازی (درگ-اند-دراپ، مرتب‌سازی و ابزارها) آسان بود.' },
  { id: 'q4', domain: 'کاربردی بودن (سهولت یادگیری)', text: 'قوانین و راهنماهای هر دپارتمان به روشنی توضیح داده شده بودند.' },
  { id: 'q5', domain: 'کاربردی بودن (عملکرد)', text: 'رابط کاربری بازی بدون پیچیدگی اضافه و روان عمل می‌کرد.' },
  { id: 'q6', domain: 'کاربردی بودن (عملکرد)', text: 'پیام‌های بازخورد (Feedback) پس از پاسخ به معماها به موقع و آموزنده بودند.' },
  { id: 'q7', domain: 'کاربردی بودن (دسترسی)', text: 'صفحه بازی در دستگاه من (موبایل/لپ‌تاپ) به درستی نمایش داده شد.' },
  { id: 'q8', domain: 'کاربردی بودن (دسترسی)', text: 'جابه‌جایی بین نقشه دپارتمان‌ها، پرونده سرنخ‌ها و جدول رده‌بندی ساده بود.' },
  { id: 'q9', domain: 'کاربردی بودن (محافظت از خطا)', text: 'در صورت اشتباه در حل معما، امکان اصلاح و تلاش مجدد به خوبی فراهم بود.' },
  { id: 'q10', domain: 'اطمینان از یادگیری', text: 'پس از انجام این بازی، اطمینان بیشتری نسبت به تحلیل ساختار-اثر (SAR) استروئیدها دارم.' },
  { id: 'q11', domain: 'چالشی بودن بازی', text: 'سطح دشواری معماهای شیمی دارویی چالش‌برانگیز و متناسب با دانش داروسازی بود.' },
  { id: 'q12', domain: 'چالشی بودن بازی', text: 'حل کردن معماهای هر دپارتمان نیاز به تفکر تحلیلی و به‌کارگیری آموخته‌های درسی داشت.' },
  { id: 'q13', domain: 'چالشی بودن بازی', text: 'روند پیشرفت بازی از مراحل ساده به مراحل پیچیده‌تر منطقی و حساب‌شده بود.' },
  { id: 'q14', domain: 'احساس رضایت', text: 'از تکمیل ماموریت‌ها، کشف سرنخ‌ها و سنتز پادزهر احساس رضایت و موفقیت داشتم.' },
  { id: 'q15', domain: 'احساس رضایت', text: 'دریافت امتیاز و مدال‌های پژوهشی انگیزه مرا برای ادامه بازی افزایش داد.' },
  { id: 'q16', domain: 'احساس رضایت', text: 'این بازی را به سایر دانشجویان داروسازی برای یادگیری شیمی دارویی توصیه می‌کنم.' },
  { id: 'q17', domain: 'احساس رضایت', text: 'ترجیح می‌دهم سایر مباحث شیمی دارویی (مانند آنتی‌بیوتیک‌ها) نیز در این قالب ارائه شوند.' },
  { id: 'q18', domain: 'لذت و سرگرمی', text: 'انجام این بازی آموزشی برایم لذت‌بخش و هیجان‌انگیز بود.' },
  { id: 'q19', domain: 'لذت و سرگرمی', text: 'داستان و سناریوی بازی باعث جذابیت بیشتر فرآیند یادگیری شد.' },
  { id: 'q20', domain: 'لذت و سرگرمی', text: 'وجود محدودیت زمانی حس هیجان و مشارکت فعال را تقویت کرد.' },
  { id: 'q21', domain: 'لذت و توجه متمرکز', text: 'هنگام بازی کردن کاملاً غرق در حل معماهای شیمیایی شدم.' },
  { id: 'q22', domain: 'توجه متمرکز', text: 'محتوای تعاملی بازی باعث شد تمرکز بالاتری نسبت به مطالعه جزوه سنتی داشته باشم.' },
  { id: 'q23', domain: 'توجه و ارتباط با موضوع', text: 'محیط بازی حواس مرا از مفاهیم اصلی شیمی دارویی منحرف نکرد.' },
  { id: 'q24', domain: 'ارتباط با محتوای درس', text: 'محتوای معماها کاملاً با سرفصل‌های درس شیمی دارویی (مبحث استروئیدها) مرتبط بود.' },
  { id: 'q25', domain: 'ارتباط با محتوای درس', text: 'این بازی ارتباط بین ساختار شیمیایی داروها و ویژگی‌های بالینی/فارماکوکینتیک را روشن کرد.' },
  { id: 'q26', domain: 'یادگیری درک‌شده', text: 'این بازی به تثبیت و ماندگاری مفاهیم استروئیدها در ذهن من کمک کرد.' },
  { id: 'q27', domain: 'یادگیری درک‌شده', text: 'در مجموع، یادگیری از طریق این بازی را موثرتر از روش سخنرانی صرف ارزیابی می‌کنم.' },
];

const LIKERT_LABELS = [
  { val: 1, label: 'کاملاً مخالفم (۱)' },
  { val: 2, label: 'مخالفم (۲)' },
  { val: 3, label: 'نظری ندارم (۳)' },
  { val: 4, label: 'موافقم (۴)' },
  { val: 5, label: 'کاملاً موافقم (۵)' },
];

export const MeegaSurveyModal: React.FC<Props> = ({ onClose, onSubmitted }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneData, setDoneData] = useState<any>(null);

  const answeredCount = MEEGA_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
  const unansweredCount = MEEGA_QUESTIONS.length - answeredCount;

  const handleSelect = (qId: string, val: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unansweredCount > 0) {
      setError(`لطفاً به همه پرسش‌ها پاسخ دهید. ${toPersianDigits(unansweredCount)} پرسش بی‌پاسخ مانده است.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitMeega({ answers, comments });
      setDoneData(res.data);
      onSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت پرسشنامه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meega-title"
      className="fixed inset-0 z-[100] bg-[#18181B]/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto lab-card p-5 md:p-7 space-y-5">
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-4 sticky top-0 bg-[#FFFFFF] z-20">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-[#0D9488] shrink-0" />
            <div>
              <h2 id="meega-title" className="font-heading font-bold text-base md:text-lg text-[#18181B]">
                پرسشنامه استاندارد ارزیابی کیفیت بازی آموزشی (MEEGA+)
              </h2>
              <p className="text-xs text-[#52525B]">
                دانشکده داروسازی دانشگاه علوم پزشکی البرز — داده‌ها به صورت محرمانه ثبت می‌شوند
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پرسشنامه"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {doneData ? (
          <div className="space-y-5 py-4 text-center">
            <MolecularTrophyBadge className="w-16 h-16 mx-auto" />
            <h3 className="text-xl font-heading font-bold text-[#16A34A]">
              سپاسگزاریم! پاسخ‌های شما با موفقیت در سامانه پژوهشی ثبت شد.
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3">
                <div className="text-[#52525B]">کاربردی بودن</div>
                <div dir="ltr" className="text-lg font-mono font-extrabold text-[#0D9488] mt-1 metric-mono">
                  {doneData.usability_score} / 5
                </div>
              </div>
              <div className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3">
                <div className="text-[#52525B]">یادگیری درک‌شده</div>
                <div dir="ltr" className="text-lg font-mono font-extrabold text-[#16A34A] mt-1 metric-mono">
                  {doneData.perceived_learning_score} / 5
                </div>
              </div>
              <div className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3">
                <div className="text-[#52525B]">لذت و سرگرمی</div>
                <div dir="ltr" className="text-lg font-mono font-extrabold text-[#F59E0B] mt-1 metric-mono">
                  {doneData.fun_score} / 5
                </div>
              </div>
              <div className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3">
                <div className="text-[#52525B]">ارتباط با درس</div>
                <div dir="ltr" className="text-lg font-mono font-extrabold text-[#18181B] mt-1 metric-mono">
                  {doneData.relevance_score} / 5
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn-tactile btn-tactile-primary px-8 py-2.5 text-sm">
              بازگشت به دفترچه بازی
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] px-4 py-2.5 text-xs">
              <span className="font-bold text-[#18181B]" aria-live="polite">
                پیشرفت تکمیل پرسشنامه: <span className="font-mono metric-mono">{answeredCount}/{MEEGA_QUESTIONS.length}</span>
              </span>
              {unansweredCount > 0 && (
                <span className="font-bold text-[#E11D48]">
                  {toPersianDigits(unansweredCount)} سوال باقی‌مانده
                </span>
              )}
            </div>

            <div className="space-y-3">
              {MEEGA_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className={`rounded-[8px] border-2 border-[#18181B] p-4 space-y-3 ${
                    answers[q.id] !== undefined ? 'bg-[#F0FDF4]' : 'bg-[#F7F5F0]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#18181B]">
                      {toPersianDigits(idx + 1)}. {q.text}
                    </span>
                    <span className="lab-badge px-2 py-0.5 text-[10px] bg-[#EFECE6] text-[#18181B]">
                      {q.domain}
                    </span>
                  </div>
                  <div
                    role="radiogroup"
                    aria-label={`${toPersianDigits(idx + 1)}. ${q.text}`}
                    className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                  >
                    {LIKERT_LABELS.map((opt) => {
                      const selected = answers[q.id] === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleSelect(q.id, opt.val)}
                          className={`py-2 px-2 rounded-[6px] text-[11px] font-bold border-2 border-[#18181B] transition ${
                            selected
                              ? 'bg-[#0D9488] text-white shadow-[2px_2px_0px_#18181B]'
                              : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#EFECE6]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                پیشنهادات یا دیدگاه شما درباره بهبود بازی آموزشی (اختیاری):
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="نظرات خود را اینجا بنویسید..."
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-4 py-2.5 text-xs text-[#18181B]"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-[6px] border-2 border-[#18181B] bg-[#FFE4E6] p-3 text-xs font-bold text-[#E11D48] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-tactile btn-tactile-surface px-5 py-2 text-xs">
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading || unansweredCount > 0}
                className="btn-tactile btn-tactile-emerald px-6 py-2.5 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'در حال ثبت...' : 'ثبت نهایی پرسشنامه MEEGA+'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
