const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/payment",      require("./routes/payment"));
app.use("/api/subscription", require("./routes/subscription"));

// Test
app.get("/", (req, res) => {
  res.json({ message: "✅ Backend BEPC en ligne !" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
