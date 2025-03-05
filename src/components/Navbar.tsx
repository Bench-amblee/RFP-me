import { Link, useLocation } from "react-router-dom";
import { FileText, Upload, BarChart3 } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand Name */}
          <Link to="/" className="text-xl font-bold text-gray-900">
            RFP Generator
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-6">
            <NavItem to="/" label="Home" icon={<FileText />} active={location.pathname === "/"} />
            <NavItem to="/upload" label="Upload" icon={<Upload />} active={location.pathname === "/upload"} />
            <NavItem to="/review" label="Review" icon={<BarChart3 />} active={location.pathname === "/review"} />
          </div>
        </div>
      </div>
    </nav>
  );
};

// NavItem component for individual links
const NavItem = ({ to, label, icon, active }: { to: string; label: string; icon: JSX.Element; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
      active ? "text-blue-600 bg-blue-100" : "text-gray-700 hover:text-blue-600"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;