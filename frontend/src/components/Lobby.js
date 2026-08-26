import React, { useState } from 'react';

function Lobby({ onSinglePlayer, onMultiplayer, multiplayerMode, onBack, onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleSinglePlayer = () => {
    if (playerName.trim()) {
      onSinglePlayer(playerName.trim());
    }
  };

  const handleCreateRoom = () => {
    if (playerName.trim()) onCreateRoom(playerName.trim());
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (multiplayerMode) {
    return (
      <div className="lobby">
        <h2>Multiplayer</h2>
        <div className="form-group">
          <label htmlFor="multiplayerPlayerName">Enter Your Name:</label>
          <input
            type="text"
            id="multiplayerPlayerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="roomCode">Room Code:</label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code to join"
            maxLength={6}
          />
        </div>
        <div className="game-options">
          <button onClick={handleCreateRoom} className="multiplayer-button" disabled={!playerName.trim()}>
            Create Room
          </button>
          <button onClick={handleJoinRoom} className="multiplayer-button" disabled={!playerName.trim() || !roomCode.trim()}>
            Join Room
          </button>
        </div>
        <button onClick={onBack} className="leave-button">Back</button>
      </div>
    );
  }

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
        <button onClick={onMultiplayer} className="multiplayer-button">
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