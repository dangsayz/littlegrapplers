'use client';

import { ReactNode } from 'react';

interface ClickStopWrapperProps {
  children: ReactNode;
}

export function ClickStopWrapper({ children }: ClickStopWrapperProps) {
  return (
    <div onClick={(e) => e.preventDefault()}>
      {children}
    </div>
  );
}
