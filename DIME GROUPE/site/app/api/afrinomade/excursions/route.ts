import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

export async function GET() {
  const items = await dbSelect(
    "afrinomade_excursions",
    "select=id,slug,title,img,duration,price,tags,pays,description,highlights&active=eq.true&order=sort_order.asc,created_at.asc"
  );
  return NextResponse.json(items);
}
