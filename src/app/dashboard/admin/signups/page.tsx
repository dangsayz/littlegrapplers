'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MapPin,
  CreditCard,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Signup {
  id: string;
  clerkUserId: string;
  dbUserId: string | null;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string | null;
  childName: string;
  childDob: string | null;
  signedAt: string;
  hasAccount: boolean;
  accountStatus: string | null;
  locationId: string | null;
  locationName: string | null;
  locationSlug: string | null;
  hasLocationAccess: boolean;
  hasPaid: boolean;
  subscriptionStatus: string | null;
}

interface Location {
  id: string;
  name: string;
  slug: string;
}

interface Summary {
  total: number;
  withAccount: number;
  withLocationAccess: number;
  withPayment: number;
  needsAttention: number;
}

export default function AdminSignupsPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'needs-access' | 'no-payment'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [selectedSignup, setSelectedSignup] = useState<Signup | null>(null);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const fetchSignups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/signups');
      if (res.ok) {
        const data = await res.json();
        setSignups(data.signups);
        setLocations(data.locations);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching signups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/signups/sync-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Synced ${data.stats.synced} signups. ${data.stats.usersCreated} new users created.`);
        fetchSignups();
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync signups');
    } finally {
      setSyncing(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedSignup || !selectedLocation) return;
    
    setGrantingAccess(true);
    try {
      const res = await fetch('/api/admin/signups/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waiverId: selectedSignup.id,
          locationId: selectedLocation,
        }),
      });

      if (res.ok) {
        alert('Access granted successfully!');
        setSelectedSignup(null);
        setSelectedLocation('');
        fetchSignups();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to grant access');
      }
    } catch (error) {
      console.error('Grant access error:', error);
      alert('Failed to grant access');
    } finally {
      setGrantingAccess(false);
    }
  };

  const exportToCsv = () => {
    const filtered = getFilteredSignups();
    const headers = ['Guardian Name', 'Email', 'Phone', 'Child Name', 'Signed At', 'Location', 'Has Account', 'Has Access', 'Has Paid'];
    const rows = filtered.map(s => [
      s.guardianName,
      s.guardianEmail,
      s.guardianPhone || '',
      s.childName,
      new Date(s.signedAt).toLocaleDateString(),
      s.locationName || 'Not assigned',
      s.hasAccount ? 'Yes' : 'No',
      s.hasLocationAccess ? 'Yes' : 'No',
      s.hasPaid ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signups-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getFilteredSignups = () => {
    let filtered = signups;

    if (filter === 'needs-access') {
      filtered = filtered.filter(s => !s.hasLocationAccess);
    } else if (filter === 'no-payment') {
      filtered = filtered.filter(s => !s.hasPaid);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(s => s.locationId === locationFilter);
    }

    return filtered;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredSignups = getFilteredSignups();

  return (
    <div className="space-y-8">
      <Link 
        href="/dashboard/admin"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Admin
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-sm">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white">
                All Signups
              </h1>
              <p className="text-slate-400 mt-1">
                Unified view of waivers, accounts, and payment status
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportToCsv}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={handleSyncAll}
              disabled={syncing}
              className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync All to Locations'}
            </Button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-slate-50/80 to-gray-50/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-500">Total Signups</span>
              </div>
              <div className="text-3xl font-bold text-slate-700 mt-1">{summary.total}</div>
            </CardContent>
          </Card>
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-blue-50/80 to-indigo-50/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-500">With Account</span>
              </div>
              <div className="text-3xl font-bold text-blue-700 mt-1">{summary.withAccount}</div>
            </CardContent>
          </Card>
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-teal-50/80 to-cyan-50/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-600" />
                <span className="text-sm text-slate-500">Location Access</span>
              </div>
              <div className="text-3xl font-bold text-teal-700 mt-1">{summary.withLocationAccess}</div>
            </CardContent>
          </Card>
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-green-50/80 to-emerald-50/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm text-slate-500">Paid</span>
              </div>
              <div className="text-3xl font-bold text-green-700 mt-1">{summary.withPayment}</div>
            </CardContent>
          </Card>
          <Card className="border border-white/60 shadow-sm bg-gradient-to-br from-orange-50/80 to-amber-50/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-slate-500">Needs Attention</span>
              </div>
              <div className="text-3xl font-bold text-orange-700 mt-1">{summary.needsAttention}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Signups</SelectItem>
                  <SelectItem value="needs-access">Needs Location Access</SelectItem>
                  <SelectItem value="no-payment">No Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(loc => (
                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-sm text-slate-500">
              Showing {filteredSignups.length} of {signups.length} signups
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/60 shadow-sm bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">Signups</CardTitle>
          <CardDescription>
            Click on a row to assign location access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredSignups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">No signups found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Guardian / Child</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Signed</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignups.map((signup) => (
                    <TableRow 
                      key={signup.id} 
                      className="cursor-pointer hover:bg-slate-50/80"
                      onClick={() => {
                        setSelectedSignup(signup);
                        setSelectedLocation(signup.locationId || '');
                      }}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-700">{signup.guardianName}</p>
                          <p className="text-sm text-slate-500">{signup.childName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Mail className="h-3 w-3" />
                            {signup.guardianEmail}
                          </div>
                          {signup.guardianPhone && (
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Phone className="h-3 w-3" />
                              {signup.guardianPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {formatDate(signup.signedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {signup.locationName ? (
                          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                            {signup.locationName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Not assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {signup.hasAccount ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300" />
                        )}
                      </TableCell>
                      <TableCell>
                        {signup.hasLocationAccess ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-300" />
                        )}
                      </TableCell>
                      <TableCell>
                        {signup.hasPaid ? (
                          <Badge className="bg-green-500">Paid</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500">Unpaid</Badge>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `mailto:${signup.guardianEmail}`}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSignup} onOpenChange={(open) => !open && setSelectedSignup(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Location Access</DialogTitle>
            <DialogDescription>
              Assign {selectedSignup?.guardianName} to a location
            </DialogDescription>
          </DialogHeader>
          
          {selectedSignup && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <p><strong>Guardian:</strong> {selectedSignup.guardianName}</p>
                <p><strong>Email:</strong> {selectedSignup.guardianEmail}</p>
                <p><strong>Child:</strong> {selectedSignup.childName}</p>
                <div className="flex gap-2 mt-2">
                  {selectedSignup.hasAccount && (
                    <Badge className="bg-blue-500">Has Account</Badge>
                  )}
                  {selectedSignup.hasLocationAccess && (
                    <Badge className="bg-teal-500">Has Access</Badge>
                  )}
                  {selectedSignup.hasPaid && (
                    <Badge className="bg-green-500">Paid</Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Select Location
                </label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSignup(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGrantAccess}
              disabled={!selectedLocation || grantingAccess}
              className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-0"
            >
              {grantingAccess ? 'Granting...' : 'Grant Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
