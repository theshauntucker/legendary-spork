import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

const WAITLIST_FILE = join(process.cwd(), "data", "waitlist.json");

async function getWaitlist(): Promise<Array<{ email: string; name: string; role: string; joinedAt: string }>> {
  try {
    const data = await readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveWaitlist(entries: Array<{ email: string; name: string; role: string; joinedAt: string }>) {
  const dir = join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const waitlist = await getWaitlist();

    // Check for duplicates
    if (waitlist.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { error: "This email is already on the waitlist!", alreadyJoined: true },
        { status: 409 }
      );
    }

    waitlist.push({
      email: email.toLowerCase().trim(),
      name: name || "",
      role: role || "parent",
      joinedAt: new Date().toISOString(),
    });

    await saveWaitlist(waitlist);

    return NextResponse.json({
      success: true,
      position: waitlist.length,
      message: `You're #${waitlist.length} on the waitlist!`,
    });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const waitlist = await getWaitlist();
    return NextResponse.json({ count: waitlist.length });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
