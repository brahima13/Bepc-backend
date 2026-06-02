const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");

// Initier paiement PayDunya
router.post("/initiate", auth, async (req, res) => {
  const { wavePhone } = req.body;
  const userId = req.user.id;

  try {
    const response = await axios.post(
      "https://app.paydunya.com/api/v1/checkout-invoice/create",
      {
        invoice: {
          total_amount: 100,
          description: "Abonnement BEPC Stats - 6 mois"
        },
        store: {
          name: "BEPC Stats Notes",
          phone: "0584382984"
        },
        actions: {
          cancel_url: process.env.FRONTEND_URL,
          return_url: process.env.FRONTEND_URL + "/success",
          callback_url: process.env.BACKEND_URL + "/api/payment/webhook"
        },
        customer: {
          phone: wavePhone
        }
      },
      {
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    await Subscription.create({
      userId,
      wavePhone,
      transactionId: response.data.token,
      status: "pending"
    });

    res.json({
      success: true,
      paymentUrl: response.data.response_text,
      token: response.data.token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook PayDunya
router.post("/webhook", async (req, res) => {
  const { data } = req.body;
  try {
    const sub = await Subscription.findOne({
      transactionId: data?.invoice?.token
    });
    if (!sub) return res.status(404).json({ error: "Introuvable" });

    if (data?.invoice?.status === "completed") {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 6);
      sub.status = "paid";
      sub.expiresAt = expiry;
      await sub.save();
    }
    res.json({ message: "OK" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vérifier statut
router.get("/status/:token", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      transactionId: req.params.token
    });
    if (!sub) return res.status(404).json({ error: "Introuvable" });
    res.json({ status: sub.status, expiresAt: sub.expiresAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
