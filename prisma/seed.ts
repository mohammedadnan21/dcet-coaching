import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminRawPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminRawPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const adminPassword = await bcrypt.hash(adminRawPassword, 12);
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Mohammed Adnan",
      email: adminEmail,
      phone: "9844942547",
      password: adminPassword,
      role: "ADMIN",
      status: "APPROVED",
      isVerified: true,
    },
  });
  console.log("Created admin user:", admin.email);

  // Create default subjects
  const subjects = [
    { name: "FEEE", description: "Fundamentals of Electrical and Electronics Engineering" },
    { name: "Mathematics", description: "Engineering Mathematics" },
    { name: "Project Management", description: "Project Management and Entrepreneurship" },
    { name: "IT Skills", description: "Information Technology Skills" },
    { name: "Physics", description: "Engineering Physics" },
    { name: "Chemistry", description: "Engineering Chemistry" },
    { name: "Computer Fundamentals", description: "Basics of Computer Science" },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: {},
      create: subject,
    });
  }
  console.log("Created", subjects.length, "subjects");

  // Create motivation quotes
  const quotes = [
    { quote: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  ];

  for (const quote of quotes) {
    await prisma.motivationQuote.create({
      data: quote,
    });
  }
  console.log("Created", quotes.length, "motivation quotes");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
