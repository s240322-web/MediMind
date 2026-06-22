import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { answerHealthQuestion } from '@/lib/rag/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { question } = parsed.data;

    // user.id comes from the verified session JWT, not from client
    // input — so a request can never impersonate another tenant here.
    const { answer, sources } = await answerHealthQuestion(supabase, user.id, question);

    const sourceDocumentIds = Array.from(
      new Set(
        sources
          .filter((s) => s.source === 'user_document' && s.documentId)
          .map((s) => s.documentId!)
      )
    );

    const { data: savedChat, error: saveError } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        question,
        answer,
        source_document_ids: sourceDocumentIds,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save chat history:', saveError.message);
    }

    return NextResponse.json({
      id: savedChat?.id,
      answer,
      sources: sources.map((s) => ({
        source: s.source,
        label: s.sourceLabel,
        similarity: Math.round(s.similarity * 100) / 100,
      })),
    });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json(
      { error: 'Failed to generate a response. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data });
}
