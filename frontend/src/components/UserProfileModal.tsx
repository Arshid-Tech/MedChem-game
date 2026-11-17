import React, { useState } from 'react';
import { User, KeyRound, X, CheckCircle2, AlertTriangle, Calendar, Hash } from 'lucide-react';
import { api } from '../api';
import { StudentUser } from '../types';
import { toPersianDigits } from '../utils/persian';

interface Props {
  user: StudentUser;
  onClose: () => void;
  onProfileUpdated: (user: StudentUser) => void;
}

export const UserProfileModal: React.FC<Props> = ({ user, onClose, onProfileUpdated }) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [gender, setGender] = useState(user.gender || '');
  const [gamingFrequency, setGamingFrequency] = useState(
    user.gaming_frequency !== null && user.gaming_frequency !== undefined ? String(user.gaming_frequency) : ''
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const updated = await api.updateProfile({
        full_name: fullName.trim(),
        age: age ? Number(age) : null,
        gender: gender || '',
        gaming_frequency: gamingFrequency ? Number(gamingFrequency) : null,
      });
      onProfileUpdated(updated);
      setProfileMsg({ ok: true, text: 'اطلاعات پروفایل با موفقیت به‌روزرسانی شد.' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassMsg({ ok: false, text: 'رمز عبور جدید و تکرار آن یکسان نیستند.' });
      return;
    }
    setPassLoading(true);
    setPassMsg(null);
    try {
      const res = await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPassMsg({ ok: true, text: res.detail });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({ ok: false, text: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d1b2e] text-slate-900 dark:text-slate-100 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <User className="w-5 h-5 text-cyan-500" />
            <span>پروفایل دانشجو و تنظیمات امنیتی</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* کارت خلاصه شناسه دانشجویی */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 text-xs">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-cyan-500" />
            <span className="text-slate-500 dark:text-slate-400">شماره دانشجویی:</span>
            <span className="font-bold">{toPersianDigits(user.student_id)}</span>
          </div>
          {user.date_joined && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-500 dark:text-slate-400">تاریخ ثبت‌نام:</span>
              <span className="font-semibold">
                {new Date(user.date_joined).toLocaleDateString('fa-IR')}
              </span>
            </div>
          )}
        </div>

        {/* فرم ویرایش اطلاعات پروفایل */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <h4 className="text-xs font-extrabold text-cyan-600 dark:text-cyan-400">مشخصات فردی و پژوهشی</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">سن</label>
              <input
                type="number"
                min={17}
                max={60}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">جنسیت</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="">انتخاب...</option>
                <option value="female">زن</option>
                <option value="male">مرد</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">ساعت بازی در هفته</label>
              <input
                type="number"
                min={0}
                max={80}
                value={gamingFrequency}
                onChange={(e) => setGamingFrequency(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {profileMsg && (
            <div className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${profileMsg.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
              {profileMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 text-xs"
            >
              {profileLoading ? 'در حال ذخیره...' : 'ذخیره اطلاعات پروفایل'}
            </button>
          </div>
        </form>

        {/* بخش تغییر رمز عبور */}
        <form onSubmit={handlePasswordChange} className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4" />
            <span>تغییر رمز عبور حساب</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">رمز فعلی</label>
              <input
                type="password"
                required
                dir="ltr"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">رمز جدید (حداقل ۶ رقم)</label>
              <input
                type="password"
                required
                minLength={6}
                dir="ltr"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">تکرار رمز جدید</label>
              <input
                type="password"
                required
                minLength={6}
                dir="ltr"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {passMsg && (
            <div className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${passMsg.ok ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' : 'border-rose-500/40 bg-rose-950/80 text-rose-200'}`}>
              {passMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={passLoading}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 text-xs"
            >
              {passLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
