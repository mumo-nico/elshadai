import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create main landlord user
  const hashedPassword = await hash("@Elshadai2025", 12);

  const landlord = await prisma.user.upsert({
    where: { email: "mumonikolas@gmail.com" },
    update: {},
    create: {
      email: "mumonikolas@gmail.com",
      password: hashedPassword,
      name: "Nicholas Musingila",
      phone: "0727497189",
      role: "LANDLORD",
    },
  });

  console.log("✅ Created landlord user:", landlord.email);
  console.log("📧 Email: mumonikolas@gmail.com");
  console.log("🔑 Password: @Elshadai2025");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

