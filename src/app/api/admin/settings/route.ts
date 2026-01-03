import { NextResponse } from 'next/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';


export async function GET() {
  const user = await currentUser();
  
  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: settings, error } = await supabaseAdmin
    .from('site_settings')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to key-value object
  const settingsMap: Record<string, unknown> = {};
  settings?.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  return NextResponse.json(settingsMap);
}

export async function POST(request: Request) {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  
  if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { settings } = body;

  if (!settings || !Array.isArray(settings)) {
    return NextResponse.json({ error: 'Settings array is required' }, { status: 400 });
  }

  // Upsert each setting
  for (const setting of settings) {
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(
        { 
          key: setting.key, 
          value: setting.value,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error(`Failed to update setting ${setting.key}:`, error);
    }
  }

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    admin_email: userEmail,
    action: 'settings.update',
    entity_type: 'site_settings',
    details: { updated_keys: settings.map((s: { key: string }) => s.key) },
  });

  return NextResponse.json({ success: true });
}
