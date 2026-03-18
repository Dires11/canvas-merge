import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

console.log("DATABASE_URL loaded?", !!process.env.DATABASE_URL);

async function main() {
  const { prisma } = await import("@/lib/prisma");

  const accounts = await prisma.canvasAccount.findMany({
    select: {
      id: true,
      userId: true,
      domain: true,
      domainName: true,
      domainSlug: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`Found ${accounts.length} accounts`);

  for (const account of accounts) {
    const domainRecord = await prisma.canvasDomain.upsert({
      where: {
        userId_domain: {
          userId: account.userId,
          domain: account.domain,
        },
      },
      update: {},
      create: {
        userId: account.userId,
        domain: account.domain,
        domainName: account.domainName,
        domainSlug: account.domainSlug,
        createdAt: account.createdAt,
      },
      select: {
        id: true,
      },
    });

    await prisma.canvasAccount.update({
      where: { id: account.id },
      data: {
        domainId: domainRecord.id,
      },
    });
  }

  const domainCount = await prisma.canvasDomain.count();

  console.log(`Created/verified ${domainCount} domain rows`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Backfill failed:", error);
  process.exit(1);
});
