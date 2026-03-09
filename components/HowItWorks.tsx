import { Card } from '@/components/ui/card';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: '🔑',
      title: 'Paste Stripe Key',
      description: 'Enter your Stripe API key in the browser',
      details: 'Your key never leaves your device',
    },
    {
      number: 2,
      icon: '✅',
      title: 'Verify & Join',
      description: 'We calculate your MRR and verify instantly',
      details: 'Choose to show exact numbers or stay anonymous',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          Verify Your MRR in 2 Simple Steps
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Your Stripe key stays on your machine - we never see it
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

