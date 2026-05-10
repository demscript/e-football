import { PrismaClient, ConsoleType, TournamentStatus } from "../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "Admin@12345",
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@efootball.local" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@efootball.local",
      name: "Tournament Admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✅ Admin created: ${admin.email}`);

  // Create main tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: "main-tournament" },
    update: {},
    create: {
      id: "main-tournament",
      name: "eFootball City Cup 2025",
      status: TournamentStatus.REGISTRATION_OPEN,
      startDate: new Date("2025-05-11T10:00:00Z"),
    },
  });

  console.log(`✅ Tournament created: ${tournament.name}`);

  // Create sample players for testing
  const samplePlayers = [
    { fullName: "Chukwuemeka Obi", gamerTag: "EMEKAx10", phone: "08012345601", console: ConsoleType.PS5 },
    { fullName: "Babatunde Adeyemi", gamerTag: "TundeGoat", phone: "08012345602", console: ConsoleType.PS4 },
    { fullName: "Ifeanyi Okonkwo", gamerTag: "IFEfire", phone: "08012345603", console: ConsoleType.PS5 },
    { fullName: "Oluwaseun Afolabi", gamerTag: "SEUNskillz", phone: "08012345604", console: ConsoleType.PC },
  ];

  for (let i = 0; i < samplePlayers.length; i++) {
    const p = samplePlayers[i];
    const padded = String(i + 1).padStart(3, "0");
    await prisma.player.upsert({
      where: { gamerTag: p.gamerTag },
      update: {},
      create: {
        playerId: `EFB-${padded}`,
        fullName: p.fullName,
        gamerTag: p.gamerTag,
        phone: p.phone,
        console: p.console,
        status: "APPROVED",
      },
    });
  }

  console.log(`✅ Sample players seeded`);
  console.log("\n🎮 Seed complete!");
  console.log("─────────────────────────────────");
  console.log(`Admin Email:    ${admin.email}`);
  console.log(`Admin Password: ${process.env.ADMIN_PASSWORD || "Admin@12345"}`);
  console.log("─────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
