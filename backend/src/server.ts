import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin";
import eventRoutes from "./routes/events";
import authRoutes from "./routes/auth";
import regRoutes from "./routes/registrations";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/registrations", regRoutes)




app.get("/api/health", (req, res) => {
  res.json({ message: "Backend is working fine 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
