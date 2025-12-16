'use client';

import { Dumbbell, Brain, Heart, Shield, Zap, Trophy, Users, Star } from 'lucide-react';

const iconMap = {
  dumbbell: Dumbbell,
  brain: Brain,
  heart: Heart,
  shield: Shield,
  zap: Zap,
  trophy: Trophy,
  users: Users,
  star: Star,
} as const;

type IconName = keyof typeof iconMap;

interface IconBadgeProps {
  icon: IconName;
  label: string;
  ringColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function IconBadge({ 
  icon, 
  label, 
  ringColor = '#2EC4B6',
  size = 'md' 
}: IconBadgeProps) {
  const Icon = iconMap[icon];
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 md:w-24 md:h-24',
    lg: 'w-24 h-24 md:w-28 md:h-28',
  };

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 md:w-10 md:h-10',
    lg: 'w-10 h-10 md:w-12 md:h-12',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-background/5 flex items-center justify-center relative`}
        style={{ 
          boxShadow: `inset 0 0 0 3px ${ringColor}`,
        }}
      >
        <Icon 
          className={`${iconSizes[size]}`} 
          style={{ color: ringColor }}
        />
      </div>
      <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-background/80 text-center">
        {label}
      </span>
    </div>
  );
}
