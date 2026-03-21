import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

interface InternshipForm {
  position: string;
  location: string;
  salary: string;
  duration: string;
  jobType: string;
  description: string;
  skills: string;
}

export function PostInternship() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InternshipForm>({
    position: '',
    location: '',
    salary: '',
    duration: '',
    jobType: 'Internship',
    description: '',
    skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get recruiter's company from localStorage
  const company = localStorage.getItem('profile_company') || 'Your Company';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.position.trim()) {
      setError('Position title is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.salary.trim()) {
      setError('Salary is required');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.skills.trim()) {
      setError('At least one skill is required');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Get existing posted internships from localStorage or create new list
      const existingPosted = localStorage.getItem('recruiter_posted');
      const postedList = existingPosted ? JSON.parse(existingPosted) : [];

      // Get the internships to find max ID
      const existingInternships = localStorage.getItem('recruiter_internships') || '[]';
      const internshipsList = JSON.parse(existingInternships);
      const maxId = Math.max(0, ...internshipsList.map((i: any) => i.id));

      // Create new internship
      const newInternship = {
        id: maxId + 1,
        company,
        position: formData.position,
        location: formData.location,
        salary: formData.salary,
        duration: formData.duration,
        jobType: formData.jobType,
        description: formData.description,
        skills: formData.skills.split(',').map((s: string) => s.trim()),
        postedDate: new Date().toISOString().split('T')[0],
      };

      internshipsList.push(newInternship);
      localStorage.setItem('recruiter_internships', JSON.stringify(internshipsList));

      // Create entry in recruiter_posted
      const newPosted = {
        id: postedList.length + 1,
        internshipId: newInternship.id,
        totalApplicants: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
      };

      postedList.push(newPosted);
      localStorage.setItem('recruiter_posted', JSON.stringify(postedList));

      alert('Internship posted successfully!');
      navigate('/dashboard/recruiter');
    } catch (err) {
      setError('Failed to post internship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post New Internship</h1>
        <p className="text-gray-600 mb-8">Create a new internship posting for your company</p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {company}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Title *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Frontend Developer Intern"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, NY"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary *
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $20/hour or ₹12,000/month"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration *
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 3 months or 12 weeks"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the internship role, responsibilities, and what candidates will learn..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills (comma-separated) *
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, JavaScript, CSS, HTML"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/recruiter')}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? 'Posting...' : 'Post Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
