import React, { useEffect, useState } from 'react';
import {
  Clock,
  Trophy,
  Award,
  KeyRound,
  LogOut,
  FlaskConical,
  Lock,
  CheckCircle2,
  AlertOctagon,
  FileSearch,
  Sparkles,
  Skull,
  ClipboardCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { api, clearTokens, getAccessToken } from './api';
import { Badge, GameSession, LeaderboardEntry, StudentUser } from './types';
import { AuthScreen } from './components/AuthScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { EntranceGatePuzzle } from './components/puzzles/EntranceGatePuzzle';
import { GlucocorticoidLab } from './components/puzzles/GlucocorticoidLab';
import { MineralocorticoidLab } from './components/puzzles/MineralocorticoidLab';
import { EstrogenLab } from './components/puzzles/EstrogenLab';
import { ProgestinLab } from './components/puzzles/ProgestinLab';
import { AndrogenLab } from './components/puzzles/AndrogenLab';
import { FinalAntidoteLab } from './components/puzzles/FinalAntidoteLab';
import { MeegaSurveyModal } from './components/MeegaSurveyModal';

type ActiveView =
  | 'map'
  | 'entrance'
  | 'glucocorticoid'
  | 'mineralocorticoid'
  | 'estrogen'
  | 'progestin'
  | 'androgen'
  | 'final'
  | 'leaderboard';

const DEPARTMENTS = [
  {
    code: 'glucocorticoid',
    title: 'دپارتمان ۱: آزمایشگاه گلوکوکورتیکوئیدها',
    subtitle: 'کانفورماسیون حلقه‌ها و تحلیل SAR ضدالتهابی',
  },
  {
    code: 'mineralocorticoid',
    title: 'دپارتمان ۲: بخش مینرالوکورتیکوئیدها',
    subtitle: 'احتباس آب و الکترولیت و تشخیص مسیر تجویز موضعی',
  },
  {
    code: 'estrogen',
    title: 'دپارتمان ۳: آزمایشگاه استروژن‌ها',
    subtitle: 'مسیر متابولیسم و داکینگ سه‌بعدی در گیرنده (Glu353/Arg394)',
  },
  {
    code: 'progestin',
    title: 'دپارتمان ۴: بخش پروژستین‌ها',
    subtitle: 'مشتقات ۱۹-نورآندروستان و فراهمی زیستی خوراکی',
  },
  {
    code: 'androgen',
    title: 'دپارتمان ۵: آندروژن‌ها و مهارکننده‌های آنزیمی',
    subtitle: 'متابولیسم فلوتامید، SARMs و کمپلکس ۵-آلفا ردوکتاز',
  },
];

export function App() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('map');
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [loadingApp, setLoadingApp] = useState<boolean>(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMeegaModal, setShowMeegaModal] = useState(false);
  const [meegaSubmitted, setMeegaSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('medchem_theme') !== 'light';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('medchem_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('medchem_theme', 'light');
    }
  }, [darkMode]);

  const loadInitialData = async () => {
    if (!getAccessToken()) {
      setLoadingApp(false);
      return;
    }
    try {
      const [profile, gameData, meegaStatus] = await Promise.all([
        api.getProfile(),
        api.getSession(),
        api.getMeegaStatus().catch(() => ({ submitted: false })),
      ]);
      setUser(profile);
      setSession(gameData.session);
      setBadges(gameData.badges || []);
      setMeegaSubmitted(Boolean(meegaStatus?.submitted));
      setTimeLeft(gameData.session.time_remaining_seconds ?? 3600);
      if (!gameData.session.completed_stages?.includes('entrance')) {
        setActiveView('entrance');
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!user || !session || session.status === 'completed') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [user, session]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 5000);
  };

  const isPuzzleSolved = (stage: string, puzzle: string) =>
    session?.puzzle_attempts?.some(
      (a) => a.stage_code === stage && a.puzzle_code === puzzle && a.is_solved
    ) ?? false;

  const handlePuzzleSubmit = async (
    stageCode: string,
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => {
    const res = await api.submitPuzzle({
      stage_code: stageCode,
      puzzle_code: puzzleCode,
      answer,
      time_spent_seconds: elapsedSeconds,
      time_remaining_seconds: timeLeft,
    });
    setSession(res.session);
    if (res.new_badge) {
      setBadges((prev) => [...prev, res.new_badge]);
      showNotification(`مدال جدید دریافت شد: ${res.new_badge.title}`);
    } else if (res.unlocked_clue) {
      showNotification(`سرنخ جدید کشف شد: ${res.unlocked_clue.title}`);
    }
    return { correct: res.correct, feedback: res.feedback };
  };

  const openLeaderboard = async () => {
    setActiveView('leaderboard');
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard);
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setSession(null);
  };

  if (loadingApp) {
    return (
      <div className={`min-h-screen flex items-center justify-center text-sm ${darkMode ? 'bg-[#060d18] text-cyan-400' : 'bg-slate-100 text-cyan-600'}`}>
        در حال راه‌اندازی سیستم آزمایشگاه Apex Pharma...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setLoadingApp(true);
          loadInitialData();
        }}
      />
    );
  }

  const entranceSolved = session?.completed_stages?.includes('entrance') ?? false;
  const allFiveDepartmentsDone = ['glucocorticoid', 'mineralocorticoid', 'estrogen', 'progestin', 'androgen'].every(
    (d) => session?.completed_stages?.includes(d)
  );
  const gameCompleted = session?.status === 'completed' || session?.completed_stages?.includes('final');

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-[#060d18] text-slate-100 lab-grid-bg' : 'bg-slate-50 text-slate-800 lab-grid-light-bg'}`}>
      {/* نوار وضعیت بالای صفحه (HUD) */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${darkMode ? 'border-slate-800 bg-[#07111f]/95' : 'border-slate-200 bg-white/95'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${darkMode ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-extrabold text-sm flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <span>بحران در فارماکوکم</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    gameCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {gameCompleted ? 'بحران مهار شد ✓' : 'پروژه اهریمن'}
                </span>
              </div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {user.full_name} • شماره دانشجویی: <span className="font-mono">{user.student_id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                gameCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : timeLeft < 600
                  ? 'border-rose-500/50 bg-rose-950/50 text-rose-300 animate-pulse'
                  : darkMode ? 'border-amber-500/40 bg-amber-950/30 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{gameCompleted ? 'زمان باقی‌مانده:' : 'بازرسی FDA:'}</span>
              <span dir="ltr" className="font-mono text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${darkMode ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}`}>
              <Sparkles className="w-4 h-4" />
              <span>امتیاز: {session?.total_score ?? 0}</span>
            </div>

            <button
              onClick={() => setShowMeegaModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                meegaSubmitted
                  ? darkMode ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : darkMode ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200 hover:border-cyan-400' : 'border-cyan-300 bg-cyan-50 text-cyan-700 hover:border-cyan-400'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{meegaSubmitted ? 'MEEGA+ ثبت شد ✓' : 'پرسشنامه MEEGA+'}</span>
            </button>

            <button
              onClick={openLeaderboard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${darkMode ? 'border-slate-700 hover:border-cyan-400 bg-slate-900 text-slate-200' : 'border-slate-300 hover:border-cyan-500 bg-white text-slate-700'}`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>رده‌بندی</span>
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${darkMode ? 'border-slate-700 hover:border-cyan-400 bg-slate-900 text-slate-200' : 'border-slate-300 hover:border-cyan-500 bg-white text-slate-700'}`}
            >
              <span>پروفایل</span>
            </button>

            {/* دکمه تم تاریک / روشن */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
              className={`p-2 rounded-xl border transition ${darkMode ? 'border-slate-700 bg-slate-900 text-amber-300 hover:border-amber-400' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <button
              onClick={handleLogout}
              title="خروج از حساب"
              className={`p-2 rounded-xl border transition ${darkMode ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-rose-300 hover:border-rose-400' : 'border-slate-300 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300'}`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {toast && (
        <div className="fixed bottom-5 left-5 z-50 rounded-2xl border border-emerald-400/50 bg-emerald-950/95 px-4 py-3 text-sm text-emerald-100 shadow-xl flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          {activeView === 'entrance' && (
            <EntranceGatePuzzle
              isSolved={entranceSolved}
              onSubmit={(ans, elapsed) => handlePuzzleSubmit('entrance', 'steroid_core', ans, elapsed)}
              onNext={() => setActiveView('map')}
            />
          )}

          {activeView === 'glucocorticoid' && (
            <GlucocorticoidLab
              conformationSolved={isPuzzleSolved('glucocorticoid', 'conformation_lock')}
              sarSolved={isPuzzleSolved('glucocorticoid', 'sar_potency_sort')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('glucocorticoid', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'mineralocorticoid' && (
            <MineralocorticoidLab
              entryPotencySolved={isPuzzleSolved('mineralocorticoid', 'effect_arrows')}
              sarmSolved={isPuzzleSolved('mineralocorticoid', 'route_classification')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('mineralocorticoid', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'estrogen' && (
            <EstrogenLab
              oralDesignSolved={isPuzzleSolved('estrogen', 'metabolism_enzymes')}
              potencySolved={isPuzzleSolved('estrogen', 'receptor_docking_and_class')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('estrogen', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'progestin' && (
            <ProgestinLab
              codeSolved={isPuzzleSolved('progestin', 'pk_safe_code')}
              designSolved={isPuzzleSolved('progestin', 'norandrostane_design')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('progestin', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'androgen' && (
            <AndrogenLab
              metaboliteSolved={isPuzzleSolved('androgen', 'flutamide_metabolite')}
              classificationSolved={isPuzzleSolved('androgen', 'antiandrogen_classification')}
              androgenicitySolved={isPuzzleSolved('androgen', 'five_alpha_reductase_complex')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('androgen', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'final' && (
            <FinalAntidoteLab
              mappingSolved={isPuzzleSolved('final', 'biosynthesis_vault')}
              antidoteSolved={isPuzzleSolved('final', 'antidote_synthesis')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('final', pCode, ans, elapsed)
              }
              onOpenSurvey={() => setShowMeegaModal(true)}
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'leaderboard' && (
            <div className={`rounded-2xl border p-6 space-y-4 ${darkMode ? 'border-slate-700/80 bg-slate-900/80 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-bold text-lg flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>جدول رده‌بندی پژوهشگران (Leaderboard)</span>
                </h2>
                <button
                  onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
                  className={`rounded-xl border px-4 py-1.5 text-xs transition ${darkMode ? 'border-slate-600 text-slate-200 hover:border-cyan-400' : 'border-slate-300 text-slate-700 hover:border-cyan-500'}`}
                >
                  بازگشت به ماموریت
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className={`border-b text-xs ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <tr>
                      <th className="py-2.5 px-3">رتبه</th>
                      <th className="py-2.5 px-3">نام دانشجو</th>
                      <th className="py-2.5 px-3">شماره دانشجویی</th>
                      <th className="py-2.5 px-3">امتیاز کل</th>
                      <th className="py-2.5 px-3">تعداد خطا</th>
                      <th className="py-2.5 px-3">زمان صرف‌شده</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-slate-800/70' : 'divide-slate-100'}`}>
                    {leaderboard.map((row) => (
                      <tr key={row.student_id} className={darkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 font-bold text-cyan-500">#{row.rank}</td>
                        <td className={`py-2.5 px-3 font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{row.full_name}</td>
                        <td className={`py-2.5 px-3 font-mono text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{row.student_id}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">{row.total_score}</td>
                        <td className="py-2.5 px-3 text-rose-500">{row.total_errors}</td>
                        <td className={`py-2.5 px-3 font-mono text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {formatTime(row.time_spent_seconds)}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className={`py-6 text-center text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          هنوز رکوردی ثبت نشده است.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'map' && (
            <div className="space-y-6">
              {gameCompleted ? (
                <div className="rounded-2xl border border-emerald-400/50 bg-gradient-to-l from-emerald-950/50 via-slate-900 to-slate-900 p-6 flex flex-wrap items-center justify-between gap-4 text-white">
                  <div className="space-y-1">
                    <h2 className="font-extrabold text-base text-emerald-300">
                      ماموریت با موفقیت کامل شد! پادزهر اهریمن سنتز گردید.
                    </h2>
                    <p className="text-xs text-slate-300 leading-6">
                      امتیاز نهایی شما: <strong>{session?.total_score}</strong> | تعداد خطاها: <strong>{session?.total_errors}</strong>.
                      لطفاً برای تکمیل ارزیابی پژوهشی، فرم کوتاه MEEGA+ را ثبت کنید.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMeegaModal(true)}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 text-xs transition flex items-center gap-2"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>{meegaSubmitted ? 'مشاهده / ویرایش پرسشنامه MEEGA+' : 'تکمیل پرسشنامه MEEGA+'}</span>
                  </button>
                </div>
              ) : (
                <div className={`rounded-2xl border p-5 flex items-start gap-3 ${darkMode ? 'border-rose-500/30 bg-gradient-to-l from-rose-950/30 via-slate-900/90 to-slate-900/90 text-white' : 'border-rose-300 bg-rose-50 text-slate-900'}`}>
                  <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h2 className={`font-bold text-base ${darkMode ? 'text-rose-200' : 'text-rose-900'}`}>
                      هشدار امنیتی سطح ۱: فرمول «اهریمن» در سرور R&D فعال است
                    </h2>
                    <p className={`text-xs mt-1 leading-6 ${darkMode ? 'text-slate-300' : 'text-rose-800'}`}>
                      هر یک از ۵ دپارتمان تحقیقاتی شرکت Apex Pharma سرنخی از ساختار شیمیایی ترکیب اهریمن را در خود پنهان کرده است.
                      پس از کشف هر ۵ سرنخ، درِ اتاق مخفی دکتر ارول برای سنتز پادزهر باز می‌شود.
                    </p>
                  </div>
                </div>
              )}

              {/* کارت مرحله نهایی: اتاق مخفی ارول */}
              <div
                className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 transition ${
                  allFiveDepartmentsDone
                    ? darkMode ? 'border-rose-400/60 bg-gradient-to-l from-rose-950/40 to-slate-900 shadow-lg shadow-rose-950/30 text-white' : 'border-rose-400 bg-rose-100 shadow-md text-slate-900'
                    : darkMode ? 'border-slate-800 bg-slate-900/40 opacity-75 text-white' : 'border-slate-200 bg-slate-100 opacity-75 text-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      allFiveDepartmentsDone ? 'bg-rose-500/20 text-rose-500' : darkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {allFiveDepartmentsDone ? <Skull className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">
                      مرحله نهایی: اتاق مخفی دکتر ارول و سنتز پادزهر اهریمن
                    </div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {allFiveDepartmentsDone
                        ? 'قفل امنیتی ۵ دپارتمان باز شد! وارد اتاق مخفی شوید و پادزهر را سنتز کنید.'
                        : `نیازمند کشف هر ۵ سرنخ از دپارتمان‌های تحقیقاتی (${session?.unlocked_clues?.length ?? 0}/۵ سرنخ کشف شده)`}
                    </div>
                  </div>
                </div>
                <button
                  disabled={!allFiveDepartmentsDone}
                  onClick={() => setActiveView('final')}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold px-5 py-2 text-xs transition"
                >
                  {gameCompleted ? 'مرور اتاق مخفی' : 'ورود به اتاق مخفی'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPARTMENTS.map((dept, index) => {
                  const isCompleted = session?.completed_stages?.includes(dept.code);
                  const persianNumbers = ['۱', '۲', '۳', '۴', '۵'];
                  const titleFormatted = dept.title.replace(/^[۰-۹0-9]+/, persianNumbers[index] || '');
                  return (
                    <div
                      key={dept.code}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                        isCompleted
                          ? darkMode ? 'border-emerald-500/40 bg-slate-900/85' : 'border-emerald-300 bg-emerald-50/50'
                          : darkMode ? 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400' : 'border-slate-200 bg-white hover:border-cyan-500 shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{titleFormatted}</span>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                        </div>
                        <p className={`text-xs leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{dept.subtitle}</p>
                      </div>

                      <div className={`mt-4 pt-3 border-t flex items-center justify-between ${darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                        <span className="text-[11px]">
                          {isCompleted ? 'تکمیل شده و سرنخ ثبت شد ✓' : 'آماده ورود و رمزگشایی'}
                        </span>
                        <button
                          onClick={() => setActiveView(dept.code as ActiveView)}
                          className={`rounded-xl font-bold px-4 py-1.5 text-xs transition ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                          }`}
                        >
                          {isCompleted ? 'مرور آزمایشگاه' : 'ورود به دپارتمان'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ستون کناری: پرونده سرنخ‌های کشف‌شده و نشان‌ها */}
        <aside className="lg:col-span-3 space-y-5">
          <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? 'border-slate-700/80 bg-slate-900/80 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold border-b pb-2.5 ${darkMode ? 'border-slate-800 text-cyan-300' : 'border-slate-100 text-cyan-600'}`}>
              <FileSearch className="w-4 h-4" />
              <span>پرونده سرنخ‌های اهریمن ({session?.unlocked_clues?.length ?? 0}/۵)</span>
            </div>
            {session?.unlocked_clues && session.unlocked_clues.length > 0 ? (
              <div className="space-y-2.5">
                {session.unlocked_clues.map((clue) => (
                  <div
                    key={clue.id}
                    className={`rounded-xl border p-3 text-xs space-y-1 ${darkMode ? 'border-cyan-500/30 bg-cyan-950/30' : 'border-cyan-200 bg-cyan-50/70'}`}
                  >
                    <div className={`font-bold ${darkMode ? 'text-cyan-200' : 'text-cyan-800'}`}>{clue.title}</div>
                    <div className={`leading-5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{clue.detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                هنوز سرنخی از ساختار اهریمن استخراج نشده است. معماهای دپارتمان‌ها را حل کنید.
              </p>
            )}
          </div>

          <div className={`rounded-2xl border p-4 space-y-3 ${darkMode ? 'border-slate-700/80 bg-slate-900/80 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-sm'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold border-b pb-2.5 ${darkMode ? 'border-slate-800 text-amber-300' : 'border-slate-100 text-amber-600'}`}>
              <Award className="w-4 h-4" />
              <span>مدال‌های پژوهشی ({badges.length})</span>
            </div>
            {badges.length > 0 ? (
              <div className="space-y-2">
                {badges.map((b) => (
                  <div
                    key={b.badge_code}
                    className={`rounded-xl border p-3 text-xs ${darkMode ? 'border-amber-500/30 bg-amber-950/25' : 'border-amber-200 bg-amber-50/70'}`}
                  >
                    <div className={`font-bold ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>{b.title}</div>
                    <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{b.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-xs leading-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                با حل بدون خطای معماهای هر دپارتمان، مدال تخصصی دریافت کنید.
              </p>
            )}
          </div>
        </aside>
      </main>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showMeegaModal && (
        <MeegaSurveyModal
          onClose={() => setShowMeegaModal(false)}
          onSubmitted={() => {
            setMeegaSubmitted(true);
            showNotification('پرسشنامه پژوهشی MEEGA+ با موفقیت ثبت شد.');
          }}
        />
      )}
    </div>
  );
}

export default App;
