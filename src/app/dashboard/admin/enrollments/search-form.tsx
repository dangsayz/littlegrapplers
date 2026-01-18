'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Location {
  id: string;
  name: string;
}

interface SearchFormProps {
  locations: Location[];
  defaultSearch?: string;
  defaultStatus?: string;
  defaultLocation?: string;
}

export function SearchForm({ locations, defaultSearch, defaultStatus, defaultLocation }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(defaultSearch || '');
  const [status, setStatus] = useState(defaultStatus || 'all');
  const [location, setLocation] = useState(defaultLocation || 'all');

  // Debounced search - auto-search after typing stops
  const updateUrl = useCallback((newSearch: string, newStatus: string, newLocation: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus && newStatus !== 'all') params.set('status', newStatus);
    if (newLocation && newLocation !== 'all') params.set('location', newLocation);
    
    const queryString = params.toString();
    router.push(`/dashboard/admin/enrollments${queryString ? `?${queryString}` : ''}`);
  }, [router]);

  // Auto-search with debounce when search text changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== defaultSearch) {
        updateUrl(search, status, location);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [search, status, location, defaultSearch, updateUrl]);

  // Immediate update when dropdowns change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateUrl(search, newStatus, location);
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    updateUrl(search, status, newLocation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(search, status, location);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10 h-10 border-slate-200 bg-white rounded-lg"
        />
      </div>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 min-w-[130px]"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="active">Active</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={location}
        onChange={(e) => handleLocationChange(e.target.value)}
        className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 min-w-[160px]"
      >
        <option value="all">All Locations</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>
      <Button type="submit" size="sm" className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
        Filter
      </Button>
    </form>
  );
}
