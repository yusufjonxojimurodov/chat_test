<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import SockJS from "sockjs-client";
import * as StompJs from "@stomp/stompjs";

const users = ref([]);
const assignUsers = ref([])
const activeChat = ref(null);
const chatInfoMap = ref(new Map());
const newMessage = ref("");
let stompClient = null;
const token = localStorage.getItem("accessToken");

function openChat(chat) {
    activeChat.value = chat;

    if (chatInfoMap.value.has(chat.id)) {
        console.log("Bu chat uchun post oldin qilingan.");
        return;
    }

    axios.post(
        "https://chat-h80l.onrender.com/api/v1/chats/private-chat",
        null,
        {
            params: { userId: chat.id },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
        .then((response) => {
            chatInfoMap.value.set(chat.id, response.data);
            alert("Chat ulandi va UserId yuborildi");
        })
        .catch((err) => {
            console.error("Chat id yuborilmadi error:", err);
        });
}

function sendMessage() {
    if (!activeChat.value || newMessage.value.trim() === "") return;

    activeChat.value.messages.push({ from: "me", text: newMessage.value });

    const token = localStorage.getItem("accessToken");

    stompClient.publish({
        destination: "/api/chat.sendMessage",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            chatId: chatInfo.value.id,
            content: newMessage.value,
        }),
    });

    newMessage.value = "";
}

function connectWebSocket() {
    stompClient = new StompJs.Client({
        webSocketFactory: () => new SockJS("https://chat-h80l.onrender.com/chat"),
        connectHeaders: {
            Authorization: `Bearer ${token}`
        },
        debug: (str) => console.log(str),
        reconnectDelay: 2000,
    });

    stompClient.onConnect = () => {
        console.log("WebSocket connected!");
        stompClient.subscribe("/user/queue/messages", (msg) => {
            const message = JSON.parse(msg.body);
            console.log(message);
            const chat = users.value.find((c) => c.id === message.chatId);
            console.log(chat)
            if (chat) chat.messages.push({ from: "him", text: message.content });
        });
    };

    stompClient.onStompError = (frame) => {
        console.error("STOMP error: ", frame.headers["message"]);
    };

    stompClient.activate();
}

async function fetchUsers() {
    try {
        const { data } = await axios.get("https://chat-h80l.onrender.com/api/v1/users/get-all-users-by-username-search");
        users.value = data.content.map((u) => ({ ...u, messages: [] }));
        if (users.value.length > 0) activeChat.value = users.value[0];
    } catch (err) {
        console.error(err);
    }
}

onMounted(() => {
    getAssignUsers()
    connectWebSocket();
});
</script>


<template>
    <div class="container">
        <div class="chat-list">
            <div class="chat-list-header">Chatlar</div>
            <ul>
                <li v-for="chat in users" :key="chat.id"
                    :class="['chat-item', activeChat?.id === chat.id ? 'active' : '']" @click="openChat(chat)">
                    <div class="chat-name">{{ chat.firstName }}</div>
                    <div class="chat-last">{{ chat.userName }}</div>
                </li>
            </ul>
        </div>

        <div class="chat-window" v-if="activeChat">
            <div class="chat-header">{{ activeChat.firstName }}</div>
            <div class="chat-messages">
                <div v-for="(msg, index) in activeChat.messages" :key="index"
                    :class="['message', msg.from === 'me' ? 'me' : 'him']">
                    {{ msg.text }}
                </div>
            </div>
            <div class="chat-input">
                <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Xabar yozing..." />
                <button @click="sendMessage">Yuborish</button>
            </div>
        </div>
    </div>
</template>

<style>
.container {
    display: flex;
    height: 100vh;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
    font-family: Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-list {
    width: 30%;
    border-right: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    background: #f7f7f7;
}

.chat-list-header {
    padding: 16px;
    font-weight: bold;
    font-size: 18px;
    border-bottom: 1px solid #ddd;
    background: #eee;
}

.chat-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    flex: 1;
}

.chat-item {
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    cursor: pointer;
    transition: background 0.2s;
}

.chat-item:hover {
    background: #e0e0e0;
}

.chat-item.active {
    background: #ccc;
}

.chat-name {
    font-weight: bold;
    color: #333;
}

.chat-last {
    font-size: 14px;
    color: #666;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-window {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
}

.chat-header {
    padding: 16px;
    font-weight: bold;
    font-size: 18px;
    border-bottom: 1px solid #ddd;
    background: #f2f2f2;
    color: #333;
}

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #fff;
}

.message {
    max-width: 60%;
    padding: 10px 16px;
    border-radius: 20px;
    word-wrap: break-word;
}

.message.me {
    align-self: flex-end;
    background: #3b82f6;
    color: white;
}

.message.him {
    align-self: flex-start;
    background: #e5e5e5;
    color: #333;
}

.chat-input {
    display: flex;
    padding: 16px;
    border-top: 1px solid #ddd;
    background: #f2f2f2;
}

.chat-input input {
    flex: 1;
    padding: 10px 16px;
    border-radius: 25px;
    border: 1px solid #ccc;
    outline: none;
    margin-right: 8px;
    font-size: 14px;
    transition: 450ms ease;
}

.chat-input input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.chat-input button {
    padding: 10px 20px;
    border-radius: 25px;
    background: #3b82f6;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
}

.chat-input button:hover {
    background: #2563eb;
}
</style>