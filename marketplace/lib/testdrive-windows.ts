// Shared between the booking form and its server action. Lives outside the
// "use server" module because those may only export async functions.
export const TIME_WINDOWS = [
  "Morning 9-12",
  "Midday 12-3",
  "Afternoon 3-5:30",
  "Saturday morning",
] as const;

export type TimeWindow = (typeof TIME_WINDOWS)[number];
