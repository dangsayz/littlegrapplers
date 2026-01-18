import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@/lib/constants';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { FileCheck, Search, Eye, User, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabaseAdmin } from '@/lib/supabase';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; consent?: string }>;
}

export default async function AdminWaiversPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user || !user.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect('/dashboard');
  }

  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count for pagination
  let countQuery = supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true });

  if (resolvedSearchParams.search) {
    countQuery = countQuery.or(
      `guardian_full_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_full_name.ilike.%${resolvedSearchParams.search}%`
    );
  }

  if (resolvedSearchParams.consent === 'granted') {
    countQuery = countQuery.eq('photo_media_consent', true);
  } else if (resolvedSearchParams.consent === 'not-granted') {
    countQuery = countQuery.eq('photo_media_consent', false);
  }

  const { count: totalCount } = await countQuery;
  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  // Fetch waivers with pagination
  let query = supabaseAdmin
    .from('signed_waivers')
    .select('*')
    .order('signed_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (resolvedSearchParams.search) {
    query = query.or(
      `guardian_full_name.ilike.%${resolvedSearchParams.search}%,guardian_email.ilike.%${resolvedSearchParams.search}%,child_full_name.ilike.%${resolvedSearchParams.search}%`
    );
  }

  if (resolvedSearchParams.consent === 'granted') {
    query = query.eq('photo_media_consent', true);
  } else if (resolvedSearchParams.consent === 'not-granted') {
    query = query.eq('photo_media_consent', false);
  }

  const { data: waivers, error } = await query;

  // Get stats
  const { count: totalWaivers } = await supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true });

  const { count: consentGranted } = await supabaseAdmin
    .from('signed_waivers')
    .select('*', { count: 'exact', head: true })
    .eq('photo_media_consent', true);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Build search params for pagination
  const paginationParams: Record<string, string> = {};
  if (resolvedSearchParams.search) paginationParams.search = resolvedSearchParams.search;
  if (resolvedSearchParams.consent) paginationParams.consent = resolvedSearchParams.consent;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header - Clean Apple Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/50">
            <FileCheck className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Waivers</h1>
            <p className="text-slate-500 text-sm">Signed enrollment forms</p>
          </div>
        </div>
      </div>

      {/* Stats Row - Unified Container */}
      <div className="flex items-stretch bg-white rounded-2xl border border-slate-200/60 divide-x divide-slate-100">
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FileCheck className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{totalWaivers || 0}</div>
        </div>
        <Link href="/dashboard/admin/waivers?consent=granted" className="flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs text-slate-500">Consent</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{consentGranted || 0}</div>
        </Link>
        <Link href="/dashboard/admin/waivers?consent=not-granted" className="flex-1 px-5 py-4 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center gap-1.5 mb-1">
            <Baby className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs text-slate-500">No Consent</span>
          </div>
          <div className="text-2xl font-semibold text-slate-900">{(totalWaivers || 0) - (consentGranted || 0)}</div>
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            name="search"
            placeholder="Search..."
            defaultValue={resolvedSearchParams.search}
            className="pl-10 border-slate-200 bg-white h-10"
          />
        </div>
        <Button type="submit" className="bg-slate-800 text-white hover:bg-slate-700 h-10">
          Search
        </Button>
      </form>

      {/* Waiver List - Clean Cards */}
      <div className="space-y-2">
        {(waivers || []).map((waiver) => (
          <Link 
            key={waiver.id} 
            href={`/dashboard/admin/waivers/${waiver.id}`}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200/60 hover:bg-slate-50/50 transition-colors group"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
              <span className="text-sm font-medium text-slate-600">
                {waiver.guardian_full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            
            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 truncate">{waiver.guardian_full_name}</p>
                {waiver.photo_media_consent ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-600 rounded">Consent</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded">No Consent</span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">{waiver.child_full_name}</p>
            </div>
            
            {/* Date */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400">{formatDate(waiver.signed_at)}</p>
            </div>
            
            {/* Arrow */}
            <Eye className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
          </Link>
        ))}
        
        {(!waivers || waivers.length === 0) && (
          <div className="text-center py-12 text-slate-400">
            No waivers found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-400">
            {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, totalCount || 0)} of {totalCount || 0}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/dashboard/admin/waivers"
            searchParams={paginationParams}
          />
        </div>
      )}
    </div>
  );
}
