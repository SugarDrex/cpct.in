import { NextResponse } from "next/server";
import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `SELECT id, reset_expires 
       FROM admin_users 
       WHERE id=? AND reset_token=?`,
      [decoded.id, token]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    const user = rows[0];

    if (Date.now() > user.reset_expires) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(newPassword);

    await db.query(
      `UPDATE admin_users
       SET password=?, reset_token=NULL, reset_expires=NULL
       WHERE id=?`,
      [hashed, user.id]
    );

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}