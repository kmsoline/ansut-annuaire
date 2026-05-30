import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

export async function GET() {
  const items = await dbSelect("afrinomade_bons_plans",
    "select=id,category,pays,name,zone,vibe,description,tags,note,price_range,img,link&active=eq.true&order=pays.asc,sort_order.asc,created_at.asc"
  );
  return NextResponse.json(items);
}
