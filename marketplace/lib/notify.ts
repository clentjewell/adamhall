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
      from: process.env.EMAIL_FROM ?? "Adam Hall <onboarding@resend.dev>",
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
    <p style="font-size:18px;font-weight:700;color:#1e5c41;margin:0 0 16px">Adam Hall — Buy My Car</p>
    ${inner}
    <p style="color:#78716c;font-size:13px;margin-top:32px">Straight answers, fast settlements. Reply to this email any time.</p>
  </div>`;

export const emailTemplates = {
  submissionReceived(name: string, statusUrl: string) {
    return {
      subject: "Got it — Adam will look at your car personally",
      html: wrap(`
        <p>Hi ${name},</p>
        <p>Thanks for sending your car through. Adam personally reviews every car — you'll hear back within 1 business day, usually sooner.</p>
        <p>You can watch your submission move through review here:</p>
        <p><a href="${statusUrl}" style="color:#1e5c41;font-weight:600">${statusUrl}</a></p>`),
    };
  },
  offerMade(name: string, carName: string, amount: string, statusUrl: string) {
    return {
      subject: `Our offer on your ${carName}`,
      html: wrap(`
        <p>Hi ${name},</p>
        <p>Adam has looked over your ${carName} and we're ready to make you an offer:</p>
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
  enquiryReceived(adminEmail: string, carName: string, name: string, phone: string) {
    return {
      to: adminEmail,
      subject: `New enquiry: ${carName}`,
      html: wrap(`<p><strong>${name}</strong> (${phone}) enquired about the ${carName}. It's in the admin inbox.</p>`),
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
