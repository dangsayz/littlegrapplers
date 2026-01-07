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
  Eye
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(prev => prev.map(m => m.id === editingMedia.id ? { ...m, ...data.media } : m));
        setEditingMedia(null);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload videos and images to share with locations</p>
        </div>
        <button
          onClick={() => document.getElementById('file-input')?.click()}
          className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload Media
        </button>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'bg-teal-50 border border-teal-300'
            : 'bg-gray-50 border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50'
        }`}
      >
        <input {...getInputProps()} id="file-input" />
        <div className={`h-14 w-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${
          isDragActive ? 'bg-teal-500' : 'bg-gray-200'
        }`}>
          <Upload className={`h-7 w-7 ${isDragActive ? 'text-white' : 'text-gray-500'}`} />
        </div>
        <p className={`text-lg font-medium ${isDragActive ? 'text-teal-700' : 'text-gray-700'}`}>
          {isDragActive ? 'Drop your file here' : 'Drag & drop a video or image'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          or <span className="text-teal-600 font-medium">browse</span> to choose a file
        </p>
        <p className="text-xs text-gray-400 mt-3">
          JPG, PNG, GIF, WEBP, MP4, MOV, WEBM (max 500MB)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(['all', 'video', 'image'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type === 'video' ? 'Videos' : 'Images'}
              <span className="ml-2 text-xs opacity-70">
                ({type === 'all' ? media.length : media.filter(m => m.file_type === type).length})
              </span>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">{filteredMedia.length} items</p>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="h-12 w-12 rounded-lg bg-gray-200 mx-auto mb-4 flex items-center justify-center">
            <Upload className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No media uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload your first video or image above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Thumbnail */}
              <div 
                className="aspect-video bg-gray-100 relative cursor-pointer overflow-hidden"
                onClick={() => setPreviewMedia(item)}
              >
                {item.file_type === 'video' ? (
                  <>
                    <video
                      src={item.file_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="h-5 w-5 text-gray-800 ml-0.5" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img
                    src={item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.file_type === 'video' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {item.file_type === 'video' ? 'Video' : 'Image'}
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMedia(item);
                    }}
                    className="h-8 w-8 rounded-lg bg-gray-900/80 text-white flex items-center justify-center hover:bg-gray-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="h-8 w-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div 
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setEditingMedia(item)}
              >
                <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(item.file_size)}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.all_locations ? 'All' : item.media_locations?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal - Apple Inspired */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-[420px] p-0 overflow-hidden max-h-[85vh] flex flex-col rounded-2xl border-0 shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <DialogTitle className="text-xl font-semibold text-gray-900 tracking-tight">Upload Media</DialogTitle>
            <p className="text-[15px] text-gray-500 mt-1">Share with your gym locations</p>
          </div>

          <div className="px-8 pb-6 space-y-6 overflow-y-auto flex-1">
            {/* File Preview */}
            {uploadForm.file && (
              <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                  uploadForm.file.type.startsWith('video/') ? 'bg-red-500/10' : 'bg-blue-500/10'
                }`}>
                  {uploadForm.file.type.startsWith('video/') ? (
                    <Video className="h-7 w-7 text-red-500" />
                  ) : (
                    <ImageIcon className="h-7 w-7 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-gray-900 truncate">{uploadForm.file.name}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">{formatFileSize(uploadForm.file.size)}</p>
                </div>
                <button
                  onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                  className="p-2.5 hover:bg-gray-200/80 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">Title</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give this media a name"
                className="h-12 rounded-xl border-gray-200 bg-gray-50/50 text-[15px] focus:border-gray-300 focus:ring-0 focus:bg-white transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">
                Description <span className="font-normal normal-case">(optional)</span>
              </label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows={2}
                className="rounded-xl border-gray-200 bg-gray-50/50 text-[15px] focus:border-gray-300 focus:ring-0 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Location Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[15px] font-medium text-gray-900">All Locations</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">Visible to every gym</p>
                </div>
                <Switch
                  checked={uploadForm.allLocations}
                  onCheckedChange={(checked) => setUploadForm(prev => ({ 
                    ...prev, 
                    allLocations: checked,
                    locationIds: [],
                  }))}
                />
              </div>

              {!uploadForm.allLocations && (
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-gray-500 uppercase tracking-wide">Select Locations</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {locations.length === 0 ? (
                      <p className="text-[15px] text-gray-500 text-center py-4">No locations found</p>
                    ) : (
                      locations.map((location) => (
                        <label
                          key={location.id}
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                            uploadForm.locationIds.includes(location.id)
                              ? 'bg-teal-50 border-2 border-teal-500'
                              : 'bg-gray-50/80 border-2 border-transparent hover:bg-gray-100/80'
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
                            className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                          />
                          <span className="text-[15px] font-medium text-gray-900">{location.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
            {isUploading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Uploading...</span>
                  <span className="text-gray-500">Please wait</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-gray-400 text-center">Large files may take a moment</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 h-11 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.file || !uploadForm.title}
                  className="flex-1 h-11 rounded-xl bg-teal-500 text-sm font-medium text-white hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="p-5 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="text-lg font-semibold text-gray-900">Edit Media</DialogTitle>
          </div>
          
          {editingMedia && (
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                {editingMedia.file_type === 'video' ? (
                  <video
                    src={editingMedia.file_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={editingMedia.file_url}
                    alt={editingMedia.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="rounded-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={editingMedia.description || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={3}
                  className="rounded-lg resize-none"
                />
              </div>

              {/* Location Info */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <p className="text-sm font-medium text-gray-700">Shared to</p>
                <div className="flex flex-wrap gap-2">
                  {editingMedia.all_locations ? (
                    <span className="px-3 py-1.5 bg-teal-100 text-teal-700 text-sm font-medium rounded-lg">
                      All Locations
                    </span>
                  ) : editingMedia.media_locations && editingMedia.media_locations.length > 0 ? (
                    editingMedia.media_locations.map((loc) => (
                      <span key={loc.location_id} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg">
                        {loc.locations?.name || 'Unknown'}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No locations assigned</span>
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatFileSize(editingMedia.file_size)}</span>
                <span>{editingMedia.file_type === 'video' ? 'Video' : 'Image'}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <button
              onClick={() => editingMedia && handleDelete(editingMedia.id)}
              className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingMedia(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
