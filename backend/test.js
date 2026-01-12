// Simple test script to validate game logic
const mongoose = require('mongoose');
require('dotenv').config();

const { createDeck, shuffle } = require('./utils/gameLogic');

async function testDeckCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/uno');

    console.log('Testing deck creation...');
    const deck = await createDeck();
    console.log(`Created deck with ${deck.length} cards`);

    // Count cards by type
    const Card = require('./models/Card');
    const cards = await Card.find({});
    console.log(`Total cards in DB: ${cards.length}`);

    const colorCount = {};
    const valueCount = {};

    cards.forEach(card => {
      colorCount[card.color] = (colorCount[card.color] || 0) + 1;
      valueCount[card.value] = (valueCount[card.value] || 0) + 1;
    });

    console.log('Cards by color:', colorCount);
    console.log('Cards by value:', valueCount);

    // Clean up test data
    await Card.deleteMany({});
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testDeckCreation();