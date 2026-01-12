import React from 'react';
import Card from './Card';

function DiscardPile({ discardPile, lastPlayerName }) {
  if (!discardPile || discardPile.length === 0) {
    return (
      <div className="discard-pile">
        <h3>Discard Pile</h3>
        <div className="empty-pile">No cards played yet</div>
      </div>
    );
  }

  const topCard = discardPile[discardPile.length - 1];

  return (
    <div className="discard-pile">
      <h3>Discard Pile</h3>
      <div className="discard-card-container">
        <Card card={topCard} />
        <div className="pile-count">{discardPile.length} cards</div>
      </div>
      {lastPlayerName && (
        <div className="last-played-info">
          <p>Last played by: <strong>{lastPlayerName}</strong></p>
          {discardPile && discardPile.length > 0 && (
            <div className="last-played-card">
              <Card card={topCard} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiscardPile;