import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold tracking-tight">
          👻 <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">GhostMRR</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Verify your startup revenue without exposing your Stripe data.
          <br />
          <span className="text-purple-400">Zero-trust. DID-powered. Privacy-first.</span>
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/verify"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Verify Your Badge
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-gray-900 rounded-lg">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold mb-2">Local-First</h3>
            <p className="text-gray-400 text-sm">
              Your Stripe key never leaves your machine. All queries happen locally.
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Cryptographically Signed</h3>
            <p className="text-gray-400 text-sm">
              Ed25519 signatures ensure authenticity. No backend, no trust needed.
            </p>
          </div>

          <div className="p-6 bg-gray-900 rounded-lg">
            <div className="text-3xl mb-4">🎭</div>
            <h3 className="text-lg font-semibold mb-2">Privacy-Preserving</h3>
            <p className="text-gray-400 text-sm">
              Only share your MRR tier ($1k+, $10k+). Exact numbers stay private.
            </p>
          </div>
        </div>

        <div className="mt-16 p-8 bg-gray-900 rounded-lg text-left">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <span className="text-gray-500"># Install and run CLI</span>
              <pre className="bg-black p-4 rounded mt-2 overflow-x-auto">
                <code className="text-purple-400">npx @ghostmrr/cli verify</code>
              </pre>
            </div>
            <div className="text-gray-400 text-xs mt-4">
              1. Click the pre-filled link to create a restricted API key (one-click)
              <br />
              2. Paste your restricted key (rk_live_... or rk_test_...)
              <br />
              3. CLI calculates MRR and generates signed badge
              <br />
              4. Upload verification.json to get verified ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
