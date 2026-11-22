import { NavLink, useNavigate } from "react-router-dom";
import { getToken, getRole, logout } from "../services/authService";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const token = getToken();
  const role = getRole();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  if (!token || !role) {
    return null;
  }

  function linkClass({ isActive }) {
    return `navbar-link ${isActive ? "active" : ""}`;
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink
          to={role === "ADMIN" ? "/dashboard" : "/profile"}
          className="navbar-brand"
        >
          <span className="navbar-logo">✦</span>

          <span className="navbar-brand-text">
            <strong>DORMIFY</strong>
            <small>DORMITORY MANAGEMENT</small>
          </span>
        </NavLink>

        <nav className="navbar-links" aria-label="Main navigation">
          {role === "ADMIN" && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/students" className={linkClass}>
                Students
              </NavLink>

              <NavLink to="/rooms" className={linkClass}>
                Rooms
              </NavLink>

              <NavLink to="/assignments" className={linkClass}>
                Assignments
              </NavLink>
            </>
          )}

          {role === "STUDENT" && (
            <NavLink to="/profile" className={linkClass}>
              My Profile
            </NavLink>
          )}
        </nav>

        <div className="navbar-right">
          <span className="navbar-role">
            {role === "ADMIN" ? "Administrator" : "Student"}
          </span>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout ↗
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;