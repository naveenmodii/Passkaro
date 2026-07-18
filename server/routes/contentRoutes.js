const express = require('express');
const contentController = require('../controllers/contentController');

const router = express.Router();

router.get('/colleges', contentController.getColleges);
router.get('/colleges/:slug/branches', contentController.getBranches);
router.get('/branches/:branchId/subjects', contentController.getSubjects);
router.get('/subjects/:subjectId/chapters', contentController.getChaptersAndVideos);

module.exports = router;
