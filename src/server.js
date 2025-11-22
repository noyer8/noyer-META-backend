import express from "express";
import { instagramPost, instagramStory, instagramReel } from "./instagram.js";

const app = express();
app.use(express.json());

// ================================
// INSTAGRAM ROUTES
// ================================
app.post("/instagram/post", instagramPost);
app.post("/instagram/story", instagramStory);
app.post("/instagram/reel", instagramReel);

// ================================
// ROOT CHECK
// ================================
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

export default app;
