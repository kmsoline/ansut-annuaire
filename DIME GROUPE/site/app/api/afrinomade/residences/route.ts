import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db";

export async function GET() {
  const items = await dbSelect("afrinomade_residences",
    "select=id,slug,title,img,location,pays,capacity,price,type,amenities,description,badge,nb_chambres,nb_salles_de_bain,surface_m2&active=eq.true&order=sort_order.asc,created_at.asc"
  );
  return NextResponse.json(items);
}
