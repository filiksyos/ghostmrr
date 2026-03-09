'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StripeVerificationForm from '@/components/StripeVerificationForm';

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetGroup?: 'exact-numbers' | '10-mrr-club' | null;
  onVerificationComplete?: () => void;
}

export default function VerificationDialog({ open, onOpenChange, targetGroup, onVerificationComplete }: VerificationDialogProps) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerificationComplete = () => {
    setSuccess(true);
    setError(null);

    // Notify parent component
    if (onVerificationComplete) {
      onVerificationComplete();
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    onOpenChange(false);
  };

  // Get the display name for the target group
  const getTargetGroupName = () => {
    if (targetGroup === 'exact-numbers') return 'Exact Numbers Leaderboard';
    if (targetGroup === '10-mrr-club') return '>$10 MRR Club';
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
        <DialogHeader>
          {!success ? (
            <>
              <DialogTitle className="text-2xl">Verify Your Revenue</DialogTitle>
              <DialogDescription className="text-gray-400">
                Connect your Stripe account to verify your MRR and join the leaderboard. Your API key never leaves your browser.
              </DialogDescription>
            </>
          ) : null}
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!success ? (
            <>
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <StripeVerificationForm
                targetGroup={targetGroup}
                onVerificationComplete={handleVerificationComplete}
              />
            </>
          ) : (
            <div className="py-8 text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h3 className="text-2xl font-bold text-green-500">Verification Complete!</h3>
              <p className="text-gray-300">
                {getTargetGroupName() ? (
                  <>You've joined the <strong>{getTargetGroupName()}</strong>!</>
                ) : (
                  'Your badge has been verified successfully!'
                )}
              </p>
              <Button onClick={handleClose} className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
