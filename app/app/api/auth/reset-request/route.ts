import { NextResponse } from "next/server";
import db from "@/lib/db";
import { signResetToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    // find user
    const [rows]: any = await db.query(
      "SELECT id FROM admin_users WHERE email=?",
      [email]
    );

    // Always return ok to prevent email enumeration
    if (!rows.length) {
      return NextResponse.json({ ok: true });
    }

    const user = rows[0];

    // generate reset token (15 min)
    const resetToken = signResetToken({ id: user.id });

    const expires = Date.now() + 15 * 60 * 1000;

    // save to DB
    await db.query(
      `UPDATE admin_users 
       SET reset_token=?, reset_expires=? 
       WHERE id=?`,
      [resetToken, expires, user.id]
    );

    // TODO: send email here
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    console.log("RESET LINK:", resetUrl);

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("RESET REQUEST ERROR:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
