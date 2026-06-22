import { createClient } from '@/lib/supabase/server';
import { ChatInterface } from '@/components/chat/chat-interface';
import type { ChatMessageData } from '@/components/chat/chat-message';

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })
    .limit(50);

  const initialMessages: ChatMessageData[] = (history ?? []).flatMap((row) => [
    { id: `${row.id}-q`, role: 'user' as const, content: row.question },
    { id: `${row.id}-a`, role: 'assistant' as const, content: row.answer },
  ]);

  return <ChatInterface initialMessages={initialMessages} />;
}
