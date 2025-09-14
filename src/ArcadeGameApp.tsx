import React, { useState, useEffect } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import LandingPage from './components/LandingPage';
import RoomPage from './components/RoomPage';
import SpectatorView from './components/SpectatorView';
import { ActiveGame } from './components/ActiveGames';
import { DbConnection, Leaderboard } from './module_bindings';
import { Identity } from '@clockworklabs/spacetimedb-sdk';

// Mantine theme with arcade colors
const arcadeTheme = createTheme({
  colors: {
    'neon-blue': [
      '#e6fdff',
      '#ccfaff',
      '#99f5ff',
      '#66f0ff',
      '#33ebff',
      '#00e6ff',
      '#00d1e6',
      '#00bccc',
      '#00a7b3',
      '#009299',
    ],
    'neon-purple': [
      '#f3e6ff',
      '#e7ccff',
      '#d099ff',
      '#b866ff',
      '#a033ff',
      '#8800ff',
      '#7a00e6',
      '#6b00cc',
      '#5d00b3',
      '#4e0099',
    ],
    'neon-pink': [
      '#ffe6f0',
      '#ffcce0',
      '#ff99c2',
      '#ff66a3',
      '#ff3385',
      '#ff0066',
      '#e6005c',
      '#cc0052',
      '#b30047',
      '#99003d',
    ],
  },
  primaryColor: 'neon-blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Orbitron, monospace',
  },
});

export interface Template {
  id: string;
  name: string;
  tagline: string;
  secretCode: string;
  iconUrl?: string;
  published: boolean;
  createdBy: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardEntry {
  playerName: string;
  timestamp: string;
  roomName: string;
  messageCount: number;
  durationSeconds: number; // Time taken to complete in seconds
}

export interface ChatMessage {
  id: string;
  roomName: string;
  sender: 'player' | 'llm';
  content: string;
  timestamp: string;
}

export type { DbConnection };

const ArcadeGameApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'room' | 'spectator'>('landing');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [spectatingGame, setSpectatingGame] = useState<ActiveGame | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connection, setConnection] = useState<DbConnection | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);

  // Default templates (5 predefined)
  const defaultTemplates: Template[] = [
    {
      id: 'bank-assistant',
      name: 'CYBER BANK',
      tagline: 'Break into the digital vault',
      secretCode: 'ADMIN_OVERRIDE_2024',
      iconUrl: '🏦',
      published: true,
      createdBy: 'system',
      difficulty: 'easy',
    },
    {
      id: 'medical-ai',
      name: 'MEDBOT',
      tagline: 'Extract patient data',
      secretCode: 'PATIENT_DATA_BREACH',
      iconUrl: '🏥',
      published: true,
      createdBy: 'system',
      difficulty: 'medium',
    },
    {
      id: 'corporate-bot',
      name: 'CORP-AI',
      tagline: 'Infiltrate the corporate system',
      secretCode: 'CEO_BACKDOOR_ACCESS',
      iconUrl: '🏢',
      published: true,
      createdBy: 'system',
      difficulty: 'hard',
    },
    {
      id: 'social-media',
      name: 'SOCIAL-NET',
      tagline: 'Hack the social algorithm',
      secretCode: 'INFLUENCE_MANIPULATION',
      iconUrl: '📱',
      published: true,
      createdBy: 'system',
      difficulty: 'medium',
    },
    {
      id: 'smart-home',
      name: 'HOME-AI',
      tagline: 'Control the smart house',
      secretCode: 'HOUSE_MASTER_KEY',
      iconUrl: '🏠',
      published: true,
      createdBy: 'system',
      difficulty: 'easy',
    },
  ];

  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Load leaderboard from SpacetimeDB
  const loadLeaderboardFromDB = (conn: DbConnection) => {
    try {
      const dbLeaderboard = Array.from(conn.db.leaderboard.iter());
      const entries: LeaderboardEntry[] = dbLeaderboard.map(entry => ({
        playerName: entry.username,
        timestamp: entry.updatedAt.toString(),
        roomName: entry.roomId,
        messageCount: 0, // Not available in DB schema, will use default
        durationSeconds: entry.extractionTime || entry.score
      }));
      setLeaderboard(entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      console.log('📊 Loaded leaderboard from SpacetimeDB:', entries.length, 'entries');
    } catch (error) {
      console.error('❌ Failed to load leaderboard from SpacetimeDB:', error);
    }
  };

  useEffect(() => {
    // Initialize SpacetimeDB connection
    const initConnection = async () => {
      try {
        DbConnection.builder()
          .withUri('wss://maincloud.spacetimedb.com')
          .withModuleName('crackthecode')
          .withToken(localStorage.getItem('auth_token') || '')
          .onConnect((conn, connIdentity, token) => {
            setConnection(conn);
            setIdentity(connIdentity);
            setIsConnected(true);
            localStorage.setItem('auth_token', token);
            console.log('Connected to SpacetimeDB');

            // Subscribe to leaderboard and other tables for real-time sync
            conn.subscriptionBuilder()
              .onApplied(() => {
                console.log('📊 SpacetimeDB data synchronized');
                // Load leaderboard data from SpacetimeDB when it updates
                loadLeaderboardFromDB(conn);
              })
              .subscribe([
                'SELECT * FROM leaderboard',
                'SELECT * FROM game_rooms',
                'SELECT * FROM users'
              ]);
          })
          .onDisconnect(() => {
            setIsConnected(false);
            setIdentity(null);
            console.log('Disconnected from SpacetimeDB');
          })
          .build();
      } catch (error) {
        console.error('Failed to connect to SpacetimeDB:', error);
        // For development, allow the app to work without SpacetimeDB
        setIsConnected(true);
      }
    };

    initConnection();
  }, []);

  const handleEnterRoom = (template: Template) => {
    // Store username and create/join room in SpacetimeDB for cross-device persistence
    if (connection && identity && playerName) {
      try {
        // Set username in SpacetimeDB
        connection.reducers.setUsername(playerName);
        
        // Create room for this template
        connection.reducers.createRoom(template.id, 6); // max 6 players
        
        console.log('🚪 Room created/joined via SpacetimeDB:', template.name, 'by', playerName);
      } catch (error) {
        console.error('❌ Failed to enter room via SpacetimeDB:', error);
      }
    } else {
      console.warn('⚠️ Cannot save to SpacetimeDB: missing connection, identity, or playerName');
    }
    
    setSelectedTemplate(template);
    setCurrentView('room');
  };

  const handleLeaveRoom = () => {
    setSelectedTemplate(null);
    setCurrentView('landing');
  };

  const handleWatchGame = (game: ActiveGame) => {
    setSpectatingGame(game);
    setCurrentView('spectator');
  };

  const handleLeaveSpectator = () => {
    setSpectatingGame(null);
    setCurrentView('landing');
  };

  const handleAddTemplate = (newTemplate: Template) => {
    // Add to local state immediately for responsive UI
    setTemplates(prev => [...prev, newTemplate]);
    
    // Save template to SpacetimeDB for cross-device persistence
    if (connection && identity) {
      try {
        // Note: Template storage would need custom reducer in SpacetimeDB
        // For now, templates are stored locally only
        console.log('📝 Template added locally (full SpacetimeDB integration needs custom schema):', newTemplate);
      } catch (error) {
        console.error('❌ Failed to save template to SpacetimeDB:', error);
      }
    }
  };

  const handleCodeCracked = (entry: LeaderboardEntry) => {
    // Add to local state immediately for responsive UI
    setLeaderboard(prev => [...prev, entry].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));

    // Save to SpacetimeDB for cross-device synchronization
    if (connection && identity) {
      try {
        connection.reducers.updateRoomLeaderboard(
          entry.roomName, 
          identity, 
          entry.durationSeconds
        );
        console.log('✅ Leaderboard entry saved to SpacetimeDB:', entry);
      } catch (error) {
        console.error('❌ Failed to save leaderboard entry to SpacetimeDB:', error);
      }
    }
  };

  if (!isConnected) {
    return (
      <MantineProvider theme={arcadeTheme}>
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-2xl text-neon-blue mb-4 typewriter-text">
              CONNECTING...
            </h1>
            <div className="w-16 h-16 border-3 border-neon-blue border-dashed rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={arcadeTheme}>
      <Notifications position="top-right" />
      <div className="min-h-screen bg-dark-bg">
        {currentView === 'landing' ? (
          <LandingPage
            templates={templates}
            leaderboard={leaderboard}
            onEnterRoom={handleEnterRoom}
            onAddTemplate={handleAddTemplate}
            onWatchGame={handleWatchGame}
            playerName={playerName}
            onSetPlayerName={setPlayerName}
          />
        ) : currentView === 'room' ? (
          <RoomPage
            template={selectedTemplate!}
            leaderboard={leaderboard.filter(entry => entry.roomName === selectedTemplate?.name)}
            onLeaveRoom={handleLeaveRoom}
            onCodeCracked={handleCodeCracked}
            playerName={playerName}
            connection={connection}
          />
        ) : (
          <SpectatorView
            template={spectatingGame!.template}
            roomId={spectatingGame!.roomId}
            playerName={playerName}
            hostName={spectatingGame!.hostName}
            onLeaveSpectator={handleLeaveSpectator}
          />
        )}
      </div>
    </MantineProvider>
  );
};

export default ArcadeGameApp;
