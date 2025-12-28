import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const emailHtml = `
  <div style="text-align:center; margin-bottom:20px;">
    <img src="https://pancetta.com.au/logo.png" alt="Caffé Pancetta" width="150" />
  </div>
  <div style="line-height:1.6; font-size:16px;">
    ${html}
  </div>

    `;

    const data = await resend.emails.send({
      from: `"Caffé Pancetta" <${process.env.RESEND_EMAIL}>`,
      to,
      subject,
      html: emailHtml,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
