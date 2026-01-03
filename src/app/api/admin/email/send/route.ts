import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ADMIN_EMAILS } from '@/lib/constants';

export async function POST(request: Request) {
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  
  if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { subject, body_html, body_text, recipient_filter, template_id } = body;

  if (!subject || !body_html) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  // Get recipients based on filter
  let recipientQuery = supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('status', 'active');

  if (recipient_filter?.location_id) {
    // Get users for a specific location
    const { data: userLocations } = await supabaseAdmin
      .from('user_locations')
      .select('user_id')
      .eq('location_id', recipient_filter.location_id);
    
    const userIds = userLocations?.map(ul => ul.user_id) || [];
    if (userIds.length > 0) {
      recipientQuery = recipientQuery.in('id', userIds);
    } else {
      return NextResponse.json({ error: 'No users found for this location' }, { status: 400 });
    }
  } else if (recipient_filter?.user_ids && recipient_filter.user_ids.length > 0) {
    recipientQuery = recipientQuery.in('id', recipient_filter.user_ids);
  }

  const { data: recipients, error: recipientError } = await recipientQuery;

  if (recipientError || !recipients || recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
  }

  // Create campaign record
  const { data: campaign, error: campaignError } = await supabaseAdmin
    .from('email_campaigns')
    .insert({
      name: subject.substring(0, 50),
      subject,
      body_html,
      body_text,
      template_id,
      status: 'sending',
      recipient_filter,
      total_recipients: recipients.length,
    })
    .select()
    .single();

  if (campaignError) {
    return NextResponse.json({ error: campaignError.message }, { status: 500 });
  }

  // Create email log entries for each recipient
  const emailLogs = recipients.map(recipient => ({
    campaign_id: campaign.id,
    recipient_email: recipient.email,
    recipient_id: recipient.id,
    subject,
    status: 'pending',
  }));

  await supabaseAdmin.from('email_logs').insert(emailLogs);

  // TODO: Actually send emails via Resend/SendGrid
  // For now, we'll just mark them as "sent" for demo purposes
  // In production, you would:
  // 1. Loop through recipients
  // 2. Replace variables in body_html
  // 3. Send via email provider
  // 4. Update email_logs status based on response

  // Update campaign status to sent
  await supabaseAdmin
    .from('email_campaigns')
    .update({ 
      status: 'sent', 
      sent_at: new Date().toISOString(),
      sent_count: recipients.length 
    })
    .eq('id', campaign.id);

  // Update email logs to sent
  await supabaseAdmin
    .from('email_logs')
    .update({ 
      status: 'sent', 
      sent_at: new Date().toISOString() 
    })
    .eq('campaign_id', campaign.id);

  // Log activity
  await supabaseAdmin.from('activity_logs').insert({
    admin_email: userEmail,
    action: 'email.send',
    entity_type: 'email_campaign',
    entity_id: campaign.id,
    details: { 
      subject, 
      recipient_count: recipients.length,
      recipient_filter 
    },
  });

  return NextResponse.json({ 
    success: true, 
    campaign_id: campaign.id,
    recipients_count: recipients.length 
  });
}
