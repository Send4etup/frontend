// src/utils/autoSettingsEngine.js

import { getDefaultSettings } from '../pages/ChatPage/components/ChatSettings/settingsConfig';
import {getAIAnalysis} from "../services/chatAPI.js";

// =====================================================
// 1️⃣ БАЗОВЫЕ ОПТИМИЗИРОВАННЫЕ НАСТРОЙКИ ПО ТИПАМ ЧАТА
// =====================================================

const OPTIMIZED_PRESETS = {
    general: {
        temperature: 0.7,
        maxLength: 'medium',
        language: 'ru',
        responseStyle: 'friendly'
    },

    coding: {
        temperature: 0.7,      // Низкая для точности кода
        maxLength: 'detailed', // Подробные объяснения
        language: 'ru',
        withComments: true,
        codeStyle: 'clean',
        explainSteps: true,
        defaultLanguage: 'python'
    },

    image: {
        temperature: 0.9,      // Высокая для креативности
        maxLength: 'medium',
        language: 'ru',
        imageStyle: 'realistic',
        aspectRatio: 'square',
        quality: 'standard',
        detailLevel: 'medium'
    },

    brainstorm: {
        temperature: 1.0,      // Максимальная креативность
        maxLength: 'detailed',
        language: 'ru',
        ideasCount: '5-7',
        creativityLevel: 'balanced',
        includeExamples: true
    },

    excuse: {
        temperature: 0.85,     // Высокая для креатива
        maxLength: 'medium',
        language: 'ru',
        excuseStyle: 'polite',
        variantsCount: '3'
    },

    explain_topic: {
        temperature: 0.6,      // Средняя для точности
        maxLength: 'detailed',
        language: 'ru',
        explanationDepth: 'medium',
        useExamples: true,
        checkUnderstanding: true
    },

    exam_prep: {
        temperature: 0.4,      // Низкая для точности
        maxLength: 'detailed',
        language: 'ru',
        subject: 'math',
        difficulty: 'medium',
        includePractice: true
    },

    make_notes: {
        temperature: 0.5,      // Средне-низкая для структуры
        maxLength: 'medium',
        language: 'ru',
        format: 'bullets',
        detailLevel: 'medium',
        highlightKey: true
    },

    photo_solve: {
        temperature: 0.4,      // Низкая для точности
        maxLength: 'detailed',
        language: 'ru',
        solutionStyle: 'teaching',
        showSteps: true,
        explainLogic: true
    },

    write_work: {
        temperature: 0.75,     // Средне-высокая для творчества
        maxLength: 'detailed',
        language: 'ru',
        workType: 'essay',
        tone: 'neutral',
        helpLevel: 'guide'
    },

    analyze_mistake: {
        temperature: 0.5,      // Средняя для анализа
        maxLength: 'detailed',
        language: 'ru',
        analysisDepth: 'medium',
        provideSimilar: true,
        explainConcepts: true
    },

    mood_support: {
        temperature: 0.7,      // Средняя для эмпатии
        maxLength: 'medium',
        language: 'ru',
        supportStyle: 'empathetic',
        offerTechniques: true,
        askQuestions: true
    }
};

// =====================================================
// 2️⃣ АНАЛИЗ КЛЮЧЕВЫХ СЛОВ В СООБЩЕНИИ
// =====================================================

/**
 * Словарь ключевых слов для определения намерений
 */
const KEYWORD_PATTERNS = {
    // Длина ответа
    length: {
        short: /кратко|коротко|быстро|тезисно|вкратце|резюме/i,
        detailed: /подробно|детально|развернуто|полно|обстоятельно|со всеми деталями/i
    },

    // Креативность
    creativity: {
        high: /креативно|необычно|оригинально|нестандартно|смело|дерзко/i,
        low: /точно|правильно|корректно|строго|формально|по правилам/i
    },

    // Стиль общения
    tone: {
        formal: /официально|формально|деловой стиль|профессионально/i,
        casual: /неформально|по-простому|как другу|расслабленно/i
    },

    // Специфичные для кодинга
    coding: {
        withComments: /с комментариями|объясни код|прокомментируй/i,
        minimal: /минимально|без лишнего|компактно|лаконично/i,
        explain: /объясни|расскажи как|почему так|что делает/i
    },

    // Для изображений
    image: {
        hd: /качественно|высокое качество|hd|четко|детально/i,
        simple: /просто|схематично|набросок|эскиз/i
    },

    // Для обучения
    learning: {
        beginner: /начинающ|новичок|не понимаю|объясни просто|как ребенку/i,
        advanced: /сложно|продвинут|глубоко|детально|для эксперта/i
    }
};

/**
 * Анализирует сообщение и корректирует настройки
 * @param {string} message - Сообщение пользователя
 * @param {object} baseSettings - Базовые настройки
 * @returns {object} Скорректированные настройки
 */
function analyzeMessageKeywords(message, baseSettings) {
    const settings = { ...baseSettings };
    const lowerMessage = message.toLowerCase();

    // 1. Анализ длины ответа
    if (KEYWORD_PATTERNS.length.short.test(lowerMessage)) {
        settings.maxLength = 'short';
    } else if (KEYWORD_PATTERNS.length.detailed.test(lowerMessage)) {
        settings.maxLength = 'detailed';
    }

    // 2. Анализ креативности
    if (KEYWORD_PATTERNS.creativity.high.test(lowerMessage)) {
        settings.temperature = Math.min(settings.temperature + 0.2, 1.2);
    } else if (KEYWORD_PATTERNS.creativity.low.test(lowerMessage)) {
        settings.temperature = Math.max(settings.temperature - 0.2, 0.2);
    }

    // 3. Анализ стиля общения
    if (KEYWORD_PATTERNS.tone.formal.test(lowerMessage)) {
        if (settings.responseStyle) settings.responseStyle = 'formal';
        if (settings.excuseStyle) settings.excuseStyle = 'formal';
        if (settings.tone) settings.tone = 'formal';
    } else if (KEYWORD_PATTERNS.tone.casual.test(lowerMessage)) {
        if (settings.responseStyle) settings.responseStyle = 'casual';
        if (settings.excuseStyle) settings.excuseStyle = 'casual';
        if (settings.tone) settings.tone = 'casual';
    }

    // 4. Специфика для кодинга
    if (settings.withComments !== undefined) {
        if (KEYWORD_PATTERNS.coding.withComments.test(lowerMessage)) {
            settings.withComments = true;
            settings.explainSteps = true;
        }
        if (KEYWORD_PATTERNS.coding.minimal.test(lowerMessage)) {
            settings.codeStyle = 'minimal';
            settings.withComments = false;
        }
    }

    // 5. Специфика для изображений
    if (settings.quality !== undefined) {
        if (KEYWORD_PATTERNS.image.hd.test(lowerMessage)) {
            settings.quality = 'hd';
            settings.detailLevel = 'detailed';
        } else if (KEYWORD_PATTERNS.image.simple.test(lowerMessage)) {
            settings.detailLevel = 'simple';
        }
    }

    // 6. Уровень для обучения
    if (settings.explanationDepth !== undefined) {
        if (KEYWORD_PATTERNS.learning.beginner.test(lowerMessage)) {
            settings.explanationDepth = 'simple';
            settings.useExamples = true;
        } else if (KEYWORD_PATTERNS.learning.advanced.test(lowerMessage)) {
            settings.explanationDepth = 'deep';
        }
    }

    return settings;
}

// =====================================================
// 3️⃣ АНАЛИЗ КОНТЕКСТА ИСТОРИИ
// =====================================================

/**
 * Анализирует историю чата и корректирует настройки
 * @param {array} history - История сообщений
 * @param {object} settings - Текущие настройки
 * @returns {object} Скорректированные настройки
 */
function analyzeHistoryContext(history, settings) {
    if (!history || history.length === 0) return settings;

    const updatedSettings = { ...settings };

    // Если диалог длинный - повышаем разнообразие
    if (history.length > 8) {
        updatedSettings.temperature = Math.min(updatedSettings.temperature + 0.1, 1.2);
    }

    // Анализ последних сообщений на предмет непонимания
    const lastMessages = history.slice(-3).map(msg => msg.text?.toLowerCase() || '');
    const confusionKeywords = /не понял|не понятно|объясни по-другому|что значит|как это/i;

    if (lastMessages.some(msg => confusionKeywords.test(msg))) {
        // Пользователь не понимает - упрощаем
        updatedSettings.maxLength = 'medium';
        if (updatedSettings.explanationDepth) {
            updatedSettings.explanationDepth = 'simple';
        }
        if (updatedSettings.useExamples !== undefined) {
            updatedSettings.useExamples = true;
        }
    }

    return updatedSettings;
}

// =====================================================
// 5️⃣ ГЛАВНАЯ ФУНКЦИЯ - АВТОМАТИЧЕСКИЙ ПОДБОР
// =====================================================

/**
 * @param {string} chatType - Тип чата
 * @param {string} message - Сообщение пользователя
 * @param {Array} history - История сообщений (не используется пока)
 * @param {string} systemPrompt - Системный промпт агента
 * @param {string} chatID - ID чата
 * @param {Object} effectiveSettings - Текущие настройки (для передачи в AI)
 * @returns {Promise<Object>} Оптимизированные настройки
 */
export async function getAutoSettings(
    chatType,
    message = '',
    history = [],
    systemPrompt,
    chatID,
    effectiveSettings
) {
    console.log('🤖 [AutoSettings] Начинаю подбор настроек...', {
        chatType,
        messageLength: message?.length || 0,
        hasHistory: history.length > 0
    });

    let settings = { ...OPTIMIZED_PRESETS[chatType] };

    if (!settings) {
        console.warn(`⚠️ [AutoSettings] Неизвестный тип чата: ${chatType}, использую 'general'`);
        settings = { ...OPTIMIZED_PRESETS.general };
    }

    console.log('📋 [AutoSettings] Базовый пресет загружен:', settings);

    if (message && message.trim().length > 0) {
        try {
            console.log('🧠 [AutoSettings] Отправляю запрос к AI...');

            const aiSuggestions = await getAIAnalysis(
                message,
                chatType,
                settings, // ← Передаем текущие настройки!
                systemPrompt,
                chatID
            );

            if (aiSuggestions && Object.keys(aiSuggestions).length > 0) {
                console.log('✨ [AutoSettings] AI предложил изменения:', aiSuggestions);

                // ✅ ПРИМЕНЯЕМ ТОЛЬКО ИЗМЕНЕННЫЕ ПОЛЯ
                settings = {
                    ...settings,
                    ...aiSuggestions
                };

                console.log('🔄 [AutoSettings] После применения AI:', settings);
            } else {
                console.log('ℹ️ [AutoSettings] AI не предложил изменений, используем пресет');
            }
        } catch (error) {
            console.warn('⚠️ [AutoSettings] AI-анализ не удался, продолжаем с пресетом:', error);
        }
    } else {
        console.log('ℹ️ [AutoSettings] Пустое сообщение, пропускаем AI-анализ');
    }

    // ===================================
    // ШАГ 3: Финальная валидация
    // ===================================
    settings = validateSettings(settings);

    console.log('✅ [AutoSettings] Финальные настройки:', settings);

    return settings;
}


// =====================================================
// 6️⃣ ВАЛИДАЦИЯ НАСТРОЕК
// =====================================================

/**
 * Проверяет и нормализует настройки
 */
export function validateSettings(settings) {
    const validated = { ...settings };

    if (validated.temperature !== undefined) {
        validated.temperature = Math.max(0.2, Math.min(1.2, validated.temperature));
    }

    if (validated.maxLength && !['short', 'medium', 'detailed'].includes(validated.maxLength)) {
        console.warn(`⚠️ Invalid maxLength: ${validated.maxLength}, using 'medium'`);
        validated.maxLength = 'medium';
    }

    if (validated.language && !['ru', 'en'].includes(validated.language)) {
        console.warn(`⚠️ Invalid language: ${validated.language}, using 'ru'`);
        validated.language = 'ru';
    }

    return validated;
}

// =====================================================
// 7️⃣ ЭКСПОРТ ДОПОЛНИТЕЛЬНЫХ УТИЛИТ
// =====================================================

/**
 * Получить человекочитаемое объяснение выбранных настроек
 */
export function explainSettings(settings, chatType) {
    const explanations = [];

    // Temperature
    if (settings.temperature < 0.4) {
        explanations.push('🎯 Точность: Настроена максимальная точность ответов');
    } else if (settings.temperature > 0.8) {
        explanations.push('🎨 Креативность: Включен максимально творческий режим');
    } else {
        explanations.push('⚖️ Баланс: Оптимальное соотношение точности и креативности');
    }

    // Max Length
    const lengthMap = {
        short: '📝 Краткость: Короткие и ёмкие ответы',
        medium: '📄 Стандарт: Сбалансированная длина ответов',
        detailed: '📚 Подробность: Развернутые объяснения'
    };
    if (settings.maxLength) {
        explanations.push(lengthMap[settings.maxLength]);
    }

    return explanations;
}

/**
 * Проверка необходимости AI-анализа
 */
export function shouldUseAI(message) {
    return message && (
        message.length > 150 ||
        message.split('?').length > 2 ||
        /но|однако|с другой стороны|в то же время/i.test(message)
    );
}


/**
 * Использует GPT для умного анализа сложных запросов
 * @param {string} message - Сообщение пользователя
 * @param {string} chatType - Тип чата
 * @param {object} currentSettings - Текущие настройки
 * @returns {Promise<object>} Рекомендованные настройки от ИИ
 */
async function analyzeWithAI(message, chatType, currentSettings) {


    try {
        const response = await fetch('http://localhost:3213/api/chat/ai-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Тип чата: ${chatType}\n\nЗапрос пользователя: "${message}"` }
                ],
                model: 'gpt-3.5-turbo',
                temperature: 0.3,
                max_tokens: 300
            })
        });

        if (!response.ok) {
            console.warn('AI analysis failed, using rule-based fallback');
            return {};
        }

        const data = await response.json();
        const aiResponse = data.response || data.content;

        // Парсим JSON из ответа
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return {};
    } catch (error) {
        console.warn('AI analysis error:', error);
        return {};
    }
}

export default getAutoSettings;