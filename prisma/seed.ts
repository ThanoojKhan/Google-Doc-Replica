import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.user.createMany({
        data: [
            {
                email: "user1@example.com",
                name: "User One",
            },
            {
                email: "user2@example.com",
                name: "User Two",
            },
        ],
        skipDuplicates: true,
    });
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
