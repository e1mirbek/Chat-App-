'use strict';


const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const loqout = document.querySelector('#logout');



let stompClient = null; // клиент для WebSocket соединения (STOMP протокол).
let username = null; // имя текущего пользователя.
let fullname = null; // полное имя текущего пользователя.
let selectedUserId = null; // с кем сейчас ведётся чат


async function fetchCurrentUser()  {
    const responce = await fetch('/current-user'); // запрос на получение текущего пользователя (Отправляется HTTP-запрос на сервер)
    const user = await responce.json(); // получение данных в формате JSON

/**
 * Обработка ответа от сервера в формате JSON.
 *
 * Ждём, пока сервер пришлёт ответ, и преобразуем его из JSON в объект.
 *
 * Пример ответа от сервера:
 * {
 *   "username": "elmirbek",            // имя пользователя
 *   "fullname": "Элмирбек Абдыманапов" // полное имя пользователя
 * }
 *
 * Это позволяет работать с данными как с объектом в коде, а не как с сырым JSON.
 */

    username = user.username;
    fullname = user.fullname;
}


window.addEventListener('DOMContentLoaded', async () =>  {
    await fetchCurrentUser();
    if (document.querySelector('#chat-page')) {
        connect();
    }
}); 




function connect () {
    if (username && fullname) {
        const socket = new SockJS('/websocket'); // создаём SockJS соединение с сервером по указанному URL.
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError); 
    }
}


function onConnected() {
    stompClient.subscribe('/user/${username}/queue/messages', onMessagereReceived);
    stompClient.subscribe('/user/public', onMessagereReceived);

    stompClient.send("/app/chat.addUser", {}, JSON.stringify({username: username, fullname: fullname, status: "ONLINE"}));
    document.querySelector('#connected-user-fullname').textContent = fullname;
    chatPage.classList.remove('hidden');
    findAndDisplayConnectedUsers().then();

}


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

function onError() {



}






