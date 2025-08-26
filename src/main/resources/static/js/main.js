'use strict';

const { use } = require("react");


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

// Когда HTML-документ полностью загружен (DOMContentLoaded),
// сразу получаем данные текущего пользователя и пытаемся подключиться к чату.
window.addEventListener('DOMContentLoaded', async () =>  {
    await fetchCurrentUser(); // запрос на сервер: кто текущий пользователь
    if (document.querySelector('#chat-page')) { // проверка, существует ли элемент чата на странице
        connect(); // устанавливаем WebSocket-соединение
    }
}); 


/**
 * Функция для подключения к WebSocket (через SockJS + STOMP).
 * 
 * 1. Проверяет, что у пользователя есть username и fullname (данные уже загружены).
 * 2. Создаёт SockJS-соединение по URL `/websocket`.
 * 3. Оборачивает соединение в STOMP (протокол обмена сообщениями).
 * 4. Выполняет connect() → при успешном подключении вызывает onConnected(),
 *    при ошибке подключения вызывает onError().
 */
function connect () {
    if (username && fullname) {
        const socket = new SockJS('/websocket'); // создаём WebSocket соединение
        stompClient = Stomp.over(socket); // оборачиваем его в STOMP

        stompClient.connect({}, onConnected, onError); 
    }
}


/**
 * Действия после успешного подключения к серверу через STOMP.
 *
 * 1. Подписываемся на персональную очередь сообщений текущего пользователя.
 *    ❗ Сейчас у тебя ошибка: строка '/user/${username}/queue/messages' — это строка,
 *       а не шаблон. Нужно использовать обратные кавычки (`) для подстановки username:
 *       stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
 *
 * 2. Подписываемся на публичный канал "/user/public".
 * 3. Отправляем серверу сообщение "пользователь добавлен" (addUser),
 *    чтобы сервер знал, что этот пользователь онлайн.
 * 4. Отображаем полное имя текущего пользователя в интерфейсе.
 * 5. Показываем чат (убираем класс hidden).
 * 6. Загружаем список подключённых пользователей и отрисовываем его.
 */
function onConnected() {
    stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived); 
    stompClient.subscribe('/user/public', onMessagereReceived);

    stompClient.send(
        "/app/chat.addUser",
        {},
        JSON.stringify({ username: username, fullname: fullname, status: "ONLINE" })
    );

    document.querySelector('#connected-user-fullname').textContent = fullname;
    chatPage.classList.remove('hidden'); // показываем чат
    findAndDisplayConnectedUsers().then(); // обновляем список пользователей
}

/**
 * Получает список всех подключённых пользователей с сервера и отображает их в интерфейсе.
 *
 * Алгоритм:
 * 1. Отправляем HTTP-запрос на эндпоинт "/users".
 * 2. Получаем ответ и преобразуем его в JSON (список пользователей).
 * 3. Убираем из списка текущего пользователя (чтобы он сам себя не видел в списке).
 * 4. Очищаем список подключённых пользователей в DOM (connectedUsers).
 * 5. Для каждого пользователя:
 *    - добавляем его в список через appendUserElement().
 *    - если это не последний пользователь в списке, вставляем <li> с классом "separator"
 *      (для визуального разделения между пользователями).
 */
async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch("/users"); // запрос на сервер, получаем всех пользователей
    let connectedUsers = await connectedUsersResponse.json(); // преобразуем ответ в массив объектов пользователей

    // исключаем текущего пользователя, чтобы он сам себя не видел в списке
    connectedUsers = connectedUsers.filter(user => user.username !== username);

    const connectedUserList = document.getElementById('connectedUsers'); 
    connectedUserList.innerHTML = ''; // очищаем список перед повторным рендером

    // перебираем всех пользователей и добавляем их в список
    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUserList); // создаём <li> для пользователя

        // если это не последний пользователь в массиве — добавляем разделитель
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li'); 
            separator.classList.add('separator'); // для стилей (например, линия)
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

/**
 * Обработчик клика по пользователю в списке.
 *
 * 1. Убирает класс 'active' у всех элементов списка пользователей.
 * 2. Делает форму для отправки сообщений видимой (убирает класс 'hidden').
 * 3. Подсвечивает выбранного пользователя (добавляет класс 'active').
 * 4. Сохраняет ID выбранного пользователя (selectedUserId).
 * 5. Загружает и отображает историю чата с выбранным пользователем.
 * 6. Сбрасывает индикатор непрочитанных сообщений (nbr-msg):
 *    скрывает его и обнуляет счётчик.
 */
function userItemClick (event) {
    // Сбрасываем активное выделение со всех пользователей
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });

    // Показываем форму сообщений
    messageForm.classList.remove('hidden');

    // Определяем, по какому пользователю кликнули
    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active'); // подсветка выбранного
    selectedUserId = clickedUser.getAttribute('id'); // сохраняем ID

    // Загружаем историю чата с этим пользователем
    fetchAndDisplayUserChat().then();

    // Сбрасываем индикатор непрочитанных сообщений
    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';
}


/**
 * Отображает сообщение в области чата.
 *
 * @param {string} senderId - имя пользователя (отправитель сообщения).
 * @param {string} content - текст сообщения.
 *
 * Логика работы:
 * 1. Создаёт контейнер для сообщения <div>.
 * 2. Добавляет общий класс "message".
 * 3. Если сообщение отправил текущий пользователь (senderId === username),
 *    то сообщение отмечается классом "sendee" (правое выравнивание).
 *    В противном случае — классом "received" (левое выравнивание).
 * 4. Создаёт элемент <p>, вставляет в него текст сообщения.
 * 5. Добавляет <p> в контейнер сообщения.
 * 6. Добавляет контейнер в область чата (chatArea).
 */
function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');

    if (senderId === username) {
        messageContainer.classList.add('sendee');   // сообщение от текущего пользователя
    } else {
        messageContainer.classList.add('received'); // сообщение от других пользователей
    }

    const message = document.createElement('p');
    message.textContent = content;

    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

/**
 * Загружает и отображает историю чата с выбранным пользователем.
 *
 * 1. Выполняет запрос на сервер по адресу `/messages/{username}/{selectedUserId}`.
 * 2. Получает и преобразует ответ в JSON (список сообщений).
 * 3. Очищает область чата перед рендерингом новых сообщений.
 * 4. Проходит по каждому сообщению и отображает его через displayMessage().
 * 5. Автоматически прокручивает чат вниз к последнему сообщению.
 */
async function fetchAndDisplayUserChat () {
    const userChatResponce = await fetch ('/messages/${username}/${selectedUserId}');
    const userChat = await userChatResponce.json();

    chatArea.innerHTML = ''; // очищаем область чата

    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content); // выводим сообщение
    });

    chatArea.scrollTop = chatArea.scrollHeight; // прокрутка вниз
}


/**
 * Обработчик ошибок подключения к WebSocket.
 *
 * 1. Устанавливает текстовое сообщение о невозможности подключения.
 * 2. Меняет цвет текста на красный для визуального выделения ошибки.
 */
function onError() {
    connectingElement.textContent = 'Не удалось подключиться к WebSocket';
    connectingElement.style.color = 'red';
}

/**
 * Отправляет сообщение выбранному пользователю через WebSocket.
 *
 * 1. Берёт текст из поля ввода (messageInput), убирает лишние пробелы.
 * 2. Проверяет, что сообщение не пустое и соединение (stompClient) активно.
 * 3. Формирует объект сообщения (отправитель, получатель, текст, timestamp).
 * 4. Отправляет сообщение на сервер по адресу '/app/chat'.
 * 5. Локально отображает отправленное сообщение через displayMessage().
 * 6. Очищает поле ввода сообщения.
 * 7. Прокручивает чат вниз к последнему сообщению.
 * 8. Предотвращает стандартное поведение отправки формы.
 */
function sendMessage(event) {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: username,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };

        stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
        displayMessage(username, messageInput.value.trim());
        messageInput.value = "";
    }

    charArea.scrollTop = charArea.scrollHeight;
    event.preventDefault();
}


/**
 * Обработчик входящих сообщений из WebSocket.
 *
 * 1. Обновляет список подключённых пользователей.
 * 2. Логирует полученное сообщение в консоль.
 * 3. Парсит тело сообщения из JSON.
 * 4. Если открыт чат с отправителем — отображает новое сообщение и
 *    прокручивает чат вниз.
 * 5. Если есть выбранный пользователь — подсвечивает его в списке.
 *    Иначе скрывает форму отправки сообщений.
 * 6. Если сообщение пришло от пользователя, который не активен:
 *    - показывает индикатор непрочитанных сообщений (nbr-msg);
 *    - оставляет счётчик пустым (для подсчёта можно расширить логику).
 */
async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();

    console.log("Message received", payload);
    const message = JSON.parse(payload.body);

    // Если открыт чат с отправителем
    if (selectedUserId && selectedUserId == message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Подсветка выбранного пользователя или скрытие формы
    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    // Уведомление о новом сообщении от неактивного пользователя
    const notificationElement = document.querySelector(`#${message.senderId}`);
    if (notificationElement && !notificationElement.classList.contains('active')) {
        const nbrMsgElement = notificationElement.querySelector('.nbr-msg');
        nbrMsgElement.classList.remove('hidden');
        nbrMsgElement.textContent = "";
    }
}




