const crypto = require('crypto');
const Video = require('../models/Video');
const Chapter = require('../models/Chapter');
const Subject = require('../models/Subject');
const User = require('../models/User');

/**
 * GET /api/videos/:videoId/play-url
 *
 * What this does:
 *   Generates a short-lived, signed Bunny Stream URL so that only users who
 *   have paid for a subject can start playback. The URL expires after 6 hours,
 *   so old or shared links stop working automatically.
 *
 * What this does NOT protect against:
 *   A user who legitimately purchased and unlocked a video can still
 *   screen-record it — no consumer video platform can prevent that. This
 *   endpoint is not "fully secure" or "unhackable"; it is a practical
 *   server-side gate that meaningfully raises the bar against casual piracy
 *   without making false promises.
 */
exports.getPlayUrl = async (req, res) => {
  try {
    const { videoId } = req.params;

    // 1. Look up the video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // 2. Traverse up the hierarchy: Video -> Chapter -> Subject
    const chapter = await Chapter.findById(video.chapter);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const subject = await Subject.findById(chapter.subject);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // 3. Confirm the logged-in user has paid for this subject
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const hasUnlocked = user.unlockedSubjects.some(
      (subId) => subId.toString() === subject._id.toString()
    );

    if (!hasUnlocked) {
      return res.status(403).json({
        error: 'Access denied. You have not purchased this subject. Please complete payment to watch videos.'
      });
    }

    // 4. Generate a Bunny Stream signed URL with 6-hour expiry
    //    Signing method (per Bunny documentation):
    //    token = SHA256(BUNNY_TOKEN_AUTH_KEY + bunnyVideoId + expires)
    //    URL: https://{CDN_HOSTNAME}/{LIBRARY_ID}/{bunnyVideoId}/play.m3u8?token={token}&expires={expires}
    const BUNNY_TOKEN_AUTH_KEY = process.env.BUNNY_TOKEN_AUTH_KEY;
    const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
    const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;

    if (!BUNNY_TOKEN_AUTH_KEY || !BUNNY_LIBRARY_ID || !BUNNY_CDN_HOSTNAME) {
      return res.status(500).json({ error: 'Bunny Stream is not configured on the server.' });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + (6 * 60 * 60); // 6 hours from now

    const token = crypto
      .createHash('sha256')
      .update(BUNNY_TOKEN_AUTH_KEY + video.bunnyVideoId + expiresAt)
      .digest('hex');

    const playUrl = `https://${BUNNY_CDN_HOSTNAME}/${BUNNY_LIBRARY_ID}/${video.bunnyVideoId}/play.m3u8?token=${token}&expires=${expiresAt}`;

    res.json({ playUrl });
  } catch (error) {
    console.error('getPlayUrl error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
