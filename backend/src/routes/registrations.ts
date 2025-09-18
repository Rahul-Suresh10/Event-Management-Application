import { Router } from "express";
import pool from "../db";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Participant: Register for an event
router.post("/:eventId", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;

    // Check if user already registered
    const existing = await pool.query(
      "SELECT * FROM registrations WHERE user_id=$1 AND event_id=$2",
      [userId, eventId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Already registered for this event" });
    }

    // Check participant limit
    const event = await pool.query("SELECT participant_limit FROM events WHERE id=$1", [eventId]);
    if (event.rows.length === 0) return res.status(404).json({ error: "Event not found" });

    const registrationsCount = await pool.query(
      "SELECT COUNT(*) FROM registrations WHERE event_id=$1 AND status='Confirmed'",
      [eventId]
    );

    const limit = event.rows[0].participant_limit;
    const count = parseInt(registrationsCount.rows[0].count);

    const status = count < limit ? "Confirmed" : "Waitlist";

    // Insert registration
    const result = await pool.query(
      "INSERT INTO registrations (user_id, event_id, status) VALUES ($1,$2,$3) RETURNING *",
      [userId, eventId, status]
    );

    res.json({ registration: result.rows[0], status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Participant: View their registrations
router.get("/my", authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT r.id, r.status, e.title,e.image,  e.date_time, e.venue 
       FROM registrations r 
       JOIN events e ON r.event_id = e.id 
       WHERE r.user_id=$1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
