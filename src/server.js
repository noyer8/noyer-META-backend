import express from "express";
import bodyParser from "body-parser";
import { postToInstagram, postInstagramReel, postInstagramStory } from "./instagram.js";
import { postToFacebook, postFacebookStory } from "./facebook.js";
import { uploadFacebookReel } from "./facebook_reels.js";

const app = express();
app.use(bodyParser.json());

// ---------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

// ---------------------------------------------------------
// INSTAGRAM POST
// ---------------------------------------------------------
app.post("/instagram/post", async (req, res) => {
  try {
    const { access_token, instagram_id, caption, images } = req.body;

    const result = await postToInstagram({
      instagramId: instagram_id,
      accessToken: access_token,
      caption,
      images
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// INSTAGRAM REEL
// ---------------------------------------------------------
app.post("/instagram/reel", async (req, res) => {
  try {
    const { access_token, instagram_id, video_url, caption } = req.body;

    const result = await postInstagramReel({
      instagramId: instagram_id,
      accessToken: access_token,
      caption,
      videoUrl: video_url
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// INSTAGRAM STORY
// ---------------------------------------------------------
app.post("/instagram/story", async (req, res) => {
  try {
    const { access_token, instagram_id, media_url } = req.body;

    const result = await postInstagramStory({
      instagramId: instagram_id,
      accessToken: access_token,
      mediaUrl: media_url
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// FACEBOOK POST
// ---------------------------------------------------------
app.post("/facebook/post", async (req, res) => {
  try {
    const { access_token, page_id, message, images } = req.body;

    const result = await postToFacebook({
      pageId: page_id,
      accessToken: access_token,
      message,
      images
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// FACEBOOK STORY
// ---------------------------------------------------------
app.post("/facebook/story", async (req, res) => {
  try {
    const { access_token, page_id, media_url } = req.body;

    const result = await postFacebookStory({
      pageId: page_id,
      accessToken: access_token,
      mediaUrl: media_url
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------
// FACEBOOK REEL (MODULE SÉPARÉ)
// ---------------------------------------------------------
app.post("/facebook/reel", async (req, res) => {
  try {
    const { access_token, page_id, video_url, description } = req.body;

    const result = await uploadFacebookReel({
      accessToken: access_token,
      pageId: page_id,
      videoPath: video_url, // Ex: /mnt/data/pexels-kampus-production-8354894 (240p).mp4
      description
    });

    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ---------------------------------------------------------
// SERVER LISTEN
// ---------------------------------------------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("////////////////////////////////////////////");
  console.log("Noyer META Backend running on port", PORT);
  console.log("////////////////////////////////////////////");
});
