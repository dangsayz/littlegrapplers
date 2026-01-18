'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  X,
  Clock,
  UserPlus,
  MessageSquare,
  User,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  DollarSign,
  CreditCard,
  RefreshCw,
  FileCheck,
  Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MembershipRequest {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  location: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'payment' | 'refund' | 'enrollment' | 'signup' | 'subscription' | 'cancellation';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsClient() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch membership requests
      const reqRes = await fetch('/api/admin/membership-requests?status=pending');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }

      // Fetch notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }

      // Fetch activity feed
      const activityRes = await fetch('/api/admin/activity');
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/membership/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const res = await fetch(`/api/membership/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) {
        setRequests(requests.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="requests" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Membership Requests
          {requests.length > 0 && (
            <Badge variant="destructive" className="ml-1">{requests.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="activity" className="gap-2">
          <Bell className="h-4 w-4" />
          Activity
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground">No pending membership requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-brand" />
                      </div>
                      <div>
                        <p className="font-medium">{request.user.name}</p>
                        <p className="text-sm text-muted-foreground">{request.user.email}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>Wants to join <strong>{request.location.name}</strong></span>
                        </div>
                        {request.message && (
                          <p className="mt-2 text-sm text-muted-foreground italic">
                            &quot;{request.message}&quot;
                          </p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="activity">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-slate-500">
            Recent activity across your platform
          </p>
          <Button variant="ghost" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <Card className="border-slate-200/60">
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No activity yet</h3>
              <p className="text-slate-500">Payments, signups, and events will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => {
              const getActivityStyle = () => {
                switch (activity.type) {
                  case 'payment':
                    return { bg: 'bg-emerald-50', icon: DollarSign, iconColor: 'text-emerald-600' };
                  case 'refund':
                    return { bg: 'bg-orange-50', icon: RefreshCw, iconColor: 'text-orange-600' };
                  case 'enrollment':
                    return { bg: 'bg-sky-50', icon: UserPlus, iconColor: 'text-sky-600' };
                  case 'signup':
                    return { bg: 'bg-slate-100', icon: FileCheck, iconColor: 'text-slate-600' };
                  case 'subscription':
                    return { bg: 'bg-indigo-50', icon: CreditCard, iconColor: 'text-indigo-600' };
                  case 'cancellation':
                    return { bg: 'bg-red-50', icon: Ban, iconColor: 'text-red-500' };
                  default:
                    return { bg: 'bg-slate-100', icon: Bell, iconColor: 'text-slate-600' };
                }
              };
              
              const style = getActivityStyle();
              const Icon = style.icon;
              
              return (
                <div 
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200/60"
                >
                  <div className={`h-10 w-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${style.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{activity.title}</p>
                      {activity.amount && (
                        <span className={`text-sm font-semibold ${activity.type === 'refund' ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {activity.type === 'refund' ? '-' : '+'}${activity.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">{activity.description}</p>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    {getTimeAgo(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
