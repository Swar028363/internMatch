import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export function StudentDashboard() {
  const [applications, setApplications] = useState<Application[]>([]);

  // Load mock applications from localStorage or create defaults
  useEffect(() => {
    const stored = localStorage.getItem('student_applications');
    if (stored) {
      setApplications(JSON.parse(stored));
    } else {
      // Default mock applications
      const mockApps: Application[] = [
        {
          id: 1,
          internshipId: 1,
          status: 'accepted',
          appliedDate: '2025-01-15',
        },
        {
          id: 2,
          internshipId: 2,
          status: 'pending',
          appliedDate: '2025-02-01',
        },
        {
          id: 3,
          internshipId: 3,
          status: 'rejected',
          appliedDate: '2025-01-20',
        },
      ];
      setApplications(mockApps);
      localStorage.setItem('student_applications', JSON.stringify(mockApps));
    }
  }, []);

  const stats = {
    total: applications.length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
    pending: applications.filter((a) => a.status === 'pending').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInternshipData = (id: number): InternshipData | undefined => {
    return internships.find((i: any) => i.id === id);
  };

  const handleWithdraw = (appId: number) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      const updated = applications.filter((app) => app.id !== appId);
      setApplications(updated);
      localStorage.setItem('student_applications', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your internship application overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Applied</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-green-600 text-sm font-medium">Accepted</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-yellow-600 text-sm font-medium">Pending Decision</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600 text-sm font-medium">Rejected</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h2>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't applied to any internships yet.</p>
              <Link
                to="/explore"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Explore Internships
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const internship = getInternshipData(app.internshipId);
                if (!internship) return null;

                return (
                  <div
                    key={app.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {internship.position}
                        </h3>
                        <p className="text-gray-600">{internship.company}</p>
                        <p className="text-sm text-gray-500 mt-2">{internship.location}</p>
                        <div className="mt-3 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 px-3 py-1">
                            Applied: {new Date(app.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2 whitespace-nowrap">
                        <Link
                          to={`/application/${app.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleWithdraw(app.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Withdraw
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
