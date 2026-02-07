'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  MapPin, 
  Loader2,
  X,
  Check,
  Play,
  Eye,
  Plus,
  Film,
  ImagePlus,
  MoreHorizontal,
  Clock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase for direct uploads (bypasses Next.js body limit)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Location {
  id: string;
  name: string;
}

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: 'video' | 'image';
  file_size: number;
  created_at: string;
  all_locations: boolean;
  media_locations?: Array<{
    location_id: string;
    locations: { id: string; name: string };
  }>;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'image'>('all');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editAllLocations, setEditAllLocations] = useState(true);
  const [editLocationIds, setEditLocationIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    allLocations: true,
    locationIds: [] as string[],
    file: null as File | null,
  });

  // Fetch media and locations
  useEffect(() => {
    const fetchData = async () => {
      const [mediaRes, locationsRes] = await Promise.all([
        fetch('/api/media'),
        fetch('/api/locations/list'),
      ]);

      if (mediaRes.ok) {
        const data = await mediaRes.json();
        setMedia(data.media || []);
      }

      if (locationsRes.ok) {
        const data = await locationsRes.json();
        setLocations(data.locations || []);
      }
    };

    fetchData();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadForm(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }));
      setShowUploadModal(true);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.webm', '.avi'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB max
    multiple: false,
  });

  const handleUpload = async () => {
    if (!uploadForm.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const file = uploadForm.file;
      const isVideo = file.type.startsWith('video/');
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
      const folder = isVideo ? 'videos' : 'images';
      const filePath = `${folder}/${filename}`;

      // Direct upload to Supabase Storage (bypasses Next.js 10MB limit)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Storage error: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Save media record via API (small JSON payload)
      const response = await fetch('/api/media/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadForm.title,
          description: uploadForm.description,
          fileUrl,
          filePath,
          fileType: isVideo ? 'video' : 'image',
          fileSize: file.size,
          mimeType: file.type,
          allLocations: uploadForm.allLocations,
          locationIds: uploadForm.locationIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save media record');
      }

      const data = await response.json();
      setMedia(prev => [data.media, ...prev]);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        allLocations: true,
        locationIds: [],
        file: null,
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedia(prev => prev.filter(m => m.id !== id));
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMedia) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/media/${editingMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingMedia.title,
          description: editingMedia.description,
          allLocations: editAllLocations,
          locationIds: editLocationIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(prev => prev.map(m => m.id === editingMedia.id ? { ...m, ...data.media } : m));
        setEditingMedia(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save failed:', response.status, errorData);
        alert(errorData.error || 'Failed to save changes. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMedia = media.filter(m => {
    if (filter === 'all') return true;
    return m.file_type === filter;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen">
      {/* Apple-style Header */}
      <div className="mb-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[32px] font-semibold text-gray-900 tracking-tight">Media</h1>
            <p className="text-[15px] text-gray-500 mt-1">Manage your videos and images</p>
          </div>
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="h-9 px-4 bg-[#007AFF] hover:bg-[#0066D6] text-white text-[13px] font-medium rounded-full flex items-center gap-1.5 transition-all shadow-sm hover:shadow"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Media
          </button>
        </div>
      </div>

      {/* Apple-style Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 mb-8 ${
          isDragActive
            ? 'bg-[#007AFF]/5 border-2 border-[#007AFF] scale-[1.01]'
            : 'bg-gradient-to-b from-gray-50 to-gray-100/50 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:from-gray-100/50 hover:to-gray-100'
        }`}
      >
        <input {...getInputProps()} id="file-input" />
        <div className={`h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
          isDragActive 
            ? 'bg-[#007AFF] shadow-lg shadow-[#007AFF]/25' 
            : 'bg-white shadow-sm border border-gray-200'
        }`}>
          <Upload className={`h-7 w-7 transition-colors ${isDragActive ? 'text-white' : 'text-gray-400'}`} strokeWidth={1.5} />
        </div>
        <p className={`text-[17px] font-medium transition-colors ${isDragActive ? 'text-[#007AFF]' : 'text-gray-800'}`}>
          {isDragActive ? 'Drop to upload' : 'Drop files here'}
        </p>
        <p className="text-[13px] text-gray-500 mt-1.5">
          or <span className="text-[#007AFF] font-medium hover:underline">browse</span> from your computer
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5" />
            MP4, MOV, WEBM
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            JPG, PNG, GIF, WEBP
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-[11px] text-gray-400">Max 500MB</span>
        </div>
      </div>

      {/* Apple-style Segmented Control */}
      <div className="flex items-center justify-between mb-6">
        <div className="inline-flex bg-gray-100/80 p-1 rounded-lg">
          {(['all', 'video', 'image'] as const).map((type) => {
            const count = type === 'all' ? media.length : media.filter(m => m.file_type === type).length;
            const isActive = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {type === 'all' ? 'All' : type === 'video' ? 'Videos' : 'Images'}
                <span className={`ml-1.5 ${isActive ? 'text-gray-400' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[13px] text-gray-400">{filteredMedia.length} items</p>
      </div>

      {/* Apple-style Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-b from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center mb-5">
            {filter === 'video' ? (
              <Film className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
            ) : filter === 'image' ? (
              <ImageIcon className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
            ) : (
              <Upload className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
            )}
          </div>
          <p className="text-[17px] font-medium text-gray-800">No {filter === 'all' ? 'media' : filter === 'video' ? 'videos' : 'images'} yet</p>
          <p className="text-[13px] text-gray-400 mt-1">Upload your first file to get started</p>
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="mt-5 h-9 px-5 bg-[#007AFF] hover:bg-[#0066D6] text-white text-[13px] font-medium rounded-full transition-colors"
          >
            Upload {filter === 'video' ? 'Video' : filter === 'image' ? 'Image' : 'Media'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ring-1 ring-gray-200/50 hover:ring-gray-300"
              onClick={() => {
                setEditingMedia(item);
                setEditAllLocations(item.all_locations);
                setEditLocationIds(item.media_locations?.map(ml => ml.location_id) || []);
              }}
            >
              {/* Thumbnail */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                {item.file_type === 'video' ? (
                  <>
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-transparent">
                      <div className="h-12 w-12 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 text-gray-800 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                
                {/* Type Badge - Pill style */}
                <div className="absolute top-3 left-3">
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md ${
                    item.file_type === 'video' 
                      ? 'bg-black/60 text-white' 
                      : 'bg-white/80 text-gray-700'
                  }`}>
                    {item.file_type === 'video' ? 'VIDEO' : 'IMAGE'}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMedia(item);
                    }}
                    className="h-8 w-8 rounded-full bg-white/90 backdrop-blur text-gray-700 flex items-center justify-center hover:bg-white shadow-sm transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="h-8 w-8 rounded-full bg-white/90 backdrop-blur text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white shadow-sm transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info - Clean Apple style */}
              <div className="p-4">
                <p className="font-medium text-[15px] text-gray-900 truncate leading-tight">{item.title}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[12px] text-gray-400">{formatFileSize(item.file_size)}</span>
                  <span className="text-[12px] text-gray-400 flex items-center gap-1">
                    {item.all_locations ? (
                      <>
                        <Globe className="h-3 w-3" />
                        All locations
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3" />
                        {item.media_locations?.length || 0} location{(item.media_locations?.length || 0) !== 1 ? 's' : ''}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal - Apple Inspired */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-[440px] p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[17px] font-semibold text-gray-900 text-center">New Upload</DialogTitle>
          </div>

          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
            {/* File Preview */}
            {uploadForm.file && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  uploadForm.file.type.startsWith('video/') ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  {uploadForm.file.type.startsWith('video/') ? (
                    <Film className="h-5 w-5 text-purple-600" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">{uploadForm.file.name}</p>
                  <p className="text-[12px] text-gray-500">{formatFileSize(uploadForm.file.size)}</p>
                </div>
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-600">Title</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title"
                className="h-11 rounded-xl border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:border-[#007AFF] focus:ring-[#007AFF]/20 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-600">
                Description <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows={2}
                className="rounded-xl border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:border-[#007AFF] focus:ring-[#007AFF]/20 transition-all resize-none"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <label className="text-[13px] font-medium text-gray-600">Visibility</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-gray-900">All Locations</p>
                    <p className="text-[12px] text-gray-500">Everyone can see this</p>
                  </div>
                </div>
                <Switch
                  checked={uploadForm.allLocations}
                  onCheckedChange={(checked) => setUploadForm(prev => ({ 
                    ...prev, 
                    allLocations: checked,
                    locationIds: [],
                  }))}
                  className="data-[state=checked]:bg-[#007AFF]"
                />
              </div>

              {!uploadForm.allLocations && locations.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {locations.map((location) => (
                    <label
                      key={location.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        uploadForm.locationIds.includes(location.id)
                          ? 'bg-[#007AFF]/5 ring-1 ring-[#007AFF]'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={uploadForm.locationIds.includes(location.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setUploadForm(prev => ({
                              ...prev,
                              locationIds: [...prev.locationIds, location.id],
                            }));
                          } else {
                            setUploadForm(prev => ({
                              ...prev,
                              locationIds: prev.locationIds.filter(id => id !== location.id),
                            }));
                          }
                        }}
                        className="data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF]"
                      />
                      <span className="text-[14px] font-medium text-gray-900">{location.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex-shrink-0">
            {isUploading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-[13px] text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#007AFF] rounded-full animate-pulse w-3/5" />
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 h-10 rounded-xl bg-white border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.file || !uploadForm.title}
                  className="flex-1 h-10 rounded-xl bg-[#007AFF] text-[14px] font-medium text-white hover:bg-[#0066D6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - Apple Inspired */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent className="max-w-[520px] p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <DialogTitle className="text-[17px] font-semibold text-gray-900">Details</DialogTitle>
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              editingMedia?.file_type === 'video' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {editingMedia?.file_type === 'video' ? 'VIDEO' : 'IMAGE'}
            </div>
          </div>
          
          {editingMedia && (
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
              {/* Preview */}
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-inner">
                {editingMedia.file_type === 'video' ? (
                  <video
                    src={editingMedia.file_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={editingMedia.file_url}
                    alt={editingMedia.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-600">Title</label>
                <Input
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 bg-white text-[15px] focus:border-[#007AFF] focus:ring-[#007AFF]/20 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-gray-600">Description</label>
                <Textarea
                  value={editingMedia.description || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={2}
                  className="rounded-xl border-gray-200 bg-white text-[15px] placeholder:text-gray-400 focus:border-[#007AFF] focus:ring-[#007AFF]/20 transition-all resize-none"
                />
              </div>

              {/* Visibility */}
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-gray-600">Visibility</label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-gray-900">All Locations</p>
                      <p className="text-[12px] text-gray-500">Everyone can see this</p>
                    </div>
                  </div>
                  <Switch
                    checked={editAllLocations}
                    onCheckedChange={(checked) => {
                      setEditAllLocations(checked);
                      if (checked) setEditLocationIds([]);
                    }}
                    className="data-[state=checked]:bg-[#007AFF]"
                  />
                </div>

                {!editAllLocations && locations.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {locations.map((location) => (
                      <label
                        key={location.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          editLocationIds.includes(location.id)
                            ? 'bg-[#007AFF]/5 ring-1 ring-[#007AFF]'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <Checkbox
                          checked={editLocationIds.includes(location.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditLocationIds(prev => [...prev, location.id]);
                            } else {
                              setEditLocationIds(prev => prev.filter(id => id !== location.id));
                            }
                          }}
                          className="data-[state=checked]:bg-[#007AFF] data-[state=checked]:border-[#007AFF]"
                        />
                        <span className="text-[14px] font-medium text-gray-900">{location.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex items-center gap-4 text-[12px] text-gray-400">
                <span>{formatFileSize(editingMedia.file_size)}</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span>Uploaded {new Date(editingMedia.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => editingMedia && handleDelete(editingMedia.id)}
              className="h-10 px-4 text-red-500 text-[14px] font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingMedia(null)}
                className="h-10 px-5 text-[14px] font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="h-10 px-5 bg-[#007AFF] text-white text-[14px] font-medium rounded-xl hover:bg-[#0066D6] transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
