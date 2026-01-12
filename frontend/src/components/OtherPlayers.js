import React from 'react';

function OtherPlayers({ players, currentPlayerIndex }) {
  if (!players) return null;

  return (
    <div className="other-players">
      <h3>Players</h3>
      <div className="players-container">
        {players.map((player, index) => (
          <div
            key={player.id || index}
            className={`player-info ${currentPlayerIndex === index ? 'current-turn' : ''}`}
          >
            <div className="player-name">{player.name}</div>
            <div className="player-card-count">{player.cardCount || 0} cards</div>
            {player.unoCalled && <div className="uno-indicator">UNO!</div>}
            {currentPlayerIndex === index && (
              <div className="turn-indicator">Current turn</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OtherPlayers;