import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Inbox, Search, Mail, Phone, CheckCircle, Circle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch contact submissions
  let query = supabaseAdmin
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%,message.ilike.%${searchParams.search}%`);
  }

  if (searchParams.status === 'unread') {
    query = query.eq('is_read', false);
  } else if (searchParams.status === 'read') {
    query = query.eq('is_read', true);
  }

  const { data: contacts, error } = await query.limit(100);

  // Get unread count
  const { count: unreadCount } = await supabaseAdmin
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <Inbox className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Contact Inbox
          </h1>
          <p className="text-muted-foreground">
            View and respond to contact form submissions
          </p>
        </div>
        {(unreadCount ?? 0) > 0 && (
          <Badge className="ml-auto bg-orange-500">{unreadCount} unread</Badge>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name, email, or message..."
                defaultValue={searchParams.search || ''}
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={searchParams.status || 'all'}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading contacts: {error.message}</p>
            </CardContent>
          </Card>
        ) : !contacts || contacts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No contact submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            reason: string;
            message: string;
            is_read: boolean;
            created_at: string;
          }) => (
            <Card 
              key={contact.id} 
              className={contact.is_read ? '' : 'border-orange-200 bg-orange-50/30'}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {contact.is_read ? (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Circle className="h-5 w-5 text-orange-500 fill-orange-500" />
                    )}
                    <div>
                      <CardTitle className="text-base">{contact.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </span>
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{contact.reason}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contact.message}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${contact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </a>
                  </Button>
                  {!contact.is_read && (
                    <form action={`/api/admin/contacts/${contact.id}/mark-read`} method="POST">
                      <Button size="sm" variant="ghost" type="submit">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
