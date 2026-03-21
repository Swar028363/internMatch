import { Link } from "react-router-dom"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">InternMatch</h3>
            <p className="text-sm text-gray-400">
              Skill-based internship matching platform.
            </p>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Find Internships
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/companies" className="hover:text-white transition">
                  Browse Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">For Companies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/post-internship" className="hover:text-white transition">
                  Post Internship
                </Link>
              </li>
              <li>
                <Link to="/browse-candidates" className="hover:text-white transition">
                  Browse Candidates
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help-center" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <p className="text-sm text-gray-400">
            © {currentYear} InternMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
