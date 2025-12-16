'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Send, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Template {
  id: string;
  name: string;
  slug: string;
  subject: string;
  body_html: string;
  variables: string[];
}

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface ComposeEmailProps {
  templates: Template[];
  users: User[];
  locations: Location[];
}

export function ComposeEmail({ templates, users, locations }: ComposeEmailProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<'all' | 'location' | 'individual'>('all');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body_html);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const recipientFilter: Record<string, unknown> = {};
      
      if (recipientType === 'location' && selectedLocation) {
        recipientFilter.location_id = selectedLocation;
      } else if (recipientType === 'individual') {
        recipientFilter.user_ids = selectedUsers;
      }

      const res = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body_html: body,
          recipient_filter: recipientFilter,
          template_id: selectedTemplate || null,
        }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
        // Reset form
        setSubject('');
        setBody('');
        setSelectedTemplate('');
        setRecipientType('all');
        setSelectedUsers([]);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Compose Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send an email to your community members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Use Template (optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={recipientType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('all')}
              >
                <Users className="h-4 w-4 mr-2" />
                All Users
              </Button>
              <Button
                type="button"
                variant={recipientType === 'location' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('location')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                By Location
              </Button>
              <Button
                type="button"
                variant={recipientType === 'individual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRecipientType('individual')}
              >
                Individual
              </Button>
            </div>

            {recipientType === 'location' && (
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {recipientType === 'individual' && (
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <label htmlFor={user.id} className="text-sm cursor-pointer">
                      {user.first_name} {user.last_name} ({user.email})
                    </label>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users available</p>
                )}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              You can use variables like {"{{first_name}}"}, {"{{location_name}}"} in your message.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !subject || !body}
          >
            {isLoading ? 'Sending...' : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
