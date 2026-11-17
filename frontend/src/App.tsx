import React, { useEffect, useState } from 'react';
import {
  Clock,
  Trophy,
  Award,
  LogOut,
  FlaskConical,
  Lock,
  CheckCircle2,
  AlertOctagon,
  FileSearch,
  Sparkles,
  Skull,
  ClipboardCheck,
  UserRound,
  CircleHelp,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { api, clearTokens, getAccessToken } from './api';
import { Badge, GameSession, LeaderboardEntry, StudentUser } from './types';
import { AuthScreen } from './components/AuthScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { GuidedTour, TourStep } from './components/GuidedTour';
import { EntranceGatePuzzle } from './components/puzzles/EntranceGatePuzzle';
import { GlucocorticoidLab } from './components/puzzles/GlucocorticoidLab';
import { MineralocorticoidLab } from './components/puzzles/MineralocorticoidLab';
import { EstrogenLab } from './components/puzzles/EstrogenLab';
import { ProgestinLab } from './components/puzzles/ProgestinLab';
import { AndrogenLab } from './components/puzzles/AndrogenLab';
import { FinalAntidoteLab } from './components/puzzles/FinalAntidoteLab';
import { MeegaSurveyModal } from './components/MeegaSurveyModal';
import { toPersianDigits } from './utils/persian';

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
    shortTitle: '۱. گلوکوکورتیکوئیدها',
    subtitle: 'کانفورماسیون حلقه‌ها و تحلیل SAR ضدالتهابی',
  },
  {
    code: 'mineralocorticoid',
    title: 'دپارتمان ۲: بخش مینرالوکورتیکوئیدها',
    shortTitle: '۲. مینرالوکورتیکوئیدها',
    subtitle: 'احتباس آب و الکترولیت و تشخیص مسیر تجویز موضعی',
  },
  {
    code: 'estrogen',
    title: 'دپارتمان ۳: آزمایشگاه استروژن‌ها',
    shortTitle: '۳. استروژن‌ها',
    subtitle: 'مسیر متابولیسم، طراحی خوراکی، داکینگ گیرنده و کلاس‌های دارویی',
  },
  {
    code: 'progestin',
    title: 'دپارتمان ۴: بخش پروژستین‌ها',
    shortTitle: '۴. پروژستین‌ها',
    subtitle: 'مشتقات ۱۹-نورآندروستان و فراهمی زیستی خوراکی',
  },
  {
    code: 'androgen',
    title: 'دپارتمان ۵: آندروژن‌ها و مهارکننده‌های آنزیمی',
    shortTitle: '۵. آندروژن‌ها',
    subtitle: 'متابولیسم فلوتامید، SARMs، آندروژنیسیته و کمپلکس ۵-آلفا ردوکتاز',
  },
];

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="navigation"]',
    title: 'نقشه و جابه‌جایی سریع',
    description:
      'از این نوار بین نقشه شرکت، پنج دپارتمان تخصصی و مرحله نهایی جابه‌جا شوید. دپارتمان‌ها پس از عبور از گیت ورودی باز می‌شوند.',
  },
  {
    target: '[data-tour="progress"]',
    title: 'زمان بازرسی FDA و امتیاز',
    description:
      'زمان باقی‌مانده تا بازرسی FDA، امتیاز کل شما و وضعیت پرسشنامه ارزیابی پژوهشی را از این بخش دنبال کنید.',
  },
  {
    target: '[data-tour="workspace"]',
    title: 'محیط تعاملی حل معماها',
    description:
      'معماهای هر دپارتمان به ترتیب باز می‌شوند. ساختارها یا گزینه‌ها را انتخاب کنید و برای ثبت، دکمه تایید همان معما را بزنید.',
  },
  {
    target: '[data-tour="clues"]',
    title: 'پرونده سرنخ‌ها و مدال‌ها',
    description:
      'سرنخ‌های کشف‌شده برای شناخت ساختار مولکول اهریمن و مدال‌های پژوهشی خود را در این ستون مرور کنید.',
  },
  {
    target: '[data-tour="profile"]',
    title: 'پروفایل کاربری و تغییر رمز عبور',
    description:
      'اطلاعات دانشجویی، آمار عملکرد و گزینه تغییر رمز عبور از طریق دکمه «پروفایل» در دسترس است.',
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [showMeegaModal, setShowMeegaModal] = useState(false);
  const [surveyPrompted, setSurveyPrompted] = useState(false);
  const [meegaSubmitted, setMeegaSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
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
    const finished = session?.status === 'completed' || session?.completed_stages?.includes('final');
    if (
      user &&
      session &&
      !finished &&
      !tourStarted &&
      localStorage.getItem('medchem_tour_seen') !== 'true'
    ) {
      setShowTour(true);
      setTourStarted(true);
    }
  }, [user, session, tourStarted]);

  useEffect(() => {
    const completed = session?.status === 'completed' || session?.completed_stages?.includes('final');
    if (completed && !meegaSubmitted && !surveyPrompted) {
      setShowMeegaModal(true);
      setSurveyPrompted(true);
    }
  }, [session, meegaSubmitted, surveyPrompted]);

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
    return toPersianDigits(`${m}:${s}`);
  };

  const showNotification = (msg: string, isError = false) => {
    setToast({ message: msg, isError });
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
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'دریافت جدول رده‌بندی ناموفق بود.', true);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setSession(null);
    setShowTour(false);
    setTourStarted(false);
    setShowProfileModal(false);
    setShowPasswordModal(false);
    setSurveyPrompted(false);
  };

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('medchem_tour_seen', 'true');
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060d18] flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-sm">
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

  const currentViewLabel =
    activeView === 'entrance'
      ? 'گیت امنیتی ورودی'
      : activeView === 'final'
      ? 'اتاق مخفی و سنتز پادزهر'
      : activeView === 'leaderboard'
      ? 'جدول رده‌بندی'
      : DEPARTMENTS.find((d) => d.code === activeView)?.title || 'نقشه دپارتمان‌ها';

  return (
    <div
      className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200 ${
        darkMode
          ? 'bg-[#060d18] text-slate-100 lab-grid-bg'
          : 'bg-slate-50 text-slate-800 lab-grid-light-bg'
      }`}
    >
      {/* نوار وضعیت بالای صفحه (HUD) */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#07111f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>بحران در فارماکوکم</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    gameCompleted
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  }`}
                >
                  {gameCompleted ? 'بحران مهار شد ✓' : 'پروژه اهریمن'}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {user.full_name} • شماره دانشجویی: <span>{toPersianDigits(user.student_id)}</span>
              </div>
            </div>
          </div>

          <div data-tour="progress" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* تایمر */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                gameCompleted
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : timeLeft < 600
                  ? 'border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300 animate-pulse'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{gameCompleted ? 'زمان باقی‌مانده:' : 'بازرسی FDA:'}</span>
              <span dir="ltr" className="font-mono text-xs sm:text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* امتیاز */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>امتیاز: {toPersianDigits(session?.total_score ?? 0)}</span>
            </div>

            {/* پرسشنامه MEEGA+ */}
            <button
              type="button"
              onClick={() => setShowMeegaModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                meegaSubmitted
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{meegaSubmitted ? 'MEEGA+ ثبت شد ✓' : 'پرسشنامه MEEGA+'}</span>
            </button>

            {/* پروفایل (شامل آمار و تغییر رمز عبور) */}
            <button
              type="button"
              data-tour="profile"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-cyan-500 bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <UserRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              <span>پروفایل</span>
            </button>

            {/* راهنمای سریع */}
            <button
              type="button"
              onClick={() => setShowTour(true)}
              title="راهنمای بازی"
              aria-label="راهنمای بازی"
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-cyan-500 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition"
            >
              <CircleHelp className="w-4 h-4" />
            </button>

            {/* تغییر تم تاریک / روشن */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              title={darkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
              aria-label={darkMode ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-300 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* خروج */}
            <button
              type="button"
              onClick={handleLogout}
              title="خروج از حساب"
              aria-label="خروج از حساب"
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-rose-400 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* نوار دسترسی سریع به اتاق‌ها (بدون اسکرول‌بار افقی سفید) */}
        <nav
          data-tour="navigation"
          aria-label="ناوبری بازی"
          className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#050c17]"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              disabled={!entranceSolved}
              onClick={() => setActiveView('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed ${
                activeView === 'map'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              نقشه شرکت
            </button>
            {DEPARTMENTS.map((d) => {
              const done = session?.completed_stages?.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  disabled={!entranceSolved}
                  onClick={() => setActiveView(d.code as ActiveView)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeView === d.code
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : done
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{d.shortTitle}</span>
                  {done && <span>✓</span>}
                </button>
              );
            })}
            <button
              type="button"
              disabled={!allFiveDepartmentsDone}
              onClick={() => setActiveView('final')}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeView === 'final'
                  ? 'bg-rose-500 text-white'
                  : allFiveDepartmentsDone
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                  : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              مرحله نهایی
            </button>
            <button
              type="button"
              onClick={openLeaderboard}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeView === 'leaderboard'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>رده‌بندی</span>
            </button>
          </div>
        </nav>
      </header>

      {/* مسیر راهنمای صفحه (Breadcrumb) */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
            className="hover:text-cyan-600 dark:hover:text-cyan-400"
          >
            بحران در فارماکوکم
          </button>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="font-bold text-cyan-700 dark:text-cyan-300">{currentViewLabel}</span>
        </div>
      </div>

      {toast && (
        <div
          role={toast.isError ? 'alert' : 'status'}
          className={`fixed bottom-5 left-5 z-50 rounded-2xl border px-4 py-3 text-sm shadow-xl flex items-center gap-2 ${
            toast.isError
              ? 'border-rose-400/50 bg-rose-950/95 text-rose-100'
              : 'border-emerald-400/50 bg-emerald-950/95 text-emerald-100'
          }`}
        >
          {toast.isError ? (
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Award className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div data-tour="workspace" className="lg:col-span-9">
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
              arrowsSolved={isPuzzleSolved('mineralocorticoid', 'effect_arrows')}
              routesSolved={isPuzzleSolved('mineralocorticoid', 'route_classification')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('mineralocorticoid', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'estrogen' && (
            <EstrogenLab
              metabolismSolved={isPuzzleSolved('estrogen', 'metabolism_enzymes')}
              oralDesignSolved={isPuzzleSolved('estrogen', 'oral_long_acting_design')}
              potencySolved={isPuzzleSolved('estrogen', 'estrogen_potency_sort')}
              dockingSolved={isPuzzleSolved('estrogen', 'receptor_docking_and_class')}
              metaboliteSolved={isPuzzleSolved('estrogen', 'active_metabolite_prevention')}
              classificationSolved={isPuzzleSolved('estrogen', 'estrogen_drug_classification')}
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
              entryPotencySolved={isPuzzleSolved('androgen', 'androgen_entry_potency_sort')}
              metaboliteSolved={isPuzzleSolved('androgen', 'flutamide_metabolite')}
              sarmSolved={isPuzzleSolved('androgen', 'sarm_alternative')}
              androgenicitySolved={isPuzzleSolved('androgen', 'low_androgenicity_design')}
              classificationSolved={isPuzzleSolved('androgen', 'antiandrogen_classification')}
              enzymeComplexSolved={isPuzzleSolved('androgen', 'five_alpha_reductase_complex')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('androgen', pCode, ans, elapsed)
              }
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'final' && (
            <FinalAntidoteLab
              mappingSolved={isPuzzleSolved('final', 'hidden_room_classification')}
              vaultSolved={isPuzzleSolved('final', 'biosynthesis_vault')}
              antidoteSolved={isPuzzleSolved('final', 'antidote_synthesis')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('final', pCode, ans, elapsed)
              }
              onOpenSurvey={() => setShowMeegaModal(true)}
              onBackToMap={() => setActiveView('map')}
            />
          )}

          {activeView === 'leaderboard' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>جدول رده‌بندی پژوهشگران (Leaderboard)</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
                  className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:border-cyan-500"
                >
                  بازگشت به ماموریت
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">رتبه</th>
                      <th className="py-2.5 px-3">نام دانشجو</th>
                      <th className="py-2.5 px-3">شماره دانشجویی</th>
                      <th className="py-2.5 px-3">امتیاز کل</th>
                      <th className="py-2.5 px-3">تعداد خطا</th>
                      <th className="py-2.5 px-3">زمان صرف‌شده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {leaderboard.map((row) => (
                      <tr key={row.student_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-cyan-600 dark:text-cyan-400">
                          #{toPersianDigits(row.rank)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-100">{row.full_name}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400">
                          {toPersianDigits(row.student_id)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {toPersianDigits(row.total_score)}
                        </td>
                        <td className="py-2.5 px-3 text-rose-600 dark:text-rose-300">
                          {toPersianDigits(row.total_errors)}
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-300">
                          {formatTime(row.time_spent_seconds)}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
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
                <div className="rounded-2xl border border-emerald-400/50 bg-emerald-50 dark:bg-gradient-to-l dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-900 p-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h2 className="font-extrabold text-base text-emerald-800 dark:text-emerald-300">
                      ماموریت با موفقیت کامل شد! پادزهر اهریمن سنتز گردید.
                    </h2>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-6">
                      امتیاز نهایی شما: <strong>{toPersianDigits(session?.total_score ?? 0)}</strong> | تعداد خطاها:{' '}
                      <strong>{toPersianDigits(session?.total_errors ?? 0)}</strong>. لطفاً برای تکمیل ارزیابی پژوهشی، فرم کوتاه MEEGA+ را ثبت کنید.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMeegaModal(true)}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2.5 text-xs transition flex items-center gap-2"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>{meegaSubmitted ? 'مشاهده / ویرایش پرسشنامه MEEGA+' : 'تکمیل پرسشنامه MEEGA+'}</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-rose-500/30 bg-rose-50/90 dark:bg-gradient-to-l dark:from-rose-950/30 dark:via-slate-900/90 dark:to-slate-900/90 p-5 flex items-start gap-3 shadow-sm">
                  <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-base text-rose-800 dark:text-rose-200">
                      هشدار امنیتی سطح ۱: فرمول «اهریمن» در سرور R&D فعال است
                    </h2>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-6">
                      هر یک از {toPersianDigits(5)} دپارتمان تحقیقاتی شرکت Apex Pharma سرنخی از ساختار شیمیایی ترکیب اهریمن را در خود پنهان کرده است.
                      پس از کشف هر {toPersianDigits(5)} سرنخ، درِ اتاق مخفی دکتر ارول برای سنتز پادزهر باز می‌شود.
                    </p>
                  </div>
                </div>
              )}

              {/* کارت مرحله نهایی: اتاق مخفی ارول */}
              <div
                className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 transition shadow-sm ${
                  allFiveDepartmentsDone
                    ? 'border-rose-400/60 bg-rose-50 dark:bg-gradient-to-l dark:from-rose-950/40 dark:to-slate-900'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      allFiveDepartmentsDone
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {allFiveDepartmentsDone ? <Skull className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      مرحله نهایی: اتاق مخفی دکتر ارول و سنتز پادزهر اهریمن
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {allFiveDepartmentsDone
                        ? 'قفل امنیتی ۵ دپارتمان باز شد! وارد اتاق مخفی شوید و پادزهر را سنتز کنید.'
                        : `نیازمند کشف هر ۵ سرنخ از دپارتمان‌های تحقیقاتی (${toPersianDigits(
                            session?.unlocked_clues?.length ?? 0
                          )}/۵ سرنخ کشف شده)`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!allFiveDepartmentsDone}
                  onClick={() => setActiveView('final')}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-5 py-2 text-xs transition"
                >
                  {gameCompleted ? 'مرور اتاق مخفی' : 'ورود به اتاق مخفی'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPARTMENTS.map((dept) => {
                  const isCompleted = session?.completed_stages?.includes(dept.code);
                  return (
                    <div
                      key={dept.code}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition shadow-sm ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-50/40 dark:bg-slate-900/85'
                          : 'border-slate-200 dark:border-cyan-500/40 bg-white dark:bg-slate-900/80 hover:border-cyan-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{dept.title}</span>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-6">{dept.subtitle}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isCompleted ? 'تکمیل شده و سرنخ ثبت شد ✓' : 'آماده ورود و رمزگشایی'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveView(dept.code as ActiveView)}
                          className={`rounded-xl font-bold px-4 py-1.5 text-xs transition ${
                            isCompleted
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
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
        <aside data-tour="clues" className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <FileSearch className="w-4 h-4" />
              <span>پرونده سرنخ‌های اهریمن ({toPersianDigits(session?.unlocked_clues?.length ?? 0)}/۵)</span>
            </div>
            {session?.unlocked_clues && session.unlocked_clues.length > 0 ? (
              <div className="space-y-2.5">
                {session.unlocked_clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/30 p-3 text-xs space-y-1"
                  >
                    <div className="font-bold text-cyan-800 dark:text-cyan-200">{clue.title}</div>
                    <div className="text-slate-600 dark:text-slate-300 leading-5">{clue.detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-6">
                هنوز سرنخی از ساختار اهریمن استخراج نشده است. معماهای دپارتمان‌ها را حل کنید.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 p-4 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Award className="w-4 h-4" />
              <span>مدال‌های پژوهشی ({toPersianDigits(badges.length)})</span>
            </div>
            {badges.length > 0 ? (
              <div className="space-y-2">
                {badges.map((b) => (
                  <div
                    key={b.badge_code}
                    className="rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/25 p-3 text-xs"
                  >
                    <div className="font-bold text-amber-800 dark:text-amber-200">{b.title}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{b.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-6">
                با حل بدون خطای معماهای هر دپارتمان، مدال تخصصی دریافت کنید.
              </p>
            )}
          </div>
        </aside>
      </main>

      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          session={session}
          badgeCount={badges.length}
          onClose={() => setShowProfileModal(false)}
          onChangePassword={() => {
            setShowProfileModal(false);
            setShowPasswordModal(true);
          }}
        />
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showTour && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} />}

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
