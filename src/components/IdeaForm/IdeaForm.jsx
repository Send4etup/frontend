import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, X, Plus, Tag, AlertCircle,
    Lightbulb, Send, FileText, Image as ImageIcon
} from 'lucide-react';
// import './IdeaForm.css';

const IdeaForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tags: [],
        attachments: []
    });

    const [currentTag, setCurrentTag] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { value: '', label: 'Выберите категорию' },
        { value: 'app', label: 'Приложение' },
        { value: 'schedule', label: 'Расписание' },
        { value: 'education', label: 'Образование' },
        { value: 'events', label: 'Мероприятия' },
        { value: 'facilities', label: 'Инфраструктура' },
        { value: 'other', label: 'Другое' }
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Заголовок обязателен';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Заголовок должен быть не менее 5 символов';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Описание обязательно';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Описание должно быть не менее 20 символов';
        }

        if (!formData.category) {
            newErrors.category = 'Выберите категорию';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Failed to submit idea:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTag = () => {
        if (currentTag.trim() && formData.tags.length < 3) {
            setFormData({
                ...formData,
                tags: [...formData.tags, currentTag.trim()]
            });
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (index) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, i) => i !== index)
        });
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });

        // Очистка ошибки при изменении поля
        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: ''
            });
        }
    };

    const pageTransition = {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 }
    };

    return (
        <motion.div
            className="idea-form-page"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="container">
                <motion.div
                    className="form-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <motion.button
                        onClick={onCancel}
                        className="back-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ArrowLeft className="icon" />
                    </motion.button>
                    <h1 className="page-title">Предложить идею</h1>
                </motion.div>

                <motion.div
                    className="idea-form-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="form-intro">
                        <Lightbulb className="intro-icon" />
                        <p className="intro-text">
                            Поделитесь своей идеей, как сделать нашу школу лучше!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="idea-form">
                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="form-label">
                                Заголовок идеи <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Кратко опишите вашу идею"
                                className={`form-input ${errors.title ? 'error' : ''}`}
                                maxLength={100}
                            />
                            <div className="input-footer">
                                {errors.title && (
                                    <span className="error-message">
                    <AlertCircle className="error-icon" />
                                        {errors.title}
                  </span>
                                )}
                                <span className="char-count">
                  {formData.title.length}/100
                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <label className="form-label">
                                Подробное описание <span className="required">*</span>
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Расскажите подробнее, что вы предлагаете улучшить и как это поможет"
                                className={`form-textarea ${errors.description ? 'error' : ''}`}
                                rows={6}
                                maxLength={1000}
                            />
                            <div className="input-footer">
                                {errors.description && (
                                    <span className="error-message">
                    <AlertCircle className="error-icon" />
                                        {errors.description}
                  </span>
                                )}
                                <span className="char-count">
                  {formData.description.length}/1000
                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="form-label">
                                Категория <span className="required">*</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                className={`form-select ${errors.category ? 'error' : ''}`}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <span className="error-message">
                  <AlertCircle className="error-icon" />
                                    {errors.category}
                </span>
                            )}
                        </motion.div>

                        <motion.div
                            className="form-group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="form-label">
                                Теги
                                <span className="label-hint">Максимум 3 тега</span>
                            </label>
                            <div className="tag-input-wrapper">
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Введите тег и нажмите Enter"
                                    className="tag-input"
                                    disabled={formData.tags.length >= 3}
                                />
                                <motion.button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="add-tag-btn"
                                    disabled={!currentTag.trim() || formData.tags.length >= 3}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Plus className="icon" />
                                </motion.button>
                            </div>

                            <AnimatePresence>
                                {formData.tags.length > 0 && (
                                    <motion.div
                                        className="tags-list"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {formData.tags.map((tag, index) => (
                                            <motion.span
                                                key={index}
                                                className="tag"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: "spring", stiffness: 500 }}
                                            >
                                                <Tag className="tag-icon" />
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(index)}
                                                    className="remove-tag-btn"
                                                >
                                                    <X className="icon" />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            className="form-attachments"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <label className="form-label">Прикрепить файлы</label>
                            <div className="attachment-buttons">
                                <motion.button
                                    type="button"
                                    className="attachment-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ImageIcon className="icon" />
                                    Изображение
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="attachment-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FileText className="icon" />
                                    Документ
                                </motion.button>
                            </div>
                        </motion.div>

                        <motion.div
                            className="form-actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.button
                                type="button"
                                onClick={onCancel}
                                className="btn btn-secondary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </motion.button>

                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>Отправка...</>
                                ) : (
                                    <>
                                        <Send className="icon" />
                                        Отправить идею
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default IdeaForm;