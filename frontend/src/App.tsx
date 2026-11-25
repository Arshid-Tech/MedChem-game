import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  Trophy,
  Award,
  LogOut,
  Lock,
  CheckCircle2,
  AlertOctagon,
  FileSearch,
  Sparkles,
  Skull,
  ClipboardCheck,
  BookOpenCheck,
  UserRound,
  CircleHelp,
  ChevronLeft,
  Radio,
  Eye,
  Flame,
} from 'lucide-react';
import { api, ApiError, clearTokens, getAccessToken } from './api';
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
import { KnowledgeQuizModal } from './components/KnowledgeQuizModal';
import { StoryCommsModal } from './components/StoryCommsModal';
import { FloatingLabBench } from './components/FloatingLabBench';
import { LabWatermarks } from './components/visuals/LabWatermarks';
import {
  ReagentVialBadge,
  MolecularTrophyBadge,
  AtomicOrbitalBadge,
  SteroidScaffoldBadge,
} from './components/visuals/ChemBadges';
import { STORY_BEATS, StoryBeat } from './data/storyData';
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

const ALL_STAGES = [
  'entrance',
  'glucocorticoid',
  'mineralocorticoid',
  'estrogen',
  'progestin',
  'androgen',
  'final',
] as const;

const DEPARTMENTS = [
  {
    code: 'glucocorticoid',
    roomName: 'اتاق چنگال استرس',
    hormoneTag: 'Glucocorticoids',
    title: 'اتاق ۱: چنگال استرس (پروفسور کژتاب)',
    shortTitle: '۱. چنگال استرس',
    subtitle: 'اتاق پروفسور کژتاب — قفل لمسی کانفورماسیون، قوی‌تر کردن کورتیزول و ایمیل ارول',
  },
  {
    code: 'mineralocorticoid',
    roomName: 'اتاق گوله نمک',
    hormoneTag: 'Mineralocorticoids',
    title: 'اتاق ۲: گوله نمک (پروفسور زهتاب)',
    shortTitle: '۲. گوله نمک',
    subtitle: 'اتاق پروفسور زهتاب — نامه کژتاب، تماس تلفنی مرموز و جداسازی ترکیبات موضعی',
  },
  {
    code: 'estrogen',
    roomName: 'اتاق ماه عسل',
    hormoneTag: 'Estrogens',
    title: 'اتاق ۳: ماه عسل (آقا و خانم لارنس)',
    shortTitle: '۳. ماه عسل',
    subtitle: 'آزمایشگاه حیوانات لارنس — متابولیسم، فرم خوراکی، فرار ۱۰ ثانیه‌ای و راز سیانید',
  },
  {
    code: 'progestin',
    roomName: 'اتاق نی‌نی کوچولو',
    hormoneTag: 'Progestins',
    title: 'اتاق ۴: نی‌نی کوچولو (دکتر ماریا)',
    shortTitle: '۴. نی‌نی کوچولو',
    subtitle: 'اتاق همسر دکتر ارول — رمز تاریخ تولد بچه و تخته تحقیقات ۱۹-نورآندروستان',
  },
  {
    code: 'androgen',
    roomName: 'اتاق ریش و سیبیل',
    hormoneTag: 'Androgens',
    title: 'اتاق ۵: ریش و سیبیل (آقای زیگموند)',
    shortTitle: '۵. ریش و سیبیل',
    subtitle: 'خیانت ارول به زیگموند — متابولیت فلوتامید، ساخت SARM و کمپلکس ۵-آلفا ردوکتاز',
  },
];

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="navigation"]',
    title: 'نقشه کارخانه و جابه‌جایی آزاد',
    description:
      'از این نوار همیشه می‌توانید بین ورودی کارخانه، نقشه، ۵ اتاق تخصصی و اتاق مخفی دکتر ارول جابه‌جا شوید و حتی پس از اتمام بازی، تمام مراحل قبل را مرور کنید.',
  },
  {
    target: '[data-tour="progress"]',
    title: 'نوار پیشرفت و امتیاز (XP)',
    description:
      'پیشرفت مرحله‌به‌مرحله در کارخانه، زمان باقی‌مانده، امتیاز کل، پیش/پس‌آزمون و پرسشنامه MEEGA+ را از نوار بالای صفحه دنبال کنید.',
  },
  {
    target: '[data-tour="workspace"]',
    title: 'محیط تعاملی دفترچه آزمایشگاه',
    description:
      'ساختارهای شیمیایی را روی بوم نقطه‌ای تحلیل کنید، قطعات و گروه‌های عاملی را بچینید و در هر صفحه از دکمه شناور «میز کار مولکول‌سازی» استفاده کنید.',
  },
  {
    target: '[data-tour="clues"]',
    title: 'پرونده سرنخ‌های اهریمن و مدال‌ها',
    description:
      'پنج سرنخ کشف‌شده از ساختار مولکول اهریمن و نشان‌های شیمیایی شما در این ستون جمع‌آوری می‌شوند.',
  },
  {
    target: '[data-tour="profile"]',
    title: 'پروفایل کاربری و تنظیمات',
    description:
      'اطلاعات دانشجویی، ویرایش مشخصات پژوهشی، آمار عملکرد و تغییر رمز عبور از طریق دکمه «پروفایل» در دسترس است.',
  },
];

const STORY_STORAGE_KEY = 'pharmacochem_story_seen_v3';

function getSeenStoryIds(): string[] {
  try {
    const raw = localStorage.getItem(STORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markStorySeen(id: string) {
  const seen = new Set(getSeenStoryIds());
  seen.add(id);
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(Array.from(seen)));
}

export function App() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('map');
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [loadingApp, setLoadingApp] = useState<boolean>(true);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [showMeegaModal, setShowMeegaModal] = useState(false);
  const [surveyPrompted, setSurveyPrompted] = useState(false);
  const [meegaSubmitted, setMeegaSubmitted] = useState(false);
  const [quizModalPhase, setQuizModalPhase] = useState<'pre' | 'post' | null>(null);
  const [preAssessment, setPreAssessment] = useState<any | null>(null);
  const [postAssessment, setPostAssessment] = useState<any | null>(null);
  const [activeStoryBeat, setActiveStoryBeat] = useState<StoryBeat | null>(null);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message: msg, isError });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 5000);
  };

  const triggerStoryBeat = (beatId: string, force = false) => {
    const beat = STORY_BEATS[beatId];
    if (!beat) return;
    if (!force && getSeenStoryIds().includes(beatId)) return;
    setActiveStoryBeat(beat);
  };

  const closeStoryBeat = () => {
    if (activeStoryBeat) {
      markStorySeen(activeStoryBeat.id);
    }
    setActiveStoryBeat(null);
  };

  const loadInitialData = async () => {
    if (!getAccessToken()) {
      setLoadingApp(false);
      return;
    }
    setStartupError(null);
    try {
      const [profile, gameData] = await Promise.all([api.getProfile(), api.getSession()]);
      const [meegaStatus, assessmentStatus] = await Promise.all([
        api.getMeegaStatus().catch(() => ({ submitted: false })),
        api.getAssessmentStatus().catch(() => ({ pre: null, post: null })),
      ]);
      setUser(profile);
      setSession(gameData.session);
      setBadges(gameData.badges || []);
      setMeegaSubmitted(Boolean(meegaStatus?.submitted));
      setPreAssessment(assessmentStatus?.pre ?? null);
      setPostAssessment(assessmentStatus?.post ?? null);
      setTimeLeft(gameData.session.time_remaining_seconds ?? 3600);
      if (!gameData.session.completed_stages?.includes('entrance')) {
        setActiveView('entrance');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearTokens();
        setUser(null);
      } else {
        setStartupError(
          err instanceof Error
            ? err.message
            : 'ارتباط با سرور آزمایشگاه برقرار نشد. لطفاً دوباره تلاش کنید.'
        );
      }
    } finally {
      setLoadingApp(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!user || !session || showTour) return;
    if (activeView === 'entrance') {
      triggerStoryBeat('intro_call');
    } else if (activeView === 'map' && session.completed_stages?.includes('entrance')) {
      triggerStoryBeat('entrance_unlocked');
    } else if (STORY_BEATS[activeView]) {
      triggerStoryBeat(activeView);
    }
  }, [activeView, user, session, showTour]);

  useEffect(() => {
    const finished = session?.status === 'completed' || session?.completed_stages?.includes('final');
    if (
      user &&
      session &&
      !finished &&
      !tourStarted &&
      localStorage.getItem('pharmacochem_tour_seen') !== 'true'
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
      showNotification(`نشان جدید دریافت شد: ${res.new_badge.title}`);
    } else if (res.unlocked_clue) {
      showNotification(`سرنخ جدید کشف شد: ${res.unlocked_clue.title}`);
    }
    return { correct: res.correct, feedback: res.feedback };
  };

  const isPuzzleSolved = (stageCode: string, puzzleCode: string): boolean => {
    return (
      session?.puzzle_attempts?.some(
        (a) => a.stage_code === stageCode && a.puzzle_code === puzzleCode && a.is_solved
      ) ?? false
    );
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
    setQuizModalPhase(null);
    setPreAssessment(null);
    setPostAssessment(null);
    setActiveStoryBeat(null);
    setStartupError(null);
  };

  const closeTour = () => {
    setShowTour(false);
    localStorage.setItem('pharmacochem_tour_seen', 'true');
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen workbook-bg flex items-center justify-center p-4">
        <LabWatermarks />
        <div className="relative z-10 lab-card px-6 py-5 flex items-center gap-3">
          <ReagentVialBadge className="w-10 h-10" />
          <div className="text-sm font-bold text-[#18181B]">
            در حال باز کردن دفترچه آزمایشگاه دکتر ارول...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (getAccessToken() && startupError) {
      return (
        <div className="min-h-screen workbook-bg flex items-center justify-center p-4">
          <LabWatermarks />
          <section role="alert" className="relative z-10 w-full max-w-lg lab-card p-6 text-center space-y-4">
            <AlertOctagon className="mx-auto h-9 w-9 text-[#E11D48]" />
            <h1 className="text-lg font-heading font-bold text-[#18181B]">
              اتصال به سرور آزمایشگاه برقرار نشد
            </h1>
            <p className="text-xs leading-6 text-[#52525B]">{startupError}</p>
            <p className="text-[11px] text-[#52525B]">
              نکته: در پلن رایگان سرور، بیدار شدن سرویس پس از وقفه ممکن است ۳۰ تا ۵۰ ثانیه زمان ببرد.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLoadingApp(true);
                  void loadInitialData();
                }}
                className="btn-tactile btn-tactile-primary px-5 py-2 text-xs"
              >
                تلاش دوباره
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-tactile btn-tactile-surface px-4 py-2 text-xs"
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
  const allFiveDepartmentsDone = [
    'glucocorticoid',
    'mineralocorticoid',
    'estrogen',
    'progestin',
    'androgen',
  ].every((d) => session?.completed_stages?.includes(d));
  const gameCompleted = session?.status === 'completed' || session?.completed_stages?.includes('final');
  const completedCount = session?.completed_stages?.length ?? 0;

  const currentStoryBeatId =
    activeView === 'entrance'
      ? 'intro_call'
      : activeView === 'map'
      ? entranceSolved
        ? 'entrance_unlocked'
        : 'intro_call'
      : STORY_BEATS[activeView]
      ? activeView
      : 'intro_call';

  const currentViewLabel =
    activeView === 'entrance'
      ? 'ورودی کارخانه'
      : activeView === 'final'
      ? 'اتاق مخفی ارول'
      : activeView === 'leaderboard'
      ? 'جدول رده‌بندی'
      : DEPARTMENTS.find((d) => d.code === activeView)?.roomName || 'نقشه کارخانه';

  const activeQuizPhase: 'pre' | 'post' = gameCompleted ? 'post' : 'pre';
  const activeQuizDone = activeQuizPhase === 'post' ? Boolean(postAssessment) : Boolean(preAssessment);

  return (
    <div className="min-h-screen workbook-bg workbook-scope flex flex-col overflow-x-hidden pb-20 text-[#18181B]">
      <LabWatermarks />

      {/* Compact Single-Row Top HUD Bar */}
      <header className="sticky top-0 z-40 border-b-2 border-[#18181B] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
          {/* Start: Current Module/Level Badge */}
          <div className="flex items-center gap-2.5">
            <ReagentVialBadge className="w-9 h-9 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs sm:text-sm text-[#18181B]">
                  کارخانه مولکول دکتر ارول
                </span>
                <span className="lab-badge px-2 py-0.5 text-[10px] bg-[#EFECE6] text-[#18181B]">
                  {currentViewLabel}
                </span>
              </div>
              <div className="text-[11px] text-[#52525B]">
                {user.full_name} · <span className="font-mono">{user.student_id}</span>
              </div>
            </div>
          </div>

          {/* Center: Segmented Progress Bar (2px solid #18181B) */}
          <div data-tour="progress" className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6]">
              {ALL_STAGES.map((st) => {
                const done = session?.completed_stages?.includes(st);
                const isCurrent = activeView === st;
                return (
                  <div
                    key={st}
                    title={st}
                    className={`h-3 w-7 rounded-[3px] border border-[#18181B] transition-colors ${
                      done
                        ? 'bg-[#16A34A]'
                        : isCurrent
                        ? 'bg-[#0D9488]'
                        : 'bg-[#FFFFFF]'
                    }`}
                  />
                );
              })}
            </div>
            <span dir="ltr" className="font-mono text-xs font-extrabold text-[#18181B] metric-mono">
              {completedCount}/7
            </span>
          </div>

          {/* End: Streak/Timer + XP Badge in JetBrains Mono + Compact Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => triggerStoryBeat(currentStoryBeatId, true)}
              className="btn-tactile btn-tactile-cream px-2.5 py-1 text-xs"
            >
              <Radio className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="hidden sm:inline">بی‌سیم</span>
            </button>

            <div
              dir="ltr"
              className={`lab-badge px-2.5 py-1 text-xs font-mono metric-mono ${
                gameCompleted
                  ? 'bg-[#16A34A] text-white'
                  : timeLeft < 600
                  ? 'bg-[#E11D48] text-white'
                  : 'bg-[#EFECE6] text-[#18181B]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div
              dir="ltr"
              className="lab-badge px-2.5 py-1 text-xs font-mono metric-mono bg-[#F59E0B] text-[#18181B]"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{session?.total_score ?? 0} XP</span>
            </div>

            <button
              type="button"
              onClick={() => setQuizModalPhase(activeQuizPhase)}
              className={`btn-tactile px-2.5 py-1 text-xs ${
                activeQuizDone ? 'btn-tactile-emerald' : 'btn-tactile-surface'
              }`}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">
                {activeQuizPhase === 'post' ? 'پس‌آزمون' : 'پیش‌آزمون'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowMeegaModal(true)}
              className={`btn-tactile px-2.5 py-1 text-xs ${
                meegaSubmitted ? 'btn-tactile-emerald' : 'btn-tactile-primary'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">MEEGA+</span>
            </button>

            <button
              type="button"
              data-tour="profile"
              onClick={() => setShowProfileModal(true)}
              title="پروفایل"
              aria-label="پروفایل"
              className="btn-tactile btn-tactile-surface p-1.5"
            >
              <UserRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowTour(true)}
              title="راهنمای بازی"
              aria-label="راهنمای بازی"
              className="btn-tactile btn-tactile-surface p-1.5"
            >
              <CircleHelp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="خروج از حساب"
              aria-label="خروج از حساب"
              className="btn-tactile btn-tactile-surface p-1.5 hover:bg-[#FFE4E6] hover:text-[#E11D48]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Ribbon */}
        <nav
          data-tour="navigation"
          aria-label="ناوبری بازی"
          className="border-t-2 border-[#18181B] bg-[#EFECE6]"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveView('entrance')}
              className={`px-3 py-1 rounded-[6px] border-2 border-[#18181B] text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeView === 'entrance'
                  ? 'bg-[#0D9488] text-white'
                  : entranceSolved
                  ? 'bg-[#DCFCE7] text-[#18181B]'
                  : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#F7F5F0]'
              }`}
            >
              <span>ورودی کارخانه</span>
              {entranceSolved && <span className="text-[#16A34A]">✓</span>}
            </button>
            <button
              type="button"
              disabled={!entranceSolved}
              onClick={() => setActiveView('map')}
              className={`px-3 py-1 rounded-[6px] border-2 border-[#18181B] text-xs font-bold whitespace-nowrap transition disabled:opacity-40 disabled:cursor-not-allowed ${
                activeView === 'map'
                  ? 'bg-[#0D9488] text-white'
                  : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#F7F5F0]'
              }`}
            >
              نقشه کارخانه
            </button>
            {DEPARTMENTS.map((d) => {
              const done = session?.completed_stages?.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  disabled={!entranceSolved}
                  onClick={() => setActiveView(d.code as ActiveView)}
                  className={`px-3 py-1 rounded-[6px] border-2 border-[#18181B] text-xs font-bold whitespace-nowrap transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeView === d.code
                      ? 'bg-[#0D9488] text-white'
                      : done
                      ? 'bg-[#DCFCE7] text-[#18181B]'
                      : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <span>{d.shortTitle}</span>
                  {done && <span className="text-[#16A34A]">✓</span>}
                </button>
              );
            })}
            <button
              type="button"
              disabled={!allFiveDepartmentsDone}
              onClick={() => setActiveView('final')}
              className={`px-3 py-1 rounded-[6px] border-2 border-[#18181B] text-xs font-bold whitespace-nowrap transition ${
                activeView === 'final'
                  ? 'bg-[#E11D48] text-white'
                  : allFiveDepartmentsDone
                  ? 'bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3]'
                  : 'bg-[#FFFFFF] text-[#52525B] opacity-40 cursor-not-allowed'
              }`}
            >
              اتاق مخفی ارول
            </button>
            <button
              type="button"
              onClick={openLeaderboard}
              className={`px-3 py-1 rounded-[6px] border-2 border-[#18181B] text-xs font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeView === 'leaderboard'
                  ? 'bg-[#F59E0B] text-[#18181B]'
                  : 'bg-[#FFFFFF] text-[#18181B] hover:bg-[#FEF3C7]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>رده‌بندی</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Breadcrumb & Review Mode Indicator */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 pt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#52525B]">
          <button
            type="button"
            onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
            className="hover:text-[#0D9488] font-semibold"
          >
            دفترچه کارخانه مولکول
          </button>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="font-heading font-bold text-[#18181B]">{currentViewLabel}</span>
        </div>

        {gameCompleted && (
          <div className="lab-badge px-3 py-1 text-[11px] bg-[#DCFCE7] text-[#18181B]">
            <Eye className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>حالت مرور آزاد فعال است — می‌توانید هر مرحله را دوباره بررسی کنید</span>
          </div>
        )}
      </div>

      {toast && (
        <div
          role={toast.isError ? 'alert' : 'status'}
          className={`fixed bottom-5 left-5 z-50 lab-card px-4 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 ${
            toast.isError ? 'bg-[#FFE4E6] text-[#E11D48]' : 'bg-[#DCFCE7] text-[#18181B]'
          }`}
        >
          {toast.isError ? (
            <AlertOctagon className="w-5 h-5 text-[#E11D48] shrink-0" />
          ) : (
            <Award className="w-5 h-5 text-[#16A34A] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main 65/35 Desktop Split Layout (Stacked on Mobile) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-5 grid grid-cols-1 lg:grid-cols-[minmax(0,68%)_minmax(0,32%)] gap-6 items-start">
        <div data-tour="workspace" className="min-w-0">
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
            <div className="lab-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-3">
                <h2 className="font-heading font-bold text-base sm:text-lg text-[#18181B] flex items-center gap-2">
                  <MolecularTrophyBadge className="w-8 h-8" />
                  <span>جدول رده‌بندی پژوهشگران (Leaderboard)</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView(entranceSolved ? 'map' : 'entrance')}
                  className="btn-tactile btn-tactile-surface px-4 py-1.5 text-xs"
                >
                  بازگشت به ماموریت
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="border-b-2 border-[#18181B] bg-[#EFECE6] text-xs text-[#18181B]">
                    <tr>
                      <th className="py-2.5 px-3">رتبه</th>
                      <th className="py-2.5 px-3">نام دانشجو</th>
                      <th className="py-2.5 px-3">شماره دانشجویی</th>
                      <th className="py-2.5 px-3">امتیاز (XP)</th>
                      <th className="py-2.5 px-3">خطاها</th>
                      <th className="py-2.5 px-3">زمان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18181B]/15">
                    {leaderboard.map((row) => (
                      <tr key={row.student_id} className="hover:bg-[#EFECE6]/60">
                        <td className="py-2.5 px-3 font-mono font-extrabold text-[#0D9488] metric-mono">
                          #{row.rank}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#18181B]">{row.full_name}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-[#52525B] metric-mono">
                          {row.student_id}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold text-[#16A34A] metric-mono">
                          {row.total_score}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#E11D48] metric-mono">
                          {row.total_errors}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-xs text-[#52525B] metric-mono">
                          {formatTime(row.time_spent_seconds)}
                        </td>
                      </tr>
                    ))}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#52525B] text-xs">
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
                <div className="lab-card bg-[#DCFCE7] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MolecularTrophyBadge className="w-12 h-12 shrink-0" />
                    <div className="space-y-1">
                      <h2 className="font-heading font-bold text-base text-[#18181B]">
                        تبریک! به ساختار اهریمن رسیدی و پادزهرش رو ساختی!
                      </h2>
                      <p className="text-xs text-[#52525B] leading-6">
                        امتیاز نهایی: <strong className="font-mono text-[#18181B]">{session?.total_score ?? 0} XP</strong> · خطاها:{' '}
                        <strong className="font-mono text-[#18181B]">{session?.total_errors ?? 0}</strong>. هنوز می‌تونی هر اتاقی رو دوباره مرور کنی.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizModalPhase('post')}
                      className="btn-tactile btn-tactile-amber px-4 py-2 text-xs"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      <span>{postAssessment ? 'مشاهده پس‌آزمون ✓' : 'انجام پس‌آزمون'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMeegaModal(true)}
                      className="btn-tactile btn-tactile-primary px-4 py-2 text-xs"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>{meegaSubmitted ? 'مشاهده MEEGA+ ✓' : 'تکمیل MEEGA+'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lab-card-cream p-5 flex items-start gap-3">
                  <SteroidScaffoldBadge className="w-12 h-10 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="font-heading font-bold text-base text-[#18181B]">
                      پیام همکار پشت بی‌سیم: از هر اتاقی که دوست داری شروع کن!
                    </h2>
                    <p className="text-xs text-[#52525B] leading-6">
                      هر اتاق توی کارخانه دکتر ارول مربوط به یه دسته از هورمون‌های استروئیدیه. هر ۵ اتاق رو بگرد و سرنخ‌های مولکول «اهریمن» رو جمع کن تا درِ اتاق مخفی خود ارول باز بشه.
                    </p>
                  </div>
                </div>
              )}

              {/* Final Secret Room Card */}
              <div
                className={`lab-card p-5 flex flex-wrap items-center justify-between gap-4 ${
                  allFiveDepartmentsDone ? 'bg-[#FFE4E6]' : 'bg-[#EFECE6] opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[6px] border-2 border-[#18181B] bg-[#FFFFFF] flex items-center justify-center shrink-0">
                    {allFiveDepartmentsDone ? (
                      <Skull className="w-5 h-5 text-[#E11D48]" />
                    ) : (
                      <Lock className="w-5 h-5 text-[#52525B]" />
                    )}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-[#18181B]">
                      اتاق مخفی دکتر ارول و گاوصندوق «اهریمن»
                    </div>
                    <div className="text-xs text-[#52525B] mt-1">
                      {allFiveDepartmentsDone
                        ? 'همه ۵ سرنخ جمع شدن! وارد اتاق مخفی شو، رمز جدول رو بشکن و ساختار اهریمن رو خنثی کن.'
                        : `نیازمند گشتن هر ۵ اتاق کارخانه (${toPersianDigits(
                            session?.unlocked_clues?.length ?? 0
                          )}/۵ سرنخ پیدا شده)`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!allFiveDepartmentsDone}
                  onClick={() => setActiveView('final')}
                  className="btn-tactile btn-tactile-crimson px-5 py-2 text-xs"
                >
                  {gameCompleted ? 'مرور اتاق مخفی' : 'ورود به اتاق مخفی'}
                </button>
              </div>

              {/* 5 Department Workbook Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEPARTMENTS.map((dept, idx) => {
                  const isCompleted = session?.completed_stages?.includes(dept.code);
                  return (
                    <div
                      key={dept.code}
                      className={`lab-card p-5 flex flex-col justify-between ${
                        isCompleted ? 'bg-[#F0FDF4]' : 'bg-[#FFFFFF]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] font-mono text-xs font-extrabold flex items-center justify-center text-[#18181B]">
                              0{idx + 1}
                            </span>
                            <div>
                              <div className="font-heading font-bold text-sm text-[#18181B]">
                                {dept.roomName}
                              </div>
                              <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-[#0D9488]">
                                {dept.hormoneTag}
                              </div>
                            </div>
                          </div>
                          {isCompleted && <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />}
                        </div>
                        <p className="text-xs text-[#52525B] leading-6 mt-2">{dept.subtitle}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t-2 border-[#18181B]/15 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#52525B]">
                          {isCompleted ? 'تکمیل شده · قابل مرور ✓' : 'آماده ورود و رمزگشایی'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveView(dept.code as ActiveView)}
                          className={`btn-tactile px-4 py-1.5 text-xs ${
                            isCompleted ? 'btn-tactile-surface' : 'btn-tactile-primary'
                          }`}
                        >
                          {isCompleted ? 'مرور اتاق' : 'ورود به اتاق'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Lab Notebook Sidebar (32%) */}
        <aside data-tour="clues" className="space-y-5">
          {/* Clues Dossier */}
          <div className="lab-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-heading font-bold text-[#18181B]">
                <FileSearch className="w-4 h-4 text-[#0D9488]" />
                <span>پرونده سرنخ‌های اهریمن</span>
              </div>
              <span dir="ltr" className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-[4px] border border-[#18181B] bg-[#EFECE6] metric-mono">
                {session?.unlocked_clues?.length ?? 0}/5
              </span>
            </div>

            {session?.unlocked_clues && session.unlocked_clues.length > 0 ? (
              <div className="space-y-2.5">
                {session.unlocked_clues.map((clue) => (
                  <div
                    key={clue.id}
                    className="rounded-[6px] border-2 border-[#18181B] bg-[#EFECE6] p-3 text-xs space-y-1"
                  >
                    <div className="font-bold text-[#0D9488]">{clue.title}</div>
                    <div className="text-[#18181B] leading-5">{clue.detail}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[6px] border-2 border-dashed border-[#71717A] bg-[#F7F5F0] p-4 flex flex-col items-center text-center gap-2">
                <AtomicOrbitalBadge className="w-10 h-10" />
                <p className="text-xs text-[#52525B] leading-5">
                  هنوز سرنخی از ساختار اهریمن پیدا نکردی. اتاق‌های کارخونه رو بگرد!
                </p>
              </div>
            )}
          </div>

          {/* Illustrated Chemistry Badges */}
          <div className="lab-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#18181B] pb-2.5">
              <div className="flex items-center gap-2 text-sm font-heading font-bold text-[#18181B]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>نشان‌های آزمایشگاهی</span>
              </div>
              <span dir="ltr" className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-[4px] border border-[#18181B] bg-[#F59E0B] text-[#18181B] metric-mono">
                {badges.length}
              </span>
            </div>

            {badges.length > 0 ? (
              <div className="space-y-2">
                {badges.map((b) => (
                  <div
                    key={b.badge_code}
                    className="rounded-[6px] border-2 border-[#18181B] bg-[#FEF3C7] p-3 text-xs flex items-start gap-2.5"
                  >
                    <MolecularTrophyBadge className="w-8 h-8 shrink-0" />
                    <div>
                      <div className="font-bold text-[#18181B]">{b.title}</div>
                      <div className="text-[#52525B] text-[11px] mt-0.5">{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[6px] border-2 border-dashed border-[#71717A] bg-[#F7F5F0] p-4 flex flex-col items-center text-center gap-2">
                <MolecularTrophyBadge className="w-10 h-10 opacity-85" />
                <p className="text-xs text-[#52525B] leading-5">
                  با حل بدون خطای معماهای هر اتاق، نشان شیمیایی تخصصی دریافت کن.
                </p>
              </div>
            )}
          </div>
        </aside>
      </main>

      <FloatingLabBench />

      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          session={session}
          badgeCount={badges.length}
          onClose={() => setShowProfileModal(false)}
          onProfileUpdated={(updatedUser) => setUser(updatedUser)}
          onChangePassword={() => {
            setShowProfileModal(false);
            setShowPasswordModal(true);
          }}
        />
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

      {showTour && <GuidedTour steps={TOUR_STEPS} onClose={closeTour} />}

      {activeStoryBeat && <StoryCommsModal beat={activeStoryBeat} onClose={closeStoryBeat} />}

      {quizModalPhase && (
        <KnowledgeQuizModal
          phase={quizModalPhase}
          preScorePercent={preAssessment?.percentage ?? null}
          onClose={() => setQuizModalPhase(null)}
          onSubmitted={(p, assessment) => {
            if (p === 'pre') {
              setPreAssessment(assessment);
              showNotification('پیش‌آزمون با موفقیت ثبت شد.');
            } else {
              setPostAssessment(assessment);
              showNotification('پس‌آزمون با موفقیت ثبت شد.');
            }
          }}
        />
      )}

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
