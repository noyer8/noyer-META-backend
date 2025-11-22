import fetch from "node-fetch";
import fs from "fs";

export async function uploadFacebookReel({ pageId, accessToken, videoPath, description }) {
  try {
    console.log("Starting Facebook Reels upload…");

    // 1️⃣ Lire la vidéo depuis le disque
    const fileStats = fs.statSync(videoPath);
    const fileSize = fileStats.size;
    const fileBuffer = fs.readFileSync(videoPath);

    console.log("Video size:", fileSize, "bytes");

    // 2️⃣ Démarrer la session d’upload
    const startRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_phase: "start",
        file_size: fileSize,
        access_token: accessToken
      })
    }).then(r => r.json());

    console.log("Start upload response:", startRes);

    if (!startRes.upload_session_id || !startRes.upload_url) {
      throw new Error("Failed to start the upload session");
    }

    const sessionId = startRes.upload_session_id;
    const uploadUrl = startRes.upload_url;

    // 3️⃣ Envoyer la vidéo (un seul chunk si < 20 Mo)
    console.log("Uploading video chunk…");

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: fileBuffer
    }).then(r => r.json());

    console.log("Upload chunk response:", uploadRes);

    // 4️⃣ Finaliser l’upload
    const finishRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        upload_phase: "finish",
        upload_session_id: sessionId,
        access_token: accessToken
      })
    }).then(r => r.json());

    console.log("Finish upload response:", finishRes);

    if (!finishRes.success) {
      throw new Error("Failed to complete upload");
    }

    const videoId = startRes.video_id;
    console.log("Uploaded video_id:", videoId);

    // 5️⃣ Publier comme REEL
    console.log("Publishing Reel…");

    const publishRes = await fetch(`https://graph.facebook.com/v20.0/${pageId}/video_reels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_id: videoId,
        description: description || "",
        access_token: accessToken
      })
    }).then(r => r.json());

    console.log("Facebook Reel publish result:", publishRes);

    return publishRes;
  } catch (err) {
    console.error("Facebook Reels upload error:", err);
    throw err;
  }
}
