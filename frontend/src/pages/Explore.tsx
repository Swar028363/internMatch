import { Link } from "react-router-dom"

interface Internship {
  id: number
  company: string
  position: string
  location: string
  salary: string
  duration: string
  description: string
}

const internships: Internship[] = [
  {
    id: 1,
    company: "Ahmedabad Tech Solutions",
    position: "Frontend Developer Intern",
    location: "Ahmedabad, Gujarat",
    salary: "₹12,000/month",
    duration: "3 months",
    description: "Work on building responsive web applications using modern frontend technologies."
  },
  {
    id: 2,
    company: "Gujarat Data Systems",
    position: "Data Analyst Intern",
    location: "Gandhinagar, Gujarat",
    salary: "₹15,000/month",
    duration: "4 months",
    description: "Assist in analyzing datasets and preparing reports for business insights."
  },
  {
    id: 3,
    company: "Surat Digital Labs",
    position: "UI/UX Design Intern",
    location: "Surat, Gujarat",
    salary: "₹10,000/month",
    duration: "3 months",
    description: "Support the design team in creating clean and user-friendly interfaces."
  },
  {
    id: 4,
    company: "Vadodara Software Pvt Ltd",
    position: "Full Stack Developer Intern",
    location: "Vadodara, Gujarat",
    salary: "₹18,000/month",
    duration: "6 months",
    description: "Work on both frontend and backend development for web applications."
  },
  {
    id: 5,
    company: "Rajkot IT Services",
    position: "Mobile App Developer Intern",
    location: "Rajkot, Gujarat",
    salary: "₹14,000/month",
    duration: "5 months",
    description: "Assist in developing and testing mobile applications for Android devices."
  }
]

export default function Explore() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Explore Internships
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ================= FILTER SIDEBAR ================= */}
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Filters
            </h2>

            <div className="space-y-6 text-sm">

              {/* Company */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Search company..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Location
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option>All Locations</option>
                  <option>New York</option>
                  <option>San Francisco</option>
                  <option>Chicago</option>
                  <option>Los Angeles</option>
                </select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Salary Range
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Duration
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option>Any Duration</option>
                  <option>3 Months</option>
                  <option>4 Months</option>
                  <option>5 Months</option>
                </select>
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Job Type
                </label>
                <div className="space-y-2 text-gray-700">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Internship
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Part-Time
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Remote
                  </label>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Skills
                </label>
                <div className="space-y-2 text-gray-700 max-h-40 overflow-y-auto">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    React
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    JavaScript
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Python
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    SQL
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Swift
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Figma
                  </label>
                </div>
              </div>

              {/* Posted Date */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Posted Within
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500">
                  <option>Any Time</option>
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>

              {/* Clear Button */}
              <button
                type="button"
                className="w-full bg-gray-300 text-gray-900 py-2 rounded-md font-medium hover:bg-gray-400"
              >
                Clear Filters
              </button>

            </div>
          </div>

          {/* ================= INTERNSHIP LIST ================= */}
          <div className="md:col-span-3 space-y-6">
            {internships.map(internship => (
              <Link
                key={internship.id}
                to={`/internship/${internship.id}`}
                className="block p-6 border border-gray-200 rounded-md hover:shadow-md hover:border-blue-300 transition"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {internship.position}
                </h3>

                <p className="text-gray-700 mt-1">
                  {internship.company}
                </p>

                <p className="text-sm text-gray-600 mt-2">
                  {internship.location} • {internship.salary} • {internship.duration}
                </p>

                <p className="text-gray-600 mt-3">
                  {internship.description}
                </p>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </main>
  )
}
