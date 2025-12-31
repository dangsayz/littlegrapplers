'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9F9] via-white to-[#8FE3CF]/10 flex flex-col">
      {/* Back to home */}
      <div className="p-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1F2A44]/60 hover:text-[#1F2A44] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      {/* Centered SignUp */}
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2EC4B6] to-[#1FA89C] shadow-lg">
                <span className="text-xl font-bold text-white">LG</span>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-800">Little </span>
                <span className="text-xl font-bold text-[#2EC4B6]">Grapplers</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-[#1F2A44] mb-2">Get started</h1>
            <p className="text-[#1F2A44]/60">Create your account to enroll your child</p>
          </div>

          <SignUp 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-xl border border-white/60 bg-white/80 backdrop-blur-xl rounded-2xl',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-slate-200 hover:bg-slate-50 transition-colors',
                formButtonPrimary: 'bg-gradient-to-r from-[#F7931E] to-[#FFC857] hover:opacity-90 transition-opacity',
                footerActionLink: 'text-[#2EC4B6] hover:text-[#1FA89C]',
              },
            }}
            routing="path"
            path="/signup"
            signInUrl="/login"
          />
        </div>
      </div>
    </div>
  );
}
