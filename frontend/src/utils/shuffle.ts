/**
 * تابع بر زدن (Shuffle) پایدار برای تصادفی‌سازی ترتیب کارت‌ها، گزینه‌ها و ساختارها
 * تا پاسخ دادن صرفاً از روی ترتیب ثابت نمایش ممکن نباشد.
 */
export function deterministicShuffle<T>(items: readonly T[], seedKey: string): T[] {
  const result = [...items];
  let hash = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    hash ^= seedKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  const nextRand = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
