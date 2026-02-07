const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN; // Render ENV
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.send("✅ ClickWallet Backend Running");
});

// ================= SEND OTP =================
app.post("/send-otp", async (req, res) => {
  try {
    const { telegram_id, otp, purpose, website } = req.body;

    if (!telegram_id || !otp) {
      return res.status(400).json({
        success: false,
        message: "Missing fields"
      });
    }

    const message = `
🎯 *ClickWallet Verification Code*

🔐 *Your OTP:* ${otp}
⏰ *Valid for:* 10 minutes

📱 *Website:* ${website || "Click Wallet"}
🆔 *Purpose:* ${purpose || "Login"}

⚠️ Do not share this code with anyone  
🔒 ClickWallet will never ask for your OTP
`;

    const tgRes = await fetch(TELEGRAM_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      return res.status(500).json({
        success: false,
        error: tgData
      });
    }

    res.json({
      success: true,
      message: "OTP sent to Telegram"
    });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
});

// ================= START =================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
