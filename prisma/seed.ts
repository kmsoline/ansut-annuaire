import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import * as fs from "fs"
import * as path from "path"

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dataDir = path.join(process.cwd(), "data")

  // Employees
  const employees = JSON.parse(fs.readFileSync(path.join(dataDir, "employees.json"), "utf-8"))
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        nom: emp.nom ?? null,
        fonction: emp.fonction ?? null,
        extension: emp.extension ?? null,
        contact: emp.contact ?? null,
        email: emp.email ?? null,
        photo: emp.photo ?? null,
        direction: emp.direction ?? null,
        site: emp.site ?? null,
        manager: emp.manager ?? null,
        favoris: emp.favoris ?? false,
      },
    })
  }
  console.log(`✓ ${employees.length} employees seeded`)

  // Users
  const users = JSON.parse(fs.readFileSync(path.join(dataDir, "users.json"), "utf-8"))
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role ?? "user",
        favorites: user.favorites ?? [],
      },
    })
  }
  console.log(`✓ ${users.length} users seeded`)

  // Sites
  const sites = JSON.parse(fs.readFileSync(path.join(dataDir, "sites.json"), "utf-8"))
  for (const site of sites) {
    await prisma.site.upsert({
      where: { id: site.id },
      update: {},
      create: {
        id: site.id,
        name: site.name,
        address: site.address ?? "",
        lat: site.lat,
        lng: site.lng,
        color: site.color ?? "#1d4ed8",
        image: site.image ?? "",
      },
    })
  }
  console.log(`✓ ${sites.length} sites seeded`)

  console.log("✅ Seed complete!")
}

main().catch(console.error).finally(() => prisma.$disconnect())
