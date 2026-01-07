'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MessageCircle, Plus, ArrowRight, ArrowLeft, Pin, Clock, User, AlertCircle, MapPin, Users, Home, ChevronRight, Check, DollarSign, Play, Image as ImageIcon } from 'lucide-react';
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
 * Location-specific texture themes
 */
const LOCATION_THEMES: Record<string, {
  texture: string;
  textureOpacity: string;
}> = {
  'lionheart-central-church': {
    texture: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
    textureOpacity: '1',
  },
  'lionheart-first-baptist-plano': {
    texture: 'linear-gradient(135deg, rgba(0,0,0,0.02) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.02) 75%, transparent 75%, transparent)',
    textureOpacity: '1',
  },
  'pinnacle-montessori': {
    texture: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.015) 0%, transparent 70%)',
    textureOpacity: '1',
  },
};

const DEFAULT_THEME = {
  texture: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
  textureOpacity: '1',
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

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: 'video' | 'image';
  file_size: number;
  created_at: string;
}

interface MediaComment {
  id: string;
  media_id: string;
  user_email: string;
  user_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  replies?: MediaComment[];
}

// Nested Comment Component
function CommentThread({
  comment,
  userEmail,
  formatTime,
  onReply,
  onEdit,
  onDelete,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onCancelReply,
  editingComment,
  editContent,
  setEditContent,
  onSubmitEdit,
  onCancelEdit,
  depth,
}: {
  comment: MediaComment;
  userEmail: string;
  formatTime: (date: string) => string;
  onReply: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  editingComment: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  onSubmitEdit: (id: string) => void;
  onCancelEdit: () => void;
  depth: number;
}) {
  const isOwner = userEmail === comment.user_email;
  const isEditing = editingComment === comment.id;
  const isReplying = replyingTo === comment.id;

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-gray-300 pl-4' : ''}>
      <div className="bg-gray-100 rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {comment.user_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-gray-900 text-sm font-semibold">{comment.user_name}</span>
            <span className="text-gray-500 text-xs">{formatTime(comment.created_at)}</span>
          </div>
          
          {/* Actions for owner */}
          {isOwner && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(comment.id, comment.content)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="text-red-400 hover:text-red-500 text-xs"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Content or Edit Input */}
        {isEditing ? (
          <div className="pl-9 space-y-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:outline-none focus:border-gray-300"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onSubmitEdit(comment.id)}
                className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-lg"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 text-gray-500 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 text-sm pl-10 leading-relaxed">{comment.content}</p>
        )}

        {/* Reply Button */}
        {!isEditing && !isReplying && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-3 pl-10 text-teal-600 hover:text-teal-700 text-xs font-medium"
          >
            Reply
          </button>
        )}

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-3 pl-9 space-y-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onSubmitReply}
                disabled={!replyContent.trim()}
                className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-lg disabled:opacity-50"
              >
                Reply
              </button>
              <button
                onClick={onCancelReply}
                className="px-3 py-1 text-gray-500 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              userEmail={userEmail}
              formatTime={formatTime}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              editingComment={editingComment}
              editContent={editContent}
              setEditContent={setEditContent}
              onSubmitEdit={onSubmitEdit}
              onCancelEdit={onCancelEdit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'image'>('all');
  const [visibleMediaCount, setVisibleMediaCount] = useState(8);
  const [mediaComments, setMediaComments] = useState<MediaComment[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';

  const displayUserName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'there';
  const theme = getLocationTheme(slug);

  // Modern relative time formatter
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return date.toLocaleDateString();
  };

  // Nest comments by parent_id
  const nestComments = (comments: MediaComment[]): MediaComment[] => {
    const commentMap = new Map<string, MediaComment>();
    const rootComments: MediaComment[] = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const current = commentMap.get(comment.id)!;
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(current);
        }
      } else {
        rootComments.push(current);
      }
    });

    return rootComments;
  };

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
      let locationData = null;
      if (locRes.ok) {
        locationData = await locRes.json();
        setLocation(locationData);
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

      // Fetch media for this location
      if (locationData?.id) {
        const mediaRes = await fetch(`/api/media?locationId=${locationData.id}`);
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMedia(mediaData.media || []);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Fetch comments when preview media changes
  useEffect(() => {
    if (previewMedia) {
      fetchMediaComments(previewMedia.id);
    } else {
      setMediaComments([]);
      setNewQuestion('');
    }
  }, [previewMedia]);

  const fetchMediaComments = async (mediaId: string) => {
    try {
      const locationId = location?.id;
      const url = locationId 
        ? `/api/media/${mediaId}/comments?locationId=${locationId}`
        : `/api/media/${mediaId}/comments`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMediaComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleSubmitQuestion = async (parentId?: string) => {
    const content = parentId ? replyContent : newQuestion;
    if (!previewMedia || !content.trim() || !user) return;
    
    setIsSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/media/${previewMedia.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId, locationId: location?.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setMediaComments(prev => [data.comment, ...prev]);
        setNewQuestion('');
        setReplyContent('');
        setReplyingTo(null);
      }
    } catch (err) {
      console.error('Error submitting question:', err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const res = await fetch(`/api/media/${previewMedia?.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (res.ok) {
        setMediaComments(prev => prev.map(c => 
          c.id === commentId ? { ...c, content: editContent.trim() } : c
        ));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      const res = await fetch(`/api/media/${previewMedia?.id}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMediaComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
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
      <div className="min-h-screen bg-gradient-to-br from-[#E8F8F5] via-[#F0FFFD] to-white flex items-center justify-center">
        <div className="animate-pulse text-[#1F2A44]/60">Loading...</div>
      </div>
    );
  }

  // PIN verification screen with Motion System animations
  // Purpose: REVEAL (lock icon), GUIDE (form interaction), REWARD (success transition)
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Subtle texture overlay */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{ 
            backgroundImage: theme.texture,
            backgroundSize: '20px 20px',
            opacity: theme.textureOpacity,
          }}
        />
        <section className="relative min-h-screen flex items-center justify-center py-32">
          
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
                className="absolute top-8 left-8 flex items-center gap-2 text-[#1F2A44]/60 hover:text-[#1F2A44] transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Back</span>
              </motion.button>
              
              {/* Lock icon - Purpose: REVEAL */}
              <motion.div 
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-8 shadow-lg bg-gray-100"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.1 
                }}
              >
                <Lock className="h-10 w-10 text-gray-600" />
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-3xl md:text-4xl font-display font-black text-[#1F2A44]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: MOTION.normal, ease: MOTION.easeOutExpo }}
              >
                Community <span className="font-serif italic font-normal text-gray-600">Access</span>
              </motion.h1>
              <motion.p 
                className="mt-4 text-[#1F2A44]/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: MOTION.normal }}
              >
                Enter the PIN provided by your location to access the community discussion board.
              </motion.p>

              {/* Form - Purpose: GUIDE */}
              <motion.form 
                onSubmit={handleVerifyPin} 
                className="mt-8 space-y-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: MOTION.normal, ease: MOTION.easeOutExpo }}
              >
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-transparent h-14"
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
                  className="w-full bg-gray-900 text-white h-14 text-lg font-semibold shadow-lg hover:bg-gray-800"
                  disabled={isLoading || pin.length < 4}
                >
                  {isLoading ? 'Verifying...' : 'Enter Community'}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.form>

              <motion.p 
                className="mt-8 text-sm text-[#1F2A44]/40"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <Container className="py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-gray-400">Community</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-gray-900 font-medium">{location?.name || 'Loading...'}</span>
          </nav>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-teal-500">{displayUserName}</span>
              </h1>
              <p className="mt-2 text-gray-500">
                {location?.name} Community
              </p>
            </div>
            
            {/* Location Badge */}
            {location && (
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-teal-700">{location.name}</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container className="py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{members.length}</p>
                <p className="text-xs sm:text-sm text-gray-500">Members</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{threads.length}</p>
                <p className="text-xs sm:text-sm text-gray-500">Discussions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Play className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{media.length}</p>
                <p className="text-xs sm:text-sm text-gray-500">Media</p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Media Gallery Section */}
      {media.length > 0 && (
        <section className="py-8">
          <Container>
            {/* Header with filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Media Gallery</h2>
                  <p className="text-sm text-gray-500 mt-1">Videos and images from your instructor</p>
                </div>
                
                {/* Filter tabs */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
                  {(['all', 'video', 'image'] as const).map((type) => {
                    const count = type === 'all' ? media.length : media.filter(m => m.file_type === type).length;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setMediaFilter(type);
                          setVisibleMediaCount(8);
                        }}
                        className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-colors active:scale-[0.98] ${
                          mediaFilter === type
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {type === 'all' ? 'All' : type === 'video' ? 'Videos' : 'Images'}
                        <span className="ml-1 sm:ml-1.5 text-xs opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Media Grid */}
            {(() => {
              const filteredMedia = mediaFilter === 'all' 
                ? media 
                : media.filter(m => m.file_type === mediaFilter);
              const visibleMedia = filteredMedia.slice(0, visibleMediaCount);
              const hasMore = filteredMedia.length > visibleMediaCount;

              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleMedia.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPreviewMedia(item)}
                        className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-300 transition-colors"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          {item.file_type === 'video' ? (
                            <>
                              <video
                                src={item.file_url}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                                  <Play className="h-5 w-5 text-gray-800 ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute top-2 left-2">
                            <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              item.file_type === 'video' 
                                ? 'bg-red-500/90 text-white' 
                                : 'bg-blue-500/90 text-white'
                            }`}>
                              {item.file_type === 'video' ? 'Video' : 'Image'}
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => setVisibleMediaCount(prev => prev + 8)}
                        className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Load More ({filteredMedia.length - visibleMediaCount} remaining)
                      </button>
                    </div>
                  )}

                  {/* Show count */}
                  <p className="mt-6 text-center text-sm text-gray-400">
                    Showing {visibleMedia.length} of {filteredMedia.length} items
                  </p>
                </>
              );
            })()}
          </Container>
        </section>
      )}

      {/* Media Preview Modal - White Background */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          onClick={() => setPreviewMedia(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewMedia(null)}
            className="fixed top-6 right-6 z-10 h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <span className="text-gray-600 text-xl font-light">×</span>
          </button>

          <div 
            className="min-h-screen flex flex-col items-center py-12 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video/Image */}
            <div className="w-full max-w-4xl">
              {previewMedia.file_type === 'video' ? (
                <video
                  src={previewMedia.file_url}
                  controls
                  autoPlay
                  className="w-full"
                  style={{ maxHeight: '60vh' }}
                />
              ) : (
                <img
                  src={previewMedia.file_url}
                  alt={previewMedia.title}
                  className="w-full object-contain"
                  style={{ maxHeight: '60vh' }}
                />
              )}
            </div>

            {/* Title & Description */}
            <div className="mt-6 text-center max-w-2xl">
              <h3 className="text-gray-900 text-xl font-semibold tracking-tight">{previewMedia.title}</h3>
              {previewMedia.description && (
                <p className="mt-2 text-gray-500 text-[15px]">{previewMedia.description}</p>
              )}
            </div>

            {/* Questions Section */}
            <div className="mt-10 w-full max-w-2xl">
              <div className="border-t border-gray-200 pt-8">
                <h4 className="text-gray-900 text-sm font-medium mb-4">Questions</h4>
                
                {/* Ask Question Input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                    placeholder="Ask a question about this video..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
                  />
                  <button
                    onClick={() => handleSubmitQuestion()}
                    disabled={!newQuestion.trim() || isSubmittingQuestion}
                    className="px-5 py-3 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingQuestion ? '...' : 'Ask'}
                  </button>
                </div>

                {/* Nested Comments List */}
                {mediaComments.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">No questions yet. Be the first to ask!</p>
                ) : (
                  <div className="space-y-4">
                    {nestComments(mediaComments).map((comment) => (
                      <CommentThread
                        key={comment.id}
                        comment={comment}
                        userEmail={userEmail}
                        formatTime={formatRelativeTime}
                        onReply={(id) => { setReplyingTo(id); setReplyContent(''); }}
                        onEdit={(id, content) => { setEditingComment(id); setEditContent(content); }}
                        onDelete={handleDeleteComment}
                        replyingTo={replyingTo}
                        replyContent={replyContent}
                        setReplyContent={setReplyContent}
                        onSubmitReply={() => handleSubmitQuestion(replyingTo!)}
                        onCancelReply={() => setReplyingTo(null)}
                        editingComment={editingComment}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        onSubmitEdit={handleEditComment}
                        onCancelEdit={() => setEditingComment(null)}
                        depth={0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discussion Threads */}
      <section className="py-8">
        <Container>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Discussions</h2>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                <Link href={`/community/${slug}/new` as Route}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Link>
              </Button>
            </div>

          {threads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-semibold mb-1 text-gray-900">No discussions yet</h3>
              <p className="text-gray-500 mb-4">Be the first to start a conversation!</p>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                <Link href={`/community/${slug}/new` as Route}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start a Discussion
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link 
                  key={thread.id}
                  href={`/community/${slug}/thread/${thread.id}` as Route} 
                  className="block"
                >
                  <div className="group p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {thread.isPinned && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                              <Pin className="h-3 w-3" />
                              Pinned
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {thread.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {thread.content}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
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
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </Container>
      </section>
    </div>
  );
}
