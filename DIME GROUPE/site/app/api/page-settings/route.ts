import { NextResponse } from "next/server";
import { deepMerge } from "@/lib/utils";
import { getContentSetting } from "@/lib/db";
import { PAGE_SETTINGS_DEFAULTS } from "@/app/api/admin/page-settings/route";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const saved = await getContentSetting("page_settings");
    return NextResponse.json(deepMerge(PAGE_SETTINGS_DEFAULTS, saved ?? {}));
  } catch {
    return NextResponse.json(PAGE_SETTINGS_DEFAULTS);
  }
}
