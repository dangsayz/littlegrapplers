'use client';

interface WaveSeparatorProps {
  color?: string;
  className?: string;
  flip?: boolean;
}

export function WaveSeparator({ 
  color = '#2EC4B6', 
  className = '',
  flip = false 
}: WaveSeparatorProps) {
  return (
    <div 
      className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg
        className="relative block w-full h-[60px] md:h-[80px]"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,80 L1200,120 L0,120 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}

export function WaveDivider({ 
  color = '#2EC4B6', 
  className = '' 
}: WaveSeparatorProps) {
  return (
    <div 
      className={`w-full overflow-hidden leading-[0] ${className}`}
      aria-hidden="true"
    >
      <svg
        className="relative block w-full h-[30px] md:h-[50px]"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0,30 Q300,60 600,30 T1200,30"
          fill="none"
          stroke={color}
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}
