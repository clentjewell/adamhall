export interface Testimonial {
  quote: string;
  name?: string;
  location?: string;
}

/* Home "Happy Customers" grid (3 x 3, five-star) */
export const homeTestimonials: Testimonial[] = [
  { quote: 'I will only sell my cars to Adam' },
  { quote: 'Adam made the entire process easy.' },
  { quote: 'The money was in my account the same day' },
  { quote: 'I cannot recommend Adam highly enough!' },
  { quote: 'Thankyou, thankyou, thankyou Adam' },
  {
    quote:
      'I was so surprised when I called that I spoke with Adam himself. He come out and took care of everything.',
  },
  { quote: "I'll never go back to selling a car privately again" },
  { quote: 'There really is nothing else like this in the market' },
  { quote: 'The process was effortless from start to finish' },
];

/* How It Works testimonial list (with attribution) */
export const namedTestimonials: Testimonial[] = [
  { quote: 'I will only sell my cars to Adam', name: 'Rex', location: 'Kyogle' },
  {
    quote:
      'My father is unwell and finds it difficult to leave the house. Dad was so grateful Adam was able to help.',
    name: 'Jen',
    location: 'Currumbin Waters',
  },
  { quote: 'Adam made the entire process easy.', name: 'Rose', location: 'Currumbin Waters' },
  { quote: 'The money was in my account the same day', name: 'Bob', location: 'Surfers Paradise' },
  { quote: 'I cannot recommend Adam highly enough!', name: 'Jack', location: 'Clear Island Waters' },
  { quote: 'Thankyou, thankyou, thankyou Adam', name: 'Despina', location: 'Coomera' },
];

/* Buy My Car page testimonials */
export const buyMyCarTestimonials: Testimonial[] = [
  { quote: 'I will only sell my cars to Adam', name: 'Rex', location: 'Kyogle' },
  {
    quote:
      'My father is unwell and finds it difficult to leave the house. Dad was so grateful Adam was able to help.',
    name: 'Jen',
    location: 'Currumbin Waters',
  },
];

/* Featured single quotes used in green hero panels */
export const heroQuote = {
  home: {
    quote:
      'My father is unwell and finds it difficult to leave the house. Dad was so grateful Adam was able to help.',
    name: 'Jen, Currumbin',
    role: 'Very Happy Customer',
  },
  howItWorks: {
    quote:
      'I was so surprised when I called that I spoke with Adam himself. He come out and took care of everything.',
    name: 'Rodney, Mudgeeraba',
    role: 'Very Happy Customer',
  },
};
