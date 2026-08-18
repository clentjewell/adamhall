import { redirect } from "next/navigation";

// Details used to be its own page; it is now the account's default tab. Kept
// as a redirect so a link sent or bookmarked while that route existed still
// lands somewhere sensible rather than on a 404.
export default function AccountDetailsRedirect() {
  redirect("/account");
}
