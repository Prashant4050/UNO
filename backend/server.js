const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Game = require('./models/Game');
const Player = require('./models/Player');
const Card = require('./models/Card');
const { createDeck, shuffle, dealCards, canPlayCard, handleSpecialCard, checkWinCondition, generateRoomCode, drawCardForPlayer, getNextPlayerIndex } = require('./utils/gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uno', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.send('UNO Game Backend');
});

// Create new game
app.post('/api/games', async (req, res) => {
  try {
    const roomCode = generateRoomCode();
    const deck = await createDeck();
    shuffle(deck);

    const game = new Game({
      deck: deck,
      roomCode: roomCode
    });

    await game.save();
    res.json({ gameId: game._id, roomCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game state
app.get('/api/games/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId)
      .populate('players')
      .populate('currentPlayer')
      .populate('discardPile')
      .populate('winner');

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io logic for game
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join game room
  socket.on('joinGame', async (data) => {
    try {
      const { gameId, playerName } = data;
      console.log('Join game request:', { gameId, playerName });

      // Try to find game by _id first, then by roomCode
      let game = await Game.findById(gameId);
      if (!game) {
        game = await Game.findOne({ roomCode: gameId });
      }

      if (!game) {
        console.log('Game not found:', gameId);
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      console.log('Found game:', game._id, 'roomCode:', game.roomCode);

      if (game.status !== 'waiting') {
        socket.emit('error', { message: 'Game already started' });
        return;
      }

      if (game.players.length >= 4) {
        socket.emit('error', { message: 'Game is full' });
        return;
      }

      // Create player
      const player = new Player({
        name: playerName,
        socketId: socket.id,
        game: game._id
      });
      await player.save();

      // Add player to game
      game.players.push(player._id);
      await game.save();

      // Join socket room
      socket.join(game.roomCode);
      console.log('Player joined room:', game.roomCode);

      // Send updated game state to all players
      const updatedGame = await Game.findById(game._id).populate('players');
      io.to(game.roomCode).emit('playerJoined', {
        game: updatedGame,
        player: player
      });

      socket.emit('joinedGame', {
        game: updatedGame,
        player: player
      });

    } catch (error) {
      console.error('Join game error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Start game
  socket.on('startGame', async (data) => {
    try {
      const { gameId } = data;

      const game = await Game.findById(gameId).populate('players');
      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (game.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }

      // Shuffle deck
      shuffle(game.deck);
      await game.save();

      // Deal cards
      await dealCards(gameId, game.players.map(p => p._id));

      // Set current player
      const updatedGame = await Game.findById(gameId).populate('players').populate('discardPile');
      updatedGame.currentPlayer = updatedGame.players[0]._id;
      updatedGame.status = 'playing';
      await updatedGame.save();

      // Get all players with populated hands
      const players = await Player.find({ game: gameId }).populate('hand');

      io.to(updatedGame.roomCode).emit('gameStarted', {
        game: updatedGame,
        players: players
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Play card
  socket.on('playCard', async (data) => {
    try {
      const { gameId, cardId, chosenColor } = data;
      console.log('Play card request:', { gameId, cardId, chosenColor });

      // Try to find game by _id first, then by roomCode
      let game = await Game.findById(gameId);
      if (!game) {
        game = await Game.findOne({ roomCode: gameId });
      }

      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      const player = await Player.findOne({ socketId: socket.id }).populate('hand');
      const card = await Card.findById(cardId);

      if (!game || !player || !card) {
        socket.emit('error', { message: 'Invalid game, player, or card' });
        return;
      }

      if (game.currentPlayer.toString() !== player._id.toString()) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Check if card is in player's hand
      if (!player.hand.some(c => c._id.toString() === cardId)) {
        socket.emit('error', { message: 'Card not in your hand' });
        return;
      }

      // Check if card can be played
      if (!(await canPlayCard(card, game))) {
        socket.emit('error', { message: 'Cannot play this card' });
        return;
      }

      // Remove card from player's hand
      player.hand = player.hand.filter(c => c._id.toString() !== cardId);
      await player.save();

      // Add card to discard pile
      game.discardPile.push(cardId);

      // Handle wild card color choice
      if (card.color === 'wild' && chosenColor) {
        game.currentColor = chosenColor;
      } else if (card.color !== 'wild') {
        game.currentColor = card.color;
      }

      await game.save();

      // Handle special card effects
      await handleSpecialCard(card, game, io);

      // Check win condition
      const hasWon = await checkWinCondition(player._id, gameId, io);
      if (!hasWon) {
        // Get updated game state
        const updatedGame = await Game.findById(game._id).populate('players').populate('discardPile').populate('currentPlayer');
        const players = await Player.find({ game: game._id }).populate('hand');

        console.log('Emitting cardPlayed for player:', player.name, 'card:', card.value);
        io.to(game.roomCode).emit('cardPlayed', {
          game: updatedGame,
          players: players,
          playedCard: card,
          playerName: player.name
        });
      }

    } catch (error) {
      console.error('Play card error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  // Draw card
  socket.on('drawCard', async (data) => {
    try {
      const { gameId } = data;

      // Try to find game by _id first, then by roomCode
      let game = await Game.findById(gameId);
      if (!game) {
        game = await Game.findOne({ roomCode: gameId });
      }

      const player = await Player.findOne({ socketId: socket.id });

      if (!game || !player) {
        socket.emit('error', { message: 'Invalid game or player' });
        return;
      }

      if (game.currentPlayer.toString() !== player._id.toString()) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Draw card
      await drawCardForPlayer(game, player);
      await player.save();
      await game.save();

      // Advance to next player
      const currentPlayerIndex = game.players.findIndex(p => p.toString() === game.currentPlayer.toString());
      const nextPlayerIndex = getNextPlayerIndex(game, currentPlayerIndex);
      game.currentPlayer = game.players[nextPlayerIndex];
      await game.save();

      // Send updated state
      const updatedGame = await Game.findById(game._id).populate('players').populate('discardPile').populate('currentPlayer');
      const updatedPlayers = await Player.find({ game: game._id }).populate('hand');

      io.to(game.roomCode).emit('cardDrawn', {
        game: updatedGame,
        players: updatedPlayers,
      });

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Leave game
  socket.on('leaveGame', async (data) => {
    try {
      const { gameId } = data;

      const player = await Player.findOne({ socketId: socket.id });
      if (!player) return;

      const game = await Game.findById(gameId);
      if (game) {
        // Remove player from game
        game.players = game.players.filter(p => p.toString() !== player._id.toString());
        await game.save();

        // If game becomes empty or has only one player, end it
        if (game.players.length < 2 && game.status === 'playing') {
          game.status = 'finished';
          await game.save();
        }

        // Notify other players
        socket.to(game.roomCode).emit('playerLeft', {
          playerName: player.name,
          game: game
        });
      }

      // Remove player
      await Player.findByIdAndDelete(player._id);

      socket.leave(game.roomCode);

    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    try {
      const player = await Player.findOne({ socketId: socket.id });
      if (player) {
        const game = await Game.findById(player.game);
        if (game) {
          // Remove player from game
          game.players = game.players.filter(p => p.toString() !== player._id.toString());
          await game.save();

          // If game becomes empty or has only one player, end it
          if (game.players.length < 2 && game.status === 'playing') {
            game.status = 'finished';
            await game.save();
          }

          // Notify other players
          socket.to(game.roomCode).emit('playerLeft', {
            playerName: player.name,
            game: game
          });
        }

        // Remove player
        await Player.findByIdAndDelete(player._id);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});