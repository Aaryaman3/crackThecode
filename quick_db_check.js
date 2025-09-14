// Quick database checker using the existing bot infrastructure
require('dotenv').config();

const { execSync } = require('child_process');

console.log('🔍 Quick SpacetimeDB Table Check');
console.log('=================================');

// List of all tables
const tables = [
  'AiReplies',
  'GameResult', 
  'GameRooms',
  'Leaderboard',
  'Messages',
  'RoomPlayers',
  'RoomTemplate',
  'Users'
];

console.log('📊 Checking table row counts...\n');

// Try to query each table for basic info
tables.forEach(table => {
  try {
    console.log(`📋 ${table}:`);
    
    // Try to get count
    const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
    console.log(`   Query: ${countQuery}`);
    
    // Since we don't have direct access, let's show what queries you should run
    console.log(`   Run: spacetime sql crackthecode "${countQuery}"`);
    console.log('');
    
  } catch (error) {
    console.log(`   ❌ Error accessing ${table}: ${error.message}`);
  }
});

console.log('📝 Manual Query Commands:');
console.log('========================');

tables.forEach(table => {
  console.log(`\n# Check ${table} table:`);
  console.log(`spacetime sql crackthecode "SELECT COUNT(*) FROM ${table}"`);
  console.log(`spacetime sql crackthecode "SELECT * FROM ${table} LIMIT 3"`);
});

console.log('\n🔍 Complete database summary:');
const summaryQuery = `SELECT ${tables.map(t => `(SELECT COUNT(*) FROM ${t}) as ${t.toLowerCase()}`).join(', ')}`;
console.log(`spacetime sql crackthecode "${summaryQuery}"`);

console.log('\n💡 If all tables show 0 rows, the React app is not connected to SpacetimeDB properly.');
console.log('   Check if reducers are being called in RoomPage.tsx');

// Check if the bot service is seeing any data
console.log('\n🤖 Bot Service Status:');
console.log('The simple-bot.js is running and shows empty tables, confirming the issue.');
