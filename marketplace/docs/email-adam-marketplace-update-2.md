# Email draft: Car Marketplace update for Adam (round two)

Send from: clent@jewellprojects.com
To: Adam Hall

---

**Subject:** Marketplace update: cars on the front page, AI in the console

Hi Adam,

New round of changes, all from your feedback:

https://claude-carmarkplace-enhancements-l8ykyo-adamhall-marketplace.clent.workers.dev

- **The cars are the home page now.** Film up top, search across it, whole lot one scroll down. Old links still work.
- **Quick search, as you sketched it.** Type "Hilux" or "Toyota diesel" and the list narrows as you type.
- **About Us** carries your story, in the menu.
- **Cards tidied:** PPSR flag off the photos, small icons on the specs.
- **Header fixed:** normal case, bigger logo, no box.
- **The video loops.** Watch it restart once on your phone and tell me if you see a jump.
- **Two AI tools on New Listing:** *Fill from photos* starts the specs from the pictures; *Draft with AI* writes the description from the photos and specs. Both are guesses you edit, nothing saves until you do, and neither will invent a price or an odometer. I switch them on this week.
- **The Site guide** now matches all of the above.

Two quick calls for you: keep the see-through header when you scroll, or make it solid? And do you want phone icons next to the number in the header and Call button?

Same console login as last time. Ring me if anything needs talking through.

Clent

---

## Notes for Clent, not for sending

- "Switch on" = add the `ANTHROPIC_API_KEY` secret on the adamhall-marketplace
  Worker. One key from console.anthropic.com powers the Assistant, Fill from
  photos and Draft with AI; usage bills to the key's Anthropic account.
- Neither AI feature has run against the real API yet (no key in the build
  sandbox). Watch the first real run of each.
- The video loop seam cannot be verified from the build environment (no H.264
  decoder), hence the ask to Adam. If he reports a jump: shorter trim of
  cars-hero.mp4, or a two-element cross-fade. Neither starts without his ask.
- The header and phone-icon questions are the two open design calls in PR #10.
