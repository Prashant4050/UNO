# UNO Game

A browser-based UNO game with single-player and real-time multiplayer modes.
The multiplayer server uses Express, Socket.IO, MongoDB, and Mongoose. The
frontend is a Create React App application.

## Features

- Single-player mode against a computer opponent
- Multiplayer rooms for 2 to 4 players
- Real-time turns using Socket.IO
- Number cards and Skip, Reverse, Draw Two, Wild, and Wild Draw Four cards
- Color selection for Wild and Wild Draw Four cards
- UNO call and penalty handling
- Draw-pile reshuffling when cards run out
- Discard-pile and current-color display

## Requirements

- Node.js 14 or newer
- npm
- MongoDB running locally or a MongoDB connection string

## Setup

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create or update `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/uno
PORT=5000
```

## Run the Game

Start MongoDB, then run the backend in one terminal:

```bash
cd backend
npm start
```

Run the React frontend in a second terminal:

```bash
cd frontend
npm start
```

Open the URL shown by React, normally [http://localhost:3000](http://localhost:3000).
If port 3000 is busy, React may use another port. The frontend expects the
backend at `http://localhost:5000`.

For backend development with automatic restart:

```bash
cd backend
npm run dev
```

## How to Play

1. Enter a player name.
2. Select **Single Player** or **Multiplayer**.
3. In multiplayer mode, create a room and wait for at least one other player.
4. Start the game when the waiting room allows it.
5. On your turn, play a card matching the current color or card value, or draw.
6. Select a color after playing a Wild or Wild Draw Four card.
7. Call UNO when you have two cards before playing down to one card.
8. The first player with no cards wins.

## UNO Rules

- **Skip** skips the next player.
- **Reverse** changes the direction of play.
- **Draw Two** makes the next player draw two cards and lose their turn.
- **Wild** changes the active color.
- **Wild Draw Four** changes the active color, makes the next player draw four
  cards, and skips that player.

## Backend API

- `GET /` - Server health check
- `POST /api/games` - Creates a game and returns `{ gameId, roomCode }`
- `GET /api/games/:gameId` - Returns a populated game state

## Socket Events

### Client to Server

- `joinGame` - Join a game using its ID or room code
- `startGame` - Start a waiting game
- `playCard` - Play a card, including `chosenColor` for wild cards
- `drawCard` - Draw a card and advance the turn
- `leaveGame` - Leave the current game

### Server to Client

- `playerJoined` - A player joined the room
- `joinedGame` - The current client joined successfully
- `gameStarted` - Cards were dealt and the game started
- `cardPlayed` - A card was played and state changed
- `cardDrawn` - A card was drawn and state changed
- `gameWon` - A player won
- `playerLeft` - A player left the room
- `error` - An operation failed and includes a `message`

## Project Structure

```text
UNO/
├── backend/
│   ├── models/
│   ├── utils/gameLogic.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/components/
│   ├── src/utils/gameLogic.js
│   ├── src/App.js
│   └── package.json
└── README.md
```

## Validation

Build the frontend:

```bash
npm --prefix frontend run build
```

Run the backend database/deck test:

```bash
npm --prefix backend test
```
