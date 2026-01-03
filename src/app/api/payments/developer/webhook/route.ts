import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const DEV_STRIPE_SECRET = process.env.DEV_STRIPE_SECRET_KEY;
const DEV_STRIPE_WEBHOOK_SECRET = process.env.DEV_STRIPE_WEBHOOK_SECRET;

let resendInstance: Resend | null = null;
const getResend = () => {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

const DEVELOPER_EMAIL = 'dangzr1@gmail.com';
const DEVELOPER_NAME = 'Dang Nguyen';

export async function POST(request: NextRequest) {
  if (!DEV_STRIPE_SECRET || !DEV_STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const devStripe = new Stripe(DEV_STRIPE_SECRET);
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = devStripe.webhooks.constructEvent(body, signature, DEV_STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Send professional receipt email to client
    if (session.customer_details?.email) {
      await sendReceiptEmail({
        clientEmail: session.customer_details.email,
        clientName: session.customer_details.name || 'Valued Client',
        amount: (session.amount_total || 0) / 100,
        description: session.metadata?.description || 'Development Services',
        receiptUrl: undefined,
      });
    }

    // Notify developer of payment received
    await sendDeveloperNotification({
      clientName: session.customer_details?.name || 'Client',
      amount: (session.amount_total || 0) / 100,
    });
  }

  return NextResponse.json({ received: true });
}

async function sendReceiptEmail({
  clientEmail,
  clientName,
  amount,
  description,
  receiptUrl,
}: {
  clientEmail: string;
  clientName: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  try {
    await getResend().emails.send({
      from: 'Little Grapplers Development <notifications@littlegrapplers.net>',
      to: clientEmail,
      subject: `Receipt for ${formattedAmount} - Development Services`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                      <div style="width: 50px; height: 50px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="color: white; font-size: 24px;">✓</span>
                      </div>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1e293b;">Payment Received</h1>
                      <p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${formattedDate}</p>
                    </td>
                  </tr>

                  <!-- Amount -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center;">
                      <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Amount Paid</p>
                      <p style="margin: 0; font-size: 42px; font-weight: 600; color: #1e293b;">${formattedAmount}</p>
                    </td>
                  </tr>

                  <!-- Details -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px;">
                        <tr>
                          <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
                            <p style="margin: 0; color: #64748b; font-size: 13px;">Service</p>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${description}</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 20px;">
                            <p style="margin: 0; color: #64748b; font-size: 13px;">Developer</p>
                            <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 500;">${DEVELOPER_NAME}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td style="padding: 0 40px 30px;">
                      <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">
                        Thank you for your payment, ${clientName.split(' ')[0]}. Your continued partnership in building Little Grapplers is greatly appreciated.
                      </p>
                    </td>
                  </tr>

                  ${receiptUrl ? `
                  <!-- Receipt Link -->
                  <tr>
                    <td style="padding: 0 40px 30px; text-align: center;">
                      <a href="${receiptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1e293b; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">View Receipt</a>
                    </td>
                  </tr>
                  ` : ''}

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #f1f5f9;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Questions? Reply to this email or contact ${DEVELOPER_EMAIL}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log('Receipt email sent to:', clientEmail);
  } catch (error) {
    console.error('Failed to send receipt email:', error);
  }
}

async function sendDeveloperNotification({
  clientName,
  amount,
}: {
  clientName: string;
  amount: number;
}) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  try {
    await getResend().emails.send({
      from: 'Little Grapplers <notifications@littlegrapplers.net>',
      to: DEVELOPER_EMAIL,
      subject: `Payment Received: ${formattedAmount} from ${clientName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">Payment Received</h2>
          <p><strong>Amount:</strong> ${formattedAmount}</p>
          <p><strong>From:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    console.log('Developer notification sent');
  } catch (error) {
    console.error('Failed to send developer notification:', error);
  }
}
