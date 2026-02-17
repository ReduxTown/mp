// app/api/validate/route.ts   ← or pages/api/validate.ts if using Pages Router
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const birthday = searchParams.get("birthday");

  if (!username || !birthday) {
    return NextResponse.json(
      { error: "Missing username or birthday parameter" },
      { status: 400 }
    );
  }

  // Roblox username rules (enforced client-side too if you want)
  if (username.length < 3 || username.length > 20) {
    return NextResponse.json(
      { code: 2, message: "Username must be 3–20 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json(
      { code: 2, message: "Only letters, numbers, underscore allowed" },
      { status: 400 }
    );
  }

  const robloxUrl = `https://auth.roblox.com/v1/usernames/validate?request.username=${encodeURIComponent(
    username
  )}&request.birthday=${encodeURIComponent(birthday)}&request.context=Signup`;

  try {
    const res = await fetch(robloxUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (rbx-username-checker)",
        Accept: "application/json",
      },
      cache: "no-store",           // prevent Next.js caching
      redirect: "manual",
    });

    if (!res.ok) {
      throw new Error(`Roblox responded with ${res.status}`);
    }

    const data = await res.json();

    // Forward the exact Roblox response (most reliable)
    return NextResponse.json(data, { status: 200 });

  } catch (err: any) {
    console.error("[username-validator]", err);
    return NextResponse.json(
      { error: "Failed to reach Roblox API", details: err?.message },
      { status: 502 }
    );
  }
}

// Optional: add a simple HEAD/OPTIONS handler if you want CORS preflight support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
