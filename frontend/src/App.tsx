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

type ActiveView =
  | 'map'
  | 'entrance'
  | 'glucocorticoid'
  | 'mineralocorticoid'
  | 'estrogen'
  | 'progestin'
  | 'androgen'
  | 'leaderboard';

const DEPARTMENTS = [
  {
    code: 'glucocorticoid',
    title: 'دپارتمان ۱: آزمایشگاه گلوکوکورتیکوئیدها',
    subtitle: 'کانفورماسیون حلقه‌ها و تحلیل SAR ضدالتهابی',
    available: true,
  },
  {
    code: 'mineralocorticoid',
    title: 'دپارتمان ۲: بخش مینرالوکورتیکوئیدها',
    subtitle: 'احتباس آب و الکترولیت و تشخیص مسیر تجویز موضعی',
    available: true,
  },
  {
    code: 'estrogen',
    title: 'دپارتمان ۳: آزمایشگاه استروژن‌ها',
    subtitle: 'مسیر متابولیسم و داکینگ سه‌بعدی در گیرنده (Glu353/Arg394)',
    available: true,
  },
  {
    code: 'progestin',
    title: 'دپارتمان ۴: بخش پروژستین‌ها',
    subtitle: 'مشتقات ۱۹-نورآندروستان و فراهمی زیستی خوراکی',
    available: true,
  },
  {
    code: 'androgen',
    title: 'دپارتمان ۵: آندروژن‌ها و مهارکننده‌های آنزیمی',
    subtitle: 'متابولیسم فلوتامید، SARMs و کمپلکس ۵-آلفا ردوکتاز',
    available: true,
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
  const [toast, setToast] = useState<string | null>(null);

  const loadInitialData = async () => {
    if (!getAccessToken()) {
      setLoadingApp(false);
      return;
    }
    try {
      const [profile, gameData] = await Promise.all([api.getProfile(), api.getSession()]);
      setUser(profile);
      setSession(gameData.session);
      setBadges(gameData.badges || []);
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
    if (!user || !session) return;
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
      <div className="min-h-screen flex items-center justify-center text-cyan-400 text-sm">
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
  const allFiveDepartmentsDone =
    ['glucocorticoid', 'mineralocorticoid', 'estrogen', 'progestin', 'androgen'].every((d) =>
      session?.completed_stages?.includes(d)
    );

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
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  پروژه اهریمن
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {user.full_name} • شماره دانشجویی: <span className="font-mono">{user.student_id}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                timeLeft < 600
                  ? 'border-rose-500/50 bg-rose-950/50 text-rose-300 animate-pulse'
                  : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>بازرسی FDA:</span>
              <span dir="ltr" className="font-mono text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>امتیاز: {session?.total_score ?? 0}</span>
            </div>

            <button
              onClick={openLeaderboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-cyan-400 bg-slate-900 text-xs font-semibold text-slate-200 transition"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>رده‌بندی</span>
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
              enzymeComplexSolved={isPuzzleSolved('androgen', 'five_alpha_reductase_complex')}
              onSubmitPuzzle={(pCode, ans, elapsed) =>
                handlePuzzleSubmit('androgen', pCode, ans, elapsed)
              }
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
              <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-950/30 via-slate-900/90 to-slate-900/90 p-5 flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-bold text-base text-rose-200">
                    هشدار امنیتی سطح ۱: فرمول «اهریمن» در سرور R&D فعال است
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-6">
                    هر یک از ۵ دپارتمان تحقیقاتی شرکت Apex Pharma سرنخی از ساختار شیمیایی ترکیب اهریمن را در خود پنهان کرده است.
                    همه ۵ دپارتمان را بررسی کنید تا قفل اتاق مخفی سنتز پادزهر باز شود.
                  </p>
                </div>
              </div>

              {allFiveDepartmentsDone && (
                <div className="rounded-2xl border border-emerald-400/50 bg-emerald-950/40 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-sm text-emerald-300">
                      هر ۵ سرنخ ساختاری اهریمن کشف شد! درِ اتاق مخفی دکتر ارول آماده بازگشایی است.
                    </div>
                    <div className="text-xs text-slate-300 mt-1">
                      در فاز ۳: حل مسیر بیوسنتز کلسترول، سنتز پادزهر اهریمن و تکمیل فرم پژوهشی MEEGA+ اضافه می‌شود.
                    </div>
                  </div>
                </div>
              )}

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
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : !dept.available ? (
                            <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                          ) : null}
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
        <aside className="lg:col-span-3 space-y-5">
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

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}

export default App;
