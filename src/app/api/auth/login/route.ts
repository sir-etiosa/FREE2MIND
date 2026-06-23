import { NextResponse } from "next/server";

const USERS = [
  { email: "jordan@halevance.law", password: "Law@2024!", userId: "u_jh", name: "Jordan Hale", role: "Attorney" },
  { email: "priya@halevance.law",  password: "Law@2024!", userId: "u_pv", name: "Priya Vance",  role: "Attorney" },
  { email: "marcus@halevance.law", password: "Law@2024!", userId: "u_ms", name: "Marcus Soto",  role: "Staff"    },
];

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email: string; password: string };

  const user = USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const payload = Buffer.from(JSON.stringify({ userId: user.userId, name: user.name, role: user.role })).toString("base64");

  const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
  res.cookies.set("m2m_session", payload, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
