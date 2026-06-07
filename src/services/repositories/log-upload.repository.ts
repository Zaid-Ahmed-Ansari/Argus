import { prisma } from "@/lib/prisma";

export type CreateLogUploadInput = {
  id: string;
  userId: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string | null;
  sizeBytes: number;
  lineCount: number;
};

export class LogUploadRepository {
  async create(input: CreateLogUploadInput) {
    return prisma.logUpload.create({
      data: input,
    });
  }

  async findByIdForUser(id: string, userId: string) {
    return prisma.logUpload.findFirst({
      where: { id, userId },
    });
  }

  async delete(id: string) {
    return prisma.logUpload.delete({ where: { id } });
  }

  async deleteStaleForUser(userId: string, olderThan: Date) {
    return prisma.logUpload.deleteMany({
      where: {
        userId,
        createdAt: { lt: olderThan },
      },
    });
  }
}

export const logUploadRepository = new LogUploadRepository();
