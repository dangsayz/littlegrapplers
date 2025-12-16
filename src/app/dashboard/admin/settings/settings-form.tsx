'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Mail, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsFormProps {
  settings: Record<string, unknown>;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse settings with defaults
  const [emailProvider, setEmailProvider] = useState(
    (settings.email_provider as string)?.replace(/"/g, '') || 'resend'
  );
  const [emailFromAddress, setEmailFromAddress] = useState(
    (settings.email_from_address as string)?.replace(/"/g, '') || ''
  );
  const [emailFromName, setEmailFromName] = useState(
    (settings.email_from_name as string)?.replace(/"/g, '') || ''
  );
  const [autoSuspendReports, setAutoSuspendReports] = useState(
    String(settings.auto_suspend_after_reports || 3)
  );
  const [pinExpiryDays, setPinExpiryDays] = useState(
    String(settings.pin_expiry_days || 30)
  );

  const handleSave = async () => {
    setIsLoading(true);
    setSaved(false);

    try {
      const updates = [
        { key: 'email_provider', value: JSON.stringify(emailProvider) },
        { key: 'email_from_address', value: JSON.stringify(emailFromAddress) },
        { key: 'email_from_name', value: JSON.stringify(emailFromName) },
        { key: 'auto_suspend_after_reports', value: autoSuspendReports },
        { key: 'pin_expiry_days', value: pinExpiryDays },
      ];

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updates }),
      });

      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Email Settings</CardTitle>
          </div>
          <CardDescription>
            Configure how emails are sent from the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Email Provider</Label>
            <Select value={emailProvider} onValueChange={setEmailProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resend">Resend</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAddress">From Email Address</Label>
            <Input
              id="fromAddress"
              type="email"
              value={emailFromAddress}
              onChange={(e) => setEmailFromAddress(e.target.value)}
              placeholder="hello@littlegrapplers.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={emailFromName}
              onChange={(e) => setEmailFromName(e.target.value)}
              placeholder="Little Grapplers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Moderation Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Moderation Settings</CardTitle>
          </div>
          <CardDescription>
            Configure content moderation thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="autoSuspend">Auto-hide after reports</Label>
            <Input
              id="autoSuspend"
              type="number"
              min="1"
              max="10"
              value={autoSuspendReports}
              onChange={(e) => setAutoSuspendReports(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Automatically hide content after this many reports
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Community Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Community Settings</CardTitle>
          </div>
          <CardDescription>
            Configure community access settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pinExpiry">PIN Access Expiry (days)</Label>
            <Input
              id="pinExpiry"
              type="number"
              min="1"
              max="365"
              value={pinExpiryDays}
              onChange={(e) => setPinExpiryDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              How long a PIN verification lasts before requiring re-entry
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">Settings saved successfully!</span>
        )}
      </div>
    </div>
  );
}
