import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import internships from '../data/internships.json';

interface PostedInternship {
  id: number;
  internshipId: number;
  totalApplicants: number;
  accepted: number;
  rejected: number;
  pending: number;
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

export function RecruiterDashboard() {
  const [postedInternships, setPostedInternships] = useState<PostedInternship[]>([]);
  const navigate = useNavigate();

  // Load mock posted internships from localStorage or create defaults
  useEffect(() => {
    const stored = localStorage.getItem('recruiter_posted');
    if (stored) {
      setPostedInternships(JSON.parse(stored));
    } else {
      // Default mock posted internships
      const mockPosted: PostedInternship[] = [
        {
          id: 1,
          internshipId: 1,
          totalApplicants: 12,
          accepted: 3,
          rejected: 2,
          pending: 7,
        },
        {
          id: 2,
          internshipId: 2,
          totalApplicants: 8,
          accepted: 1,
          rejected: 1,
          pending: 6,
        },
        {
          id: 3,
          internshipId: 4,
          totalApplicants: 15,
          accepted: 4,
          rejected: 3,
          pending: 8,
        },
      ];
      setPostedInternships(mockPosted);
      localStorage.setItem('recruiter_posted', JSON.stringify(mockPosted));
    }
  }, []);

  const stats = {
    total: postedInternships.length,
    applicants: postedInternships.reduce((sum, inf) => sum + inf.totalApplicants, 0),
    accepted: postedInternships.reduce((sum, inf) => sum + inf.accepted, 0),
    rejected: postedInternships.reduce((sum, inf) => sum + inf.rejected, 0),
    pending: postedInternships.reduce((sum, inf) => sum + inf.pending, 0),
  };

  const getInternshipData = (id: number): InternshipData | undefined => {
    // First try to get from recruiter_internships (newly posted)
    const recruiterInternships = localStorage.getItem('recruiter_internships');
    if (recruiterInternships) {
      const list = JSON.parse(recruiterInternships);
      const found = list.find((i: any) => i.id === id);
      if (found) return found;
    }
    // Fall back to default internships
    return internships.find((i: any) => i.id === id);
  };

  const handleDelete = (internshipId: number) => {
    if (window.confirm('Are you sure you want to delete this internship posting?')) {
      // Remove from recruiter_posted
      const updated = postedInternships.filter((p) => p.internshipId !== internshipId);
      setPostedInternships(updated);
      localStorage.setItem('recruiter_posted', JSON.stringify(updated));

      // Also remove from recruiter_internships if it exists
      const recruiterInternships = localStorage.getItem('recruiter_internships');
      if (recruiterInternships) {
        const list = JSON.parse(recruiterInternships);
        const filtered = list.filter((i: any) => i.id !== internshipId);
        localStorage.setItem('recruiter_internships', JSON.stringify(filtered));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your internship postings and track applicants.</p>
          </div>
          <Link
            to="/post-internship"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + Post Internship
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Posted</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Applicants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.applicants}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-medium">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Posted Internships Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Internship Postings</h2>

          {postedInternships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't posted any internships yet.</p>
              <Link
                to="/post-internship"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Post Your First Internship
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {postedInternships.map((posted) => {
                const internship = getInternshipData(posted.internshipId);
                if (!internship) return null;

                return (
                  <div
                    key={posted.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {internship.position}
                        </h3>
                        <p className="text-gray-600">{internship.company}</p>
                        <p className="text-sm text-gray-500 mt-2">{internship.location}</p>
                        
                        {/* Status breakdown */}
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Total Applicants</p>
                            <p className="text-xl font-bold text-gray-900">{posted.totalApplicants}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600">Accepted</p>
                            <p className="text-xl font-bold text-green-600">{posted.accepted}</p>
                          </div>
                          <div>
                            <p className="text-xs text-yellow-600">Pending</p>
                            <p className="text-xl font-bold text-yellow-600">{posted.pending}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2 whitespace-nowrap">
                        <Link
                          to={`/internship/${posted.internshipId}/manage`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm text-center"
                        >
                          View Applicants
                        </Link>
                        <Link
                          to={`/edit-internship/${posted.internshipId}`}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm text-center"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(posted.internshipId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
