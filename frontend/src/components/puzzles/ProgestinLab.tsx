import React, { useMemo, useState } from 'react';
import { Shield, Lock, Unlock, CheckCircle2, AlertTriangle, Wrench, FlaskRound } from 'lucide-react';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { SteroidSandbox } from '../molecules/SteroidSandbox';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { usePuzzleTimer } from '../../utils/usePuzzleTimer';
import { deterministicShuffle } from '../../utils/shuffle';
import { toPersianDigits } from '../../utils/persian';

interface Props {
  codeSolved: boolean;
  designSolved: boolean;
  onSubmitPuzzle: (
    puzzleCode: string,
    answer: unknown,
    elapsedSeconds: number
  ) => Promise<{ correct: boolean; feedback: string }>;
  onBackToMap: () => void;
}

const PROGESTIN_STRUCTURES = [
  {
    id: '1',
    blindLabel: 'ساختار ۱',
    revealedName: '۱۶-متیلن-۱۷α-استوکسی‌پروژسترون',
    revealedNote: 'مشتق پرگنان دارای متیلن C16 و استات C17α (کاهش عوارض آندروژنی)',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)C(=C)C[C@H]2[C@@H]3CCC4=CC(=O)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'نورژستیمات (Norgestimate)',
    revealedNote: 'دارای اکسیم C3 و اتینیل 17α (افزایش نیمه‌عمر و کاهش آندروژنیسیته)',
    smiles: 'C#C[C@]1(OC(C)=O)CC[C@H]2[C@@H]3CCC4=CC(=NO)CC[C@@H]4[C@H]3CC[C@@]12CC',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'پیش‌داروی اکسیم-استر 6α-متیل',
    revealedNote: 'بهبود فراهمی زیستی، افزایش نیمه‌عمر و کاهش آندروژنیسیته',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C[C@H](C)C4=CC(=NO)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: 'اتینودیول دی‌استات (Ethynodiol Diacetate)',
    revealedNote: 'دی‌استات 3β,17β و اتینیل 17α (افزایش فراهمی زیستی و نیمه‌عمر)',
    smiles: 'C#C[C@]1(OC(C)=O)CC[C@H]2[C@@H]3CCC4=C[C@@H](OC(C)=O)CC[C@@H]4[C@H]3CC[C@@]12C',
  },
];

export const ProgestinLab: React.FC<Props> = ({
  codeSolved,
  designSolved,
  onSubmitPuzzle,
  onBackToMap,
}) => {
  const [checks, setChecks] = useState<{
    bioavailability: string[];
    half_life: string[];
    low_androgen: string[];
  }>(
    codeSolved
      ? { bioavailability: ['3', '4'], half_life: ['2', '3', '4'], low_androgen: ['1', '2', '3'] }
      : { bioavailability: [], half_life: [], low_androgen: [] }
  );
  const codeTimer = usePuzzleTimer(true, codeSolved);
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  const [selectedMods, setSelectedMods] = useState<string[]>(
    designSolved ? ['remove_c19_methyl', 'c17_alpha_ethynyl', 'c3_oxime_or_ester'] : []
  );
  const designTimer = usePuzzleTimer(codeSolved, designSolved);
  const [designFeedback, setDesignFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [designLoading, setDesignLoading] = useState(false);

  const shuffledStructures = useMemo(
    () => deterministicShuffle(PROGESTIN_STRUCTURES, 'prog-structures-v3'),
    []
  );

  const toggleCheck = (row: keyof typeof checks, num: string) => {
    if (codeSolved) return;
    setChecks((prev) => {
      const exists = prev[row].includes(num);
      const next = exists ? prev[row].filter((x) => x !== num) : [...prev[row], num].sort();
      return { ...prev, [row]: next };
    });
  };

  const sumDigits = (arr: string[]) => arr.reduce((acc, v) => acc + Number(v), 0);

  const handleCodeSubmit = async () => {
    setCodeLoading(true);
    setCodeFeedback(null);
    const elapsed = codeTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('pk_safe_code', checks, elapsed);
      setCodeFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setCodeFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setCodeLoading(false);
    }
  };

  const handleDesignSubmit = async () => {
    setDesignLoading(true);
    setDesignFeedback(null);
    const elapsed = designTimer.consumeElapsedSeconds();
    try {
      const res = await onSubmitPuzzle('norandrostane_design', selectedMods, elapsed);
      setDesignFeedback({ ok: res.correct, text: res.feedback });
    } catch (err: unknown) {
      setDesignFeedback({ ok: false, text: err instanceof Error ? err.message : 'ثبت پاسخ ناموفق بود.' });
    } finally {
      setDesignLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/30 bg-white dark:bg-slate-900/80 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-lg">
            <Shield className="w-6 h-6" />
            <span>🍼 اتاق نی‌نی کوچولو — اتاق دکتر ماریا، همسر ارول (پروژسترون)</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 leading-6">
            بچه دکتر ماریا و ارول به‌تازگی به دنیا اومده و ماریا مخفیانه دنبال راه فرار از دست پروژه اهریمن می‌گرده...
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-300 dark:border-slate-600 hover:border-cyan-500 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          بازگشت به نقشه کارخانه
        </button>
      </div>

      {/* گام ۱: رمز تاریخ تولد بچه */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {codeSolved ? <Unlock className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
            <span>گام {toPersianDigits(1)}: رمز ورود به اتاق (تاریخ تولد بچه ماریا و ارول!)</span>
          </h3>
          <div
            dir="ltr"
            className="font-mono text-xs bg-slate-100 dark:bg-slate-950 border border-cyan-500/40 px-3 py-1.5 rounded-lg text-cyan-700 dark:text-cyan-300 font-bold"
          >
            تاریخ تولد: {toPersianDigits(202)}{toPersianDigits(sumDigits(checks.low_androgen))} / {toPersianDigits(sumDigits(checks.half_life))} / {toPersianDigits(sumDigits(checks.bioavailability))}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          تاریخ تولد بچه‌شونو رمز ورود به اتاق گذاشتن! برای هر ویژگی، ساختارهای درست رو انتخاب کن تا جمع اعدادشون رمز تاریخ تولد رو بسازه (اعدادی که انتخاب نکنی صفر محسوب می‌شن):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {shuffledStructures.map((s) => (
            <MoleculeStructureCard
              key={s.id}
              smiles={s.smiles}
              label={s.blindLabel}
              revealed={codeSolved}
              revealedName={s.revealedName}
              revealedNote={s.revealedNote}
            />
          ))}
        </div>

        <div className="space-y-3">
          {(
            [
              { key: 'bioavailability', label: '↑ افزایش فراهمی زیستی' },
              { key: 'half_life', label: '↑ افزایش نیمه‌عمر' },
              { key: 'low_androgen', label: '↓ کاهش اثر آندروژنی' },
            ] as const
          ).map((row) => (
            <div
              key={row.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 px-4 py-3"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{row.label}</span>
              <div className="flex items-center gap-2">
                {['1', '2', '3', '4'].map((num) => {
                  const active = checks[row.key].includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={codeSolved}
                      onClick={() => toggleCheck(row.key, num)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border transition ${
                        active
                          ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400'
                      }`}
                    >
                      {toPersianDigits(num)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <ProgressiveHintBox
          solved={codeSolved}
          hints={[
            'اکسیم روی C3، استرهای محافظت‌کننده و متیل روی C6 نیمه‌عمر و پایداری را افزایش می‌دهند.',
            'برای فراهمی زیستی ساختارهای ۳ و ۴ (جمع = ۷)، برای نیمه‌عمر ۲ و ۳ و ۴ (جمع = ۹) و برای کاهش آندروژنیسیته ۱ و ۲ و ۳ (جمع = ۶ ← سال ۲۰۲۶) درست هستند.',
          ]}
        />

        {codeFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              codeFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {codeFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{codeFeedback.text}</span>
          </div>
        )}

        {!codeSolved && (
          <div className="flex justify-end">
            <button
              type="button"
              disabled={
                codeLoading ||
                !checks.bioavailability.length ||
                !checks.half_life.length ||
                !checks.low_androgen.length
              }
              onClick={handleCodeSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-5 py-2.5 text-sm transition"
            >
              {codeLoading ? 'در حال بررسی رمز...' : 'وارد کردن تاریخ تولد و ورود به اتاق'}
            </button>
          </div>
        )}
      </div>

      {/* گام ۲: تخته تحقیقات دکتر ماریا */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          codeSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-500" />
          <span>گام {toPersianDigits(2)}: تخته تحقیقات دکتر ماریا</span>
        </h3>

        <div className="rounded-xl border border-purple-500/30 bg-purple-50/70 dark:bg-purple-950/20 p-4 text-xs text-slate-700 dark:text-slate-200 space-y-1.5">
          <div className="font-bold text-purple-800 dark:text-purple-300">
            روی تخته ۳ تا هدف نوشته شده که باید روی میز کار عملی کنی:
          </div>
          <ul className="list-disc list-inside space-y-1">
            <li>پروژسترونی که مشتق ۱۹-نورآندروستان باشه</li>
            <li>قابل مصرف خوراکی باشه</li>
            <li>طول اثر افزایش‌یافته داشته باشه</li>
          </ul>
        </div>

        <SteroidSandbox
          mode="progestin_nor"
          disabled={!codeSolved}
          solved={designSolved}
          onTokensChange={setSelectedMods}
        />

        {designFeedback && (
          <div
            className={`rounded-xl border p-3 text-sm flex items-start gap-2 ${
              designFeedback.ok
                ? 'border-emerald-500/40 bg-emerald-950/85 text-emerald-200'
                : 'border-rose-500/40 bg-rose-950/85 text-rose-200'
            }`}
          >
            {designFeedback.ok ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
            <span>{designFeedback.text}</span>
          </div>
        )}

        {designSolved && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/25 p-4 flex items-start gap-3">
            <FlaskRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-6 text-slate-700 dark:text-slate-200">
              <strong className="text-emerald-800 dark:text-emerald-300 block mb-0.5">
                شیشه مخفی روی قفسه مواد دکتر ماریا پیدا شد!
              </strong>
              روی برچسب شیشه با خط ریز نوشته شده: <em>«برای فرار از خواص پروژسترونی اهریمن»</em> — پس <strong>اهریمن خاصیت پروژسترونی هم داره!</strong>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          {designSolved ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ چهارم (خاصیت پروژسترونی) و بازگشت ←
            </button>
          ) : (
            <button
              type="button"
              disabled={designLoading || selectedMods.length === 0}
              onClick={handleDesignSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {designLoading ? 'در حال بررسی ساختار...' : 'ثبت ساختار طراحی‌شده'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
