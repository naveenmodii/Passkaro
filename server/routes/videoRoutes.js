const express = require('express');
const { requireAuth } = require('../middleware/auth');
const videoController = require('../controllers/videoController');

const router = express.Router();

// GET /api/videos/:videoId/play-url
// Requires authentication. Checks subject ownership before signing URL.
router.get('/:videoId/play-url', requireAuth, videoController.getPlayUrl);

module.exports = router;
