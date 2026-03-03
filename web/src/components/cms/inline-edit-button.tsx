'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineEditButtonProps {
  onClick: () => void;
  className?: string;
}

export function InlineEditButton({ onClick, className = '' }: InlineEditButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      title="编辑"
    >
      <Pencil className="w-4 h-4 text-slate-400 hover:text-primary" />
    </Button>
  );
}
