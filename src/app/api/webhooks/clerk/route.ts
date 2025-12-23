import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Missing webhook secret', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;

  switch (eventType) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0]?.email_address;

      if (!email) {
        console.error('No email found for user:', id);
        return new Response('No email found', { status: 400 });
      }

      const { error } = await supabaseAdmin.from('users').upsert(
        {
          clerk_user_id: id,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          avatar_url: image_url || null,
          status: 'pending',
        },
        { onConflict: 'clerk_user_id' }
      );

      if (error) {
        console.error('Failed to create user:', error);
        return new Response('Failed to create user', { status: 500 });
      }

      console.log('User created:', id);
      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0]?.email_address;

      const { error } = await supabaseAdmin
        .from('users')
        .update({
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          avatar_url: image_url || null,
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Failed to update user:', error);
        return new Response('Failed to update user', { status: 500 });
      }

      console.log('User updated:', id);
      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;

      if (!id) {
        return new Response('No user ID', { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('users')
        .update({ status: 'suspended' })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Failed to suspend user:', error);
        return new Response('Failed to suspend user', { status: 500 });
      }

      console.log('User suspended:', id);
      break;
    }

    default:
      console.log('Unhandled webhook event:', eventType);
  }

  return new Response('Webhook processed', { status: 200 });
}
