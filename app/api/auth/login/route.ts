import { NextResponse } from "next/server";
import db from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows]: any = await db.query(
      "SELECT * FROM admin_users WHERE email=?",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const user = rows[0];

    const ok = await comparePassword(password, user.password);

    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // ✅ ADD THIS (DO NOT REMOVE YOUR RETURN STRUCTURE)
    const response = NextResponse.json({ token });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}/*import { NextResponse } from "next/server";
import   db   from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const [rows]: any = await db.query(
      "SELECT * FROM admin_users WHERE email=?",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const user = rows[0];

    const ok = await comparePassword(password, user.password);

    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({ token });

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
*/