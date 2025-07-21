import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserFingerPrintRegisterBackendService {
  async getAllFingerprints() {
    return this.prisma.fingerprint.findMany();
  }
  private prisma = new PrismaClient();

  async getUserByPasskey(passkey: number) {
    return this.prisma.user.findFirst({
      where: { passkey },
      select: {
        id: true,
        name: true,
        organizationId: true,
      },
    });
  }
async createFingerprint(thumbid: string, empId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: empId },
    select: { organizationId: true },
  });

  if (!user || !user.organizationId) {
    throw new Error('User or organization not found');
  }

  return this.prisma.fingerprint.create({
    data: {
      thumbid,
      empId,
      orgId: user.organizationId, 
    },
  });
}
  async getFingerprintByThumbid(thumbid: string) {
    return this.prisma.fingerprint.findUnique({
      where: { thumbid },
      select: { empId: true },
    });
  }
}
