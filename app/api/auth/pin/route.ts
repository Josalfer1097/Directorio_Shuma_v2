import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_MAX_AGE } from "@/lib/constants";

const ADMIN_PIN = process.env.ADMIN_PASSWORD || "123456";
const SESSION_DURATION = ADMIN_COOKIE_MAX_AGE * 1000;

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    // Reset rate limit every minute
    if (now - rateLimit.timestamp > 60000) {
      rateLimit.count = 0;
      rateLimit.timestamp = now;
    }
    
    if (rateLimit.count >= 5) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Intente en un minuto." },
        { status: 429 }
      );
    }

    const { pin } = await request.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { success: false, error: "PIN requerido" },
        { status: 400 }
      );
    }

    const sanitizedPin = pin.replace(/\D/g, '').slice(0, 6);

    if (sanitizedPin !== ADMIN_PIN) {
      rateLimit.count++;
      rateLimitMap.set(ip, rateLimit);
      return NextResponse.json(
        { success: false, error: "PIN incorrecto" },
        { status: 401 }
      );
    }
    
    // Reset on success
    rateLimitMap.delete(ip);

    // Create a simple session token (timestamp + random string)
    const sessionToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = Date.now() + SESSION_DURATION;

    // Set httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify({ token: sessionToken, expiresAt }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ADMIN_COOKIE_MAX_AGE,
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
