'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, ImagePlus, X, Film, Link2, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/layout/container';
import { FadeIn } from '@/components/ui/motion';

export default function NewThreadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoLinkInput, setVideoLinkInput] = useState('');

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const res = await fetch(`/api/locations/${slug}/verify-pin`);
        const data = await res.json();
        setIsVerified(data.verified);
        
        if (!data.verified) {
          router.push(`/community/${slug}`);
        }
      } catch {
        router.push(`/community/${slug}`);
      }
    };

    checkVerification();
  }, [slug, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      // Images have no size limit (will be resized server-side), videos max 100MB
      const maxSize = isVideo ? 100 * 1024 * 1024 : Infinity;
      return (isImage || isVideo) && file.size <= maxSize;
    });
    
    if (validFiles.length + mediaFiles.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    
    setMediaFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
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

  const getVideoEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const getVideoThumbnail = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }
    return null;
  };

  const addVideoLink = () => {
    if (!videoLinkInput.trim()) return;
    
    const embedUrl = getVideoEmbedUrl(videoLinkInput);
    if (!embedUrl) {
      setError('Please enter a valid YouTube or Vimeo URL');
      return;
    }
    
    if (videoLinks.length >= 3) {
      setError('Maximum 3 video links allowed');
      return;
    }
    
    setVideoLinks(prev => [...prev, videoLinkInput]);
    setVideoLinkInput('');
    setError('');
  };

  const removeVideoLink = (index: number) => {
    setVideoLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create the thread first
      const res = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationSlug: slug,
          title,
          content,
          videoLinks,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create thread');
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

          await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        }
      }

      router.push(`/community/${slug}/thread/${threadId}`);
    } catch {
      setError('Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-foreground/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-background to-background" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up">
            <div className="max-w-2xl mx-auto">
              <Link 
                href={`/community/${slug}`}
                className="inline-flex items-center gap-2 text-foreground/60 hover:text-brand mb-8 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Link>

              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-display font-black">
                  Start a New <span className="font-serif italic font-normal text-brand">Discussion</span>
                </h1>
                <p className="text-foreground/60 mt-3">Share your thoughts with the community</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground font-semibold">
                    Title <span className="text-brand">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    required
                    className="h-12 bg-white border-2 border-gray-200 focus:border-brand focus:ring-brand/20 text-foreground placeholder:text-foreground/40 rounded-xl shadow-sm"
                  />
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-foreground font-semibold">
                    Content <span className="text-brand">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or experiences..."
                    required
                    rows={8}
                    className="bg-white border-2 border-gray-200 focus:border-brand focus:ring-brand/20 text-foreground placeholder:text-foreground/40 rounded-xl shadow-sm resize-none"
                  />
                </div>

                {/* Media Upload */}
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold">Photos & Videos (optional)</Label>
                  <div className="flex flex-wrap gap-4">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {mediaFiles[index]?.type.startsWith('video/') ? (
                          <div className="w-28 h-28 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-gray-200 shadow-sm">
                            <Film className="h-10 w-10 text-foreground/40" />
                          </div>
                        ) : (
                          <img
                            src={preview}
                            alt={`Upload ${index + 1}`}
                            className="w-28 h-28 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {mediaFiles.length < 5 && (
                      <label className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand hover:bg-brand/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                        <ImagePlus className="h-8 w-8 text-gray-400 group-hover:text-brand transition-colors" />
                        <span className="text-sm text-gray-400 group-hover:text-brand mt-1 font-medium transition-colors">Add</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-foreground/50">Max 5 files. Images up to 10MB, videos up to 100MB.</p>
                </div>

                {/* Video Links */}
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Video Links (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={videoLinkInput}
                      onChange={(e) => setVideoLinkInput(e.target.value)}
                      placeholder="Paste YouTube or Vimeo URL..."
                      className="flex-1 h-11 bg-white border-2 border-gray-200 focus:border-brand focus:ring-brand/20 text-foreground placeholder:text-foreground/40 rounded-xl shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addVideoLink();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addVideoLink}
                      className="h-11 px-4 bg-brand hover:bg-brand/90 text-white rounded-xl"
                      disabled={!videoLinkInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Video Link Previews */}
                  {videoLinks.length > 0 && (
                    <div className="space-y-3">
                      {videoLinks.map((link, index) => {
                        const thumbnail = getVideoThumbnail(link);
                        const embedUrl = getVideoEmbedUrl(link);
                        return (
                          <div key={index} className="relative group flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                            {thumbnail ? (
                              <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <Play className="h-6 w-6 text-white fill-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-24 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Play className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{link}</p>
                              <p className="text-xs text-foreground/50">{embedUrl ? 'Ready to embed' : 'Invalid URL'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVideoLink(index)}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-foreground/50">Supports YouTube and Vimeo. Max 3 video links.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    disabled={isSubmitting || !title || !content}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Discussion'}
                    <Send className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 border-2 border-gray-200 text-foreground/70 hover:text-foreground hover:bg-gray-50 font-semibold rounded-xl"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
