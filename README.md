# UNO Game - MERN Stack

A fully functional multiplayer UNO card game built with the MERN stack (MongoDB, Express.js, React, Node.js) and real-time communication using Socket.io.

## Features

- Real-time multiplayer gameplay
- Complete UNO rules implementation (Skip, Reverse, Draw Two, Wild cards)
- Responsive web interface
- Game room system with unique room codes
- Turn-based gameplay
- Win condition detection

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.io, MongoDB with Mongoose
- **Frontend**: React, Vite, Socket.io-client
- **Database**: MongoDB

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```
   MONGO_URI=mongodb://localhost:27017/uno
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## How to Play

1. Open the application in your browser (http://localhost:3000)
2. Create a new game or join an existing one using a room code
3. Enter your player name
4. Wait for other players to join (minimum 2 players)
5. Start the game when ready
6. Play cards by clicking on them when it's your turn
7. Use special cards according to UNO rules
8. First player to get rid of all cards wins!

## Game Rules

- Players take turns playing cards that match the color or value of the top card on the discard pile
- Special cards:
  - **Skip**: Next player loses their turn
  - **Reverse**: Reverses the direction of play
  - **Draw Two**: Next player draws 2 cards and loses their turn
  - **Wild**: Change the color to any color
  - **Wild Draw Four**: Change color and next player draws 4 cards
- If you can't play a card, draw from the deck
- Say "UNO" when you have one card left
- First to play all cards wins

## API Endpoints

- `GET /` - Health check
- `POST /api/games` - Create a new game
- `GET /api/games/:id` - Get game details

## Socket Events

### Client to Server
- `joinGame` - Join a game room
- `startGame` - Start the game (host only)
- `playCard` - Play a card
- `drawCard` - Draw a card from deck
- `chooseColor` - Choose color for wild card

### Server to Client
- `gameJoined` - Successfully joined game
- `gameStarted` - Game has started
- `gameUpdate` - Game state update
- `playerJoined` - New player joined
- `playerLeft` - Player left the game
- `gameEnded` - Game has ended with winner

## Project Structure

```
uno-game/
├── backend/
│   ├── models/
│   │   ├── Card.js
│   │   ├── Game.js
│   │   └── Player.js
│   ├── utils/
│   │   └── gameLogic.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Card.jsx
│   │   │   ├── DiscardPile.jsx
│   │   │   ├── GameBoard.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── OtherPlayers.jsx
│   │   │   └── PlayerHand.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).