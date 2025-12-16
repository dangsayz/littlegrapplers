import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabaseAdmin } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComposeEmail } from './compose-email';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminEmailPage() {
  const user = await currentUser();
  
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  // Fetch email campaigns
  const { data: campaigns } = await supabaseAdmin
    .from('email_campaigns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch email templates
  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true });

  // Fetch recent email logs
  const { data: recentEmails } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  // Stats
  const { count: totalSent } = await supabaseAdmin
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent');

  const { count: totalCampaigns } = await supabaseAdmin
    .from('email_campaigns')
    .select('*', { count: 'exact', head: true });

  // Fetch users for recipient list
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name')
    .eq('status', 'active')
    .order('email', { ascending: true });

  // Fetch locations for filtering
  const { data: locations } = await supabaseAdmin
    .from('locations')
    .select('id, name, slug')
    .eq('is_active', true);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'draft':
        return <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case 'sending':
        return <Badge className="bg-yellow-500"><Send className="h-3 w-3 mr-1" />Sending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
            <Mail className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Email Center
            </h1>
            <p className="text-muted-foreground">
              Send emails and manage campaigns
            </p>
          </div>
        </div>
        <ComposeEmail 
          templates={templates || []} 
          users={users || []}
          locations={locations || []}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalSent || 0}</div>
            <p className="text-sm text-muted-foreground">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCampaigns || 0}</div>
            <p className="text-sm text-muted-foreground">Campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Send History</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {(campaigns || []).map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {campaign.subject}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{campaign.total_recipients} recipients</span>
                  <span>{campaign.sent_count} sent</span>
                  <span>{campaign.open_count} opened</span>
                  <span className="ml-auto">{formatDate(campaign.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!campaigns || campaigns.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No campaigns yet</p>
                <p className="text-sm mt-2">Create your first email campaign</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {(templates || []).map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {template.category}
                      </CardDescription>
                    </div>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Subject:</strong> {template.subject}
                  </p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((v: string) => (
                        <Badge key={v} variant="outline" className="text-xs">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!templates || templates.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No templates yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {(recentEmails || []).map((email) => (
                  <div key={email.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">{email.recipient_email}</p>
                      <p className="text-xs text-muted-foreground">{email.subject}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(email.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(email.sent_at || email.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(!recentEmails || recentEmails.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No emails sent yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
