import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@prizebond.com";
  const adminPin = "1234"; // Default PIN

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists.");
  } else {
    const hashedPin = await bcrypt.hash(adminPin, 10);
    const admin = await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        mobile: "03000000000",
        pin: hashedPin,
        address: "System HQ",
        city: "Karachi",
        role: "ADMIN",
        status: "ACTIVE",
        otpVerified: true,
      },
    });
    console.log("Admin user created successfully:");
    console.log(`Email: ${admin.email}`);
    console.log(`PIN: ${adminPin}`);
  }

  // --- STANDARD USER ---
  const userEmail = "user@prizebond.com";
  const userPin = "1122";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    const hashedUserPin = await bcrypt.hash(userPin, 10);
    const user = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "User",
        email: userEmail,
        mobile: "03111111111",
        pin: hashedUserPin,
        address: "User House",
        city: "Karachi",
        role: "USER",
        status: "ACTIVE",
        otpVerified: true,
      },
    });
    console.log("Standard user created successfully:");
    console.log(`Email: ${user.email}`);
    console.log(`PIN: ${userPin}`);
  } else {
    console.log("Standard user already exists.");
  }

  // --- SECOND USER (for marketplace testing) ---
  const user2Email = "user2@prizebond.com";
  const user2Pin = "3344";

  const existingUser2 = await prisma.user.findUnique({
    where: { email: user2Email },
  });

  if (!existingUser2) {
    const hashedUser2Pin = await bcrypt.hash(user2Pin, 10);
    const user2 = await prisma.user.create({
      data: {
        firstName: "Ahmed",
        lastName: "Ali",
        email: user2Email,
        mobile: "03222222222",
        pin: hashedUser2Pin,
        address: "Market Road",
        city: "Lahore",
        role: "USER",
        status: "ACTIVE",
        otpVerified: true,
      },
    });
    console.log("Second user created successfully:");
    console.log(`Email: ${user2.email}`);
    console.log(`PIN: ${user2Pin}`);
  } else {
    console.log("Second user already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
