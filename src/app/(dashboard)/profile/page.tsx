import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { MedicalDisclaimer } from '@/components/shared/medical-disclaimer';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('name, avatar_url, email')
    .eq('id', user!.id)
    .single();

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information.</p>
      </div>

      <ProfileForm
        userId={user!.id}
        email={profile?.email ?? user!.email ?? ''}
        initialName={profile?.name ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
      />

      <MedicalDisclaimer compact />
    </div>
  );
}
