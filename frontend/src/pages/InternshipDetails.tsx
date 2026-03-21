import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { ApplyModal } from "../components/ApplyModal"

interface Internship {
  id: number
  company: string
  position: string
  location: string
  salary: string
  duration: string
  jobType: string
  description: string
  skills: string[]
  postedDate: string
}

const internships: Internship[] = [
  {
    id: 1,
    company: "Ahmedabad Tech Solutions",
    position: "Frontend Developer Intern",
    location: "Ahmedabad, Gujarat",
    salary: "₹12,000/month",
    duration: "3 months",
    jobType: "Internship",
    description:
      "Work on building responsive web applications using modern frontend technologies.",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    postedDate: "2026-02-01",
  },
  {
    id: 2,
    company: "Gujarat Data Systems",
    position: "Data Analyst Intern",
    location: "Gandhinagar, Gujarat",
    salary: "₹15,000/month",
    duration: "4 months",
    jobType: "Internship",
    description:
      "Assist in analyzing datasets and preparing reports for business insights.",
    skills: ["Python", "SQL", "Excel"],
    postedDate: "2026-02-02",
  },
  {
    id: 3,
    company: "Surat Digital Labs",
    position: "UI/UX Design Intern",
    location: "Surat, Gujarat",
    salary: "₹10,000/month",
    duration: "3 months",
    jobType: "Internship",
    description:
      "Support the design team in creating clean and user-friendly interfaces.",
    skills: ["Figma", "UI Design", "Prototyping"],
    postedDate: "2026-02-03",
  },
  {
    id: 4,
    company: "Vadodara Software Pvt Ltd",
    position: "Full Stack Developer Intern",
    location: "Vadodara, Gujarat",
    salary: "₹18,000/month",
    duration: "6 months",
    jobType: "Internship",
    description:
      "Work on frontend and backend development for internal web applications.",
    skills: ["React", "Node.js", "MongoDB"],
    postedDate: "2026-02-04",
  },
  {
    id: 5,
    company: "Rajkot IT Services",
    position: "Mobile App Developer Intern",
    location: "Rajkot, Gujarat",
    salary: "₹14,000/month",
    duration: "5 months",
    jobType: "Internship",
    description:
      "Assist in developing and testing Android mobile applications.",
    skills: ["Java", "Android", "REST APIs"],
    postedDate: "2026-02-05",
  },
]

export default function InternshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const internship = internships.find(
    (item) => item.id === Number(id)
  )

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'applicant') {
      alert('Only students can apply for internships')
      return
    }
    setIsModalOpen(true)
  }

  const handleApplySubmit = (data: ApplicationData) => {
    // Get existing applications from localStorage
    const existing = localStorage.getItem('student_applications');
    type Application = {
      id: number;
      internshipId: number;
      status: string;
      appliedDate: string;
      resumeName: string;
      coverLetter: string;
    };
    const applications: Application[] = existing ? JSON.parse(existing) : [];

    // Check if already applied
    const alreadyApplied = applications.some(
      (app) => app.internshipId === data.internshipId
    );

    if (alreadyApplied) {
      alert('You have already applied for this internship');
      return;
    }

    // Create new application
    const newApplication: Application = {
      id: Math.max(0, ...applications.map((a) => a.id)) + 1,
      internshipId: data.internshipId,
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      resumeName: data.resumeName,
      coverLetter: data.coverLetter,
    };

    applications.push(newApplication);
    localStorage.setItem('student_applications', JSON.stringify(applications));

    alert('Application submitted successfully!');
    navigate('/dashboard/student');
  }

  if (!internship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Internship not found
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button
          onClick={() => navigate("/explore")}
          className="text-blue-600 font-medium hover:text-blue-800 mb-8"
        >
          ← Back to Internships
        </button>

        <div className="border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {internship.position}
          </h1>

          <p className="text-xl text-gray-700 font-medium mb-4">
            {internship.company}
          </p>

          <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
            <span>{internship.location}</span>
            <span>{internship.salary}</span>
            <span>{internship.duration}</span>
            <span>{internship.jobType}</span>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Job Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {internship.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Required Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {internship.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md font-medium text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-md">
            <p className="text-gray-700 mb-2 text-sm">
              Posted on:{" "}
              {new Date(internship.postedDate).toLocaleDateString()}
            </p>

            <p className="text-gray-600 text-sm">
              To apply for this internship, please register on the platform and complete your profile.
            </p>

            <button
              onClick={handleApplyClick}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Apply Now
            </button>
          </section>
        </div>
      </div>

      <ApplyModal
        isOpen={isModalOpen}
        internshipId={internship.id}
        position={internship.position}
        company={internship.company}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApplySubmit}
      />
    </main>
  )
}