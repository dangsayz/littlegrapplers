'use client';

import { useState, useCallback } from 'react';
import { X, Send, ImagePlus, Film, Link2, Play, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';

interface NewDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationSlug: string;
  onSuccess?: (threadId: string) => void;
}

export function NewDiscussionModal({ 
  isOpen, 
  onClose, 
  locationSlug,
  onSuccess 
}: NewDiscussionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoLinkInput, setVideoLinkInput] = useState('');
  const [showMediaSection, setShowMediaSection] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setContent('');
    setError('');
    setMediaFiles([]);
    setMediaPreviews([]);
    setVideoLinks([]);
    setVideoLinkInput('');
    setShowMediaSection(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

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

  const getVideoEmbedUrl = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  };

  const getVideoThumbnail = (url: string): string | null => {
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
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
      const res = await fetch('/api/community/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationSlug,
          title,
          content,
          videoLinks,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create discussion');
        return;
      }

      const threadData = await res.json();
      const threadId = threadData.id;

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('threadId', threadId);
          await fetch('/api/upload', { method: 'POST', body: formData });
        }
      }

      resetForm();
      onSuccess?.(threadId);
      onClose();
    } catch {
      setError('Failed to create discussion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              className="relative w-full max-w-lg max-h-[85vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass container */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/50 overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2EC4B6]/5 via-transparent to-[#FFC857]/5 pointer-events-none" />
                
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        New Discussion
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5">Share with the community</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="relative">
                  <div className="px-6 py-5 space-y-5 max-h-[55vh] overflow-y-auto">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="modal-title" className="text-sm font-semibold text-gray-700">
                        Title
                      </Label>
                      <Input
                        id="modal-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's on your mind?"
                        required
                        className="h-12 bg-gray-50/80 border-0 ring-0 outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(46,196,182,0.15)] text-gray-900 placeholder:text-gray-400 rounded-2xl transition-all"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <Label htmlFor="modal-content" className="text-sm font-semibold text-gray-700">
                        Content
                      </Label>
                      <Textarea
                        id="modal-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        required
                        rows={4}
                        className="bg-gray-50/80 border-0 ring-0 outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(46,196,182,0.15)] text-gray-900 placeholder:text-gray-400 rounded-2xl resize-none transition-all"
                      />
                    </div>

                    {/* Media Toggle */}
                    {!showMediaSection && (
                      <button
                        type="button"
                        onClick={() => setShowMediaSection(true)}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#2EC4B6] transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add photos, videos, or links
                      </button>
                    )}

                    {/* Media Section (collapsible) */}
                    <AnimatePresence>
                      {showMediaSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          {/* Media Upload */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <ImagePlus className="h-4 w-4 text-gray-400" />
                              Photos & Videos
                            </Label>
                            <div className="flex flex-wrap gap-3">
                              {mediaPreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  {mediaFiles[index]?.type.startsWith('video/') ? (
                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                                      <Film className="h-8 w-8 text-gray-400" />
                                    </div>
                                  ) : (
                                    <img
                                      src={preview}
                                      alt={`Upload ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-2xl"
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeMedia(index)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                              {mediaFiles.length < 5 && (
                                <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#2EC4B6] hover:bg-[#2EC4B6]/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                                  <Plus className="h-6 w-6 text-gray-300 group-hover:text-[#2EC4B6] transition-colors" />
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
                          </div>

                          {/* Video Links */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-gray-400" />
                              Video Links
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                value={videoLinkInput}
                                onChange={(e) => setVideoLinkInput(e.target.value)}
                                placeholder="YouTube or Vimeo URL..."
                                className="flex-1 h-10 bg-gray-50/80 border-0 ring-0 outline-none focus:bg-white focus:shadow-[0_0_0_2px_rgba(46,196,182,0.15)] text-gray-900 placeholder:text-gray-400 rounded-xl text-sm transition-all"
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
                                className="h-10 px-3 bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white rounded-xl"
                                disabled={!videoLinkInput.trim()}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {videoLinks.length > 0 && (
                              <div className="space-y-2 mt-2">
                                {videoLinks.map((link, index) => {
                                  const thumbnail = getVideoThumbnail(link);
                                  return (
                                    <div key={index} className="relative group flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                      {thumbnail ? (
                                        <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                          <img src={thumbnail} alt="Video" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Play className="h-4 w-4 text-white fill-white" />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="w-16 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                          <Play className="h-4 w-4 text-gray-400" />
                                        </div>
                                      )}
                                      <p className="flex-1 text-xs text-gray-600 truncate">{link}</p>
                                      <button
                                        type="button"
                                        onClick={() => removeVideoLink(index)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Error */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border border-red-100 rounded-xl"
                      >
                        <p className="text-red-600 text-sm">{error}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="relative px-6 py-4 bg-gray-50/80 border-t border-gray-100/80 flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-11 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-[#2EC4B6] hover:bg-[#2EC4B6]/90 text-white font-semibold rounded-xl shadow-lg shadow-[#2EC4B6]/20 transition-all"
                      disabled={isSubmitting || !title.trim() || !content.trim()}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Posting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Post
                          <Send className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
