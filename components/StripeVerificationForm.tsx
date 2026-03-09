'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Loader2, CheckCircle2 } from 'lucide-react';
import { encryptApiKey, decryptApiKey, formatMRR, calculateStripeMetrics } from '@/lib/stripe/calculator';
import { saveVerifiedProfile } from '@/lib/localStorage/verifiedProfile';
import { VerificationBadge, VerifiedProfile } from '@/lib/types/verification';

interface StripeVerificationFormProps {
  targetGroup?: 'exact-numbers' | '10-mrr-club' | null;
  onVerificationComplete?: () => void;
}

interface CalculatedData {
  accountHash: string;
  metrics: {
    mrr: number;
    customers: number;
    tier: string;
  };
  timestamp: number;
}

const ENCRYPTED_API_KEY = 'ghostmrr_stripe_key';

export default function StripeVerificationForm({
  targetGroup,
  onVerificationComplete,
}: StripeVerificationFormProps) {
  const [apiKey, setApiKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);

  // Load saved API key on mount
  useEffect(() => {
    handleLoadSavedKey();
  }, []);

  const validateApiKey = (key: string): string | null => {
    if (!key) return null;

    if (key.startsWith('sk_live_')) {
      return 'Secret keys (sk_live_) are not supported. Please use a restricted key (rk_live_) for security.';
    }

    if (key.startsWith('rk_test_') || key.startsWith('sk_test_')) {
      return 'Test keys are not supported. Please use a live restricted key (rk_live_).';
    }

    if (!key.startsWith('rk_live_')) {
      return 'Invalid key format. Please use a live restricted key starting with rk_live_';
    }

    return null;
  };

  const handleLoadSavedKey = async () => {
    try {
      const encrypted = localStorage.getItem(ENCRYPTED_API_KEY);
      if (encrypted) {
        const decrypted = await decryptApiKey(encrypted);
        setApiKey(decrypted);
        // Validate the loaded key
        const validationError = validateApiKey(decrypted);
        setKeyValidationError(validationError);
        // Auto-trigger calculation if we have a valid saved key
        if (!validationError) {
          setTimeout(() => handleCalculate(decrypted), 100);
        }
      }
    } catch (error) {
      console.error('Failed to load saved key:', error);
      // Clear invalid encrypted key
      localStorage.removeItem(ENCRYPTED_API_KEY);
    }
  };

  const handleCalculate = async (keyToUse?: string) => {
    const apiKeyValue = keyToUse || apiKey;

    // Validate API key before proceeding
    const validationError = validateApiKey(apiKeyValue);
    if (validationError) {
      setKeyValidationError(validationError);
      return;
    }

    setError(null);
    setCalculatedData(null);
    setIsCalculating(true);

    try {
      // Calculate metrics directly in the browser using Stripe SDK
      const data = await calculateStripeMetrics(apiKeyValue);
      setCalculatedData(data);

      // Encrypt and save API key to localStorage
      const encrypted = await encryptApiKey(apiKeyValue);
      localStorage.setItem(ENCRYPTED_API_KEY, encrypted);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate MRR');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);

    // Validate on change
    const validationError = validateApiKey(newKey);
    setKeyValidationError(validationError);

    // Clear calculated data if key becomes invalid
    if (validationError && calculatedData) {
      setCalculatedData(null);
    }
  };

  const handleSubmit = async () => {
    if (!calculatedData) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Create verification badge
      const badge: VerificationBadge = {
        accountHash: calculatedData.accountHash,
        metrics: calculatedData.metrics,
        timestamp: new Date(calculatedData.timestamp).toISOString(),
        displayName: isAnonymous ? undefined : displayName || undefined,
        joinedGroup: targetGroup || undefined,
      };

      // Submit to API
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badge),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit verification');
      }

      // Save to localStorage
      const profile: VerifiedProfile = {
        accountHash: calculatedData.accountHash,
        metrics: calculatedData.metrics,
        timestamp: new Date(calculatedData.timestamp).toISOString(),
        verifiedAt: new Date().toISOString(),
        identityMode: isAnonymous ? 'anonymous' : 'public',
        displayName: isAnonymous ? undefined : displayName || undefined,
        joinedGroups: targetGroup ? [targetGroup] : [],
      };

      saveVerifiedProfile(profile);
      setSuccess(true);

      // Call completion callback after a short delay
      setTimeout(() => {
        onVerificationComplete?.();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyHash = async () => {
    if (calculatedData?.accountHash) {
      await navigator.clipboard.writeText(calculatedData.accountHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h3 className="text-xl font-semibold text-white">Verification Successful!</h3>
        <p className="text-sm text-gray-400">Your badge has been added to the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium text-gray-200">
          Stripe API Key
        </label>
        <div className="relative">
          <input
            id="apiKey"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="rk_live_..."
            className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            disabled={isCalculating || isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {keyValidationError && (
          <div className="flex items-start space-x-2 text-xs text-red-400">
            <span>⚠️</span>
            <span>{keyValidationError}</span>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Your API key never leaves your browser and is only used to query Stripe directly
        </p>
        <p className="text-xs text-gray-400">
          Don't have a restricted key?{' '}
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Create one in Stripe Dashboard →
          </a>
        </p>
      </div>

      {/* Display Name Input */}
      {!calculatedData && (
        <>
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium text-gray-200">
              Display Name (optional)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAnonymous || isCalculating || isSubmitting}
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-800 bg-gray-950 text-blue-600 focus:ring-2 focus:ring-blue-500"
              disabled={isCalculating || isSubmitting}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-300">
              Verify as anonymous
            </label>
          </div>
        </>
      )}

      {/* Calculate Button */}
      {!calculatedData && (
        <Button
          onClick={() => handleCalculate()}
          disabled={!apiKey || isCalculating || keyValidationError !== null}
          className="w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate MRR'
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-md">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {calculatedData && !success && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-md">
              <p className="text-xs text-gray-500 mb-1">MRR</p>
              <p className="text-lg font-semibold text-white">
                {formatMRR(calculatedData.metrics.mrr)}
              </p>
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Customers</p>
              <p className="text-lg font-semibold text-white">
                {calculatedData.metrics.customers}
              </p>
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-md">
              <p className="text-xs text-gray-500 mb-1">Tier</p>
              <p className="text-lg font-semibold text-white">
                {calculatedData.metrics.tier}
              </p>
            </div>
          </div>

          {/* Account Hash */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">Account Hash</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-950 border border-gray-800 rounded-md text-xs text-gray-400 font-mono">
                {truncateHash(calculatedData.accountHash)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyHash}
                className="shrink-0"
              >
                {copiedHash ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit to Leaderboard'
            )}
          </Button>

          {/* Recalculate Button */}
          <Button
            onClick={() => {
              setCalculatedData(null);
              setError(null);
            }}
            variant="outline"
            className="w-full"
          >
            Recalculate
          </Button>
        </div>
      )}
    </div>
  );
}
