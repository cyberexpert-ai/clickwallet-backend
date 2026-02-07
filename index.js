const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

// ===== ENV =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL; // Render URL
const PORT = process.env.PORT || 3000;

// ===== TELEGRAM BOT (WEBHOOK MODE) =====
const bot = new TelegramBot(BOT_TOKEN);
const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;

bot.setWebHook(`${APP_URL}${WEBHOOK_PATH}`);

app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ===== BOT START MESSAGE =====
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name || "User";
  const username = msg.from.username ? `@${msg.from.username}` : "Not set";

  bot.sendMessage(
    msg.chat.id,
`🤖 Click Wallet Alert Bot 🤖

👋 Welcome, ${name}
🆔 Your User ID: ${msg.from.id}

💰 About Click Wallet:
• Secure digital wallet platform
• Real-time transaction alerts
• Instant money transfers
• 24/7 customer support

🔔 This bot will send you important alerts about your wallet activities.
📱 Stay connected for seamless banking experience!`
  );
});

// ===== WEBSITE → BOT : SEND OTP =====
app.post("/api/send-otp", async (req, res) => {
  const { telegramId, otp, purpose, website } = req.body;

  if (!telegramId || !otp) {
    return res.status(400).json({ error: "telegramId & otp required" });
  }

  await bot.sendMessage(
    telegramId,
`🎯 ClickWallet Verification Code

🔐 Your OTP: ${otp}
⏰ Valid for: 10 minutes

📱 Website: ${website || "Click Wallet"}
🆔 Purpose: ${purpose || "Verification"}

⚠️ Do not share this code with anyone
🔒 ClickWallet will never ask for your OTP`
  );

  res.json({ success: true });
});

// ===== WEBSITE → BOT : LOGIN ALERT =====
app.post("/api/login-alert", async (req, res) => {
  const {
    telegramId,
    ip,
    mobile,
    device,
    browser,
    os,
    location,
    time
  } = req.body;

  await bot.sendMessage(
    telegramId,
`🚨 New Login Alert!

🧭 IP Address: ${ip}
📱 Phone Number: ${mobile}
🖥️ Device: ${device}
🌐 Browser: ${browser}
⚙️ OS: ${os}
📍 Location: ${location}
🗓️ Timestamp: ${time}

⚠️ If this wasn't you:
📩 Please contact the admin @ClickWalletSupportBot.
🔐 Stay safe!`
  );

  res.json({ sent: true });
});

// ===== WEBSITE → BOT : WITHDRAW ALERT =====
app.post("/api/withdraw-alert", async (req, res) => {
  const { telegramId, amount, method, balance, time } = req.body;

  await bot.sendMessage(
    telegramId,
`💸 Withdrawal Alert!

💰 Amount: ₹${amount}
🏦 Method: ${method}
🕒 Time: ${time}

📉 Updated Balance: ₹${balance}

⚠️ If this wasn't you, contact support immediately!`
  );

  res.json({ sent: true });
});

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("✅ Click Wallet Backend is running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
