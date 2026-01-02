import "dotenv/config"
import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@mirrormatch.com" },
  })

  if (existingAdmin) {
    console.log("Admin user already exists. Skipping seed.")
    return
  }

  // Create default admin user
  const passwordHash = await bcrypt.hash("admin123", 10)

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@mirrormatch.com",
      passwordHash,
      role: "ADMIN",
      points: 0,
    },
  })

  console.log("✅ Created admin user:")
  console.log("   Email: admin@mirrormatch.com")
  console.log("   Password: admin123")
  console.log("   ⚠️  Please change the password after first login!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
