const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const Subscription = require("../models/Subscription");

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
          phone: "0584382984",
          postal_address: "Abidjan, Côte d'Ivoire",
          website_url: "https://fastidious-rolypoly-50d4bf.netlify.app"
        },
        actions: {
          cancel_url: "https://fastidious-rolypoly-50d4bf.netlify.app",
          return_url: "https://fastidious-rolypoly-50d4bf.netlify.app/success",
          callback_url: "https://bepc-backend.onrender.com/api/payment/webhook"
        },
        custom_data: {
          userId: userId.toString(),
          wavePhone: wavePhone
        }
      },
      {
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
          "PAYDUNYA-PUBLIC-KEY": process.env.PAYDUNYA_PUBLIC_KEY,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.data.response_code === "00") {
      await Subscription.create({
        userId,
        wavePhone,
        transactionId: response.data.token,
        status: "pending"
      });

      res.json({
        success: true,
        paymentUrl: response.data.invoice_url,
        token: response.data.token
      });
    } else {
      res.status(400).json({ error: response.data.response_text });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const { data } = req.body;
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
