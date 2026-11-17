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
  CircleHelp,
  UserRound,
} from 'lucide-react';
import { api, ApiError, clearTokens, getAccessToken } from './api';
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
import { UserProfileModal } from './components/UserProfileModal';
import { GuidedTour, TourStep } from './components/GuidedTour';

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

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="navigation"]',
    title: 'نقشه و جابه‌جایی',
    description: 'از این نوار بین نقشه، پنج آزمایشگاه و اتاق نهایی جابه‌جا شوید. دپارتمان‌ها پس از عبور از گیت ورودی در دسترس هستند.',
  },
  {
    target: '[data-tour="progress"]',
    title: 'زمان و امتیاز',
    description: 'زمان بازرسی FDA، امتیاز کل و دسترسی به جدول رده‌بندی را از این قسمت دنبال کنید.',
  },
  {
    target: '[data-tour="workspace"]',
    title: 'بخش فعال بازی',
    description: 'معماهای هر بخش به ترتیب نمایش داده می‌شوند. پاسخ‌ها را انتخاب کنید و برای ثبت، از دکمه همان معما استفاده کنید.',
  },
  {
    target: '[data-tour="clues"]',
    title: 'پرونده سرنخ‌ها و نشان‌ها',
    description: 'سرنخ‌های کشف‌شده برای شناخت اهریمن و نشان‌های تخصصی خود را اینجا مرور کنید.',
  },
  {
    target: '[data-tour="profile"]',
    title: 'نمایه و امنیت حساب',
    description: 'اطلاعات حساب و آمار بازی را ببینید یا از نمایه، رمز عبور خود را به‌روزرسانی کنید.',
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
  const [startupError, setStartupError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [showMeegaModal, setShowMeegaModal] = useState(false);
  const [surveyPrompted, setSurveyPrompted] = useState(false);
  const [meegaSubmitted, setMeegaSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  const loadInitialData = async () => {
    if (!getAccessToken()) {
      setLoadingApp(false);
      return;
    }
    setStartupError(null);
    try {
      const [profile, gameData] = await Promise.all([
        api.getProfile(),
        api.getSession(),
      ]);
      const meegaStatus = await api.getMeegaStatus().catch((err: unknown) => {
        showNotification(
          err instanceof Error ? `وضعیت پرسشنامه دریافت نشد: ${err.message}` : 'وضعیت پرسشنامه دریافت نشد.',
          true
        );
        return { submitted: false };
      });
      setUser(profile);
      setSession(gameData.session);
      setBadges(gameData.badges || []);
      setMeegaSubmitted(Boolean(meegaStatus?.submitted));
      setTimeLeft(gameData.session.time_remaining_seconds ?? 3600);
      if (!gameData.session.completed_stages?.includes('entrance')) {
        setActiveView('entrance');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        setUser(null);
      } else {
        setStartupError(err instanceof Error ? err.message : 'راه‌اندازی بازی ناموفق بود.');
      }
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
    return `${m}:${s}`;
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
    setSurveyPrompted(false);
    setStartupError(null);
  };

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('medchem_tour_seen', 'true');
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-400 text-sm">
        در حال راه‌اندازی سیستم آزمایشگاه Apex Pharma...
      </div>
    );
  }

  if (!user) {
    if (getAccessToken() && startupError) {
      return (
        <div className="min-h-screen lab-grid-bg flex items-center justify-center p-4">
          <section role="alert" className="w-full max-w-lg rounded-2xl border border-rose-500/40 bg-slate-900 p-6 text-center">
            <AlertOctagon className="mx-auto h-8 w-8 text-rose-400" />
            <h1 className="mt-3 text-lg font-bold text-white">اتصال به سامانه ممکن نشد</h1>
            <p className="mt-2 text-sm text-slate-300">{startupError}</p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setLoadingApp(true);
                  void loadInitialData();
                }}
                className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950"
              >
                تلاش دوباره
              </button>
              <button
                type="button"
                onClick={() => {
                  clearTokens();
                  setStartupError(null);
                }}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200"
              >
                خروج از حساب
              </button>
            </div>
          </section>
        </div>
      );
    }
    return (
      <AuthScreen
        onSuccess={() => {
          setLoadingApp(true);
          void loadInitialData();
        }}
      />
    );
  }

  const entranceSolved = session?.completed_stages?.includes('entrance') ?? false;
  const allFiveDepartmentsDone = ['glucocorticoid', 'mineralocorticoid', 'estrogen', 'progestin', 'androgen'].every(
    (d) => session?.completed_stages?.includes(d)
  );
  const gameCompleted = session?.status === 'completed' || session?.completed_stages?.includes('final');
  const currentSection =
    activeView === 'map'
      ? 'نقشه دپارتمان‌ها'
      : activeView === 'leaderboard'
        ? 'جدول رده‌بندی'
        : activeView === 'entrance'
          ? 'گیت امنیتی ورودی'
          : activeView === 'final'
            ? 'سنتز پادزهر'
            : DEPARTMENTS.find((department) => department.code === activeView)?.title ?? 'بازی';

  return (
    <div className="min-h-screen lab-grid-bg flex flex-col">
      {/* نوار وضعیت بالای صفحه (HUD) */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#07111f]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white flex items-center gap-2">
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
              <div className="text-xs text-slate-400">
                {user.full_name} • شماره دانشجویی: <span className="font-mono">{user.student_id}</span>
              </div>
            </div>
          </div>

          <div data-tour="progress" className="flex flex-wrap items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                gameCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : timeLeft < 600
                  ? 'border-rose-500/50 bg-rose-950/50 text-rose-300 animate-pulse'
                  : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{gameCompleted ? 'زمان باقی‌مانده:' : 'بازرسی FDA:'}</span>
              <span dir="ltr" className="font-mono text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>امتیاز: {session?.total_score ?? 0}</span>
            </div>

            <button
              onClick={() => setShowMeegaModal(true)}
              disabled={!gameCompleted}
              title={gameCompleted ? 'پرسشنامه MEEGA+' : 'پس از تکمیل بازی در دسترس خواهد بود'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                meegaSubmitted
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200 hover:border-cyan-400'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{meegaSubmitted ? 'MEEGA+ ثبت شد ✓' : 'پرسشنامه MEEGA+'}</span>
            </button>

            <button
              data-tour="profile"
              onClick={() => setShowProfileModal(true)}
              title="نمایه کاربری و آمار بازی"
              aria-label="نمایه کاربری"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden text-xs font-semibold sm:inline">نمایه</span>
            </button>

            <button
              onClick={() => setShowTour(true)}
              title="راهنمای بازی"
              aria-label="راهنمای بازی"
              className="p-2 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900 text-slate-300 transition"
            >
              <CircleHelp className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowPasswordModal(true)}
              title="تغییر رمز عبور"
              className="p-2 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900 text-slate-300 transition"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="خروج از حساب"
              className="p-2 rounded-xl border border-slate-700 hover:border-rose-400 bg-slate-900 text-slate-300 hover:text-rose-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <nav
          data-tour="navigation"
          aria-label="ناوبری بازی"
          className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3"
        >
          <button
            type="button"
            disabled={!entranceSolved}
            aria-current={activeView === 'map' ? 'page' : undefined}
            onClick={() => setActiveView('map')}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              activeView === 'map'
                ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-500/60'
            }`}
          >
            نقشه شرکت
          </button>
          {DEPARTMENTS.map((department, index) => {
            const active = activeView === department.code;
            const completed = session?.completed_stages?.includes(department.code);
            return (
              <button
                key={department.code}
                type="button"
                disabled={!entranceSolved}
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveView(department.code as ActiveView)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                    : completed
                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:border-emerald-400'
                      : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-500/60'
                }`}
              >
                {index + 1}. {department.title.replace(/^دپارتمان \d+:\s*/, '')}
              </button>
            );
          })}
          <button
            type="button"
            disabled={!allFiveDepartmentsDone}
            aria-current={activeView === 'final' ? 'page' : undefined}
            onClick={() => setActiveView('final')}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              activeView === 'final'
                ? 'border-rose-400 bg-rose-500 text-white'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-rose-400/70'
            }`}
          >
            مرحله نهایی
          </button>
          <button
            type="button"
            aria-current={activeView === 'leaderboard' ? 'page' : undefined}
            onClick={openLeaderboard}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeView === 'leaderboard'
                ? 'border-amber-400 bg-amber-400 text-slate-950'
                : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-amber-400/70'
            }`}
          >
            رده‌بندی
          </button>
        </nav>
      </header>

      {toast && (
        <div
          role={toast.isError ? 'alert' : 'status'}
          className={`fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-xl ${
            toast.isError
              ? 'border-rose-400/50 bg-rose-950/95 text-rose-100'
              : 'border-emerald-400/50 bg-emerald-950/95 text-emerald-100'
          }`}
        >
          {toast.isError
            ? <AlertOctagon className="h-5 w-5 shrink-0 text-rose-400" />
            : <Award className="h-5 w-5 shrink-0 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-4 pt-4">
        <nav aria-label="مسیر صفحه" className="text-xs text-slate-400">
          <span>بحران در فارماکوکم</span>
          <span className="mx-2 text-slate-600">/</span>
          <span className="font-semibold text-cyan-200" aria-current="page">{currentSection}</span>
        </nav>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
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
              dockingSolved={isPuzzleSolved('estrogen', 'receptor_docking_and_class')}
              oralDesignSolved={isPuzzleSolved('estrogen', 'oral_long_acting_design')}
              potencySolved={isPuzzleSolved('estrogen', 'estrogen_potency_sort')}
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
              metaboliteSolved={isPuzzleSolved('androgen', 'flutamide_metabolite')}
              entryPotencySolved={isPuzzleSolved('androgen', 'androgen_entry_potency_sort')}
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
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>جدول رده‌بندی پژوهشگران (Leaderboard)</span>
                </h2>
                <button
                  onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
                  className="rounded-xl border border-slate-600 px-4 py-1.5 text-xs text-slate-200 hover:border-cyan-400"
                >
                  بازگشت به ماموریت
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="border-b border-slate-800 text-xs text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">رتبه</th>
                      <th className="py-2.5 px-3">نام دانشجو</th>
                      <th className="py-2.5 px-3">شماره دانشجویی</th>
                      <th className="py-2.5 px-3">امتیاز کل</th>
                      <th className="py-2.5 px-3">تعداد خطا</th>
                      <th className="py-2.5 px-3">زمان صرف‌شده</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {leaderboard.map((row) => (
                      <tr key={row.student_id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">#{row.rank}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-100">{row.full_name}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{row.student_id}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{row.total_score}</td>
                        <td className="py-2.5 px-3 text-rose-300">{row.total_errors}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-300">
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
                <div className="rounded-2xl border border-emerald-400/50 bg-gradient-to-l from-emerald-950/50 via-slate-900 to-slate-900 p-6 flex flex-wrap items-center justify-between gap-4">
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
                <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-950/30 via-slate-900/90 to-slate-900/90 p-5 flex items-start gap-3">
                  <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-base text-rose-200">
                      هشدار امنیتی سطح ۱: فرمول «اهریمن» در سرور R&D فعال است
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 leading-6">
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
                    ? 'border-rose-400/60 bg-gradient-to-l from-rose-950/40 to-slate-900 shadow-lg shadow-rose-950/30'
                    : 'border-slate-800 bg-slate-900/40 opacity-75'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      allFiveDepartmentsDone ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {allFiveDepartmentsDone ? <Skull className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white">
                      مرحله نهایی: اتاق مخفی دکتر ارول و سنتز پادزهر اهریمن
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {allFiveDepartmentsDone
                        ? 'قفل امنیتی ۵ دپارتمان باز شد! وارد اتاق مخفی شوید و پادزهر را سنتز کنید.'
                        : `نیازمند کشف هر ۵ سرنخ از دپارتمان‌های تحقیقاتی (${session?.unlocked_clues?.length ?? 0}/۵ سرنخ کشف شده)`}
                    </div>
                  </div>
                </div>
                <button
                  disabled={!allFiveDepartmentsDone}
                  onClick={() => setActiveView('final')}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-5 py-2 text-xs transition"
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
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-slate-900/85'
                          : 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-sm text-white">{dept.title}</span>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-400 leading-6">{dept.subtitle}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {isCompleted ? 'تکمیل شده و سرنخ ثبت شد ✓' : 'آماده ورود و رمزگشایی'}
                        </span>
                        <button
                          onClick={() => setActiveView(dept.code as ActiveView)}
                          className={`rounded-xl font-bold px-4 py-1.5 text-xs transition ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
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
          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-300 border-b border-slate-800 pb-2.5">
              <FileSearch className="w-4 h-4" />
              <span>پرونده سرنخ‌های اهریمن ({session?.unlocked_clues?.length ?? 0}/۵)</span>
            </div>
            {session?.unlocked_clues && session.unlocked_clues.length > 0 ? (
              <div className="space-y-2.5">
                {session.unlocked_clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs space-y-1"
                  >
                    <div className="font-bold text-cyan-200">{clue.title}</div>
                    <div className="text-slate-300 leading-5">{clue.detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-6">
                هنوز سرنخی از ساختار اهریمن استخراج نشده است. معماهای دپارتمان‌ها را حل کنید.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300 border-b border-slate-800 pb-2.5">
              <Award className="w-4 h-4" />
              <span>مدال‌های پژوهشی ({badges.length})</span>
            </div>
            {badges.length > 0 ? (
              <div className="space-y-2">
                {badges.map((b) => (
                  <div
                    key={b.badge_code}
                    className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-3 text-xs"
                  >
                    <div className="font-bold text-amber-200">{b.title}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{b.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-6">
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
      {showMeegaModal && (
        <MeegaSurveyModal
          onClose={() => setShowMeegaModal(false)}
          onSubmitted={() => {
            setMeegaSubmitted(true);
            showNotification('پرسشنامه پژوهشی MEEGA+ با موفقیت ثبت شد.');
          }}
        />
      )}
      {showTour && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} />}
    </div>
  );
}

export default App;
