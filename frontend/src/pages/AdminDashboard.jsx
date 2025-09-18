import React, { useState, useEffect } from "react";
import api from "../api";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [participantLimit, setParticipantLimit] = useState("");
  const [organiser, setOrganiser] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const token = localStorage.getItem("token");

  const [participantTitle, setParticipantTitle] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/allevents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data)
      setEvents(res.data);
    } catch (err) {
      alert("Error fetching events");
    }
  };

  const editEvent = (ev) => {
    setSelectedEvent(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setDate(ev.date_time);
    setVenue(ev.venue);
    setOrganiser(ev.organiser);
    setParticipantLimit(ev.participant_limit);
    setStatus(ev.status);
    setImage(null);
  };

  const submitEvent = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date_time", date);
      formData.append("venue", venue);
      formData.append("organiser", organiser);
      formData.append("participant_limit", participantLimit.toString());
      formData.append("status", status);
      if (image) formData.append("image", image);

      if (selectedEvent) {
        await api.put(`/events/${selectedEvent}`, formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("Event updated!");
      } else {
        await api.post("/events", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        alert("Event created!");
      }

      fetchEvents();
      clearForm();
    } catch (err) {
      alert(err.response?.data?.error || "Error saving event");
    }
  };

  const clearForm = () => {
    setSelectedEvent(null);
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    setOrganiser("");
    setParticipantLimit("");
    setStatus("upcoming");
    setImage(null);
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Event deleted!");
      fetchEvents();
    } catch (err) {
      alert("Error deleting event");
    }
  };

  const fetchParticipants = async (eventId, title) => {
    try {
      const res = await api.get(`/admin/event/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setParticipants(res.data);
      setParticipantTitle(title);
    } catch (err) {
      alert("Error fetching participants");
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* Event Form */}
      <div className="card form-card">
        <h3>{selectedEvent ? "Update Event" : "Create New Event"}</h3>
        <div className="form">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <input placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          <input placeholder="Organiser" value={organiser} onChange={(e) => setOrganiser(e.target.value)} />
          <input type="number" placeholder="Participant Limit" value={participantLimit} onChange={(e) => setParticipantLimit(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <div className="form-actions">
            <button className="btn primary" onClick={submitEvent}>
              {selectedEvent ? "Update Event" : "Create Event"}
            </button>
            {selectedEvent && <button className="btn secondary" onClick={clearForm}>Cancel</button>}
          </div>
        </div>
      </div>

      {/* Event List */}
      <h3 className="section-title">All Events</h3>
      <div className="grid">
        {events.map((ev) => (
          <div key={ev.id} className="card event-card">
            <h4>{ev.title}</h4>
            {ev.image && <img src={`http://localhost:3000/uploads/${ev.image}`} className="card-img" alt={ev.title} />}
            <p>{ev.description}</p>
            <p><b>Date:</b> {new Date(ev.date_time).toLocaleString()}</p>
            <p><b>Venue:</b> {ev.venue}</p>
            <p><b>Organiser:</b> {ev.organiser}</p>
            <p><b>Status:</b> {ev.status}</p>
            <div className="actions">
              <button className="btn danger" onClick={() => deleteEvent(ev.id)}>Delete</button>
              <button className="btn secondary" onClick={() => editEvent(ev)}>Edit</button>
              <button className="btn secondary" onClick={() => fetchParticipants(ev.id, ev.title)}>View Participants</button>
            </div>
          </div>
        ))}
      </div>

      {participants.length > 0 ? (
  <div className="card participants">
    <h1>{participantTitle}</h1>
    <h3>Participants</h3>
    {participants.map((p) => (
      <div key={p.id} className="participant">
        <p>
          <b>{p.name}</b> ({p.email}) - Status: {p.status}
        </p>
        <button
          className="btn danger"
          onClick={async () => {
            if (window.confirm(`Remove ${p.name} from this event?`)) {
              try {
                await api.delete(`/admin/registration/${p.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                alert(`${p.name} removed successfully!`);
                // Refresh participants list
                fetchParticipants(selectedEvent);
                
              } catch (err) {
                alert("Error removing participant");
              }
            }
          }}
        >
          Remove
        </button>
      </div>
    ))}
  </div>
) : (
  <p>No participants</p>
)}

    </div>
  );
}
