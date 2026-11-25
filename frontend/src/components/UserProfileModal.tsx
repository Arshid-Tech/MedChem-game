import React, { useState } from 'react';
import { Clock3, KeyRound, UserRound, X, CheckCircle2, AlertTriangle, Save } from 'lucide-react';
import { api } from '../api';
import { GameSession, StudentUser } from '../types';
import { MolecularTrophyBadge } from './visuals/ChemBadges';

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
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      className="fixed inset-0 z-[100] bg-[#18181B]/70 flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto lab-card p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-3">
          <div className="flex items-center gap-2 text-sm font-heading font-bold text-[#18181B]">
            <UserRound className="w-5 h-5 text-[#0D9488]" />
            <h2 id="profile-title">پروفایل کاربری و آمار آزمایشگاه</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پروفایل"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-[6px] border-2 border-[#18181B] bg-[#DCFCE7] p-3 text-center">
            <div className="text-[11px] font-semibold text-[#52525B]">XP امتیاز</div>
            <div dir="ltr" className="mt-1 font-mono font-extrabold text-[#16A34A] metric-mono">
              {session?.total_score ?? 0}
            </div>
          </div>
          <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FFE4E6] p-3 text-center">
            <div className="text-[11px] font-semibold text-[#52525B]">خطاها</div>
            <div dir="ltr" className="mt-1 font-mono font-extrabold text-[#E11D48] metric-mono">
              {session?.total_errors ?? 0}
            </div>
          </div>
          <div className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3 text-center">
            <div className="text-[11px] font-semibold text-[#52525B]">مراحل</div>
            <div dir="ltr" className="mt-1 font-mono font-extrabold text-[#0D9488] metric-mono">
              {completedCount}/7
            </div>
          </div>
          <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FEF3C7] p-3 text-center flex flex-col items-center">
            <div className="text-[11px] font-semibold text-[#52525B] flex items-center gap-1">
              <MolecularTrophyBadge className="w-4 h-4" /> نشان‌ها
            </div>
            <div dir="ltr" className="mt-1 font-mono font-extrabold text-[#18181B] metric-mono">
              {badgeCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3.5">
          <div>
            <span className="text-[#52525B]">شماره دانشجویی: </span>
            <span className="font-mono font-bold text-[#18181B]">{user.student_id}</span>
          </div>
          {user.date_joined && (
            <div>
              <span className="text-[#52525B]">تاریخ ثبت‌نام: </span>
              <span className="font-bold text-[#18181B]">
                {new Date(user.date_joined).toLocaleDateString('fa-IR')}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="text-xs font-heading font-bold text-[#0D9488]">
            ویرایش مشخصات فردی و متغیرهای پژوهشی
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs text-[#18181B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1">سن (سال)</label>
              <input
                type="number"
                min={17}
                max={65}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs font-mono text-[#18181B]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1">جنسیت</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs text-[#18181B]"
              >
                <option value="">انتخاب...</option>
                <option value="female">زن</option>
                <option value="male">مرد</option>
                <option value="other">ترجیح می‌دهم نگویم</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1">تواتر بازی در هفته (ساعت)</label>
              <input
                type="number"
                min={0}
                max={80}
                value={gamingFrequency}
                onChange={(e) => setGamingFrequency(e.target.value)}
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs font-mono text-[#18181B]"
              />
            </div>
          </div>

          {saveMsg && (
            <div
              className={`rounded-[6px] border-2 border-[#18181B] p-2.5 text-xs font-bold flex items-center gap-2 ${
                saveMsg.ok ? 'bg-[#DCFCE7] text-[#18181B]' : 'bg-[#FFE4E6] text-[#E11D48]'
              }`}
            >
              {saveMsg.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> : <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0" />}
              <span>{saveMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-tactile btn-tactile-primary px-4 py-2 text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'در حال ذخیره...' : 'ذخیره تغییرات پروفایل'}</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#18181B] pt-4">
          <div className="flex items-center gap-2 text-xs text-[#52525B] font-mono metric-mono">
            <Clock3 className="w-4 h-4 text-[#18181B]" />
            <span>زمان بازی: {formatTime(session?.total_time_spent_seconds ?? 0)}</span>
          </div>
          <button
            type="button"
            onClick={onChangePassword}
            className="btn-tactile btn-tactile-cream px-4 py-2 text-xs"
          >
            <KeyRound className="w-4 h-4 text-[#0D9488]" />
            <span>تغییر رمز عبور</span>
          </button>
        </div>
      </section>
    </div>
  );
};
