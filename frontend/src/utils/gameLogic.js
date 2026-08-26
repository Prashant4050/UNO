// Game logic utilities for UNO

export const COLORS = ['red', 'blue', 'green', 'yellow'];
export const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
export const WILD_VALUES = ['wild', 'wild4'];

export function createDeck() {
  const deck = [];
  COLORS.forEach(color => {
    VALUES.forEach(value => {
      if (value === '0') {
        deck.push({ color, value, id: `${color}-${value}` });
      } else {
        for (let i = 0; i < 2; i++) {
          deck.push({ color, value, id: `${color}-${value}-${i}` });
        }
      }
    });
  });
  WILD_VALUES.forEach(value => {
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'wild', value, id: `${value}-${i}` });
    }
  });
  return deck;
}

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function canPlayCard(card, topCard, currentColor = topCard?.color) {
  if (!card || !topCard) return false;
  if (card.color === 'wild') return true;
  if (card.color === currentColor || card.value === topCard.value) return true;
  return false;
}

export function dealCards(deck, numPlayers, cardsPerPlayer = 7) {
  const hands = [];
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.splice(0, cardsPerPlayer));
  }
  return hands;
}

export function getPlayableCards(hand, topCard, currentColor) {
  return hand.filter(card => canPlayCard(card, topCard, currentColor));
}

export function aiPlayCard(hand, topCard, currentColor) {
  const playable = getPlayableCards(hand, topCard, currentColor);
  if (playable.length > 0) {
    // Simple AI: play first playable card
    return playable[0];
  }
  return null; // Draw card
}

export function chooseColor(hand) {
  return COLORS.reduce((bestColor, color) => {
    const count = hand.filter(card => card.color === color).length;
    const bestCount = hand.filter(card => card.color === bestColor).length;
    return count > bestCount ? color : bestColor;
  }, COLORS[0]);
}

export function applySpecialCard(card, gameState) {
  const newState = { ...gameState };

  if (card.value === 'skip') {
    newState.currentPlayer = (newState.currentPlayer + 1) % newState.players.length;
  } else if (card.value === 'reverse') {
    newState.direction *= -1;
  } else if (card.value === 'draw2') {
    const nextPlayer = (newState.currentPlayer + newState.direction + newState.players.length) % newState.players.length;
    const drawCards = newState.drawPile.splice(0, 2);
    newState.hands[nextPlayer].push(...drawCards);
    newState.currentPlayer = nextPlayer;
  } else if (card.value === 'wild4') {
    const nextPlayer = (newState.currentPlayer + newState.direction + newState.players.length) % newState.players.length;
    const drawCards = newState.drawPile.splice(0, 4);
    newState.hands[nextPlayer].push(...drawCards);
    newState.currentPlayer = nextPlayer;
  }

  return newState;
}

export function checkWinCondition(hands) {
  return hands.findIndex(hand => hand.length === 0);
}

export function initializeGame(playerName) {
  const deck = createDeck();
  shuffle(deck);

  const hands = dealCards(deck, 2, 7); // 2 players: human and computer

  // Find first non-wild card for discard pile
  let firstCardIndex = 0;
  while (deck[firstCardIndex].color === 'wild') {
    firstCardIndex++;
  }
  const firstCard = deck.splice(firstCardIndex, 1)[0];

  return {
    players: [
      { name: playerName, id: 'human' },
      { name: 'Computer', id: 'computer' }
    ],
    hands,
    drawPile: deck,
    discardPile: [firstCard],
    currentPlayer: 0, // 0 = human, 1 = computer
    direction: 1,
    status: 'playing',
    winner: null,
    currentColor: firstCard.color,
    unoCalled: [false, false] // Track if players called UNO
  };
}