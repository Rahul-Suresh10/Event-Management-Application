import React, { useState } from "react";
import "../styles/Register.css"; 
import api from "../api";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("participant");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/signup", { name, email, password, role });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role)
      alert("✅ Registered successfully! You can login now.");
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong!");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create an Account</h2>
        <input 
          className="register-input"
          placeholder="Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        <input 
          className="register-input"
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <input 
          className="register-input"
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
        />
        <select 
          className="register-select"
          value={role} 
          onChange={e => setRole(e.target.value)}
        >
          <option value="participant">Participant</option>
          <option value="admin">Admin</option>
        </select>
        <button className="register-btn" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}
