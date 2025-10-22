import { PrismaClient } from '@prisma/client';

export class PrismaService {
    private static instance: PrismaClient;

    private constructor() {} 

    static getInstance(): PrismaClient {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaClient({
                log: ['query', 'info', 'warn', 'error'],
            });
        }
        return PrismaService.instance;
    }

    static async disconnect(): Promise<void> {
        if (PrismaService.instance) {
            await PrismaService.instance.$disconnect();
            PrismaService.instance = null as any;
        }
    }
}