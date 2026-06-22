import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper dark:bg-pine flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-sage flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5 text-paper" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">MediMind AI</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
