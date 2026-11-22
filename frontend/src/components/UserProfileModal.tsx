import React, { useState } from 'react';
import { Award, Clock3, KeyRound, UserRound, X, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { api } from '../api';
import { GameSession, StudentUser } from '../types';
import { toPersianDigits } from '../utils/persian';

interface Props {
  user: StudentUser;
  session: GameSession | null;
  badgeCount: number;
  onClose: () => void;
  onChangePassword: () => void;
  onProfileUpdated: (user: StudentUser) => void;
}

export const UserProfileModal: React.FC<Props> = ({
  user,
  session,
  badgeCount,
  onClose,
  onChangePassword,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [age, setAge] = useState(user.age != null ? String(user.age) : '');
  const [gender, setGender] = useState(user.gender || '');
  const [gamingFrequency, setGamingFrequency] = useState(
    user.gaming_frequency != null ? String(user.gaming_frequency) : ''
  );
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const completedCount = session?.completed_stages?.length ?? 0;
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return toPersianDigits(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        age: age ? Number(age) : null,
        gender: gender || '',
        gaming_frequency: gamingFrequency !== '' ? Number(gamingFrequency) : null,
      });
      onProfileUpdated(updated);
      setSaveMsg({ ok: true, text: 'اطلاعات پروفایل پژوهشی با موفقیت ذخیره شد.' });
    } catch (err: unknown) {
      setSaveMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'ذخیره اطلاعات ناموفق بود.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-white dark:bg-[#0d1b2e] text-slate-900 dark:text-slate-100 p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <UserRound className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 id="profile-title">پروفایل کاربری و آمار بازی دانشجو</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پروفایل"
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* کارت آمار عملکرد */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">امتیاز</div>
            <div className="mt-1 font-extrabold text-emerald-700 dark:text-emerald-300">
              {toPersianDigits(session?.total_score ?? 0)}
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">خطاها</div>
            <div className="mt-1 font-extrabold text-rose-700 dark:text-rose-300">
              {toPersianDigits(session?.total_errors ?? 0)}
            </div>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">مراحل تکمیل‌شده</div>
            <div className="mt-1 font-extrabold text-cyan-700 dark:text-cyan-300">
              {toPersianDigits(completedCount)} / ۷
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> نشان‌ها
            </div>
            <div className="mt-1 font-extrabold text-amber-700 dark:text-amber-300">
              {toPersianDigits(badgeCount)}
            </div>
          </div>
        </div>

        {/* اطلاعات ثابت حساب */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5">
          <div>
            <span className="text-slate-500 dark:text-slate-400">شماره دانشجویی: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{toPersianDigits(user.student_id)}</span>
          </div>
          {user.date_joined && (
            <div>
              <span className="text-slate-500 dark:text-slate-400">تاریخ ثبت‌نام: </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {new Date(user.date_joined).toLocaleDateString('fa-IR')}
              </span>
            </div>
          )}
        </div>

        {/* فرم ویرایش مشخصات دموگرافیک و پژوهشی */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="text-xs font-extrabold text-cyan-700 dark:text-cyan-300">
            ویرایش مشخصات فردی و متغیرهای پژوهشی
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">سن (سال)</label>
              <input
                type="number"
                min={17}
                max={65}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">جنسیت</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب...</option>
                <option value="female">زن</option>
                <option value="male">مرد</option>
                <option value="other">ترجیح می‌دهم نگویم</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">
                تواتر بازی در هفته (ساعت)
              </label>
              <input
                type="number"
                min={0}
                max={80}
                value={gamingFrequency}
                onChange={(e) => setGamingFrequency(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {saveMsg && (
            <div
              className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${
                saveMsg.ok
                  ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
              }`}
            >
              {saveMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{saveMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-4 py-2 text-xs transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات پروفایل'}</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock3 className="w-4 h-4" />
            <span>زمان بازی: {formatTime(session?.total_time_spent_seconds ?? 0)}</span>
          </div>
          <button
            type="button"
            onClick={onChangePassword}
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-700 dark:text-cyan-200 hover:border-cyan-400 transition"
          >
            <KeyRound className="ml-1 inline h-4 w-4" />
            تغییر رمز عبور
          </button>
        </div>
      </section>
    </div>
  );
};
