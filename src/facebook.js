import fetch from "node-fetch";

// ================================
// POST /facebook/post
// ================================
// JSON attendu :
// {
//   "access_token": "XXX",
//   "page_id": "1234...",
//   "message": "Texte du post",
//   "photos": ["https://url.com/1.jpg", "https://url.com/2.jpg"]
// }
export async function facebookPost(req, res) {
  try {
    const { access_token, page_id, message, photos } = req.body;

    if (!access_token || !page_id || !photos?.length) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    let attachedMedia = [];

    // 1. Upload de chaque photo (non publiée)
    for (const url of photos) {
      const media = await fetch(
        `https://graph.facebook.com/v21.0/${page_id}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            published: false,
            access_token
          })
        }
      ).then(r => r.json());

      if (!media.id) {
        console.error("Facebook photo error:", media);
        return res.status(500).json({ error: "Failed to upload photo" });
      }

      attachedMedia.push({ media_fbid: media.id });
    }

    // 2. Création du post avec toutes les photos
    const post = await fetch(
      `https://graph.facebook.com/v21.0/${page_id}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          attached_media: attachedMedia,
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Facebook post failed" });
  }
}

// ================================
// POST /facebook/story
// (photo uniquement, la vidéo est plus complexe à gérer proprement)
// ================================
// JSON attendu :
// {
//   "access_token": "XXX",
//   "page_id": "1234...",
//   "photo_url": "https://url.com/story.jpg"
// }
export async function facebookStory(req, res) {
  try {
    const { access_token, page_id, photo_url } = req.body;

    if (!access_token || !page_id || !photo_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Upload de la photo en non publiée
    const photo = await fetch(
      `https://graph.facebook.com/v21.0/${page_id}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: photo_url,
          published: false,
          access_token
        })
      }
    ).then(r => r.json());

    if (!photo.id) {
      console.error("Facebook story photo error:", photo);
      return res.status(500).json({ error: "Failed to upload story photo" });
    }

    // 2. Créer la story à partir de la photo
    const story = await fetch(
      `https://graph.facebook.com/v21.0/${page_id}/photo_stories`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_id: photo.id,
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(story);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Facebook story failed" });
  }
}

// ================================
// POST /facebook/reel
// ================================
// On suit le flow officiel des Reels :
// 1) /page-id/video_reels?upload_phase=start  -> video_id + upload_url
// 2) POST vers rupload.facebook.com avec file_url = video_url
// 3) /page-id/video_reels?upload_phase=finish avec description
//
// JSON attendu :
// {
//   "access_token": "XXX",       // Page access token
//   "page_id": "1234...",
//   "video_url": "https://cdn.com/reel.mp4",
//   "description": "Texte du reel"
// }
export async function facebookReel(req, res) {
  try {
    const { access_token, page_id, video_url, description } = req.body;

    if (!access_token || !page_id || !video_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Initialiser la session d'upload
    const start = await fetch(
      `https://graph.facebook.com/v21.0/${page_id}/video_reels?upload_phase=start&access_token=${encodeURIComponent(
        access_token
      )}`,
      {
        method: "POST"
      }
    ).then(r => r.json());

    if (!start.video_id || !start.upload_url) {
      console.error("Facebook reels start error:", start);
      return res.status(500).json({ error: "Failed to start reels upload" });
    }

    // 2. Upload depuis une URL hébergée (CDN) via rupload
    const upload = await fetch(start.upload_url, {
      method: "POST",
      headers: {
        Authorization: `OAuth ${access_token}`,
        file_url: video_url
      }
    }).then(r => r.json());

    if (!upload.success) {
      console.error("Facebook reels upload error:", upload);
      return res.status(500).json({ error: "Failed to upload reel video" });
    }

    // 3. Terminer et publier le Reel
    const finish = await fetch(
      `https://graph.facebook.com/v21.0/${page_id}/video_reels`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_phase: "finish",
          video_id: start.video_id,
          description: description || "",
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(finish);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Facebook reel failed" });
  }
}
