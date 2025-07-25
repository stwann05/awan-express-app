const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
require("dotenv").config(); // aman digunakan untuk local

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ========== OTP & EMAIL ==========
let otpStore = {};
let chatHistory = [];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

app.post("/request-otp", (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) return res.send("Format email tidak valid.");

  const otp = generateOTP();
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Kode OTP Anda",
    text: `Kode verifikasi Anda adalah: ${otp} (berlaku 5 menit).`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.send("Gagal mengirim OTP.");
    } else {
      console.log("OTP terkirim ke", email);
      res.send("OTP telah dikirim ke email Anda.");
      setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    }
  });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    res.send("OTP valid");
  } else {
    res.send("OTP tidak cocok atau kadaluarsa.");
  }
});

app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.send("Semua field wajib diisi.");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `Pesan dari ${name}`,
    text: `Dari: ${name} <${email}>\n\nPesan:\n${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.send("Gagal mengirim email.");
    } else {
      console.log("Email terkirim:", info.response);
      res.send("Pesan berhasil dikirim!");
    }
  });
});

// ========== CHATBOT via OPENROUTER ==========
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong." });
  }

  chatHistory.push({ role: "user", content: message });

  const systemPrompt = {
    role: "system",
    content:
      "Kamu adalah asisten AI yang selalu menjawab dalam Bahasa Indonesia. Jawabanmu harus jelas, lengkap, dan nyambung dengan konteks pembicaraan sebelumnya.",
  };

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY tidak tersedia.");
    return res.status(500).json({ error: "Server tidak memiliki API Key." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [systemPrompt, ...chatHistory],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Chatbot Kontekstual Ivan",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: botReply });
    res.json({ response: botReply });
  } catch (error) {
    console.error(
      "❌ OpenRouter error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        "Gagal mendapatkan respon dari AI.",
    });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
