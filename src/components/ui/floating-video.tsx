'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * FloatingVideo - Autoplay video with floating animation
 * Purpose: Adds visual interest, showcases action
 * Per MOTION-SYSTEM.md: GPU-only transforms, reduced-motion fallback
 */

interface FloatingVideoProps {
  src: string;
  className?: string;
  delay?: number;
}

export function FloatingVideo({ src, className, delay = 0 }: FloatingVideoProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1,
        delay: delay + 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={prefersReducedMotion ? {} : { 
          y: [0, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Glow effect behind video */}
        <div className="absolute inset-0 bg-brand/20 blur-3xl scale-110 rounded-3xl" />
        
        {/* Video container */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={src} type="video/mp4" />
          </video>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * VideoShowcase - Grid of video thumbnails with hover effects
 */
interface VideoShowcaseProps {
  videos: Array<{ src: string; title: string }>;
  className?: string;
}

export function VideoShowcase({ videos, className }: VideoShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={className}>
      {videos.map((video, i) => (
        <motion.div
          key={i}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="group relative overflow-hidden rounded-2xl bg-foreground"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
          >
            <source src={video.src} type="video/mp4" />
          </video>
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-background font-medium">{video.title}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
