'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { ChatMessage, type ChatMessageData } from '@/components/chat/chat-message';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { Button } from '@/components/ui/button';

const SUGGESTED_QUESTIONS = [
  'What is my cholesterol level?',
  'Are any of my blood test values abnormal?',
  'Explain my latest report in simple terms',
  'What does a high HbA1c mean?',
];

export function ChatInterface({ initialMessages }: { initialMessages: ChatMessageData[] }) {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get a response');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: data.id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "I ran into a problem answering that. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center py-16 fade-up">
            <div className="mx-auto h-12 w-12 rounded-full bg-sage-50 dark:bg-sage-600/15 flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-sage-600 dark:text-sage-300" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">Ask about your health data</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Questions are answered using your uploaded reports and general medical reference.
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-left">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-sm px-3.5 py-2.5 rounded-md border border-border bg-card hover:border-sage-300 dark:hover:border-sage-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={scrollRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-stone dark:border-pine-400/30 p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-lg border border-border bg-card px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your reports, e.g. 'What is my cholesterol level?'"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm py-1.5 outline-none placeholder:text-muted-foreground max-h-32"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
          Informational only — not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </form>
    </div>
  );
}
