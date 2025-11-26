'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavigationProps {
  onVerifyClick: () => void;
}

export default function Navigation({ onVerifyClick }: NavigationProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">👻</span>
            <span className="text-xl font-bold">GhostMRR</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('groups')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Groups
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              How It Works
            </button>
            <Button onClick={onVerifyClick} className="bg-purple-600 hover:bg-purple-700">
              🔐 Verify Your Badge
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

