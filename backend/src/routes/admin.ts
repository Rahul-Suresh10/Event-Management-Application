import { Router } from "express";
import pool from "../db";
import { authenticateToken, authorizeRole } from "../middleware/auth";

const router = Router();

// Admin-only: get all users
router.get("/users", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const users = await pool.query("SELECT id, name, email, role, created_at FROM users");
    res.json(users.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// get all participants
router.get("/event/:eventId/participants", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      `SELECT r.id, r.status, u.id as user_id, u.name, u.email
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a single registration status
router.delete("/registration/:registrationId", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { registrationId } = req.params;
// "Confirmed" or "Waitlist"

    await pool.query(
      "DELETE FROM registrations WHERE id=$1",
      [registrationId]
    );

    res.json({ message: "Event deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk update registrations for an event
router.put("/event/:eventId/registrations", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationIds, status } = req.body; // array of registration IDs

    const result = await pool.query(
      `UPDATE registrations SET status = $1 WHERE id = ANY($2::int[]) RETURNING *`,
      [status, registrationIds]
    );

    res.json({ updated: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// get reports
router.get("/reports", async (req, res) => {
  try {
    const events = await pool.query("SELECT status, COUNT(*) AS total FROM events GROUP BY status");
    const participants = await pool.query("SELECT COUNT(*) AS total_participants FROM registrations");
    const perEvent = await pool.query(`
      SELECT e.title, COUNT(r.id) AS total_registrations
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      GROUP BY e.id, e.title
    `);

    res.json({
      events: events.rows,
      participants: participants.rows[0].total_participants,
      perEvent: perEvent.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching reports" });
  }
});


export default router;
