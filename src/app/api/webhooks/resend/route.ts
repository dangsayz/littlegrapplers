import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;
const DEVELOPER_EMAIL = 'dangzr1@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Open event
    opened_at?: string;
    // Click event
    clicked_at?: string;
    click?: {
      link: string;
      timestamp: string;
      user_agent: string;
      ip_address: string;
    };
    // Bounce event
    bounce?: {
      type: string;
      message: string;
    };
    // Delivery event
    delivered_at?: string;
  };
}

// Send notification to developer when invoice email is opened
async function notifyDeveloperEmailOpened(data: {
  recipientEmail: string;
  subject: string;
  openedAt: string;
}) {
  if (!RESEND_API_KEY) {
    console.log('[Resend Webhook] No API key, skipping developer notification');
    return;
  }

  const formattedTime = new Date(data.openedAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Little Grapplers <notifications@littlegrapplers.net>',
        to: DEVELOPER_EMAIL,
        subject: `Invoice Email Opened by ${data.recipientEmail}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 500px;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 24px; border-radius: 12px 12px 0 0;">
              <h2 style="color: white; margin: 0; font-size: 20px;">Email Opened</h2>
            </div>
            <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px; color: #475569;"><strong>Recipient:</strong> ${data.recipientEmail}</p>
              <p style="margin: 0 0 16px; color: #475569;"><strong>Subject:</strong> ${data.subject}</p>
              <p style="margin: 0 0 16px; color: #475569;"><strong>Opened:</strong> ${formattedTime}</p>
              <a href="https://littlegrapplers.net/dashboard/admin/developer" style="display: inline-block; padding: 10px 20px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">View Activity</a>
            </div>
          </div>
        `,
      }),
    });
    console.log('[Resend Webhook] Developer notified of email open');
  } catch (error) {
    console.error('[Resend Webhook] Failed to notify developer:', error);
  }
}

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  if (!RESEND_WEBHOOK_SECRET || !signature || !timestamp) {
    console.warn('[Resend Webhook] Missing secret or signature, skipping verification');
    return !RESEND_WEBHOOK_SECRET; // Allow if no secret configured (dev mode)
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', RESEND_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('svix-signature');
    const timestamp = request.headers.get('svix-timestamp');

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, timestamp)) {
      console.error('[Resend Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: ResendWebhookPayload = JSON.parse(body);
    const { type, data } = payload;

    console.log(`[Resend Webhook] Received event: ${type} for email ${data.email_id}`);

    // Map Resend event types to our event types
    const eventTypeMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.delivery_delayed': 'delivery_delayed',
    };

    const eventType = eventTypeMap[type];
    if (!eventType) {
      console.log(`[Resend Webhook] Ignoring event type: ${type}`);
      return NextResponse.json({ success: true, ignored: true });
    }

    // Get recipient email (Resend sends as array)
    const recipientEmail = Array.isArray(data.to) ? data.to[0] : data.to;

    // Determine event timestamp
    let eventTimestamp = payload.created_at;
    if (type === 'email.opened' && data.opened_at) {
      eventTimestamp = data.opened_at;
    } else if (type === 'email.clicked' && data.click?.timestamp) {
      eventTimestamp = data.click.timestamp;
    } else if (type === 'email.delivered' && data.delivered_at) {
      eventTimestamp = data.delivered_at;
    }

    // Insert event into email_events table
    const eventData = {
      email_provider_id: data.email_id,
      recipient_email: recipientEmail,
      event_type: eventType,
      event_timestamp: eventTimestamp,
      user_agent: data.click?.user_agent || null,
      ip_address: data.click?.ip_address || null,
      link_url: data.click?.link || null,
      bounce_type: data.bounce?.type || null,
      bounce_message: data.bounce?.message || null,
      raw_payload: payload,
    };

    const { error: eventError } = await supabaseAdmin
      .from('email_events')
      .insert(eventData);

    if (eventError) {
      console.error('[Resend Webhook] Failed to insert event:', eventError);
    }

    // Update balance_reminder_logs if this email matches
    if (data.email_id) {
      const updateData: Record<string, unknown> = {};
      
      switch (eventType) {
        case 'delivered':
          updateData.delivered_at = eventTimestamp;
          updateData.status = 'delivered';
          break;
        case 'opened':
          updateData.opened_at = eventTimestamp;
          // Notify developer that invoice email was opened
          await notifyDeveloperEmailOpened({
            recipientEmail,
            subject: data.subject || 'Invoice Email',
            openedAt: eventTimestamp,
          });
          break;
        case 'clicked':
          updateData.clicked_at = eventTimestamp;
          break;
        case 'bounced':
          updateData.bounced_at = eventTimestamp;
          updateData.bounce_reason = data.bounce?.message || 'Unknown';
          updateData.status = 'bounced';
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await supabaseAdmin
          .from('balance_reminder_logs')
          .update(updateData)
          .eq('email_provider_id', data.email_id);
      }
    }

    return NextResponse.json({ success: true, event: eventType });
  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle webhook verification (Resend sends a GET request to verify)
export async function GET() {
  return NextResponse.json({ status: 'Resend webhook endpoint active' });
}
