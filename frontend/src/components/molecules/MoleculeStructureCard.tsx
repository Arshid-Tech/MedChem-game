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
 * Overrides OpenChemLib default SVG styles to match the Tactile Lab Workbook palette:
 * - Transparent background
 * - Carbon bonds: 2px thick in #18181B
 * - Heteroatoms: #E11D48 (Oxygen), #2563EB (Nitrogen), #0D9488 (Halogens)
 */
function styleChemistrySvg(rawSvg: string): string {
  return rawSvg
    // Ensure transparent background
    .replace(/background-color:[^;"]+;?/gi, '')
    // Carbon bonds & black strokes -> #18181B at 2px
    .replace(/stroke="rgb\(0,0,0\)"/gi, 'stroke="#18181B"')
    .replace(/stroke="#000000"/gi, 'stroke="#18181B"')
    .replace(/stroke="black"/gi, 'stroke="#18181B"')
    .replace(/fill="rgb\(0,0,0\)"/gi, 'fill="#18181B"')
    .replace(/fill="#000000"/gi, 'fill="#18181B"')
    .replace(/stroke-width="[0-9.]+"/gi, 'stroke-width="2"')
    // Oxygen (red) -> #E11D48
    .replace(/rgb\(255,0,0\)/gi, '#E11D48')
    .replace(/rgb\(160,0,0\)/gi, '#E11D48')
    .replace(/#ff0000/gi, '#E11D48')
    // Nitrogen (blue) -> #2563EB
    .replace(/rgb\(0,0,255\)/gi, '#2563EB')
    .replace(/rgb\(0,0,160\)/gi, '#2563EB')
    .replace(/#0000ff/gi, '#2563EB')
    // Halogens (green/teal) -> #0D9488
    .replace(/rgb\(0,128,0\)/gi, '#0D9488')
    .replace(/rgb\(0,160,0\)/gi, '#0D9488')
    .replace(/rgb\(0,255,0\)/gi, '#0D9488')
    .replace(/#008000/gi, '#0D9488')
    // Monospace font for atom labels
    .replace(/font-family="[^"]*"/gi, 'font-family="JetBrains Mono, monospace"');
}

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
      const raw = mol.toSVG(width, height, undefined, {
        suppressChiralText: true,
        suppressCIPParity: true,
        suppressESR: true,
        noStereoProblem: true,
        autoCrop: true,
        autoCropMargin: 10,
        factorTextSize: 1.18,
      });
      return styleChemistrySvg(raw);
    } catch {
      return null;
    }
  }, [smiles, width, height]);

  const zoomedSvgMarkup = useMemo(() => {
    if (!zoomed) return null;
    try {
      const mol = Molecule.fromSmiles(smiles);
      const raw = mol.toSVG(640, 380, undefined, {
        suppressChiralText: true,
        suppressCIPParity: true,
        suppressESR: true,
        noStereoProblem: true,
        autoCrop: true,
        autoCropMargin: 14,
        factorTextSize: 1.25,
      });
      return styleChemistrySvg(raw);
    } catch {
      return null;
    }
  }, [smiles, zoomed]);

  return (
    <>
      <div
        className={`flex flex-col rounded-[8px] border-2 border-[#18181B] bg-[#FFFFFF] shadow-[3px_3px_0px_#18181B] overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-[#18181B] bg-[#EFECE6]">
          <span className="text-xs font-bold text-[#18181B] font-heading">{label}</span>
          {showZoom && svgMarkup && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(true);
              }}
              title="بزرگ‌نمایی ساختار شیمیایی"
              aria-label={`بزرگ‌نمایی ${label}`}
              className="p-1 rounded-[6px] border border-[#18181B] bg-[#FFFFFF] text-[#18181B] hover:bg-[#0D9488] hover:text-white transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          dir="ltr"
          className={`flex items-center justify-center molecule-dot-grid p-2 ${
            compact ? 'min-h-[108px]' : 'min-h-[145px]'
          }`}
        >
          {svgMarkup ? (
            <div
              className="w-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:bg-transparent"
              style={{ maxHeight: compact ? 115 : 165 }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <span className="text-[11px] font-mono text-[#52525B]">ساختار در دسترس نیست</span>
          )}
        </div>

        {revealed && (revealedName || revealedNote) && (
          <div className="px-3 py-2 border-t-2 border-[#18181B] bg-[#EFECE6] text-right space-y-0.5">
            {revealedName && (
              <div className="text-xs font-extrabold text-[#16A34A]">{revealedName}</div>
            )}
            {revealedNote && (
              <div className="text-[11px] text-[#52525B] leading-5">{revealedNote}</div>
            )}
          </div>
        )}
      </div>

      {zoomed && zoomedSvgMarkup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`نمای بزرگ ${label}`}
          className="fixed inset-0 z-[110] bg-[#18181B]/70 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setZoomed(false);
          }}
        >
          <div className="w-full max-w-2xl lab-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#18181B] bg-[#EFECE6]">
              <div className="font-heading font-bold text-sm text-[#18181B]">
                {label}
                {revealed && revealedName ? ` — ${revealedName}` : ''}
              </div>
              <button
                type="button"
                onClick={() => setZoomed(false)}
                aria-label="بستن بزرگ‌نمایی"
                className="btn-tactile btn-tactile-surface p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              dir="ltr"
              className="molecule-dot-grid p-6 flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:bg-transparent"
              dangerouslySetInnerHTML={{ __html: zoomedSvgMarkup }}
            />
            {revealed && revealedNote && (
              <div className="px-5 py-3 border-t-2 border-[#18181B] text-xs text-[#18181B] bg-[#EFECE6]">
                {revealedNote}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
