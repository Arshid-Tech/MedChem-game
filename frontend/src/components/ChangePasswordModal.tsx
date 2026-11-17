import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../api';

interface Props {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ ok: false, msg: 'رمز عبور جدید و تکرار آن یکسان نیستند.' });
      return;
    }
    if (newPassword === oldPassword) {
      setStatus({ ok: false, msg: 'رمز عبور جدید باید با رمز فعلی متفاوت باشد.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setStatus({ ok: true, msg: res.detail });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'خطا در تغییر رمز عبور' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d1b2e] text-slate-900 dark:text-slate-100 p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <KeyRound className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span id="change-password-title">تغییر رمز عبور حساب دانشجویی</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره تغییر رمز"
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">رمز عبور فعلی</label>
            <input
              type="password"
              required
              dir="ltr"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">رمز عبور جدید (حداقل ۶ کاراکتر)</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1">تکرار رمز عبور جدید</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {status && (
            <div
              className={`rounded-xl border p-2.5 text-xs flex items-center gap-2 ${
                status.ok
                  ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                  : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
              }`}
            >
              {status.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{status.msg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              بستن
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 text-xs"
            >
              {loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
