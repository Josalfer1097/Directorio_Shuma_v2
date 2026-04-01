import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PASSWORD || "123456";
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in ms

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { success: false, error: "PIN requerido" },
        { status: 400 }
      );
    }

    if (pin !== ADMIN_PIN) {
      return NextResponse.json(
        { success: false, error: "PIN incorrecto" },
        { status: 401 }
      );
    }

    // Create a simple session token (timestamp + random string)
    const sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = Date.now() + SESSION_DURATION;

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify({ token: sessionToken, expiresAt }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION / 1000, // in seconds
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const session = JSON.parse(sessionCookie.value);

    if (session.expiresAt < Date.now()) {
      // Session expired, clear cookie
      cookieStore.delete("admin_session");
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 }
    );
  }
}
