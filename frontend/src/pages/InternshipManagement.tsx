import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { applicationService } from '../services/applications'
import type { Application } from '../services/applications'
import { internshipService } from '../services/internships'
import type { Internship } from '../services/internships'
import { ApiError } from '../services/api'

export function InternshipManagement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [internship, setInternship] = useState<Internship | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const internshipId = Number(id)
    Promise.all([
      internshipService.getById(internshipId),
      applicationService.getForInternship(internshipId),
    ])
      .then(([i, apps]) => { setInternship(i); setApplications(apps) })
      .catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (appId: number, status: 'accepted' | 'rejected') => {
    try {
      const updated = await applicationService.updateStatus(appId, status)
      setApplications((prev) => prev.map((a) => a.id === appId ? updated : a))
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update status.')
    }
  }

  const statusColor = (status: string) => ({
    applied: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-600',
  }[status] ?? 'bg-gray-100 text-gray-800')

  const RESUME_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard/recruiter')} className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{internship?.title}</h1>
          <p className="text-gray-600 mt-1">{internship?.location}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total', value: applications.length, color: 'text-gray-900' },
            { label: 'Accepted', value: applications.filter((a) => a.status === 'accepted').length, color: 'text-green-600' },
            { label: 'Pending', value: applications.filter((a) => a.status === 'applied').length, color: 'text-yellow-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg shadow p-6">
              <p className={`text-sm font-medium ${color}`}>{label}</p>
              <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h2>

          {applications.length === 0 ? (
            <p className="text-center text-gray-600 py-12">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {app.cover_letter && (
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{app.cover_letter}</p>
                      )}
                      {app.resume_path && (
                        <a
                          href={`${RESUME_BASE}/uploads/${app.resume_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Link to={`/applicant-profile/${app.applicant_id}`}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition text-sm text-center">
                        View Profile
                      </Link>
                      {app.status === 'applied' && (
                        <>
                          <button onClick={() => handleStatus(app.id, 'accepted')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
                            Accept
                          </button>
                          <button onClick={() => handleStatus(app.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}