import { sendEmail } from "@/lib/SendEmail";

export async function POST(request) {
  try {
    const { name, email, contactNo, message } = await request.json();

    const result = await sendEmail({
      to: "mamakaka318@gmail.com", // Your receiving email address
      subject: `New Enquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Contact No:</strong> ${contactNo}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ success: false, error: error.message });
  }
}
