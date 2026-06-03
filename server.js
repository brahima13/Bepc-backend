const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "https://bepcstatnotes.netlify.app",,
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ MongoDB erreur:", err));

app.use("/api/auth",         require("./routes/auth"));
app.use("/api/payment",      require("./routes/payment"));
app.use("/api/subscription", require("./routes/subscription"));

app.get("/", (req, res) => {
  res.json({ message: "✅ Backend BEPC en ligne !" });
});

app.get("/test-keys", (req, res) => {
  res.json({
    master: process.env.PAYDUNYA_MASTER_KEY || "MANQUANTE",
    private: process.env.PAYDUNYA_PRIVATE_KEY ? "OK" : "MANQUANTE",
    token: process.env.PAYDUNYA_TOKEN ? "OK" : "MANQUANTE"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
