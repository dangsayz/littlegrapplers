import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification, createContactFormEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { firstName, lastName, email, phone, hearAbout, message } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !hearAbout || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
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
