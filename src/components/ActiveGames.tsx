import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Text, 
  Button, 
  Title,
  Group,
  Badge,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { IconEye, IconUsers, IconClock, IconRefresh, IconLock, IconWorld } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template } from '../ArcadeGameApp';

export interface ActiveGame {
  id: string;
  roomId: string;
  template: Template;
  hostName: string;
  isPublic: boolean;
  spectatorCount: number;
  duration: number; // in seconds
  lastActivity: Date;
  status: 'active' | 'paused' | 'completed';
  messageCount: number;
}

interface ActiveGamesProps {
  onWatchGame: (game: ActiveGame) => void;
  onRefresh?: () => void;
}

const ActiveGames: React.FC<ActiveGamesProps> = ({
  onWatchGame,
  onRefresh,
}) => {
  const [activeGames, setActiveGames] = useState<ActiveGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate demo active games
  const generateDemoGames = (): ActiveGame[] => {
    const demoTemplates: Template[] = [
      {
        id: 'bank-assistant',
        name: 'CYBER BANK',
        tagline: 'Break into the digital vault',
        secretCode: 'ADMIN_OVERRIDE_2024',
        iconUrl: '🏦',
        published: true,
        createdBy: 'System',
        difficulty: 'medium',
      },
      {
        id: 'ai-support',
        name: 'AI HELPDESK',
        tagline: 'Outsmart the customer service bot',
        secretCode: 'SUPPORT_MASTER_KEY',
        iconUrl: '🤖',
        published: true,
        createdBy: 'System',
        difficulty: 'easy',
      },
      {
        id: 'secure-corp',
        name: 'SECURECORP',
        tagline: 'Infiltrate the corporate network',
        secretCode: 'EXEC_BACKDOOR_2024',
        iconUrl: '🏢',
        published: true,
        createdBy: 'System',
        difficulty: 'hard',
      },
    ];

    const playerNames = ['CyberNinja', 'HackMaster', 'CodeBreaker', 'QuantumHacker', 'NoobSlayer', 'EliteUser', 'PhantomCoder'];
    
    return demoTemplates.map((template, index) => ({
      id: `game-${index + 1}`,
      roomId: `room-${index + 1}`,
      template,
      hostName: playerNames[Math.floor(Math.random() * playerNames.length)],
      isPublic: Math.random() > 0.3, // 70% public games
      spectatorCount: Math.floor(Math.random() * 12) + 1,
      duration: Math.floor(Math.random() * 600) + 30, // 30 seconds to 10 minutes
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30000)), // Last 30 seconds
      status: Math.random() > 0.1 ? 'active' : 'paused' as 'active' | 'paused',
      messageCount: Math.floor(Math.random() * 25) + 5,
    })).filter(game => game.isPublic); // Only show public games
  };

  useEffect(() => {
    // Initialize with demo games
    setActiveGames(generateDemoGames());

    // Update games periodically
    const interval = setInterval(() => {
      setActiveGames(prev => prev.map(game => ({
        ...game,
        spectatorCount: Math.max(1, game.spectatorCount + (Math.random() > 0.5 ? 1 : -1)),
        duration: game.duration + 10,
        lastActivity: Math.random() > 0.7 ? new Date() : game.lastActivity,
        messageCount: game.messageCount + (Math.random() > 0.6 ? 1 : 0),
      })));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveGames(generateDemoGames());
      setIsLoading(false);
      onRefresh?.();
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLastActivityText = (lastActivity: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    const minutes = Math.floor(diff / 60);
    return `${minutes}m ago`;
  };

  return (
    <Card className="retro-card neon-glow-green h-full">
      <Group justify="space-between" className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
            <IconWorld size={20} className="text-neon-green" />
          </div>
          <div>
            <Title order={3} className="font-heading text-neon-green">
              LIVE GAMES
            </Title>
            <Text size="xs" className="text-gray-400">
              {activeGames.length} public games active
            </Text>
          </div>
        </div>
        <ActionIcon
          size="lg"
          variant="subtle"
          className="text-neon-green hover:bg-neon-green/10 border border-neon-green/30 hover:border-neon-green"
          onClick={handleRefresh}
          loading={isLoading}
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Group>

      <Text size="sm" className="text-gray-400 mb-4 font-body">
        👀 Watch other players attempt social engineering in real-time
      </Text>

      <ScrollArea className="h-[350px]">
        <div className="space-y-3">
          <AnimatePresence>
            {activeGames.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center mx-auto mb-4">
                  <IconWorld size={32} className="text-gray-500" />
                </div>
                <Text className="text-gray-400 font-heading mb-2">NO ACTIVE GAMES</Text>
                <Text size="sm" className="text-gray-500 font-body">
                  Be the first to start a public challenge!
                </Text>
              </motion.div>
            ) : (
              activeGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card 
                    className="border border-neon-green/30 bg-transparent hover:border-neon-green/60 transition-all duration-300 hover:shadow-lg backdrop-blur-sm hover:bg-neon-green/5"
                    style={{ 
                      boxShadow: '0 2px 10px rgba(0, 255, 136, 0.1)',
                    }}
                  >
                    {/* Header with game info */}
                    <Group justify="space-between" className="mb-3">
                      <Group gap="sm">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white font-bold font-heading text-sm">
                          {game.template.iconUrl}
                        </div>
                        <div>
                          <Text size="sm" className="font-heading text-white font-bold">
                            {game.template.name}
                          </Text>
                          <Text size="xs" className="text-gray-400 font-body">
                            hosted by <span className="text-neon-green">{game.hostName}</span>
                          </Text>
                        </div>
                      </Group>
                      
                      <Button
                        size="xs"
                        variant="gradient"
                        gradient={{ from: 'blue', to: 'cyan' }}
                        leftSection={<IconEye size={14} />}
                        onClick={() => onWatchGame(game)}
                        className="font-heading text-xs"
                        styles={{
                          root: {
                            boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)',
                            '&:hover': {
                              boxShadow: '0 0 25px rgba(0, 243, 255, 0.5)',
                              transform: 'translateY(-1px)',
                            }
                          }
                        }}
                      >
                        SPECTATE
                      </Button>
                    </Group>

                    {/* Status badges */}
                    <Group gap="xs" className="mb-3">
                      <Badge 
                        size="xs" 
                        variant="light"
                        color={
                          game.template.difficulty === 'easy' ? 'green' : 
                          game.template.difficulty === 'medium' ? 'yellow' : 'red'
                        }
                        className="font-heading"
                      >
                        {game.template.difficulty.toUpperCase()}
                      </Badge>
                      <Badge 
                        size="xs" 
                        variant="light"
                        color={game.status === 'active' ? 'green' : game.status === 'paused' ? 'yellow' : 'blue'}
                        className="font-heading"
                      >
                        {game.status === 'active' ? '🟢 LIVE' : game.status === 'paused' ? '⏸️ PAUSED' : '✅ DONE'}
                      </Badge>
                      <Badge size="xs" variant="light" color="violet" className="font-heading">
                        <IconWorld size={10} className="mr-1" />
                        PUBLIC
                      </Badge>
                    </Group>

                    {/* Stats row */}
                    <Group justify="space-between" className="my-3 py-2 border-y border-gray-700/20">
                      <div className="text-center">
                        <Group gap={4} justify="center" className="mb-1">
                          <IconUsers size={14} className="text-neon-blue" />
                          <Text size="xs" className="text-neon-blue font-heading font-bold">
                            {game.spectatorCount}
                          </Text>
                        </Group>
                        <Text size="xs" className="text-gray-500 font-body">
                          Watching
                        </Text>
                      </div>
                      
                      <div className="text-center">
                        <Group gap={4} justify="center" className="mb-1">
                          <IconClock size={14} className="text-neon-green" />
                          <Text size="xs" className="text-neon-green font-heading font-bold">
                            {formatDuration(game.duration)}
                          </Text>
                        </Group>
                        <Text size="xs" className="text-gray-500 font-body">
                          Duration
                        </Text>
                      </div>
                      
                      <div className="text-center">
                        <Group gap={4} justify="center" className="mb-1">
                          <IconClock size={14} className="text-neon-purple" />
                          <Text size="xs" className="text-neon-purple font-heading font-bold">
                            {game.messageCount}
                          </Text>
                        </Group>
                        <Text size="xs" className="text-gray-500 font-body">
                          Messages
                        </Text>
                      </div>
                    </Group>

                    {/* Activity indicator */}
                    <Group justify="space-between" className="mt-3 pt-2 border-t border-gray-700/30">
                      <Text size="xs" className="text-gray-500 font-body">
                        Last activity: <span className="text-neon-green">{getLastActivityText(game.lastActivity)}</span>
                      </Text>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          game.status === 'active' ? 'bg-green-400 animate-pulse' : 
                          game.status === 'paused' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`} />
                        <Text size="xs" className="text-gray-400 font-body capitalize">
                          {game.status}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer info */}
      <div className="mt-4 pt-4 border-t border-gray-700/30">
        <Group justify="center" gap="xl">
          <div className="text-center">
            <Group gap={4} justify="center" className="mb-1">
              <IconWorld size={14} className="text-green-400" />
              <Text size="xs" className="text-green-400 font-heading font-bold">PUBLIC</Text>
            </Group>
            <Text size="xs" className="text-gray-500 font-body">Visible to all</Text>
          </div>
          <div className="text-center">
            <Group gap={4} justify="center" className="mb-1">
              <IconLock size={14} className="text-gray-500" />
              <Text size="xs" className="text-gray-500 font-heading font-bold">PRIVATE</Text>
            </Group>
            <Text size="xs" className="text-gray-500 font-body">Hidden from list</Text>
          </div>
        </Group>
      </div>
    </Card>
  );
};

export default ActiveGames;
