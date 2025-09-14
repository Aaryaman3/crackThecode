#!/bin/bash

echo "🔍 SPACETIMEDB LOAD ANALYSIS"
echo "============================"
echo ""

# Check if spacetime CLI is available
if ! command -v spacetime &> /dev/null; then
    echo "❌ SpacetimeDB CLI not found. Please install it first."
    exit 1
fi

echo "📊 Current Database Statistics:"
echo "------------------------------"

echo "👥 Total Users:"
spacetime sql crackthecode "SELECT COUNT(*) as total_users FROM users" 2>/dev/null || echo "❌ Could not query users table"

echo ""
echo "💬 Total Messages:"
spacetime sql crackthecode "SELECT COUNT(*) as total_messages FROM messages" 2>/dev/null || echo "❌ Could not query messages table"

echo ""
echo "🏆 Leaderboard Entries:"
spacetime sql crackthecode "SELECT COUNT(*) as total_entries FROM leaderboard" 2>/dev/null || echo "❌ Could not query leaderboard table"

echo ""
echo "🏠 Active Game Rooms:"
spacetime sql crackthecode "SELECT COUNT(*) as active_rooms FROM game_rooms" 2>/dev/null || echo "❌ Could not query game_rooms table"

echo ""
echo "👥 Room Players:"
spacetime sql crackthecode "SELECT COUNT(*) as room_players FROM room_players" 2>/dev/null || echo "❌ Could not query room_players table"

echo ""
echo "🤖 AI Replies:"
spacetime sql crackthecode "SELECT COUNT(*) as ai_replies FROM ai_replies" 2>/dev/null || echo "❌ Could not query ai_replies table"

echo ""
echo "📈 Recent Activity (Last 10 Messages):"
echo "---------------------------------------"
spacetime sql crackthecode "SELECT sender, content, timestamp FROM messages ORDER BY timestamp DESC LIMIT 10" 2>/dev/null || echo "❌ Could not query recent messages"

echo ""
echo "🏆 Current Leaderboard (Top 5):"
echo "--------------------------------"
spacetime sql crackthecode "SELECT player_name, score, completion_time FROM leaderboard ORDER BY score DESC LIMIT 5" 2>/dev/null || echo "❌ Could not query leaderboard"

echo ""
echo "🎯 Template Usage:"
echo "------------------"
spacetime sql crackthecode "SELECT template_id, COUNT(*) as usage_count FROM game_rooms GROUP BY template_id ORDER BY usage_count DESC" 2>/dev/null || echo "❌ Could not query template usage"

echo ""
echo "⚡ Performance Metrics:"
echo "----------------------"
echo "Database: crackthecode"
echo "Server: maincloud.spacetimedb.com"
echo "Status: $(spacetime status 2>/dev/null || echo 'Unknown')"

echo ""
echo "✅ Load check complete!"
