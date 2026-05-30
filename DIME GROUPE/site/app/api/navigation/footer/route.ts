import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getFooterSections } from "@/lib/navigation-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("nav_footer");
    const sections = db ?? getFooterSections();
    return NextResponse.json(sections);
  } catch {
    return NextResponse.json(getFooterSections());
  }
}


