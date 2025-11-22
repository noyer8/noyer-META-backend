import express from "express";
import {
  instagramPost,
  instagramStory,
  instagramReel
} from "./instagram.js";
import {
  facebookPost,
  facebookStory,
  facebookReel
} from "./facebook.js";

const app = express();
app.use(express.json());

// ================================
// INSTAGRAM ROUTES
// ================================
app.post("/instagram/post", instagramPost);
app.post("/instagram/story", instagramStory);
app.post("/instagram/reel", instagramReel);

// ================================
// FACEBOOK ROUTES
// ================================
app.post("/facebook/post", facebookPost);
app.post("/facebook/story", facebookStory);
app.post("/facebook/reel", facebookReel);

// ================================
// ROOT CHECK
// ================================
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

export default app;
