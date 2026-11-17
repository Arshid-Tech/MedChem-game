import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import { api } from '../api';

interface Props {
  onClose: () => void;
  onSubmitted: () => void;
}

const MEEGA_QUESTIONS: { id: string; domain: string; text: string }[] = [
  // بخش اول: کاربردی بودن (Usability - سوالات ۱ تا ۹)
  { id: 'q1', domain: 'کاربردی بودن (زیبایی و طراحی)', text: 'طراحی ظاهری و رابط کاربری بازی جذاب و متناسب با فضای آزمایشگاه شیمی دارویی است.' },
  { id: 'q2', domain: 'کاربردی بودن (زیبایی و طراحی)', text: 'فونت‌ها، رنگ‌ها و ساختارهای شیمیایی نمایش‌داده‌شده خوانا و واضح هستند.' },
  { id: 'q3', domain: 'کاربردی بودن (سهولت یادگیری)', text: 'یادگیری نحوه کار با بخش‌های مختلف بازی (درگ-اند-دراپ، مرتب‌سازی و ابزارها) آسان بود.' },
  { id: 'q4', domain: 'کاربردی بودن (سهولت یادگیری)', text: 'قوانین و راهنماهای هر دپارتمان به روشنی توضیح داده شده بودند.' },
  { id: 'q5', domain: 'کاربردی بودن (عملکرد)', text: 'رابط کاربری بازی بدون پیچیدگی اضافه و روان عمل می‌کرد.' },
  { id: 'q6', domain: 'کاربردی بودن (عملکرد)', text: 'پیام‌های بازخورد (Feedback) پس از پاسخ به معماها به موقع و آموزنده بودند.' },
  { id: 'q7', domain: 'کاربردی بودن (دسترسی)', text: 'صفحه بازی در دستگاه من (موبایل/لپ‌تاپ) به درستی نمایش داده شد.' },
  { id: 'q8', domain: 'کاربردی بودن (دسترسی)', text: 'جابه‌جایی بین نقشه دپارتمان‌ها، پرونده سرنخ‌ها و جدول رده‌بندی ساده بود.' },
  { id: 'q9', domain: 'کاربردی بودن (محافظت از خطا)', text: 'در صورت اشتباه در حل معما، امکان اصلاح و تلاش مجدد به خوبی فراهم بود.' },
  // بخش دوم: تجربه کاربری (Player Experience - سوالات ۱۰ تا ۲۷)
  { id: 'q10', domain: 'اطمینان از یادگیری', text: 'پس از انجام این بازی، اطمینان بیشتری نسبت به تحلیل ساختار-اثر (SAR) استروئیدها دارم.' },
  { id: 'q11', domain: 'چالشی بودن بازی', text: 'سطح دشواری معماهای شیمی دارویی چالش‌برانگیز و متناسب با دانش داروسازی بود.' },
  { id: 'q12', domain: 'چالشی بودن بازی', text: 'حل کردن معماهای هر دپارتمان نیاز به تفکر تحلیلی و به‌کارگیری آموخته‌های درسی داشت.' },
  { id: 'q13', domain: 'چالشی بودن بازی', text: 'روند پیشرفت بازی از مراحل ساده به مراحل پیچیده‌تر منطقی و حساب‌شده بود.' },
  { id: 'q14', domain: 'احساس رضایت', text: 'از تکمیل ماموریت‌ها، کشف سرنخ‌ها و سنتز پادزهر احساس رضایت و موفقیت داشتم.' },
  { id: 'q15', domain: 'احساس رضایت', text: 'دریافت امتیاز و مدال‌های پژوهشی انگیزه مرا برای ادامه بازی افزایش داد.' },
  { id: 'q16', domain: 'احساس رضایت', text: 'این بازی را به سایر دانشجویان داروسازی برای یادگیری شیمی دارویی توصیه می‌کنم.' },
  { id: 'q17', domain: 'احساس رضایت', text: 'ترجیح می‌دهم سایر مباحث شیمی دارویی (مانند آنتی‌بیوتیک‌ها) نیز در این قالب ارائه شوند.' },
  { id: 'q18', domain: 'لذت و سرگرمی', text: 'انجام این بازی آموزشی برایم لذت‌بخش و هیجان‌انگیز بود.' },
  { id: 'q19', domain: 'لذت و سرگرمی', text: 'داستان و سناریوی «بحران در فارماکوکم» باعث جذابیت بیشتر فرآیند یادگیری شد.' },
  { id: 'q20', domain: 'لذت و سرگرمی', text: 'وجود محدودیت زمانی (بازرسی FDA) حس هیجان و مشارکت فعال را تقویت کرد.' },
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unansweredCount > 0) {
      setError(`لطفاً به همه پرسش‌ها پاسخ دهید. ${unansweredCount} پرسش بی‌پاسخ مانده است.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitMeega({ answers, comments });
      setDoneData(res.data);
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت پرسشنامه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meega-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-cyan-500/40 bg-[#0b1728] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 sticky top-0 bg-[#0b1728] z-10">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 id="meega-title" className="font-extrabold text-base md:text-lg text-white">
                پرسشنامه استاندارد ارزیابی کیفیت بازی آموزشی (MEEGA+)
              </h2>
              <p className="text-xs text-slate-400">
                دانشکده داروسازی دانشگاه علوم پزشکی البرز — داده‌ها به صورت محرمانه در تحلیل پژوهشی ثبت می‌شوند
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن پرسشنامه" className="text-slate-400 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {doneData ? (
          <div className="space-y-5 py-4 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-extrabold text-emerald-300">
              سپاسگزاریم! پاسخ‌های شما با موفقیت در سامانه پژوهشی ثبت شد.
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="text-slate-400">کاربردی بودن (Usability)</div>
                <div className="text-lg font-extrabold text-cyan-300 mt-1">{doneData.usability_score} / 5</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="text-slate-400">یادگیری درک‌شده</div>
                <div className="text-lg font-extrabold text-emerald-300 mt-1">{doneData.perceived_learning_score} / 5</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="text-slate-400">لذت و سرگرمی</div>
                <div className="text-lg font-extrabold text-amber-300 mt-1">{doneData.fun_score} / 5</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="text-slate-400">ارتباط با محتوای درس</div>
                <div className="text-lg font-extrabold text-purple-300 mt-1">{doneData.relevance_score} / 5</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-2.5 text-sm"
            >
              بازگشت به صفحه اصلی بازی
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-300" aria-live="polite">
              پاسخ‌داده‌شده: {answeredCount} از {MEEGA_QUESTIONS.length}
            </p>
            <div className="space-y-3">
              {MEEGA_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {idx + 1}. {q.text}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                      {q.domain}
                    </span>
                  </div>
                  <div role="radiogroup" aria-label={`${idx + 1}. ${q.text}`} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {LIKERT_LABELS.map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        role="radio"
                        aria-checked={answers[q.id] === opt.val}
                        onClick={() => handleSelect(q.id, opt.val)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition ${
                          answers[q.id] === opt.val
                            ? 'border-cyan-400 bg-cyan-500 text-slate-950 font-bold'
                            : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                پیشنهادات یا دیدگاه شما درباره بهبود بازی آموزشی (اختیاری):
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="نظرات خود را اینجا بنویسید..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs text-slate-300"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading || unansweredCount > 0}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'در حال ثبت پرسشنامه...' : 'ثبت نهایی پرسشنامه MEEGA+'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
