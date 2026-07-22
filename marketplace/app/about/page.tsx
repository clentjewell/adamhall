import { redirect } from "next/navigation";

// The About content now lives at the ported /about-adam-hall route.
export default function AboutRedirect() {
  redirect("/about-adam-hall");
}
