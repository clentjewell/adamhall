export interface Step {
  title: string;
  body: string;
}

/* "How it works" numbered steps (How It Works page) */
export const steps: Step[] = [
  {
    title: '1. Share the details of your car',
    body: 'Answer a few questions about your car’s make, model, condition, kilometres travelled and location.',
  },
  {
    title: '2. Get expert advice',
    body: 'We will come to you to inspect the car. You get a free expert valuation and obligation-free advice on how best to sell your vehicle.',
  },
  {
    title: '3. Sell Your Car (Optional)',
    body: 'If you choose to proceed, Adam can buy your car from you. The team will complete a simple form that only requires a couple of things from you, like your driver’s license details. If you like, this can be done on the spot.',
  },
  {
    title: '4. Get paid fast!',
    body: 'Adam likes to ensure you receive your funds in your bank account before he collects the car. While this can be almost instantaneous, it is probably best to allow at least 24 hours.',
  },
  {
    title: '5. Free car pick-up',
    body: 'When convenient, Adam’s team can collect your car. And you can go and enjoy the spoils!',
  },
];
