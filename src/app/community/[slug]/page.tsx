'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MessageCircle, Plus, ArrowRight, ArrowLeft, Pin, Clock, User, AlertCircle, MapPin, Users, UserPlus, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

/**
 * Motion Design System Tokens
 * Following MOTION-SYSTEM.md guidelines
 */
const MOTION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
};

/**
 * Location-specific color themes
 */
const LOCATION_THEMES: Record<string, { primary: string; primaryRgb: string; gradient: string }> = {
  'lionheart-central-church': {
    primary: '#2EC4B6', // Teal Blue
    primaryRgb: '46, 196, 182',
    gradient: 'from-[#2EC4B6]/20 via-foreground to-foreground',
  },
  'lionheart-first-baptist-plano': {
    primary: '#8FE3CF', // Soft Sky Blue
    primaryRgb: '143, 227, 207',
    gradient: 'from-[#8FE3CF]/20 via-foreground to-foreground',
  },
  'pinnacle-montessori': {
    primary: '#F7931E', // Warm Orange
    primaryRgb: '247, 147, 30',
    gradient: 'from-[#F7931E]/20 via-foreground to-foreground',
  },
};

const DEFAULT_THEME = {
  primary: '#2EC4B6',
  primaryRgb: '46, 196, 182',
  gradient: 'from-brand/20 via-foreground to-foreground',
};

function getLocationTheme(slug: string) {
  return LOCATION_THEMES[slug] || DEFAULT_THEME;
}

interface Location {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  replyCount: number;
  author: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export default function CommunityPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [isRequestingMembership, setIsRequestingMembership] = useState(false);

  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'there';
  const theme = getLocationTheme(slug);

  // Check if already verified
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await fetch(`/api/locations/${slug}/verify-pin`);
        const data = await res.json();
        setIsVerified(data.verified);
        
        if (data.verified) {
          fetchLocationData();
        }
      } catch {
        setIsVerified(false);
      }
    };

    checkVerification();
  }, [slug]);

  const fetchLocationData = async () => {
    try {
      // Fetch location info
      const locRes = await fetch(`/api/locations/${slug}`);
      if (locRes.ok) {
        const locData = await locRes.json();
        setLocation(locData);
      }

      // Fetch threads from new Supabase-based API
      const threadsRes = await fetch(`/api/community/discussions?locationSlug=${slug}`);
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setThreads(threadsData.threads || []);
      }

      // Fetch members
      const membersRes = await fetch(`/api/locations/${slug}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }

      // Check membership status
      const requestsRes = await fetch('/api/membership/request');
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        const locationRequest = requestsData.requests?.find(
          (r: { locationName: string; status: string }) => r.locationName === location?.name
        );
        if (locationRequest) {
          setMembershipStatus(locationRequest.status === 'approved' ? 'approved' : 'pending');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleRequestMembership = async () => {
    if (!location) return;
    setIsRequestingMembership(true);
    try {
      const res = await fetch('/api/membership/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: location.id }),
      });
      if (res.ok) {
        setMembershipStatus('pending');
      }
    } catch (err) {
      console.error('Error requesting membership:', err);
    } finally {
      setIsRequestingMembership(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/locations/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsVerified(true);
        fetchLocationData();
      } else {
        setError(data.error || 'Invalid PIN');
      }
    } catch {
      setError('Failed to verify PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-foreground text-background flex items-center justify-center">
        <div className="animate-pulse text-background/60">Loading...</div>
      </div>
    );
  }

  // PIN verification screen with Motion System animations
  // Purpose: REVEAL (lock icon), GUIDE (form interaction), REWARD (success transition)
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-foreground text-background overflow-hidden">
        <section className="relative min-h-screen flex items-center justify-center py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }} />
          
          <Container className="relative z-10">
            <motion.div 
              className="max-w-md mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION.slow, ease: MOTION.easeOutExpo }}
            >
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: MOTION.normal }}
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="absolute top-8 left-8 flex items-center gap-2 text-background/60 hover:text-background transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>
              
              {/* Lock icon - Purpose: REVEAL */}
              <motion.div 
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand/20 mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.1 
                }}
              >
                <Lock className="h-10 w-10 text-brand" />
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-3xl md:text-4xl font-display font-black"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: MOTION.normal, ease: MOTION.easeOutExpo }}
              >
                Community <span className="font-serif italic font-normal text-brand">Access</span>
              </motion.h1>
              <motion.p 
                className="mt-4 text-background/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: MOTION.normal }}
              >
                Enter the PIN provided by your location to access the community discussion board.
              </motion.p>

              {/* Form - Purpose: GUIDE */}
              <motion.form 
                onSubmit={handleVerifyPin} 
                className="mt-8 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: MOTION.normal, ease: MOTION.easeOutExpo }}
              >
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest bg-background/10 border-background/20 text-background placeholder:text-background/40 focus:ring-brand focus:border-brand"
                  maxLength={6}
                  autoFocus
                />
                
                {/* Error message with animation */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: MOTION.fast }}
                      className="flex items-center justify-center gap-2 text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-brand hover:bg-brand/90 text-white h-12"
                  disabled={isLoading || pin.length < 4}
                >
                  {isLoading ? 'Verifying...' : 'Enter Community'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.form>

              <motion.p 
                className="mt-8 text-sm text-background/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: MOTION.normal }}
              >
                Don&apos;t have a PIN? Contact your location administrator.
              </motion.p>
            </motion.div>
          </Container>
        </section>
      </div>
    );
  }

  // Community page (verified)
  return (
    <div className="min-h-screen bg-foreground text-background overflow-hidden">
      {/* Hero */}
      <section className="relative py-24 md:py-32">
        <div 
          className="absolute inset-0 bg-gradient-to-br via-foreground to-foreground" 
          style={{ background: `linear-gradient(to bottom right, rgba(${theme.primaryRgb}, 0.2), var(--foreground), var(--foreground))` }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          {/* Breadcrumb Navigation */}
          <FadeIn direction="up" className="mb-8">
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                href="/" 
                className="flex items-center gap-1 text-background/50 hover:text-brand transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-background/30" />
              <span className="text-background/50">Community</span>
              <ChevronRight className="h-4 w-4 text-background/30" />
              <span className="text-background font-medium">{location?.name || 'Loading...'}</span>
            </nav>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Left: Welcome Message */}
            <FadeIn direction="up" className="lg:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-background/40 mb-4">
                Community
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight">
                Hello, <span className="font-serif italic font-normal" style={{ color: theme.primary }}>{userName}!</span>
              </h1>
              <p className="mt-4 text-2xl text-background/80 font-semibold">
                {location?.name || 'Community'}
              </p>
              <p className="mt-2 text-lg text-background/60">
                Connect with other parents and share experiences.
              </p>
              {location && (
                <div 
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                  style={{ backgroundColor: `rgba(${theme.primaryRgb}, 0.2)`, borderColor: `rgba(${theme.primaryRgb}, 0.3)` }}
                >
                  <MapPin className="h-4 w-4" style={{ color: theme.primary }} />
                  <span className="text-sm font-medium" style={{ color: theme.primary }}>{location.name}</span>
                </div>
              )}
            </FadeIn>

            {/* Right: Members Section */}
            <FadeIn direction="up" delay={0.1} className="lg:col-span-1">
              <div className="rounded-xl border border-background/10 bg-background/5 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" style={{ color: theme.primary }} />
                    <h3 className="text-lg font-semibold">Members</h3>
                  </div>
                  <span className="text-sm text-background/40">{members.length} total</span>
                </div>

                <div className="space-y-3">
                  {/* Real Members from API */}
                  {members.length === 0 ? (
                    <p className="text-sm text-background/40 text-center py-4">No members yet</p>
                  ) : (
                    <>
                      {members.slice(0, 4).map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/5 transition-colors">
                          <div 
                            className="h-9 w-9 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `rgba(${theme.primaryRgb}, 0.2)` }}
                          >
                            <span className="text-xs font-bold" style={{ color: theme.primary }}>{member.initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-background/40 capitalize">{member.role}</p>
                          </div>
                        </div>
                      ))}

                      {/* Show more members indicator */}
                      {members.length > 4 && (
                        <div className="flex items-center gap-3 p-2 text-background/40">
                          <div className="h-9 w-9 rounded-full bg-background/10 flex items-center justify-center">
                            <span className="text-xs font-medium">+{members.length - 4}</span>
                          </div>
                          <p className="text-sm">more members</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Request to Join / Membership Status */}
                  {membershipStatus === 'pending' ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/10 border border-background/20">
                      <Clock className="h-4 w-4 text-background/50" />
                      <p className="text-sm text-background/50">Request pending approval</p>
                    </div>
                  ) : membershipStatus === 'approved' ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: `rgba(${theme.primaryRgb}, 0.1)`, borderColor: `rgba(${theme.primaryRgb}, 0.3)` }}>
                      <Users className="h-4 w-4" style={{ color: theme.primary }} />
                      <p className="text-sm" style={{ color: theme.primary }}>You are a member</p>
                    </div>
                  ) : (
                    <button 
                      onClick={handleRequestMembership}
                      disabled={isRequestingMembership}
                      className="w-full flex items-center gap-3 p-2 rounded-lg border border-dashed border-background/20 hover:border-brand/50 hover:bg-brand/5 transition-colors group disabled:opacity-50"
                    >
                      <div className="h-9 w-9 rounded-full border border-dashed border-background/30 group-hover:border-brand/50 flex items-center justify-center transition-colors">
                        <UserPlus className="h-4 w-4 text-background/40 group-hover:text-brand transition-colors" />
                      </div>
                      <p className="text-sm text-background/40 group-hover:text-brand transition-colors">
                        {isRequestingMembership ? 'Requesting...' : 'Request to join'}
                      </p>
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Discussion Threads */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Discussions</h2>
            <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
              <Link href={`/community/${slug}/new` as string}>
                <Plus className="h-4 w-4 mr-2" />
                New Thread
              </Link>
            </Button>
          </div>

          {threads.length === 0 ? (
            <FadeIn direction="up">
              <div className="text-center py-16 rounded-lg border border-background/10 bg-background/5">
                <MessageCircle className="h-12 w-12 text-background/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
                <p className="text-background/60 mb-6">Be the first to start a conversation!</p>
                <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
                  <Link href={`/community/${slug}/new` as string}>
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Discussion
                  </Link>
                </Button>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="space-y-4" staggerDelay={0.05}>
              {threads.map((thread) => (
                <StaggerItem key={thread.id}>
                  <Link href={`/community/${slug}/thread/${thread.id}` as string}>
                    <div className="group p-6 rounded-lg border border-background/10 bg-background/5 hover:bg-background/10 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {thread.isPinned && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: theme.primary }}>
                                <Pin className="h-3 w-3" />
                                Pinned
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold transition-colors" style={{ '--hover-color': theme.primary } as React.CSSProperties}>
                            {thread.title}
                          </h3>
                          <p className="mt-2 text-background/60 line-clamp-2">
                            {thread.content}
                          </p>
                          <div className="mt-4 flex items-center gap-4 text-sm text-background/40">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {thread.author.email.split('@')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(thread.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {thread.replyCount || 0} replies
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-background/30 transition-colors group-hover:opacity-100" style={{ color: theme.primary }} />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </Container>
      </section>
    </div>
  );
}
