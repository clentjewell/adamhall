# Email draft: Car Marketplace update for Adam (round two)

Send from: clent@jewellprojects.com
To: Adam Hall

---

**Subject:** The Marketplace is now the front door, and the console writes listings for you

Hi Adam,

Big round of changes since the last note, most of them straight off your
feedback. Have a click through:

https://claude-carmarkplace-enhancements-l8ykyo-adamhall-marketplace.clent.workers.dev

**The cars are the home page now.** You land on the film, the search sits
across the foot of it, and the whole lot is one scroll down. No more clicking
through to a separate page to see stock. Anyone holding an old link to the
cars page still lands in the right spot.

**Search works the way you sketched it.** A quick search bar sits next to
"Find your next car" with a search button on the end. Type "Hilux" or
"Toyota diesel" and the list narrows as you type. The dropdowns and the type
tiles still work as before, and the button always names the number of cars it
will show, so nobody clicks through to an empty page.

**Your story has its own page.** "About Us" sits in the menu next to The
Marketplace. The dealer's-own-lot pitch, the buy and sell paths, the two
photo cards and the valuation pitch all live there now, so the home page can
get on with selling cars.

**The listing cards got a tidy.** The "PPSR clear" flag has come off the
photos. Every car you list is checked, so a badge saying so on each one was
wallpaper. Sold, Reserved and Just In still show, because those tell a buyer
something. Each card's facts now carry small drawings: a gauge for the kays,
a shift gate for the transmission, and the same car and fuel icons the search
tiles use.

**The header reads properly.** Menu items in normal case instead of capitals,
the logo larger, and the box behind it gone.

**The video loops.** The home film plays continuously in the background as
you asked. One favour: watch it through a loop or two on your phone and tell
me if you see a jump where it restarts. I test everything I can from here,
and that seam is the one thing that needs a human eye.

**Two new tools in the console, both on the New Listing form.**

*Fill from photos.* Upload the photos, press the button, and the AI reads
them and starts the specs: make, model, body type, colour, the badge when it
can read one. It only fills boxes you have left empty, so it never types
over you, and it refuses to guess things a photo cannot show. It will not
invent an odometer reading or a price, and if it can only pin the year to a
range it says so and leaves the field for you.

*Draft with AI.* Once the specs and photos are in, this writes the
description. It sticks to what is in the photos and the form, it names a
scuff if it can see one, and it writes in the voice of your existing
listings. It lands in the box as a draft. Read it, change what you like,
and Undo puts back whatever was there before. Nothing goes on the site until
you hit save.

Both need one switch flicked on our side before they go live, which I am
doing this week. The buttons sit in the console now and say so until then.

**The Site guide matches again.** The walkthrough at /admin/guide now shows
the site as it is today, fresh screenshots and all, including the two new
console tools.

---

**Two calls that are yours to make**

**The see-through header.** When you scroll, the bar goes clear and the logo
floats over the page. Without the box behind it, on busy pages the logo can
sit over content for a moment. I can keep the condensed bar solid if that
bothers you. Have a scroll on the cars list and see what you think.

**Phone icons.** Your mockup had a small phone drawing in the header and on
the Call button. Happy to add them, but icons next to the number would then
belong across the whole site, so I want your nod before I set that pattern.

Same console login as last time. Give me a ring if any of it needs talking
through.

Clent

---

## Notes for Clent, not for sending

Checked before drafting:

- Everything named above is live on the branch preview and verified there,
  including the /cars redirect carrying old filter links across.
- "One switch on our side" is the `ANTHROPIC_API_KEY` secret on the
  `adamhall-marketplace` Worker (Settings, Variables and Secrets). One key
  from console.anthropic.com powers the Assistant, Fill from photos and
  Draft with AI together. Until it is set all three answer 503 and their
  buttons say why. Usage bills per request to the Anthropic account that
  owns the key, so it should sit on whichever account carries client costs.
- Neither AI feature has run against the real API yet, because this sandbox
  holds no key. First real run should be watched: check the draft claims
  nothing the form did not say, and that the photo fill guessed sensibly.
- The video loop seam cannot be verified from the build environment (its
  browser has no H.264 decoder), which is why the email asks Adam to watch
  it. If he reports a jump, the options are a shorter trim of cars-hero.mp4
  or a two-element cross-fade. Neither starts without his ask.
- The header opacity and phone-icon questions are the two open design calls
  flagged in PR #10. The email puts them to Adam in plain terms.
- No credentials in this email. The previous one carried the ronnie@ login
  on instruction; this one just says "same login as last time".
