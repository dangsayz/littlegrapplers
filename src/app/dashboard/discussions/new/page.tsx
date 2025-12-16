'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewDiscussionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading...');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  // Fetch location name from API
  useEffect(() => {
    const fetchLocationName = async () => {
      if (!locationId) {
        setLocationName('Unknown Location');
        return;
      }
      try {
        const res = await fetch(`/api/locations/${locationId}`);
        if (res.ok) {
          const data = await res.json();
          setLocationName(data.name || 'Unknown Location');
        }
      } catch {
        setLocationName('Unknown Location');
      }
    };
    fetchLocationName();
  }, [locationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          locationId,
        }),
      });

      if (res.ok) {
        router.push('/dashboard/discussions');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create discussion');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Link */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/discussions" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Link>
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-brand" />
            Start a New Discussion
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Posting to: <span className="font-medium text-foreground">{locationName}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What would you like to discuss?"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts, questions, or ideas..."
                rows={6}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Posting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Discussion
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/discussions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
