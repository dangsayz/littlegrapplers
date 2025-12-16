import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { 
  Settings, 
  MapPin, 
  MessageSquare, 
  Users, 
  FileText,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'dangzr1@gmail.com';

export default async function AdminPage() {
  const user = await currentUser();
  
  // Check if user is the admin
  if (!user || user.emailAddresses[0]?.emailAddress !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  const adminSections = [
    {
      title: 'Locations',
      description: 'Manage location PINs and settings',
      icon: MapPin,
      href: '/dashboard/admin/locations',
      color: 'text-blue-500',
    },
    {
      title: 'Community',
      description: 'Moderate discussions and threads',
      icon: MessageSquare,
      href: '/dashboard/admin/community',
      color: 'text-green-500',
    },
    {
      title: 'Users',
      description: 'View and manage registered users',
      icon: Users,
      href: '/dashboard/admin/users',
      color: 'text-purple-500',
    },
    {
      title: 'Content',
      description: 'Edit website content blocks',
      icon: FileText,
      href: '/dashboard/admin/content',
      color: 'text-orange-500',
    },
    {
      title: 'Settings',
      description: 'Global site settings',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'text-gray-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          <Shield className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage your Little Grapplers platform
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Active Threads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Registered Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-sm text-muted-foreground">Contact Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminSections.map((section) => (
          <Card key={section.title} className="hover:border-brand/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={section.href}>
                  Manage
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
