const express = require('express');
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create subscription
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { plan, price } = req.body;

    if (!plan || !price) {
      return res.status(400).json({ error: 'Plan and price are required' });
    }

    const subscription = new Subscription({
      userId: req.user.id,
      plan,
      price,
      status: 'active',
    });

    await subscription.save();
    res.status(201).json({
      message: 'Subscription created successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription
router.get('/', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subscription
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { plan, status } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { plan, status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({
      message: 'Subscription updated successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.delete('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json({
      message: 'Subscription cancelled successfully',
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
