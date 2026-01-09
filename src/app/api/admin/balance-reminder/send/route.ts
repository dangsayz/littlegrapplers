import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { SUPER_ADMIN_EMAILS } from '@/lib/constants';

const DEV_EMAILS = ['dangzr1@gmail.com', 'walkawayy@icloud.com'];
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@littlegrapplers.net';

function isAuthorized(email: string | undefined): boolean {
  if (!email) return false;
  return DEV_EMAILS.includes(email) || SUPER_ADMIN_EMAILS.includes(email);
}

function createBalanceReminderEmail(data: {
  clientName: string;
  amountDue: number;
  workOrders: Array<{ title: string; amount: number }>;
  expirationDate?: string;
  isAutomated?: boolean;
}): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(data.amountDue);

  const workOrdersList = data.workOrders
    .map(
      (wo) =>
        `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1d1d1f;">
            ${wo.title}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1d1d1f; text-align: right; font-weight: 500;">
            $${wo.amount.toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  const expirationWarning = data.expirationDate
    ? `
      <tr>
        <td style="padding: 24px 0;">
          <div style="background: linear-gradient(135deg, #FF5A5F 0%, #FF8A8D 100%); border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.9);">
              Payment Due By
            </p>
            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 600; color: white;">
              ${new Date(data.expirationDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p style="margin: 8px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: rgba(255,255,255,0.85);">
              Platform access may be suspended after this date
            </p>
          </div>
        </td>
      </tr>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
          <tr>
            <td style="padding: 60px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; margin: 0 auto;">
                
                <!-- Header -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: #86868b;">
                      Balance Reminder
                    </p>
                    <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 600; letter-spacing: -0.5px; color: #1d1d1f; line-height: 1.125;">
                      Hi ${data.clientName},
                    </h1>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #1d1d1f; line-height: 1.64706;">
                      This is a friendly reminder that you have an outstanding balance for development services on your Little Grapplers platform.
                    </p>
                  </td>
                </tr>

                <!-- Amount Due Card -->
                <tr>
                  <td style="padding-bottom: 32px;">
                    <div style="background: linear-gradient(135deg, #2EC4B6 0%, #1F2A44 100%); border-radius: 16px; padding: 32px; text-align: center;">
                      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255,255,255,0.8);">
                        Amount Due
                      </p>
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 600; color: white; letter-spacing: -1px;">
                        ${formattedAmount}
                      </p>
                    </div>
                  </td>
                </tr>

                ${expirationWarning}

                <!-- Work Orders -->
                <tr>
                  <td style="padding: 32px 0; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                      Outstanding Items
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${workOrdersList}
                      <tr>
                        <td style="padding: 16px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #1d1d1f; font-weight: 600;">
                          Total
                        </td>
                        <td style="padding: 16px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #1d1d1f; text-align: right; font-weight: 600;">
                          ${formattedAmount}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Pay Button -->
                <tr>
                  <td style="padding: 32px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.littlegrapplers.net'}/dashboard/admin/developer" style="display: block; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 500; color: white; text-decoration: none; padding: 16px 32px; background: #2EC4B6; border-radius: 12px; text-align: center;">
                      Pay Now
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding-top: 32px; border-top: 1px solid #e5e5e5;">
                    <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #86868b; line-height: 1.5;">
                      Questions about this invoice? Reply to this email or contact your developer.
                    </p>
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #86868b; line-height: 1.5;">
                      Little Grapplers Platform Services
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// POST: Send balance reminder email
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!isAuthorized(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { reminderType = 'manual' } = body;

    // Get platform settings
    const { data: settings } = await supabaseAdmin
      .from('platform_status')
      .select('client_email, client_name, payment_expiration_date')
      .single();

    const clientEmail = settings?.client_email || 'info@littlegrapplers.net';
    const clientName = settings?.client_name || 'Little Grapplers';
    const expirationDate = settings?.payment_expiration_date;

    // Get unpaid work orders
    const { data: unpaidOrders, error: ordersError } = await supabaseAdmin
      .from('work_orders')
      .select('id, title, quoted_cost')
      .eq('status', 'completed')
      .eq('paid', false);

    if (ordersError) throw ordersError;

    if (!unpaidOrders || unpaidOrders.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No unpaid work orders found' 
      });
    }

    const amountDue = unpaidOrders.reduce((sum, o) => sum + (o.quoted_cost || 0), 0);
    const workOrders = unpaidOrders.map((o) => ({
      title: o.title,
      amount: o.quoted_cost || 0,
    }));

    // Create email content
    const htmlContent = createBalanceReminderEmail({
      clientName,
      amountDue,
      workOrders,
      expirationDate,
      isAutomated: reminderType !== 'manual',
    });

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('[Email] No RESEND_API_KEY configured. Would have sent balance reminder.');
      
      // Log the reminder attempt anyway
      await supabaseAdmin.from('balance_reminder_logs').insert({
        recipient_email: clientEmail,
        recipient_name: clientName,
        amount_due: amountDue,
        reminder_type: reminderType,
        expiration_date: expirationDate,
        status: 'sent',
        metadata: { 
          work_orders: workOrders,
          dry_run: true,
          sent_by: userEmail,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Reminder logged (email not configured)',
        dryRun: true,
        amountDue,
        recipientEmail: clientEmail,
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: clientEmail,
        subject: `Balance Reminder: ${new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amountDue)} Due`,
        html: htmlContent,
      }),
    });

    let emailProviderId = null;
    let emailStatus = 'sent';

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] Failed to send balance reminder:', error);
      emailStatus = 'failed';
    } else {
      const data = await response.json();
      emailProviderId = data.id;
      console.log('[Email] Balance reminder sent:', data.id);
    }

    // Log the reminder
    await supabaseAdmin.from('balance_reminder_logs').insert({
      recipient_email: clientEmail,
      recipient_name: clientName,
      amount_due: amountDue,
      reminder_type: reminderType,
      expiration_date: expirationDate,
      email_provider_id: emailProviderId,
      status: emailStatus,
      metadata: { 
        work_orders: workOrders,
        sent_by: userEmail,
      },
    });

    // Update last reminder sent timestamp
    await supabaseAdmin
      .from('platform_status')
      .update({ last_reminder_sent_at: new Date().toISOString() })
      .not('id', 'is', null);

    return NextResponse.json({
      success: emailStatus === 'sent',
      message: emailStatus === 'sent' ? 'Reminder sent successfully' : 'Failed to send reminder',
      amountDue,
      recipientEmail: clientEmail,
      emailId: emailProviderId,
    });
  } catch (error) {
    console.error('Error sending balance reminder:', error);
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
