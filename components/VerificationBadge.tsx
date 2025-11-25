import { VerificationBadge as Badge } from '@/lib/types/verification';

interface Props {
  badge: Badge;
}

export default function VerificationBadge({ badge }: Props) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-600 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="text-4xl">👻</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{badge.metrics.tier}</span>
                <span className="text-green-400 text-xl">✓</span>
              </div>
              <div className="text-sm text-gray-400">Verified MRR</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Monthly Revenue</div>
              <div className="text-xl font-semibold">${badge.metrics.mrr.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Customers</div>
              <div className="text-xl font-semibold">{badge.metrics.customers}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700 space-y-2">
            <div className="text-xs text-gray-500">
              <span className="font-mono">DID:</span> {badge.did.slice(0, 32)}...
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-mono">Verified:</span> {formatDate(badge.timestamp)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
