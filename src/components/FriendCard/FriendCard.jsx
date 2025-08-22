// src/components/FriendCard/FriendCard.jsx
import React from 'react';

const FriendCard = ({
        id,
        name,
        avatar,
        status,
        points,
        rank,
        onClick
    }) => {
    return (
        <div
            className="friend-card"
            onClick={() => onClick && onClick(id)}
        >
            <img
                // src={avatar || '/default-avatar.png'}
                alt={name}
                className="friend-avatar"
                // onError={(e) => {
                //     e.target.src = '/default-avatar.png';
                // }}
            />

            <div className="friend-info">
                <h3 className="friend-name">{name}</h3>
                <p className="friend-status">{status}</p>
            </div>

            <div className="friend-stats">
                <p className="friend-points">{points?.toLocaleString()} баллов</p>
                <p className="friend-rank">#{rank} в классе</p>
            </div>
        </div>
    );
};

export default FriendCard;