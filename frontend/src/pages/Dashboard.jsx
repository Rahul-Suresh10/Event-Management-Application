import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css"; 
import api from "../api";


export default function Dashboard() {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    api
      .get("/registrations/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setRegistrations(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">📅 My Registrations</h2>
      <div className="registrations-list">
        {registrations.length > 0 ? registrations.map((r) => (
          <div key={r.id} className="registration-card">
            <h3 className="registration-title">{r.title}</h3>
            <img src={`http://localhost:3000/uploads/${r.image}`} className="reg-card-img" alt="" />
            <p><b>Status:</b> <span className={`status ${r.status.toLowerCase()}`}>{r.status}</span></p>
            <p><b>Date:</b> {new Date(r.date_time).toLocaleString()}</p>
            <p><b>Venue:</b> {r.venue}</p>
          </div>
        )): (registrations.length === 0 ? <h2  style={{color:"white"}}>No events Registered</h2>:<h2 style={{color:"white"}}>Loading...</h2>)}
      </div>
    </div>
  );
}
