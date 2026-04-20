import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

async function main() {
  const email = (getArg("email") || process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = getArg("password") || process.env.ADMIN_PASSWORD || "";
  const name = getArg("name") || process.env.ADMIN_NAME || null;

  if (!email || !password) {
    console.error(
      "Usage: npm run create:admin -- --email you@example.com --password 'YourPassword' [--name 'Admin']"
    );
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, name },
    create: { email, password: hash, name },
  });

  console.log(`Admin user ready: ${user.email} (id=${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

