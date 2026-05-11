import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function authClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token,
        },
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const auth = authClient(authHeader);

    const { data } = await auth.auth.getUser();

    const user = data.user;

    if (!user || !user.email_confirmed_at) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("admin_notified,email")
      .eq("id", user.id)
      .single();

    if (profile?.admin_notified) {
      return NextResponse.json({ success: true, alreadyNotified: true });
    }

    await resend.emails.send({
      from: "OGPAYTRUE <support@ogpaytrue.org>",
      to: "TUEMAIL@gmail.com",
      subject: "Verified User Waiting For Approval",
      html: `
        <div style="background:#050505;padding:40px;font-family:Arial;color:white">
          <h1 style="color:#8b5cf6;">OGPAYTRUE ADMIN</h1>

          <div style="margin-top:20px;padding:20px;border:1px solid rgba(139,92,246,0.25);border-radius:18px;background:#0a0a0a">
            <p>A verified user is waiting for admin approval.</p>
            <p><strong>Email:</strong> ${profile?.email || user.email}</p>
            <p><strong>Admin Panel:</strong> https://ogpaytrue.org/admin</p>
          </div>
        </div>
      `,
    });

    await admin
      .from("profiles")
      .update({ admin_notified: true })
      .eq("id", user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Notification failed" },
      { status: 500 }
    );
  }
}
