const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { subjectId } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay configuration keys are missing on the server.' });
    }

    // Find the subject to get the price
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Convert price to paise (amount * 100)
    const amountInPaise = Math.round(subject.price * 100);

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Create Razorpay order options (receipt must be <= 40 characters)
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${subjectId.toString().substring(12)}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ error: 'Payment Order creation failed' });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { orderId, paymentId, signature, subjectId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay configuration keys are missing on the server.' });
    }

    // Double-check subject existence
    const subjectExists = await Subject.exists({ _id: subjectId });
    if (!subjectExists) {
      return res.status(404).json({ error: 'Subject to unlock not found' });
    }

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Secure cryptographic signature check
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

    // Signature is valid. Add subject to user's unlockedSubjects list
    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { unlockedSubjects: subjectId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};
