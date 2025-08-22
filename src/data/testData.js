// src/data/testData.js

export const testsData = {
    discriminant: {
        id: 'discriminant',
        title: 'Дискриминант',
        subject: 'математика',
        totalQuestions: 19,
        completedQuestions: 8,
        timeLimit: 1800, // 30 минут в секундах
        questions: [
            {
                id: 1,
                type: 'multiple_choice',
                question: 'Что такое огурцы?',
                options: [
                    { id: 'a', text: 'Овощи', isCorrect: true },
                    { id: 'b', text: 'Фрукты', isCorrect: false },
                    { id: 'c', text: 'Ягоды', isCorrect: false },
                    { id: 'd', text: 'Грибы', isCorrect: false }
                ],
                explanation: 'Огурцы относятся к овощным культурам семейства тыквенных.',
                answered: true,
                selectedAnswer: 'a',
                isCorrect: true
            },
            {
                id: 2,
                type: 'multiple_choice',
                question: 'Что такое помидоры?',
                options: [
                    { id: 'a', text: 'Овощи', isCorrect: false },
                    { id: 'b', text: 'Фрукты', isCorrect: true },
                    { id: 'c', text: 'Ягоды', isCorrect: false },
                    { id: 'd', text: 'Корнеплоды', isCorrect: false }
                ],
                explanation: 'С ботанической точки зрения помидоры являются фруктами.',
                answered: true,
                selectedAnswer: 'b',
                isCorrect: true,
                hasVoice: true
            },
            {
                id: 3,
                type: 'text_input',
                question: 'Продолжи фразу: "Черное ..."',
                correctAnswer: 'море',
                options: ['Лес', 'Море', 'Гора', 'Подвал'],
                explanation: 'Черное море - внутреннее море бассейна Атлантического океана.',
                answered: false,
                userAnswer: '',
                hasImage: true,
                imageUrl: '/images/black_sea.jpg'
            },
            {
                id: 4,
                type: 'multiple_choice',
                question: 'Что такое перец?',
                options: [
                    { id: 'a', text: 'Овощ', isCorrect: true },
                    { id: 'b', text: 'Фрукт', isCorrect: false },
                    { id: 'c', text: 'Специя', isCorrect: false },
                    { id: 'd', text: 'Ягода', isCorrect: false }
                ],
                explanation: 'Перец относится к овощным культурам.',
                answered: false,
                selectedAnswer: null,
                isCorrect: null
            },
            {
                id: 5,
                type: 'multiple_choice',
                question: 'Сколько планет в Солнечной системе?',
                options: [
                    { id: 'a', text: '7', isCorrect: false },
                    { id: 'b', text: '8', isCorrect: true },
                    { id: 'c', text: '9', isCorrect: false },
                    { id: 'd', text: '10', isCorrect: false }
                ],
                explanation: 'В Солнечной системе 8 планет: Меркурий, Венера, Земля, Марс, Юпитер, Сатурн, Уран, Нептун.',
                answered: false,
                selectedAnswer: null,
                isCorrect: null
            }
        ]
    },

    russian_roots: {
        id: 'russian_roots',
        title: 'Корни дер/дир',
        subject: 'русский язык',
        totalQuestions: 19,
        completedQuestions: 13,
        timeLimit: 1200, // 20 минут
        questions: [
            {
                id: 1,
                type: 'multiple_choice',
                question: 'В каком слове правильно написан корень с чередованием?',
                options: [
                    { id: 'a', text: 'Дерево', isCorrect: false },
                    { id: 'b', text: 'Директор', isCorrect: true },
                    { id: 'c', text: 'Дирижер', isCorrect: false },
                    { id: 'd', text: 'Деревня', isCorrect: false }
                ],
                explanation: 'В слове "директор" корень "дир" пишется через "и".',
                answered: false,
                selectedAnswer: null,
                isCorrect: null
            },
            {
                id: 2,
                type: 'multiple_choice',
                question: 'Выберите слово с корнем "дер"',
                options: [
                    { id: 'a', text: 'Дерзкий', isCorrect: true },
                    { id: 'b', text: 'Директива', isCorrect: false },
                    { id: 'c', text: 'Дирижабль', isCorrect: false },
                    { id: 'd', text: 'Директория', isCorrect: false }
                ],
                explanation: 'В слове "дерзкий" используется корень "дер".',
                answered: false,
                selectedAnswer: null,
                isCorrect: null
            }
        ]
    }
};

export const getTestById = (testId) => {
    return testsData[testId] || null;
};

export const getQuestionById = (testId, questionId) => {
    const test = getTestById(testId);
    if (!test) return null;

    return test.questions.find(q => q.id === questionId) || null;
};