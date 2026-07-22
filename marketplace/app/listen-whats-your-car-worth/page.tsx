import type { Metadata } from "next";
import ListenClient from "@/components/site/ListenClient";

export const metadata: Metadata = {
  title: "What's Your Car Worth - Podcast | Adam Hall Buy My Car",
  description:
    "Listen to Adam Hall's ‘What's Your Car Worth’ segment on 4CRB 89.3FM — up-to-the-minute market pricing and expert car-buying advice, live on air.",
};

export default function ListenPage() {
  return <ListenClient />;
}
