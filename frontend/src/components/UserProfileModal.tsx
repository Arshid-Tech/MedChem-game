import React from 'react';
import { Award, Clock3, KeyRound, UserRound, X } from 'lucide-react';
import { GameSession, StudentUser } from '../types';

interface Props {
  user: StudentUser;
  session: GameSession | null;
  badgeCount: number;
  onClose: () => void;
  onChangePassword: () => void;
}

export const UserProfileModal: React.FC<Props> = ({
  user,
  session,
  badgeCount,
  onClose,
  onChangePassword,
}) => {
  const completedCount = session?.completed_stages?.length ?? 0;
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0d1b2e] p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <UserRound className="w-5 h-5 text-cyan-400" />
            <h2 id="profile-title">نمایه کاربری</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن نمایه" className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <dt className="text-xs text-slate-400">نام و نام خانوادگی</dt>
            <dd className="mt-1 font-semibold text-slate-100">{user.full_name}</dd>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <dt className="text-xs text-slate-400">شماره دانشجویی</dt>
            <dd dir="ltr" className="mt-1 font-mono text-left font-semibold text-slate-100">{user.student_id}</dd>
          </div>
          {user.age != null && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <dt className="text-xs text-slate-400">سن</dt>
              <dd className="mt-1 font-semibold text-slate-100">{user.age}</dd>
            </div>
          )}
          {user.gender && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
              <dt className="text-xs text-slate-400">جنسیت</dt>
              <dd className="mt-1 font-semibold text-slate-100">
                {user.gender === 'female' ? 'زن' : user.gender === 'male' ? 'مرد' : 'ترجیح می‌دهم نگویم'}
              </dd>
            </div>
          )}
          {user.date_joined && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 sm:col-span-2">
              <dt className="text-xs text-slate-400">تاریخ ایجاد حساب</dt>
              <dd className="mt-1 font-semibold text-slate-100">
                {new Date(user.date_joined).toLocaleDateString('fa-IR')}
              </dd>
            </div>
          )}
        </dl>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-400">امتیاز</div>
            <div className="mt-1 font-extrabold text-emerald-300">{session?.total_score ?? 0}</div>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-400">خطاها</div>
            <div className="mt-1 font-extrabold text-rose-300">{session?.total_errors ?? 0}</div>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-400">مراحل تکمیل‌شده</div>
            <div className="mt-1 font-extrabold text-cyan-300">{completedCount} / ۷</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-center">
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Award className="w-3.5 h-3.5" /> نشان‌ها
            </div>
            <div className="mt-1 font-extrabold text-amber-300">{badgeCount}</div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="w-4 h-4" />
            <span>زمان بازی: {formatTime(session?.total_time_spent_seconds ?? 0)}</span>
          </div>
          <button
            type="button"
            onClick={onChangePassword}
            className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 px-4 py-2 text-xs font-bold text-cyan-200 hover:border-cyan-300 transition"
          >
            <KeyRound className="ml-1 inline h-4 w-4" />
            تغییر رمز عبور
          </button>
        </div>
      </section>
    </div>
  );
};
