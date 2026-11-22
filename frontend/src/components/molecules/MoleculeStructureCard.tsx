import React, { useMemo, useState } from 'react';
import { Molecule } from 'openchemlib';
import { Maximize2, X } from 'lucide-react';

export interface MoleculeStructureCardProps {
  smiles: string;
  label: string;
  revealed?: boolean;
  revealedName?: string;
  revealedNote?: string;
  width?: number;
  height?: number;
  compact?: boolean;
  showZoom?: boolean;
  className?: string;
}

/**
 * رندر ۲بعدی استاندارد و باکیفیت ساختارهای شیمیایی از روی رشته SMILES (با OpenChemLib).
 * پیش از حل معما (revealed=false) تنها شماره/کد ترکیب و تصویر ساختار نمایش داده می‌شود
 * تا نام دارو یا نکته علمی، پاسخ معما را لو ندهد.
 */
export const MoleculeStructureCard: React.FC<MoleculeStructureCardProps> = ({
  smiles,
  label,
  revealed = false,
  revealedName,
  revealedNote,
  width = 280,
  height = 165,
  compact = false,
  showZoom = true,
  className = '',
}) => {
  const [zoomed, setZoomed] = useState(false);

  const svgMarkup = useMemo(() => {
    try {
      const mol = Molecule.fromSmiles(smiles);
      return mol.toSVG(width, height, undefined, {
        suppressChiralText: true,
        suppressCIPParity: true,
        suppressESR: true,
        noStereoProblem: true,
        autoCrop: true,
        autoCropMargin: 10,
        factorTextSize: 1.15,
      });
    } catch {
      return null;
    }
  }, [smiles, width, height]);

  const zoomedSvgMarkup = useMemo(() => {
    if (!zoomed) return null;
    try {
      const mol = Molecule.fromSmiles(smiles);
      return mol.toSVG(640, 380, undefined, {
        suppressChiralText: true,
        suppressCIPParity: true,
        suppressESR: true,
        noStereoProblem: true,
        autoCrop: true,
        autoCropMargin: 14,
        factorTextSize: 1.2,
      });
    } catch {
      return null;
    }
  }, [smiles, zoomed]);

  return (
    <>
      <div
        className={`flex flex-col rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900">
          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">{label}</span>
          {showZoom && svgMarkup && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(true);
              }}
              title="بزرگ‌نمایی ساختار شیمیایی"
              aria-label={`بزرگ‌نمایی ${label}`}
              className="p-1 rounded-md text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          dir="ltr"
          className={`flex items-center justify-center bg-white p-2 ${
            compact ? 'min-h-[108px]' : 'min-h-[145px]'
          }`}
        >
          {svgMarkup ? (
            <div
              className="w-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto"
              style={{ maxHeight: compact ? 115 : 165 }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <span className="text-[11px] font-mono text-slate-400">ساختار در دسترس نیست</span>
          )}
        </div>

        {revealed && (revealedName || revealedNote) && (
          <div className="px-3 py-2 border-t border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/30 text-right space-y-0.5">
            {revealedName && (
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {revealedName}
              </div>
            )}
            {revealedNote && (
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-5">
                {revealedNote}
              </div>
            )}
          </div>
        )}
      </div>

      {zoomed && zoomedSvgMarkup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`نمای بزرگ ${label}`}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setZoomed(false);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0d1b2e] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {label}
                {revealed && revealedName ? ` — ${revealedName}` : ''}
              </div>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                aria-label="بستن بزرگ‌نمایی"
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              dir="ltr"
              className="bg-white p-6 flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: zoomedSvgMarkup }}
            />
            {revealed && revealedNote && (
              <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/70">
                {revealedNote}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
