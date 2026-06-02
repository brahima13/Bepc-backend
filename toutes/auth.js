const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Créer un compte
router.post("/register", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const exists = await User.findOne({ phone });
    if (exists) return res.status(400).json({ error: "Numéro déjà utilisé" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: "Numéro introuvable" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Mot de passe incorrect" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
