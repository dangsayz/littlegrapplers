'use client';

import Image from 'next/image';
import { type ReactNode } from 'react';
import { StaggerItem } from './motion';

interface BentoCardProps {
  tag?: string;
  title: string;
  description?: string;
  image?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  className?: string;
}

/**
 * BentoCard - Flexible card for bento grid layouts
 * Supports image backgrounds, icons, tags
 */
export function BentoCard({
  tag,
  title,
  description,
  image,
  icon,
  size = 'md',
  dark = false,
  className = '',
}: BentoCardProps) {
  const sizeClasses = {
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10',
  };

  const baseClasses = `
    relative overflow-hidden rounded-2xl 
    ${sizeClasses[size]}
    ${dark ? 'bg-foreground text-background' : 'bg-muted/50 text-foreground'}
    ${className}
  `;

  return (
    <StaggerItem>
      <div className={baseClasses}>
        {/* Background image */}
        {image && (
          <>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/20" />
          </>
        )}

        {/* Content */}
        <div className={`relative z-10 h-full flex flex-col ${image ? 'justify-end text-background' : ''}`}>
          {/* Tag */}
          {tag && (
            <span className={`
              inline-block self-start px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider rounded-full
              ${image ? 'bg-background/20 text-background backdrop-blur-sm' : 'bg-brand/10 text-brand'}
            `}>
              {tag}
            </span>
          )}

          {/* Icon */}
          {icon && !image && (
            <div className="mb-4 text-brand">
              {icon}
            </div>
          )}

          {/* Title */}
          <h3 className={`
            font-bold tracking-tight
            ${size === 'lg' ? 'text-2xl md:text-3xl' : size === 'md' ? 'text-xl md:text-2xl' : 'text-lg'}
          `}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className={`
              mt-2 leading-relaxed
              ${image ? 'text-background/70' : 'text-muted-foreground'}
              ${size === 'lg' ? 'text-base' : 'text-sm'}
            `}>
              {description}
            </p>
          )}
        </div>
      </div>
    </StaggerItem>
  );
}
