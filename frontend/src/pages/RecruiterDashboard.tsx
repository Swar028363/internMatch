import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { internshipService } from '../services/internships'
import type { Internship } from '../services/internships'
import { ApiError } from '../services/api'

export function RecruiterDashboard() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    internshipService.getMine()
      .then(setInternships)
      .catch(() => setError('Failed to load internships.'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this internship posting?')) return
    try {
      await internshipService.delete(id)
      setInternships((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete.')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your internship postings.</p>
          </div>
          <Link to="/post-internship"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            + Post Internship
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Posted</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{internships.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {internships.filter((i) => i.is_active).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Internship Postings</h2>

          {internships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't posted any internships yet.</p>
              <Link to="/post-internship"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Post Your First Internship
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {internships.map((internship) => (
                <div key={internship.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{internship.title}</h3>
                        {!internship.is_active && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {internship.location}
                        {internship.duration ? ` · ${internship.duration}` : ''}
                        {internship.salary ? ` · ${internship.salary}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Posted {new Date(internship.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <Link to={`/internship/${internship.id}/manage`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center">
                        View Applicants
                      </Link>
                      <Link to={`/edit-internship/${internship.id}`}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm text-center">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(internship.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">
                        Delete
                      </button>
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