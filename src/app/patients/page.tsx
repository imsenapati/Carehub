'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePatients } from '@/hooks/usePatients';
import { useProviders } from '@/hooks/useProviders';
import { useDebounce } from '@/hooks/useDebounce';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { PatientFilters } from '@/types';


function PatientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: providers } = useProviders();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(true);

  const debouncedSearch = useDebounce(searchInput, 400);

  const filters: PatientFilters = {
    search: debouncedSearch || undefined,
    status: (searchParams.get('status') as PatientFilters['status']) || undefined,
    provider: searchParams.get('provider') || undefined,
    hasUpcoming: searchParams.get('hasUpcoming') === 'true' ? true : undefined,
    riskLevel: (searchParams.get('riskLevel') as PatientFilters['riskLevel']) || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 10,
    sortBy: searchParams.get('sortBy') || 'lastName',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  };

  const { data, isLoading, isError, error } = usePatients(filters);

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') params.set('page', '1');
    router.push(`/patients?${params.toString()}`);
  }, [searchParams, router]);

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filters.sortBy === column) {
      params.set('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', column);
      params.set('sortOrder', 'asc');
    }
    router.push(`/patients?${params.toString()}`);
  };

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (data && selectedRows.size === data.data.length) {
      setSelectedRows(new Set());
    } else if (data) {
      setSelectedRows(new Set(data.data.map((p) => p.id)));
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (filters.sortBy !== column) return <span className="text-gray-300 ml-1">&#8597;</span>;
    return <span className="text-blue-600 ml-1">{filters.sortOrder === 'asc' ? '&#9650;' : '&#9660;'}</span>;
  };

  const riskVariant = (level: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger' | 'purple'> = {
      low: 'success', medium: 'warning', high: 'danger', critical: 'purple',
    };
    return map[level] || 'default';
  };

  const statusVariant = (status: string) => {
    const map: Record<string, 'success' | 'default' | 'danger'> = {
      active: 'success', inactive: 'default', deceased: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data ? `${data.pagination.total} patients total` : 'Loading...'}
          </p>
        </div>
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{selectedRows.size} selected</span>
            <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Export Selected
            </button>
            <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Send Message
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, MRN, or date of birth..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                updateFilter('search', e.target.value || null);
              }}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`px-3 py-2 text-sm border rounded-lg transition-colors ${filtersOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Filters {filtersOpen ? '▲' : '▼'}
          </button>
        </div>

        {filtersOpen && (
          <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value || null)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>

            <select
              value={filters.riskLevel || ''}
              onChange={(e) => updateFilter('riskLevel', e.target.value || null)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={filters.provider || ''}
              onChange={(e) => updateFilter('provider', e.target.value || null)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="">All Providers</option>
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>Dr. {p.lastName}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filters.hasUpcoming === true}
                onChange={(e) => updateFilter('hasUpcoming', e.target.checked ? 'true' : null)}
                className="rounded"
              />
              Has upcoming appointment
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        {isError ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium mb-2">Failed to load patients</p>
            <p className="text-gray-500 text-sm">{(error as Error).message}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={data ? selectedRows.size === data.data.length && data.data.length > 0 : false}
                        onChange={toggleAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('lastName')}>
                      Patient <SortIcon column="lastName" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('mrn')}>
                      MRN <SortIcon column="mrn" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('dateOfBirth')}>
                      DOB <SortIcon column="dateOfBirth" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: filters.limit || 10 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                  ) : data && data.data.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          title="No patients found"
                          description="Try adjusting your search criteria or filters to find what you're looking for."
                          actionLabel="Clear filters"
                          onAction={() => router.push('/patients')}
                        />
                      </td>
                    </tr>
                  ) : (
                    data?.data.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(patient.id)}
                            onChange={() => toggleRow(patient.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/patients/${patient.id}`} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </div>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                              {patient.lastName}, {patient.firstName}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{patient.mrn}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{patient.dateOfBirth}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(patient.status)}>{patient.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={riskVariant(patient.riskLevel)}>{patient.riskLevel}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {providers?.find((p) => p.id === patient.primaryProviderId)?.lastName || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/patients/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-700">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select
                    value={filters.limit}
                    onChange={(e) => updateFilter('limit', e.target.value)}
                    className="px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </span>
                  <button
                    disabled={data.pagination.page <= 1}
                    onClick={() => updateFilter('page', String(data.pagination.page - 1))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    onClick={() => updateFilter('page', String(data.pagination.page + 1))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full rounded-xl" />}>
      <PatientsContent />
    </Suspense>
  );
}
