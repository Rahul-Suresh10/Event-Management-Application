import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "../styles/AdminReports.css";

export default function AdminReports() {
  const [reports, setReports] = useState(null);

  useEffect(() => {
    api
      .get("/admin/reports", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setReports(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!reports) return <p className="loading">Loading reports...</p>;

  const COLORS = ["#6c63ff", "#28a745", "#ffc107", "#dc3545"];

  return (
    <div className="reports-container">
      <h2 className="reports-title">Admin Reports Dashboard</h2>

      {/* Total Participants */}
      <div className="card total-participants">
        <h3>Total Participants</h3>
        <p>{reports.participants}</p>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Events by Status - Pie Chart */}
        <div className="card">
          <h3>Events by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reports.events.map(e => ({ ...e, total: Number(e.total) }))}
                dataKey="total"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {reports.events.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Registrations per Event - Bar Chart */}
        <div className="card">
          <h3>Registrations per Event</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reports.perEvent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_registrations" fill="#6c63ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
