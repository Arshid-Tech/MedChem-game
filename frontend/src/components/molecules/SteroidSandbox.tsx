import React, { useMemo, useState } from 'react';
import {
  FlaskConical,
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  Activity,
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

export interface SandboxState {
  ringA: 'delta4' | 'delta14' | 'aromatic';
  C3: '=O' | 'OH' | 'OCH3' | '=N-OH';
  C6: 'H' | 'CH3' | 'F';
  C9: 'H' | 'F';
  C11: 'H' | 'OH' | '=O' | 'aryl';
  C16: 'H' | 'alpha-OH' | 'alpha-CH3' | 'beta-CH3' | 'CN';
  C17a: 'H' | 'OH' | 'ethynyl';
  C17b: 'H' | 'OH' | 'ketol';
  C19: 'CH3' | 'H';
  C21: 'none' | 'OH' | 'ester' | 'phosphate';
}

interface PaletteItem {
  id: string;
  label: string;
  formula: string;
  target: HotspotId;
  value: string;
  color: string;
  hint: string;
}

interface MeterSpec {
  label: string;
  value: number; // 0..100
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
    C9: 'H',
    C11: 'OH',
    C16: 'H',
    C17a: 'OH',
    C17b: 'ketol',
    C19: 'CH3',
    C21: 'OH',
  },
  estrogen_oral: {
    ringA: 'aromatic',
    C3: 'OH',
    C6: 'H',
    C9: 'H',
    C11: 'H',
    C16: 'H',
    C17a: 'H',
    C17b: 'OH',
    C19: 'H',
    C21: 'none',
  },
  progestin_nor: {
    ringA: 'delta4',
    C3: '=O',
    C6: 'H',
    C9: 'H',
    C11: 'H',
    C16: 'H',
    C17a: 'H',
    C17b: 'OH',
    C19: 'CH3',
    C21: 'none',
  },
  antidote: {
    ringA: 'delta14',
    C3: '=O',
    C6: 'H',
    C9: 'F',
    C11: 'OH',
    C16: 'CN',
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

const PALETTES: Record<SandboxMode, PaletteItem[]> = {
  free: [
    { id: 'f_d1', label: 'پیوند دوگانه Δ1', formula: 'C1=C2', target: 'ringA', value: 'delta14', color: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300', hint: 'روی حلقه A رها کنید' },
    { id: 'f_d4', label: 'حذف Δ1 (فقط Δ4)', formula: 'C1-C2', target: 'ringA', value: 'delta4', color: 'border-slate-400 text-slate-700 dark:text-slate-300', hint: 'روی حلقه A رها کنید' },
    { id: 'f_9f', label: 'فلوئور 9α-F', formula: '9α-F', target: 'C9', value: 'F', color: 'border-cyan-500/60 text-cyan-700 dark:text-cyan-300', hint: 'روی کربن C9 رها کنید' },
    { id: 'f_9h', label: 'حذف فلوئور C9', formula: '9α-H', target: 'C9', value: 'H', color: 'border-slate-400 text-slate-700 dark:text-slate-300', hint: 'روی کربن C9 رها کنید' },
    { id: 'f_6me', label: 'متیل 6α-CH3', formula: '6α-CH3', target: 'C6', value: 'CH3', color: 'border-amber-500/60 text-amber-700 dark:text-amber-300', hint: 'روی کربن C6 رها کنید' },
    { id: 'f_6f', label: 'فلوئور 6α-F', formula: '6α-F', target: 'C6', value: 'F', color: 'border-cyan-500/60 text-cyan-700 dark:text-cyan-300', hint: 'روی کربن C6 رها کنید' },
    { id: 'f_11oh', label: 'هیدروکسیل 11β-OH', formula: '11β-OH', target: 'C11', value: 'OH', color: 'border-emerald-500/60 text-emerald-700 dark:text-emerald-300', hint: 'روی کربن C11 رها کنید' },
    { id: 'f_11o', label: 'کتون 11=O (پیش‌دارو)', formula: '11=O', target: 'C11', value: '=O', color: 'border-rose-500/60 text-rose-700 dark:text-rose-300', hint: 'روی کربن C11 رها کنید' },
    { id: 'f_16oh', label: 'هیدروکسیل 16α-OH', formula: '16α-OH', target: 'C16', value: 'alpha-OH', color: 'border-purple-500/60 text-purple-700 dark:text-purple-300', hint: 'روی کربن C16 رها کنید' },
    { id: 'f_16am', label: 'متیل 16α-CH3', formula: '16α-CH3', target: 'C16', value: 'alpha-CH3', color: 'border-amber-500/60 text-amber-700 dark:text-amber-300', hint: 'روی کربن C16 رها کنید' },
    { id: 'f_16bm', label: 'متیل 16β-CH3', formula: '16β-CH3', target: 'C16', value: 'beta-CH3', color: 'border-fuchsia-500/60 text-fuchsia-700 dark:text-fuchsia-300', hint: 'روی کربن C16 رها کنید' },
    { id: 'f_21est', label: 'استر لیپوفیل C21', formula: 'C21-OCOR', target: 'C21', value: 'ester', color: 'border-amber-500/60 text-amber-700 dark:text-amber-300', hint: 'روی زنجیره C21 رها کنید' },
    { id: 'f_21phos', label: 'فسفات قطبی C21', formula: 'C21-PO4', target: 'C21', value: 'phosphate', color: 'border-sky-500/60 text-sky-700 dark:text-sky-300', hint: 'روی زنجیره C21 رها کنید' },
  ],
  estrogen_oral: [
    { id: 'e_eth', label: 'گروه 17α-اتینیل', formula: '-C≡CH', target: 'C17a', value: 'ethynyl', color: 'border-cyan-500/70 text-cyan-700 dark:text-cyan-300', hint: 'روی کربن C17α رها کنید' },
    { id: 'e_ome', label: 'متیله‌کردن C3 (متیل اتر)', formula: '3-OCH3', target: 'C3', value: 'OCH3', color: 'border-emerald-500/70 text-emerald-700 dark:text-emerald-300', hint: 'روی کربن C3 رها کنید' },
    { id: 'e_rm17', label: 'حذف 17β-OH (تبدیل به H)', formula: '17β-H', target: 'C17b', value: 'H', color: 'border-rose-500/70 text-rose-700 dark:text-rose-300', hint: 'روی کربن C17β رها کنید' },
    { id: 'e_res17', label: 'بازگرداندن 17β-OH', formula: '17β-OH', target: 'C17b', value: 'OH', color: 'border-slate-400 text-slate-700 dark:text-slate-300', hint: 'روی کربن C17β رها کنید' },
  ],
  progestin_nor: [
    { id: 'p_nor', label: 'حذف متیل C19 (19-nor)', formula: '19-H', target: 'C19', value: 'H', color: 'border-emerald-500/70 text-emerald-700 dark:text-emerald-300', hint: 'روی موقعیت C19 رها کنید' },
    { id: 'p_eth', label: 'افزودن 17α-اتینیل', formula: '17α-C≡CH', target: 'C17a', value: 'ethynyl', color: 'border-cyan-500/70 text-cyan-700 dark:text-cyan-300', hint: 'روی موقعیت C17α رها کنید' },
    { id: 'p_ox', label: 'تبدیل C3 به اکسیم / استر', formula: '3=N-OH', target: 'C3', value: '=N-OH', color: 'border-amber-500/70 text-amber-700 dark:text-amber-300', hint: 'روی کربن C3 رها کنید' },
    { id: 'p_aro', label: 'آروماتیک کردن حلقه A', formula: 'Aromatic A', target: 'ringA', value: 'aromatic', color: 'border-purple-500/70 text-purple-700 dark:text-purple-300', hint: 'روی حلقه A رها کنید' },
  ],
  antidote: [
    { id: 'a_def', label: 'حذف فلوئور 9α (Defluorination)', formula: '9α-H', target: 'C9', value: 'H', color: 'border-cyan-500/70 text-cyan-700 dark:text-cyan-300', hint: 'روی کربن C9 رها کنید' },
    { id: 'a_nocn', label: 'حذف گروه سیانید (-C≡N)', formula: '16-H', target: 'C16', value: 'H', color: 'border-cyan-500/70 text-cyan-700 dark:text-cyan-300', hint: 'روی کربن C16 رها کنید' },
    { id: 'a_aryl', label: 'گروه حجیم 11β-آریل آنتاگونیست', formula: '11β-Ar-NMe2', target: 'C11', value: 'aryl', color: 'border-emerald-500/70 text-emerald-700 dark:text-emerald-300', hint: 'روی کربن C11 رها کنید' },
    { id: 'a_hyd', label: 'هیدرولیز استر موضعی به -OH', formula: 'C21-OH', target: 'C21', value: 'OH', color: 'border-sky-500/70 text-sky-700 dark:text-sky-300', hint: 'روی زنجیره C21 رها کنید' },
    { id: 'a_6f', label: 'افزودن فلوئور دوم 6α-F', formula: '6α-F', target: 'C6', value: 'F', color: 'border-rose-500/70 text-rose-700 dark:text-rose-300', hint: 'روی کربن C6 رها کنید' },
  ],
};

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

function identifyFreeDrug(s: SandboxState): string | null {
  if (s.ringA === 'delta4' && s.C9 === 'H' && s.C6 === 'H' && s.C16 === 'H') {
    if (s.C11 === 'OH') return 'هیدروکورتیزون (Hydrocortisone — مرجع ۱x)';
    if (s.C11 === '=O') return 'کورتیزون (Cortisone — پیش‌دارو)';
  }
  if (s.ringA === 'delta4' && s.C9 === 'F' && s.C6 === 'H' && s.C16 === 'H' && s.C11 === 'OH') {
    return 'فلودروکورتیزون (Fludrocortisone — مینرالوکورتیکوئید فوق‌قوی)';
  }
  if (s.ringA === 'delta14' && s.C9 === 'H' && s.C11 === 'OH' && s.C16 === 'H') {
    if (s.C6 === 'H') return 'پردنیزولون (Prednisolone — ضدالتهاب ۴x)';
    if (s.C6 === 'CH3') return 'متیل‌پردنیزولون (Methylprednisolone — ضدالتهاب ۵x)';
  }
  if (s.ringA === 'delta14' && s.C9 === 'F' && s.C11 === 'OH') {
    if (s.C16 === 'alpha-OH' && s.C6 === 'H') return 'تریامسینولون (Triamcinolone — بدون احتباس سدیم)';
    if (s.C16 === 'alpha-OH' && s.C6 === 'F') return 'فلوسینولون (Fluocinolone — موضعی قوی)';
    if (s.C16 === 'alpha-CH3' && s.C6 === 'H') return 'دگزامتازون (Dexamethasone — ضدالتهاب ۲۵ تا ۳۰x)';
    if (s.C16 === 'beta-CH3' && s.C6 === 'H') return 'بتامتازون (Betamethasone — ضدالتهاب ۲۵ تا ۳۰x)';
  }
  return null;
}

function computeMeters(mode: SandboxMode, s: SandboxState): { meters: MeterSpec[]; insight: string } {
  if (mode === 'estrogen_oral') {
    const oral = s.C17a === 'ethynyl' ? 92 : 12;
    const halfLife = (s.C17a === 'ethynyl' ? 50 : 15) + (s.C3 === 'OCH3' ? 42 : 0);
    const binding = s.C17b === 'H' ? 10 : s.C3 === 'OCH3' ? 86 : 95;
    let insight = 'استرادیول طبیعی به دلیل اکسیداسیون سریع 17β-OH در کبد، فراهمی زیستی خوراکی بسیار پایینی دارد.';
    if (s.C17b === 'H') {
      insight = 'هشدار: حذف 17β-OH پیوند هیدروژنی کلیدی با His 524 در گیرنده ERα را از بین می‌برد و اثر دارو سقوط می‌کند!';
    } else if (s.C17a === 'ethynyl' && s.C3 === 'OCH3') {
      insight = 'عالی! گروه 17α-اتینیل جلوی اکسیداسیون کبدی را می‌گیرد و متیل‌اتر C3 (مسترانول) نیمه‌عمر و طول اثر را به‌شدت افزایش می‌دهد.';
    } else if (s.C17a === 'ethynyl') {
      insight = 'افزودن 17α-اتینیل (اتینیل‌استرادیول) دارو را خوراکی کرد؛ برای طولانی‌تر شدن اثر، گروه فنولی C3 را نیز اصلاح کنید.';
    } else if (s.C3 === 'OCH3') {
      insight = 'متیله کردن C3 لیپوفیلیته و طول اثر را بالا برد، اما C17-OH هنوز در برابر اکسیداسیون کبدی آسیب‌پذیر است.';
    }
    return {
      meters: [
        { label: 'فراهمی زیستی خوراکی (Oral Bioavailability)', value: oral, displayValue: `${toPersianDigits(oral)}٪`, colorClass: oral > 70 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'طول اثر و نیمه‌عمر (Half-Life)', value: halfLife, displayValue: `${toPersianDigits(halfLife)}٪`, colorClass: halfLife > 75 ? 'bg-cyan-500' : 'bg-sky-500' },
        { label: 'میل اتصال به گیرنده ERα (His 524 / Glu 353)', value: binding, displayValue: `${toPersianDigits(binding)}٪`, colorClass: binding < 40 ? 'bg-rose-500' : 'bg-emerald-500' },
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
    let insight = 'اسکلت پایه دارای متیل C19 اثر آندروژنی بالا و فراهمی زیستی خوراکی ضعیف دارد.';
    if (s.ringA === 'aromatic') {
      insight = 'هشدار: آروماتیک شدن حلقه A مولکول را به لیگاند استروژنی تبدیل می‌کند و فعالیت پروژسترونی از بین می‌رود!';
    } else if (s.C19 === 'H' && s.C17a === 'ethynyl' && s.C3 === '=N-OH') {
      insight = 'طراحی ایده‌آل ۱۹-نورآندروستان! حذف C19 عوارض آندروژنی را مهار کرد، اتینیل 17α آن را خوراکی نمود و اکسیم C3 نیمه‌عمر را طولانی کرد.';
    } else if (s.C19 === 'H') {
      insight = 'حذف متیل زاویه‌ای C19 (مشتق ۱۹-نور) عوارض آندروژنی را کاهش و تمایل به گیرنده پروژسترون را افزایش داد.';
    }
    return {
      meters: [
        { label: 'انتخاب‌پذیری گیرنده پروژسترون', value: progestin, displayValue: `${toPersianDigits(progestin)}٪`, colorClass: progestin > 75 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'فعالیت خوراکی (Oral Activity)', value: oral, displayValue: `${toPersianDigits(oral)}٪`, colorClass: oral > 70 ? 'bg-cyan-500' : 'bg-amber-500' },
        { label: 'طول اثر و نیمه‌عمر', value: halfLife, displayValue: `${toPersianDigits(halfLife)}٪`, colorClass: halfLife > 70 ? 'bg-sky-500' : 'bg-slate-400' },
        { label: 'عوارض جانبی آندروژنی (هدف: کمینه)', value: androgenic, displayValue: `${toPersianDigits(androgenic)}٪`, colorClass: androgenic > 50 ? 'bg-rose-500' : 'bg-emerald-500' },
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
    const clearance = s.C21 === 'OH' ? 90 : 20;

    let insight = 'مولکول اهریمن به دلیل حضور 9α-F، گروه سیانید (-C≡N) و استر لیپوفیل موضعی فوق‌العاده سمی و ماندگار است.';
    if (s.C6 === 'F') {
      insight = 'خطر بحرانی! افزودن فلوئور دوم در 6α قدرت سمیت گلوکوکورتیکوئیدی و اتصال پایدار اهریمن را تشدید کرد!';
    } else if (toxicity === 0 && antagonism > 90 && clearance >= 90) {
      insight = 'پادزهر آنتاگونیست کامل شد! حذف 9α-F و سیانید سمیت را صفر کرد، گروه حجیم 11β-آریل هلیکس ۱۲ گیرنده را قفل می‌کند و هیدرولیز C21 دفع کلیوی را تضمین می‌نماید.';
    } else if (s.C11 === 'aryl') {
      insight = 'گروه حجیم 11β-آریل (مشابه میفپریستون) خاصیت آنتاگونیستی ایجاد کرد؛ اکنون گروه‌های سمی باقی‌مانده را نیز خنثی کنید.';
    }
    return {
      meters: [
        { label: 'شاخص سمیت اهریمن (هدف: ۰٪)', value: toxicity, displayValue: `${toPersianDigits(toxicity)}٪`, colorClass: toxicity === 0 ? 'bg-emerald-500' : 'bg-rose-500' },
        { label: 'قدرت آنتاگونیستی (مهار هلیکس ۱۲ گیرنده)', value: antagonism, displayValue: `${toPersianDigits(antagonism)}٪`, colorClass: antagonism > 80 ? 'bg-emerald-500' : 'bg-amber-500' },
        { label: 'قطبیت و دفع کلیوی (Clearance)', value: clearance, displayValue: `${toPersianDigits(clearance)}٪`, colorClass: clearance > 75 ? 'bg-cyan-500' : 'bg-amber-500' },
      ],
      insight,
    };
  }

  // حالت آزاد (Free-Play Glucocorticoid SAR Workbench)
  let gc = 1.0;
  if (s.C11 === '=O') gc *= 0.8;
  if (s.ringA === 'delta14') gc *= 4.0;
  if (s.C6 === 'CH3') gc *= 1.3;
  if (s.C6 === 'F') gc *= 2.5;
  if (s.C9 === 'F') gc *= 8.0;
  if (s.C16 === 'alpha-OH') gc *= 0.5;
  if (s.C16 === 'alpha-CH3' || s.C16 === 'beta-CH3') gc *= 0.9;
  const gcRounded = Math.round(gc * 10) / 10;
  const gcPercent = Math.min(100, Math.round((Math.log10(gc + 1) / Math.log10(60)) * 100));

  let mc = 1.0;
  if (s.ringA === 'delta14') mc *= 0.6;
  if (s.C6 === 'CH3') mc *= 0.2;
  if (s.C9 === 'F') mc *= 120;
  if (s.C16 !== 'H') mc = 0; // هر استخلاف C16 اثر مینرالوکورتیکوئیدی را عملاً حذف می‌کند
  const mcPercent = mc === 0 ? 0 : Math.min(100, Math.round((Math.log10(mc + 1) / Math.log10(130)) * 100));

  let halfLifeHours = 10;
  if (s.ringA === 'delta14') halfLifeHours += 12;
  if (s.C6 !== 'H') halfLifeHours += 8;
  if (s.C9 === 'F') halfLifeHours += 18;
  if (s.C16 !== 'H') halfLifeHours += 10;
  const hlPercent = Math.min(100, Math.round((halfLifeHours / 60) * 100));

  let logP = 1.6;
  if (s.C6 === 'CH3') logP += 0.5;
  if (s.C9 === 'F') logP += 0.2;
  if (s.C16 === 'alpha-OH') logP -= 0.7;
  if (s.C16 === 'alpha-CH3' || s.C16 === 'beta-CH3') logP += 0.5;
  if (s.C21 === 'ester') logP += 2.1;
  if (s.C21 === 'phosphate') logP -= 2.4;
  const logPPercent = Math.max(5, Math.min(100, Math.round(((logP + 1.5) / 6.5) * 100)));

  let insight = 'گروه‌های عاملی را روی کربن‌های اسکلت استروئید بکشید تا اثر دقیق SAR را مشاهده کنید.';
  if (s.C9 === 'F' && s.C16 === 'H') {
    insight = 'نکته کلیدی SAR: فلوئور 9α هم قدرت ضدالتهابی و هم احتباس سدیم (مینرالوکورتیکوئیدی) را به‌شدت افزایش می‌دهد! یک گروه روی C16 بگذارید تا ببینید چه می‌شود.';
  } else if (s.C9 === 'F' && s.C16 !== 'H') {
    insight = 'دقیقاً! افزودن استخلاف روی C16 (متیل یا هیدروکسیل) اثر احتباس سدیم ناشی از 9α-F را عملاً به صفر رساند در حالی که قدرت ضدالتهابی فوق‌العاده باقی ماند.';
  } else if (s.C21 === 'ester') {
    insight = 'استریفیکاسیون لیپوفیل C21 (LogP بالا) ترکیب را برای نفوذ پوستی و تجویز موضعی ایده‌آل می‌کند.';
  } else if (s.C21 === 'phosphate') {
    insight = 'افزودن فسفات قطبی روی C21 انحلال‌پذیری آبی را افزایش داده و دارو را برای تزریق وریدی (سیستمیک) آماده می‌سازد.';
  }

  return {
    meters: [
      { label: 'قدرت ضدالتهابی (نسبت به کورتیزول)', value: gcPercent, displayValue: `${toPersianDigits(gcRounded)}×`, colorClass: 'bg-emerald-500' },
      { label: 'احتباس آب و سدیم (مینرالوکورتیکوئیدی)', value: mcPercent, displayValue: mc === 0 ? '۰× (ناچیز)' : `${toPersianDigits(Math.round(mc * 10) / 10)}×`, colorClass: mc > 5 ? 'bg-rose-500' : 'bg-cyan-500' },
      { label: 'نیمه‌عمر بیولوژیک تخمینی', value: hlPercent, displayValue: `~${toPersianDigits(halfLifeHours)} ساعت`, colorClass: 'bg-sky-500' },
      { label: 'لیپوفیلیته تخمینی (LogP)', value: logPPercent, displayValue: toPersianDigits(logP.toFixed(1)), colorClass: 'bg-amber-500' },
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
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [dragOverSpot, setDragOverSpot] = useState<HotspotId | null>(null);

  const palette = PALETTES[mode];
  const isLocked = disabled || solved;

  const applyModification = (target: HotspotId, value: string) => {
    if (isLocked) return;
    setState((prev) => {
      const next = { ...prev, [target]: value } as SandboxState;
      onTokensChange?.(computeTokens(mode, next));
      return next;
    });
    setSelectedPaletteId(null);
  };

  const handleReset = () => {
    if (isLocked) return;
    const resetState = INITIAL_STATES[mode];
    setState(resetState);
    onTokensChange?.(computeTokens(mode, resetState));
    setSelectedPaletteId(null);
  };

  const handleHotspotClick = (spot: HotspotId) => {
    if (isLocked) return;
    if (selectedPaletteId) {
      const item = palette.find((p) => p.id === selectedPaletteId);
      if (item && item.target === spot) {
        applyModification(item.target, item.value);
        return;
      }
    }
    // اگر گروهی انتخاب نشده بود و روی نقطه کلیک شد، بین گزینه‌های مجاز همان نقطه چرخش کن
    const spotItems = palette.filter((p) => p.target === spot);
    if (spotItems.length > 0) {
      const currentVal = String(state[spot]);
      const idx = spotItems.findIndex((i) => i.value === currentVal);
      const nextItem = spotItems[(idx + 1) % spotItems.length];
      applyModification(spot, nextItem.value);
    }
  };

  const activeHotspots = useMemo(
    () => new Set<HotspotId>(palette.map((p) => p.target)),
    [palette]
  );

  const { meters, insight } = useMemo(() => computeMeters(mode, state), [mode, state]);
  const recognizedDrug = useMemo(
    () => (mode === 'free' ? identifyFreeDrug(state) : null),
    [mode, state]
  );

  const selectedItem = palette.find((p) => p.id === selectedPaletteId) || null;

  const hotspotStyle = (spot: HotspotId) => {
    const isTargetOfSelected = selectedItem?.target === spot;
    const isHovered = dragOverSpot === spot;
    if (isHovered || isTargetOfSelected) {
      return { fill: 'rgba(34,211,238,0.35)', stroke: '#22d3ee', strokeWidth: 2.5 };
    }
    return { fill: 'rgba(56,189,248,0.12)', stroke: '#38bdf8', strokeWidth: 1.4 };
  };

  const renderHotspot = (spot: HotspotId, cx: number, cy: number, title: string) => {
    if (!activeHotspots.has(spot) || isLocked) return null;
    const st = hotspotStyle(spot);
    return (
      <g
        key={spot}
        onClick={() => handleHotspotClick(spot)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverSpot(spot);
        }}
        onDragLeave={() => setDragOverSpot(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverSpot(null);
          const pid = e.dataTransfer.getData('text/plain');
          const item = palette.find((p) => p.id === pid);
          if (item && item.target === spot) {
            applyModification(item.target, item.value);
          }
        }}
        className="cursor-pointer"
      >
        <circle cx={cx} cy={cy} r={14} fill={st.fill} stroke={st.stroke} strokeWidth={st.strokeWidth} strokeDasharray="3,2" />
        <title>{title}</title>
      </g>
    );
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-50/80 dark:bg-[#07111f] p-4 sm:p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-300">
          <FlaskConical className="w-4 h-4 shrink-0" />
          <span>
            {mode === 'free'
              ? 'میز کار تعاملی و آزاد SAR (گروه‌های عاملی را روی اسکلت استروئید بکشید یا کلیک کنید)'
              : 'میز کار سنتز تعاملی — گروه‌های عاملی را روی نقاط مشخص‌شده (دایره‌های آبی) رها کنید'}
          </span>
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

      {/* پالت گروه‌های عاملی */}
      {!isLocked && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            پالت گروه‌های عاملی (بکشید و روی نقطه اتصال رها کنید، یا روی گروه کلیک کرده و سپس روی نقطه هدف کلیک نمایید):
          </div>
          <div className="flex flex-wrap gap-2">
            {palette.map((item) => {
              const isSelected = selectedPaletteId === item.id;
              const isApplied = String(state[item.target]) === item.value;
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    setSelectedPaletteId(item.id);
                  }}
                  onClick={() => {
                    // اگر کاربر مستقیم روی دکمه کلیک کرد، برای راحتی بیشتر می‌تواند یا انتخاب کند یا اگر دوباره کلیک کرد مستقیم اعمال شود
                    if (isSelected) {
                      applyModification(item.target, item.value);
                    } else {
                      setSelectedPaletteId(item.id);
                    }
                  }}
                  onDoubleClick={() => applyModification(item.target, item.value)}
                  className={`rounded-xl border px-3 py-2 text-xs cursor-grab active:cursor-grabbing transition select-none flex items-center gap-2 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-400/50 font-bold'
                      : isApplied
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                      : `${item.color} bg-white dark:bg-slate-900/90 hover:border-cyan-400`
                  }`}
                >
                  <span>{item.label}</span>
                  <span dir="ltr" className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.formula}
                  </span>
                  {isApplied && <span className="text-emerald-500 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
          {selectedItem && (
            <div className="text-[11px] text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                گروه «{selectedItem.label}» انتخاب شد — {selectedItem.hint} (یا دوباره روی همین دکمه کلیک کنید تا مستقیم اعمال شود).
              </span>
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
              <span>ساختار شناخته‌شده: {recognizedDrug}</span>
            </div>
          )}

          <div dir="ltr" className="w-full flex justify-center">
            <svg viewBox="0 0 385 225" className="w-full max-w-[420px] h-56">
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
                  {/* پیوند Δ4 */}
                  <line x1="102" y1="168" x2="128" y2="153" stroke="#38bdf8" strokeWidth="2.1" />
                  {/* پیوند Δ1 */}
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

              {/* استخلاف C6α */}
              {state.C6 !== 'H' && (
                <g>
                  <line x1="167" y1="175" x2="167" y2="199" stroke={state.C6 === 'F' ? '#f43f5e' : '#fbbf24'} strokeWidth="2.2" strokeDasharray="3,2" />
                  <text x="159" y="212" fill={state.C6 === 'F' ? '#f43f5e' : '#fbbf24'} fontSize="11.5" fontWeight="bold" fontFamily="monospace">
                    {state.C6}
                  </text>
                </g>
              )}

              {/* فلوئور C9α */}
              {state.C9 === 'F' && (
                <g>
                  <line x1="167" y1="99" x2="167" y2="128" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="3,2" />
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
                  <polygon points="167,61 147,47 152,41" fill="#34d399" />
                  <text x="128" y="42" fill="#34d399" fontSize="12" fontWeight="bold" fontFamily="monospace">HO</text>
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
                    stroke={state.C16 === 'CN' ? '#f43f5e' : state.C16 === 'beta-CH3' ? '#e879f9' : '#fbbf24'}
                    strokeWidth={state.C16 === 'beta-CH3' ? 3 : 2.2}
                    strokeDasharray={state.C16.startsWith('alpha') ? '3,2' : undefined}
                  />
                  <text
                    x="321"
                    y="97"
                    fill={state.C16 === 'CN' ? '#f43f5e' : state.C16 === 'beta-CH3' ? '#e879f9' : '#fbbf24'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {state.C16 === 'CN' ? '-C≡N' : state.C16.replace('alpha-', '').replace('beta-', '')}
                  </text>
                </g>
              )}

              {/* نقاط اتصال تعاملی (Hotspots) */}
              {renderHotspot('ringA', 101, 137, 'حلقه A (پیوند Δ1 یا آروماتیک)')}
              {renderHotspot('C3', 56, 162, 'موقعیت C3')}
              {renderHotspot('C6', 167, 184, 'موقعیت C6α')}
              {renderHotspot('C9', 167, 108, 'موقعیت C9α')}
              {renderHotspot('C11', 158, 52, 'موقعیت C11β')}
              {renderHotspot('C16', 302, 85, 'موقعیت C16')}
              {renderHotspot('C17a', 284, 59, 'موقعیت C17α')}
              {renderHotspot('C17b', 284, 38, 'موقعیت C17β')}
              {renderHotspot('C19', 134, 98, 'موقعیت متیل C19')}
              {renderHotspot('C21', 330, 46, 'موقعیت زنجیره C21')}
            </svg>
          </div>
        </div>

        {/* داشبورد زنده SAR (فارماکودینامیک و فارماکوکینتیک) */}
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
