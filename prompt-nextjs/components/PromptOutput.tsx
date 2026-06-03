'use client';

import { useState, useCallback } from 'react';

interface Props {
  prompt: string;
  onClear: () => void;
}

async function copyToClipboard(text: string): Promise<void> {
  // Modern API — works in HTTPS and localhost
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Legacy fallback — works in local files and older browsers
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('execCommand copy failed');
}

export default function PromptOutput({ prompt, onClear }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(prompt);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    } finally {
      setTimeout(() => setCopyState('idle'), 2200);
    }
  }, [prompt]);

  const copyLabel =
    copyState === 'copied' ? '✓ تم النسخ!' :
    copyState === 'error'  ? '✗ فشل النسخ' :
    '📋 نسخ البرومبت';

  return (
    <section
      aria-label="البرومبت الجاهز"
      className="rounded-[18px] border border-night-600 bg-night-900 p-6 space-y-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-base text-slate-100">⚡ البرومبت الجاهز</h2>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.76rem] font-bold text-emerald-400">
          ★ احترافي عالي الجودة
        </span>
      </div>

      <pre
        className="rounded-xl border border-night-500 bg-night-800 p-4 text-[0.91rem] leading-relaxed text-slate-300 whitespace-pre-wrap break-words font-[Tahoma,Arial,sans-serif] overflow-auto max-h-[500px]"
        dir="ltr"
        tabIndex={0}
        aria-label="نص البرومبت"
      >
        {prompt}
      </pre>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={[
            'flex items-center gap-2 rounded-lg border px-4 py-2 text-[0.87rem] font-bold transition-all',
            copyState === 'copied'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
              : copyState === 'error'
              ? 'border-red-500 bg-red-500/10 text-red-400'
              : 'border-night-500 bg-night-800 text-slate-400 hover:border-violet-400 hover:text-violet-400',
          ].join(' ')}
        >
          {copyLabel}
        </button>

        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-2 rounded-lg border border-night-500 bg-night-800 px-4 py-2 text-[0.87rem] font-bold text-slate-400 transition-all hover:border-violet-400 hover:text-violet-400"
        >
          ✕ مسح
        </button>
      </div>
    </section>
  );
}
