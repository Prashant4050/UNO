import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import SinglePlayerGame from './components/SinglePlayerGame';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [currentView, setCurrentView] = useState('lobby'); // 'lobby' or 'game' or 'single-player'
  const [error, setError] = useState(null);
  const [lastPlayerName, setLastPlayerName] = useState(null);

  useEffect(() => {
    // Socket event listeners
    socket.on('joinedGame', (data) => {
      console.log('Joined game:', data);
      setGameState(data.game);
      setPlayer(data.player);
      setCurrentView('game');
      setError(null);
    });

    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      setGameState(data.game);
    });

    socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setGameState(data.game);
      // Update player state with hand
      if (data.players) {
        const currentPlayerData = data.players.find(p => p.socketId === socket.id);
        if (currentPlayerData) {
          setPlayer(currentPlayerData);
        }
      }
    });

    socket.on('cardPlayed', (data) => {
      console.log('Card played:', data);
      setGameState(data.game);
      // Update player state if this client is the one who played
      if (data.players) {
        const currentPlayerData = data.players.find(p => p.socketId === socket.id);
        if (currentPlayerData) {
          setPlayer(currentPlayerData);
        }
      }
      // Store last player name
      if (data.playerName) {
        setLastPlayerName(data.playerName);
      }
    });

    socket.on('cardDrawn', (data) => {
      console.log('Card drawn:', data);
      setGameState(data.game);
      // Update player state if this client is the one who drew
      if (data.players) {
        const currentPlayerData = data.players.find(p => p.socketId === socket.id);
        if (currentPlayerData) {
          setPlayer(currentPlayerData);
        }
      }
    });

    socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      setGameState(data.game);
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message);
    });

    return () => {
      socket.off('joinedGame');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('cardPlayed');
      socket.off('cardDrawn');
      socket.off('playerLeft');
      socket.off('error');
    };
  }, []);

  const joinGame = (gameId, playerName) => {
    socket.emit('joinGame', { gameId, playerName });
  };

  const startGame = () => {
    if (gameState) {
      socket.emit('startGame', { gameId: gameState._id });
    }
  };

  const playCard = (cardId, chosenColor = null) => {
    if (gameState) {
      socket.emit('playCard', { gameId: gameState._id, cardId, chosenColor });
    }
  };

  const drawCard = () => {
    if (gameState) {
      socket.emit('drawCard', { gameId: gameState._id });
    }
  };

  const createGame = async (playerName) => {
    try {
      const response = await fetch('http://localhost:5000/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      joinGame(data.gameId, playerName);
    } catch (error) {
      setError('Failed to create game. Please try again.');
    }
  };

  const startSinglePlayer = (playerName) => {
    setPlayer({ name: playerName });
    setCurrentView('single-player');
    setLastPlayerName(null); // Reset for new game
  };

  const startMultiplayer = (playerName) => {
    setLastPlayerName(null); // Reset for new game
    createGame(playerName);
  };

  const leaveGame = () => {
    if (gameState && currentView !== 'single-player') {
      socket.emit('leaveGame', { gameId: gameState._id });
    }
    setGameState(null);
    setPlayer(null);
    setCurrentView('lobby');
    setLastPlayerName(null); // Reset last player name
  };

  return (
    <div className="app">
      <h1>UNO Game</h1>
      {error && <div className="error">{error}</div>}
      {currentView === 'lobby' ? (
        <Lobby onSinglePlayer={startSinglePlayer} onMultiplayer={startMultiplayer} />
      ) : currentView === 'single-player' ? (
        <SinglePlayerGame playerName={player.name} onLeaveGame={leaveGame} />
      ) : (
        <GameBoard
          gameState={gameState}
          player={player}
          onStartGame={startGame}
          onPlayCard={playCard}
          onDrawCard={drawCard}
          onLeaveGame={leaveGame}
          lastPlayerName={lastPlayerName}
        />
      )}
    </div>
  );
}

export default App;