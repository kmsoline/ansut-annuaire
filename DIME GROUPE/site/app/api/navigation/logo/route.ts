import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getSiteLogo } from "@/lib/navigation-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("nav_logo");
    const logo = db ?? getSiteLogo();
    return NextResponse.json(logo);
  } catch {
    return NextResponse.json(getSiteLogo());
  }
}


