// index.js
require("dotenv").config();
const fetch = require("node-fetch"); // v2

// GitHub Secrets'ten gelecek değişkenler
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN eksik!");
  process.exit(1);
}

// ---------------- RANDOM TWEET TEXT ----------------
const EMOJIS = [
  "🚀",
  "✨",
  "🔥",
  "⭐",
  "💡",
  "🤖",
  "📌",
  "💫",
  "🎯",
  "⏳",
  "😊",
  "🌙",
  "☀️",
  "⚡",
];

const PI = "31415926535897932384626433832795028841971693993751058";

function randomPi() {
  const len = Math.floor(Math.random() * 4) + 3; // 3–6 hane
  const start = Math.floor(Math.random() * (PI.length - len));
  return PI.substring(start, start + len);
}

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function generateTweetText() {
  const baseText =
    "Evli Çift ve Tek Kadınlar DM 🔥 #gençaktif #olgunbayan #kocasındangizli #tekerkek #sikişelim #cuckoldçiftler #azginturbanlı #türbanlıazgın #evligizliler #evlisohbet #sikişvideo #sik #evlicift #azgın";

  const emoji = randomEmoji();
  const pi = randomPi();
  const date = new Date().toLocaleString("tr-TR");

  return `${baseText} ${emoji} ${date} π:${pi}`;
}

// ---------------- TOKEN YENİLEME ----------------
async function refreshAccessToken() {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: REFRESH_TOKEN,
    client_id: CLIENT_ID,
  });

  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Access token yenileme hatası:", json);
    throw new Error("Token refresh failed");
  }

  return json.access_token;
}

// ---------------- TWEET GÖNDERME ----------------
async function sendTweet(accessToken, text) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Tweet gönderme hatası:", json);
    throw new Error("Tweet failed");
  }

  console.log("Tweet gönderildi:", json);
}

// ---------------- ANA ÇALIŞMA BLOĞU ----------------
(async () => {
  try {
    console.log("⏳ Access token yenileniyor...");
    const accessToken = await refreshAccessToken();

    const text = generateTweetText();
    console.log("📤 Gönderilecek tweet metni:", text);

    await sendTweet(accessToken, text);
    console.log("✔ İşlem tamam, script sonlanıyor.");
  } catch (err) {
    console.error("❌ Çalışma hatası:", err.message || err);
    process.exit(1);
  }
})();
