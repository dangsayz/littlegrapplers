/**
 * Email notification service
 * 
 * To use this, you'll need to:
 * 1. Sign up for Resend (https://resend.com) - they have a free tier
 * 2. Add your API key to .env.local as RESEND_API_KEY
 * 3. Verify your domain or use their test email
 */

const ADMIN_EMAIL = 'sshnaydbjj@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@littlegrapplers.net';

interface EmailNotification {
  type: 'membership_request' | 'new_thread' | 'new_reply' | 'new_user_signup' | 'waiver_signed' | 'contact_form';
  subject: string;
  html: string;
}

export async function sendAdminNotification(notification: EmailNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log('[Email] No RESEND_API_KEY configured. Email notification skipped.');
    console.log('[Email] Would have sent:', notification.subject);
    return { success: false, reason: 'no_api_key' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: notification.subject,
        html: notification.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Email] Failed to send:', error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('[Email] Sent successfully:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('[Email] Error sending notification:', error);
    return { success: false, error };
  }
}

export function createMembershipRequestEmail(data: {
  userName: string;
  userEmail: string;
  locationName: string;
  message?: string;
}): EmailNotification {
  return {
    type: 'membership_request',
    subject: `New Membership Request - ${data.userName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2EC4B6 0%, #1F2A44 100%); padding: 30px; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; }
            .message-box { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2EC4B6; margin: 20px 0; }
            .button { display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Membership Request</h1>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">User</div>
                <div class="value">${data.userName}</div>
              </div>
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value">${data.userEmail}</div>
              </div>
              <div class="info-row">
                <div class="label">Location</div>
                <div class="value">${data.locationName}</div>
              </div>
              ${data.message ? `
                <div class="message-box">
                  <div class="label">Message</div>
                  <p style="margin: 5px 0 0 0;">${data.message}</p>
                </div>
              ` : ''}
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/notifications" class="button">
                  Review Request
                </a>
              </p>
            </div>
            <div class="footer">
              Little Grapplers - Youth BJJ Program
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function createWaiverSignedEmail(data: {
  guardianName: string;
  guardianEmail: string;
  guardianPhone?: string;
  childName: string;
  childDob?: string;
  signedAt: string;
}): EmailNotification {
  return {
    type: 'waiver_signed',
    subject: `New Waiver Signed - ${data.childName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2EC4B6 0%, #1F2A44 100%); padding: 30px; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; }
            .highlight-box { background: #2EC4B6; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .button { display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Enrollment Waiver Signed</h1>
            </div>
            <div class="content">
              <div class="highlight-box">
                <div style="font-size: 14px; opacity: 0.9;">New Student</div>
                <div style="font-size: 24px; font-weight: bold;">${data.childName}</div>
              </div>
              
              <h3 style="margin-top: 25px; color: #1F2A44;">Parent/Guardian</h3>
              <div class="info-row">
                <div class="label">Name</div>
                <div class="value">${data.guardianName}</div>
              </div>
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${data.guardianEmail}">${data.guardianEmail}</a></div>
              </div>
              ${data.guardianPhone ? `
              <div class="info-row">
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${data.guardianPhone}">${data.guardianPhone}</a></div>
              </div>
              ` : ''}
              
              <h3 style="margin-top: 25px; color: #1F2A44;">Child Information</h3>
              <div class="info-row">
                <div class="label">Name</div>
                <div class="value">${data.childName}</div>
              </div>
              ${data.childDob ? `
              <div class="info-row">
                <div class="label">Date of Birth</div>
                <div class="value">${data.childDob}</div>
              </div>
              ` : ''}
              
              <div class="info-row" style="margin-top: 25px;">
                <div class="label">Signed At</div>
                <div class="value">${data.signedAt}</div>
              </div>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin" class="button">
                  View in Admin Panel
                </a>
              </p>
            </div>
            <div class="footer">
              Little Grapplers - Youth BJJ Program
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function createContactFormEmail(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hearAbout: string;
  message: string;
}): EmailNotification {
  return {
    type: 'contact_form',
    subject: `New Contact Form Submission - ${data.firstName} ${data.lastName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2EC4B6 0%, #1F2A44 100%); padding: 30px; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2EC4B6; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">Name</div>
                <div class="value">${data.firstName} ${data.lastName}</div>
              </div>
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              <div class="info-row">
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
              </div>
              <div class="info-row">
                <div class="label">How they heard about us</div>
                <div class="value">${data.hearAbout}</div>
              </div>
              <div class="message-box">
                <div class="label">Message</div>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${data.message}</p>
              </div>
            </div>
            <div class="footer">
              Little Grapplers - Youth BJJ Program
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

export function createNewThreadEmail(data: {
  userName: string;
  threadTitle: string;
  locationName: string;
  threadId: string;
  locationSlug: string;
}): EmailNotification {
  return {
    type: 'new_thread',
    subject: `New Discussion: ${data.threadTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2EC4B6 0%, #1F2A44 100%); padding: 30px; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; }
            .button { display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Discussion Started</h1>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">Thread</div>
                <div class="value">${data.threadTitle}</div>
              </div>
              <div class="info-row">
                <div class="label">Posted by</div>
                <div class="value">${data.userName}</div>
              </div>
              <div class="info-row">
                <div class="label">Location</div>
                <div class="value">${data.locationName}</div>
              </div>
              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/community/${data.locationSlug}/thread/${data.threadId}" class="button">
                  View Thread
                </a>
              </p>
            </div>
            <div class="footer">
              Little Grapplers - Youth BJJ Program
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
