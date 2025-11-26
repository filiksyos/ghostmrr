import { Card } from '@/components/ui/card';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: '💻',
      title: 'Run CLI',
      description: 'npx @ghostmrr/cli verify',
      details: 'Generate signed proof locally',
    },
    {
      number: 2,
      icon: '📤',
      title: 'Upload Badge',
      description: 'Paste your verification.json file',
      details: 'Client-side verification',
    },
    {
      number: 3,
      icon: '✅',
      title: 'Join Groups',
      description: 'Get verified and compete',
      details: 'All data stays anonymous',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">
          Verify Your MRR in 3 Simple Steps
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Note: Your Stripe key stays on your machine - we never see it
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="p-6 text-center bg-gray-900 border-gray-800">
              <div className="text-5xl mb-4">{step.icon}</div>
              <div className="text-sm text-gray-500 mb-2">STEP {step.number}</div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-purple-400 font-mono text-sm mb-2">{step.description}</p>
              <p className="text-gray-400 text-sm">{step.details}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

