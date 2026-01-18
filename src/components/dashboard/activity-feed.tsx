'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Video, UserPlus, Clock, MapPin, Loader2, Megaphone, Bell } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'new_student' | 'new_post' | 'new_media' | 'location_update';
  title: string;
  description: string;
  timestamp: string;
  locationName?: string;
  locationSlug?: string;
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

function getIconForType(type: FeedItem['type']) {
  switch (type) {
    case 'new_post':
      return { icon: MessageSquare, bg: 'bg-sky-50', color: 'text-sky-600' };
    case 'new_media':
      return { icon: Video, bg: 'bg-indigo-50', color: 'text-indigo-600' };
    case 'new_student':
      return { icon: UserPlus, bg: 'bg-emerald-50', color: 'text-emerald-600' };
    default:
      return { icon: MapPin, bg: 'bg-slate-100', color: 'text-slate-600' };
  }
}

export function ActivityFeed() {
  const [activeTab, setActiveTab] = useState<'activity' | 'announcements'>('activity');
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/dashboard/feed');
        if (res.ok) {
          const data = await res.json();
          setFeed(data.feed || []);
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100/80 rounded-lg mb-3">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'activity' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="h-3 w-3" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'announcements' 
              ? 'bg-white text-slate-800 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Megaphone className="h-3 w-3" />
          Updates
        </button>
      </div>

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : feed.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">No recent activity</p>
              <p className="text-slate-400 text-xs mt-1">Check back soon for updates</p>
            </div>
          ) : (
            <div className="space-y-1">
              {feed.slice(0, 8).map((item) => {
                const { icon: Icon, bg, color } = getIconForType(item.type);
                const href = item.locationSlug ? `/community/${item.locationSlug}` : '#';
                
                return (
                  <Link 
                    key={item.id} 
                    href={href}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className={`h-9 w-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {getTimeAgo(item.timestamp)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Announcements Tab - Coming Soon */}
      {activeTab === 'announcements' && (
        <div className="text-center py-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
            <Megaphone className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">Coach Announcements</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-[200px] mx-auto">
            Send instant updates to all parents across your locations
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
            <Bell className="h-3 w-3 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Coming Soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
