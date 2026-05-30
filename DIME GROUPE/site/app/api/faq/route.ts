import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";
import { getFAQItems } from "@/lib/content-data";

export async function GET() {
  try {
    const items = await dbSelect(
      "faq_items",
      "select=id,question,answer,category,active,sort_order&active=eq.true&order=sort_order.asc,created_at.asc"
    );
    // Fallback vers données statiques si la table est vide
    if (items.length === 0) {
      return NextResponse.json(getFAQItems().filter((i) => i.active));
    }
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(getFAQItems().filter((i) => i.active));
  }
}


