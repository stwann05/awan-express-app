const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contact.html"));
});

// Simpan OTP sementara di memori
let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Kirim OTP
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
      // Hapus OTP setelah 5 menit
      setTimeout(() => delete otpStore[email], 5 * 60 * 1000);
    }
  });
});

// Verifikasi OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email]; // OTP valid, hapus
    res.send("OTP valid");
  } else {
    res.send("OTP tidak cocok atau kadaluarsa.");
  }
});

// Kirim pesan jika OTP lolos
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
