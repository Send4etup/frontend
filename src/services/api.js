// src/services/api.js
// Mock API сервис с готовыми данными для разработки

class MockAPI {
    constructor() {
        this.delay = 300; // Имитация задержки сети
        this.token = localStorage.getItem('token');

        // Mock база данных
        this.mockData = {
            currentUser: {
                id: 1,
                telegram_id: 123456789,
                name: 'Иванов Иван',
                role: 'student',
                current_points: 34,
                total_points: 340,
                streak_days: 156,
                tasks_completed: 23,
                subscription_type: 'free',
                tokens_used: 450,
                tokens_limit: 1000,
                school_name: 'Школа №1499',
                class_name: '11-А',
                city: 'Москва',
                is_active: true,
                is_premium: false,
                created_at: '2024-01-01T10:00:00'
            },

            chatHistory: [
                {
                    id: 1,
                    title: 'Что такое квадратный корень',
                    subtitle: 'Как посчить корень из приведенного уравнения',
                    tokens_used: 150,
                    created_at: '2024-01-20T10:00:00',
                    messages: []
                },
                {
                    id: 2,
                    title: 'Законы Ньютона объяснение',
                    subtitle: 'Простыми словами о трех законах механики',
                    tokens_used: 200,
                    created_at: '2024-01-19T15:30:00',
                    messages: []
                },
                {
                    id: 3,
                    title: 'Фотосинтез у растений',
                    subtitle: 'Как растения производят кислород',
                    tokens_used: 180,
                    created_at: '2024-01-19T09:15:00',
                    messages: []
                }
            ],

            friends: [
                {
                    id: 1,
                    name: 'Иванов Петр',
                    status: 'Отличник',
                    points: 15120,
                    classPosition: 1,
                    avatar: null,
                    isOnline: true,
                    class_name: '11-А'
                },
                {
                    id: 2,
                    name: 'Василиса Гроб',
                    status: 'Отличница',
                    points: 13220,
                    classPosition: 2,
                    avatar: null,
                    isOnline: false,
                    class_name: '11-А'
                },
                {
                    id: 3,
                    name: 'Валерия Зуб',
                    status: 'Красивая и смелая',
                    points: 11220,
                    classPosition: 3,
                    avatar: null,
                    isOnline: true,
                    class_name: '11-А'
                },
                {
                    id: 4,
                    name: 'Алексей Смирнов',
                    status: 'Хорошист',
                    points: 9850,
                    classPosition: 4,
                    avatar: null,
                    isOnline: false,
                    class_name: '11-А'
                },
                {
                    id: 5,
                    name: 'Мария Козлова',
                    status: 'Отличница',
                    points: 8900,
                    classPosition: 5,
                    avatar: null,
                    isOnline: true,
                    class_name: '11-А'
                }
            ],

            teachers: [
                {
                    id: 1,
                    name: 'Петрова Мария Ивановна',
                    role: 'Математик • Классный руководитель',
                    subjects: ['Алгебра', 'Геометрия'],
                    schedule: {
                        monday: '2-й урок (9:00)',
                        wednesday: '1-й урок (8:20)',
                        saturday: '5-й урок (14:20)'
                    },
                    cabinet: '305',
                    telegram: '@petrimsdw',
                    email: 'petrova@school1499.ru',
                    phone: '+7 (999) 123-45-67'
                },
                {
                    id: 2,
                    name: 'Сидоров Алексей Николаевич',
                    role: 'Физика',
                    subjects: ['Физика'],
                    schedule: {
                        tuesday: '3-й урок (10:00)',
                        thursday: '2-й урок (9:00)',
                        friday: '4-й урок (11:30)'
                    },
                    cabinet: '412',
                    telegram: '@sidorov_physics',
                    email: 'sidorov@school1499.ru',
                    phone: '+7 (999) 234-56-78'
                },
                {
                    id: 3,
                    name: 'Кузнецова Елена Петровна',
                    role: 'Русский язык и литература',
                    subjects: ['Русский язык', 'Литература'],
                    schedule: {
                        monday: '3-й урок (10:00)',
                        wednesday: '2-й урок (9:00)',
                        friday: '1-й урок (8:20)'
                    },
                    cabinet: '218',
                    telegram: '@kuznetsova_rus',
                    email: 'kuznetsova@school1499.ru',
                    phone: '+7 (999) 345-67-89'
                }
            ],

            tasks: {
                active: [
                    {
                        id: 1,
                        title: 'Дискриминант',
                        subject: 'математика',
                        date: '08.02.25',
                        deadline: '2025-02-08T23:59:59',
                        progress: 8,
                        total: 19,
                        difficulty: 'medium',
                        points: 100,
                        description: 'Решить 19 задач на нахождение дискриминанта квадратного уравнения'
                    },
                    {
                        id: 2,
                        title: 'Корни дер/дир',
                        subject: 'русский язык',
                        date: '08.02.25',
                        deadline: '2025-02-08T23:59:59',
                        progress: 13,
                        total: 19,
                        difficulty: 'easy',
                        points: 50,
                        description: 'Упражнения на правописание корней с чередованием'
                    },
                    {
                        id: 3,
                        title: 'Законы Ньютона',
                        subject: 'физика',
                        date: '09.02.25',
                        deadline: '2025-02-09T23:59:59',
                        progress: 5,
                        total: 15,
                        difficulty: 'hard',
                        points: 150,
                        description: 'Решение задач на применение трех законов Ньютона'
                    },
                    {
                        id: 4,
                        title: 'Фотосинтез',
                        subject: 'биология',
                        date: '10.02.25',
                        deadline: '2025-02-10T23:59:59',
                        progress: 10,
                        total: 12,
                        difficulty: 'medium',
                        points: 80,
                        description: 'Изучение процесса фотосинтеза и решение тестов'
                    },
                    {
                        id: 5,
                        title: 'Вторая мировая война',
                        subject: 'история',
                        date: '11.02.25',
                        deadline: '2025-02-11T23:59:59',
                        progress: 0,
                        total: 20,
                        difficulty: 'hard',
                        points: 120,
                        description: 'Основные события и даты Второй мировой войны'
                    }
                ],
                completed: [
                    {
                        id: 6,
                        title: 'Таблица Менделеева',
                        subject: 'химия',
                        date: '01.02.25',
                        completedDate: '2025-02-01T18:30:00',
                        progress: 25,
                        total: 25,
                        difficulty: 'medium',
                        points: 100,
                        score: 92,
                        description: 'Изучение периодической таблицы элементов'
                    },
                    {
                        id: 7,
                        title: 'Сочинение по Достоевскому',
                        subject: 'литература',
                        date: '30.01.25',
                        completedDate: '2025-01-30T20:15:00',
                        progress: 1,
                        total: 1,
                        difficulty: 'hard',
                        points: 200,
                        score: 85,
                        description: 'Анализ романа "Преступление и наказание"'
                    }
                ]
            },

            ideas: [
                {
                    id: 1,
                    author: 'Иванов Петр',
                    authorAvatar: null,
                    date: '2 дня назад',
                    title: 'Добавить расписание звонков в приложение',
                    description: 'Было бы удобно видеть расписание звонков прямо в приложении, особенно для новеньких. Можно добавить уведомления за 5 минут до звонка, чтобы успеть дойти до класса. Также можно показывать сколько времени осталось до конца урока.',
                    tags: ['Приложение', 'Расписание'],
                    likes: 23,
                    dislikes: 3,
                    comments: 12,
                    status: 'new',
                    userVote: null
                },
                {
                    id: 2,
                    author: 'Василиса Гроб',
                    authorAvatar: null,
                    date: '3 дня назад',
                    title: 'Электронная очередь в столовую',
                    description: 'Предлагаю сделать систему электронной очереди в столовую. Можно заказывать еду через приложение и приходить к готовому заказу. Это сэкономит время на переменах и уменьшит очереди.',
                    tags: ['Приложение', 'Столовая', 'Автоматизация'],
                    likes: 45,
                    dislikes: 5,
                    comments: 28,
                    status: 'considering',
                    userVote: 'like'
                },
                {
                    id: 3,
                    author: 'Алексей Смирнов',
                    date: '1 неделю назад',
                    title: 'Книжный обмен между учениками',
                    description: 'Создать раздел в приложении для обмена учебниками и книгами между учениками. Можно будет выкладывать книги, которые уже не нужны, и находить те, которые нужны для учебы.',
                    tags: ['Приложение', 'Образование'],
                    likes: 67,
                    dislikes: 2,
                    comments: 34,
                    status: 'planned',
                    userVote: 'like'
                },
                {
                    id: 4,
                    author: 'Мария Козлова',
                    date: '2 недели назад',
                    title: 'Спортивные секции - онлайн запись',
                    description: 'Добавить возможность записываться в спортивные секции через приложение. Видеть расписание, свободные места, требования. Получать уведомления об отмене тренировок.',
                    tags: ['Спорт', 'Приложение'],
                    likes: 34,
                    dislikes: 8,
                    comments: 15,
                    status: 'new',
                    userVote: null
                }
            ]
        };
    }

    // Имитация задержки сети
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Базовый метод для всех запросов
    async request(endpoint, options = {}) {
        await this.simulateDelay();

        // Имитация обработки разных endpoints
        const mockHandlers = {
            '/api/auth/check-user': () => this.checkUser(options.body),
            '/api/auth/register': () => this.register(options.body),
            '/api/auth/logout': () => this.logout(),
            '/api/users/me': () => this.getCurrentUser(),
            '/api/users/friends': () => this.getFriends(),
            '/api/users/teachers': () => this.getTeachers(),
            '/api/users/chat-history': () => this.getChatHistory(),
            '/api/users/progress': () => this.updateProgress(options.body),
            '/api/education/tasks': () => this.getTasks(options.params),
            '/api/ideas': () => this.getIdeas(options.params),
            '/api/ideas/create': () => this.createIdea(options.body)
        };

        // Находим подходящий обработчик
        for (const [pattern, handler] of Object.entries(mockHandlers)) {
            if (endpoint.includes(pattern.split('/').slice(-1)[0])) {
                return handler();
            }
        }

        // По умолчанию возвращаем успех
        return { success: true };
    }

    // Mock методы API
    checkUser(data) {
        const exists = data?.telegram_id === 123456789;
        return {
            exists,
            user: exists ? this.mockData.currentUser : null,
            access_token: exists ? 'mock_token_' + Date.now() : null
        };
    }

    register(data) {
        const newUser = {
            ...this.mockData.currentUser,
            ...data,
            id: Date.now(),
            created_at: new Date().toISOString()
        };

        return {
            access_token: 'mock_token_' + Date.now(),
            user: newUser
        };
    }

    logout() {
        return { success: true, message: 'Вы успешно вышли из системы' };
    }

    getCurrentUser() {
        return this.mockData.currentUser;
    }

    getFriends() {
        return this.mockData.friends;
    }

    getTeachers() {
        return this.mockData.teachers;
    }

    getChatHistory() {
        return this.mockData.chatHistory;
    }

    updateProgress(data) {
        const updated = {
            ...this.mockData.currentUser,
            current_points: this.mockData.currentUser.current_points + (data?.points || 0)
        };

        return {
            current_points: updated.current_points,
            total_points: updated.total_points,
            streak_days: updated.streak_days,
            level_progress: 40,
            message: `Получено ${data?.points || 0} очков!`
        };
    }

    getTasks(params) {
        const status = params?.status || 'active';
        return this.mockData.tasks[status] || [];
    }

    getIdeas(params) {
        const filter = params?.filter || 'all';
        let ideas = [...this.mockData.ideas];

        if (filter === 'new') {
            ideas = ideas.filter(i => i.status === 'new');
        } else if (filter === 'popular') {
            ideas = ideas.sort((a, b) => b.likes - a.likes);
        } else if (filter === 'my') {
            ideas = ideas.filter(i => i.author === 'Иванов Иван');
        }

        return ideas;
    }

    createIdea(data) {
        const newIdea = {
            id: Date.now(),
            author: this.mockData.currentUser.name,
            date: 'только что',
            ...data,
            likes: 0,
            dislikes: 0,
            comments: 0,
            status: 'new',
            userVote: null
        };

        this.mockData.ideas.unshift(newIdea);
        return newIdea;
    }

    // Методы для axios-подобного интерфейса
    async get(url, config = {}) {
        return this.request(url, { method: 'GET', ...config });
    }

    async post(url, data, config = {}) {
        return this.request(url, { method: 'POST', body: data, ...config });
    }

    async patch(url, data, config = {}) {
        return this.request(url, { method: 'PATCH', body: data, ...config });
    }

    async delete(url, config = {}) {
        return this.request(url, { method: 'DELETE', ...config });
    }
}

// Создаем экземпляр mock API
const api = new MockAPI();

export default api;