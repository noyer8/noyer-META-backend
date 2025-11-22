import express from "express";
import { instagramPost, instagramStory } from "./instagram.js";

const app = express();
app.use(express.json());

// ================================
// INSTAGRAM ROUTES
// ================================
app.post("/instagram/post", instagramPost);
app.post("/instagram/story", instagramStory);

// ================================
// ROOT CHECK
// ================================
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

export default app;
