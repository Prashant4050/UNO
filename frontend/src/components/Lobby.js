import React, { useState } from 'react';

function Lobby({ onSinglePlayer, onMultiplayer }) {
  const [playerName, setPlayerName] = useState('');

  const handleSinglePlayer = () => {
    if (playerName.trim()) {
      onSinglePlayer(playerName.trim());
    }
  };

  const handleMultiplayer = () => {
    if (playerName.trim()) {
      onMultiplayer(playerName.trim());
    }
  };

  return (
    <div className="lobby">
      <h2>Welcome to UNO</h2>
      <div className="form-group">
        <label htmlFor="playerName">Enter Your Name:</label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>
      <div className="game-options">
        <button onClick={handleSinglePlayer} className="single-player-button" disabled={!playerName.trim()}>
          Single Player
        </button>
        <button onClick={handleMultiplayer} className="multiplayer-button" disabled={!playerName.trim()}>
          Multiplayer
        </button>
      </div>
      <p className="instructions">
        Choose your game mode to start playing!
      </p>
    </div>
  );
}

export default Lobby;