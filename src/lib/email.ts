const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@tecrese.com';
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://didu-five.vercel.app';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  const { Resend } = await import('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  const resend = await getResend();
  if (!resend) {
    console.warn('Resend not configured, skipping email:', template.subject);
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <!-- Header -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: white; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
                    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="8" fill="#7C3AED"/>
                      <g stroke="#7C3AED" stroke-width="2" fill="none">
                        <circle cx="32" cy="12" r="4"/>
                        <circle cx="52" cy="22" r="4"/>
                        <circle cx="52" cy="42" r="4"/>
                        <circle cx="32" cy="52" r="4"/>
                        <circle cx="12" cy="42" r="4"/>
                        <circle cx="12" cy="22" r="4"/>
                      </g>
                    </svg>
                  </div>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.02em;">Tecrese</h1>
                </td>
              </tr>
            </table>

            <!-- Content -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-family: 'Syne', -apple-system, sans-serif; font-size: 24px; font-weight: 700; color: #1e1b4b;">Reset your password</h2>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">Hi ${name},</p>
                  
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">You requested to reset your password for your Tecrese account. Click the button below to create a new password:</p>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #06B6D4); color: white; padding: 16px 32px; border-radius: 12px; font-family: 'Syne', -apple-system, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);" target="_blank">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">Or copy this link into your browser:</p>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #64748b; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #7C3AED; text-decoration: underline;">${resetUrl}</a>
                  </p>

                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">

                  <ul style="margin: 0; padding: 0 0 0 20px; font-size: 14px; color: #64748b; line-height: 2;">
                    <li>This link expires in <strong>1 hour</strong>.</li>
                    <li>If you didn't request this, you can safely ignore this email.</li>
                    <li>For security, this link can only be used once.</li>
                  </ul>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0; text-align: center;">
              <tr>
                <td>
                  <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Tecrese. All rights reserved.</p>
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                    <a href="${APP_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> &bull;
                    <a href="${APP_URL}/terms" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Reset your Tecrese password
    
    Hi ${name},
    
    You requested to reset your password. Click the link below:
    ${resetUrl}
    
    This link expires in 1 hour. If you didn't request this, please ignore.
    
    &copy; ${new Date().getFullYear()} Tecrese
  `;

  return sendEmail({
    to: email,
    subject: 'Reset your Tecrese password',
    html,
    text,
  });
}

export async function sendNewsletterConfirmationEmail(
  email: string,
  token: string
): Promise<boolean> {
  const confirmUrl = `${APP_URL}/newsletter/confirm?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <div style="width: 56px; height: 56px; border-radius: 50%; background: white; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);">
                    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="32" cy="32" r="8" fill="#7C3AED"/>
                      <g stroke="#7C3AED" stroke-width="2" fill="none">
                        <circle cx="32" cy="12" r="4"/>
                        <circle cx="52" cy="22" r="4"/>
                        <circle cx="52" cy="42" r="4"/>
                        <circle cx="32" cy="52" r="4"/>
                        <circle cx="12" cy="42" r="4"/>
                        <circle cx="12" cy="22" r="4"/>
                      </g>
                    </svg>
                  </div>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.02em;">Tecrese</h1>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-family: 'Syne', -apple-system, sans-serif; font-size: 24px; font-weight: 700; color: #1e1b4b;">Confirm your subscription</h2>
                  <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">Thanks for subscribing to Tecrese! Please confirm your email address to start receiving our newsletter.</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                    <tr>
                      <td align="center">
                        <a href="${APP_URL}/newsletter/confirm?token=${token}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #06B6D4); color: white; padding: 16px 32px; border-radius: 12px; font-family: 'Syne', -apple-system, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);" target="_blank">
                          Confirm Email
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">This link expires in 24 hours.</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0; text-align: center;">
              <tr>
                <td>
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Tecrese</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Confirm your Tecrese newsletter subscription',
    html,
  });
}

export async function sendContactFormNotification(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@tecrese.com';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white; letter-spacing: -0.02em;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">New Contact Form Submission</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-weight: 600; color: #475569; width: 120px;">Name:</td>
                      <td style="padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e1b4b;">${name}</td>
                    </tr>
                    <tr style="height: 12px;"><td></td></tr>
                    <tr>
                      <td style="padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-weight: 600; color: #475569; width: 120px;">Email:</td>
                      <td style="padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e1b4b;">${email}</td>
                    </tr>
                    <tr style="height: 12px;"><td></td></tr>
                    <tr>
                      <td style="padding: 12px 16px; background: #f1f5f9; border-radius: 8px; font-weight: 600; color: #475569; width: 120px;">Subject:</td>
                      <td style="padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e1b4b;">${subject}</td>
                    </tr>
                  </table>
                  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-top: 24px;">
                    <p style="margin: 0 0 8px; font-weight: 600; color: #475569;">Message:</p>
                    <p style="margin: 0; white-space: pre-wrap; color: #1e1b4b;">${message}</p>
                  </div>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 24px 0; text-align: center;">
              <tr>
                <td>
                  <p style="margin: 0; font-size: 13px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Tecrese Admin</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Contact Form: ${subject}`,
    html,
  });
}

export async function sendContactFormAutoReply(
  name: string,
  email: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Message Received</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e1b4b;">Hi ${name},</h2>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    Thank you for reaching out to Tecrese. We have received your inquiry and our editorial and research team is reviewing it.
                  </p>
                  <p style="margin: 0 0 24px; line-height: 1.6; color: #475569;">
                    We usually respond within 24 to 48 business hours. If your inquiry is urgent or involves a security disclosure, we prioritize it accordingly.
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,<br>The Tecrese Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "We received your message - Tecrese",
    html,
  });
}

export async function sendContactReplyEmail(
  to: string,
  recipientName: string,
  originalSubject: string,
  replyMessage: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Reply from Support</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e1b4b;">Hi ${recipientName},</h2>
                  <div style="margin: 0 0 24px; line-height: 1.6; color: #1e293b; background: #f8fafc; border-left: 4px solid #7C3AED; padding: 16px; border-radius: 4px; white-space: pre-wrap;">${replyMessage}</div>
                  <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,<br>The Tecrese Team</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Re: ${originalSubject || "Your inquiry"}`,
    html,
  });
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #7C3AED, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Welcome to the Community!</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e1b4b;">You're officially on the list! 🎉</h2>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    Your subscription to the Tecrese weekly intelligence briefing is confirmed. Every week, our research team dissects autonomous agent architectures, benchmark shifts, newly published tool protocols, and security disclosures.
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                    <tr>
                      <td align="center">
                        <a href="${APP_URL}/newsletter" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #06B6D4); color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none;">
                          Browse Newsletter Archive
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">
                    Need to modify your preferences? You can visit our newsletter hub anytime at <a href="${APP_URL}/newsletter" style="color: #7C3AED;">${APP_URL}/newsletter</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Tecrese AI Intelligence Briefing",
    html,
  });
}

export async function sendNewsletterUnsubscribeEmail(email: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #334155; border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8);">Unsubscription Confirmed</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e1b4b;">You have been unsubscribed</h2>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    You will no longer receive weekly newsletters from Tecrese. We're sorry to see you go!
                  </p>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    If this was a mistake, you can re-subscribe anytime at <a href="${APP_URL}/newsletter" style="color: #7C3AED;">${APP_URL}/newsletter</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "You have been unsubscribed from Tecrese",
    html,
  });
}

export async function sendPasswordResetSuccessEmail(email: string, name?: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
          <td>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #10B981, #06B6D4); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
              <tr>
                <td>
                  <h1 style="margin: 0; font-family: 'Syne', -apple-system, sans-serif; font-size: 28px; font-weight: 800; color: white;">Tecrese</h1>
                  <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Security Alert</p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: white; border-radius: 0 0 16px 16px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td>
                  <h2 style="margin: 0 0 16px; font-size: 20px; color: #1e1b4b;">Password Successfully Changed</h2>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    Hi ${name || 'there'}, your Tecrese account password has been successfully updated. All previous active sessions have been invalidated.
                  </p>
                  <p style="margin: 0 0 16px; line-height: 1.6; color: #475569;">
                    If you did not perform this change, please contact your administrator immediately or reach out to <a href="mailto:hello@tecrese.com" style="color: #7C3AED;">hello@tecrese.com</a>.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Your Tecrese account password was changed",
    html,
  });
}