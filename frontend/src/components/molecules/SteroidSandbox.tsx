import React, { useMemo, useState } from 'react';
import {
  FlaskConical,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Activity,
  Eraser,
  FlipHorizontal2,
} from 'lucide-react';
import { toPersianDigits } from '../../utils/persian';

export type SandboxMode = 'free' | 'estrogen_oral' | 'progestin_nor' | 'antidote';

export type HotspotId =
  | 'ringA'
  | 'C3'
  | 'C6'
  | 'C9'
  | 'C11'
  | 'C16'
  | 'C17a'
  | 'C17b'
  | 'C19'
  | 'C21';

export type Stereo = 'alpha' | 'beta';

export interface SandboxState {
  ringA: 'delta4' | 'delta14' | 'aromatic';
  C3: '=O' | 'OH' | 'OCH3' | '=N-OH';
  C6: 'H' | 'CH3' | 'F';
  C6Stereo: Stereo;
  C9: 'H' | 'F';
  C9Stereo: Stereo;
  C11: 'H' | 'OH' | '=O' | 'aryl';
  C11Stereo: Stereo;
  C16: 'H' | 'OH' | 'CH3' | 'CN';
  C16Stereo: Stereo;
  C17a: 'H' | 'OH' | 'ethynyl';
  C17b: 'H' | 'OH' | 'ketol';
  C19: 'CH3' | 'H';
  C21: 'none' | 'OH' | 'ester' | 'phosphate';
}

type ToolCategory = 'rings' | 'groups' | 'chains' | 'edit';

interface UniversalTool {
  id: string;
  label: string;
  formula: string;
  category: ToolCategory;
  color: string;
  apply: (state: SandboxState, spot: HotspotId) => { next?: SandboxState; error?: string };
}

interface MeterSpec {
  label: string;
  value: number;
  displayValue: string;
  colorClass: string;
}

interface Props {
  mode: SandboxMode;
  disabled?: boolean;
  solved?: boolean;
  onTokensChange?: (tokens: string[]) => void;
}

const INITIAL_STATES: Record<SandboxMode, SandboxState> = {
  free: {
    ringA: 'delta4',
    C3: '=O',
    C6: 'H',
    C6Stereo: 'alpha',
    C9: 'H',
    C9Stereo: 'alpha',
    C11: 'OH',
    C11Stereo: 'beta',
    C16: 'H',
    C16Stereo: 'alpha',
    C17a: 'OH',
    C17b: 'ketol',
    C19: 'CH3',
    C21: 'OH',
  },
  estrogen_oral: {
    ringA: 'aromatic',
    C3: 'OH',
    C6: 'H',
    C6Stereo: 'alpha',
    C9: 'H',
    C9Stereo: 'alpha',
    C11: 'H',
    C11Stereo: 'beta',
    C16: 'H',
    C16Stereo: 'alpha',
    C17a: 'H',
    C17b: 'OH',
    C19: 'H',
    C21: 'none',
  },
  progestin_nor: {
    ringA: 'delta4',
    C3: '=O',
    C6: 'H',
    C6Stereo: 'alpha',
    C9: 'H',
    C9Stereo: 'alpha',
    C11: 'H',
    C11Stereo: 'beta',
    C16: 'H',
    C16Stereo: 'alpha',
    C17a: 'H',
    C17b: 'OH',
    C19: 'CH3',
    C21: 'none',
  },
  antidote: {
    ringA: 'delta14',
    C3: '=O',
    C6: 'H',
    C6Stereo: 'alpha',
    C9: 'F',
    C9Stereo: 'alpha',
    C11: 'OH',
    C11Stereo: 'beta',
    C16: 'CN',
    C16Stereo: 'alpha',
    C17a: 'OH',
    C17b: 'ketol',
    C19: 'CH3',
    C21: 'ester',
  },
};

const SOLVED_STATES: Record<SandboxMode, SandboxState> = {
  free: INITIAL_STATES.free,
  estrogen_oral: {
    ...INITIAL_STATES.estrogen_oral,
    C3: 'OCH3',
    C17a: 'ethynyl',
  },
  progestin_nor: {
    ...INITIAL_STATES.progestin_nor,
    C19: 'H',
    C17a: 'ethynyl',
    C3: '=N-OH',
  },
  antidote: {
    ...INITIAL_STATES.antidote,
    C9: 'H',
    C16: 'H',
    C11: 'aryl',
    C21: 'OH',
  },
};

const UNIVERSAL_TOOLS: UniversalTool[] = [
  // حلقه‌ها و پیوندها
  {
    id: 'delta14',
    label: 'پیوند دوگانه Δ1',
    formula: 'C1=C2',
    category: 'rings',
    color: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
    apply: (s, spot) =>
      spot === 'ringA'
        ? { next: { ...s, ringA: 'delta14' } }
        : { error: 'پیوند دوگانه Δ1 فقط روی حلقه A قرار می‌گیرد.' },
  },
  {
    id: 'delta4',
    label: 'حلقه Δ4 ساده',
    formula: 'C4=C5',
    category: 'rings',
    color: 'border-sky-500/60 text-sky-700 dark:text-sky-300',
    apply: (s, spot) =>
      spot === 'ringA'
        ? { next: { ...s, ringA: 'delta4' } }
        : { error: 'تغییر ساختار حلقه فقط روی حلقه A اعمال می‌شود.' },
  },
  {
    id: 'aromatic',
    label: 'آروماتیک کردن حلقه A',
    formula: 'Aromatic',
    category: 'rings',
    color: 'border-purple-500/60 text-purple-700 dark:text-purple-300',
    apply: (s, spot) =>
      spot === 'ringA'
        ? { next: { ...s, ringA: 'aromatic', C19: 'H', C3: s.C3 === '=O' ? 'OH' : s.C3 } }
        : { error: 'آروماتیک کردن فقط روی حلقه A امکان‌پذیر است.' },
  },
  // گروه‌های عاملی و استخلاف‌ها
  {
    id: 'fluorine',
    label: 'اتم فلوئور',
    formula: '-F',
    category: 'groups',
    color: 'border-cyan-500/60 text-cyan-700 dark:text-cyan-300',
    apply: (s, spot) => {
      if (spot === 'C9') return { next: { ...s, C9: 'F', C9Stereo: 'alpha' } };
      if (spot === 'C6') return { next: { ...s, C6: 'F', C6Stereo: 'alpha' } };
      return { error: 'در استروئیدهای دارویی، فلوئور روی موقعیت‌های C9 یا C6 قرار می‌گیرد.' };
    },
  },
  {
    id: 'methyl',
    label: 'گروه متیل',
    formula: '-CH3',
    category: 'groups',
    color: 'border-amber-500/60 text-amber-700 dark:text-amber-300',
    apply: (s, spot) => {
      if (spot === 'C6') return { next: { ...s, C6: 'CH3', C6Stereo: 'alpha' } };
      if (spot === 'C16') return { next: { ...s, C16: 'CH3' } };
      if (spot === 'C19') return { next: { ...s, C19: 'CH3' } };
      return { error: 'گروه متیل را می‌توانید روی C6، C16 یا C19 قرار دهید.' };
    },
  },
  {
    id: 'hydroxyl',
    label: 'هیدروکسیل',
    formula: '-OH',
    category: 'groups',
    color: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
    apply: (s, spot) => {
      if (spot === 'C3') return { next: { ...s, C3: 'OH' } };
      if (spot === 'C11') return { next: { ...s, C11: 'OH', C11Stereo: 'beta' } };
      if (spot === 'C16') return { next: { ...s, C16: 'OH', C16Stereo: 'alpha' } };
      if (spot === 'C17a') return { next: { ...s, C17a: 'OH' } };
      if (spot === 'C17b') return { next: { ...s, C17b: 'OH' } };
      if (spot === 'C21') return { next: { ...s, C21: 'OH', C17b: 'ketol' } };
      return { error: 'گروه -OH را روی C3، C11، C16، C17 یا C21 قرار دهید.' };
    },
  },
  {
    id: 'keto',
    label: 'گروه کتون',
    formula: '=O',
    category: 'groups',
    color: 'border-rose-500/60 text-rose-700 dark:text-rose-300',
    apply: (s, spot) => {
      if (spot === 'C3') return { next: { ...s, C3: '=O' } };
      if (spot === 'C11') return { next: { ...s, C11: '=O' } };
      return { error: 'گروه کتون (=O) روی موقعیت‌های C3 یا C11 قابل اتصال است.' };
    },
  },
  {
    id: 'methoxy',
    label: 'متیل اتر (متیلاسیون)',
    formula: '-OCH3',
    category: 'groups',
    color: 'border-teal-500/60 text-teal-700 dark:text-teal-300',
    apply: (s, spot) =>
      spot === 'C3'
        ? { next: { ...s, C3: 'OCH3' } }
        : { error: 'متیل اتر (-OCH3) برای ساخت پیش‌دارو روی موقعیت C3 قرار می‌گیرد.' },
  },
  {
    id: 'oxime',
    label: 'گروه اکسیم',
    formula: '=N-OH',
    category: 'groups',
    color: 'border-amber-500/60 text-amber-700 dark:text-amber-300',
    apply: (s, spot) =>
      spot === 'C3'
        ? { next: { ...s, C3: '=N-OH' } }
        : { error: 'گروه اکسیم (=N-OH) روی کربن C3 قرار می‌گیرد.' },
  },
  {
    id: 'ethynyl',
    label: 'گروه اتینیل',
    formula: '-C≡CH',
    category: 'groups',
    color: 'border-cyan-500/60 text-cyan-700 dark:text-cyan-300',
    apply: (s, spot) =>
      spot === 'C17a'
        ? { next: { ...s, C17a: 'ethynyl' } }
        : { error: 'گروه اتینیل (-C≡CH) برای پایداری خوراکی روی موقعیت C17α قرار می‌گیرد.' },
  },
  {
    id: 'cyanide',
    label: 'گروه سیانید',
    formula: '-C≡N',
    category: 'groups',
    color: 'border-rose-500/60 text-rose-700 dark:text-rose-300',
    apply: (s, spot) =>
      spot === 'C16'
        ? { next: { ...s, C16: 'CN' } }
        : { error: 'گروه سیانید را می‌توانید روی موقعیت C16 آزمایش کنید.' },
  },
  // زنجیره‌ها و گروه‌های حجیم
  {
    id: 'aryl',
    label: 'آریل حجیم آنتاگونیست',
    formula: 'Ar-NMe2',
    category: 'chains',
    color: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300',
    apply: (s, spot) =>
      spot === 'C11'
        ? { next: { ...s, C11: 'aryl', C11Stereo: 'beta' } }
        : { error: 'گروه حجیم آریل آنتاگونیست (مشابه میفپریستون) روی C11β قرار می‌گیرد.' },
  },
  {
    id: 'ketol',
    label: 'زنجیره کتول C17β',
    formula: '-CO-CH2OH',
    category: 'chains',
    color: 'border-sky-500/60 text-sky-700 dark:text-sky-300',
    apply: (s, spot) =>
      spot === 'C17b' || spot === 'C21'
        ? { next: { ...s, C17b: 'ketol', C21: 'OH' } }
        : { error: 'زنجیره کتول روی موقعیت C17β یا C21 قرار می‌گیرد.' },
  },
  {
    id: 'ester',
    label: 'استر لیپوفیل (موضعی)',
    formula: '-OCOR',
    category: 'chains',
    color: 'border-amber-500/60 text-amber-700 dark:text-amber-300',
    apply: (s, spot) =>
      spot === 'C21' || spot === 'C17b'
        ? { next: { ...s, C17b: 'ketol', C21: 'ester' } }
        : { error: 'استر لیپوفیل موضعی روی زنجیره C21 قرار می‌گیرد.' },
  },
  {
    id: 'phosphate',
    label: 'فسفات قطبی (تزریقی)',
    formula: '-PO4',
    category: 'chains',
    color: 'border-sky-500/60 text-sky-700 dark:text-sky-300',
    apply: (s, spot) =>
      spot === 'C21' || spot === 'C17b'
        ? { next: { ...s, C17b: 'ketol', C21: 'phosphate' } }
        : { error: 'گروه فسفات محلول در آب روی موقعیت C21 قرار می‌گیرد.' },
  },
  // ابزارهای ویرایش آزاد
  {
    id: 'flip_stereo',
    label: 'تغییر آرایش فضایی (α ⇄ β)',
    formula: 'α / β',
    category: 'edit',
    color: 'border-fuchsia-500/60 text-fuchsia-700 dark:text-fuchsia-300',
    apply: (s, spot) => {
      if (spot === 'C16' && s.C16 !== 'H') {
        return { next: { ...s, C16Stereo: s.C16Stereo === 'alpha' ? 'beta' : 'alpha' } };
      }
      if (spot === 'C6' && s.C6 !== 'H') {
        return { next: { ...s, C6Stereo: s.C6Stereo === 'alpha' ? 'beta' : 'alpha' } };
      }
      if (spot === 'C9' && s.C9 !== 'H') {
        return { next: { ...s, C9Stereo: s.C9Stereo === 'alpha' ? 'beta' : 'alpha' } };
      }
      if (spot === 'C11' && s.C11 === 'OH') {
        return { next: { ...s, C11Stereo: s.C11Stereo === 'alpha' ? 'beta' : 'alpha' } };
      }
      return { error: 'ابتدا یک استخلاف روی C6، C9، C11 یا C16 قرار دهید تا آرایش α/β آن تغییر کند.' };
    },
  },
  {
    id: 'eraser',
    label: 'پاک‌کن (حذف گروه / تبدیل به H)',
    formula: 'حذف',
    category: 'edit',
    color: 'border-rose-500/70 text-rose-700 dark:text-rose-300',
    apply: (s, spot) => {
      if (spot === 'C6') return { next: { ...s, C6: 'H' } };
      if (spot === 'C9') return { next: { ...s, C9: 'H' } };
      if (spot === 'C11') return { next: { ...s, C11: 'H' } };
      if (spot === 'C16') return { next: { ...s, C16: 'H' } };
      if (spot === 'C17a') return { next: { ...s, C17a: 'H' } };
      if (spot === 'C17b') return { next: { ...s, C17b: 'H', C21: 'none' } };
      if (spot === 'C19') return { next: { ...s, C19: 'H' } };
      if (spot === 'C21') return { next: { ...s, C21: s.C17b === 'ketol' ? 'OH' : 'none' } };
      return { error: 'این موقعیت را می‌توانید با انتخاب گروه دیگر جایگزین کنید.' };
    },
  },
];

function computeTokens(mode: SandboxMode, s: SandboxState): string[] {
  const tokens: string[] = [];
  if (mode === 'estrogen_oral') {
    if (s.C17a === 'ethynyl') tokens.push('add_17alpha_ethynyl');
    if (s.C3 === 'OCH3') tokens.push('methylate_3_hydroxyl');
    if (s.C17b === 'H') tokens.push('remove_17beta_hydroxyl');
  } else if (mode === 'progestin_nor') {
    if (s.C19 === 'H') tokens.push('remove_c19_methyl');
    if (s.C17a === 'ethynyl') tokens.push('c17_alpha_ethynyl');
    if (s.C3 === '=N-OH') tokens.push('c3_oxime_or_ester');
    if (s.ringA === 'aromatic') tokens.push('aromatize_ring_a');
  } else if (mode === 'antidote') {
    if (s.C9 === 'H') tokens.push('remove_9alpha_f');
    if (s.C16 === 'H') tokens.push('remove_cyanide');
    if (s.C11 === 'aryl') tokens.push('add_11beta_antagonist_aryl');
    if (s.C21 === 'OH') tokens.push('hydrolyze_lipophilic_ester');
    if (s.C6 === 'F') tokens.push('add_extra_fluorine_decoy');
  }
  return tokens;
}

function identifyDrug(s: SandboxState): string | null {
  if (s.ringA === 'aromatic' && s.C17b === 'OH') {
    if (s.C3 === 'OH' && s.C17a === 'H') return '17β-استرادیول (Estradiol)';
    if (s.C3 === 'OH' && s.C17a === 'ethynyl') return 'اتینیل استرادیول (خوراکی)';
    if (s.C3 === 'OCH3' && s.C17a === 'ethynyl') return 'مسترانول (خوراکی طولانی‌اثر)';
  }
  if (s.ringA === 'delta4' && s.C19 === 'H' && s.C17a === 'ethynyl' && s.C17b === 'OH') {
    if (s.C3 === '=N-OH') return 'نورژستیمات-مانند (پروژستین خوراکی طولانی‌اثر)';
    if (s.C3 === '=O') return 'نورتیندرون (۱۹-نورپروژستین خوراکی)';
  }
  if (s.C11 === 'aryl' && s.C9 === 'H' && s.C16 === 'H') {
    return 'آنتاگونیست 11β-آریل (مشابه میفپریستون — پادزهر)';
  }
  if (s.C17b === 'ketol' && s.C19 === 'CH3') {
    if (s.ringA === 'delta4' && s.C9 === 'H' && s.C6 === 'H' && s.C16 === 'H') {
      if (s.C11 === 'OH' && s.C11Stereo === 'beta') return 'هیدروکورتیزون (مرجع ۱×)';
      if (s.C11 === '=O') return 'کورتیزون (پیش‌دارو)';
    }
    if (s.ringA === 'delta4' && s.C9 === 'F' && s.C6 === 'H' && s.C16 === 'H' && s.C11 === 'OH') {
      return 'فلودروکورتیزون (مینرالوکورتیکوئید فوق‌قوی)';
    }
    if (s.ringA === 'delta14' && s.C9 === 'H' && s.C11 === 'OH' && s.C16 === 'H') {
      if (s.C6 === 'H') return 'پردنیزولون (ضدالتهاب ۴×)';
      if (s.C6 === 'CH3') return 'متیل‌پردنیزولون (ضدالتهاب ۵×)';
    }
    if (s.ringA === 'delta14' && s.C9 === 'F' && s.C11 === 'OH') {
      if (s.C16 === 'OH' && s.C6 === 'H') return 'تریامسینولون (بدون احتباس سدیم)';
      if (s.C16 === 'OH' && s.C6 === 'F') return 'فلوسینولون (موضعی قوی)';
      if (s.C16 === 'CH3' && s.C16Stereo === 'alpha' && s.C6 === 'H') return 'دگزامتازون (۲۵ تا ۳۰×)';
      if (s.C16 === 'CH3' && s.C16Stereo === 'beta' && s.C6 === 'H') return 'بتامتازون (۲۵ تا ۳۰×)';
    }
  }
  return null;
}

function computeMeters(mode: SandboxMode, s: SandboxState): { meters: MeterSpec[]; insight: string } {
  if (mode === 'estrogen_oral') {
    const oral = s.C17a === 'ethynyl' ? 92 : 12;
    const halfLife = (s.C17a === 'ethynyl' ? 50 : 15) + (s.C3 === 'OCH3' ? 42 : 0);
    const binding = s.C17b === 'H' ? 10 : s.ringA !== 'aromatic' ? 15 : s.C3 === 'OCH3' ? 86 : 95;
    let insight = 'استرادیول طبیعی خوراکی نیست. از جعبه‌ابزار آزاد استفاده کن و روی کربن‌های مختلف آزمایش کن تا اثر خوراکی و طول اثر بالا برود.';
    if (s.C17b === 'H') {
      insight = 'حذف 17β-OH پیوند هیدروژنی کلیدی با گیرنده استروژن را از بین برد!';
    } else if (s.C17a === 'ethynyl' && s.C3 === 'OCH3') {
      insight = 'فوق‌العاده! ساختار اکنون هم خوراکی است و هم به شکل پیش‌دارو طول اثر بالایی دارد.';
    } else if (s.C17a === 'ethynyl') {
      insight = 'عالی، دارو خوراکی شد! برای افزایش طول اثر، روی حلقه A (کربن C3) هم فکر کن.';
    }
    return {
      meters: [
        { label: 'فراهمی زیستی خوراکی', value: oral, displayValue: `${toPersianDigits(oral)}٪`, colorClass: oral > 70 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'طول اثر و نیمه‌عمر', value: halfLife, displayValue: `${toPersianDigits(halfLife)}٪`, colorClass: halfLife > 75 ? 'bg-cyan-500' : 'bg-sky-500' },
        { label: 'اتصال به گیرنده استروژن', value: binding, displayValue: `${toPersianDigits(binding)}٪`, colorClass: binding < 40 ? 'bg-rose-500' : 'bg-emerald-500' },
      ],
      insight,
    };
  }

  if (mode === 'progestin_nor') {
    const progestin =
      s.ringA === 'aromatic'
        ? 10
        : 35 + (s.C19 === 'H' ? 35 : 0) + (s.C17a === 'ethynyl' ? 25 : 0);
    const oral = s.C17a === 'ethynyl' ? 90 : 18;
    const halfLife = 25 + (s.C3 === '=N-OH' ? 50 : 0) + (s.C17a === 'ethynyl' ? 20 : 0);
    const androgenic = s.ringA === 'aromatic' ? 5 : s.C19 === 'H' ? 18 : 82;
    let insight = 'از جعبه‌ابزار کامل (از جمله پاک‌کن برای حذف گروه‌ها) استفاده کن تا ۳ هدف تخته دکتر ماریا هم‌زمان محقق شوند.';
    if (s.ringA === 'aromatic') {
      insight = 'آروماتیک کردن حلقه A مولکول را شبیه استروژن کرد و خاصیت پروژسترونی از بین رفت!';
    } else if (s.C19 === 'H' && s.C17a === 'ethynyl' && s.C3 === '=N-OH') {
      insight = 'دقیقاً همین بود! مشتق ۱۹-نورآندروستان خوراکی با طول اثر افزایش‌یافته ساخته شد.';
    }
    return {
      meters: [
        { label: 'اثر پروژسترونی', value: progestin, displayValue: `${toPersianDigits(progestin)}٪`, colorClass: progestin > 75 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'مصرف خوراکی', value: oral, displayValue: `${toPersianDigits(oral)}٪`, colorClass: oral > 70 ? 'bg-cyan-500' : 'bg-amber-500' },
        { label: 'طول اثر', value: halfLife, displayValue: `${toPersianDigits(halfLife)}٪`, colorClass: halfLife > 70 ? 'bg-sky-500' : 'bg-slate-400' },
        { label: 'عوارض آندروژنی (هدف: کمینه)', value: androgenic, displayValue: `${toPersianDigits(androgenic)}٪`, colorClass: androgenic > 50 ? 'bg-rose-500' : 'bg-emerald-500' },
      ],
      insight,
    };
  }

  if (mode === 'antidote') {
    let toxicity = 10;
    if (s.C9 === 'F') toxicity += 30;
    if (s.C16 === 'CN') toxicity += 30;
    if (s.C21 === 'ester') toxicity += 20;
    if (s.C6 === 'F') toxicity += 25;
    if (s.C11 === 'aryl') toxicity = Math.max(0, toxicity - 10);
    toxicity = Math.min(100, toxicity);

    const antagonism = s.C11 === 'aryl' ? 96 : 8;
    const clearance = s.C21 === 'OH' || s.C21 === 'phosphate' ? 90 : 20;

    let insight = 'از ابزار «پاک‌کن» و گروه‌های عاملی استفاده کن تا بخش‌های سمی اهریمن حذف شوند و مولکول به یک آنتاگونیست بی‌خطر تبدیل شود.';
    if (s.C6 === 'F') {
      insight = 'خطر! افزودن فلوئور روی C6 سمیت مولکول را بیشتر کرد!';
    } else if (toxicity === 0 && antagonism > 90 && clearance >= 90) {
      insight = 'پادزهر کامل شد! سمیت صفر است، گروه 11β-آریل گیرنده را مهار می‌کند و مولکول قطبی و قابل دفع شد.';
    }
    return {
      meters: [
        { label: 'شاخص سمیت اهریمن (هدف: ۰٪)', value: toxicity, displayValue: `${toPersianDigits(toxicity)}٪`, colorClass: toxicity === 0 ? 'bg-emerald-500' : 'bg-rose-500' },
        { label: 'قدرت آنتاگونیستی (پادزهر)', value: antagonism, displayValue: `${toPersianDigits(antagonism)}٪`, colorClass: antagonism > 80 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'قطبیت و دفع کلیوی', value: clearance, displayValue: `${toPersianDigits(clearance)}٪`, colorClass: clearance > 75 ? 'bg-cyan-500' : 'bg-amber-500' },
      ],
      insight,
    };
  }

  // حالت آزاد کامل (Free-Play Universal SAR Bench)
  let gc = 1.0;
  if (s.C11 === '=O') gc *= 0.8;
  if (s.C11 === 'H' || s.C11 === 'aryl') gc *= 0.1;
  if (s.C11 === 'OH' && s.C11Stereo === 'alpha') gc *= 0.05;
  if (s.ringA === 'delta14') gc *= 4.0;
  if (s.ringA === 'aromatic') gc *= 0.05;
  if (s.C6 === 'CH3') gc *= 1.3;
  if (s.C6 === 'F') gc *= 2.5;
  if (s.C9 === 'F') gc *= 8.0;
  if (s.C16 === 'OH') gc *= 0.5;
  if (s.C16 === 'CH3') gc *= 0.9;
  const gcRounded = Math.round(gc * 10) / 10;
  const gcPercent = Math.min(100, Math.round((Math.log10(gc + 1) / Math.log10(60)) * 100));

  let mc = 1.0;
  if (s.ringA === 'delta14') mc *= 0.6;
  if (s.ringA === 'aromatic') mc = 0;
  if (s.C6 === 'CH3') mc *= 0.2;
  if (s.C9 === 'F') mc *= 120;
  if (s.C16 !== 'H') mc = 0;
  const mcPercent = mc === 0 ? 0 : Math.min(100, Math.round((Math.log10(mc + 1) / Math.log10(130)) * 100));

  let halfLifeHours = 10;
  if (s.ringA === 'delta14') halfLifeHours += 12;
  if (s.C6 !== 'H') halfLifeHours += 8;
  if (s.C9 === 'F') halfLifeHours += 18;
  if (s.C16 !== 'H') halfLifeHours += 10;
  if (s.C3 === 'OCH3' || s.C3 === '=N-OH') halfLifeHours += 12;
  const hlPercent = Math.min(100, Math.round((halfLifeHours / 65) * 100));

  let logP = 1.6;
  if (s.C6 === 'CH3') logP += 0.5;
  if (s.C9 === 'F') logP += 0.2;
  if (s.C16 === 'OH') logP -= 0.7;
  if (s.C16 === 'CH3') logP += 0.5;
  if (s.C21 === 'ester') logP += 2.1;
  if (s.C21 === 'phosphate') logP -= 2.4;
  if (s.C3 === 'OCH3') logP += 0.6;
  const logPPercent = Math.max(5, Math.min(100, Math.round(((logP + 1.5) / 6.5) * 100)));

  let insight = 'هر گروهی را از جعبه‌ابزار انتخاب کن و روی کربن دلخواه بگذار (یا با α/β آرایش فضایی‌اش را بچرخان) تا اثر واقعی SAR را ببینی.';
  if (s.C11 === 'OH' && s.C11Stereo === 'alpha') {
    insight = 'نکته کلیدی استریوشیمی: تنها ایزومر 11β-OH فعال است! چرخاندن به 11α-OH فعالیت گلوکوکورتیکوئیدی را تقریباً از بین می‌برد.';
  } else if (s.C9 === 'F' && s.C16 === 'H') {
    insight = 'فلوئور 9α هم قدرت ضدالتهابی و هم احتباس سدیم را به‌شدت بالا برد! حالا یک گروه روی C16 بگذار تا ببینیم اثر مینرال چه می‌شود.';
  } else if (s.C9 === 'F' && s.C16 !== 'H') {
    insight = 'استخلاف روی C16 اثر احتباس سدیم ناشی از 9α-F را به صفر رساند در حالی که قدرت ضدالتهابی فوق‌العاده باقی ماند.';
  } else if (s.C21 === 'ester') {
    insight = 'استر لیپوفیل C21 (LogP بالا) ترکیب را برای مصرف موضعی و نفوذ پوستی ایده‌آل می‌کند.';
  } else if (s.C21 === 'phosphate') {
    insight = 'فسفات قطبی C21 انحلال‌پذیری آبی را افزایش داده و دارو را برای مصرف سیستمیک/تزریقی آماده می‌سازد.';
  }

  return {
    meters: [
      { label: 'قدرت ضدالتهابی (نسبت به کورتیزول)', value: gcPercent, displayValue: `${toPersianDigits(gcRounded)}×`, colorClass: 'bg-emerald-500' },
      { label: 'احتباس آب و نمک (مینرالوکورتیکوئید)', value: mcPercent, displayValue: mc === 0 ? '۰× (ناچیز)' : `${toPersianDigits(Math.round(mc * 10) / 10)}×`, colorClass: mc > 5 ? 'bg-rose-500' : 'bg-cyan-500' },
      { label: 'نیمه‌عمر بیولوژیک تخمینی', value: hlPercent, displayValue: `~${toPersianDigits(halfLifeHours)} ساعت`, colorClass: 'bg-sky-500' },
      { label: 'چربی‌دوستی تخمینی (LogP)', value: logPPercent, displayValue: toPersianDigits(logP.toFixed(1)), colorClass: 'bg-amber-500' },
    ],
    insight,
  };
}

export const SteroidSandbox: React.FC<Props> = ({
  mode,
  disabled = false,
  solved = false,
  onTokensChange,
}) => {
  const [state, setState] = useState<SandboxState>(() =>
    solved ? SOLVED_STATES[mode] : INITIAL_STATES[mode]
  );
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('groups');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [dragOverSpot, setDragOverSpot] = useState<HotspotId | null>(null);
  const [toolNotice, setToolNotice] = useState<string | null>(null);

  const isLocked = disabled || solved;
  const selectedTool = UNIVERSAL_TOOLS.find((t) => t.id === selectedToolId) || null;

  const applyToolToSpot = (tool: UniversalTool, spot: HotspotId) => {
    if (isLocked) return;
    const outcome = tool.apply(state, spot);
    if (outcome.error) {
      setToolNotice(outcome.error);
      return;
    }
    if (outcome.next) {
      setToolNotice(null);
      setState(outcome.next);
      onTokensChange?.(computeTokens(mode, outcome.next));
    }
  };

  const handleReset = () => {
    if (isLocked) return;
    const resetState = INITIAL_STATES[mode];
    setState(resetState);
    onTokensChange?.(computeTokens(mode, resetState));
    setToolNotice(null);
  };

  const { meters, insight } = useMemo(() => computeMeters(mode, state), [mode, state]);
  const recognizedDrug = useMemo(() => identifyDrug(state), [state]);

  const renderHotspot = (spot: HotspotId, cx: number, cy: number, label: string) => {
    if (isLocked) return null;
    const isHovered = dragOverSpot === spot;
    return (
      <g
        key={spot}
        onClick={() => {
          if (selectedTool) {
            applyToolToSpot(selectedTool, spot);
          } else {
            setToolNotice(`ابتدا یک گروه یا ابزار (مثل پاک‌کن یا α/β) از جعبه‌ابزار بالا انتخاب کن و بعد روی ${label} کلیک کن یا آن را اینجا بکش.`);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverSpot(spot);
        }}
        onDragLeave={() => setDragOverSpot(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverSpot(null);
          const tid = e.dataTransfer.getData('text/plain');
          const tool = UNIVERSAL_TOOLS.find((t) => t.id === tid);
          if (tool) applyToolToSpot(tool, spot);
        }}
        className="cursor-pointer group"
      >
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? 16 : 12}
          fill={isHovered ? 'rgba(34,211,238,0.38)' : 'rgba(56,189,248,0.14)'}
          stroke={isHovered ? '#22d3ee' : '#38bdf8'}
          strokeWidth={isHovered ? 2.5 : 1.3}
          strokeDasharray="3,2"
        />
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fill="#bae6fd"
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="monospace"
          className="pointer-events-none select-none opacity-80"
        >
          {spot === 'ringA' ? 'A' : spot}
        </text>
        <title>{label}</title>
      </g>
    );
  };

  const visibleTools = UNIVERSAL_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-50/80 dark:bg-[#07111f] p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-300">
          <FlaskConical className="w-4 h-4 shrink-0" />
          <span>میز کار آزاد مولکول‌سازی و تحلیل زنده SAR</span>
        </div>
        {!isLocked && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> بازنشانی ساختار
          </button>
        )}
      </div>

      {/* جعبه‌ابزار جامع شیمی دارویی (یکسان و آزاد در همه صفحات) */}
      {!isLocked && (
        <div className="space-y-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-3">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            {(
              [
                { id: 'groups', label: 'گروه‌های عاملی' },
                { id: 'rings', label: 'حلقه‌ها و پیوندها' },
                { id: 'chains', label: 'زنجیره و استر' },
                { id: 'edit', label: 'پاک‌کن و α/β' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                  activeCategory === tab.id
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleTools.map((tool) => {
              const isSelected = selectedToolId === tool.id;
              return (
                <div
                  key={tool.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', tool.id);
                    setSelectedToolId(tool.id);
                  }}
                  onClick={() => setSelectedToolId(isSelected ? null : tool.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs cursor-grab active:cursor-grabbing transition select-none flex items-center gap-2 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-400/50 font-bold text-cyan-900 dark:text-cyan-100'
                      : `${tool.color} bg-slate-50 dark:bg-slate-950 hover:border-cyan-400`
                  }`}
                >
                  {tool.id === 'eraser' && <Eraser className="w-3.5 h-3.5" />}
                  {tool.id === 'flip_stereo' && <FlipHorizontal2 className="w-3.5 h-3.5" />}
                  <span>{tool.label}</span>
                  <span dir="ltr" className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {tool.formula}
                  </span>
                </div>
              );
            })}
          </div>

          {selectedTool && (
            <div className="text-[11px] text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                ابزار «{selectedTool.label}» فعال است — روی یکی از کربن‌های مشخص‌شده (دایره‌های آبی روی اسکلت) کلیک کن یا ابزار را روی آن بکش.
              </span>
            </div>
          )}

          {toolNotice && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-[11px] text-amber-800 dark:text-amber-200">
              {toolNotice}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* بوم SVG اسکلت استروئیدی تعاملی */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-700 bg-[#060f1c] p-4 flex flex-col items-center">
          {recognizedDrug && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ساختار ساخته‌شده: {recognizedDrug}</span>
            </div>
          )}

          <div dir="ltr" className="w-full flex justify-center">
            <svg viewBox="0 0 395 230" className="w-full max-w-[430px] h-56">
              {/* حلقه A */}
              <polygon
                points="68,118 101,99 134,118 134,156 101,175 68,156"
                fill={state.ringA === 'aromatic' ? 'rgba(192,132,252,0.12)' : 'none'}
                stroke={state.ringA === 'aromatic' ? '#c084fc' : '#cbd5e1'}
                strokeWidth="2.3"
              />
              {state.ringA === 'aromatic' ? (
                <circle cx="101" cy="137" r="18" fill="none" stroke="#c084fc" strokeWidth="1.9" />
              ) : (
                <>
                  <line x1="102" y1="168" x2="128" y2="153" stroke="#38bdf8" strokeWidth="2.1" />
                  {state.ringA === 'delta14' && (
                    <line x1="74" y1="122" x2="100" y2="107" stroke="#34d399" strokeWidth="2.3" />
                  )}
                </>
              )}

              {/* گروه C3 */}
              {state.C3 === '=O' && (
                <g>
                  <line x1="46" y1="166" x2="67" y2="154" stroke="#f87171" strokeWidth="2.2" />
                  <line x1="49" y1="171" x2="70" y2="159" stroke="#f87171" strokeWidth="2.2" />
                  <text x="29" y="176" fill="#f87171" fontSize="13" fontWeight="bold" fontFamily="monospace">O</text>
                </g>
              )}
              {state.C3 === 'OH' && (
                <g>
                  <line x1="46" y1="168" x2="68" y2="156" stroke="#34d399" strokeWidth="2.2" />
                  <text x="22" y="175" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">HO</text>
                </g>
              )}
              {state.C3 === 'OCH3' && (
                <g>
                  <line x1="46" y1="168" x2="68" y2="156" stroke="#34d399" strokeWidth="2.3" />
                  <text x="6" y="176" fill="#34d399" fontSize="11.5" fontWeight="bold" fontFamily="monospace">CH3O</text>
                </g>
              )}
              {state.C3 === '=N-OH' && (
                <g>
                  <line x1="46" y1="166" x2="67" y2="154" stroke="#fbbf24" strokeWidth="2.2" />
                  <line x1="49" y1="171" x2="70" y2="159" stroke="#fbbf24" strokeWidth="2.2" />
                  <text x="10" y="177" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="monospace">HO-N</text>
                </g>
              )}

              {/* متیل C19 */}
              {state.C19 === 'CH3' && (
                <g>
                  <polygon points="134,118 130,88 138,88" fill="#e2e8f0" />
                  <text x="123" y="83" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">CH3</text>
                </g>
              )}

              {/* حلقه B */}
              <polygon
                points="134,118 167,99 200,118 200,156 167,175 134,156"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.3"
              />

              {/* استخلاف C6 */}
              {state.C6 !== 'H' && (
                <g>
                  <line
                    x1="167"
                    y1="175"
                    x2="167"
                    y2="199"
                    stroke={state.C6 === 'F' ? '#f43f5e' : '#fbbf24'}
                    strokeWidth={state.C6Stereo === 'beta' ? 3.2 : 2.2}
                    strokeDasharray={state.C6Stereo === 'alpha' ? '3,2' : undefined}
                  />
                  <text x="159" y="213" fill={state.C6 === 'F' ? '#f43f5e' : '#fbbf24'} fontSize="11.5" fontWeight="bold" fontFamily="monospace">
                    {state.C6}
                  </text>
                </g>
              )}

              {/* فلوئور C9 */}
              {state.C9 === 'F' && (
                <g>
                  <line
                    x1="167"
                    y1="99"
                    x2="167"
                    y2="128"
                    stroke="#22d3ee"
                    strokeWidth={state.C9Stereo === 'beta' ? 3.4 : 2.5}
                    strokeDasharray={state.C9Stereo === 'alpha' ? '3,2' : undefined}
                  />
                  <text x="163" y="142" fill="#22d3ee" fontSize="13" fontWeight="bold" fontFamily="monospace">F</text>
                </g>
              )}

              {/* حلقه C */}
              <polygon
                points="167,99 167,61 200,42 233,61 233,99 200,118"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.3"
              />

              {/* گروه C11 */}
              {state.C11 === 'OH' && (
                <g>
                  {state.C11Stereo === 'beta' ? (
                    <polygon points="167,61 147,47 152,41" fill="#34d399" />
                  ) : (
                    <line x1="167" y1="61" x2="148" y2="45" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="3,2" />
                  )}
                  <text x="128" y="42" fill={state.C11Stereo === 'beta' ? '#34d399' : '#fbbf24'} fontSize="12" fontWeight="bold" fontFamily="monospace">
                    HO
                  </text>
                </g>
              )}
              {state.C11 === '=O' && (
                <g>
                  <line x1="167" y1="58" x2="148" y2="45" stroke="#f87171" strokeWidth="2" />
                  <line x1="164" y1="63" x2="145" y2="50" stroke="#f87171" strokeWidth="2" />
                  <text x="132" y="46" fill="#f87171" fontSize="12" fontWeight="bold" fontFamily="monospace">O</text>
                </g>
              )}
              {state.C11 === 'aryl' && (
                <g>
                  <polygon points="167,61 147,47 152,41" fill="#34d399" />
                  <polygon points="120,20 140,20 150,36 140,52 120,52 110,36" fill="rgba(52,211,153,0.18)" stroke="#34d399" strokeWidth="2" />
                  <text x="58" y="39" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">Ar-NMe2</text>
                </g>
              )}

              {/* متیل C18 */}
              <polygon points="233,61 229,33 237,33" fill="#e2e8f0" />
              <text x="223" y="27" fill="#94a3b8" fontSize="10.5" fontFamily="monospace">CH3</text>

              {/* حلقه D */}
              <polygon
                points="233,61 269,50 291,80 269,110 233,99"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2.3"
              />

              {/* زنجیره C17β + C21 */}
              {state.C17b === 'OH' && (
                <g>
                  <polygon points="269,50 294,34 298,40" fill="#34d399" />
                  <text x="300" y="38" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">OH</text>
                </g>
              )}
              {state.C17b === 'ketol' && (
                <g>
                  <polygon points="269,50 294,34 298,40" fill="#38bdf8" />
                  <line x1="295" y1="36" x2="295" y2="18" stroke="#f87171" strokeWidth="1.8" />
                  <line x1="299" y1="36" x2="299" y2="18" stroke="#f87171" strokeWidth="1.8" />
                  <text x="292" y="15" fill="#f87171" fontSize="11" fontWeight="bold" fontFamily="monospace">O</text>
                  <line x1="296" y1="36" x2="318" y2="46" stroke="#cbd5e1" strokeWidth="2" />
                  <text
                    x="320"
                    y="50"
                    fill={state.C21 === 'ester' ? '#fbbf24' : state.C21 === 'phosphate' ? '#38bdf8' : '#34d399'}
                    fontSize="10.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {state.C21 === 'ester' ? 'CH2-OCOR' : state.C21 === 'phosphate' ? 'CH2-PO4' : 'CH2OH'}
                  </text>
                </g>
              )}

              {/* گروه C17α */}
              {state.C17a === 'OH' && (
                <g>
                  <line x1="269" y1="50" x2="293" y2="63" stroke="#34d399" strokeWidth="2" strokeDasharray="3,2" />
                  <text x="296" y="69" fill="#34d399" fontSize="10.5" fontWeight="bold" fontFamily="monospace">OH</text>
                </g>
              )}
              {state.C17a === 'ethynyl' && (
                <g>
                  <line x1="269" y1="50" x2="296" y2="64" stroke="#22d3ee" strokeWidth="2.3" strokeDasharray="3,2" />
                  <text x="299" y="69" fill="#22d3ee" fontSize="11" fontWeight="bold" fontFamily="monospace">-C≡CH</text>
                </g>
              )}

              {/* گروه C16 */}
              {state.C16 !== 'H' && (
                <g>
                  <line
                    x1="291"
                    y1="80"
                    x2="318"
                    y2="92"
                    stroke={state.C16 === 'CN' ? '#f43f5e' : state.C16Stereo === 'beta' ? '#e879f9' : '#fbbf24'}
                    strokeWidth={state.C16Stereo === 'beta' ? 3.2 : 2.2}
                    strokeDasharray={state.C16Stereo === 'alpha' ? '3,2' : undefined}
                  />
                  <text
                    x="321"
                    y="97"
                    fill={state.C16 === 'CN' ? '#f43f5e' : state.C16Stereo === 'beta' ? '#e879f9' : '#fbbf24'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {state.C16 === 'CN' ? '-C≡N' : state.C16}
                  </text>
                </g>
              )}

              {/* تمام ۱۰ نقطه اتصال آزاد */}
              {renderHotspot('ringA', 101, 137, 'حلقه A')}
              {renderHotspot('C3', 56, 162, 'کربن C3')}
              {renderHotspot('C6', 167, 184, 'کربن C6')}
              {renderHotspot('C9', 167, 108, 'کربن C9')}
              {renderHotspot('C11', 158, 52, 'کربن C11')}
              {renderHotspot('C16', 302, 85, 'کربن C16')}
              {renderHotspot('C17a', 284, 59, 'موقعیت C17α')}
              {renderHotspot('C17b', 284, 38, 'موقعیت C17β')}
              {renderHotspot('C19', 134, 98, 'موقعیت C19')}
              {renderHotspot('C21', 332, 46, 'موقعیت C21')}
            </svg>
          </div>
        </div>

        {/* داشبورد زنده SAR */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Activity className="w-4 h-4 text-cyan-500" />
            <span>شاخص‌های زنده رابطه ساختار-اثر (Live SAR)</span>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 p-4">
            {meters.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{m.label}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{m.displayValue}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${m.colorClass}`}
                    style={{ width: `${Math.max(4, Math.min(100, m.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-cyan-50/70 dark:bg-cyan-950/30 p-3 text-xs leading-6 text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <span>{insight}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
