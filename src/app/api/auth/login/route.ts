import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { checkRateLimit, rateLimiters, rateLimitHeaders } from '@/lib/rate-limiter';
import { getClientIdentifier } from '@/lib/request-ip';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Precomputed 12-round bcrypt hash used for constant-time comparison when email does not exist
const DUMMY_PASSWORD_HASH = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(req, rateLimiters.login);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: { message: `Too many attempts. Account locked.` } },
        { 
          status: 429,
          headers: rateLimitHeaders(rateLimit)
        }
      );
    }

    const body = await req.json();
    const { email, password } = loginSchema.parse(body);
    
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: { message: "Invalid credentials" } }, { status: 401 });
    }
    
    // Successful login - clear rate limit
    await rateLimiters.login.reset(getClientIdentifier(req));
    
    await createSession(user.id, user.role);
    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: unknown) {
    // SECURITY: Do not leak internal error details (e.g. Zod messages, DB errors)
    // to the client. Only surface validation problems for malformed input.
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password format." } },
        { status: 400 }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Something went wrong. Please try again." } },
      { status: 500 }
    );
  }
}