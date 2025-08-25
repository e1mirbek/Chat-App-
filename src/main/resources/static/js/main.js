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


/**
 * Создаёт и добавляет элемент пользователя в список подключённых.
 *
 * @param {Object} user — объект пользователя (например, { username: "john", fullname: "John Doe" }).
 * @param {HTMLElement} connectedUserList — DOM-элемент <ul> или <ol>, в который будет добавлен пользователь.
 *
 * Алгоритм:
 * 1. Создаём <li> и задаём ему класс "user-item" и id = username.
 * 2. Добавляем картинку-аватар (src = "../img/user_icon.png").
 * 3. Добавляем span с полным именем пользователя.
 * 4. Добавляем span для отображения количества непрочитанных сообщений (изначально = 0 и скрыт).
 * 5. Вешаем обработчик клика (userItemClick), чтобы при нажатии на пользователя открыть чат.
 * 6. Вставляем весь элемент в список пользователей.
 */
function appendUserElement(user, connectedUserList) {
    const listItem = document.createElement('li'); // создаём новый <li>
    listItem.classList.add('user-item');           // задаём класс для стилей
    listItem.id = user.username;                   // используем username как уникальный id элемента

    const userImage = document.createElement('img'); // создаём аватар
    userImage.src = "../img/user_icon.png";          // путь к картинке
    userImage.alt = user.fullname;                   // alt-текст = полное имя

    const usernameSpan = document.createElement('span'); // создаём подпись
    usernameSpan.textContent = user.fullname;            // отображаем полное имя пользователя

    const receivedMsg = document.createElement('span'); // создаём счётчик сообщений
    receivedMsg.textContent = '0';                      // начальное значение = 0
    receivedMsg.classList.add('nbr-msg', 'hidden');     // CSS-классы: "nbr-msg" + скрыт

    // прикрепляем к <li> все элементы по порядку
    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsg);

    // при клике по пользователю — открыть чат
    listItem.addEventListener('click', userItemClick);

    // добавляем итоговый <li> в список
    connectedUserList.appendChild(listItem);
}

function onError() {



}






