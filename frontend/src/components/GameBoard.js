import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
import OtherPlayers from './OtherPlayers';
import DiscardPile from './DiscardPile';

function GameBoard({ gameState, player, onPlayCard, onDrawCard, onStartGame, onLeaveGame, lastPlayerName }) {
  const [unoCalled, setUnoCalled] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Reset UNO call when hand size changes
  useEffect(() => {
    if (player && player.hand) {
      if (player.hand.length !== 2) {
        setUnoCalled(false);
      }
    }
  }, [player]);

  if (!gameState || !player) {
    return <div>Loading...</div>;
  }

  const currentPlayerId = gameState.currentPlayer?._id || gameState.currentPlayer;
  const isCurrentPlayer = currentPlayerId && currentPlayerId.toString() === player._id.toString();
  const canStartGame = gameState.status === 'waiting' && gameState.players.length >= 1;

  const handleCardClick = (cardId, card) => {
    if (!isCurrentPlayer) return;

    // If it's a wild card (regular wild or wild4), show color selection first
    if (card.color === 'wild') {
      setSelectedCardId(cardId);
      return;
    }

    // Otherwise, play the card directly
    onPlayCard(cardId, null);
  };

  const handleColorChoice = (color) => {
    if (selectedCardId) {
      onPlayCard(selectedCardId, color);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Game Room: {gameState.roomCode}</h2>
        <div className="game-info">
          <span>Status: {gameState.status}</span>
          <span>Current Color: {gameState.currentColor}</span>
          {gameState.currentPlayer && (
            <span>Current Player: {gameState.currentPlayer.name}</span>
          )}
        </div>
        <button onClick={onLeaveGame} className="leave-button">Leave Game</button>
      </div>

      {gameState.status === 'waiting' && (
        <div className="waiting-room">
          <h3>Ready for 4 players</h3>
          <div className="players-list">
            {gameState.players.map((p, index) => (
              <div key={index} className="player-item">
                {p.name} {p._id === player._id && '(You)'}
              </div>
            ))}
          </div>
          {canStartGame && (
            <button onClick={onStartGame} className="start-button">Start Game</button>
          )}
        </div>
      )}

      {gameState.status === 'playing' && (
        <>
          <OtherPlayers
            players={gameState.players.map(gamePlayer => ({
              ...gamePlayer,
              cardCount: gamePlayer.hand ? gamePlayer.hand.length : 0
            }))}
            currentPlayerIndex={gameState.players.findIndex(p => p._id.toString() === currentPlayerId?.toString())}
          />
          <DiscardPile discardPile={gameState.discardPile} lastPlayerName={lastPlayerName} />
          <div className="game-actions">
            {isCurrentPlayer && (
              <div className="player-actions">
                <button onClick={onDrawCard} className="draw-button">Draw Card</button>
                {player && player.hand && player.hand.length === 2 && !unoCalled && (
                  <button onClick={() => setUnoCalled(true)} className="uno-button">Call UNO!</button>
                )}
                {selectedCardId && (
                  <div className="color-choice">
                    <p>Choose a color for your wild card:</p>
                    <div className="color-buttons">
                      {['red', 'blue', 'yellow', 'green'].map(color => (
                        <button
                          key={color}
                          className={`color-button ${color}`}
                          onClick={() => handleColorChoice(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <PlayerHand
            player={player}
            isCurrentPlayer={isCurrentPlayer}
            onPlayCard={handleCardClick}
            topCard={gameState.discardPile && gameState.discardPile.length > 0 ? gameState.discardPile[gameState.discardPile.length - 1] : null}
            currentColor={gameState.currentColor}
          />
        </>
      )}

      {gameState.status === 'finished' && (
        <div className="game-finished">
          <h3>Game Over!</h3>
          {gameState.winner && (
            <p>Winner: {gameState.winner.name}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GameBoard;