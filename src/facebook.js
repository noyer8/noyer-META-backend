import fetch from "node-fetch";

// ---------------------------------------------------------
// FACEBOOK POST (avec plusieurs images)
// ---------------------------------------------------------
export async function postToFacebook({ pageId, accessToken, message, images }) {
  try {
    if (!pageId || !accessToken || !images?.length) {
      throw new Error("Missing parameters");
    }

    let attachedMedia = [];

    // 1. Upload chaque image en NON-PUBLIÉE
    for (const url of images) {
      const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          published: false,
          access_token: accessToken
        })
      }).then(r => r.json());

      if (!res.id) {
        console.error("Facebook upload photo error:", res);
        throw new Error("Failed to upload image");
      }

      attachedMedia.push({ media_fbid: res.id });
    }

    // 2. Créer le post final
    const post = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        attached_media: attachedMedia,
        access_token: accessToken
      })
    }).then(r => r.json());

    return post;
  } catch (err) {
    console.error("Facebook post error:", err);
    throw err;
  }
}

// ---------------------------------------------------------
// FACEBOOK STORY (photo ONLY)
// ---------------------------------------------------------
export async function postFacebookStory({ pageId, accessToken, mediaUrl }) {
  try {
    if (!pageId || !accessToken || !mediaUrl) {
      throw new Error("Missing parameters");
    }

    // 1. upload photo en non publiée
    const uploaded = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/photos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mediaUrl,
          published: false,
          access_token: accessToken
        })
      }
    ).then(r => r.json());

    if (!uploaded.id) {
      console.error("FB story upload error:", uploaded);
      throw new Error("Failed to upload photo");
    }

    // 2. Créer la story
    const story = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/photo_stories`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_id: uploaded.id,
          access_token: accessToken
        })
      }
    ).then(r => r.json());

    return story;
  } catch (err) {
    console.error("Facebook story error:", err);
    throw err;
  }
}
