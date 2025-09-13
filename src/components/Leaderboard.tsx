import React from 'react';
import { Text, Badge, ScrollArea } from '@mantine/core';
import { IconTrophy, IconClock, IconMessages } from '@tabler/icons-react';
import { LeaderboardEntry } from '../ArcadeGameApp';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  showRoom?: boolean;
  maxHeight?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  entries, 
  showRoom = false, 
  maxHeight = 400 
}) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifficultyColor = (messageCount: number) => {
    if (messageCount <= 3) return 'text-neon-pink'; // Expert
    if (messageCount <= 7) return 'text-neon-purple'; // Good
    return 'text-neon-blue'; // Beginner
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-yellow-400 text-xl">🥇</span>;
      case 1:
        return <span className="text-gray-400 text-xl">🥈</span>;
      case 2:
        return <span className="text-orange-400 text-xl">🥉</span>;
      default:
        return <span className="text-neon-blue font-pixel text-sm">#{index + 1}</span>;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <IconTrophy size={48} className="text-neon-blue mx-auto mb-4 opacity-50" />
        <Text className="font-retro text-lg text-gray-400">
          NO ENTRIES YET
        </Text>
        <Text className="font-retro text-sm text-gray-500 mt-2">
          Be the first to crack a code!
        </Text>
      </div>
    );
  }

  return (
    <ScrollArea h={maxHeight} className="pixel-border bg-dark-bg p-2">
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={`${entry.timestamp}-${entry.messageCount}`}
            className={`
              flex items-center gap-3 p-3 rounded-none border-2 transition-all duration-200
              ${index < 3 
                ? 'border-neon-pink bg-gradient-to-r from-dark-surface to-transparent neon-glow-pink' 
                : 'border-neon-blue bg-dark-surface hover:border-neon-purple'
              }
            `}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-10 text-center">
              {getRankIcon(index)}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Text className="font-pixel text-sm text-neon-blue truncate">
                  {entry.playerName.toUpperCase()}
                </Text>
                <Badge 
                  size="xs" 
                  className={`
                    font-retro text-xs px-2 py-1 border
                    ${getDifficultyColor(entry.messageCount)} 
                    ${entry.messageCount <= 3 ? 'border-neon-pink' : 
                      entry.messageCount <= 7 ? 'border-neon-purple' : 'border-neon-blue'}
                    bg-transparent
                  `}
                >
                  {entry.messageCount <= 3 ? 'EXPERT' : 
                   entry.messageCount <= 7 ? 'SKILLED' : 'ROOKIE'}
                </Badge>
              </div>

              {showRoom && (
                <Text className="font-retro text-xs text-gray-400 truncate">
                  📍 {entry.roomName}
                </Text>
              )}
            </div>

            {/* Stats */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 mb-1">
                <IconMessages size={12} className="text-neon-purple" />
                <Text className="font-retro text-xs text-neon-purple">
                  {entry.messageCount}
                </Text>
              </div>
              <div className="flex items-center gap-1">
                <IconClock size={12} className="text-gray-400" />
                <Text className="font-retro text-xs text-gray-400">
                  {formatTimestamp(entry.timestamp)}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Leaderboard;
