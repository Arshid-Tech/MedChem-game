import React, { useState } from 'react';
import { Radio, ChevronLeft, ChevronRight, X, Volume2 } from 'lucide-react';
import { STORY_CHARACTERS, StoryBeat } from '../data/storyData';
import { toPersianDigits } from '../utils/persian';

interface Props {
  beat: StoryBeat;
  onClose: () => void;
}

export const StoryCommsModal: React.FC<Props> = ({ beat, onClose }) => {
  const [index, setIndex] = useState(0);
  const currentMsg = beat.messages[index];
  const character = STORY_CHARACTERS[currentMsg.speaker];
  const isLast = index === beat.messages.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-beat-title"
      className="fixed inset-0 z-[95] bg-[#18181B]/70 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl lab-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#18181B] bg-[#EFECE6]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] border-2 border-[#18181B] bg-[#0D9488] text-white">
              <Radio className="w-4 h-4" />
            </span>
            <div>
              <h2 id="story-beat-title" className="text-sm font-heading font-bold text-[#18181B]">
                {beat.title}
              </h2>
              <div className="text-[11px] font-mono text-[#52525B] flex items-center gap-2">
                <span>{beat.timeStamp}</span>
                <span>•</span>
                <span>{beat.location}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پیام داستانی"
            className="btn-tactile btn-tactile-surface p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 bg-[#FFFFFF]">
          <div className="rounded-[8px] border-2 border-[#18181B] bg-[#F7F5F0] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#18181B]/15 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none select-none" aria-hidden="true">
                  {character.emoji}
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-heading font-bold text-[#18181B]">
                    {character.name}
                  </div>
                  <div className="text-[11px] text-[#52525B]">{character.role}</div>
                </div>
              </div>
              {currentMsg.mood && (
                <span className="lab-badge px-2.5 py-0.5 text-[10px] bg-[#F59E0B] text-[#18181B]">
                  {currentMsg.mood}
                </span>
              )}
            </div>

            <p className="text-sm leading-8 text-[#18181B] font-medium">{currentMsg.text}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {beat.messages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`پیام ${toPersianDigits(i + 1)}`}
                  className={`h-2.5 rounded-[3px] border border-[#18181B] transition-all ${
                    i === index ? 'w-6 bg-[#0D9488]' : 'w-2.5 bg-[#EFECE6]'
                  }`}
                />
              ))}
              <span className="mr-2 font-mono text-[11px] font-bold text-[#52525B] metric-mono">
                {index + 1}/{beat.messages.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i - 1)}
                  className="btn-tactile btn-tactile-surface px-3 py-1.5 text-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>قبلی</span>
                </button>
              )}

              {isLast ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-tactile btn-tactile-emerald px-5 py-2 text-xs sm:text-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>ادامه ماموریت</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((i) => i + 1)}
                  className="btn-tactile btn-tactile-primary px-5 py-2 text-xs sm:text-sm"
                >
                  <span>بعدی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
