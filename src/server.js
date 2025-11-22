import express from "express";
import { instagramPost } from "./instagram.js";

const app = express();
app.use(express.json());

// ================================
// ROUTES
// ================================
app.post("/instagram/post", instagramPost);

// ================================
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

export default app;
