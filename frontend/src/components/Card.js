import React from 'react';

function Card({ card, onClick, isPlayable = false, isSelected = false }) {
  if (!card) return null;

  const getCardDisplay = () => {
    if (card.value === 'wild' || card.value === 'wild4') {
      return card.value === 'wild' ? 'WILD' : 'WILD +4';
    }
    return card.value.toUpperCase();
  };

  const getCardClass = () => {
    let classes = `card ${card.color}`;
    if (isPlayable) classes += ' playable';
    if (isSelected) classes += ' selected';
    return classes;
  };

  return (
    <div
      className={getCardClass()}
      onClick={onClick}
    >
      <div className="card-content">
        <div className="card-value">{getCardDisplay()}</div>
        {card.color !== 'wild' && (
          <div className="card-symbol">
            {card.value === 'skip' && '⊘'}
            {card.value === 'reverse' && '↺'}
            {card.value === 'draw2' && '+2'}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;