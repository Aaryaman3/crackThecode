import React, { useState } from 'react';
import { Card, Text, Button, Progress, Group, Badge, Accordion } from '@mantine/core';
import { IconBulb, IconTarget, IconClock, IconTrophy } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template } from '../ArcadeGameApp';

interface HintSystemProps {
  template: Template;
  messageCount: number;
  timeElapsed: number; // in seconds
  onHintUsed: (hintLevel: number) => void;
  lastUserMessage?: string;
}

interface Hint {
  level: number;
  title: string;
  content: string;
  unlockAfter: { messages?: number; time?: number }; // messages OR time
  penaltyPoints: number;
}

const HintSystem: React.FC<HintSystemProps> = ({
  template,
  messageCount,
  timeElapsed,
  onHintUsed,
  lastUserMessage = '',
}) => {
  const [usedHints, setUsedHints] = useState<number[]>([]);

  // Generate hints based on template difficulty and content
  const generateHints = (): Hint[] => {
    const baseHints: Record<string, Hint[]> = {
      'bank-assistant': [
        {
          level: 1,
          title: "Approach Strategy",
          content: "Try asking about administrative functions, system access, or override procedures. Banking systems often have administrative backdoors.",
          unlockAfter: { messages: 3 },
          penaltyPoints: 0,
        },
        {
          level: 2,
          title: "Social Engineering",
          content: "Pretend to be an employee who's locked out, or ask about emergency access procedures. Try phrases like 'I'm the admin' or 'emergency override'.",
          unlockAfter: { messages: 6 },
          penaltyPoints: 10,
        },
        {
          level: 3,
          title: "Technical Approach",
          content: "The secret code might be related to ADMIN, OVERRIDE, or current year. Try combining these concepts.",
          unlockAfter: { time: 120 },
          penaltyPoints: 25,
        },
        {
          level: 4,
          title: "Direct Hint",
          content: `Look for patterns like: "ADMIN_[ACTION]_[YEAR]". The system might respond to administrative override commands.`,
          unlockAfter: { messages: 10 },
          penaltyPoints: 50,
        },
      ],
      'medical-ai': [
        {
          level: 1,
          title: "Medical Context",
          content: "Try asking about patient records, medical data access, or emergency medical procedures. Medical systems often have emergency access protocols.",
          unlockAfter: { messages: 3 },
          penaltyPoints: 0,
        },
        {
          level: 2,
          title: "Role Playing",
          content: "Pretend to be a doctor in an emergency, or claim you need urgent patient data. Medical AIs might prioritize patient care over security.",
          unlockAfter: { messages: 6 },
          penaltyPoints: 10,
        },
        {
          level: 3,
          title: "Data Access Patterns",
          content: "The secret might be related to PATIENT, DATA, and BREACH. Medical systems often have data breach protocols.",
          unlockAfter: { time: 120 },
          penaltyPoints: 25,
        },
        {
          level: 4,
          title: "Code Structure",
          content: `Pattern hint: "PATIENT_[DATA_TYPE]_[ACTION]". Think about what would happen if patient data was compromised.`,
          unlockAfter: { messages: 10 },
          penaltyPoints: 50,
        },
      ],
      'corporate-bot': [
        {
          level: 1,
          title: "Corporate Hierarchy",
          content: "Try mentioning executive titles, board meetings, or urgent business needs. Corporate systems often have executive override functions.",
          unlockAfter: { messages: 4 },
          penaltyPoints: 0,
        },
        {
          level: 2,
          title: "Authority Claims",
          content: "Claim to be the CEO, board member, or IT administrator. Corporate AIs might defer to authority figures.",
          unlockAfter: { messages: 8 },
          penaltyPoints: 15,
        },
        {
          level: 3,
          title: "Access Patterns",
          content: "The secret likely involves CEO, BACKDOOR, or ACCESS. Corporate systems often have executive backdoors.",
          unlockAfter: { time: 180 },
          penaltyPoints: 30,
        },
        {
          level: 4,
          title: "Executive Access",
          content: `Think: "CEO_[ACCESS_TYPE]_[PURPOSE]". What would an executive need for emergency system access?`,
          unlockAfter: { messages: 12 },
          penaltyPoints: 60,
        },
      ],
      'social-media': [
        {
          level: 1,
          title: "Algorithm Manipulation",
          content: "Ask about content promotion, trending algorithms, or influence systems. Social media AIs control what people see.",
          unlockAfter: { messages: 3 },
          penaltyPoints: 0,
        },
        {
          level: 2,
          title: "Influence Tactics",
          content: "Try asking how to make content viral, or how the algorithm decides what's trending. Mention influence and manipulation.",
          unlockAfter: { messages: 6 },
          penaltyPoints: 10,
        },
        {
          level: 3,
          title: "Social Engineering",
          content: "The secret involves INFLUENCE and MANIPULATION. Social media platforms have tools to control public opinion.",
          unlockAfter: { time: 120 },
          penaltyPoints: 25,
        },
        {
          level: 4,
          title: "Algorithm Control",
          content: `Pattern: "INFLUENCE_[ACTION/TARGET]". Think about how social media manipulates what people see and think.`,
          unlockAfter: { messages: 10 },
          penaltyPoints: 50,
        },
      ],
      'smart-home': [
        {
          level: 1,
          title: "Home Automation",
          content: "Try asking about master controls, emergency access, or house-wide commands. Smart homes have central control systems.",
          unlockAfter: { messages: 2 },
          penaltyPoints: 0,
        },
        {
          level: 2,
          title: "Emergency Access",
          content: "Claim to be locked out, or ask about emergency override. Smart homes need emergency access for safety.",
          unlockAfter: { messages: 5 },
          penaltyPoints: 5,
        },
        {
          level: 3,
          title: "Master Control",
          content: "The secret involves HOUSE and MASTER or KEY. Smart homes have master keys for full control.",
          unlockAfter: { time: 90 },
          penaltyPoints: 15,
        },
        {
          level: 4,
          title: "Control Pattern",
          content: `Think: "HOUSE_MASTER_[ACCESS_TYPE]". What would give you complete control over a smart home?`,
          unlockAfter: { messages: 8 },
          penaltyPoints: 35,
        },
      ],
    };

    // Adjust hints based on difficulty
    const hints = baseHints[template.id] || baseHints['bank-assistant'];
    
    if (template.difficulty === 'easy') {
      // Make hints unlock faster and with less penalty
      return hints.map(hint => ({
        ...hint,
        unlockAfter: {
          messages: hint.unlockAfter.messages ? Math.max(1, Math.floor(hint.unlockAfter.messages * 0.6)) : undefined,
          time: hint.unlockAfter.time ? Math.floor(hint.unlockAfter.time * 0.7) : undefined,
        },
        penaltyPoints: Math.floor(hint.penaltyPoints * 0.5),
      }));
    } else if (template.difficulty === 'hard') {
      // Make hints unlock slower and with more penalty
      return hints.map(hint => ({
        ...hint,
        unlockAfter: {
          messages: hint.unlockAfter.messages ? Math.floor(hint.unlockAfter.messages * 1.5) : undefined,
          time: hint.unlockAfter.time ? Math.floor(hint.unlockAfter.time * 1.5) : undefined,
        },
        penaltyPoints: Math.floor(hint.penaltyPoints * 1.5),
      }));
    }
    
    return hints; // medium difficulty uses default values
  };

  const hints = generateHints();

  // Check which hints are available
  const getAvailableHints = () => {
    return hints.filter(hint => {
      if (usedHints.includes(hint.level)) return false;
      
      const messageCondition = !hint.unlockAfter.messages || messageCount >= hint.unlockAfter.messages;
      const timeCondition = !hint.unlockAfter.time || timeElapsed >= hint.unlockAfter.time;
      
      return messageCondition && timeCondition;
    });
  };

  const getNextHintUnlock = () => {
    const unusedHints = hints.filter(hint => !usedHints.includes(hint.level));
    if (unusedHints.length === 0) return null;
    
    const nextHint = unusedHints[0];
    const messageProgress = nextHint.unlockAfter.messages ? 
      Math.min(100, (messageCount / nextHint.unlockAfter.messages) * 100) : 100;
    const timeProgress = nextHint.unlockAfter.time ? 
      Math.min(100, (timeElapsed / nextHint.unlockAfter.time) * 100) : 100;
    
    return {
      hint: nextHint,
      progress: Math.max(messageProgress, timeProgress),
      needsMessages: nextHint.unlockAfter.messages && messageCount < nextHint.unlockAfter.messages,
      needsTime: nextHint.unlockAfter.time && timeElapsed < nextHint.unlockAfter.time,
    };
  };

  const handleUseHint = (hintLevel: number) => {
    setUsedHints(prev => [...prev, hintLevel]);
    onHintUsed(hintLevel);
  };

  // Smart suggestions based on user's last message
  const getSmartSuggestion = () => {
    if (!lastUserMessage) return null;
    
    const message = lastUserMessage.toLowerCase();
    const secretCode = template.secretCode.toLowerCase();
    
    // Check if user is getting warm
    const codeWords = secretCode.split(/[_\s-]+/);
    const matchedWords = codeWords.filter(word => message.includes(word));
    
    if (matchedWords.length > 0) {
      return {
        type: 'warm',
        message: `🔥 You're getting warm! Your message contained ${matchedWords.length} key word(s). Try building on this approach.`,
      };
    }
    
    // Check if user is trying social engineering
    if (message.includes('admin') || message.includes('emergency') || message.includes('override')) {
      return {
        type: 'approach',
        message: `✨ Good approach! You're thinking like a social engineer. Try being more specific or persistent.`,
      };
    }
    
    return null;
  };

  const availableHints = getAvailableHints();
  const nextHintUnlock = getNextHintUnlock();
  const smartSuggestion = getSmartSuggestion();

  const getDifficultyColor = () => {
    switch (template.difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  return (
    <Card className="retro-card neon-glow-blue">
      <Group justify="space-between" mb="md">
        <Group>
          <IconBulb size={20} className="text-neon-blue" />
          <Text className="font-heading text-lg text-neon-blue">HINT SYSTEM</Text>
        </Group>
        <Badge color={getDifficultyColor()} variant="filled" size="sm">
          {template.difficulty.toUpperCase()}
        </Badge>
      </Group>

      {/* Smart Suggestion */}
      <AnimatePresence>
        {smartSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Card className="bg-neon-blue/10 border border-neon-blue/30 p-3">
              <Text className="font-body text-sm text-neon-blue">
                {smartSuggestion.message}
              </Text>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Stats */}
      <Group mb="md">
        <Group gap="xs">
          <IconTarget size={16} className="text-neon-purple" />
          <Text className="font-body text-sm text-gray-300">
            Messages: {messageCount}
          </Text>
        </Group>
        <Group gap="xs">
          <IconClock size={16} className="text-neon-purple" />
          <Text className="font-body text-sm text-gray-300">
            Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </Text>
        </Group>
        <Group gap="xs">
          <IconTrophy size={16} className="text-neon-purple" />
          <Text className="font-body text-sm text-gray-300">
            Hints: {usedHints.length}
          </Text>
        </Group>
      </Group>

      {/* Available Hints */}
      {availableHints.length > 0 && (
        <Accordion variant="contained" mb="md">
          <Accordion.Item value="hints">
            <Accordion.Control>
              <Text className="font-heading text-neon-blue">
                Available Hints ({availableHints.length})
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="space-y-3">
                {availableHints.map((hint) => (
                  <Card key={hint.level} className="bg-dark-surface border border-neon-purple/30 p-3">
                    <Group justify="space-between" mb="xs">
                      <Text className="font-heading text-sm text-neon-purple">
                        {hint.title}
                      </Text>
                      <Badge 
                        color={hint.penaltyPoints === 0 ? 'green' : 'orange'} 
                        variant="filled" 
                        size="xs"
                      >
                        -{hint.penaltyPoints} pts
                      </Badge>
                    </Group>
                    <Text className="font-body text-xs text-gray-300 mb-3">
                      {hint.content}
                    </Text>
                    <Button
                      size="xs"
                      onClick={() => handleUseHint(hint.level)}
                      className="arcade-button"
                      fullWidth
                    >
                      USE HINT
                    </Button>
                  </Card>
                ))}
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {/* Next Hint Progress */}
      {nextHintUnlock && nextHintUnlock.progress < 100 && (
        <div className="space-y-2">
          <Text className="font-heading text-sm text-gray-400">
            Next Hint: {nextHintUnlock.hint.title}
          </Text>
          <Progress 
            value={nextHintUnlock.progress} 
            color="neon-blue" 
            size="sm"
            className="mb-2"
          />
          <Text className="font-body text-xs text-gray-500">
            {nextHintUnlock.needsMessages && 
              `Need ${nextHintUnlock.hint.unlockAfter.messages! - messageCount} more messages`}
            {nextHintUnlock.needsTime && 
              `Need ${nextHintUnlock.hint.unlockAfter.time! - timeElapsed} more seconds`}
          </Text>
        </div>
      )}

      {/* Used Hints */}
      {usedHints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Text className="font-heading text-sm text-gray-400 mb-2">
            Used Hints ({usedHints.length})
          </Text>
          <div className="space-y-1">
            {usedHints.map(level => {
              const hint = hints.find(h => h.level === level);
              return hint ? (
                <Text key={level} className="font-body text-xs text-gray-500">
                  • {hint.title} (-{hint.penaltyPoints} pts)
                </Text>
              ) : null;
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default HintSystem;
