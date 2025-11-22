import fetch from "node-fetch";

// ================================
// POST /instagram/post
// ================================
// JSON attendu :
// {
//   "access_token": "XXX",
//   "instagram_id": "1784...",
//   "caption": "Texte du post",
//   "photos": ["https://url.com/1.jpg", "https://url.com/2.jpg"]
// }
export async function instagramPost(req, res) {
  try {
    const { access_token, instagram_id, caption, photos } = req.body;

    if (!access_token || !instagram_id || !photos?.length) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Upload de chaque photo -> media_ids
    let mediaIds = [];
    for (const url of photos) {
      const media = await fetch(
        `https://graph.facebook.com/v21.0/${instagram_id}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: url,
            is_carousel_item: photos.length > 1,
            access_token
          })
        }
      ).then(r => r.json());

      if (!media.id) {
        console.error("Instagram media error:", media);
        return res.status(500).json({ error: "Failed to create media item" });
      }

      mediaIds.push(media.id);
    }

    // 2. Création du container (carrousel ou image simple)
    const containerBody =
      photos.length > 1
        ? {
            media_type: "CAROUSEL",
            children: mediaIds,
            caption,
            access_token
          }
        : {
            caption,
            image_url: photos[0],
            access_token
          };

    const container = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerBody)
      }
    ).then(r => r.json());

    if (!container.id) {
      console.error("Instagram container error:", container);
      return res.status(500).json({ error: "Failed to create container" });
    }

    // 3. Publication
    const published = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(published);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Instagram post failed" });
  }
}

// ================================
// POST /instagram/story
// ================================
// JSON attendu :
// {
//   "access_token": "XXX",
//   "instagram_id": "1784...",
//   "media_url": "https://url.com/story.jpg" | "https://url.com/story.mp4"
// }
export async function instagramStory(req, res) {
  try {
    const { access_token, instagram_id, media_url } = req.body;

    if (!access_token || !instagram_id || !media_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const isVideo = media_url.toLowerCase().endsWith(".mp4");

    // 1. Création du média (IMAGE ou VIDEO)
    const mediaBody = {
      media_type: isVideo ? "VIDEO" : "IMAGE",
      access_token
    };

    if (isVideo) {
      mediaBody.video_url = media_url;
    } else {
      mediaBody.image_url = media_url;
    }

    const media = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mediaBody)
      }
    ).then(r => r.json());

    if (!media.id) {
      console.error("Instagram story media error:", media);
      return res.status(500).json({ error: "Failed to create story media" });
    }

    // 2. Publication
    const published = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: media.id,
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(published);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Instagram story failed" });
  }
}

// ================================
// POST /instagram/reel
// ================================
// JSON attendu :
// {
//   "access_token": "XXX",
//   "instagram_id": "1784...",
//   "video_url": "https://url.com/reel.mp4",
//   "caption": "Texte du reel"
// }
export async function instagramReel(req, res) {
  try {
    const { access_token, instagram_id, video_url, caption } = req.body;

    if (!access_token || !instagram_id || !video_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Création du container de Reel
    const container = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url,
          caption,
          access_token
        })
      }
    ).then(r => r.json());

    if (!container.id) {
      console.error("Instagram reel container error:", container);
      return res.status(500).json({ error: "Failed to create reel container" });
    }

    // 2. Publication du Reel
    const published = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token
        })
      }
    ).then(r => r.json());

    return res.json(published);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Instagram reel failed" });
  }
}
