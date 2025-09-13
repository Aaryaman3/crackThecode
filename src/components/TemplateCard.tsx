import React from 'react';
import { Card, Text, Badge, Button, Group } from '@mantine/core';
import { IconBolt, IconShield, IconSkull } from '@tabler/icons-react';
import { Template } from '../ArcadeGameApp';

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <IconBolt size={16} className="text-green-400" />;
      case 'medium':
        return <IconShield size={16} className="text-orange-400" />;
      case 'hard':
        return <IconSkull size={16} className="text-red-400" />;
      default:
        return <IconBolt size={16} className="text-green-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'border-green-400 text-green-400';
      case 'medium':
        return 'border-orange-400 text-orange-400';
      case 'hard':
        return 'border-red-400 text-red-400';
      default:
        return 'border-green-400 text-green-400';
    }
  };

  const isCustom = template.createdBy !== 'system';

  return (
    <Card
      className={`
        bg-dark-surface border-2 transition-all duration-300 cursor-pointer
        hover:border-neon-pink hover:shadow-lg hover:-translate-y-1
        ${isCustom ? 'border-neon-purple' : 'border-neon-blue'}
      `}
      onClick={onSelect}
      style={{
        backgroundImage: 'linear-gradient(135deg, transparent 40%, rgba(0, 243, 255, 0.05) 100%)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className={`
            w-16 h-16 rounded-none border-2 flex items-center justify-center text-2xl
            ${isCustom ? 'border-neon-purple bg-dark-bg' : 'border-neon-blue bg-dark-bg'}
          `}>
            {template.iconUrl}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Text className="font-pixel text-lg text-neon-blue truncate">
              {template.name}
            </Text>
            {isCustom && (
              <Badge size="xs" className="bg-neon-purple text-dark-bg font-retro">
                CUSTOM
              </Badge>
            )}
          </div>
          
          <Text className="font-retro text-sm text-gray-300 mb-3 line-clamp-2">
            {template.tagline}
          </Text>

          <Group justify="space-between" align="center">
            <Badge
              variant="outline"
              size="sm"
              className={`font-retro ${getDifficultyColor(template.difficulty)} bg-transparent`}
              leftSection={getDifficultyIcon(template.difficulty)}
            >
              {template.difficulty.toUpperCase()}
            </Badge>

            <Button
              size="xs"
              className="arcade-button text-xs px-3 py-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              ENTER
            </Button>
          </Group>
        </div>
      </div>

      {/* Animated border effect */}
      <div className={`
        absolute inset-0 border-2 border-transparent transition-all duration-300
        ${isCustom ? 'hover:border-neon-purple' : 'hover:border-neon-pink'}
      `} style={{
        background: `linear-gradient(45deg, transparent, ${isCustom ? '#bd00ff' : '#ff0080'}20, transparent)`,
        mask: 'linear-gradient(white, white) padding-box, linear-gradient(white, white)',
        maskComposite: 'exclude',
      }} />
    </Card>
  );
};

export default TemplateCard;
