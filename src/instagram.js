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

    // 1. Upload each photo and collect their media IDs
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

    // 2. Create carousel or single container
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

