'use client';

import type { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';

interface Props {
  selected: Category;
  onSelect: (cat: Category) => void;
}

export default function CategoryGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(cat.value)}
          aria-pressed={selected === cat.value}
          className={[
            'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2.5',
            'text-sm font-bold transition-all duration-150 select-none',
            selected === cat.value
              ? 'border-violet-400 bg-violet-400/10 text-white shadow-[0_0_12px_rgba(167,139,250,0.2)]'
              : 'border-night-500 bg-night-800 text-slate-400 hover:border-violet-400 hover:text-violet-400',
          ].join(' ')}
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {cat.emoji}
          </span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
