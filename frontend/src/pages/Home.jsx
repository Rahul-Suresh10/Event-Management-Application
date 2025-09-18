import React, { useEffect, useState } from "react";

import "../styles/Home.css"
import api from "../api.js"

export default function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setEvents(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="home-container">
     
      <h2 className="home-title">🎉 Upcoming Events</h2>
      <div className="events-list">
        {events.length > 0  ?  events.map(ev => (
          <div key={ev.id} className="event-card">
            <h3 className="event-title">{ev.title}</h3>
            <img src={`http://localhost:3000/uploads/${ev.image}`} className="event-card-img" alt="" />
            <p className="event-description">{ev.description}</p>
            <p className="event-meta"><b>Date:</b> {new Date(ev.date_time).toLocaleString()}</p>
            <p className="event-meta"><b>Venue:</b> {ev.venue}</p>
            <button
              className="register-btn"
              onClick={() => {
                api.post(`/registrations/${ev.id}`, {}, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                })
                .then(res => alert(`Registered as ${res.data.status}`))
                .catch(err => alert(err.response?.data?.error || err.message));
              }}
            >
              Register
            </button>
          </div>
        )) : <h2 style={{color:"white"}}>Loading...</h2>}
      </div>
    </div>
  );
}
