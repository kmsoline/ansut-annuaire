import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";
import { getTestimonials } from "@/lib/content-data";

export async function GET() {
  try {
    const items = await dbSelect(
      "testimonials",
      "select=id,name,role,company,text,rating,active,sort_order&active=eq.true&order=sort_order.asc,created_at.desc"
    );
    if (items.length === 0) {
      return NextResponse.json(getTestimonials().filter((i) => i.active));
    }
    return NextResponse.json(items);
  } catch {
    return NextResponse.json(getTestimonials().filter((i) => i.active));
  }
}


