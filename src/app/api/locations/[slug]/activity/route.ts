import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface ActivityItem {
  id: string;
  type: 'new_member' | 'new_video' | 'new_image' | 'comment' | 'birthday' | 'student_of_month';
  name: string;
  subtitle?: string;
  date: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First get the location
    const { data: location, error: locationError } = await supabaseAdmin
      .from('locations')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (locationError || !location) {
      return NextResponse.json({ activity: [] });
    }

    const activities: ActivityItem[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. New members (recent enrollments)
    const { data: enrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, submitted_at')
      .eq('location_id', location.id)
      .in('status', ['approved', 'active'])
      .gte('submitted_at', thirtyDaysAgo.toISOString())
      .order('submitted_at', { ascending: false })
      .limit(5);

    (enrollments || []).forEach(e => {
      activities.push({
        id: `member-${e.id}`,
        type: 'new_member',
        name: `${e.child_first_name} ${e.child_last_name}`,
        subtitle: 'Joined the community',
        date: e.submitted_at,
      });
    });

    // 2. New media (videos/images posted)
    const { data: mediaItems } = await supabaseAdmin
      .from('location_media')
      .select('id, title, file_type, created_at')
      .eq('location_id', location.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    (mediaItems || []).forEach(m => {
      activities.push({
        id: `media-${m.id}`,
        type: m.file_type === 'video' ? 'new_video' : 'new_image',
        name: m.title || (m.file_type === 'video' ? 'New video' : 'New image'),
        subtitle: m.file_type === 'video' ? 'New training video posted' : 'New photo added',
        date: m.created_at,
      });
    });

    // 3. Recent discussion replies/comments
    const { data: discussions } = await supabaseAdmin
      .from('community_discussions')
      .select('id')
      .eq('location_id', location.id);

    if (discussions && discussions.length > 0) {
      const discussionIds = discussions.map(d => d.id);
      const { data: replies } = await supabaseAdmin
        .from('discussion_replies')
        .select('id, content, created_at, author_email')
        .in('discussion_id', discussionIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      (replies || []).forEach(r => {
        const authorName = r.author_email?.split('@')[0] || 'Someone';
        activities.push({
          id: `comment-${r.id}`,
          type: 'comment',
          name: authorName,
          subtitle: r.content?.slice(0, 50) + (r.content?.length > 50 ? '...' : ''),
          date: r.created_at,
        });
      });
    }

    // 4. Birthdays (students with birthdays in the next 7 days or past 3 days)
    const today = new Date();
    const { data: birthdayEnrollments } = await supabaseAdmin
      .from('enrollments')
      .select('id, child_first_name, child_last_name, child_date_of_birth')
      .eq('location_id', location.id)
      .in('status', ['approved', 'active'])
      .not('child_date_of_birth', 'is', null);

    (birthdayEnrollments || []).forEach(e => {
      if (!e.child_date_of_birth) return;
      const dob = new Date(e.child_date_of_birth);
      const birthdayThisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const diffDays = Math.floor((birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show if birthday is within -3 to +7 days
      if (diffDays >= -3 && diffDays <= 7) {
        let subtitle = 'Birthday today!';
        if (diffDays < 0) subtitle = `Birthday was ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
        else if (diffDays > 0) subtitle = `Birthday in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        
        activities.push({
          id: `birthday-${e.id}`,
          type: 'birthday',
          name: `${e.child_first_name} ${e.child_last_name}`,
          subtitle,
          date: birthdayThisYear.toISOString(),
        });
      }
    });

    // 5. Student of the month
    const { data: sotm } = await supabaseAdmin
      .from('student_of_month')
      .select('id, student_name, created_at')
      .eq('location_id', location.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    (sotm || []).forEach(s => {
      activities.push({
        id: `sotm-${s.id}`,
        type: 'student_of_month',
        name: s.student_name,
        subtitle: 'Named Student of the Month',
        date: s.created_at,
      });
    });

    // Sort all activities by date (newest first) and take top 5
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const topActivities = activities.slice(0, 5);

    return NextResponse.json({ activity: topActivities });
  } catch (error) {
    console.error('Error in activity API:', error);
    return NextResponse.json({ activity: [] });
  }
}
