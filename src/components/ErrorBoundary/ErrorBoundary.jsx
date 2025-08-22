// src/components/ErrorBoundary/ErrorBoundary.jsx
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
// import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Отправляем ошибку в аналитику (если нужно)
        if (window.Telegram?.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    event: 'app_error',
                    error: error.message,
                    stack: error.stack,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.warn('Failed to send error to Telegram:', e);
            }
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.href = '/home';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <div className="error-icon">
                            <AlertTriangle size={64} />
                        </div>

                        <h1 className="error-title">Что-то пошло не так</h1>
                        <p className="error-message">
                            Произошла неожиданная ошибка. Попробуйте перезагрузить приложение.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="error-details">
                                <summary>Техническая информация</summary>
                                <pre className="error-stack">
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                className="error-btn primary"
                                onClick={this.handleReload}
                            >
                                <RefreshCw size={16} />
                                Перезагрузить
                            </button>

                            <button
                                className="error-btn secondary"
                                onClick={this.handleGoHome}
                            >
                                <Home size={16} />
                                На главную
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;