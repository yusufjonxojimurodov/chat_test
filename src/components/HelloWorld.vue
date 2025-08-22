<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

window.onTelegramAuth = function (user) {
  console.log("Telegram foydalanuvchisi:", user);

  fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      telegramId: user.id,
      username: user.username,
      first_name: user.first_name,
      photo_url: user.photo_url,
      auth_date: user.auth_date,
      hash: user.hash,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Backend javobi:", data);
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        router.push("/chat/message");
      }
    })
    .catch((err) => console.error("Xato:", err));
};

onMounted(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    console.log("Avtomatik login token bilan:", token);
    fetch("/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Token orqali login qilingan user:", data);

        router.push("/chat");
      })
      .catch(() => {
        localStorage.removeItem("authToken");
      });
  } else {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", "yusuf_test_telegram_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    document.getElementById("telegram-login-container").appendChild(script);
  }
});
</script>

<template>
  <div id="telegram-login-container"></div>
</template>
