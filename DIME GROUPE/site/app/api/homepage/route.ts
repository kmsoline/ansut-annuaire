import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getHomePageContent } from "@/lib/content-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("homepage_content");
    const content = db ?? getHomePageContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(getHomePageContent());
  }
}


