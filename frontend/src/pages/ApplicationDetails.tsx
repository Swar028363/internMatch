import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import internships from '../data/internships.json';

interface Application {
  id: number;
  internshipId: number;
  status: 'applied' | 'accepted' | 'rejected' | 'pending';
  appliedDate: string;
}

interface InternshipData {
  id: number;
  company: string;
  position: string;
  location: string;
  salary: string;
  duration: string;
  jobType: string;
  description: string;
  skills: string[];
  postedDate: string;
}

export function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [internship, setInternship] = useState<InternshipData | null>(null);

  useEffect(() => {
    // Get application data
    const stored = localStorage.getItem('student_applications');
    if (stored) {
      const applications = JSON.parse(stored);
      const app = applications.find((a: Application) => a.id === Number(id));
      setApplication(app);

      // Get internship data
      if (app) {
        const intern = internships.find((i: any) => i.id === app.internshipId);
        setInternship(intern);
      }
    }
  }, [id]);

  if (!application || !internship) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Application not found</p>
            <Link to="/dashboard/student" className="text-blue-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' };
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Decision' };
      case 'applied':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Application Received' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
    }
  };

  const statusInfo = getStatusColor(application.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/dashboard/student" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{internship.position}</h1>
              <p className="text-xl text-gray-600 mt-2">{internship.company}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold ${statusInfo.bg} ${statusInfo.text}`}
            >
              {statusInfo.label}
            </span>
          </div>

          {/* Application Meta */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Applied Date</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(application.appliedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Job Type</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{internship.jobType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{internship.duration}</p>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Position Details</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About the Role</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-700">{internship.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Salary</h3>
                <p className="text-gray-700">{internship.salary}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Posted</h3>
                <p className="text-gray-700">
                  {new Date(internship.postedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {internship.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Status</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded-full mr-4"></div>
              <div>
                <p className="font-semibold text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-600">
                  {new Date(application.appliedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {application.status === 'pending' && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900">Under Review</p>
                  <p className="text-sm text-gray-600">Your application is being reviewed by the recruiter</p>
                </div>
              </div>
            )}

            {application.status === 'accepted' && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-600 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900">Accepted</p>
                  <p className="text-sm text-gray-600">Congratulations! You have been accepted</p>
                </div>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-600 rounded-full mr-4"></div>
                <div>
                  <p className="font-semibold text-gray-900">Rejected</p>
                  <p className="text-sm text-gray-600">Unfortunately, your application was not selected</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/explore"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Explore More Internships
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
