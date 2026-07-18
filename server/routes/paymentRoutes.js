const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth requirement to both payment endpoints
router.use(requireAuth);

// Order creation validator
const orderCreateValidation = [
  body('subjectId')
    .isMongoId()
    .withMessage('A valid subject ID is required')
];

// Verification validator
const paymentVerifyValidation = [
  body('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required'),
  body('paymentId')
    .trim()
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('signature')
    .trim()
    .notEmpty()
    .withMessage('Signature is required'),
  body('subjectId')
    .isMongoId()
    .withMessage('A valid subject ID is required')
];

router.post('/create-order', orderCreateValidation, paymentController.createOrder);
router.post('/verify', paymentVerifyValidation, paymentController.verifyPayment);

module.exports = router;
