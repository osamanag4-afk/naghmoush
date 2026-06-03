import PromptGenerator from '@/components/PromptGenerator';

export default function HomePage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-[760px] px-4">

        {/* ── Header ── */}
        <header className="py-10 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-pink-500 text-3xl"
            style={{ boxShadow: '0 0 32px rgba(109,40,217,0.55)' }}
          >
            ✦
          </div>

          <h1
            className="text-[1.9rem] font-extrabold leading-tight"
            style={{
              background: 'linear-gradient(to left, #a78bfa, #f9a8d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            مولّد البرومبت الاحترافي
          </h1>

          <p className="mt-2 text-slate-500">
            اكتب موضوعك — ونولّد لك أفضل Prompt لـ Claude
          </p>
        </header>

        <PromptGenerator />

        <footer className="mt-12 border-t border-night-600 pt-6 text-center text-xs text-slate-600">
          مولّد البرومبت الاحترافي · مصمم لـ Claude AI
        </footer>
      </div>
    </main>
  );
}
