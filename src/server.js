import express from "express";
import bodyParser from "body-parser";

// === IMPORTS RÉELS QUI EXISTENT DANS TON FICHIER instagram.js ===
import { 
  instagramPost, 
  instagramReel, 
  instagramStory 
} from "./instagram.js";

// === IMPORTS RÉELS QUI EXISTENT DANS ton facebook.js ===
import { 
  postToFacebook, 
  postFacebookStory 
} from "./facebook.js";

const app = express();
app.use(bodyParser.json());

// ---------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Noyer META Backend is running 🚀");
});

// ---------------------------------------------------------
// INSTAGRAM POST (photo ou carrousel)
// ---------------------------------------------------------
app.post("/instagram/post", async (req, res) => {
  try {
    await instagramPost(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// INSTAGRAM REEL
// ---------------------------------------------------------
app.post("/instagram/reel", async (req, res) => {
  try {
    await instagramReel(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// INSTAGRAM STORY
// ---------------------------------------------------------
app.post("/instagram/story", async (req, res) => {
  try {
    await instagramStory(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// FACEBOOK POST (plusieurs images)
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// FACEBOOK STORY (image uniquement)
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
    console.error(err);
    res.status(500).json({ error: err.message });
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
