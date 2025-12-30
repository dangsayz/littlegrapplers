'use client';

import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NewsletterSignupProps {
  variant?: 'footer' | 'inline' | 'card';
  source?: string;
  className?: string;
}

export function NewsletterSignup({ 
  variant = 'footer', 
  source = 'footer',
  className 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm',
        variant === 'footer' ? 'text-background/90' : 'text-brand',
        className
      )}>
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-2', className)}>
      <div className={cn(
        'flex gap-2',
        variant === 'card' && 'flex-col sm:flex-row'
      )}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'loading'}
          className={cn(
            'flex-1',
            variant === 'footer' && 'bg-background/10 border-background/20 text-background placeholder:text-background/50 focus-visible:ring-background/50'
          )}
          aria-label="Email address for newsletter"
        />
        <Button 
          type="submit" 
          disabled={status === 'loading'}
          size={variant === 'footer' ? 'default' : 'default'}
          className={cn(
            variant === 'footer' && 'bg-brand hover:bg-brand/90'
          )}
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </div>
      {status === 'error' && (
        <p className={cn(
          'text-xs',
          variant === 'footer' ? 'text-red-300' : 'text-destructive'
        )}>
          {message}
        </p>
      )}
    </form>
  );
}
