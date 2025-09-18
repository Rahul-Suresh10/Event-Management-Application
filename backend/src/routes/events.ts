import { Router } from "express";
import pool from "../db";
import { authenticateToken, authorizeRole } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage });

const router = Router();

// Admin: Create Event
router.post("/", authenticateToken, authorizeRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const { title, description, date_time, venue, organiser, participant_limit, status } = req.body;
    const image = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO events (title, description, image, date_time, venue, organiser, participant_limit, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, image, date_time, venue, organiser, participant_limit, status || "upcoming"]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Edit Event
router.put("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, date_time, venue, organiser, participant_limit, status } = req.body;

    const result = await pool.query(
      `UPDATE events SET title=$1, description=$2, image=$3, date_time=$4, venue=$5, organiser=$6,
       participant_limit=$7, status=$8 WHERE id=$9 RETURNING *`,
      [title, description, image, date_time, venue, organiser, participant_limit, status, id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Event
router.delete("/:id", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    
    const { id } = req.params;

    const result = await pool.query("SELECT image FROM events WHERE id=$1", [id]);
    const image = result.rows[0]?.image;

    await pool.query("DELETE FROM events WHERE id=$1", [id]);
    if (image) {
      const filePath = path.join(__dirname, "../uploads", image);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }
    res.json({ message: "Event deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Get all events for admin (both completed and upcoming)
router.get("/allevents", authenticateToken,authorizeRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date_time ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Participant: View Upcoming Events
router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events WHERE status='upcoming' ORDER BY date_time ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
