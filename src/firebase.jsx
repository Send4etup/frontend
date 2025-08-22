// Импортируй необходимые модули Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';

// 1. Вставь сюда объект конфигурации, который ты скопировал из консоли Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAZSrLUSlES97lJDFJNFkQOxQuedVWJ1Uk",
    authDomain: "aibot-78b5d.firebaseapp.com",
    databaseURL: "https://aibot-78b5d-default-rtdb.firebaseio.com",
    projectId: "aibot-78b5d",
    storageBucket: "aibot-78b5d.firebasestorage.app",
    messagingSenderId: "747549594506",
    appId: "1:747549594506:web:e6174f16cc8f473c08ee73"
};

// 2. Инициализируй Firebase
const app = initializeApp(firebaseConfig);

// 3. Получи ссылку на Realtime Database
// Твоя база данных: aibot-78b5d-default-rtdb, URL: https://aibot-78b5d-default-rtdb.firebaseio.com
const database = getDatabase(app);

// Теперь ты можешь использовать объект 'database' для взаимодействия с Realtime Database!

// Пример: Запись данных
function writeUserData(userId, name, email, imageUrl) {
    set(ref(database, 'users/' + userId), {
        username: name,
        email: email,
        profile_picture : imageUrl
    })
        .then(() => {
            console.log("Данные успешно записаны!");
        })
        .catch((error) => {
            console.error("Ошибка записи данных: ", error);
        });
}

// Пример: Чтение данных (в режиме реального времени)
function readUserData(userId) {
    const userRef = ref(database, 'users/' + userId);
    onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("Получены данные пользователя:", data);
            // Здесь ты можешь обновить свой UI с этими данными
        } else {
            console.log("Данные пользователя не найдены.");
        }
    }, (error) => {
        console.error("Ошибка чтения данных:", error);
    });
}

// Пример использования:
// writeUserData("123", "Джемини", "gemini@example.com", "url_к_фото.jpg");
// readUserData("123");
