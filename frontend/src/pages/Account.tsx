import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { DefaultAvatar } from '../components/DefaultAvatar';

export function Account() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: localStorage.getItem('profile_firstName') || '',
    lastName: localStorage.getItem('profile_lastName') || '',
    headline: localStorage.getItem('profile_headline') || '',
    bio: localStorage.getItem('profile_bio') || '',
    // Applicant specific
    education: localStorage.getItem('profile_education') || '',
    skills: localStorage.getItem('profile_skills') || '',
    // Recruiter specific
    jobTitle: localStorage.getItem('profile_jobTitle') || '',
    company: localStorage.getItem('profile_company') || '',
    department: localStorage.getItem('profile_department') || '',
  });

  const [tempData, setTempData] = useState(profileData);

  const isApplicant = user?.role === 'applicant';

  const handleEdit = () => {
    setTempData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(tempData);
    // Save to localStorage
    Object.entries(tempData).forEach(([key, value]) => {
      localStorage.setItem(`profile_${key}`, value as string);
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = () => {
    const first = profileData.firstName.charAt(0).toUpperCase();
    const last = profileData.lastName.charAt(0).toUpperCase();
    return first + last || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Avatar Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <DefaultAvatar size="lg" initials={getInitials()} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData.firstName || 'Your'} {profileData.lastName || 'Profile'}
                </h1>
                <p className="text-gray-600 capitalize">{user?.role}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Content */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Common Fields */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <div className="space-y-4">
                  {profileData.headline && (
                    <div>
                      <p className="text-sm text-gray-600">Headline</p>
                      <p className="text-gray-900">{profileData.headline}</p>
                    </div>
                  )}
                  {profileData.bio && (
                    <div>
                      <p className="text-sm text-gray-600">Bio</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Role-specific Content */}
              {isApplicant ? (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Education & Skills</h2>
                  <div className="space-y-4">
                    {profileData.education && (
                      <div>
                        <p className="text-sm text-gray-600">Education</p>
                        <p className="text-gray-900">{profileData.education}</p>
                      </div>
                    )}
                    {profileData.skills && (
                      <div>
                        <p className="text-sm text-gray-600">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profileData.skills.split(',').map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Info</h2>
                  <div className="space-y-4">
                    {profileData.jobTitle && (
                      <div>
                        <p className="text-sm text-gray-600">Job Title</p>
                        <p className="text-gray-900">{profileData.jobTitle}</p>
                      </div>
                    )}
                    {profileData.company && (
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="text-gray-900">{profileData.company}</p>
                      </div>
                    )}
                    {profileData.department && (
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="text-gray-900">{profileData.department}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={tempData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={tempData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer | Open to internships"
                  value={tempData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  placeholder="Tell us about yourself"
                  value={tempData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isApplicant ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Education
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., B.S. Computer Science from MIT"
                      value={tempData.education}
                      onChange={(e) => handleChange('education', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., React, Node.js, Python, CSS"
                      value={tempData.skills}
                      onChange={(e) => handleChange('skills', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Recruiter"
                      value={tempData.jobTitle}
                      onChange={(e) => handleChange('jobTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Tech Innovations Inc"
                      value={tempData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Human Resources"
                      value={tempData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
