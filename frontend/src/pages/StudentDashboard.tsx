import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../services/applications'
import type { ApplicationWithInternship, PaginatedApplications } from '../services/applications'
import { savedService } from '../services/saved'
import type { SavedInternship, PaginatedSaved } from '../services/saved'
import { ApiError } from '../services/api'
import { useToast } from '../context/ToastContext'
import { Pagination } from '../components/Pagination'

const PAGE_SIZE = 10

function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-6 w-28 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          <div className="h-9 w-16 bg-gray-200 rounded-lg" />
          <div className="h-9 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function StudentDashboard() {
  // Applications tab state
  const [appData, setAppData] = useState<PaginatedApplications | null>(null)
  const [appOffset, setAppOffset] = useState(0)
  const [appLoading, setAppLoading] = useState(true)

  // Saved tab state
  const [savedData, setSavedData] = useState<PaginatedSaved | null>(null)
  const [savedOffset, setSavedOffset] = useState(0)
  const [savedLoading, setSavedLoading] = useState(true)

  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications')
  const [error, setError] = useState('')
  const { success, error: toastError, confirm } = useToast()

  // Fetch applications────────────
  const fetchApplications = useCallback((offset: number) => {
    setAppLoading(true)
    applicationService.getMine({ limit: PAGE_SIZE, offset })
      .then(setAppData)
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setAppLoading(false))
  }, [])

  useEffect(() => { fetchApplications(appOffset) }, [appOffset, fetchApplications])

  // Fetch saved─
  const fetchSaved = useCallback((offset: number) => {
    setSavedLoading(true)
    savedService.getAll({ limit: PAGE_SIZE, offset })
      .then(setSavedData)
      .catch(() => {})
      .finally(() => setSavedLoading(false))
  }, [])

  useEffect(() => { fetchSaved(savedOffset) }, [savedOffset, fetchSaved])

  // Stats from first-page data (total counts from API) 
  // We need total counts for stats — fetch all for stats only if needed.
  // Since API now returns totals, we use appData.total for display.
  // For accepted/rejected/pending breakdown we still need all items, so
  // we store them separately. To keep it simple, stats show totals from
  // a separate lightweight fetch on mount only.
  const [statCounts, setStatCounts] = useState({ accepted: 0, rejected: 0, pending: 0 })

  useEffect(() => {
    // Fetch a large page just for stats on mount
    applicationService.getMine({ limit: 500, offset: 0 })
      .then((data) => {
        setStatCounts({
          accepted: data.items.filter((a) => a.status === 'accepted').length,
          rejected: data.items.filter((a) => a.status === 'rejected').length,
          pending: data.items.filter((a) => a.status === 'applied').length,
        })
      })
      .catch(() => {})
  }, [])

  const handleWithdraw = async (appId: number) => {
    const ok = await confirm('Are you sure you want to withdraw this application?')
    if (!ok) return
    try {
      await applicationService.updateStatus(appId, 'withdrawn')
      fetchApplications(appOffset)
      success('Application withdrawn.')
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to withdraw.')
    }
  }

  const handleUnsave = async (internshipId: number) => {
    try {
      await savedService.unsave(internshipId)
      fetchSaved(savedOffset)
      success('Removed from saved.')
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : 'Failed to remove.')
    }
  }

  const statusColor = (status: string) => ({
    applied: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  }[status] ?? 'bg-gray-100 text-gray-800')

  const totalApps = appData?.total ?? 0
  const totalSaved = savedData?.total ?? 0

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Your internship application overview.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {appLoading && !appData ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </div>
            ))
          ) : (
            [
              { label: 'Total Applied', value: totalApps, color: 'text-gray-900' },
              { label: 'Accepted', value: statCounts.accepted, color: 'text-green-600' },
              { label: 'Pending', value: statCounts.pending, color: 'text-yellow-600' },
              { label: 'Rejected', value: statCounts.rejected, color: 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-lg shadow p-6">
                <p className={`text-sm font-medium ${color}`}>{label}</p>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
              </div>
            ))
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {(['applications', 'saved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition capitalize ${
                activeTab === tab
                  ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'saved'
                ? `★ Saved (${totalSaved})`
                : `My Applications (${totalApps})`}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Applications tab */}
          {activeTab === 'applications' && (
            <>
              {appLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !appData || appData.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't applied to any internships yet.</p>
                  <Link
                    to="/explore"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Explore Internships
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {appData.items.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{app.internship.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{app.internship.location}</p>
                            <div className="mt-3 flex flex-wrap gap-2 items-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                Applied {new Date(app.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Link
                              to={`/application/${app.id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              View
                            </Link>
                            {app.status === 'applied' && (
                              <button
                                onClick={() => handleWithdraw(app.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    total={appData.total}
                    limit={appData.limit}
                    offset={appData.offset}
                    onPageChange={setAppOffset}
                    loading={appLoading}
                  />
                </>
              )}
            </>
          )}

          {/* Saved tab */}
          {activeTab === 'saved' && (
            <>
              {savedLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : !savedData || savedData.items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-4xl mb-4">☆</p>
                  <p className="text-gray-600 mb-4">No saved internships yet. Bookmark ones you like!</p>
                  <Link
                    to="/explore"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Explore Internships
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {savedData.items.map((s) => (
                      <div key={s.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{s.internship.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{s.internship.location} · {s.internship.job_type}</p>
                            {s.internship.stipend_amount && (
                              <p className="text-sm text-green-700 font-medium mt-1">
                                ₹{Number(s.internship.stipend_amount).toLocaleString('en-IN')}/mo
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Saved {new Date(s.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Link
                              to={`/internship/${s.internship_id}`}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleUnsave(s.internship_id)}
                              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    total={savedData.total}
                    limit={savedData.limit}
                    offset={savedData.offset}
                    onPageChange={setSavedOffset}
                    loading={savedLoading}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}