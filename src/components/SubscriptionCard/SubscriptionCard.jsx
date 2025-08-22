import React from 'react';

const SubscriptionCard = ({
                              id,
                              title,
                              price,
                              saves,
                              tokens,
                              isPopular,
                              badge,
                              onClick
                          }) => {
    return (
        <div
            className={`subscription-card ${isPopular ? 'popular' : ''}`}
            onClick={() => onClick && onClick(id)}
        >
            <div className="subscription-header">
                <h3 className="subscription-title">{title}</h3>
                {badge && (
                    <span className="subscription-badge">{badge}</span>
                )}
            </div>

            <div className="subscription-price">
                {price}<span className="currency">₽</span>
            </div>

            <p className="subscription-saves">
                Экономия {saves}₽
            </p>

            <p className="subscription-tokens">
                {tokens}
            </p>
        </div>
    );
};

export default SubscriptionCard;