/* ===================== LOADER ===================== */
function delayedRedirect(event) {
  event.preventDefault();
  const url = event.target.href;
  document.getElementById("loader").style.display = "flex";
  setTimeout(() => (window.location.href = url), 1500);
}

/* ===================== HAMBURGER MENU ===================== */
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
const icon = hamburger.querySelector("i");

// Toggle menu saat hamburger diklik
hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("show");

  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});

// Tutup menu saat klik di luar area menu
document.addEventListener("click", (e) => {
  const isClickInside = menu.contains(e.target) || hamburger.contains(e.target);
  if (!isClickInside && menu.classList.contains("show")) {
    menu.classList.remove("show");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Tutup menu saat link diklik
document.querySelectorAll("#menu a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("show");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  });
});

/* ===================== CHATBOT TOGGLE ===================== */
const toggleBtn = document.getElementById("chatbot-toggle");
const chatbotBox = document.getElementById("chatbot-box");
const chatMessages = document.getElementById("chatbot-messages");

toggleBtn.onclick = () => {
  chatbotBox.style.display =
    chatbotBox.style.display === "flex" ? "none" : "flex";
};

/* ===================== CHATBOT MESSAGE ===================== */
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const userText = input.value.trim();
  if (!userText) return;

  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  chatMessages.innerHTML += `
    <div class="bubble user">
      <span><b>You:</b> ${userText}</span><br>
      <small class="timestamp">${time}</small>
    </div>
  `;
  input.value = "";

  const typingDiv = document.createElement("div");
  typingDiv.className = "bubble bot typing";
  typingDiv.innerHTML = `<span><i>Awan AI sedang mengetik...</i></span>`;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });

    const data = await res.json();
    typingDiv.remove();

    const replyTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    chatMessages.innerHTML += `
      <div class="bubble bot">
        <span><b>Awan AI:</b> ${data.response}</span><br>
        <small class="timestamp">${replyTime}</small>
      </div>
    `;
  } catch (error) {
    typingDiv.remove();
    chatMessages.innerHTML += `
      <div class="bubble bot">
        <span><b>Awan AI:</b> Maaf, terjadi kesalahan saat menghubungi server.</span><br>
        <small class="timestamp">${time}</small>
      </div>
    `;
    console.error("Chat error:", error);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Kirim saat tekan Enter
document.getElementById("chat-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* ===================== CHAT RESET ===================== */
function resetChat() {
  fetch("/reset-history", { method: "POST" });
  chatMessages.innerHTML = `
    <div class="bubble bot">
      <span><i>Riwayat chat telah dihapus.</i></span>
    </div>
  `;
}

/* ===================== HIDE TOGGLE SAAT SCROLL ===================== */
let scrollTimeout;
window.addEventListener("scroll", () => {
  toggleBtn.classList.add("hidden");
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    toggleBtn.classList.remove("hidden");
  }, 1000);
});

/* ===================== FORM OTP & EMAIL ===================== */
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
