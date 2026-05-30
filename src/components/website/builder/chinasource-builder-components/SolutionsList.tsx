'use client';

import { ArrowUpRight } from 'lucide-react';
import { EditableText, EditableIcon } from './EditorComponents';
import type { GeneratedContent, ThemeColor } from '../chinasource-types';

interface SolutionsListProps {
  items: GeneratedContent['solutions']['items'];
  accentHex: string;
  themeColor: ThemeColor;
  updateContent: (path: string, value: unknown) => void;
  readOnly: boolean;
}

/**
 * Industrial-spec solutions list.
 *
 * NOT a card grid. Each solution is a full-width row with:
 *   - A mono-style spec label (SOL-A / SOL-B / SOL-C)
 *   - A massive accent numeral
 *   - The title + description
 *   - The icon, rendered larger, in a colored "tile" on the right
 *
 * Rows are separated by hairline rules — reads as entries in a manual,
 * not as feature tiles.
 */
const LETTER = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function SolutionsList({
  items,
  accentHex,
  themeColor,
  updateContent,
  readOnly,
}: SolutionsListProps) {
  return (
    <div className="border-t border-slate-200">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="group relative grid grid-cols-12 gap-6 lg:gap-10 items-center py-10 lg:py-12 border-b border-slate-200 transition-colors duration-500 ease-out hover:bg-slate-50/80"
        >
          {/* Left-edge accent bar — paints in from top→bottom on hover */}
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 transition-all duration-500 ease-out group-hover:h-full group-hover:top-0 group-hover:translate-y-0"
            style={{ background: accentHex }}
          />

          {/* Left column — spec label + giant letter */}
          <div className="col-span-12 lg:col-span-2 flex lg:flex-col items-baseline lg:items-start gap-3 lg:gap-2 lg:pl-2">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.22em] transition-[letter-spacing] duration-500 group-hover:tracking-[0.28em]"
              style={{ color: accentHex }}
            >
              SOL-{LETTER[idx] || String(idx + 1)}
            </span>
            <span
              className="font-black leading-none tabular-nums tracking-tight transition-transform duration-500 ease-out group-hover:-translate-y-1"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                color: accentHex,
                letterSpacing: '-0.04em',
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Middle column — title + description */}
          <div className="col-span-12 lg:col-span-7">
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 tracking-tight leading-snug transition-transform duration-500 ease-out group-hover:translate-x-1">
              <EditableText
                value={item.title}
                onChange={(v) => updateContent(`solutions.items.${idx}.title`, v)}
                readOnly={readOnly}
              />
            </h3>
            <p className="text-slate-600 text-[15px] lg:text-base leading-relaxed max-w-xl transition-colors duration-500 group-hover:text-slate-700">
              <EditableText
                value={item.description}
                onChange={(v) => updateContent(`solutions.items.${idx}.description`, v)}
                readOnly={readOnly}
              />
            </p>
          </div>

          {/* Right column — icon tile, big, on accent surface */}
          <div className="col-span-12 lg:col-span-3 flex lg:justify-end">
            <div
              className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-md flex items-center justify-center transition-[transform,box-shadow] duration-500 ease-out group-hover:-rotate-[6deg] group-hover:scale-110 will-change-transform"
              style={{
                background: accentHex,
                boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 14px 32px -16px ${accentHex}99`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 1px 0 rgba(255,255,255,0.22) inset, 0 22px 44px -18px ${accentHex}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 1px 0 rgba(255,255,255,0.18) inset, 0 14px 32px -16px ${accentHex}99`;
              }}
            >
              {/* Decorative corners — pulse on hover */}
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-1.5 w-2 h-2 border-l border-t border-white/50 transition-all duration-500 group-hover:w-3 group-hover:h-3 group-hover:border-white/80"
              />
              <span
                aria-hidden="true"
                className="absolute bottom-1.5 right-1.5 w-2 h-2 border-r border-b border-white/50 transition-all duration-500 group-hover:w-3 group-hover:h-3 group-hover:border-white/80"
              />
              <EditableIcon
                iconName={item.icon}
                themeColor={themeColor}
                onChange={(v) => updateContent(`solutions.items.${idx}.icon`, v)}
                className="w-9 h-9 lg:w-10 lg:h-10 text-white"
                readOnly={readOnly}
              />
            </div>
          </div>

          {/* Right-arrow hint — slides in cleanly */}
          <span
            aria-hidden="true"
            className="hidden lg:flex absolute right-1 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out"
            style={{ color: accentHex }}
          >
            <ArrowUpRight size={22} />
          </span>
        </div>
      ))}
    </div>
  );
}
