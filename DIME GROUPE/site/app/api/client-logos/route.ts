import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";
import { getClientLogos } from "@/lib/content-data";

export async function GET() {
  try {
    const items = await dbSelect(
      "client_logos",
      "select=id,name,logo_url,website_url,active,sort_order&active=eq.true&order=sort_order.asc"
    );
    if (items.length === 0) {
      return NextResponse.json(getClientLogos().filter((i) => i.active));
    }
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(getClientLogos().filter((i) => i.active));
  }
}


