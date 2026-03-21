import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { internshipService } from '../services/internships'
import { ApiError } from '../services/api'

const SKILL_SUGGESTIONS = ['React', 'JavaScript', 'TypeScript', 'Python', 'SQL',
  'Node.js', 'Swift', 'Figma', 'UI Design', 'AWS', 'Machine Learning', 'Excel',
  'Java', 'C++', 'MongoDB', 'PostgreSQL', 'Docker', 'Git']

export function PostInternship() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'Internship',
    duration: '',
    salary: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role !== 'recruiter') navigate('/')
  }, [user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(skillInput)
    }
  }

  const validate = (): string => {
    if (!formData.title.trim()) return 'Title is required.'
    if (!formData.description.trim()) return 'Description is required.'
    if (!formData.location.trim()) return 'Location is required.'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    try {
      await internshipService.create({
        ...formData,
        duration: formData.duration || undefined,
        salary: formData.salary || undefined,
        skills,
      })
      navigate('/dashboard/recruiter')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Failed to post internship.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-700'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Post an Internship</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Job Title *</label>
              <input name="title" value={formData.title} onChange={handleChange}
                className={inputClass} placeholder="e.g. Frontend Developer Intern" />
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                className={inputClass} rows={5} placeholder="Describe the role, responsibilities, and what the intern will learn..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Location *</label>
                <input name="location" value={formData.location} onChange={handleChange}
                  className={inputClass} placeholder="e.g. Ahmedabad, Gujarat" />
              </div>
              <div>
                <label className={labelClass}>Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={handleChange} className={inputClass}>
                  <option>Internship</option>
                  <option>Part-Time</option>
                  <option>Remote</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Duration</label>
                <input name="duration" value={formData.duration} onChange={handleChange}
                  className={inputClass} placeholder="e.g. 3 months" />
              </div>
              <div>
                <label className={labelClass}>Salary / Stipend</label>
                <input name="salary" value={formData.salary} onChange={handleChange}
                  className={inputClass} placeholder="e.g. ₹12,000/month" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Required Skills</label>
              <div className="flex flex-wrap gap-2 mt-1 mb-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-blue-600 hover:text-blue-900 ml-1">×</button>
                  </span>
                ))}
              </div>
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className={inputClass}
                placeholder="Type a skill and press Enter..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => addSkill(s)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard/recruiter')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition text-sm"
              >
                {loading ? 'Posting...' : 'Post Internship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}