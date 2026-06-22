import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS additionally guarantees this can only return the caller's rows,
  // but we filter explicitly too for clarity and defense in depth.
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const documentId = searchParams.get('id');

  if (!documentId) {
    return NextResponse.json({ error: 'Missing document id' }, { status: 400 });
  }

  // Fetch first to get the storage path, scoped to this user only.
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('file_url')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  // document_chunks cascade-deletes via the FK constraint, but we
  // also rely on RLS to ensure this delete only ever touches this user's row.
  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
