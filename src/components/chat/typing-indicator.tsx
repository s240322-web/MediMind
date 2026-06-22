import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-3xl">
      <div className="h-7 w-7 rounded-full bg-sage flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-paper" />
      </div>
      <div className="rounded-lg px-4 py-3 bg-card border border-border flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
      </div>
    </div>
  );
}
