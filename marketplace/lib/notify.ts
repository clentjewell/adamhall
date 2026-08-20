import "server-only";

// All outbound comms go through this interface so channels can be swapped
// without touching business logic. Email = Resend. SMS = stub until Twilio.

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface SmsMessage {
  to: string;
  body: string;
}

export interface Notifier {
  sendEmail(msg: EmailMessage): Promise<void>;
  sendSms(msg: SmsMessage): Promise<void>;
}

class ResendNotifier implements Notifier {
  async sendEmail(msg: EmailMessage): Promise<void> {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.info(`[email:dev] to=${msg.to} subject="${msg.subject}"`);
      return;
    }
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Car Marketplace <onboarding@resend.dev>",
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
    });
    if (error) console.error("[email] send failed:", error.message);
  }

  async sendSms(msg: SmsMessage): Promise<void> {
    // Twilio lands here later. Logged so the call sites are already correct.
    console.info(`[sms:stub] to=${msg.to} body="${msg.body.slice(0, 80)}"`);
  }
}

export const notifier: Notifier = new ResendNotifier();

const wrap = (inner: string) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#16211b">
    <p style="font-size:18px;font-weight:700;color:#1e5c41;margin:0 0 16px">Car Marketplace</p>
    ${inner}
    <p style="color:#78716c;font-size:13px;margin-top:32px">Straight answers, fast settlements. Reply to this email any time.</p>
  </div>`;

/**
 * Escapes anything a stranger typed before it goes into an email body. The
 * enquiry form is public, so a name or message can carry markup; without this
 * it would render as HTML in Adam's inbox. Same helper submitContactMessage
 * already applies in app/actions/public.ts.
 */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const emailTemplates = {
  submissionReceived(name: string, statusUrl: string) {
    return {
      subject: "Got it, we will look at your car personally",
      html: wrap(`
        <p>Hi ${name},</p>
        <p>Thanks for sending your car through. We personally review every car — you'll hear back within 1 business day, usually sooner.</p>
        <p>You can watch your submission move through review here:</p>
        <p><a href="${statusUrl}" style="color:#1e5c41;font-weight:600">${statusUrl}</a></p>`),
    };
  },
  offerMade(name: string, carName: string, amount: string, statusUrl: string) {
    return {
      subject: `Our offer on your ${carName}`,
      html: wrap(`
        <p>Hi ${name},</p>
        <p>We have looked over your ${carName} and we're ready to make you an offer:</p>
        <p style="font-size:28px;font-weight:800;color:#1e5c41;margin:16px 0">${amount}</p>
        <p>That's the number we'll pay — no last-minute haggling at handover. If you're happy with it, reply to this email or give us a call and we'll organise inspection and same-day settlement.</p>
        <p><a href="${statusUrl}" style="color:#1e5c41;font-weight:600">View your submission status</a></p>`),
    };
  },
  declined(name: string, carName: string, reason: string) {
    return {
      subject: `About your ${carName}`,
      html: wrap(`
        <p>Hi ${name},</p>
        <p>Thanks for giving us the chance to look at your ${carName}. We're going to pass on this one — ${reason}</p>
        <p>That's about what we can retail right now, not about your car. If circumstances change or you have another car down the track, we'd genuinely like to hear from you.</p>`),
    };
  },
  /**
   * Adam's alert. Takes an object rather than a positional list — it grew
   * past the point where `(carName, name, phone, email)` at a call site was
   * readable, and every new field would have been another anonymous argument.
   */
  enquiryReceived(e: {
    adminEmail: string;
    carName: string;
    carUrl?: string;
    name: string;
    phone: string;
    email?: string;
    /** "Wants a look" vs "Question" — the buyer's intent level. */
    wantsLook?: boolean;
    preferredContactMethod?: "call" | "text" | "email";
    preferredTime?: string;
    financingInterest?: boolean;
    tradeInInterest?: boolean;
  }) {
    const contact = esc(e.email ? `${e.phone}, ${e.email}` : e.phone);
    const how =
      e.preferredContactMethod === "text"
        ? "Prefers a text"
        : e.preferredContactMethod === "email"
          ? "Prefers email"
          : "Prefers a call";
    // Only the ticked ones, so the email stays scannable on a phone.
    const flags = [
      e.financingInterest ? "wants to talk finance" : null,
      e.tradeInInterest ? "has a car to trade" : null,
    ].filter(Boolean);

    return {
      to: e.adminEmail,
      // Subject lines are plain text, so they take the raw values.
      subject: `${e.wantsLook ? "Wants a look" : "New enquiry"}: ${e.carName}`,
      html: wrap(`
        <p><strong>${esc(e.name)}</strong> (${contact}) ${
          e.wantsLook ? "wants to come and look at" : "enquired about"
        } the ${e.carUrl ? `<a href="${esc(e.carUrl)}" style="color:#1e5c41;font-weight:600">${esc(e.carName)}</a>` : esc(e.carName)}.</p>
        <p style="margin:12px 0"><strong>${how}</strong>${
          e.preferredTime ? ` — ${esc(e.preferredTime)}` : ""
        }</p>
        ${flags.length ? `<p style="margin:12px 0">Also: ${flags.join(", ")}.</p>` : ""}
        <p>It's in the admin inbox.</p>`),
    };
  },
  /**
   * The buyer's receipt. Sent only when they gave an email; the on-screen
   * confirmation is what everyone sees, and this is in addition to it, never
   * instead of it.
   *
   * Deliberately short and un-salesy. The one job is to leave Adam's number
   * somewhere the buyer can find it later.
   */
  enquiryConfirmation(e: {
    name: string;
    carName: string;
    carUrl?: string;
    phoneDisplay: string;
    /** Only present when they ticked the finance box. */
    financeUrl?: string;
  }) {
    const firstName = e.name.split(" ")[0] || e.name;
    return {
      subject: `Got your enquiry: ${e.carName}`,
      html: wrap(`
        <p>Hi ${esc(firstName)},</p>
        <p>We've got your enquiry about the ${
          e.carUrl
            ? `<a href="${esc(e.carUrl)}" style="color:#1e5c41;font-weight:600">${esc(e.carName)}</a>`
            : esc(e.carName)
        }. We will be in touch shortly.</p>
        <p style="margin:16px 0">If you'd rather not wait, call us direct on
          <a href="tel:${e.phoneDisplay.replace(/\s/g, "")}" style="color:#1e5c41;font-weight:700">${e.phoneDisplay}</a>.</p>
        ${
          e.financeUrl
            ? `<p>You mentioned finance. There's a repayment calculator here:
                 <a href="${e.financeUrl}" style="color:#1e5c41;font-weight:600">work out what it costs a week</a>.</p>`
            : ""
        }`),
    };
  },
  /**
   * Tells Adam somebody made an account. Registration was the only form on
   * the site that landed silently — enquiries, finance, test drives and
   * sell-my-car all reach him, so this closes that gap.
   *
   * It is a heads-up, not a job: a signup is not a lead yet, so there is no
   * "call them" instruction, just who they are and where to see the rest.
   */
  buyerRegistered(e: {
    adminEmail: string;
    name: string;
    email: string;
    phone?: string | null;
    suburb?: string | null;
    postcode?: string | null;
    heardAbout?: string | null;
    buyersUrl?: string;
  }) {
    const where = [e.suburb, e.postcode].filter(Boolean).join(" ");
    const heard: Record<string, string> = {
      radio: "heard you on the radio",
      google: "found you on Google",
      social: "came from social media",
      friend: "was told about you by a friend",
      returning: "has dealt with you before",
      other: "came from somewhere else",
    };
    const rows = [
      e.phone ? `Phone: <strong>${esc(e.phone)}</strong>` : null,
      where ? `Where: ${esc(where)}` : null,
      e.heardAbout && heard[e.heardAbout] ? `How: ${heard[e.heardAbout]}` : null,
    ].filter(Boolean);

    return {
      to: e.adminEmail,
      subject: `New account: ${e.name}`,
      html: wrap(`
        <p><strong>${esc(e.name)}</strong> (${esc(e.email)}) made an account on the Marketplace.</p>
        ${rows.length ? `<p style="margin:12px 0">${rows.join("<br>")}</p>` : ""}
        <p>Nothing to do yet — they can now save cars and their shortlist follows
           them between devices. You'll hear from them properly if they enquire.</p>
        ${
          e.buyersUrl
            ? `<p><a href="${esc(e.buyersUrl)}" style="color:#1e5c41;font-weight:600">See everyone who has registered</a></p>`
            : ""
        }`),
    };
  },
  watchlistMatch(email: string, carName: string, price: string, url: string) {
    return {
      subject: `Just in: ${carName}`,
      html: wrap(`
        <p>A car matching your watchlist just landed:</p>
        <p style="font-size:20px;font-weight:700;margin:12px 0">${carName} — ${price}</p>
        <p><a href="${url}" style="color:#1e5c41;font-weight:600">See the car</a></p>
        <p>Good cars move fast here. If it's the one, don't sit on it.</p>`),
    };
  },
};
