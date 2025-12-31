'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { ArrowLeft, Send, Pin, Clock, User, MessageCircle, ImagePlus, X, Film, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

/**
 * Location-specific color themes
 */
const LOCATION_THEMES: Record<string, { primary: string; primaryRgb: string }> = {
  'lionheart-central-church': {
    primary: '#2EC4B6', // Teal Blue
    primaryRgb: '46, 196, 182',
  },
  'lionheart-first-baptist-plano': {
    primary: '#8FE3CF', // Soft Sky Blue
    primaryRgb: '143, 227, 207',
  },
  'pinnacle-montessori': {
    primary: '#F7931E', // Warm Orange
    primaryRgb: '247, 147, 30',
  },
};

const DEFAULT_THEME = {
  primary: '#2EC4B6',
  primaryRgb: '46, 196, 182',
};

function getLocationTheme(slug: string) {
  return LOCATION_THEMES[slug] || DEFAULT_THEME;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: {
    email: string;
  };
  location: {
    name: string;
    slug: string;
  };
  media?: MediaAttachment[];
  videoLinks?: string[];
  replies: Reply[];
}

interface MediaAttachment {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: {
    email: string;
  };
  media?: MediaAttachment[];
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [replyMediaFiles, setReplyMediaFiles] = useState<File[]>([]);
  const [replyMediaPreviews, setReplyMediaPreviews] = useState<string[]>([]);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteThreadConfirm, setShowDeleteThreadConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editThreadTitle, setEditThreadTitle] = useState('');
  const [editThreadContent, setEditThreadContent] = useState('');
  const [isSavingThread, setIsSavingThread] = useState(false);
  const { user: clerkUser } = useUser();
  const currentUserEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  const theme = getLocationTheme(slug);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await fetch(`/api/locations/${slug}/verify-pin`);
        const data = await res.json();
        setIsVerified(data.verified);
        
        if (!data.verified) {
          router.push(`/community/${slug}` as Route);
        } else {
          fetchThread();
        }
      } catch {
        router.push(`/community/${slug}` as Route);
      }
    };

    checkVerification();
  }, [slug, router, threadId]);

  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/community/discussions/${threadId}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data);
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
    }
  };

  const handleReplyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      // Images have no size limit (will be resized server-side), videos max 100MB
      const maxSize = isVideo ? 100 * 1024 * 1024 : Infinity;
      return (isImage || isVideo) && file.size <= maxSize;
    });
    
    if (validFiles.length + replyMediaFiles.length > 3) return;
    
    setReplyMediaFiles(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReplyMediaPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReplyMedia = (index: number) => {
    setReplyMediaFiles(prev => prev.filter((_, i) => i !== index));
    setReplyMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const replyData = await res.json();
        
        // Upload media files if any
        if (replyMediaFiles.length > 0) {
          for (const file of replyMediaFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('replyId', replyData.id);
            await fetch('/api/upload', { method: 'POST', body: formData });
          }
        }
        
        setReplyContent('');
        setReplyMediaFiles([]);
        setReplyMediaPreviews([]);
        fetchThread();
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/discussions/${threadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/community/${data.locationSlug || slug}` as Route);
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteThreadConfirm(false);
    }
  };

  const handleEditThread = () => {
    if (thread) {
      setEditThreadTitle(thread.title);
      setEditThreadContent(thread.content);
      setIsEditingThread(true);
    }
  };

  const handleSaveThread = async () => {
    if (!editThreadTitle.trim() || !editThreadContent.trim()) return;
    
    setIsSavingThread(true);
    try {
      const res = await fetch(`/api/community/discussions/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editThreadTitle, content: editThreadContent }),
      });
      if (res.ok) {
        setIsEditingThread(false);
        fetchThread();
      }
    } catch (err) {
      console.error('Error updating thread:', err);
    } finally {
      setIsSavingThread(false);
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchThread();
      }
    } catch (err) {
      console.error('Error removing media:', err);
    }
  };

  const handleEditReply = async (replyId: string) => {
    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyId, content: editContent }),
      });
      if (res.ok) {
        setEditingReplyId(null);
        setEditContent('');
        fetchThread();
      }
    } catch (err) {
      console.error('Error editing reply:', err);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    try {
      const res = await fetch(`/api/community/discussions/${threadId}/replies?replyId=${replyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteConfirm(null);
        fetchThread();
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
  };

  const isAuthor = (email: string) => currentUserEmail === email;
  const isAdmin = currentUserEmail === 'dangzr1@gmail.com';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isVerified === null || !thread) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <section className="relative py-16 md:py-24">
        <div 
          className="absolute inset-0" 
          style={{ background: `linear-gradient(to bottom right, rgba(${theme.primaryRgb}, 0.1), var(--background), var(--background))` }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up">
            <Link 
              href={`/community/${slug}` as Route}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Link>

            {/* Thread Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {thread.isPinned && (
                  <span 
                    className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded"
                    style={{ color: theme.primary, backgroundColor: `rgba(${theme.primaryRgb}, 0.2)` }}
                  >
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-black">
                {thread.title}
              </h1>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {thread.author.email.split('@')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(thread.createdAt)}
                  </span>
                </div>
                {(isAuthor(thread.author.email) || isAdmin) && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleEditThread}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteThreadConfirm(true)}
                      className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Original Post */}
            <div className="p-6 rounded-lg border border-border bg-card mb-8">
              {isEditingThread ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Title</label>
                    <input
                      type="text"
                      value={editThreadTitle}
                      onChange={(e) => setEditThreadTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Content</label>
                    <Textarea
                      value={editThreadContent}
                      onChange={(e) => setEditThreadContent(e.target.value)}
                      className="bg-muted border-border text-foreground min-h-[120px]"
                      rows={5}
                    />
                  </div>
                  {/* Media with remove option when editing */}
                  {thread.media && thread.media.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Attachments</label>
                      <div className="flex flex-wrap gap-3">
                        {thread.media.map((m) => (
                          <div key={m.id} className="relative group">
                            {m.type === 'video' ? (
                              <video src={m.url} className="max-h-32 rounded-lg" />
                            ) : (
                              <img src={m.url} alt={m.name} className="max-h-32 rounded-lg" />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(m.id)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                              title="Remove attachment"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button className="bg-brand hover:bg-brand/90 text-white" onClick={handleSaveThread} disabled={isSavingThread}>
                      {isSavingThread ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsEditingThread(false)} className="text-muted-foreground">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-foreground/80 whitespace-pre-wrap">{thread.content}</p>
                  {thread.media && thread.media.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {thread.media.map((m) => (
                        m.type === 'video' ? (
                          <video key={m.id} src={m.url} controls className="max-w-full max-h-80 rounded-lg" />
                        ) : (
                          <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer">
                            <img src={m.url} alt={m.name} className="max-h-60 rounded-lg hover:opacity-90 transition-opacity" />
                          </a>
                        )
                      ))}
                    </div>
                  )}
                  {thread.videoLinks && thread.videoLinks.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {thread.videoLinks.map((link, index) => {
                        const youtubeMatch = link.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                        const vimeoMatch = link.match(/vimeo\.com\/(?:video\/)?(\d+)/);
                        let embedUrl = '';
                        if (youtubeMatch) {
                          embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                        } else if (vimeoMatch) {
                          embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                        }
                        return embedUrl ? (
                          <div key={index} className="aspect-video max-w-2xl rounded-xl overflow-hidden border border-border">
                            <iframe
                              src={embedUrl}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Replies */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-brand" />
                Replies ({thread.replies.length})
              </h2>

              {thread.replies.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">No replies yet. Be the first to respond!</p>
              ) : (
                <StaggerContainer className="space-y-4" staggerDelay={0.05}>
                  {thread.replies.map((reply) => (
                    <StaggerItem key={reply.id}>
                      <div className="p-4 rounded-lg border border-border bg-card">
                        {editingReplyId === reply.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="bg-muted border-border text-foreground"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-brand hover:bg-brand/90 text-white" onClick={() => handleEditReply(reply.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingReplyId(null)} className="text-muted-foreground">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-foreground/80 whitespace-pre-wrap">{reply.content}</p>
                            {reply.media && reply.media.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {reply.media.map((m) => (
                                  m.type === 'video' ? (
                                    <video key={m.id} src={m.url} controls className="max-w-full max-h-48 rounded" />
                                  ) : (
                                    <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer">
                                      <img src={m.url} alt={m.name} className="max-h-40 rounded hover:opacity-90 transition-opacity" />
                                    </a>
                                  )
                                ))}
                              </div>
                            )}
                          </>
                        )}
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {reply.author.email.split('@')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          {(isAuthor(reply.author.email) || isAdmin) && editingReplyId !== reply.id && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => { setEditingReplyId(reply.id); setEditContent(reply.content); }}
                                className="flex items-center gap-1 hover:text-foreground transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>

            {/* Reply Form - Apple macOS Glass Style */}
            <div 
              className="relative rounded-[20px]"
              style={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 0 0 0.5px rgba(255, 255, 255, 0.5)',
              }}
            >
              {/* Soft inner highlight at top */}
              <div 
                className="absolute inset-x-0 top-0 h-[1px] rounded-t-[20px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}
              />
              
              <div className="relative z-10 p-6">
                <h3 className="font-semibold mb-4 text-[#1F2A44]">Add a Reply</h3>
                <form onSubmit={handleReply} className="space-y-4">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="bg-white/60 backdrop-blur-sm border-2 border-slate-200/50 focus:border-brand/50 focus:ring-brand/20 text-[#1F2A44] placeholder:text-slate-400 rounded-xl shadow-sm resize-none transition-all"
                  />
                  
                  {/* Media Upload for Reply */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {replyMediaPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {replyMediaFiles[index]?.type.startsWith('video/') ? (
                          <div className="w-20 h-20 rounded-xl bg-slate-100/80 backdrop-blur-sm flex items-center justify-center border-2 border-slate-200/50 shadow-sm">
                            <Film className="h-7 w-7 text-slate-400" />
                          </div>
                        ) : (
                          <img src={preview} alt="" className="w-20 h-20 object-cover rounded-xl border-2 border-slate-200/50 shadow-sm" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeReplyMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {replyMediaFiles.length < 3 && (
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300/60 hover:border-brand/50 hover:bg-brand/5 flex flex-col items-center justify-center cursor-pointer transition-all group bg-white/40 backdrop-blur-sm">
                        <ImagePlus className="h-6 w-6 text-slate-400 group-hover:text-brand transition-colors" />
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleReplyFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-brand hover:bg-brand/90 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Delete Thread Confirmation Modal */}
      {showDeleteThreadConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowDeleteThreadConfirm(false)}
          />
          <div className="relative bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-red-500/20">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Delete Thread</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this thread? This action cannot be undone and all replies will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteThreadConfirm(false)}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteThread}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Thread'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
