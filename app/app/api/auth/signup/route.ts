import { NextResponse } from "next/server";
import   db   from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const username = email.split("@")[0];

    const [rows]: any = await db.query(
      "SELECT id FROM admin_users WHERE email=?",
      [email]
    );

    if (rows.length) {
      return NextResponse.json({ error: "User exists" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    await db.query(
      "INSERT INTO admin_users (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashed]
    );

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("SIGNUP ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
