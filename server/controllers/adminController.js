const College = require('../models/College');
const Branch = require('../models/Branch');
const Subject = require('../models/Subject');
const Chapter = require('../models/Chapter');
const Video = require('../models/Video');
const { validationResult } = require('express-validator');

// Helper to check validation results and return custom error shape
const hasValidationError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return true;
  }
  return false;
};

// ==========================================
// COLLEGE CRUD
// ==========================================

exports.createCollege = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { name, slug, city, affiliatingUniversity } = req.body;

    const existingCollege = await College.findOne({ slug });
    if (existingCollege) {
      return res.status(400).json({ error: 'College with this slug already exists' });
    }

    const college = new College({ name, slug, city, affiliatingUniversity });
    await college.save();
    res.status(201).json(college);
  } catch (error) {
    console.error('createCollege error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateCollege = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { id } = req.params;
    const { name, slug, city, affiliatingUniversity } = req.body;

    if (slug) {
      const existingCollege = await College.findOne({ slug, _id: { $ne: id } });
      if (existingCollege) {
        return res.status(400).json({ error: 'College with this slug already exists' });
      }
    }

    const college = await College.findByIdAndUpdate(
      id,
      { name, slug, city, affiliatingUniversity },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    res.json(college);
  } catch (error) {
    console.error('updateCollege error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findByIdAndDelete(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('deleteCollege error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// BRANCH CRUD
// ==========================================

exports.createBranch = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { college: collegeId, name, code } = req.body;

    const parentCollege = await College.findById(collegeId);
    if (!parentCollege) {
      return res.status(400).json({ error: 'Parent College not found' });
    }

    const branch = new Branch({ college: collegeId, name, code });
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    console.error('createBranch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { id } = req.params;
    const { college: collegeId, name, code } = req.body;

    if (collegeId) {
      const parentCollege = await College.findById(collegeId);
      if (!parentCollege) {
        return res.status(400).json({ error: 'Parent College not found' });
      }
    }

    const branch = await Branch.findByIdAndUpdate(
      id,
      { college: collegeId, name, code },
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }

    res.json(branch);
  } catch (error) {
    console.error('updateBranch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.findByIdAndDelete(id);
    if (!branch) {
      return res.status(404).json({ error: 'Branch not found' });
    }
    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('deleteBranch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// SUBJECT CRUD
// ==========================================

exports.createSubject = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { branch: branchId, name, semester, price } = req.body;

    const parentBranch = await Branch.findById(branchId);
    if (!parentBranch) {
      return res.status(400).json({ error: 'Parent Branch not found' });
    }

    const subject = new Subject({ branch: branchId, name, semester, price });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('createSubject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { id } = req.params;
    const { branch: branchId, name, semester, price } = req.body;

    if (branchId) {
      const parentBranch = await Branch.findById(branchId);
      if (!parentBranch) {
        return res.status(400).json({ error: 'Parent Branch not found' });
      }
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      { branch: branchId, name, semester, price },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('updateSubject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('deleteSubject error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// CHAPTER CRUD
// ==========================================

exports.createChapter = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { subject: subjectId, title, order } = req.body;

    const parentSubject = await Subject.findById(subjectId);
    if (!parentSubject) {
      return res.status(400).json({ error: 'Parent Subject not found' });
    }

    const chapter = new Chapter({ subject: subjectId, title, order });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    console.error('createChapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { id } = req.params;
    const { subject: subjectId, title, order } = req.body;

    if (subjectId) {
      const parentSubject = await Subject.findById(subjectId);
      if (!parentSubject) {
        return res.status(400).json({ error: 'Parent Subject not found' });
      }
    }

    const chapter = await Chapter.findByIdAndUpdate(
      id,
      { subject: subjectId, title, order },
      { new: true, runValidators: true }
    );

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    console.error('updateChapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('deleteChapter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// VIDEO CRUD
// ==========================================

exports.createVideo = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { chapter: chapterId, title, bunnyVideoId, durationMinutes } = req.body;

    const parentChapter = await Chapter.findById(chapterId);
    if (!parentChapter) {
      return res.status(400).json({ error: 'Parent Chapter not found' });
    }

    const video = new Video({ chapter: chapterId, title, bunnyVideoId, durationMinutes });
    await video.save();
    res.status(201).json(video);
  } catch (error) {
    console.error('createVideo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateVideo = async (req, res) => {
  try {
    if (hasValidationError(req, res)) return;

    const { id } = req.params;
    const { chapter: chapterId, title, bunnyVideoId, durationMinutes } = req.body;

    if (chapterId) {
      const parentChapter = await Chapter.findById(chapterId);
      if (!parentChapter) {
        return res.status(400).json({ error: 'Parent Chapter not found' });
      }
    }

    const video = await Video.findByIdAndUpdate(
      id,
      { chapter: chapterId, title, bunnyVideoId, durationMinutes },
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    console.error('updateVideo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('deleteVideo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==========================================
// ADMIN GET ALL RECORDS
// ==========================================

exports.getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.json(colleges);
  } catch (error) {
    console.error('admin getColleges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate('college', 'name slug')
      .sort({ createdAt: -1 });
    res.json(branches);
  } catch (error) {
    console.error('admin getBranches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate({
        path: 'branch',
        populate: { path: 'college', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(subjects);
  } catch (error) {
    console.error('admin getSubjects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find()
      .populate({
        path: 'subject',
        populate: {
          path: 'branch',
          populate: { path: 'college', select: 'name' }
        }
      })
      .sort({ createdAt: -1 });
    res.json(chapters);
  } catch (error) {
    console.error('admin getChapters error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate({
        path: 'chapter',
        populate: { path: 'subject', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('admin getVideos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

