import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

export async function GET() {
  const items = await dbSelect("afrinomade_transport",
    "select=id,title,description,price,details,popular,icon_name&active=eq.true&order=sort_order.asc,created_at.asc"
  );
  return NextResponse.json(items);
}
