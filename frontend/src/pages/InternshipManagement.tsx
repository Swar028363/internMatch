import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import internships from '../data/internships.json';

interface Applicant {
  id: number;
  name: string;
  email: string;
  status: 'pending' | 'review' | 'accepted' | 'rejected';
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

export function InternshipManagement() {
  const { id } = useParams<{ id: string }>();
  const [internship, setInternship] = useState<InternshipData | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    // Get internship data
    const intern = internships.find((i: any) => i.id === Number(id));
    setInternship(intern);

    // Get or create mock applicants
    const stored = localStorage.getItem(`internship_applicants_${id}`);
    if (stored) {
      setApplicants(JSON.parse(stored));
    } else {
      const mockApplicants: Applicant[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@email.com',
          status: 'pending',
          appliedDate: '2025-02-10',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          status: 'accepted',
          appliedDate: '2025-02-08',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.j@email.com',
          status: 'pending',
          appliedDate: '2025-02-06',
        },
        {
          id: 4,
          name: 'Sarah Williams',
          email: 'sarah.w@email.com',
          status: 'rejected',
          appliedDate: '2025-02-04',
        },
      ];
      setApplicants(mockApplicants);
      localStorage.setItem(`internship_applicants_${id}`, JSON.stringify(mockApplicants));
    }
  }, [id]);

  const handleStatusChange = (applicantId: number, newStatus: 'pending' | 'review' | 'accepted' | 'rejected') => {
    const updated = applicants.map((a) =>
      a.id === applicantId ? { ...a, status: newStatus } : a
    );
    setApplicants(updated);
    localStorage.setItem(`internship_applicants_${id}`, JSON.stringify(updated));
  };

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Internship not found</p>
            <Link to="/dashboard/recruiter" className="text-blue-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: applicants.length,
    pending: applicants.filter((a) => a.status === 'pending').length,
    review: applicants.filter((a) => a.status === 'review').length,
    accepted: applicants.filter((a) => a.status === 'accepted').length,
    rejected: applicants.filter((a) => a.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to="/dashboard/recruiter" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{internship.position}</h1>
          <p className="text-xl text-gray-600 mt-2">{internship.company}</p>
          <p className="text-gray-500 mt-1">{internship.location}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Applicants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-medium">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-blue-600 text-sm font-medium">Under Review</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.review}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-medium">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Applicants List */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h2>

          {applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                      <p className="text-gray-600">{applicant.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/applicant-profile/${applicant.email}`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Profile
                        </Link>
                        <span className="text-gray-300">|</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Resume download functionality would be implemented here with backend integration');
                          }}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Download Resume
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.status)}`}
                      >
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(applicant.id, 'review')}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            applicant.status === 'review'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                          }`}
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleStatusChange(applicant.id, 'accepted')}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            applicant.status === 'accepted'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(applicant.id, 'rejected')}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            applicant.status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
