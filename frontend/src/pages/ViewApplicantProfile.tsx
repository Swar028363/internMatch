import { useParams, useNavigate } from 'react-router-dom';
import { DefaultAvatar } from '../components/DefaultAvatar';

interface ApplicantProfile {
  name: string;
  headline: string;
  bio: string;
  education: string;
  skills: string[];
}

export function ViewApplicantProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // For now, we're using mock data from the applicant list
  // In production, this would fetch from an API
  const getInitials = (email: string) => {
    const emailParts = email.split('@')[0].split('.');
    const firstName = emailParts[0]?.charAt(0).toUpperCase() || 'U';
    const lastName = emailParts[1]?.charAt(0).toUpperCase() || '';
    return firstName + lastName;
  };

  // Get applicant data from localStorage (stored during application)
  const applicants = localStorage.getItem('all_applicants');
  let applicantData: any = null;

  if (applicants) {
    const list = JSON.parse(applicants);
    applicantData = list.find((a: any) => a.id === id);
  }

  if (!applicantData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back
          </button>
          <div className="text-center">
            <p className="text-gray-600">Applicant profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  const skills = applicantData.skills ? applicantData.skills.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
            <DefaultAvatar size="lg" initials={getInitials(applicantData.email)} />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{applicantData.name}</h1>
              <p className="text-gray-600 mt-1">{applicantData.email}</p>
              {applicantData.headline && (
                <p className="text-lg text-gray-700 mt-2">{applicantData.headline}</p>
              )}
            </div>
          </div>

          {/* About Section */}
          {applicantData.bio && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{applicantData.bio}</p>
            </div>
          )}

          {/* Education Section */}
          {applicantData.education && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
              <p className="text-gray-700">{applicantData.education}</p>
            </div>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resume Section */}
          {applicantData.resumeName && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume</h2>
              <div className="border border-gray-300 rounded-lg p-4">
                <p className="text-gray-600">Uploaded Resume:</p>
                <p className="font-semibold text-gray-900 mt-1">{applicantData.resumeName}</p>
                <p className="text-xs text-gray-500 mt-2">
                  * Resume files are stored locally and cannot be downloaded from this interface.
                </p>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h2>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {applicantData.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
