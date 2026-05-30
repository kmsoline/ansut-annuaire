import { NextResponse } from "next/server";
import { getContentSetting } from "@/lib/db";
import { getAfriNomadeContent } from "@/lib/content-data";

export async function GET() {
  try {
    const db = await getContentSetting<unknown>("afrinomade_content");
    const content = db ?? getAfriNomadeContent();
    return NextResponse.json(content);
  } catch {
    return NextResponse.json(getAfriNomadeContent());
  }
}


