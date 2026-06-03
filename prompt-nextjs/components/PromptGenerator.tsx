'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Category, Tone } from '@/lib/types';
import { TIPS } from '@/lib/constants';
import { detectCategory } from '@/lib/detectCategory';
import { buildPrompt } from '@/lib/buildPrompt';
import CategoryGrid from './CategoryGrid';
import ToneSelector from './ToneSelector';
import PromptOutput from './PromptOutput';

const SECTION_LABEL_BASE =
  'mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className={SECTION_LABEL_BASE}>
      <span
        className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400"
        style={{ boxShadow: '0 0 6px #a78bfa' }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[18px] border border-night-600 bg-night-900 p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function PromptGenerator() {
  const [topic, setTopic]               = useState('');
  const [category, setCategory]         = useState<Category>('auto');
  const [tone, setTone]                 = useState<Tone>('balanced');
  const [prompt, setPrompt]             = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topicError, setTopicError]     = useState(false);

  // Persist timer ref so we can cancel it on unmount or rapid re-clicks
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleGenerate = useCallback(() => {
    const trimmed = topic.trim();
    if (!trimmed) {
      setTopicError(true);
      setTimeout(() => setTopicError(false), 1500);
      return;
    }

    // Cancel any in-flight generation
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsGenerating(true);

    // Small artificial delay gives visual feedback that something happened
    timerRef.current = setTimeout(() => {
      const resolved = category === 'auto' ? detectCategory(trimmed) : category;
      setPrompt(buildPrompt(trimmed, resolved, tone));
      setIsGenerating(false);
    }, 550);
  }, [topic, category, tone]);

  const handleClear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsGenerating(false);
    setTopic('');
    setPrompt(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Topic Input ── */}
      <Card>
        <SectionLabel>موضوعك أو سؤالك</SectionLabel>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={
            'اكتب موضوعك هنا...\n' +
            'مثال: كيف أبني تطبيق ويب بـ React؟\n' +
            'أو: اكتب لي خطة تسويقية لمطعم'
          }
          dir="rtl"
          rows={5}
          maxLength={600}
          aria-label="موضوع البرومبت"
          className={[
            'w-full resize-none rounded-xl border bg-night-800 px-4 py-3',
            'font-[Tahoma,Arial,sans-serif] text-base leading-relaxed text-slate-100',
            'placeholder:text-slate-600 focus:outline-none transition-colors',
            topicError
              ? 'border-red-400 focus:border-red-400'
              : 'border-night-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10',
          ].join(' ')}
        />
        <p className="mt-1.5 text-right text-xs text-slate-600">
          {topic.length} / 600
        </p>
      </Card>

      {/* ── Category + Tone ── */}
      <Card className="space-y-5">
        <div>
          <SectionLabel>نوع المطلوب</SectionLabel>
          <CategoryGrid selected={category} onSelect={setCategory} />
        </div>

        <hr className="border-night-700" />

        <div>
          <SectionLabel>أسلوب الإجابة</SectionLabel>
          <ToneSelector selected={tone} onSelect={setTone} />
        </div>
      </Card>

      {/* ── Generate Button ── */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className={[
          'w-full rounded-xl py-4 text-[1.05rem] font-extrabold tracking-wide text-white',
          'bg-gradient-to-r from-violet-700 via-violet-600 to-purple-600',
          'shadow-[0_4px_20px_rgba(109,40,217,0.4)]',
          'transition-all duration-200',
          isGenerating
            ? 'cursor-wait opacity-60'
            : 'hover:-translate-y-0.5 hover:shadow-[0_7px_28px_rgba(109,40,217,0.65)] active:translate-y-0',
        ].join(' ')}
      >
        {isGenerating ? '⟳ جاري التوليد...' : '✦ ولّد البرومبت الاحترافي'}
      </button>

      {/* ── Output ── */}
      {prompt !== null && (
        <PromptOutput prompt={prompt} onClear={handleClear} />
      )}

      {/* ── Tips ── */}
      <Card>
        <SectionLabel>أسرار البرومبت الاحترافي</SectionLabel>
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="rounded-xl border border-night-700 bg-night-800 p-3.5"
            >
              <div className="mb-1.5 text-xl" aria-hidden="true">{tip.icon}</div>
              <div className="mb-1 text-[0.85rem] font-bold text-violet-400">{tip.title}</div>
              <div className="text-[0.78rem] leading-snug text-slate-500">{tip.body}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
