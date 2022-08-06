import { PrismaClient } from "@prisma/client";

// singleton
export const db = new PrismaClient({
    log: ["query"]
})