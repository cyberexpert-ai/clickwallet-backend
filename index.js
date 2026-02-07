const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

// ===== ENV =====
const TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL; // Render URL
const PORT = process.env.PORT || 3000;

// ===== TELEGRAM BOT (WEBHOOK MODE) =====
const bot = new TelegramBot(TOKEN);
const WEBHOOK_PATH = `/bot${TOKEN}`;

bot.setWebHook(`${APP_URL}${WEBHOOK_PATH}`);

app.post(WEBHOOK_PATH, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ===== BASIC START MESSAGE =====
bot.onText(/\/start/, (msg) => {
  const name = msg.from.first_name;
  bot.sendMessage(
    msg.chat.id,
`🤖 Click Wallet Alert Bot 🤖

👋 Welcome, ${name}
🆔 Your User ID: ${msg.from.id}

🔔 This bot sends OTP & security alerts only.`
  );
});

// ===== WEBSITE ROUTES =====
app.post("/api/send-otp", require("./routes/auth")(bot));
app.post("/api/login-alert", require("./routes/webhook")(bot));

// ===== HEALTH CHECK =====
app.get("/", (req, res) => res.send("ClickWallet Backend Running"));

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
