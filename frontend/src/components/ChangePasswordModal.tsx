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
    <div className="fixed inset-0 z-[100] bg-[#18181B]/70 flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        className="w-full max-w-md lab-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-3">
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-[#18181B]">
            <KeyRound className="w-4 h-4 text-[#0D9488]" />
            <span id="change-password-title">تغییر رمز عبور حساب دانشجویی</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره تغییر رمز"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">رمز عبور فعلی</label>
            <input
              type="password"
              required
              dir="ltr"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2 text-sm font-mono text-[#18181B]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">رمز عبور جدید (حداقل ۶ کاراکتر)</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2 text-sm font-mono text-[#18181B]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1">تکرار رمز عبور جدید</label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2 text-sm font-mono text-[#18181B]"
            />
          </div>

          {status && (
            <div
              className={`rounded-[6px] border-2 border-[#18181B] p-2.5 text-xs font-bold flex items-center gap-2 ${
                status.ok ? 'bg-[#DCFCE7] text-[#18181B]' : 'bg-[#FFE4E6] text-[#E11D48]'
              }`}
            >
              {status.ok ? <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" /> : <AlertTriangle className="w-4 h-4 text-[#E11D48] shrink-0" />}
              <span>{status.msg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-tactile btn-tactile-surface px-4 py-2 text-xs">
              بستن
            </button>
            <button type="submit" disabled={loading} className="btn-tactile btn-tactile-primary px-5 py-2 text-xs">
              {loading ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
