import fetch from "node-fetch";

// ================================
// POST /facebook/post
// ================================
export async function facebookPost(req, res) {
  try {
    const { access_token, page_id, message, photos } = req.body;

    if (!access_token || !page_id || !photos?.length) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    // 1. Upload each photo and get media_fbid
    let attachedMedia = [];

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

      attachedMedia.push({ media_fbid: media.id });
    }

    // 2. Create the final post with all photos
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
