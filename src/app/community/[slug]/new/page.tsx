'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, ImagePlus, X, Film } from 'lucide-react';
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
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB video, 10MB image
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
      <div className="min-h-screen bg-foreground text-background flex items-center justify-center">
        <div className="animate-pulse text-background/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground text-background overflow-hidden">
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-foreground to-foreground" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        <Container className="relative z-10">
          <FadeIn direction="up">
            <Link 
              href={`/community/${slug}`}
              className="inline-flex items-center gap-2 text-background/60 hover:text-brand mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Link>

            <h1 className="text-3xl md:text-4xl font-display font-black">
              Start a New <span className="font-serif italic font-normal text-brand">Discussion</span>
            </h1>

            <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-background">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-background">Content *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or experiences..."
                  required
                  rows={8}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/40"
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label className="text-background">Photos & Videos (optional)</Label>
                <div className="flex flex-wrap gap-3">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      {mediaFiles[index]?.type.startsWith('video/') ? (
                        <div className="w-24 h-24 rounded-lg bg-background/20 flex items-center justify-center border border-background/20">
                          <Film className="h-8 w-8 text-background/60" />
                        </div>
                      ) : (
                        <img
                          src={preview}
                          alt={`Upload ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-background/20"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {mediaFiles.length < 5 && (
                    <label className="w-24 h-24 rounded-lg border-2 border-dashed border-background/30 hover:border-brand/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                      <ImagePlus className="h-6 w-6 text-background/40" />
                      <span className="text-xs text-background/40 mt-1">Add</span>
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
                <p className="text-xs text-background/40">Max 5 files. Images up to 10MB, videos up to 100MB.</p>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  disabled={isSubmitting || !title || !content}
                >
                  {isSubmitting ? 'Posting...' : 'Post Discussion'}
                  <Send className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="text-background/70 hover:text-background hover:bg-background/10"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </FadeIn>
        </Container>
      </section>
    </div>
  );
}
