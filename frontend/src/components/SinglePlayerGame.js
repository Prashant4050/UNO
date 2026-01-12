import React, { useState, useEffect, useCallback } from 'react';
import PlayerHand from './PlayerHand';
import OtherPlayers from './OtherPlayers';
import DiscardPile from './DiscardPile';
import {
  canPlayCard,
  aiPlayCard,
  applySpecialCard,
  checkWinCondition,
  initializeGame,
  shuffle
} from '../utils/gameLogic';

function SinglePlayerGame({ playerName, onLeaveGame }) {
  const [gameState, setGameState] = useState(() => initializeGame(playerName));
  const [chosenColor, setChosenColor] = useState(null);
  const [message, setMessage] = useState('');
  const [unoCalled, setUnoCalled] = useState([false, false]);

  const isHumanTurn = gameState.currentPlayer === 0;
  const humanHand = gameState.hands[0];
  const computerHand = gameState.hands[1];
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  const callUno = () => {
    if (humanHand.length === 2 && !unoCalled[0]) {
      setUnoCalled(prev => [true, prev[1]]);
      setMessage('UNO called!');
    }
  };

  const playCard = useCallback((cardId, selectedColor = null) => {
    const currentHand = isHumanTurn ? humanHand : computerHand;
    const cardIndex = currentHand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;

    const card = currentHand[cardIndex];

    if (!canPlayCard(card, topCard) && card.color !== 'wild') {
      setMessage('Cannot play that card!');
      return;
    }

    // Check UNO before playing
    const newHandSize = currentHand.length - 1;
    if (newHandSize === 1 && !unoCalled[gameState.currentPlayer]) {
      // Penalty: draw 2 cards
      if (gameState.drawPile.length < 2) {
        // Reshuffle if needed
        const reshuffle = shuffle([...gameState.discardPile.slice(0, -1)]);
        setGameState(prev => ({
          ...prev,
          drawPile: reshuffle,
          discardPile: [prev.discardPile[prev.discardPile.length - 1]]
        }));
      }
      const penaltyCards = gameState.drawPile.slice(0, 2);
      const newHands = [...gameState.hands];
      newHands[gameState.currentPlayer].push(...penaltyCards);
      setGameState(prev => ({
        ...prev,
        hands: newHands,
        drawPile: prev.drawPile.slice(2)
      }));
      setMessage('Forgot to call UNO! Draw 2 penalty cards.');
      return;
    }

    // Remove card from hand
    const newHands = [...gameState.hands];
    newHands[gameState.currentPlayer] = newHands[gameState.currentPlayer].filter(c => c.id !== cardId);

    // Add to discard pile
    const newDiscardPile = [...gameState.discardPile, card];

    let newState = {
      ...gameState,
      hands: newHands,
      discardPile: newDiscardPile,
      currentColor: card.color === 'wild' ? (selectedColor || 'red') : card.color
    };

    // Reset UNO called for next player
    const newUnoCalled = [...unoCalled];
    newUnoCalled[gameState.currentPlayer] = false;
    setUnoCalled(newUnoCalled);

    // Apply special card effects
    newState = applySpecialCard(card, newState);

    // Check win condition
    const winnerIndex = checkWinCondition(newState.hands);
    if (winnerIndex !== -1) {
      newState.status = 'finished';
      newState.winner = newState.players[winnerIndex];
    } else {
      // Next player
      newState.currentPlayer = (newState.currentPlayer + newState.direction + newState.players.length) % newState.players.length;
    }

    setGameState(newState);
    setChosenColor(null);
    setMessage('');
  }, [gameState, humanHand, computerHand, topCard, isHumanTurn, unoCalled]);

  const drawCard = useCallback(() => {
    if (gameState.drawPile.length === 0) {
      // Reshuffle discard pile (except top card)
      const newDrawPile = shuffle([...gameState.discardPile.slice(0, -1)]);
      setGameState(prev => ({
        ...prev,
        drawPile: newDrawPile,
        discardPile: [prev.discardPile[prev.discardPile.length - 1]]
      }));
      return;
    }

    const drawnCard = gameState.drawPile[0];
    const newHands = [...gameState.hands];
    newHands[gameState.currentPlayer].push(drawnCard);

    const newState = {
      ...gameState,
      hands: newHands,
      drawPile: gameState.drawPile.slice(1),
      currentPlayer: (gameState.currentPlayer + gameState.direction + gameState.players.length) % gameState.players.length
    };

    setGameState(newState);
    setMessage('Drew a card');
  }, [gameState]);

  const computerTurn = useCallback(() => {
    // Auto-call UNO if computer has 1 card
    if (computerHand.length === 1 && !unoCalled[1]) {
      setUnoCalled(prev => [prev[0], true]);
    }

    const aiCard = aiPlayCard(computerHand, topCard);
    if (aiCard) {
      playCard(aiCard.id, null);
    } else {
      drawCard();
    }
  }, [computerHand, topCard, playCard, drawCard, unoCalled]);

  useEffect(() => {
    if (!isHumanTurn && gameState.status === 'playing') {
      // Computer's turn
      setTimeout(() => {
        computerTurn();
      }, 1000); // Delay for better UX
    }
  }, [gameState.currentPlayer, gameState.status, isHumanTurn, computerTurn]);

  const handlePlayCard = (cardId) => {
    if (!isHumanTurn) return;
    playCard(cardId, chosenColor);
  };

  const handleColorChoice = (color) => {
    setChosenColor(color);
  };

  if (gameState.status === 'finished') {
    return (
      <div className="game-finished">
        <h2>Game Over!</h2>
        <p>{gameState.winner.name} wins!</p>
        <button onClick={onLeaveGame} className="leave-button">Back to Lobby</button>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Single Player UNO</h2>
        <div className="game-info">
          <span>Current Player: {gameState.players[gameState.currentPlayer].name}</span>
          <span>Current Color: {gameState.currentColor}</span>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <OtherPlayers
        players={gameState.players.map((player, index) => ({
          ...player,
          cardCount: gameState.hands[index].length,
          unoCalled: unoCalled[index]
        }))}
        currentPlayerIndex={gameState.currentPlayer}
      />

      <DiscardPile topCard={topCard} />

      <div className="game-controls">
        {isHumanTurn && (
          <>
            <button onClick={drawCard} className="draw-button">Draw Card</button>
            {humanHand.length === 2 && !unoCalled[0] && (
              <button onClick={callUno} className="uno-button">Call UNO!</button>
            )}
            {chosenColor && (
              <div className="color-selection">
                <p>Choose color:</p>
                {['red', 'blue', 'green', 'yellow'].map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorChoice(color)}
                    className={`color-button ${color}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <PlayerHand
        cards={humanHand}
        isCurrentPlayer={isHumanTurn}
        onPlayCard={handlePlayCard}
        topCard={topCard}
      />

      <button onClick={onLeaveGame} className="leave-button">Leave Game</button>
    </div>
  );
}

export default SinglePlayerGame;