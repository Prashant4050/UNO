import React from 'react';
import Card from './Card';

function PlayerHand({ player, cards, isCurrentPlayer, onPlayCard, topCard }) {
  const hand = player ? player.hand : cards;
  if (!hand) return null;

  const handleCardClick = (card) => {
    if (isCurrentPlayer) {
      onPlayCard(card.id || card._id, card);
    }
  };

  const isCardPlayable = (card) => {
    if (!topCard) return true;
    if (card.color === 'wild') return true;
    return card.color === topCard.color || card.value === topCard.value;
  };

  return (
    <div className="player-hand">
      <h3>Your Cards ({hand.length})</h3>
      <div className="hand-cards">
        {hand.map((card, index) => (
          <Card
            key={card.id || card._id || index}
            card={card}
            onClick={() => handleCardClick(card)}
            isPlayable={isCurrentPlayer && isCardPlayable(card)}
          />
        ))}
      </div>
      {!isCurrentPlayer && (
        <p className="waiting-message">Waiting for your turn...</p>
      )}
    </div>
  );
}

export default PlayerHand;