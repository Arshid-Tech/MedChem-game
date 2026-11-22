import { useEffect, useRef } from 'react';

/**
 * تایمر دقیق پژوهشی برای هر معما:
 * ۱. شمارش زمان را تنها از لحظه باز شدن (unlock) همان معما آغاز می‌کند (نه از لحظه ورود به دپارتمان).
 * ۲. در هر بار ثبت پاسخ، تنها بازه سپری‌شده از آخرین تلاش را برمی‌گرداند تا در تلاش‌های مجدد،
 *    زمان معما و زمان کل بازی دچار جمع مضاعف (double-counting) نشوند.
 */
export function usePuzzleTimer(isUnlocked: boolean, isSolved: boolean) {
  const startedAtRef = useRef<number | null>(isUnlocked && !isSolved ? Date.now() : null);

  useEffect(() => {
    if (isUnlocked && !isSolved && startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
  }, [isUnlocked, isSolved]);

  const consumeElapsedSeconds = (): number => {
    const now = Date.now();
    const started = startedAtRef.current ?? now;
    startedAtRef.current = now;
    return Math.max(1, Math.round((now - started) / 1000));
  };

  return { consumeElapsedSeconds };
}
