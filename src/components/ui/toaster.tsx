'use client';

import { useToast } from '@/hooks/use-toast';
import React, { useEffect } from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastActionElement,
} from '@/components/ui/toast';

interface ToasterProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  onClose?: () => void;
}

export function Toaster({ 
  title, 
  description, 
  variant = 'default',
  duration = 5000,
  onClose 
}: ToasterProps) {
  const { toast, toasts } = useToast();

  useEffect(() => {
    if (title) {
      toast({
        title,
        description,
        variant,
        duration,
        onOpenChange: (open) => {
          if (!open && onClose) {
            onClose();
          }
        },
      });
    }
  }, [title, description, variant, duration, onClose]);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className='grid gap-1'>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription className='text-subBody'>{description}</ToastDescription>
            )}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
