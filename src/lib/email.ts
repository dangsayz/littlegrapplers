/**
 * Email notification service
 * 
 * To use this, you'll need to:
 * 1. Sign up for Resend (https://resend.com) - they have a free tier
 * 2. Add your API key to .env.local as RESEND_API_KEY
 * 3. Verify your domain or use their test email
 */

import { ADMIN_EMAILS } from '@/lib/constants';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@littlegrapplers.net';

// HTML escape utility to prevent XSS in email templates
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

  // Send to all admin emails
  const results = await Promise.all(
    ADMIN_EMAILS.map(async (adminEmail) => {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: notification.subject,
            html: notification.html,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`[Email] Failed to send to ${adminEmail}:`, error);
          return { success: false, email: adminEmail, error };
        }

        const data = await response.json();
        console.log(`[Email] Sent to ${adminEmail}:`, data.id);
        return { success: true, email: adminEmail, id: data.id };
      } catch (error) {
        console.error(`[Email] Error sending to ${adminEmail}:`, error);
        return { success: false, email: adminEmail, error };
      }
    })
  );

  const successCount = results.filter(r => r.success).length;
  console.log(`[Email] Sent to ${successCount}/${ADMIN_EMAILS.length} admins`);
  return { success: successCount > 0, results };
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
  const submissionDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return {
    type: 'contact_form',
    subject: `New Inquiry from ${data.firstName} ${data.lastName}`,
    html: `
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
                    <td style="padding-bottom: 48px; border-bottom: 1px solid #e5e5e5;">
                      <p style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; color: #86868b;">
                        Contact Inquiry
                      </p>
                      <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 600; letter-spacing: -0.5px; color: #1d1d1f; line-height: 1.125;">
                        ${data.firstName} ${data.lastName}
                      </h1>
                      <p style="margin: 12px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: #86868b; line-height: 1.5;">
                        ${submissionDate}
                      </p>
                    </td>
                  </tr>

                  <!-- Contact Details -->
                  <tr>
                    <td style="padding: 40px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding-bottom: 24px;">
                            <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                              Email
                            </p>
                            <a href="mailto:${data.email}" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #0071e3; text-decoration: none; line-height: 1.47059;">
                              ${data.email}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 24px;">
                            <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                              Phone
                            </p>
                            <a href="tel:${data.phone}" style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #0071e3; text-decoration: none; line-height: 1.47059;">
                              ${data.phone}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p style="margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                              Referred By
                            </p>
                            <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #1d1d1f; line-height: 1.47059;">
                              ${data.hearAbout}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Message -->
                  <tr>
                    <td style="padding: 32px 0; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #86868b;">
                        Message
                      </p>
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; color: #1d1d1f; line-height: 1.64706; white-space: pre-wrap;">
${data.message}
                      </p>
                    </td>
                  </tr>

                  <!-- Reply Button -->
                  <tr>
                    <td style="padding: 32px 0 48px 0;">
                      <a href="mailto:${data.email}?subject=Re: Your inquiry to Little Grapplers" style="display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 400; color: #0071e3; text-decoration: none; padding: 12px 24px; border: 1px solid #0071e3; border-radius: 980px; transition: all 0.2s ease;">
                        Reply to ${data.firstName}
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding-top: 32px; border-top: 1px solid #e5e5e5;">
                      <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #86868b; line-height: 1.5;">
                        Little Grapplers
                      </p>
                      <p style="margin: 4px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #86868b; line-height: 1.5;">
                        Youth Brazilian Jiu-Jitsu
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

export function createEnrollmentNotificationEmail(data: {
  childName: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone?: string;
  locationName: string;
  planType: string;
  submittedAt: string;
}): EmailNotification {
  // Escape all user-supplied data to prevent XSS
  const safe = {
    childName: escapeHtml(data.childName),
    guardianName: escapeHtml(data.guardianName),
    guardianEmail: escapeHtml(data.guardianEmail),
    guardianPhone: data.guardianPhone ? escapeHtml(data.guardianPhone) : '',
    locationName: escapeHtml(data.locationName),
    planType: escapeHtml(data.planType),
    submittedAt: escapeHtml(data.submittedAt),
  };

  return {
    type: 'new_user_signup',
    subject: `New Enrollment - ${safe.childName} at ${safe.locationName}`,
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
            .highlight-box { background: linear-gradient(135deg, #2EC4B6 0%, #8FE3CF 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .badge { display: inline-block; background: #F7931E; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .button { display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Enrollment Application</h1>
            </div>
            <div class="content">
              <div class="highlight-box">
                <div style="font-size: 14px; opacity: 0.9;">New Student</div>
                <div style="font-size: 24px; font-weight: bold;">${safe.childName}</div>
                <div style="margin-top: 8px;">
                  <span class="badge">Pending Review</span>
                </div>
              </div>
              
              <h3 style="margin-top: 25px; color: #1F2A44;">Location</h3>
              <div class="info-row">
                <div class="value">${safe.locationName}</div>
              </div>
              
              <h3 style="margin-top: 25px; color: #1F2A44;">Parent/Guardian</h3>
              <div class="info-row">
                <div class="label">Name</div>
                <div class="value">${safe.guardianName}</div>
              </div>
              <div class="info-row">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${safe.guardianEmail}">${safe.guardianEmail}</a></div>
              </div>
              ${safe.guardianPhone ? `
              <div class="info-row">
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${safe.guardianPhone}">${safe.guardianPhone}</a></div>
              </div>
              ` : ''}
              
              <div class="info-row" style="margin-top: 25px;">
                <div class="label">Plan Type</div>
                <div class="value">${safe.planType}</div>
              </div>
              
              <div class="info-row">
                <div class="label">Submitted At</div>
                <div class="value">${safe.submittedAt}</div>
              </div>
              
              <p style="margin-top: 25px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/admin/enrollments" class="button">
                  Review Enrollment
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

// Send notification to all location members when a new community post is created
export async function sendCommunityPostNotification(data: {
  threadId: string;
  threadTitle: string;
  authorName: string;
  authorEmail: string;
  locationId: string;
  locationSlug: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log('[Email] No RESEND_API_KEY configured. Community notification skipped.');
    return { success: false, reason: 'no_api_key' };
  }

  // Import supabaseAdmin dynamically to avoid circular dependency
  const { supabaseAdmin } = await import('@/lib/supabase');

  // Get location name
  const { data: location } = await supabaseAdmin
    .from('locations')
    .select('name')
    .eq('id', data.locationId)
    .single();

  const locationName = location?.name || 'your location';

  // Get all members at this location
  const { data: members } = await supabaseAdmin
    .from('location_members')
    .select('user_id')
    .eq('location_id', data.locationId);

  if (!members || members.length === 0) {
    console.log('[Email] No members found for location, skipping notification');
    return { success: true, reason: 'no_members' };
  }

  // Get user emails for all members (excluding the author)
  const userIds = members.map(m => m.user_id);
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('email')
    .in('id', userIds)
    .neq('email', data.authorEmail);

  if (!users || users.length === 0) {
    console.log('[Email] No member emails found, skipping notification');
    return { success: true, reason: 'no_emails' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const threadUrl = `${baseUrl}/community/${data.locationSlug}/thread/${data.threadId}`;

  // Send to all members
  const results = await Promise.all(
    users.map(async (user) => {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: user.email,
            subject: `New Post in ${locationName}: ${data.threadTitle}`,
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
                    .thread-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2EC4B6; margin: 20px 0; }
                    .button { display: inline-block; background: #2EC4B6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>New Community Post</h1>
                    </div>
                    <div class="content">
                      <p>Hi there!</p>
                      <p><strong>${data.authorName}</strong> just posted in the <strong>${locationName}</strong> community:</p>
                      <div class="thread-box">
                        <h3 style="margin: 0 0 10px 0; color: #1F2A44;">${data.threadTitle}</h3>
                      </div>
                      <p style="margin-top: 20px;">
                        <a href="${threadUrl}" class="button">
                          View Post
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
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`[Email] Failed to send to ${user.email}:`, errorData);
          return { success: false, email: user.email, error: errorData };
        }

        const result = await response.json();
        console.log(`[Email] Community notification sent to ${user.email}:`, result.id);
        return { success: true, email: user.email, id: result.id };
      } catch (err) {
        console.error(`[Email] Error sending to ${user.email}:`, err);
        return { success: false, email: user.email, error: err };
      }
    })
  );

  const successCount = results.filter(r => r.success).length;
  console.log(`[Email] Community notification sent to ${successCount}/${users.length} members`);
  return { success: successCount > 0, results };
}
