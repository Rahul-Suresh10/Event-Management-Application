import React from 'react'
import { Link, useNavigate } from "react-router-dom"
import "../styles/Navbar.css"  

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const role = localStorage.getItem("role");
  

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h2 className="logo">EventHub</h2>
        <div className="nav-links">
          {role !== "admin" && <Link to="/" className="nav-link">Home</Link>}
          {role === "admin" && <Link to="/reports" className="nav-link">Reports</Link>}
          {role === "admin" && <Link to="/admin" className='nav-link'>AdminBoard</Link>}

          {!token && <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>}

          {token && <>
            {role !== "admin" && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </>}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
