import fetch from "node-fetch";

// ================================
// POST /instagram/post
// ================================
export async function instagramPost(req, res) {
  try {
    const { access_token, instagram_id, caption, photos } = req.body;

    if (!access_token || !instagram_id || !photos?.length) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Upload each photo and get media IDs
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

      mediaIds.push(media.id);
    }

    // 2. Create carousel or single media container
    const container = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
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
              }
        )
      }
    ).then(r => r.json());

    // 3. Publish
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
export async function instagramStory(req, res) {
  try {
    const { access_token, instagram_id, media_url } = req.body;

    if (!access_token || !instagram_id || !media_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const isVideo = media_url.toLowerCase().endsWith(".mp4");

    // 1. Create media
    const media = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: isVideo ? "VIDEO" : "IMAGE",
          video_url: isVideo ? media_url : undefined,
          image_url: !isVideo ? media_url : undefined,
          access_token
        })
      }
    ).then(r => r.json());

    // 2. Publish
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
export async function instagramReel(req, res) {
  try {
    const { access_token, instagram_id, video_url, caption } = req.body;

    if (!access_token || !instagram_id || !video_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Create video container
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

    // 2. Publish Reel
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
