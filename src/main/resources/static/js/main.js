'use strict';

// --- DOM элементы ---
const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout'); // ✅ исправлено loqout → logout

// --- Переменные состояния ---
let stompClient = null;
let username = null;
let fullname = null;
let selectedUserId = null;
let hasLoggedOut = false;

// --- Получение текущего пользователя ---
async function fetchCurrentUser() {
    const response = await fetch('/current-user');
    const user = await response.json();
    username = user.username;
    fullname = user.fullname;
}

// --- Инициализация ---
window.addEventListener('DOMContentLoaded', async () => {
    await fetchCurrentUser();
    if (document.querySelector('#chat-page')) {
        connect();
    }
});

// --- Подключение к WebSocket ---
function connect() {
    if (username && fullname) {
        const socket = new SockJS('/websocket');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
}

// --- Действия после подключения ---
function onConnected() {
    // Личные сообщения
    stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);

    // Публичный канал (исправлено название функции)
    stompClient.subscribe('/user/public', onMessageReceived);

    // Подписка на обновления списка пользователей (если сервер шлёт на /topic/users)
    stompClient.subscribe('/topic/users', async () => {
        await findAndDisplayConnectedUsers();
    });

    // Отправляем серверу "я онлайн"
    stompClient.send(
        "/app/chat.addUser",
        {},
        JSON.stringify({ username: username, fullname: fullname, status: "ONLINE" })
    );

    document.querySelector('#connected-user-fullname').textContent = fullname;
    chatPage.classList.remove('hidden');

    findAndDisplayConnectedUsers().then();
}

// --- Получение и отображение списка пользователей ---
async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch("/users");
    let connectedUsers = await connectedUsersResponse.json();

    connectedUsers = connectedUsers.filter(user => user.username !== username);

    const connectedUserList = document.getElementById('connectedUsers');
    connectedUserList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUserList);

        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUserList.appendChild(separator);
        }
    });
}

// --- Добавление пользователя в список ---
function appendUserElement(user, connectedUserList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.username;

    const userImage = document.createElement('img');
    userImage.src = "../img/user_icon.png";
    userImage.alt = user.fullname;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    const receivedMsg = document.createElement('span');
    receivedMsg.textContent = '0';
    receivedMsg.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsg);

    listItem.addEventListener('click', userItemClick);

    connectedUserList.appendChild(listItem);
}

// --- Клик по пользователю ---
function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });

    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');
    selectedUserId = clickedUser.getAttribute('id');

    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}

// --- Отображение сообщения ---
function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    if (senderId === username) {
        messageContainer.classList.add('sendee');
    } else {
        messageContainer.classList.add('received');
    }

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

// --- История чата ---
async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${username}/${selectedUserId}`); // ✅ исправлено на шаблонные строки
    const userChat = await userChatResponse.json();

    chatArea.innerHTML = '';

    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content);
    });

    chatArea.scrollTop = chatArea.scrollHeight;
}

// --- Ошибка подключения ---
function onError() {
    connectingElement.textContent = 'Не удалось подключиться к WebSocket';
    connectingElement.style.color = 'red';
}

// --- Отправка сообщения ---
function sendMessage(event) {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: username,
            recipientId: selectedUserId,
            content: messageContent,
            timestamp: new Date()
        };

        stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
        displayMessage(username, messageContent);
        messageInput.value = "";
    }

    chatArea.scrollTop = chatArea.scrollHeight; // ✅ исправлено charArea → chatArea
    event.preventDefault();
}

// --- Получение сообщений ---
async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();

    console.log("Message received", payload);
    const message = JSON.parse(payload.body);

    if (selectedUserId && selectedUserId == message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notificationElement = document.querySelector(`#${message.senderId}`);
    if (notificationElement && !notificationElement.classList.contains('active')) {
        const nbrMsgElement = notificationElement.querySelector('.nbr-msg');
        nbrMsgElement.classList.remove('hidden');
        nbrMsgElement.textContent = "";
    }
}

// --- Логаут ---
function onLogout() {
    if (hasLoggedOut) return;
    hasLoggedOut = true;

    if (stompClient && stompClient.connected) {
        stompClient.send(
            '/app/user.desconnectUser',
            {},
            JSON.stringify({ username: username, fullname: fullname, status: "OFFLINE" })
        );
    }
    window.location.reload();
}

// --- События ---
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.addEventListener('beforeunload', (event) => {
    const isReload = window.performance.getEntriesByType("navigation")[0].type === "reload";
    if (!isReload) {
        onLogout();
    }
});
