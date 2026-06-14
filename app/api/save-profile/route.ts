import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const dataDir = path.join(process.cwd(), "public", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "profile.json");
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");

    return NextResponse.json({ success: true, path: "/data/profile.json" });
  } catch (err) {
    console.error("Failed to save profile JSON:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
