const Card = require('../models/Card');
const Game = require('../models/Game');
const Player = require('../models/Player');

// Create a standard UNO deck
async function createDeck() {
  const colors = ['red', 'blue', 'yellow', 'green'];
  const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
  const deck = [];

  // Create colored cards
  for (const color of colors) {
    for (const value of values) {
      const type = isNaN(value) ? 'action' : 'number';
      const card = new Card({ color, value, type });
      await card.save();
      deck.push(card._id);

      // Add second copy of each card except '0'
      if (value !== '0') {
        const card2 = new Card({ color, value, type });
        await card2.save();
        deck.push(card2._id);
      }
    }
  }

  // Create wild cards
  for (let i = 0; i < 4; i++) {
    const wildCard = new Card({ color: 'wild', value: 'wild', type: 'wild' });
    await wildCard.save();
    deck.push(wildCard._id);

    const wild4Card = new Card({ color: 'wild', value: 'wild4', type: 'wild' });
    await wild4Card.save();
    deck.push(wild4Card._id);
  }

  return deck;
}

// Shuffle array using Fisher-Yates algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Deal cards to players
async function dealCards(gameId, playerIds) {
  const game = await Game.findById(gameId).populate('deck');
  if (!game) return;

  const numPlayers = playerIds.length;
  const cardsPerPlayer = numPlayers <= 4 ? 7 : 5;

  for (const playerId of playerIds) {
    const player = await Player.findById(playerId);
    if (!player) continue;

    for (let i = 0; i < cardsPerPlayer; i++) {
      if (game.deck.length === 0) break;
      const cardId = game.deck.pop();
      player.hand.push(cardId);
      await player.save();
    }
  }

  // Set first card on discard pile
  if (game.deck.length > 0) {
    const firstCard = game.deck.pop();
    game.discardPile.push(firstCard);
    const card = await Card.findById(firstCard);
    if (card.color !== 'wild') {
      game.currentColor = card.color;
    }
  }

  await game.save();
}

// Check if a card can be played
async function canPlayCard(card, game) {
  if (card.color === 'wild') return true;
  if (card.color === game.currentColor) return true;

  // Get the top card from discard pile
  if (game.discardPile.length > 0) {
    const topCard = await Card.findById(game.discardPile[game.discardPile.length - 1]);
    if (card.value === topCard.value || card.color === topCard.color) return true;
  }

  return false;
}

// Handle special card effects
async function handleSpecialCard(card, game, io) {
  const players = await Player.find({ game: game._id }).populate('hand');
  const currentPlayerIndex = game.players.findIndex(p => p.toString() === game.currentPlayer.toString());
  let nextPlayerIndex;

  switch (card.value) {
    case 'skip':
      // Skip next player
      nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      break;

    case 'reverse':
      // Reverse direction
      game.direction = game.direction === 'clockwise' ? 'counterclockwise' : 'clockwise';
      nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      break;

    case 'draw2':
      // Next player draws 2 cards
      nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      const drawPlayer = await Player.findById(game.players[nextPlayerIndex]);
      for (let i = 0; i < 2; i++) {
        await drawCardForPlayer(game, drawPlayer);
      }
      await drawPlayer.save();
      // Skip the next player
      nextPlayerIndex = getNextPlayerIndex(game, nextPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      break;

    case 'wild4':
      // Next player draws 4 cards
      nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      const draw4Player = await Player.findById(game.players[nextPlayerIndex]);
      for (let i = 0; i < 4; i++) {
        await drawCardForPlayer(game, draw4Player);
      }
      await draw4Player.save();
      // Skip the next player
      nextPlayerIndex = getNextPlayerIndex(game, nextPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      break;

    default:
      // Normal card, just advance to next player
      nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      break;
  }

  await game.save();
}

// Helper function to draw a card for a player, reshuffling if necessary
async function drawCardForPlayer(game, player) {
  if (game.deck.length === 0) {
    // Reshuffle discard pile (except top card) into deck
    if (game.discardPile.length > 1) {
      const topCard = game.discardPile.pop();
      game.deck = [...game.discardPile];
      game.discardPile = [topCard];
      shuffle(game.deck);
    }
  }

  if (game.deck.length > 0) {
    const cardId = game.deck.pop();
    player.hand.push(cardId);
  }
}

// Get next player index based on direction
function getNextPlayerIndex(game, currentIndex) {
  const numPlayers = game.players.length;
  let nextIndex;

  if (game.direction === 'clockwise') {
    nextIndex = (currentIndex + 1) % numPlayers;
  } else {
    nextIndex = (currentIndex - 1 + numPlayers) % numPlayers;
  }

  return nextIndex;
}

// Check win condition
async function checkWinCondition(playerId, gameId, io) {
  const player = await Player.findById(playerId).populate('hand');
  if (player.hand.length === 0) {
    const game = await Game.findById(gameId);
    game.status = 'finished';
    game.winner = playerId;
    await game.save();

    io.to(game.roomCode).emit('gameWon', {
      winner: player.name,
      gameId: game._id
    });

    return true;
  }
  return false;
}

// Generate unique room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  createDeck,
  shuffle,
  dealCards,
  canPlayCard,
  handleSpecialCard,
  checkWinCondition,
  generateRoomCode,
  drawCardForPlayer,
  getNextPlayerIndex
};