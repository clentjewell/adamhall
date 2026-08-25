import { redirect } from "next/navigation";

// The Contact content now lives at the ported /contact-us route.
export default function ContactRedirect() {
  redirect("/contact-us");
}
