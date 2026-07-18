const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin protection to all routes in this router
router.use(requireAuth);
router.use(requireAdmin);

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const collegeCreateValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('slug').trim().notEmpty().withMessage('Slug is required')
];

const collegeUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('slug').optional().trim().notEmpty().withMessage('Slug cannot be empty')
];

const branchCreateValidation = [
  body('college').isMongoId().withMessage('Valid college ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('code').trim().notEmpty().withMessage('Code is required')
];

const branchUpdateValidation = [
  body('college').optional().isMongoId().withMessage('Valid college ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Code cannot be empty')
];

const subjectCreateValidation = [
  body('branch').isMongoId().withMessage('Valid branch ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('semester').isInt({ min: 1 }).withMessage('Semester must be a positive integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number')
];

const subjectUpdateValidation = [
  body('branch').optional().isMongoId().withMessage('Valid branch ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('semester').optional().isInt({ min: 1 }).withMessage('Semester must be a positive integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number')
];

const chapterCreateValidation = [
  body('subject').isMongoId().withMessage('Valid subject ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('order').isInt().withMessage('Order must be an integer')
];

const chapterUpdateValidation = [
  body('subject').optional().isMongoId().withMessage('Valid subject ID is required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('order').optional().isInt().withMessage('Order must be an integer')
];

const videoCreateValidation = [
  body('chapter').isMongoId().withMessage('Valid chapter ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('bunnyVideoId').trim().notEmpty().withMessage('Bunny video ID is required'),
  body('durationMinutes').optional().isFloat({ min: 0 }).withMessage('Duration must be a positive number')
];

const videoUpdateValidation = [
  body('chapter').optional().isMongoId().withMessage('Valid chapter ID is required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('bunnyVideoId').optional().trim().notEmpty().withMessage('Bunny video ID cannot be empty'),
  body('durationMinutes').optional().isFloat({ min: 0 }).withMessage('Duration must be a positive number')
];

// ==========================================
// ROUTES
// ==========================================

// Colleges
router.post('/colleges', collegeCreateValidation, adminController.createCollege);
router.put('/colleges/:id', collegeUpdateValidation, adminController.updateCollege);
router.delete('/colleges/:id', adminController.deleteCollege);

// Branches
router.post('/branches', branchCreateValidation, adminController.createBranch);
router.put('/branches/:id', branchUpdateValidation, adminController.updateBranch);
router.delete('/branches/:id', adminController.deleteBranch);

// Subjects
router.post('/subjects', subjectCreateValidation, adminController.createSubject);
router.put('/subjects/:id', subjectUpdateValidation, adminController.updateSubject);
router.delete('/subjects/:id', adminController.deleteSubject);

// Chapters
router.post('/chapters', chapterCreateValidation, adminController.createChapter);
router.put('/chapters/:id', chapterUpdateValidation, adminController.updateChapter);
router.delete('/chapters/:id', adminController.deleteChapter);

// Videos
router.post('/videos', videoCreateValidation, adminController.createVideo);
router.put('/videos/:id', videoUpdateValidation, adminController.updateVideo);
router.delete('/videos/:id', adminController.deleteVideo);

module.exports = router;
