import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ChatSource {
  source: 'user_document' | 'global_knowledge';
  label: string;
  similarity: number;
}

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 max-w-3xl', isUser ? 'ml-auto flex-row-reverse' : '')}>
      <div
        className={cn(
          'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser ? 'bg-pine-400 dark:bg-pine-300' : 'bg-sage'
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-paper" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-paper" />
        )}
      </div>

      <div className={cn('min-w-0 flex-1', isUser && 'flex flex-col items-end')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-sage text-paper max-w-md'
              : 'bg-card border border-border max-w-2xl'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((s, i) => (
              <span
                key={i}
                className={cn(
                  'text-[10px] font-mono px-2 py-0.5 rounded-full border',
                  s.source === 'user_document'
                    ? 'border-sage-200 text-sage-600 bg-sage-50 dark:border-sage-600/30 dark:text-sage-200 dark:bg-sage-600/10'
                    : 'border-stone-dark text-muted-foreground bg-secondary'
                )}
              >
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
