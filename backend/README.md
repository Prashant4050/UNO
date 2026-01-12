# UNO Game Backend

A complete Node.js backend for an UNO card game using Express, Socket.io, and MongoDB.

## Features

- **Real-time multiplayer gameplay** using Socket.io
- **Complete UNO game logic** including all special cards (Skip, Reverse, Draw Two, Wild, Wild Draw Four)
- **Turn management** with clockwise/counterclockwise direction
- **Win condition detection**
- **MongoDB storage** for game state persistence
- **Room-based games** with unique room codes

## Models

### Card
- `color`: red, blue, yellow, green, wild
- `value`: 0-9, skip, reverse, draw2, wild, wild4
- `type`: number, action, wild

### Player
- `name`: Player's display name
- `socketId`: Socket.io connection ID
- `hand`: Array of card IDs
- `isActive`: Whether player is still in game
- `game`: Reference to current game

### Game
- `players`: Array of player IDs
- `deck`: Array of remaining card IDs
- `discardPile`: Array of played card IDs
- `currentPlayer`: ID of player whose turn it is
- `direction`: clockwise or counterclockwise
- `status`: waiting, playing, finished
- `winner`: ID of winning player
- `currentColor`: Current active color (for wild cards)
- `roomCode`: Unique 6-character room code

## API Endpoints

### POST /api/games
Create a new game room.
**Response:** `{ gameId, roomCode }`

### GET /api/games/:gameId
Get current game state.
**Response:** Game object with populated references

## Socket Events

### Client → Server

#### joinGame
Join an existing game room.
```javascript
socket.emit('joinGame', { gameId, playerName });
```

#### startGame
Start the game (requires at least 2 players).
```javascript
socket.emit('startGame', { gameId });
```

#### playCard
Play a card from hand.
```javascript
socket.emit('playCard', { gameId, cardId, chosenColor });
```

#### drawCard
Draw a card from the deck.
```javascript
socket.emit('drawCard', { gameId });
```

#### leaveGame
Leave the current game.
```javascript
socket.emit('leaveGame', { gameId });
```

### Server → Client

#### playerJoined
A new player joined the game.
```javascript
{ game, player }
```

#### gameStarted
Game has started with initial card dealing.
```javascript
{ game, players }
```

#### cardPlayed
A card was played.
```javascript
{ game, players, playedCard, playerName }
```

#### cardDrawn
A card was drawn.
```javascript
{ game, players, drawnCard, playerName }
```

#### gameWon
Game has ended with a winner.
```javascript
{ winner, gameId }
```

#### playerLeft
A player left the game.
```javascript
{ playerName, game }
```

#### error
An error occurred.
```javascript
{ message }
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB locally or update `.env` with your MongoDB URI.

3. Start the server:
```bash
npm start
# or for development
npm run dev
```

The server will run on port 5000 by default.

## Game Rules Implemented

- Standard UNO rules with all special cards
- Players must match color or value (or play wild)
- Skip: Next player loses turn
- Reverse: Changes direction of play
- Draw Two: Next player draws 2 cards and loses turn
- Wild: Player chooses new color
- Wild Draw Four: Player chooses new color, next player draws 4 cards and loses turn
- First player to empty hand wins

## Architecture

- **Express.js** for REST API
- **Socket.io** for real-time communication
- **MongoDB/Mongoose** for data persistence
- **Modular structure** with separate models and utilities
- **Room-based architecture** for multiple concurrent games