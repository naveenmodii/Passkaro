const College = require('../models/College');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Video = require('../models/Video');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { parseCookies } = require('../middleware/auth');

// GET /api/content/colleges?search=xyz
exports.getColleges = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const colleges = await College.find(query);
    res.json(colleges);
  } catch (error) {
    console.error('getColleges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/content/colleges/:slug/branches
exports.getBranches = async (req, res) => {
  try {
    const { slug } = req.params;
    const college = await College.findOne({ slug });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    const branches = await Branch.find({ college: college._id });
    res.json(branches);
  } catch (error) {
    console.error('getBranches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/content/branches/:branchId/subjects
exports.getSubjects = async (req, res) => {
  try {
    const { branchId } = req.params;
    const subjects = await Subject.find({ branch: branchId });
    
    // Include chapterCount for each subject
    const subjectsWithCount = await Promise.all(
      subjects.map(async (subject) => {
        const chapterCount = await Chapter.countDocuments({ subject: subject._id });
        return {
          ...subject.toObject(),
          chapterCount
        };
      })
    );
    res.json(subjectsWithCount);
  } catch (error) {
    console.error('getSubjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/content/subjects/:subjectId/chapters
exports.getChaptersAndVideos = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Optional authentication check via cookies or Authorization header
    let isUnlocked = false;
    try {
      const cookies = parseCookies(req.headers.cookie);
      let token = cookies.token;
      if (!token && req.headers.authorization) {
        token = req.headers.authorization.replace('Bearer ', '');
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (user && (user.role === 'admin' || user.unlockedSubjects.some(subId => subId.toString() === subjectId))) {
          isUnlocked = true;
        }
      }
    } catch (jwtError) {
      // Optional auth failed, treat as locked, no 401 response
    }

    const chapters = await Chapter.find({ subject: subjectId }).sort({ order: 1 });

    const chaptersWithVideos = await Promise.all(
      chapters.map(async (chapter) => {
        const videos = await Video.find({ chapter: chapter._id });
        const sanitizedVideos = videos.map((video) => {
          const videoObj = video.toObject();
          delete videoObj.bunnyVideoId; // Ensure bunnyVideoId is completely omitted
          return {
            ...videoObj,
            unlocked: isUnlocked
          };
        });

        return {
          ...chapter.toObject(),
          videos: sanitizedVideos
        };
      })
    );

    res.json(chaptersWithVideos);
  } catch (error) {
    console.error('getChaptersAndVideos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
