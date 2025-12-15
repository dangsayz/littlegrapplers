'use client';

import { FadeIn } from './motion';

interface SectionHeaderProps {
  number: string;
  category: string;
  title: string;
  titleAccent?: string;
  description?: string;
  centered?: boolean;
  dark?: boolean;
}

/**
 * SectionHeader - Numbered section header with category label
 * Design: "01 — CATEGORY • SUBCATEGORY" pattern
 */
export function SectionHeader({
  number,
  category,
  title,
  titleAccent,
  description,
  centered = false,
  dark = false,
}: SectionHeaderProps) {
  return (
    <FadeIn direction="up" className={centered ? 'text-center' : ''}>
      {/* Section number and category */}
      <div className={`flex items-center gap-3 mb-6 ${centered ? 'justify-center' : ''}`}>
        <span className={`text-sm font-mono ${dark ? 'text-background/40' : 'text-muted-foreground/60'}`}>
          {number}
        </span>
        <span className={`w-8 h-px ${dark ? 'bg-background/20' : 'bg-border'}`} />
        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? 'text-background/60' : 'text-muted-foreground'}`}>
          {category}
        </span>
      </div>

      {/* Title with optional accent */}
      <h2 className={`text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[0.95] ${
        centered ? 'mx-auto max-w-4xl' : ''
      }`}>
        <span className={dark ? 'text-background' : 'text-foreground'}>{title}</span>
        {titleAccent && (
          <>
            <br />
            <span className="text-brand italic font-serif font-normal">{titleAccent}</span>
          </>
        )}
      </h2>

      {/* Optional description */}
      {description && (
        <p className={`mt-6 text-lg leading-relaxed max-w-2xl ${
          centered ? 'mx-auto' : ''
        } ${dark ? 'text-background/70' : 'text-muted-foreground'}`}>
          {description}
        </p>
      )}
    </FadeIn>
  );
}
