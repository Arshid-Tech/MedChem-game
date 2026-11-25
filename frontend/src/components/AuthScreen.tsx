import React, { useState } from 'react';
import { KeyRound, UserPlus, LogIn, ShieldAlert } from 'lucide-react';
import { api, setTokens } from '../api';
import { StudentUser } from '../types';
import { LabWatermarks } from './visuals/LabWatermarks';
import { ReagentVialBadge } from './visuals/ChemBadges';

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
    <div className="min-h-screen workbook-bg flex items-center justify-center p-4">
      <LabWatermarks />
      <div className="relative z-10 w-full max-w-lg lab-card p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-[8px] border-2 border-[#18181B] bg-[#EFECE6] shadow-[3px_3px_0px_#18181B] flex items-center justify-center">
            <ReagentVialBadge className="w-11 h-11" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#18181B]">
            کارخانه مولکول دکتر ارول
          </h1>
          <p className="text-xs font-semibold text-[#0D9488]">
            دفترچه تعاملی شیمی دارویی — دانشکده داروسازی دانشگاه علوم پزشکی البرز
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-[8px] border-2 border-[#18181B] bg-[#EFECE6]">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-[6px] text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'register'
                ? 'bg-[#0D9488] text-white border-2 border-[#18181B]'
                : 'text-[#52525B] hover:text-[#18181B]'
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
            className={`py-2 rounded-[6px] text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              mode === 'login'
                ? 'bg-[#0D9488] text-white border-2 border-[#18181B]'
                : 'text-[#52525B] hover:text-[#18181B]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            ورود به آزمایشگاه
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
              شماره دانشجویی *
            </label>
            <input
              type="text"
              required
              dir="ltr"
              placeholder="401234567"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2.5 text-sm font-mono text-[#18181B] focus:bg-[#FFFFFF] focus:border-[#0D9488] focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#18181B] mb-1.5">
                نام و نام خانوادگی *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: سارا محمدی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#18181B] focus:bg-[#FFFFFF] focus:border-[#0D9488] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#18181B] mb-1.5">
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
              className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3.5 py-2.5 text-sm font-mono text-[#18181B] focus:bg-[#FFFFFF] focus:border-[#0D9488] focus:outline-none"
            />
          </div>

          {mode === 'register' && (
            <div className="pt-3 border-t-2 border-[#18181B]/15 space-y-2.5">
              <div className="text-[11px] font-semibold text-[#52525B]">
                اطلاعات پژوهشی (اختیاری — برای تحلیل آماری طرح آموزشی)
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#18181B] mb-1">سن</label>
                  <input
                    type="number"
                    min={17}
                    max={60}
                    placeholder="22"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs font-mono text-[#18181B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#18181B] mb-1">جنسیت</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-2 py-2 text-xs text-[#18181B]"
                  >
                    <option value="">انتخاب...</option>
                    <option value="female">زن</option>
                    <option value="male">مرد</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#18181B] mb-1">ساعت بازی/هفته</label>
                  <input
                    type="number"
                    min={0}
                    max={80}
                    placeholder="3"
                    value={gamingFrequency}
                    onChange={(e) => setGamingFrequency(e.target.value)}
                    className="w-full rounded-[6px] border-2 border-[#18181B] bg-[#F7F5F0] px-3 py-2 text-xs font-mono text-[#18181B]"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-[6px] border-2 border-[#18181B] bg-[#FFE4E6] p-3 text-xs font-bold text-[#E11D48] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-tactile btn-tactile-primary w-full py-3 text-sm"
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
