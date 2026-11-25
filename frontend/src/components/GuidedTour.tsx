import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

interface Props {
  steps: TourStep[];
  onClose: () => void;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const GuidedTour: React.FC<Props> = ({ steps, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlight, setHighlight] = useState<HighlightRect | null>(null);
  const step = steps[stepIndex];

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(step.target);
    if (!target) {
      setHighlight(null);
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    const updateHighlight = () => {
      const rect = target.getBoundingClientRect();
      setHighlight({
        top: Math.max(4, rect.top - 6),
        left: Math.max(4, rect.left - 6),
        width: Math.min(window.innerWidth - 8, rect.width + 12),
        height: Math.min(window.innerHeight - 8, rect.height + 12),
      });
    };
    const timeout = window.setTimeout(updateHighlight, 180);
    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight, true);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight, true);
    };
  }, [step.target, stepIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && stepIndex > 0) setStepIndex((current) => current - 1);
      if (event.key === 'ArrowLeft' && stepIndex < steps.length - 1) setStepIndex((current) => current + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, stepIndex, steps.length]);

  if (!step) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      {!highlight && <div className="absolute inset-0 bg-[#18181B]/65" />}
      {highlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[81] rounded-[8px] border-2 border-[#0D9488] shadow-[0_0_0_9999px_rgba(24,24,27,0.68)] transition-all duration-200"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      )}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="fixed bottom-4 left-1/2 z-[82] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 lab-card p-5 sm:bottom-8"
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#18181B] pb-3">
          <div>
            <p className="font-mono text-[11px] font-bold text-[#0D9488]">
              GUIDE · {toPersianDigits(stepIndex + 1)} / {toPersianDigits(steps.length)}
            </p>
            <h2 id="tour-title" className="mt-1 text-base font-heading font-bold text-[#18181B]">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن راهنما"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-7 text-[#52525B]">{step.description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#52525B] hover:text-[#18181B]"
          >
            رد کردن راهنما
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((current) => current - 1)}
              disabled={stepIndex === 0}
              className="btn-tactile btn-tactile-surface px-3 py-1.5 text-xs"
            >
              <ArrowRight className="h-4 w-4" /> قبلی
            </button>
            <button
              type="button"
              onClick={() => (stepIndex === steps.length - 1 ? onClose() : setStepIndex((current) => current + 1))}
              className="btn-tactile btn-tactile-primary px-4 py-1.5 text-xs"
            >
              {stepIndex === steps.length - 1 ? 'پایان' : 'بعدی'}
              {stepIndex < steps.length - 1 && <ArrowLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
