import React, { useState } from 'react';
import { Shield, Lock, Unlock, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { MoleculeStructureCard } from '../molecules/MoleculeStructureCard';
import { SteroidSandbox } from '../molecules/SteroidSandbox';
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
    revealedName: 'مژسترول استات (Megestrol Acetate)',
    revealedNote: 'مشتق پرگنان با متیل C6 و استات C17α (کاهش عوارض آندروژنی)',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C=C(C)C4=CC(=O)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '2',
    blindLabel: 'ساختار ۲',
    revealedName: 'نورژستیمات (Norgestimate)',
    revealedNote: 'مشتق ۱۹-نورآندروستان دارای اکسیم C3، اتینیل 17α و استات 17β (افزایش نیمه‌عمر و کاهش آندروژنیسیته)',
    smiles: 'C#C[C@]1(OC(C)=O)CC[C@H]2[C@@H]3CCC4=CC(=NO)CC[C@@H]4[C@H]3CC[C@@]12CC',
  },
  {
    id: '3',
    blindLabel: 'ساختار ۳',
    revealedName: 'پیش‌داروی اکسیم-استر 6α-متیل',
    revealedNote: 'دارای اکسیم C3، استات C17α و متیل ممانعت‌کننده در C6α (بهبود فراهمی زیستی، نیمه‌عمر و کاهش آندروژنیسیته)',
    smiles: 'CC(=O)O[C@@]1(C(C)=O)CC[C@H]2[C@@H]3C[C@H](C)C4=CC(=NO)CC[C@]4(C)[C@H]3CC[C@@]12C',
  },
  {
    id: '4',
    blindLabel: 'ساختار ۴',
    revealedName: 'اتینودیول دی‌استات (Ethynodiol Diacetate)',
    revealedNote: 'دارای دی‌استات 3β,17β و اتینیل 17α (افزایش فراهمی زیستی خوراکی و نیمه‌عمر)',
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
  const [codeStart] = useState<number>(() => Date.now());
  const [codeFeedback, setCodeFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  const [selectedMods, setSelectedMods] = useState<string[]>(
    designSolved ? ['remove_c19_methyl', 'c17_alpha_ethynyl', 'c3_oxime_or_ester'] : []
  );
  const [designStart] = useState<number>(() => Date.now());
  const [designFeedback, setDesignFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [designLoading, setDesignLoading] = useState(false);

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
    const elapsed = Math.max(1, Math.round((Date.now() - codeStart) / 1000));
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
    const elapsed = Math.max(1, Math.round((Date.now() - designStart) / 1000));
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
            <span>دپارتمان چهارم: بخش پروژستین‌ها و مشتقات ۱۹-نورآندروستان</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1 leading-6">
            محققان این بخش یادداشتی درباره نحوه خنثی‌سازی اثرات پروژسترونی ترکیب اهریمن در گاوصندوق رمزگذاری کرده‌اند.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToMap}
          className="self-start md:self-center rounded-xl border border-slate-300 dark:border-slate-600 hover:border-cyan-500 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
        >
          بازگشت به نقشه شرکت
        </button>
      </div>

      {/* معمای ۱: رمزگشایی کد گاوصندوق با تحلیل ۴ ساختار واقعی */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 p-6 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {codeSolved ? <Unlock className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5 text-amber-500" />}
            <span>معمای {toPersianDigits(1)}: رمزگشایی کد دیجیتال گاوصندوق بر اساس تحلیل ساختاری</span>
          </h3>
          <div
            dir="ltr"
            className="font-mono text-xs bg-slate-100 dark:bg-slate-950 border border-cyan-500/40 px-3 py-1 rounded-lg text-cyan-700 dark:text-cyan-300 font-bold"
          >
            CODE: {toPersianDigits(sumDigits(checks.bioavailability))} / {toPersianDigits(sumDigits(checks.half_life))} /{' '}
            {toPersianDigits(sumDigits(checks.low_androgen))}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          چهار ساختار زیر را بررسی کرده و برای هر ویژگی فارماکوکینتیک یا فارماکودینامیک، شماره ساختارهایی که آن ویژگی را دارند انتخاب کنید:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROGESTIN_STRUCTURES.map((s) => (
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
              { key: 'bioavailability', label: '↑ افزایش فراهمی زیستی (Bioavailability)' },
              { key: 'half_life', label: '↑ افزایش نیمه‌عمر (Half-life)' },
              { key: 'low_androgen', label: '↓ کاهش عوارض آندروژنی (Low Androgenicity)' },
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
              {codeLoading ? 'در حال بررسی رمز...' : 'وارد کردن رمز گاوصندوق'}
            </button>
          </div>
        )}
      </div>

      {/* معمای ۲: طراحی تعاملی پروژستین ۱۹-نورآندروستان با SteroidSandbox */}
      <div
        className={`rounded-2xl border p-6 space-y-5 transition ${
          codeSolved
            ? 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/75 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 opacity-60 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-500" />
          <span>معمای {toPersianDigits(2)}: سنتز تعاملی پروژستین خوراکی و طولانی‌اثر (مشتق ۱۹-نورآندروستان)</span>
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-6">
          روی اسکلت پایه زیر، گروه‌های عاملی را تغییر دهید تا عوارض آندروژنی به حداقل برسد، فعالیت خوراکی فعال شود و نیمه‌عمر دارو افزایش یابد:
        </p>

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

        <div className="flex justify-end">
          {designSolved ? (
            <button
              type="button"
              onClick={onBackToMap}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              ذخیره سرنخ چهارم و بازگشت به نقشه ←
            </button>
          ) : (
            <button
              type="button"
              disabled={designLoading || selectedMods.length === 0}
              onClick={handleDesignSubmit}
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold px-6 py-2.5 text-sm transition"
            >
              {designLoading ? 'در حال سنتز...' : 'تایید ساختار سنتزشده'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
