// src/components/TestsList/TestsList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { testsData } from '../../data/testData';

const TestsList = () => {
    const navigate = useNavigate();

    const handleTestClick = (testId) => {
        navigate(`/test/${testId}`);
    };

    const getProgressPercentage = (completed, total) => {
        return Math.round((completed / total) * 100);
    };

    const getSubjectColor = (subject) => {
        switch(subject) {
            case 'математика':
                return '#ef4444';
            case 'русский язык':
                return '#22c55e';
            case 'физика':
                return '#3b82f6';
            case 'биология':
                return '#10b981';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="tests-list">

            <div className="tests-grid">
                {Object.values(testsData).map((test, index) => (
                    <motion.div
                        key={test.id}
                        className="test-card"
                        onClick={() => handleTestClick(test.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="test-header">
                            <h3 className="test-title">{test.title}</h3>
                            <ChevronRight className="test-arrow" />
                        </div>

                        <div className="test-info">
                            <span
                                className="test-subject"
                                style={{ backgroundColor: getSubjectColor(test.subject) }}
                            >
                                {test.subject}
                            </span>
                            <span className="test-date">
                                {new Date().toLocaleDateString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                })}
                            </span>
                        </div>

                        <div className="test-progress">
                            <div className="progress-info">
                                <span className="progress-completed">{test.completedQuestions}</span>
                                <span className="progress-total">{test.totalQuestions}</span>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${getProgressPercentage(test.completedQuestions, test.totalQuestions)}%`,
                                        backgroundColor: getSubjectColor(test.subject)
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TestsList;