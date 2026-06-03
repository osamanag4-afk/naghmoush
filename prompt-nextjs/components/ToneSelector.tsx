'use client';

import type { Tone } from '@/lib/types';
import { TONES } from '@/lib/constants';

interface Props {
  selected: Tone;
  onSelect: (tone: Tone) => void;
}

export default function ToneSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="أسلوب الإجابة">
      {TONES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onSelect(t.value)}
          aria-pressed={selected === t.value}
          className={[
            'rounded-full border px-4 py-1.5 text-[0.82rem] font-bold transition-all duration-150 select-none',
            selected === t.value
              ? 'border-cyan-400 bg-cyan-400 text-night-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
              : 'border-night-500 bg-night-800 text-slate-400 hover:border-cyan-400 hover:text-cyan-400',
          ].join(' ')}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
