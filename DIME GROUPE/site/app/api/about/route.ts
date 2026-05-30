import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getAboutPageContent } from "@/lib/content-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("about_content");
    const content = db ?? getAboutPageContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(getAboutPageContent());
  }
}


