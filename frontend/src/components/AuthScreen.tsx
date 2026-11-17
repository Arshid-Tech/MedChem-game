import React, { useState } from 'react';
import { FlaskConical, KeyRound, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { api, setTokens } from '../api';
import { StudentUser } from '../types';

interface Props {
  onSuccess: (user: StudentUser) => void;
}

export const AuthScreen: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [gamingFrequency, setGamingFrequency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.register({
          student_id: studentId.trim(),
          full_name: fullName.trim(),
          password,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          gaming_frequency: gamingFrequency ? Number(gamingFrequency) : undefined,
        });
        setTokens(res.tokens.access, res.tokens.refresh);
        onSuccess(res.user);
      } else {
        const res = await api.login({
          student_id: studentId.trim(),
          password,
        });
        setTokens(res.tokens.access, res.tokens.refresh);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در احراز هویت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lab-grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-cyan-500/30 bg-[#0a1526]/95 shadow-2xl shadow-cyan-950/40 p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            بحران در فارماکوکم
          </h1>
          <p className="text-xs text-cyan-300 font-medium">
            شبیه‌ساز آموزشی شیمی دارویی — دانشکده داروسازی دانشگاه علوم پزشکی البرز
          </p>
        </div>

        {/* تب‌های ورود / ثبت‌نام */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'register'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            ثبت‌نام دانشجو
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'login'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ورود به آزمایشگاه
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              شماره دانشجویی *
            </label>
            <input
              type="text"
              required
              dir="ltr"
              placeholder="مثال: 401234567"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: سارا محمدی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رمز عبور (حداقل ۶ کاراکتر) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              dir="ltr"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="text-[11px] text-slate-400">
                اطلاعات پژوهشی (اختیاری — برای تحلیل آماری طرح آموزشی)
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">سن</label>
                  <input
                    type="number"
                    min={17}
                    max={60}
                    placeholder="۲۲"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">جنسیت</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="">انتخاب...</option>
                    <option value="female">زن</option>
                    <option value="male">مرد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">ساعت بازی/هفته</label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    placeholder="۳"
                    value={gamingFrequency}
                    onChange={(e) => setGamingFrequency(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 text-sm transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            {loading
              ? 'در حال پردازش...'
              : mode === 'register'
              ? 'ثبت‌نام و شروع ماموریت'
              : 'ورود به سیستم آزمایشگاه'}
          </button>
        </form>
      </div>
    </div>
  );
};
