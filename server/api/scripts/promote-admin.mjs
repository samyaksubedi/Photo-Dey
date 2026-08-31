import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client.js';

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error('Usage: npm run admin:promote -- admin@example.com');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
    select: { id: true, name: true, email: true, role: true },
  });
  await prisma.userSession.deleteMany({ where: { userId: user.id } });
  console.log(`Promoted ${user.email} to ${user.role}. Existing sessions were revoked.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
