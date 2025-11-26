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
    <section id="how-it-works" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          Verify Your MRR in 3 Simple Steps
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Note: Your Stripe key stays on your machine - we never see it
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="p-6 text-center bg-card border-border">
              <div className="text-xs text-muted-foreground mb-2">STEP {step.number}</div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-primary font-mono text-xs mb-2">{step.description}</p>
              <p className="text-muted-foreground text-xs">{step.details}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

