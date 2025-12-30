import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification, createContactFormEmail } from '@/lib/email';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  contactFormSchema, 
  validateData, 
  isRateLimited, 
  getClientIdentifier,
  checkHoneypot,
  sanitizeString 
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = isRateLimited(clientId, 'contact');
    
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Check for bot/spam via honeypot
    if (checkHoneypot(body)) {
      // Silently reject spam
      return NextResponse.json({ success: true, message: 'Message received' });
    }
    
    // Validate and sanitize all input
    const validation = validateData(contactFormSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { firstName, lastName, email, phone, hearAbout, message } = validation.data;

    // Store in database for admin inbox
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: sanitizeString(`${firstName} ${lastName}`),
        email,
        phone,
        reason: hearAbout,
        message,
        is_read: false,
      });

    if (dbError) {
      console.error('[Contact] Database error:', dbError);
      // Continue even if DB fails - still try to send email
    }
    
    // Create and send the email notification
    const emailNotification = createContactFormEmail({
      firstName,
      lastName,
      email,
      phone,
      hearAbout,
      message,
    });
    
    const result = await sendAdminNotification(emailNotification);
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    } else {
      // Still return success to user even if email fails (we log it)
      console.log('[Contact] Email sending failed but returning success to user');
      return NextResponse.json({ success: true, message: 'Message received' });
    }
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
