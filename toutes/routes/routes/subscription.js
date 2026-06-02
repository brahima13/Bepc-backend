const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");

// Vérifier abonnement actif
router.get("/check", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      userId: req.user.id,
      status: "paid",
      expiresAt: { $gt: new Date() }
    }).sort({ expiresAt: -1 });

    if (sub) {
      res.json({
        active: true,
        expiresAt: sub.expiresAt,
        daysLeft: Math.ceil(
          (new Date(sub.expiresAt) - new Date()) / 86400000
        )
      });
    } else {
      res.json({ active: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
