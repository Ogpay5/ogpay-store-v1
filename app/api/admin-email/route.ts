import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { subject, message } = body;

    await resend.emails.send({
      from: "OGPAYTRUE <support@ogpaytrue.org>",
      to: "ogpayllc@ogpaytrue.org",
      subject,
      html: `
        <div style="background:#050505;padding:40px;font-family:Arial;color:white">
          <h1 style="color:#8b5cf6;">OGPAYTRUE ADMIN</h1>

          <div style="margin-top:20px;padding:20px;border:1px solid rgba(139,92,246,0.25);border-radius:18px;background:#0a0a0a">
            ${message}
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Email failed",
      },
      {
        status: 500,
      }
    );
  }
}
