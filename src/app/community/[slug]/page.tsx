'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Route } from 'next';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, MessageCircle, Plus, ArrowRight, ArrowLeft, Pin, Clock, User, AlertCircle, MapPin, Users, Home, ChevronRight, ChevronLeft, Check, DollarSign, Play, Image as ImageIcon, Award, Cake, Pencil, X, ChevronDown, Trash2, MoreHorizontal, Calendar, Video, Settings, Eye, CreditCard, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, CloudSun } from 'lucide-react';
import { LocationOfflineOverlay } from '@/components/community/location-offline-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from '@/lib/constants';

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
  address?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

interface ThreadMedia {
  id: string;
  url: string;
  type: string;
  name: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  replyCount: number;
  media?: ThreadMedia[];
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
  dateOfBirth?: string;
  joinedAt?: string;
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

interface ThreadReply {
  id: string;
  thread_id: string;
  author_id: string;
  author_email: string;
  content: string;
  created_at: string;
  author?: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Reddit-style thread line colors for different nesting depths
const THREAD_COLORS = [
  'border-[#2EC4B6]', // teal
  'border-[#F7931E]', // orange
  'border-[#FFC857]', // yellow
  'border-[#FF5A5F]', // coral
  'border-[#8FE3CF]', // sky blue
  'border-purple-400',
  'border-pink-400',
];

// Nested Comment Component - Reddit Style
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
  const threadColor = THREAD_COLORS[depth % THREAD_COLORS.length];

  return (
    <div className="group/thread">
      {/* Comment with thread line */}
      <div className={`relative ${depth > 0 ? 'ml-5' : ''}`}>
        {/* Thread line - Reddit style */}
        {depth > 0 && (
          <div 
            className={`absolute left-0 top-0 bottom-0 w-0.5 -ml-3 rounded-full ${threadColor} opacity-40 group-hover/thread:opacity-80 transition-opacity cursor-pointer`}
          />
        )}
        
        {/* Comment content */}
        <div className="py-4">
          {/* Header row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {comment.user_name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-gray-900 text-sm font-semibold">{comment.user_name}</span>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-gray-400 text-xs">{formatTime(comment.created_at)}</span>
            </div>
          </div>

          {/* Content or Edit Input */}
          {isEditing ? (
            <div className="ml-11 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/10 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onSubmitEdit(comment.id)}
                  className="px-4 py-2 bg-[#2EC4B6] text-white text-xs font-semibold rounded-lg hover:bg-[#2EC4B6]/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-[15px] leading-relaxed ml-11">{comment.content}</p>
          )}

          {/* Action buttons - Reddit style */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-3 ml-11">
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-[#2EC4B6] text-xs font-medium transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => onEdit(comment.id, comment.content)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply Input - expanded inline */}
          {isReplying && (
            <div className="mt-4 ml-11 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#2EC4B6] to-[#8FE3CF] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-bold">
                    {userEmail?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.user_name}...`}
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/10 resize-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSubmitReply}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-[#2EC4B6] text-white text-xs font-semibold rounded-lg hover:bg-[#2EC4B6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                    <button
                      onClick={onCancelReply}
                      className="px-4 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies - with increased spacing */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
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

// Inline Composer Component (IG/X style)
function InlineComposer({ 
  locationSlug, 
  userInitials,
  onSuccess 
}: { 
  locationSlug: string; 
  userInitials: string;
  onSuccess: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : Infinity;
      return (isImage || isVideo) && file.size <= maxSize;
    });
    
    if (validFiles.length + mediaFiles.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setIsExpanded(false);
    setTitle('');
    setContent('');
    setError('');
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    // Auto-generate title from first line or first 50 chars of content
    const autoTitle = content.trim().split('\n')[0].slice(0, 50) || 'New Discussion';
    
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationSlug,
          title: autoTitle,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to post');
        return;
      }

      const threadData = await res.json();
      const threadId = threadData.id;

      // Upload media files if any
      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('threadId', threadId);
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
          if (!uploadRes.ok) {
            console.error('Upload failed for file:', file.name);
            setError('Some media files failed to upload');
          }
        }
      }

      resetForm();
      onSuccess();
    } catch {
      setError('Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-text hover:bg-gray-100 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-[#2EC4B6] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{userInitials}</span>
        </div>
        <span className="text-gray-400 text-sm">Start a discussion...</span>
      </div>
    );
  }

  const MAX_CHARS = 500;
  const charsRemaining = MAX_CHARS - content.length;
  const isNearLimit = charsRemaining <= 50;
  const isAtLimit = charsRemaining <= 0;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-full bg-[#2EC4B6] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">{userInitials}</span>
        </div>
        <div className="flex-1">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setContent(e.target.value);
                }
              }}
              placeholder="What's on your mind?"
              rows={3}
              autoFocus
              className={`w-full bg-white border rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 outline-none ring-0 resize-none transition-colors ${
                isAtLimit 
                  ? 'border-red-300 focus:border-red-400' 
                  : 'border-gray-200/60 focus:border-[#2EC4B6]/40'
              }`}
            />
            {/* Character countdown */}
            <div className={`absolute bottom-2 right-3 text-xs font-medium transition-colors ${
              isAtLimit 
                ? 'text-red-500' 
                : isNearLimit 
                  ? 'text-amber-500' 
                  : 'text-gray-300'
            }`}>
              {charsRemaining}
            </div>
          </div>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  {mediaFiles[index]?.type.startsWith('video/') ? (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Play className="h-6 w-6 text-gray-500" />
                    </div>
                  ) : (
                    <img src={preview} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs pl-12">{error}</p>
      )}

      <div className="flex items-center justify-between pl-12">
        {/* Media Upload Button */}
        <label className="flex items-center gap-1.5 text-gray-400 hover:text-[#2EC4B6] cursor-pointer transition-colors">
          <ImageIcon className="h-5 w-5" />
          <span className="text-xs">Photo/Video</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 text-sm bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
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
  const [studentOfMonth, setStudentOfMonth] = useState<{ id: string; student_name: string; enrollment_id?: string; notes?: string } | null>(null);
  const [editingSOTM, setEditingSOTM] = useState(false);
  const [sotmDropdownOpen, setSotmDropdownOpen] = useState(false);
  const [savingSOTM, setSavingSOTM] = useState(false);
  const [sotmNotes, setSotmNotes] = useState('');
  const [selectedSOTMMember, setSelectedSOTMMember] = useState<{ id: string; name: string } | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editThreadContent, setEditThreadContent] = useState('');
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [isThreadDeleting, setIsThreadDeleting] = useState(false);
  const [isSavingThread, setIsSavingThread] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState<string | null>(null);
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
  const [threadReplies, setThreadReplies] = useState<Record<string, ThreadReply[]>>({});
  const [replyingToThreadId, setReplyingToThreadId] = useState<string | null>(null);
  const [threadReplyContent, setThreadReplyContent] = useState('');
  const [isSubmittingThreadReply, setIsSubmittingThreadReply] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [threadReplyError, setThreadReplyError] = useState<string | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [replyMenuOpen, setReplyMenuOpen] = useState<string | null>(null);
  const [membersPage, setMembersPage] = useState(0);
  const MEMBERS_PER_PAGE = 20;
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string; type: string; name: string; subtitle?: string; date: string; enrollmentId?: string }>>([]);
  const [weather, setWeather] = useState<{ temperature: number | null; description: string; icon: string; localTime: string } | null>(null);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

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

  // Memoized fetch for members only (for real-time updates)
  const fetchMembers = useCallback(async () => {
    try {
      const membersRes = await fetch(`/api/locations/${slug}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }, [slug]);

  // Check if already verified and fetch basic location info
  useEffect(() => {
    const checkVerification = async () => {
      try {
        // First fetch location info to check if active
        const locRes = await fetch(`/api/locations/${slug}`);
        if (locRes.ok) {
          const locationData = await locRes.json();
          setLocation(locationData);
          
          // If location is offline, don't proceed with verification
          if (locationData.is_active === false) {
            setIsVerified(false);
            return;
          }
        }

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

  // Real-time subscription for enrollments changes (single source of truth)
  useEffect(() => {
    if (!isVerified || !location?.id) return;

    // Subscribe to enrollments changes for this location
    // enrollment.location_id is the single source of truth for student-location assignment
    const channel = supabase
      .channel(`enrollments_${location.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrollments',
          filter: `location_id=eq.${location.id}`,
        },
        () => {
          // Refetch members when enrollments change for this location
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isVerified, location?.id, fetchMembers]);

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

      // Fetch student of the month
      const sotmRes = await fetch(`/api/locations/${slug}/student-of-month`);
      if (sotmRes.ok) {
        const sotmData = await sotmRes.json();
        setStudentOfMonth(sotmData.studentOfMonth);
      }

      // Fetch recent activity (new members who joined)
      if (locationData?.id) {
        const activityRes = await fetch(`/api/locations/${slug}/activity`);
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setRecentActivity(activityData.activity || []);
        }
      }

      // Fetch weather
      const weatherRes = await fetch(`/api/locations/${slug}/weather`);
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        setWeather(weatherData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Save student of the month
  const saveStudentOfMonth = async (memberId?: string, memberName?: string) => {
    const id = memberId || selectedSOTMMember?.id;
    const name = memberName || selectedSOTMMember?.name;
    if (!id || !name) return;
    setSavingSOTM(true);
    try {
      const res = await fetch(`/api/locations/${slug}/student-of-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enrollmentId: id, 
          studentName: name,
          notes: sotmNotes.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStudentOfMonth(data.studentOfMonth);
        setEditingSOTM(false);
        setSotmDropdownOpen(false);
        setSotmNotes('');
        setSelectedSOTMMember(null);
      }
    } catch (err) {
      console.error('Error saving student of month:', err);
    } finally {
      setSavingSOTM(false);
    }
  };

  // Remove student of the month
  const removeStudentOfMonth = async () => {
    setSavingSOTM(true);
    try {
      const res = await fetch(`/api/locations/${slug}/student-of-month`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStudentOfMonth(null);
        setEditingSOTM(false);
        setSotmDropdownOpen(false);
      }
    } catch (err) {
      console.error('Error removing student of month:', err);
    } finally {
      setSavingSOTM(false);
    }
  };

  // Select a member for SOTM (step 1 of editing)
  const selectSOTMMember = (member: { id: string; name: string }) => {
    setSelectedSOTMMember(member);
    setSotmDropdownOpen(false);
    setSotmNotes(studentOfMonth?.notes || '');
  };

  // Toggle thread expansion and fetch replies
  const toggleThreadExpansion = async (threadId: string) => {
    if (expandedThreadId === threadId) {
      setExpandedThreadId(null);
      setReplyingToThreadId(null);
      return;
    }
    
    setExpandedThreadId(threadId);
    setReplyingToThreadId(null);
    setThreadReplyContent('');
    
    // Fetch replies if not already loaded
    if (!threadReplies[threadId]) {
      setLoadingReplies(threadId);
      try {
        const res = await fetch(`/api/community/discussions/${threadId}/replies`);
        if (res.ok) {
          const data = await res.json();
          setThreadReplies(prev => ({ ...prev, [threadId]: data.replies || [] }));
        }
      } catch (err) {
        console.error('Error fetching replies:', err);
      } finally {
        setLoadingReplies(null);
      }
    }
  };

  // Submit a reply to a thread
  const submitThreadReply = async (threadId: string) => {
    if (!threadReplyContent.trim()) return;
    
    setIsSubmittingThreadReply(true);
    setThreadReplyError(null);
    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: threadReplyContent.trim() }),
      });
      
      if (res.ok) {
        const newReply = await res.json();
        // Add reply to local state
        setThreadReplies(prev => ({
          ...prev,
          [threadId]: [...(prev[threadId] || []), {
            id: newReply.id,
            thread_id: threadId,
            author_id: '',
            author_email: userEmail,
            content: newReply.content,
            created_at: newReply.createdAt,
            author: {
              email: userEmail,
              firstName: user?.firstName || undefined,
              lastName: user?.lastName || undefined,
            },
          }],
        }));
        // Update thread reply count
        setThreads(prev => prev.map(t => 
          t.id === threadId ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t
        ));
        setThreadReplyContent('');
        setReplyingToThreadId(null);
        setThreadReplyError(null);
      } else {
        // Handle error response from API
        const errorData = await res.json().catch(() => ({ error: 'Failed to post reply' }));
        const errorMessage = errorData.error || 'Failed to post reply. Please try again.';
        setThreadReplyError(errorMessage);
        console.error('Reply submission failed:', errorMessage);
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      setThreadReplyError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmittingThreadReply(false);
    }
  };

  // Edit a reply
  const handleEditReply = async (threadId: string, replyId: string) => {
    if (!editReplyContent.trim()) return;
    
    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyId, content: editReplyContent.trim() }),
      });
      
      if (res.ok) {
        setThreadReplies(prev => ({
          ...prev,
          [threadId]: (prev[threadId] || []).map(r => 
            r.id === replyId ? { ...r, content: editReplyContent.trim() } : r
          ),
        }));
        setEditingReplyId(null);
        setEditReplyContent('');
      }
    } catch (err) {
      console.error('Error editing reply:', err);
    }
  };

  // Delete a reply
  const handleDeleteReply = async (threadId: string, replyId: string) => {
    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies?replyId=${replyId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setThreadReplies(prev => ({
          ...prev,
          [threadId]: (prev[threadId] || []).filter(r => r.id !== replyId),
        }));
        setThreads(prev => prev.map(t => 
          t.id === threadId ? { ...t, replyCount: Math.max((t.replyCount || 1) - 1, 0) } : t
        ));
        setDeletingReplyId(null);
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
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

  // Thread CRUD handlers
  const isThreadAuthor = (authorEmail: string) => userEmail === authorEmail;

  const handleEditThreadFromList = async (threadId: string) => {
    if (!editThreadContent.trim()) return;
    setIsSavingThread(true);
    try {
      const res = await fetch(`/api/community/discussions/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editThreadContent }),
      });
      if (res.ok) {
        setEditingThreadId(null);
        setEditThreadContent('');
        fetchLocationData();
      }
    } catch (err) {
      console.error('Error updating thread:', err);
    } finally {
      setIsSavingThread(false);
    }
  };

  const handleDeleteThreadFromList = async (threadId: string) => {
    setIsThreadDeleting(true);
    try {
      const res = await fetch(`/api/community/discussions/${threadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeletingThreadId(null);
        fetchLocationData();
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
    } finally {
      setIsThreadDeleting(false);
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

  // Location offline check - show overlay if location is disabled
  if (location && location.is_active === false) {
    return <LocationOfflineOverlay locationName={location.name} />;
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

  // Community page (verified) - 2 Column Layout
  return (
    <div className="min-h-screen bg-[#F7F9F9]">
      {/* Compact Header */}
      <section className="bg-white border-b border-gray-100">
        <Container className="py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-gray-400">Community</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <span className="text-gray-900 font-medium">{location?.name || 'Loading...'}</span>
          </nav>
        </Container>
      </section>

      {/* 2-Column Layout */}
      <Container className="py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content - Left Column */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Unified Welcome + Activity Card */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200/50 shadow-sm">
              {/* Soft gradient background - more subtle */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />
              {/* Teal accent gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/20 via-transparent to-[#8FE3CF]/10" />
              {/* Subtle glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
              
              {/* Weather Effects Layer */}
              {weather && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {/* Sunny Effect - Floating light rays */}
                  {(weather.icon === 'sun' || weather.icon === 'cloud-sun') && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#FFC857]/20 via-[#FFC857]/5 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
                      <div className="absolute top-4 right-8 w-2 h-2 bg-[#FFC857]/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-[#FFC857]/30 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                      <div className="absolute top-8 right-4 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                    </>
                  )}
                  
                  {/* Snow Effect - Falling snowflakes */}
                  {weather.icon === 'cloud-snow' && (
                    <>
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={`snow-${i}`}
                          className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                          style={{
                            left: `${8 + (i * 8)}%`,
                            top: '-5%',
                            animation: `snowfall ${3 + (i % 3)}s linear infinite`,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                      ))}
                      <style jsx>{`
                        @keyframes snowfall {
                          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
                          10% { opacity: 1; }
                          90% { opacity: 1; }
                          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
                        }
                      `}</style>
                    </>
                  )}
                  
                  {/* Rain Effect - Falling rain drops */}
                  {(weather.icon === 'cloud-rain' || weather.icon === 'cloud-drizzle') && (
                    <>
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={`rain-${i}`}
                          className="absolute w-0.5 h-3 bg-gradient-to-b from-[#8FE3CF]/40 to-transparent rounded-full"
                          style={{
                            left: `${5 + (i * 6.5)}%`,
                            top: '-3%',
                            animation: `rainfall ${0.8 + (i % 3) * 0.2}s linear infinite`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                      <style jsx>{`
                        @keyframes rainfall {
                          0% { transform: translateY(-10px); opacity: 0; }
                          10% { opacity: 0.6; }
                          90% { opacity: 0.4; }
                          100% { transform: translateY(500px); opacity: 0; }
                        }
                      `}</style>
                    </>
                  )}
                  
                  {/* Cloudy Effect - Floating clouds */}
                  {(weather.icon === 'cloud' || weather.icon === 'cloud-fog') && (
                    <>
                      <div className="absolute top-4 -left-8 w-24 h-8 bg-white/5 rounded-full blur-lg animate-pulse" style={{ animation: 'cloudFloat 8s ease-in-out infinite' }} />
                      <div className="absolute top-12 left-1/4 w-16 h-6 bg-white/4 rounded-full blur-md" style={{ animation: 'cloudFloat 10s ease-in-out infinite', animationDelay: '2s' }} />
                      <div className="absolute top-6 right-1/4 w-20 h-7 bg-white/3 rounded-full blur-lg" style={{ animation: 'cloudFloat 12s ease-in-out infinite', animationDelay: '4s' }} />
                      <style jsx>{`
                        @keyframes cloudFloat {
                          0%, 100% { transform: translateX(0); }
                          50% { transform: translateX(20px); }
                        }
                      `}</style>
                    </>
                  )}
                  
                  {/* Lightning Effect - Flash */}
                  {weather.icon === 'cloud-lightning' && (
                    <>
                      <div className="absolute inset-0 bg-white/0 animate-pulse" style={{ animation: 'lightning 4s ease-in-out infinite' }} />
                      <style jsx>{`
                        @keyframes lightning {
                          0%, 89%, 91%, 93%, 100% { background-color: transparent; }
                          90%, 92% { background-color: rgba(255,255,255,0.1); }
                        }
                      `}</style>
                    </>
                  )}
                </div>
              )}
              
              {/* Noise texture for depth */}
              <div 
                className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` 
                }} 
              />
              {/* Edge highlights */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2EC4B6]/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Welcome Section */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                        Welcome back, <span className="text-white/90">{displayUserName}</span>
                      </h1>
                      <p className="mt-1 text-white/70 text-sm">{location?.name} Community</p>
                    </div>
                    
                    {/* Weather & Time Widget */}
                    {weather && (
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                        {/* Weather Icon */}
                        <div className="text-white/90">
                          {weather.icon === 'sun' && <Sun className="h-6 w-6" />}
                          {weather.icon === 'cloud' && <Cloud className="h-6 w-6" />}
                          {weather.icon === 'cloud-sun' && <CloudSun className="h-6 w-6" />}
                          {weather.icon === 'cloud-rain' && <CloudRain className="h-6 w-6" />}
                          {weather.icon === 'cloud-snow' && <CloudSnow className="h-6 w-6" />}
                          {weather.icon === 'cloud-lightning' && <CloudLightning className="h-6 w-6" />}
                          {weather.icon === 'cloud-drizzle' && <CloudDrizzle className="h-6 w-6" />}
                          {weather.icon === 'cloud-fog' && <CloudFog className="h-6 w-6" />}
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-1">
                            {weather.temperature !== null && (
                              <span className="text-xl font-semibold text-white">{weather.temperature}°</span>
                            )}
                            <span className="text-xs text-white/60">{weather.localTime}</span>
                          </div>
                          <p className="text-xs text-white/50">{weather.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                {recentActivity.length > 0 && (
                  <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}

                {/* Activity Section */}
                {recentActivity.length > 0 && (
                  <>
                    <div className="px-6 pt-4 pb-2">
                      <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wide">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-white/10">
                      {recentActivity.slice(0, 5).map((activity) => {
                        // Activity type config
                        const config: Record<string, { icon: typeof Users; bgStyle: string; title: string }> = {
                          new_member: { icon: Users, bgStyle: 'bg-white/20 backdrop-blur-sm', title: 'Welcome' },
                          new_video: { icon: Video, bgStyle: 'bg-white/25 backdrop-blur-sm', title: 'New Video' },
                          new_image: { icon: ImageIcon, bgStyle: 'bg-white/20 backdrop-blur-sm', title: 'New Photo' },
                          comment: { icon: MessageCircle, bgStyle: 'bg-white/15 backdrop-blur-sm', title: 'Commented' },
                          birthday: { icon: Cake, bgStyle: 'bg-white/25 backdrop-blur-sm', title: 'Birthday' },
                          student_of_month: { icon: Award, bgStyle: 'bg-white/30 backdrop-blur-sm', title: 'Student of the Month' },
                        };
                        const { icon: Icon, bgStyle, title } = config[activity.type] || config.new_member;
                        
                        const showAdminActions = isAdmin && activity.enrollmentId && ['new_member', 'birthday', 'student_of_month'].includes(activity.type);
                        
                        return (
                          <div 
                            key={activity.id}
                            className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors group relative"
                          >
                            <div className={`flex-shrink-0 w-9 h-9 rounded-full ${bgStyle} flex items-center justify-center shadow-lg shadow-black/10 group-hover:bg-white/30 transition-colors`}>
                              <Icon className="h-4 w-4 text-white drop-shadow-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-white text-sm drop-shadow-sm block">
                                {title === 'Welcome' ? (
                                  <>{title}, {showAdminActions ? (
                                    <span className="relative inline-block group/name">
                                      <span className="font-semibold cursor-pointer hover:underline">{activity.name}</span>
                                      {/* Admin Quick Actions Dropdown */}
                                      <span className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover/name:opacity-100 group-hover/name:visible transition-all duration-200 z-50">
                                        <span className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[180px] block">
                                          <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Eye className="h-4 w-4 text-gray-400" />
                                            View Details
                                          </Link>
                                          <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Pencil className="h-4 w-4 text-gray-400" />
                                            Edit Student
                                          </Link>
                                          <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <CreditCard className="h-4 w-4 text-gray-400" />
                                            Send Payment Link
                                          </Link>
                                          <span className="border-t border-gray-100 my-1 block" />
                                          <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                          </button>
                                        </span>
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="font-semibold">{activity.name}</span>
                                  )}</>
                                ) : title === 'Commented' ? (
                                  <><span className="font-semibold">{activity.name}</span> commented</>
                                ) : showAdminActions ? (
                                  <span className="relative inline-block group/name">
                                    <span className="font-semibold cursor-pointer hover:underline">{activity.name}</span>
                                    {/* Admin Quick Actions Dropdown */}
                                    <span className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover/name:opacity-100 group-hover/name:visible transition-all duration-200 z-50">
                                      <span className="bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[180px] block">
                                        <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                          <Eye className="h-4 w-4 text-gray-400" />
                                          View Details
                                        </Link>
                                        <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                          <Pencil className="h-4 w-4 text-gray-400" />
                                          Edit Student
                                        </Link>
                                        <Link href={`/dashboard/admin/enrollments/${activity.enrollmentId}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                          <CreditCard className="h-4 w-4 text-gray-400" />
                                          Send Payment Link
                                        </Link>
                                        <span className="border-t border-gray-100 my-1 block" />
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </button>
                                      </span>
                                    </span>
                                  </span>
                                ) : (
                                  <span className="font-semibold">{activity.name}</span>
                                )}
                              </span>
                              <p className="text-white/60 text-xs mt-0.5 truncate">{activity.subtitle || ''}</p>
                            </div>
                            <span className="text-xs text-white/50 flex-shrink-0 font-medium">
                              {formatRelativeTime(activity.date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Empty state padding when no activity */}
                {recentActivity.length === 0 && <div className="pb-2" />}
              </div>
            </div>

            {/* Media Gallery */}
            {media.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Media Gallery</h2>
                        <p className="text-sm text-gray-500">Videos and images from your instructor</p>
                      </div>
                      {isAdmin && (
                        <Link 
                          href="/dashboard/admin/media" 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Video
                        </Link>
                      )}
                    </div>
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                      {(['all', 'video', 'image'] as const).map((type) => {
                        const count = type === 'all' ? media.length : media.filter(m => m.file_type === type).length;
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setMediaFilter(type);
                              setVisibleMediaCount(8);
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              mediaFilter === type
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {type === 'all' ? 'All' : type === 'video' ? 'Videos' : 'Images'}
                            <span className="ml-1 opacity-60">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {(() => {
                    const filteredMedia = mediaFilter === 'all' 
                      ? media 
                      : media.filter(m => m.file_type === mediaFilter);
                    const visibleMedia = filteredMedia.slice(0, visibleMediaCount);
                    const hasMore = filteredMedia.length > visibleMediaCount;

                    return (
                      <>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {visibleMedia.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setPreviewMedia(item)}
                              className="group relative bg-gray-50 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#2EC4B6]/30 transition-all"
                            >
                              <div className="aspect-video relative overflow-hidden">
                                {item.file_type === 'video' ? (
                                  <>
                                    <video
                                      src={item.file_url}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      muted
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                      <div className="h-10 w-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                                        <Play className="h-4 w-4 text-gray-800 ml-0.5" />
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
                                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                    item.file_type === 'video' 
                                      ? 'bg-red-500/90 text-white' 
                                      : 'bg-blue-500/90 text-white'
                                  }`}>
                                    {item.file_type === 'video' ? 'Video' : 'Image'}
                                  </div>
                                </div>
                              </div>
                              <div className="p-2.5">
                                <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {hasMore && (
                          <div className="mt-4 text-center">
                            <button
                              onClick={() => setVisibleMediaCount(prev => prev + 8)}
                              className="px-4 py-2 text-sm font-medium text-[#2EC4B6] hover:bg-[#2EC4B6]/5 rounded-lg transition-colors"
                            >
                              Load More ({filteredMedia.length - visibleMediaCount} remaining)
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Discussions */}
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Discussions</h2>
                    <p className="text-sm text-gray-500">{threads.length} threads</p>
                  </div>
                </div>
                
                {/* Inline Composer */}
                <InlineComposer 
                  locationSlug={slug} 
                  userInitials={displayUserName.charAt(0).toUpperCase()}
                  onSuccess={fetchLocationData}
                />
              </div>

              <div className="divide-y divide-gray-100">
                {threads.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                    <h3 className="text-base font-semibold mb-1 text-gray-900">No discussions yet</h3>
                    <p className="text-gray-500 text-sm">Be the first to start a conversation!</p>
                  </div>
                ) : (
                  threads.map((thread) => {
                    const canEdit = isThreadAuthor(thread.author.email) || isAdmin;
                    const isEditing = editingThreadId === thread.id;
                    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(thread.author.email);
                    const isFounder = ['info@littlegrapplers.net', 'littlegrapplersjitsu@gmail.com'].includes(thread.author.email);
                    
                    return (
                      <div key={thread.id} className="relative">
                        <div className={`group p-4 sm:p-5 transition-colors border-b last:border-b-0 ${
                          isSuperAdmin 
                            ? 'bg-gradient-to-r from-slate-50/50 to-white border-l border-l-[#1F2A44]/60 border-b-gray-100' 
                            : 'hover:bg-gray-50/80 border-gray-100'
                        }`}>
                          <div className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center ${
                                isSuperAdmin 
                                  ? 'bg-gradient-to-br from-[#1F2A44] to-[#2a3a5c] ring-2 ring-[#1F2A44]/20' 
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
                              }`}>
                                <span className={`text-sm sm:text-base font-semibold ${
                                  isSuperAdmin ? 'text-white' : 'text-gray-600'
                                }`}>
                                  {thread.author.firstName?.[0] || thread.author.email[0].toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header: Name + Time + Menu */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[15px] sm:text-base font-semibold ${
                                    isSuperAdmin ? 'text-[#1F2A44]' : 'text-gray-900'
                                  }`}>
                                    {thread.author.firstName || thread.author.email.split('@')[0]}
                                  </span>
                                  {isSuperAdmin && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1F2A44] text-white uppercase tracking-wide">
                                      Tech
                                    </span>
                                  )}
                                  {isFounder && (
                                    <>
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F7931E] text-white uppercase tracking-wide">
                                        Coach / Founder
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFC857]/20 text-[#F7931E] uppercase tracking-wide border border-[#FFC857]/40 backdrop-blur-sm">
                                        Admin
                                      </span>
                                    </>
                                  )}
                                  <span className="text-[13px] sm:text-sm text-gray-400">·</span>
                                  <span className="text-[13px] sm:text-sm text-gray-400">
                                    {formatRelativeTime(thread.createdAt)}
                                  </span>
                                  {thread.isPinned && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#2EC4B6]/10 text-[#2EC4B6]">
                                      <Pin className="h-2.5 w-2.5" />
                                      Pinned
                                    </span>
                                  )}
                                </div>
                                
                                {/* Edit/Delete Menu for authors */}
                                {canEdit && !isEditing && (
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setThreadMenuOpen(threadMenuOpen === thread.id ? null : thread.id);
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                    </button>
                                    
                                    {threadMenuOpen === thread.id && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={() => setThreadMenuOpen(null)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[120px]">
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setEditingThreadId(thread.id);
                                              setEditThreadContent(thread.content);
                                              setThreadMenuOpen(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setDeletingThreadId(thread.id);
                                              setThreadMenuOpen(null);
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Body - Editable or Display */}
                              {isEditing ? (
                                <div className="mt-2 space-y-3">
                                  <textarea
                                    value={editThreadContent}
                                    onChange={(e) => setEditThreadContent(e.target.value)}
                                    rows={3}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/10 resize-none"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditThreadFromList(thread.id);
                                      }}
                                      disabled={isSavingThread}
                                      className="px-4 py-2 bg-[#2EC4B6] text-white text-xs font-semibold rounded-lg hover:bg-[#2EC4B6]/90 transition-colors disabled:opacity-50"
                                    >
                                      {isSavingThread ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditingThreadId(null);
                                        setEditThreadContent('');
                                      }}
                                      className="px-4 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="mt-1.5 text-[15px] sm:text-base text-gray-700 leading-relaxed">
                                    {thread.content}
                                  </p>
                                  
                                  {/* Media Display */}
                                  {thread.media && thread.media.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                      {thread.media.map((m) => (
                                        <div key={m.id} className="relative rounded-xl overflow-hidden bg-gray-100">
                                          {m.type === 'video' ? (
                                            <div className="relative">
                                              <video 
                                                src={m.url} 
                                                className="w-full max-h-[400px] object-contain bg-black" 
                                                controls
                                              />
                                            </div>
                                          ) : (
                                            <img 
                                              src={m.url} 
                                              alt={m.name} 
                                              className="w-full max-h-[500px] object-contain"
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* Footer: Engagement Actions */}
                                  <div className="mt-3 flex items-center gap-4">
                                    <button
                                      onClick={() => toggleThreadExpansion(thread.id)}
                                      className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-[#2EC4B6] transition-colors"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      <span>{thread.replyCount || 0} {thread.replyCount === 1 ? 'reply' : 'replies'}</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (expandedThreadId !== thread.id) {
                                          toggleThreadExpansion(thread.id);
                                        }
                                        setReplyingToThreadId(thread.id);
                                      }}
                                      className="text-[13px] text-gray-400 hover:text-[#2EC4B6] transition-colors"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                  
                                  {/* Expanded Replies Section */}
                                  {expandedThreadId === thread.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      {/* Inline Reply Form */}
                                      {replyingToThreadId === thread.id && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                          <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-[#2EC4B6] flex items-center justify-center flex-shrink-0">
                                              <span className="text-white text-xs font-semibold">
                                                {displayUserName.charAt(0).toUpperCase()}
                                              </span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                              <textarea
                                                value={threadReplyContent}
                                                onChange={(e) => setThreadReplyContent(e.target.value)}
                                                placeholder="Write a reply..."
                                                rows={2}
                                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2EC4B6] focus:ring-1 focus:ring-[#2EC4B6]/20 resize-none"
                                                autoFocus
                                              />
                                              <div className="flex items-center gap-2">
                                                <button
                                                  onClick={() => submitThreadReply(thread.id)}
                                                  disabled={!threadReplyContent.trim() || isSubmittingThreadReply}
                                                  className="px-3 py-1.5 bg-[#2EC4B6] text-white text-xs font-semibold rounded-lg hover:bg-[#2EC4B6]/90 transition-colors disabled:opacity-50"
                                                >
                                                  {isSubmittingThreadReply ? 'Posting...' : 'Reply'}
                                                </button>
                                                <button
                                                  onClick={() => { setReplyingToThreadId(null); setThreadReplyContent(''); setThreadReplyError(null); }}
                                                  className="px-3 py-1.5 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                              {threadReplyError && (
                                                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                  <p className="text-xs text-red-600">{threadReplyError}</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Loading State */}
                                      {loadingReplies === thread.id && (
                                        <div className="text-center py-4">
                                          <p className="text-sm text-gray-400">Loading replies...</p>
                                        </div>
                                      )}
                                      
                                      {/* Replies List */}
                                      {threadReplies[thread.id]?.length > 0 ? (
                                        <div className="space-y-3">
                                          {threadReplies[thread.id].map((reply) => {
                                            const replyEmail = (reply as any).authorEmail || reply.author_email;
                                            const canEditReply = (replyEmail === userEmail) || isAdmin;
                                            const isEditingThisReply = editingReplyId === reply.id;
                                            
                                            return (
                                              <div key={reply.id} className="group/reply flex gap-3 pl-2 border-l-2 border-[#2EC4B6]/30">
                                                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                  <span className="text-xs font-medium text-gray-600">
                                                    {reply.author?.firstName?.[0] || replyEmail?.[0]?.toUpperCase() || '?'}
                                                  </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-900">
                                                        {reply.author?.firstName || replyEmail?.split('@')[0] || 'Anonymous'}
                                                      </span>
                                                      <span className="text-xs text-gray-400">·</span>
                                                      <span className="text-xs text-gray-400">
                                                        {formatRelativeTime(reply.created_at)}
                                                      </span>
                                                    </div>
                                                    {canEditReply && !isEditingThisReply && (
                                                      <div className="flex items-center gap-1 opacity-0 group-hover/reply:opacity-100 transition-opacity">
                                                        <button
                                                          onClick={() => {
                                                            setEditingReplyId(reply.id);
                                                            setEditReplyContent(reply.content);
                                                          }}
                                                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                          title="Edit"
                                                        >
                                                          <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                          onClick={() => handleDeleteReply(thread.id, reply.id)}
                                                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                          title="Delete"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                  {isEditingThisReply ? (
                                                    <div className="mt-1 space-y-2">
                                                      <textarea
                                                        value={editReplyContent}
                                                        onChange={(e) => setEditReplyContent(e.target.value)}
                                                        rows={2}
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#2EC4B6] resize-none"
                                                        autoFocus
                                                      />
                                                      <div className="flex items-center gap-2">
                                                        <button
                                                          onClick={() => handleEditReply(thread.id, reply.id)}
                                                          disabled={!editReplyContent.trim()}
                                                          className="px-2 py-1 bg-[#2EC4B6] text-white text-xs font-medium rounded-lg hover:bg-[#2EC4B6]/90 disabled:opacity-50"
                                                        >
                                                          Save
                                                        </button>
                                                        <button
                                                          onClick={() => { setEditingReplyId(null); setEditReplyContent(''); }}
                                                          className="px-2 py-1 text-gray-500 text-xs font-medium hover:text-gray-700"
                                                        >
                                                          Cancel
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ) : (
                                                    <p className="text-sm text-gray-700 mt-0.5">{reply.content}</p>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : !loadingReplies && (
                                        <div className="text-center py-4">
                                          <p className="text-sm text-gray-400">No replies yet. Be the first!</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
            
            {/* Location Card */}
            {location && (
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 rounded-2xl border border-slate-200/40 p-4 backdrop-blur-sm">
                {/* Floating glass elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute -top-4 right-2 w-14 h-14 rounded-full bg-gradient-to-bl from-emerald-200/25 to-transparent blur-xl"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute bottom-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200/30 to-transparent blur-lg"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                </div>
                
                <div className="relative flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/70 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center shadow-sm">
                    <MapPin className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Location</p>
                    <p className="text-sm font-semibold text-slate-800">{location.name}</p>
                    {location.address && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {location.address}{location.city ? `, ${location.city}` : ''}{location.state ? `, ${location.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 rounded-2xl border border-slate-200/40 p-4 backdrop-blur-sm">
              {/* Floating glass elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-200/20 to-transparent blur-xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-4 right-0 w-10 h-10 rounded-full bg-gradient-to-tl from-sky-200/20 to-transparent blur-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                />
              </div>
              
              <p className="relative text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">Community Stats</p>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/70 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center shadow-sm">
                      <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600">Members</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/70 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center shadow-sm">
                      <MessageCircle className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600">Discussions</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{threads.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/70 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center shadow-sm">
                      <Play className="h-4 w-4 text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600">Media</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{media.length}</span>
                </div>
              </div>
            </div>

            {/* Members */}
            {members.length > 0 && (() => {
              const totalPages = Math.ceil(members.length / MEMBERS_PER_PAGE);
              const startIdx = membersPage * MEMBERS_PER_PAGE;
              const paginatedMembers = members.slice(startIdx, startIdx + MEMBERS_PER_PAGE);
              
              return (
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-sky-50/30 rounded-2xl border border-slate-200/40 p-4 backdrop-blur-sm">
                  {/* Floating glass elements */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                      className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-slate-200/30 to-transparent blur-xl"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute bottom-8 -left-4 w-12 h-12 rounded-full bg-gradient-to-tr from-sky-200/25 to-transparent blur-lg"
                      animate={{ y: [0, -8, 0], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                    <motion.div
                      className="absolute top-1/2 right-2 w-2 h-2 rounded-full bg-slate-300/40"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  
                  <div className="relative flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Members ({members.length})</p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMembersPage(p => Math.max(0, p - 1))}
                          disabled={membersPage === 0}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <span className="text-[10px] text-gray-400 min-w-[40px] text-center">
                          {membersPage + 1}/{totalPages}
                        </span>
                        <button
                          onClick={() => setMembersPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={membersPage >= totalPages - 1}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative space-y-2.5">
                    {paginatedMembers.map((member) => {
                      const memberSince = member.joinedAt 
                        ? new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : null;
                      return (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-xs font-semibold text-slate-600">{member.initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{member.name}</p>
                            {memberSince && (
                              <p className="text-[10px] text-slate-400">Since {memberSince}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Student of the Month - Apple/Google inspired */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <Award className="h-[18px] w-[18px] text-gray-500" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Student of the Month</p>
                </div>
                {isAdmin && !editingSOTM && (
                  <button
                    onClick={() => setEditingSOTM(true)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              
              {editingSOTM ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] text-gray-500 font-medium">
                      {selectedSOTMMember ? 'Selected:' : 'Select a student:'}
                    </p>
                    <button
                      onClick={() => { setEditingSOTM(false); setSotmDropdownOpen(false); setSelectedSOTMMember(null); setSotmNotes(''); }}
                      className="ml-auto p-1 rounded hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  </div>
                  
                  {selectedSOTMMember ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-teal-50/80 to-sky-50/80 rounded-xl border border-teal-100/50 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-200/80 to-sky-200/80 flex items-center justify-center text-[13px] font-bold text-teal-700">
                          {selectedSOTMMember.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold text-gray-900">{selectedSOTMMember.name}</p>
                          <p className="text-[11px] text-teal-600">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedSOTMMember(null); setSotmNotes(''); }}
                          className="p-1.5 rounded-lg hover:bg-teal-100/50 transition-colors"
                        >
                          <X className="h-3.5 w-3.5 text-teal-500" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                          Why was this student selected?
                        </label>
                        <textarea
                          value={sotmNotes}
                          onChange={(e) => setSotmNotes(e.target.value)}
                          placeholder="Share what makes this student special this month..."
                          rows={3}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#2EC4B6] focus:ring-2 focus:ring-[#2EC4B6]/10 resize-none"
                        />
                      </div>
                      
                      <button
                        onClick={() => saveStudentOfMonth()}
                        disabled={savingSOTM}
                        className="w-full py-2.5 bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white text-[13px] font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {savingSOTM ? 'Saving...' : 'Save Student of the Month'}
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        onClick={() => setSotmDropdownOpen(!sotmDropdownOpen)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-left text-[14px] text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <span>Choose student...</span>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${sotmDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {sotmDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-50">
                          {members.length === 0 ? (
                            <p className="px-3 py-2 text-[13px] text-gray-400">No students enrolled</p>
                          ) : (
                            members.map((member) => (
                              <button
                                key={member.id}
                                onClick={() => selectSOTMMember({ id: member.id, name: member.name })}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50/50 transition-colors text-left"
                              >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100/80 to-sky-100/80 flex items-center justify-center text-[12px] font-semibold text-teal-600">
                                  {member.initials}
                                </div>
                                <span className="text-[14px] text-gray-700">{member.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {studentOfMonth ? (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100/80 to-sky-100/80 flex items-center justify-center backdrop-blur-sm">
                          <span className="text-teal-700 font-bold text-sm">
                            {studentOfMonth.student_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-[16px] font-semibold text-gray-900">{studentOfMonth.student_name}</p>
                          <p className="text-[12px] text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                      {studentOfMonth.notes && (
                        <div className="pt-3 border-t border-gray-100">
                          <p className="text-[13px] text-gray-600 leading-relaxed italic">"{studentOfMonth.notes}"</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 font-medium text-lg">?</span>
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-gray-400">Not selected yet</p>
                        <p className="text-[13px] text-gray-400/80">{isAdmin ? 'Click edit to select' : 'Check back soon'}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Upcoming Birthdays - Apple/Google inspired */}
            <div className="bg-white rounded-[20px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-violet-50/80 flex items-center justify-center backdrop-blur-sm">
                  <Cake className="h-[18px] w-[18px] text-violet-400" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-gray-900 tracking-[-0.01em]">Upcoming Birthdays</p>
              </div>
              <div className="space-y-3">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  const upcomingBirthdays = members
                    .filter(m => m.dateOfBirth)
                    .map(member => {
                      const bday = new Date(member.dateOfBirth!);
                      const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
                      const nextYear = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());
                      const upcoming = thisYear >= today ? thisYear : nextYear;
                      const daysUntil = Math.ceil((upcoming.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const monthDay = upcoming.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return { ...member, daysUntil, monthDay, upcomingDate: upcoming };
                    })
                    .sort((a, b) => a.daysUntil - b.daysUntil)
                    .slice(0, 5);

                  if (upcomingBirthdays.length === 0) {
                    return (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center">
                          <Cake className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                        </div>
                        <p className="text-[14px] text-gray-400">No birthdays on file</p>
                      </div>
                    );
                  }

                  return upcomingBirthdays.map((member, index) => {
                    const isBirthday = member.daysUntil === 0;
                    
                    return (
                      <motion.div 
                        key={member.id || index} 
                        className={`relative flex items-center gap-3 ${isBirthday ? 'p-3 -mx-2 rounded-2xl bg-gradient-to-r from-violet-50/80 via-sky-50/80 to-violet-50/80 backdrop-blur-sm' : ''}`}
                        initial={isBirthday ? { scale: 1 } : false}
                        animate={isBirthday ? { 
                          scale: [1, 1.02, 1],
                          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        } : {}}
                      >
                        {isBirthday && (
                          <>
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                  background: ['#8B5CF6', '#06B6D4', '#2EC4B6', '#A78BFA'][i % 4],
                                  left: `${10 + (i * 12)}%`,
                                  top: i % 2 === 0 ? '-4px' : 'auto',
                                  bottom: i % 2 === 1 ? '-4px' : 'auto',
                                }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                  opacity: [0, 1, 0],
                                  scale: [0, 1.2, 0],
                                  y: i % 2 === 0 ? [0, -8, 0] : [0, 8, 0],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeOut"
                                }}
                              />
                            ))}
                          </>
                        )}
                        
                        <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold ${
                          isBirthday 
                            ? 'bg-gradient-to-br from-violet-400 to-sky-400 text-white shadow-lg shadow-violet-200/50' 
                            : member.daysUntil <= 7
                              ? 'bg-gradient-to-br from-violet-100/80 to-sky-100/80 text-violet-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isBirthday && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-sky-400"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <span className="relative z-10">{member.initials}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] font-medium truncate ${isBirthday ? 'text-violet-700' : 'text-gray-900'}`}>
                            {member.name}
                          </p>
                          <p className="text-[12px] text-gray-400">{member.monthDay}</p>
                        </div>
                        
                        {isBirthday ? (
                          <motion.div 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-sky-500 text-white shadow-md shadow-violet-200/50"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <Cake className="h-3.5 w-3.5" />
                            <span className="text-[11px] font-bold tracking-wide">BIRTHDAY</span>
                          </motion.div>
                        ) : (
                          <div className={`text-center min-w-[52px] px-2.5 py-1.5 rounded-xl ${
                            member.daysUntil <= 7 
                              ? 'bg-violet-50/80 border border-violet-100/50'
                              : 'bg-gray-50'
                          }`}>
                            <p className={`text-[15px] font-bold leading-none ${
                              member.daysUntil <= 7 ? 'text-violet-600' : 'text-gray-600'
                            }`}>
                              {member.daysUntil}
                            </p>
                            <p className={`text-[9px] font-medium uppercase tracking-wide mt-0.5 ${
                              member.daysUntil <= 7 ? 'text-violet-500' : 'text-gray-400'
                            }`}>
                              {member.daysUntil === 1 ? 'day' : 'days'}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Dashboard Link */}
            <Link 
              href="/dashboard"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Home className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Dashboard</span>
            </Link>

          </div>
        </div>
      </Container>


      {/* Media Preview Modal - Apple-style Blurred Background */}
      {previewMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xl overflow-y-auto"
          onClick={() => setPreviewMedia(null)}
        >
          
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              setPreviewMedia(null);
            }}
            className="fixed top-6 right-6 z-[60] h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          >
            <X className="h-5 w-5 text-white" />
          </motion.button>

          <div 
            className="min-h-screen flex flex-col items-center py-12 px-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video/Image with enhanced styling */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-4xl relative"
            >
              <div className="relative bg-black rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
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
            </motion.div>

            {/* Title, Description & Date */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 text-center max-w-2xl"
            >
              {/* Type badge */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  previewMedia.file_type === 'video' 
                    ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30' 
                    : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30'
                }`}>
                  {previewMedia.file_type === 'video' ? (
                    <><Video className="h-3 w-3" /> Video</>
                  ) : (
                    <><ImageIcon className="h-3 w-3" /> Image</>
                  )}
                </span>
              </div>
              
              <h3 className="text-white text-2xl font-bold tracking-tight">{previewMedia.title}</h3>
              
              {previewMedia.description && (
                <p className="mt-3 text-white/70 text-base leading-relaxed">{previewMedia.description}</p>
              )}
              
              {/* Upload date */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Calendar className="h-4 w-4" />
                  <span>Added {new Date(previewMedia.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1.5 text-sm text-white/50">
                  <Clock className="h-4 w-4" />
                  <span>{formatRelativeTime(previewMedia.created_at)}</span>
                </div>
              </div>
            </motion.div>

            {/* Questions Section */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 w-full max-w-2xl"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-[#2EC4B6]" />
                  <h4 className="text-white text-sm font-semibold">Questions</h4>
                </div>
                
                {/* Ask Question Input */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                    placeholder="Ask a question about this video..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={() => handleSubmitQuestion()}
                    disabled={!newQuestion.trim() || isSubmittingQuestion}
                    className="px-5 py-3 bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingQuestion ? '...' : 'Ask'}
                  </button>
                </div>

                {/* Nested Comments List - Reddit Style */}
                {mediaComments.length === 0 ? (
                  <p className="text-white/50 text-sm text-center py-8">No questions yet. Be the first to ask!</p>
                ) : (
                  <div className="divide-y divide-white/10">
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
            </motion.div>
          </div>
        </div>
      )}

      {/* Delete Thread Confirmation Modal */}
      {deletingThreadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isThreadDeleting && setDeletingThreadId(null)}
          />
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Thread</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this thread? This action cannot be undone and all replies will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingThreadId(null)}
                disabled={isThreadDeleting}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteThreadFromList(deletingThreadId)}
                disabled={isThreadDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isThreadDeleting ? 'Deleting...' : 'Delete Thread'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
