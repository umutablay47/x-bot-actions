const fetch = require("node-fetch");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error("CLIENT_ID / CLIENT_SECRET / REFRESH_TOKEN eksik!");
  process.exit(1);
}

// Tweet metnini burada üret
function generateTweetText() {
  const now = new Date().toLocaleString("tr-TR");
  const baseText =
    "Evli Çift ve Tek Kadınlar DM 🔥 #gençaktif #olgunbayan #kocasındangizli #tekerkek #sikişelim #cuckoldçiftler #azginturbanlı #türbanlıazgın #evligizliler #evlisohbet #sikişvideo #sik #evlicift #azgın";

  // İstersen tarihsiz kullan: return baseText;
  return `${baseText} | ${now}`;
}

async function refreshAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: REFRESH_TOKEN,
    client_id: CLIENT_ID
  });

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Refresh token hatası:", json);
    throw new Error("Access token alınamadı");
  }

  if (!json.access_token) {
    console.error("Yanıtta access_token yok:", json);
    throw new Error("Yanıtta access_token yok");
  }

  console.log("Yeni access_token alındı (süre:", json.expires_in, "sn)");
  return json.access_token;
}

async function sendTweet(accessToken, text) {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const json = await res.json();
  if (!res.ok) {
    console.error("Tweet gönderme hatası:", json);
    throw new Error("Tweet gönderilemedi");
  }

  console.log("Tweet gönderildi:", JSON.stringify(json, null, 2));
  return json;
}

(async () => {
  try {
    const accessToken = await refreshAccessToken();
    const text = generateTweetText();
    await sendTweet(accessToken, text);
    console.log("İşlem tamam ✅");
  } catch (e) {
    console.error("Çalışma sırasında hata:", e);
    process.exit(1);
  }
})();
