import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { internshipService } from '../services/internships'
import type { Internship, InternshipFilters } from '../services/internships'

const JOB_TYPES = ['Internship', 'Part-Time', 'Remote']
const SKILL_OPTIONS = ['React', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Node.js',
  'Swift', 'Figma', 'UI Design', 'AWS', 'Machine Learning', 'Excel']

export default function Explore() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const fetchInternships = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const filters: InternshipFilters = {}
      if (search) filters.search = search
      if (location) filters.location = location
      if (selectedJobTypes.length === 1) filters.job_type = selectedJobTypes[0]
      if (selectedSkills.length === 1) filters.skill = selectedSkills[0]

      let results = await internshipService.list(filters)

      // Multi-skill filter done client-side (backend supports one skill at a time)
      if (selectedSkills.length > 1) {
        results = results.filter((i) =>
          selectedSkills.every((s) =>
            (i.skills ?? []).some((sk) => sk.toLowerCase().includes(s.toLowerCase()))
          )
        )
      }

      // Multi job-type filter client-side
      if (selectedJobTypes.length > 1) {
        results = results.filter((i) =>
          selectedJobTypes.some((jt) => i.job_type.toLowerCase().includes(jt.toLowerCase()))
        )
      }

      setInternships(results)
    } catch {
      setError('Failed to load internships.')
    } finally {
      setLoading(false)
    }
  }, [search, location, selectedJobTypes, selectedSkills])

  useEffect(() => {
    const timer = setTimeout(fetchInternships, 300)
    return () => clearTimeout(timer)
  }, [fetchInternships])

  const toggleJobType = (jt: string) => {
    setSelectedJobTypes((prev) =>
      prev.includes(jt) ? prev.filter((x) => x !== jt) : [...prev, jt]
    )
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((x) => x !== skill) : [...prev, skill]
    )
  }

  const clearFilters = () => {
    setSearch('')
    setLocation('')
    setSelectedJobTypes([])
    setSelectedSkills([])
  }

  const hasActiveFilters = search || location || selectedJobTypes.length || selectedSkills.length

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore Internships</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Filters */}
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-md border border-gray-200 h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Title or keyword..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or state..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Job Type</label>
                <div className="space-y-2 text-gray-700">
                  {JOB_TYPES.map((jt) => (
                    <label key={jt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedJobTypes.includes(jt)}
                        onChange={() => toggleJobType(jt)}
                      />
                      {jt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Skills</label>
                <div className="space-y-2 text-gray-700 max-h-40 overflow-y-auto">
                  {SKILL_OPTIONS.map((skill) => (
                    <label key={skill} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading internships...</div>
            ) : error ? (
              <div className="text-center py-16 text-red-500">{error}</div>
            ) : internships.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">No internships found.</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-3 text-blue-600 hover:underline text-sm">
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">{internships.length} result{internships.length !== 1 ? 's' : ''}</p>
                {internships.map((internship) => (
                  <Link
                    key={internship.id}
                    to={`/internship/${internship.id}`}
                    className="block p-6 border border-gray-200 rounded-md hover:shadow-md hover:border-blue-300 transition"
                  >
                    <h3 className="text-xl font-semibold text-gray-900">{internship.title}</h3>
                    <p className="text-gray-700 mt-1 text-sm">{internship.location}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {internship.job_type}
                      {internship.duration ? ` · ${internship.duration}` : ''}
                      {internship.salary ? ` · ${internship.salary}` : ''}
                    </p>
                    <p className="text-gray-600 mt-3 text-sm line-clamp-2">{internship.description}</p>
                    {internship.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {internship.skills.slice(0, 5).map((s) => (
                          <span key={s} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}