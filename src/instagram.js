import fetch from "node-fetch";

//
// 🟣 Fonction utilitaire : Attendre le traitement Meta
//
async function waitForMediaReady(creationId, access_token) {
  let status = "IN_PROGRESS";
  let attempts = 0;

  while (status !== "FINISHED" && attempts < 15) {
    await new Promise(res => setTimeout(res, 2000)); // attendre 2s

    const check = await fetch(
      `https://graph.facebook.com/v21.0/${creationId}?fields=status_code&access_token=${access_token}`
    ).then(r => r.json());

    status = check.status_code;
    attempts++;
  }

  return status === "FINISHED";
}

//
// ================================
// POST /instagram/post (carrousel + single photo)
// ================================
//
export async function instagramPost(req, res) {
  try {
    const { access_token, instagram_id, caption, photos } = req.body;

    if (!access_token || !instagram_id || !photos?.length) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    let mediaIds = [];

    // Upload chaque média
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
        console.error("Media upload error:", media);
        return res.status(500).json({ error: "Failed to upload media" });
      }

      const ready = await waitForMediaReady(media.id, access_token);
      if (!ready) {
        return res.status(500).json({ error: "Media is not ready" });
      }

      mediaIds.push(media.id);
    }

    // Container final : carrousel ou single
    const containerData =
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
        body: JSON.stringify(containerData)
      }
    ).then(r => r.json());

    if (!container.id) {
      console.error("Container creation error:", container);
      return res.status(500).json({ error: "Failed to create container" });
    }

    const containerReady = await waitForMediaReady(container.id, access_token);
    if (!containerReady) {
      return res
        .status(500)
        .json({ error: "Container is not ready for publishing" });
    }

    // Publication
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

//
// ================================
// POST /instagram/story (CORRIGÉ AVEC media_type: "STORIES")
// ================================
//
export async function instagramStory(req, res) {
  try {
    const { access_token, instagram_id, media_url } = req.body;

    if (!access_token || !instagram_id || !media_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const isVideo = media_url.toLowerCase().endsWith(".mp4");

    // Upload du média — IMPORTANT : media_type = STORIES
    const media = await fetch(
      `https://graph.facebook.com/v21.0/${instagram_id}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "STORIES",
          video_url: isVideo ? media_url : undefined,
          image_url: !isVideo ? media_url : undefined,
          access_token
        })
      }
    ).then(r => r.json());

    if (!media.id) {
      console.error("Story upload error:", media);
      return res.status(500).json({ error: "Failed to upload story" });
    }

    const ready = await waitForMediaReady(media.id, access_token);
    if (!ready) {
      return res.status(500).json({ error: "Story media is not ready" });
    }

    // Publier la story
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

//
// ================================
// POST /instagram/reel
// ================================
//
export async function instagramReel(req, res) {
  try {
    const { access_token, instagram_id, video_url, caption } = req.body;

    if (!access_token || !instagram_id || !video_url) {
      return res.status(400).json({ error: "Missing parameters" });
    }

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
      console.error("Reel container error:", container);
      return res.status(500).json({ error: "Failed to create reel container" });
    }

    const ready = await waitForMediaReady(container.id, access_token);
    if (!ready) {
      return res.status(500).json({ error: "Reel media is not ready" });
    }

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
