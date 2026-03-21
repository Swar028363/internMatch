import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { DefaultAvatar } from '../components/DefaultAvatar'
import { profileService } from '../services/profile'
import type { ApplicantProfileUpdate, RecruiterProfileUpdate } from '../services/profile'
import { ApiError } from '../services/api'

export function Account() {
  const { user } = useAuth()
  const isApplicant = user?.role === 'applicant'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Shared fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [headline, setHeadline] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // Applicant-only
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [degreeName, setDegreeName] = useState('')
  const [collegeName, setCollegeName] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [gpa, setGpa] = useState('')
  const [skills, setSkills] = useState('')  // comma-separated string for the input
  const [portfolioUrl, setPortfolioUrl] = useState('')

  // Recruiter-only
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('')

  // Snapshot for cancel
  const [snapshot, setSnapshot] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    setLoading(true)

    const fetchProfile = isApplicant
      ? profileService.getApplicantProfile()
      : profileService.getRecruiterProfile()

    fetchProfile
      .then((p) => {
        if (isApplicant) {
          const ap = p as Awaited<ReturnType<typeof profileService.getApplicantProfile>>
          setFirstName(ap.first_name ?? '')
          setLastName(ap.last_name ?? '')
          setHeadline(ap.headline ?? '')
          setBio(ap.bio ?? '')
          setPhone(ap.phone ?? '')
          setLinkedinUrl(ap.linkedin_url ?? '')
          setGithubUrl(ap.github_url ?? '')
          setCity(ap.city ?? '')
          setCountry(ap.country ?? '')
          setEducationLevel(ap.education_level ?? '')
          setDegreeName(ap.degree_name ?? '')
          setCollegeName(ap.college_name ?? '')
          setGraduationYear(ap.graduation_year?.toString() ?? '')
          setGpa(ap.gpa ?? '')
          setSkills((ap.skills ?? []).join(', '))
          setPortfolioUrl(ap.portfolio_url ?? '')
        } else {
          const rp = p as Awaited<ReturnType<typeof profileService.getRecruiterProfile>>
          setFirstName(rp.first_name ?? '')
          setLastName(rp.last_name ?? '')
          setBio(rp.bio ?? '')
          setPhone(rp.phone_number ?? '')
          setLinkedinUrl(rp.linkedin_url ?? '')
          setGithubUrl(rp.github_url ?? '')
          setJobTitle(rp.job_title ?? '')
          setDepartment(rp.department ?? '')
        }
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [user, isApplicant])

  const takeSnapshot = () => {
    setSnapshot({ firstName, lastName, headline, bio, phone, linkedinUrl, githubUrl,
      city, country, educationLevel, degreeName, collegeName, graduationYear, gpa,
      skills, portfolioUrl, jobTitle, department })
  }

  const restoreSnapshot = () => {
    setFirstName(snapshot.firstName ?? '')
    setLastName(snapshot.lastName ?? '')
    setHeadline(snapshot.headline ?? '')
    setBio(snapshot.bio ?? '')
    setPhone(snapshot.phone ?? '')
    setLinkedinUrl(snapshot.linkedinUrl ?? '')
    setGithubUrl(snapshot.githubUrl ?? '')
    setCity(snapshot.city ?? '')
    setCountry(snapshot.country ?? '')
    setEducationLevel(snapshot.educationLevel ?? '')
    setDegreeName(snapshot.degreeName ?? '')
    setCollegeName(snapshot.collegeName ?? '')
    setGraduationYear(snapshot.graduationYear ?? '')
    setGpa(snapshot.gpa ?? '')
    setSkills(snapshot.skills ?? '')
    setPortfolioUrl(snapshot.portfolioUrl ?? '')
    setJobTitle(snapshot.jobTitle ?? '')
    setDepartment(snapshot.department ?? '')
  }

  const handleEdit = () => {
    takeSnapshot()
    setIsEditing(true)
    setSuccess('')
    setError('')
  }

  const handleCancel = () => {
    restoreSnapshot()
    setIsEditing(false)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (isApplicant) {
        const payload: ApplicantProfileUpdate = {
          first_name: firstName || null,
          last_name: lastName || null,
          headline: headline || null,
          bio: bio || null,
          phone: phone || null,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          city: city || null,
          country: country || null,
          education_level: educationLevel || null,
          degree_name: degreeName || null,
          college_name: collegeName || null,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          gpa: gpa || null,
          skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          portfolio_url: portfolioUrl || null,
        }
        await profileService.updateApplicantProfile(payload)
      } else {
        const payload: RecruiterProfileUpdate = {
          first_name: firstName || null,
          last_name: lastName || null,
          bio: bio || null,
          phone_number: phone || null,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          job_title: jobTitle || null,
          department: department || null,
        }
        await profileService.updateRecruiterProfile(payload)
      }
      setSuccess('Profile saved successfully.')
      setIsEditing(false)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to save profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  const getInitials = () => {
    return ((firstName.charAt(0) + lastName.charAt(0)).toUpperCase()) || 'U'
  }

  const inputClass = 'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500'
  const labelClass = 'block text-sm font-medium text-gray-700'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <DefaultAvatar size="lg" initials={getInitials()} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {firstName || 'Your'} {lastName || 'Profile'}
                </h1>
                <p className="text-gray-500 text-sm capitalize">{user?.role} · {user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded text-sm">{success}</div>
          )}

          <div className="space-y-6">
            {/* Basic info */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Basic Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={inputClass} value={firstName} disabled={!isEditing}
                    onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={inputClass} value={lastName} disabled={!isEditing}
                    onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              {isApplicant && (
                <div className="mt-4">
                  <label className={labelClass}>Headline</label>
                  <input className={inputClass} value={headline} disabled={!isEditing}
                    placeholder="e.g. Aspiring ML Engineer"
                    onChange={(e) => setHeadline(e.target.value)} />
                </div>
              )}
              <div className="mt-4">
                <label className={labelClass}>Bio</label>
                <textarea className={inputClass} value={bio} disabled={!isEditing} rows={3}
                  placeholder="Tell us about yourself"
                  onChange={(e) => setBio(e.target.value)} />
              </div>
            </section>

            {/* Role-specific fields */}
            {isApplicant ? (
              <>
                <section>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Education</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Education Level</label>
                      <input className={inputClass} value={educationLevel} disabled={!isEditing}
                        placeholder="e.g. Bachelor's" onChange={(e) => setEducationLevel(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Degree</label>
                      <input className={inputClass} value={degreeName} disabled={!isEditing}
                        placeholder="e.g. B.Tech" onChange={(e) => setDegreeName(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>College</label>
                      <input className={inputClass} value={collegeName} disabled={!isEditing}
                        onChange={(e) => setCollegeName(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Graduation Year</label>
                      <input className={inputClass} value={graduationYear} disabled={!isEditing}
                        placeholder="e.g. 2026" onChange={(e) => setGraduationYear(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>GPA</label>
                      <input className={inputClass} value={gpa} disabled={!isEditing}
                        placeholder="e.g. 8.5" onChange={(e) => setGpa(e.target.value)} />
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Skills</h2>
                  <label className={labelClass}>Skills (comma-separated)</label>
                  <input className={inputClass} value={skills} disabled={!isEditing}
                    placeholder="React, Python, SQL" onChange={(e) => setSkills(e.target.value)} />
                  {!isEditing && skills && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.split(',').map((s, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </section>

                <section>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Location</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input className={inputClass} value={city} disabled={!isEditing}
                        onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input className={inputClass} value={country} disabled={!isEditing}
                        onChange={(e) => setCountry(e.target.value)} />
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <section>
                <h2 className="text-base font-semibold text-gray-900 mb-3">Professional Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input className={inputClass} value={jobTitle} disabled={!isEditing}
                      placeholder="e.g. HR Manager" onChange={(e) => setJobTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Department</label>
                    <input className={inputClass} value={department} disabled={!isEditing}
                      placeholder="e.g. Talent Acquisition" onChange={(e) => setDepartment(e.target.value)} />
                  </div>
                </div>
              </section>
            )}

            {/* Contact & links */}
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">Contact & Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} value={phone} disabled={!isEditing}
                    onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input className={inputClass} value={linkedinUrl} disabled={!isEditing}
                    placeholder="https://linkedin.com/in/..." onChange={(e) => setLinkedinUrl(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>GitHub</label>
                  <input className={inputClass} value={githubUrl} disabled={!isEditing}
                    placeholder="https://github.com/..." onChange={(e) => setGithubUrl(e.target.value)} />
                </div>
                {isApplicant && (
                  <div>
                    <label className={labelClass}>Portfolio</label>
                    <input className={inputClass} value={portfolioUrl} disabled={!isEditing}
                      placeholder="https://..." onChange={(e) => setPortfolioUrl(e.target.value)} />
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Save / Cancel */}
          {isEditing && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}