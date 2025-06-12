// loader
function delayedRedirect(event) {
  event.preventDefault(); // Mencegah langsung pindah halaman
  const url = event.target.href;

  // Tampilkan loader
  document.getElementById("loader").style.display = "flex";

  // Tunggu 1.5 detik lalu redirect
  setTimeout(() => {
    window.location.href = url;
  }, 1500);
}

// chat bot
const toggleBtn = document.getElementById("chatbot-toggle");
const chatbotBox = document.getElementById("chatbot-box");
const chatMessages = document.getElementById("chatbot-messages");

let scrollTimeout;

// Tampilkan/Sembunyikan chatbot box
toggleBtn.onclick = () => {
  chatbotBox.style.display =
    chatbotBox.style.display === "flex" ? "none" : "flex";
};

function sendMessage() {
  const input = document.getElementById("chat-input");
  const userText = input.value.trim();
  if (!userText) return;

  chatMessages.innerHTML += `<div><b>You:</b> ${userText}</div>`;
  let botResponse = "Maaf, saya tidak mengerti.";

  if (
    userText.toLowerCase().includes("halo") ||
    userText.toLowerCase().includes("hai")
  ) {
    botResponse = "Kamu bisa mendapatkan bantuan dengan mengunjungi help.html.";
  } else if (userText.toLowerCase().includes("produk")) {
    botResponse =
      "Kami menawarkan berbagai produk menarik! Lihat di produk.html.";
  } else if (userText.toLowerCase().includes("harga")) {
    botResponse = "Informasi harga tersedia lengkap di harga.html.";
  } else if (userText.toLowerCase().includes("fitur")) {
    botResponse = "Lihat semua fitur kami di fitur.html.";
  } else if (userText.toLowerCase().includes("cara daftar")) {
    botResponse = "Panduan pendaftaran tersedia di daftar.html.";
  } else if (userText.toLowerCase().includes("akun")) {
    botResponse = "Kelola akun kamu di akun.html.";
  } else if (userText.toLowerCase().includes("login")) {
    botResponse = "Silakan masuk melalui login.html.";
  } else if (userText.toLowerCase().includes("keluar")) {
    botResponse = "Kamu telah keluar. Sampai jumpa lagi!";
  } else if (userText.toLowerCase().includes("lokasi")) {
    botResponse =
      "Kami berlokasi di Jl. Contoh No. 123. Cek maps.html untuk lebih jelasnya.";
  } else if (userText.toLowerCase().includes("testimoni")) {
    botResponse = "Baca pengalaman pengguna kami di testimoni.html.";
  } else if (userText.toLowerCase().includes("event")) {
    botResponse = "Lihat acara dan promo terbaru di event.html.";
  } else if (userText.toLowerCase().includes("faq")) {
    botResponse =
      "Pertanyaan yang sering diajukan bisa kamu lihat di faq.html.";
  } else if (userText.toLowerCase().includes("tim")) {
    botResponse = "Kenali tim kami lebih dekat di tim.html.";
  } else if (userText.toLowerCase().includes("karir")) {
    botResponse = "Ingin bergabung dengan kami? Lihat lowongan di karir.html.";
  } else if (userText.toLowerCase().includes("blog")) {
    botResponse = "Baca artikel menarik kami di blog.html.";
  }

  setTimeout(() => {
    chatMessages.innerHTML += `<div><b>Admin:</b> ${botResponse}</div>`;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 500);

  input.value = "";
}

// SEMBUNYIKAN toggle saat scroll, lalu tampilkan kembali dengan transisi
window.addEventListener("scroll", () => {
  toggleBtn.classList.add("hidden"); // Tambahkan class yang memicu opacity 0

  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    toggleBtn.classList.remove("hidden"); // Hapus class agar muncul lagi
  }, 1000); // Tampil kembali setelah 1 detik berhenti scroll
});

// Form OTP
function showAlert(msg, error = false) {
  const box = document.getElementById("custom-alert");
  box.textContent = msg;
  box.className = error ? "error show" : "show";
  setTimeout(() => (box.className = "hidden"), 3000);
}

async function requestOTP() {
  const email = document.getElementById("email").value;
  const res = await fetch("/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const msg = await res.text();
  showAlert(msg, !msg.includes("telah dikirim"));
  if (msg.includes("telah dikirim")) {
    document.getElementById("verify-form").classList.remove("hidden");
  }
}

async function verifyOTP() {
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const res = await fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const msg = await res.text();
  showAlert(msg, !msg.includes("valid"));
  if (msg.includes("valid")) {
    document.getElementById("contact-form").classList.remove("hidden");
  }
}

document
  .getElementById("contact-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    const res = await fetch("/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name, email, message }),
    });

    const msg = await res.text();
    showAlert(msg, !msg.includes("berhasil"));
  });
