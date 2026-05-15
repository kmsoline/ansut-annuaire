import { Employee } from "@/lib/types"

export function generateVCard(emp: Employee): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${emp.nom ?? ""}`,
    emp.fonction ? `TITLE:${emp.fonction}` : "",
    emp.direction ? `ORG:ANSUT;${emp.direction}` : "ORG:ANSUT",
    emp.email ? `EMAIL;TYPE=WORK:${emp.email}` : "",
    emp.contact ? `TEL;TYPE=CELL:${emp.contact}` : "",
    emp.extension ? `TEL;TYPE=WORK:${emp.extension}` : "",
    emp.site ? `ADR;TYPE=WORK:;;${emp.site};;Abidjan;;Côte d'Ivoire` : "",
    "NOTE:Annuaire ANSUT",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n")
  return lines
}

export function downloadVCard(emp: Employee): void {
  const content = generateVCard(emp)
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${emp.nom?.replace(/\s+/g, "_") ?? "contact"}.vcf`
  a.click()
  URL.revokeObjectURL(url)
}
