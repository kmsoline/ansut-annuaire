"use client";

import { useEffect, useState } from "react";

type Brand = "dime" | "afri";

/** Hook pour obtenir le numéro WhatsApp depuis la base de données.
 *  brand = "dime" → numéro DIME GROUPE
 *  brand = "afri" → numéro AfriNomade (fallback sur DIME si non défini)
 */
export function useWhatsApp(brand: Brand = "dime"): string {
  const fallback =
    brand === "afri"
      ? (process.env.NEXT_PUBLIC_AFRI_WHATSAPP ?? process.env.NEXT_PUBLIC_WHATSAPP ?? "2250747555745")
      : (process.env.NEXT_PUBLIC_WHATSAPP ?? "2250747555745");

  const [number, setNumber] = useState<string>(fallback);

  useEffect(() => {
    fetch("/api/whatsapp")
      .then((res) => res.json())
      .then((data) => {
        const val = brand === "afri" ? data.afri_whatsapp : data.whatsapp;
        if (val) setNumber(val);
      })
      .catch(() => {
        setNumber(fallback);
      });
  }, [brand, fallback]);

  return number;
}
