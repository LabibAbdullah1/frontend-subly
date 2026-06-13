// src/pages/admin/tabs/AdminUsersTab.tsx
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Filter, X, Calendar } from 'lucide-react';
import { CardPanel } from '../../../components/ui/CardPanel';
import { Badge } from '../../../components/ui/Badge';
import { Select } from '../../../components/ui/Select';
import { apiFetch } from '../../../utils/api';
import { useDataStore } from '../../../stores/useDataStore';

interface Props {
  onEditUser: (user: any) => void;
  onDeleteUser: (id: number) => void;
}

export const AdminUsersTab: React.FC<Props> = ({ onEditUser, onDeleteUser }) => {
  const { adminUsers } = useDataStore();

  // ─── Search & Filter State ────────────────────────────────────────────────
  const [memberSearchInput, setMemberSearchInput] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [filterSubdomain, setFilterSubdomain] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search using apiFetch (replaces axios dependency)
  const handleSearchChange = useCallback((value: string) => {
    setMemberSearchInput(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        await apiFetch<any>(`/auth/users?search=${encodeURIComponent(value)}`);
      } catch {
        // fallback silently – client-side filter still works
      } finally {
        setMemberSearch(value);
        setMemberPage(1);
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const handleClearFilters = () => {
    setMemberSearchInput('');
    setMemberSearch('');
    setFilterVerified('all');
    setFilterSubdomain('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setMemberPage(1);
  };

  // ─── Filtering & Pagination ───────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = [...adminUsers];

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (filterVerified === 'verified')   result = result.filter((u) => !!u.emailVerifiedAt);
    if (filterVerified === 'unverified') result = result.filter((u) => !u.emailVerifiedAt);
    if (filterSubdomain === 'active')    result = result.filter((u) => u.subdomains?.length > 0);
    if (filterSubdomain === 'none')      result = result.filter((u) => !u.subdomains?.length);
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      result = result.filter((u) => u.createdAt && new Date(u.createdAt) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((u) => u.createdAt && new Date(u.createdAt) <= to);
    }
    return result;
  }, [adminUsers, memberSearch, filterVerified, filterSubdomain, filterDateFrom, filterDateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / memberPageSize));

  const paginatedUsers = useMemo(() => {
    const start = (memberPage - 1) * memberPageSize;
    return filteredUsers.slice(start, start + memberPageSize);
  }, [filteredUsers, memberPage, memberPageSize]);

  const hasActiveFilters =
    memberSearch || filterVerified !== 'all' || filterSubdomain !== 'all' || filterDateFrom || filterDateTo;

  return (
    <CardPanel title="Kelola Member Client">
      {/* ── Filter Bar ── */}
      <div className="mt-3 space-y-3">
        {/* Row 1: Search + Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={memberSearchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari nama atau email klien..."
              className="w-full bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl pl-9 pr-10 py-2 text-xs font-semibold text-text-main outline-none transition-colors placeholder:text-text-muted/60"
            />
            {isSearching ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            ) : memberSearchInput ? (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Filter Verifikasi – Custom Select */}
          <div className="w-[160px]">
            <Select
              value={filterVerified}
              onChange={(e) => { setFilterVerified(e.target.value); setMemberPage(1); }}
              options={[
                { value: 'all',        label: 'Semua Status' },
                { value: 'verified',   label: '✅ Verified' },
                { value: 'unverified', label: '❌ Unverified' },
              ]}
            />
          </div>

          {/* Filter Subdomain – Custom Select */}
          <div className="w-[170px]">
            <Select
              value={filterSubdomain}
              onChange={(e) => { setFilterSubdomain(e.target.value); setMemberPage(1); }}
              options={[
                { value: 'all',    label: 'Semua Subdomain' },
                { value: 'active', label: '🟢 Ada Subdomain' },
                { value: 'none',   label: '⚪ Tanpa Subdomain' },
              ]}
            />
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <X className="h-3 w-3" /> Reset Filter
            </button>
          )}
        </div>

        {/* Row 2: Date Range + Stats + Page Size */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Bergabung:</span>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => { setFilterDateFrom(e.target.value); setMemberPage(1); }}
            className="bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-1.5 text-xs font-semibold text-text-main outline-none cursor-pointer transition-colors"
          />
          <span className="text-[10px] text-text-muted font-bold">s/d</span>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => { setFilterDateTo(e.target.value); setMemberPage(1); }}
            className="bg-bg-surface border border-border-main focus:border-brand-primary rounded-xl px-3 py-1.5 text-xs font-semibold text-text-main outline-none cursor-pointer transition-colors"
          />

          {/* Stats + Page Size Selector */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-text-muted">
              {isSearching ? 'Mencari...' : (
                <>
                  <span className="font-bold text-text-main">{filteredUsers.length}</span> klien
                  {hasActiveFilters && (
                    <span className="text-brand-primary"> (dari {adminUsers.length})</span>
                  )}
                </>
              )}
            </span>
            <div className="w-[110px]">
              <Select
                value={memberPageSize}
                onChange={(e) => { setMemberPageSize(Number(e.target.value)); setMemberPage(1); }}
                options={[
                  { value: 5,  label: '5 / halaman' },
                  { value: 10, label: '10 / halaman' },
                  { value: 20, label: '20 / halaman' },
                  { value: 50, label: '50 / halaman' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto w-full mt-3">
        <table className="w-full text-left min-w-[750px]">
          <thead>
            <tr className="border-b border-border-main/50 text-[9px] text-text-muted uppercase tracking-widest select-none">
              <th className="py-2.5 pb-2 px-4 font-bold">Nama Klien</th>
              <th className="py-2.5 pb-2 px-4 font-bold">Email</th>
              <th className="py-2.5 pb-2 px-4 text-center font-bold">Subdomain Aktif</th>
              <th className="py-2.5 pb-2 px-4 text-center font-bold">Verifikasi</th>
              <th className="py-2.5 pb-2 px-4 text-center font-bold">Bergabung</th>
              <th className="py-2.5 pb-2 px-4 text-right font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/30 text-xs">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="h-8 w-8 text-text-muted/25" />
                    <p className="text-xs text-text-muted font-medium">
                      {hasActiveFilters ? 'Tidak ada klien yang cocok dengan filter.' : 'Belum ada data klien.'}
                    </p>
                    {hasActiveFilters && (
                      <button onClick={handleClearFilters} className="text-xs text-brand-primary hover:underline font-bold cursor-pointer">
                        Reset semua filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((client) => {
                const activeSub = client.subdomains?.[0];
                return (
                  <tr key={client.id} className="hover:bg-border-main/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-main">
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-[10px] font-normal text-text-muted/60">ID #{client.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-muted select-all text-xs">{client.email}</td>
                    <td className="py-3 px-4 text-center font-mono text-[10px]">
                      {activeSub ? (
                        <span className="text-brand-primary font-bold">{activeSub.name}.subly.host</span>
                      ) : (
                        <span className="text-text-muted/40 italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center select-none">
                      <Badge
                        status={client.emailVerifiedAt ? 'success' : 'inactive'}
                        label={client.emailVerifiedAt ? 'Verified' : 'Unverified'}
                      />
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-text-muted">
                      {client.createdAt
                        ? new Date(client.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onEditUser(client)}
                          className="text-text-muted hover:text-brand-primary p-1.5 rounded-lg hover:bg-brand-primary/10 cursor-pointer active:scale-95 inline-flex"
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(client.id)}
                          className="text-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer active:scale-95 inline-flex"
                          title="Hapus User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-main/40">
          <span className="text-[11px] text-text-muted">
            Halaman <span className="font-bold text-text-main">{memberPage}</span> dari{' '}
            <span className="font-bold text-text-main">{totalPages}</span>
            <span className="ml-1.5 text-text-muted/60">
              ({(memberPage - 1) * memberPageSize + 1}–{Math.min(memberPage * memberPageSize, filteredUsers.length)} dari {filteredUsers.length})
            </span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMemberPage(1)}
              disabled={memberPage === 1}
              className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-text-muted hover:text-text-main hover:bg-border-main/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >«</button>
            <button
              onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
              disabled={memberPage === 1}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-text-main hover:bg-border-main/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(memberPage - 2, totalPages - 4));
              const page = start + i;
              return page <= totalPages ? (
                <button
                  key={page}
                  onClick={() => setMemberPage(page)}
                  className={`min-w-[28px] px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === memberPage
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main hover:bg-border-main/10'
                  }`}
                >{page}</button>
              ) : null;
            })}

            <button
              onClick={() => setMemberPage((p) => Math.min(totalPages, p + 1))}
              disabled={memberPage === totalPages}
              className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-text-main hover:bg-border-main/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setMemberPage(totalPages)}
              disabled={memberPage === totalPages}
              className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-text-muted hover:text-text-main hover:bg-border-main/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >»</button>
          </div>
        </div>
      )}
    </CardPanel>
  );
};
