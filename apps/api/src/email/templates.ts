import type { Email } from './mailer';

function layout(title: string, body: string, link: string, action: string) {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f4f4f5;padding:24px">
<div style="max-width:480px;margin:auto;background:#ffffff;border-radius:8px;padding:24px">
<h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
<p style="color:#3f3f46;line-height:1.5">${body}</p>
<p><a href="${link}" style="display:inline-block;background:#18181b;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none">${action}</a></p>
<p style="color:#71717a;font-size:12px">If the button doesn't work, copy this link: ${link}</p>
</div></body></html>`;
}

export function verificationEmail(to: string, link: string): Email {
  return {
    to,
    subject: 'Verify your email for Overtime',
    text: `Open this link within 24 hours to verify your email and sign in:\n\n${link}\n\nIf you didn't sign up for Overtime, ignore this email.`,
    html: layout(
      'Verify your email',
      "Open the link within 24 hours to verify your email and sign in. If you didn't sign up for Overtime, ignore this email.",
      link,
      'Verify email',
    ),
  };
}

export function passwordResetEmail(to: string, link: string): Email {
  return {
    to,
    subject: 'Reset your Overtime password',
    text: `Open this link within 30 minutes to set a new password:\n\n${link}\n\nSetting a new password signs you out everywhere else. If you didn't ask for this, ignore this email.`,
    html: layout(
      'Reset your password',
      "Open the link within 30 minutes to set a new password. It signs you out everywhere else. If you didn't ask for this, ignore this email.",
      link,
      'Set a new password',
    ),
  };
}
