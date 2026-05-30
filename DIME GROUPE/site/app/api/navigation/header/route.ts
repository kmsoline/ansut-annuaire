import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getHeaderLinks } from "@/lib/navigation-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("nav_header");
    const links = db ?? getHeaderLinks();
    return NextResponse.json(links);
  } catch {
    return NextResponse.json(getHeaderLinks());
  }
}


