import Link from 'next/link';
import { ArrowRight, FileText, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-pine flex flex-col">
      {/* Nav */}
      <header className="border-b border-stone dark:border-pine-400/30">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-sage flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-paper" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">MediMind AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl fade-up">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-sage-600 dark:text-sage-300 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse-line" />
            Private, document-grounded answers
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-medium leading-[1.05] tracking-tight mb-6">
            Read your reports
            <br />
            <span className="italic text-sage-500 dark:text-sage-300">like a clinician would.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
            Upload your blood work, prescriptions, and diagnostic reports. Ask plain-language
            questions and get answers grounded in your own data — never another patient's.
          </p>
          <div className="flex items-center gap-3 mb-10">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">I have an account</Button>
            </Link>
          </div>
          <MedicalDisclaimer compact />
        </div>
      </section>

      {/* Vitals strip — signature element */}
      <section className="vitals-strip">
        <div className="container mx-auto flex items-stretch px-4">
          <div className="vitals-strip__item">
            <span className="vitals-strip__pulse" />
            <span className="vitals-strip__label">Isolation</span>
            <span className="vitals-strip__value">per-tenant RLS</span>
          </div>
          <div className="vitals-strip__divider" />
          <div className="vitals-strip__item">
            <span className="vitals-strip__label">Embedding</span>
            <span className="vitals-strip__value">text-embedding-3-small</span>
          </div>
          <div className="vitals-strip__divider" />
          <div className="vitals-strip__item">
            <span className="vitals-strip__label">Model</span>
            <span className="vitals-strip__value">gpt-4.1-mini</span>
          </div>
          <div className="vitals-strip__divider" />
          <div className="vitals-strip__item">
            <span className="vitals-strip__label">Formats</span>
            <span className="vitals-strip__value">pdf · docx · txt</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 grid md:grid-cols-3 gap-6">
        {[
          {
            icon: FileText,
            title: 'Your reports, structured',
            desc: 'Drop in a PDF, DOCX, or TXT report. It\u2019s chunked, embedded, and indexed under your account only.',
          },
          {
            icon: MessageSquare,
            title: 'Ask anything, plainly',
            desc: 'Chat about your cholesterol, your prescriptions, or a confusing term \u2014 answered with your real numbers.',
          },
          {
            icon: ShieldCheck,
            title: 'Strict data isolation',
            desc: 'Row Level Security enforces that no query, however written, can ever surface another user\u2019s report.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="data-card p-6">
            <div className="h-9 w-9 rounded-md bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center mb-4">
              <Icon className="h-4.5 w-4.5 text-sage-600 dark:text-sage-300" />
            </div>
            <h3 className="font-display text-base font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-stone dark:border-pine-400/30 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <MedicalDisclaimer />
        </div>
      </footer>
    </div>
  );
}
