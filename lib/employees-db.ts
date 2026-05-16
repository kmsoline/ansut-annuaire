import { prisma } from "@/lib/prisma"
import { Employee } from "@/lib/types"
import fs from "fs"
import path from "path"

function toEmployee(row: {
  id: number; nom: string|null; fonction: string|null; extension: string|null;
  contact: string|null; email: string|null; photo: string|null; direction: string|null;
  site: string|null; manager: string|null; favoris: boolean
}): Employee {
  return { ...row, favoris: row.favoris }
}

function fromJson(): Employee[] {
  try {
    const file = path.join(process.cwd(), "data", "employees.json")
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Employee[]
  } catch { return [] }
}

export async function getEmployees(): Promise<Employee[]> {
  try {
    const rows = await prisma.employee.findMany({ orderBy: { id: "asc" } })
    return rows.map(toEmployee)
  } catch { return fromJson() }
}

export async function getEmployee(id: number): Promise<Employee | null> {
  try {
    const row = await prisma.employee.findUnique({ where: { id } })
    return row ? toEmployee(row) : null
  } catch {
    return fromJson().find((e) => e.id === id) ?? null
  }
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee | null> {
  try {
    const row = await prisma.employee.create({
      data: {
        nom: data.nom ?? null,
        fonction: data.fonction ?? null,
        extension: data.extension ?? null,
        contact: data.contact ?? null,
        email: data.email ?? null,
        photo: data.photo ?? null,
        direction: data.direction ?? null,
        site: data.site ?? null,
        manager: data.manager ?? null,
        favoris: data.favoris ?? false,
      },
    })
    return toEmployee(row)
  } catch { return null }
}

export async function updateEmployee(id: number, data: Partial<Omit<Employee, "id">>): Promise<Employee | null> {
  try {
    const row = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.nom !== undefined && { nom: data.nom }),
        ...(data.fonction !== undefined && { fonction: data.fonction }),
        ...(data.extension !== undefined && { extension: data.extension }),
        ...(data.contact !== undefined && { contact: data.contact }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.photo !== undefined && { photo: data.photo }),
        ...(data.direction !== undefined && { direction: data.direction }),
        ...(data.site !== undefined && { site: data.site }),
        ...(data.manager !== undefined && { manager: data.manager }),
        ...(data.favoris !== undefined && { favoris: data.favoris }),
      },
    })
    return toEmployee(row)
  } catch { return null }
}

export async function deleteEmployee(id: number): Promise<Employee | null> {
  try {
    const row = await prisma.employee.delete({ where: { id } })
    return toEmployee(row)
  } catch { return null }
}
