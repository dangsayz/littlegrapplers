'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Video, Save, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VIDEO_CATEGORIES } from '@/lib/constants';

interface Location {
  id: string;
  name: string;
}

export default function NewVideoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    category: 'Fundamentals',
    isPublic: false,
    allLocations: true,
    locationIds: [] as string[],
  });

  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/locations/list');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create video');
      }

      router.push('/dashboard/admin/videos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={"/dashboard/admin/videos" as never}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Videos
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Video className="h-6 w-6 text-brand" />
          Add New Video
        </h1>
        <p className="text-muted-foreground mt-1">
          Add a training video to the library
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Basic Side Control"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="YouTube or Vimeo URL"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, or direct video URLs
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                <Input
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="Leave empty to auto-generate from YouTube"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 180 for 3 minutes"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this video covers..."
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="isPublic" className="font-medium">
                    Public Video
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show this video on the public marketing site
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>

              {/* Location Selection */}
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Share to Locations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Choose which locations can see this video
                    </p>
                  </div>
                  <Switch
                    id="allLocations"
                    checked={formData.allLocations}
                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, allLocations: checked, locationIds: [] })}
                  />
                </div>
                
                {formData.allLocations ? (
                  <p className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    Video will be visible to all locations
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Select specific locations:</p>
                    <div className="grid gap-2">
                      {locations.map((location) => (
                        <label
                          key={location.id}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            checked={formData.locationIds.includes(location.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  locationIds: [...formData.locationIds, location.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  locationIds: formData.locationIds.filter((id) => id !== location.id),
                                });
                              }
                            }}
                          />
                          <span className="text-sm font-medium">{location.name}</span>
                        </label>
                      ))}
                    </div>
                    {formData.locationIds.length === 0 && (
                      <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        Select at least one location
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href={"/dashboard/admin/videos" as never}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Video
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
